#!/usr/bin/env python3
"""
build_report.py — Preview HTML (antes/depois) da skill dudu-check-modais.

Reconstrói, por achado, um PEDAÇO representativo do modal/painel em HTML
antes/depois lado a lado, na MESMA largura do container real, para julgar
posição/largura/hierarquia no contexto. Anexa as MÉTRICAS medidas pelo
geometry.mjs (px cortados, rolagem, espaço desperdiçado) e a nota de VIABILIDADE.
Cada achado tem um ID para o usuário autorizar. Sem libs externas, sem depender
do código da aplicação.

Uso:
  python build_report.py findings.json -o dudu-modais-report/index.html

Esquema (campos opcionais salvo nota):
{
  "meta": {project, scope, design_system_source, viewports:["1440","1024"], generated_at?},
  "findings": [{
    id, severity:"critical|warning|info",
    category:"cortado|espaco|hierarquia|selecao|completude|rolagem",
    title, location,                 # ex.: "Modal Nova Empresa · campo Observações"
    issue,                           # o problema, 1-2 frases
    fix,                             # o ajuste proposto (menor mudança, reusa v4)
    reflow_risk:false,               # muda altura/fluxo de vizinhos?
    "questions": {                   # respostas às 5 auto-perguntas (só as relevantes)
       "completude":"...", "espaco":"...", "cortando":"...",
       "hierarquia":"...", "selecao":"..." },
    "metrics": {                     # números do geometry.mjs (opcional)
       "container_w":480,
       "before": {"clipped_px": 38, "scroll_px": 210, "wasted_px": 160},
       "after":  {"clipped_px": 0,  "scroll_px": 0,   "wasted_px": 20} },
    "viability": {"level":"alta|média|baixa", "note":"a skill se questiona: cabe na menor largura? não gera scroll horizontal?"},
    "preview": {                     # reconstrução do trecho (HTML autocontido)
       "width": 480,                 # largura do palco = container real
       "before_html": "<div class='row'>...</div>",
       "after_html":  "<div class='row'>...</div>" }
  }]
}

Dicas p/ o HTML do preview: use as classes utilitárias já injetadas
(.row, .col, .field, .label, .control, .section, .actions, .btn, .btn-primary,
.grid-2) para montar rápido um form fiel; ou cole HTML/estilo próprio — o palco
é isolado por largura fixa.
"""
import argparse
import html
import json
import os
import sys
from datetime import datetime

SEV = {
    "critical": ("Crítico", "#dc2626"),
    "warning": ("Atenção", "#d97706"),
    "info": ("Info", "#2563eb"),
}
VIA = {"alta": "#5ee08f", "média": "#f6c177", "media": "#f6c177", "baixa": "#ff8a93"}
CAT = {
    "cortado": "Campo cortado", "espaco": "Espaço", "hierarquia": "Hierarquia",
    "selecao": "Seleção", "completude": "Completude", "rolagem": "Rolagem",
}
QLABEL = {
    "completude": "1 · Mostra tudo que precisa?",
    "espaco": "2 · Aproveita o espaço?",
    "cortando": "3 · Tem campo cortando?",
    "hierarquia": "4 · Hierarquia intuitiva?",
    "selecao": "5 · Caixas de seleção certas?",
}

CSS = """
*{box-sizing:border-box}
body{margin:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Inter,sans-serif;
  background:#0b1020;color:#e7eaf3;line-height:1.5}
.wrap{max-width:1180px;margin:0 auto;padding:32px 20px 80px}
header h1{margin:0 0 4px;font-size:22px;letter-spacing:-.01em}
header .sub{color:#9aa3b8;font-size:13px}
.metabar{display:flex;flex-wrap:wrap;gap:10px;margin:18px 0 26px}
.chip{background:#131a2e;border:1px solid #212a44;border-radius:999px;
  padding:4px 12px;font-size:12px;color:#aeb7ce}
.card{background:#0f1526;border:1px solid #1e2740;border-radius:14px;
  padding:20px;margin:0 0 22px}
.card .top{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.badge{font-size:11px;font-weight:700;color:#fff;border-radius:6px;padding:2px 8px}
.cat{font-size:11px;color:#aeb7ce;background:#131a2e;border:1px solid #212a44;
  border-radius:6px;padding:2px 8px}
.id{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12px;color:#7f8db0}
.via{margin-left:auto;font-size:11px;font-weight:700;border-radius:6px;padding:2px 8px;color:#0b1020}
.card h2{font-size:16px;margin:12px 0 4px}
.loc{color:#9aa3b8;font-size:12.5px;margin:0 0 12px}
.txt{font-size:13.5px;color:#cdd4e6;margin:8px 0}
.txt b{color:#e7eaf3}
.metrics{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0}
.metric{font-size:12px;border-radius:8px;padding:6px 10px;background:#0c1220;border:1px solid #1e2740}
.metric .n{font-weight:700}
.metric .b{color:#ff8a93}.metric .a{color:#5ee08f}
.arrow{color:#6b7699;padding:0 2px}
.qs{display:grid;grid-template-columns:1fr;gap:6px;margin:12px 0;
  background:#0c1220;border:1px solid #1a2238;border-radius:10px;padding:12px 14px}
.q{font-size:12.5px;color:#c3cbe0}.q b{color:#8fa3be;font-weight:600}
.stages{display:flex;gap:18px;flex-wrap:wrap;margin-top:14px}
.stage{background:#f6f7fb;color:#1a2233;border-radius:10px;padding:14px;
  border:2px solid transparent;overflow:auto}
.stage.before{border-color:#e0808a}
.stage.after{border-color:#7bd39a}
.stage .cap{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;
  margin:0 0 10px;color:#5a6478}
.stage.before .cap{color:#b04552}.stage.after .cap{color:#2e8b57}
.fix{background:#0c1c14;border:1px solid #1c3a2a;border-radius:10px;
  padding:10px 14px;margin-top:14px;font-size:13px;color:#bfe6cf}
.fix b{color:#7bd39a}
.reflow{color:#f6c177;font-size:12px;margin-top:8px}
.foot{color:#6b7699;font-size:12px;margin-top:40px;text-align:center}
/* --- utilitários do palco (form fiel rápido) --- */
.stage .row{margin:0 0 12px}
.stage .grid-2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.stage .section{font-size:11px;font-weight:700;text-transform:uppercase;
  letter-spacing:.04em;color:#7a8398;margin:16px 0 8px;border-top:1px solid #e2e5ee;padding-top:12px}
.stage .label{display:block;font-size:12px;color:#4a5468;margin:0 0 4px;font-weight:600}
.stage .control{width:100%;border:1px solid #cfd4e0;border-radius:8px;
  padding:8px 10px;font-size:13px;background:#fff;color:#1a2233}
.stage .field{margin:0 0 12px}
.stage .actions{display:flex;gap:8px;justify-content:flex-end;margin-top:16px}
.stage .btn{border-radius:8px;padding:8px 14px;font-size:13px;font-weight:600;
  border:1px solid #cfd4e0;background:#fff;color:#1a2233}
.stage .btn-primary{background:#1f6feb;border-color:#1f6feb;color:#fff}
.stage .clip{outline:2px dashed #dc2626;outline-offset:1px}
"""


def esc(s):
    return html.escape(str(s)) if s is not None else ""


def metric_row(m):
    if not m:
        return ""
    cw = m.get("container_w")
    b, a = m.get("before", {}), m.get("after", {})
    out = []
    if cw:
        out.append(f'<span class="metric">largura container <span class="n">{esc(cw)}px</span></span>')
    keys = [("clipped_px", "cortado"), ("scroll_px", "rolagem"), ("wasted_px", "espaço morto")]
    for k, lbl in keys:
        if k in b or k in a:
            bv = b.get(k, "—"); av = a.get(k, "—")
            out.append(
                f'<span class="metric">{lbl} '
                f'<span class="n b">{esc(bv)}{"px" if bv!="—" else ""}</span>'
                f'<span class="arrow">→</span>'
                f'<span class="n a">{esc(av)}{"px" if av!="—" else ""}</span></span>'
            )
    return f'<div class="metrics">{"".join(out)}</div>'


def questions_block(q):
    if not q:
        return ""
    rows = []
    for key, lbl in QLABEL.items():
        if q.get(key):
            rows.append(f'<div class="q"><b>{lbl}</b> — {esc(q[key])}</div>')
    return f'<div class="qs">{"".join(rows)}</div>' if rows else ""


def stage(kind, cap, inner, width):
    return (
        f'<div class="stage {kind}" style="width:{int(width)}px;max-width:100%">'
        f'<div class="cap">{cap}</div>{inner or ""}</div>'
    )


def render(data, out_path):
    meta = data.get("meta", {})
    findings = data.get("findings", [])
    order = {"critical": 0, "warning": 1, "info": 2}
    findings = sorted(findings, key=lambda f: order.get(f.get("severity"), 3))

    gen = meta.get("generated_at") or datetime.now().strftime("%Y-%m-%d %H:%M")
    chips = []
    for k in ("project", "scope", "design_system_source"):
        if meta.get(k):
            chips.append(f'<span class="chip">{esc(meta[k])}</span>')
    if meta.get("viewports"):
        chips.append(f'<span class="chip">larguras: {esc(", ".join(str(v) for v in meta["viewports"]))}</span>')
    n_crit = sum(1 for f in findings if f.get("severity") == "critical")
    n_warn = sum(1 for f in findings if f.get("severity") == "warning")
    chips.append(f'<span class="chip">{n_crit} críticos · {n_warn} atenção · {len(findings)} total</span>')

    cards = []
    for f in findings:
        sev_lbl, sev_col = SEV.get(f.get("severity", "info"), SEV["info"])
        via = f.get("viability", {})
        via_col = VIA.get(str(via.get("level", "")).lower(), "#c3cbe0")
        cat = CAT.get(f.get("category", ""), f.get("category", ""))
        prev = f.get("preview", {})
        w = prev.get("width", meta.get("default_width", 480))
        stages = ""
        if prev.get("before_html") or prev.get("after_html"):
            stages = (
                '<div class="stages">'
                + stage("before", "Antes", prev.get("before_html", ""), w)
                + stage("after", "Depois", prev.get("after_html", ""), w)
                + "</div>"
            )
        via_html = ""
        if via:
            via_html = (
                f'<span class="via" style="background:{via_col}">'
                f'viabilidade: {esc(via.get("level",""))}</span>'
            )
        via_note = f'<p class="txt"><b>Viabilidade:</b> {esc(via.get("note"))}</p>' if via.get("note") else ""
        reflow = '<div class="reflow">⚠ reflow_risk: muda altura/fluxo de vizinhos — precisa de OK explícito.</div>' if f.get("reflow_risk") else ""
        fix = f'<div class="fix"><b>Ajuste proposto:</b> {esc(f.get("fix"))}</div>' if f.get("fix") else ""
        issue = f'<p class="txt"><b>Problema:</b> {esc(f.get("issue"))}</p>' if f.get("issue") else ""
        cards.append(
            f'<div class="card">'
            f'<div class="top">'
            f'<span class="badge" style="background:{sev_col}">{sev_lbl}</span>'
            f'{f"<span class=cat>{esc(cat)}</span>" if cat else ""}'
            f'<span class="id">#{esc(f.get("id",""))}</span>'
            f'{via_html}'
            f'</div>'
            f'<h2>{esc(f.get("title",""))}</h2>'
            f'<p class="loc">{esc(f.get("location",""))}</p>'
            f'{issue}'
            f'{metric_row(f.get("metrics"))}'
            f'{questions_block(f.get("questions"))}'
            f'{fix}{reflow}{via_note}'
            f'{stages}'
            f'</div>'
        )

    doc = (
        "<!doctype html><html lang=pt-br><head><meta charset=utf-8>"
        "<meta name=viewport content='width=device-width,initial-scale=1'>"
        "<title>dudu-check-modais — preview</title>"
        f"<style>{CSS}</style></head><body><div class=wrap>"
        "<header><h1>dudu-check-modais — auditoria de layout & usabilidade</h1>"
        f"<div class=sub>Preview antes/depois · gerado {esc(gen)} · "
        "autorize por ID antes de aplicar</div></header>"
        f'<div class=metabar>{"".join(chips)}</div>'
        f'{"".join(cards) if cards else "<p class=txt>Nenhum achado — o painel aproveita bem o espaço. ✔</p>"}'
        '<div class=foot>Só cor? encaminhe à dudu-check-cores. '
        'Nada é aplicado sem sua autorização por ID.</div>'
        "</div></body></html>"
    )
    os.makedirs(os.path.dirname(os.path.abspath(out_path)) or ".", exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as fh:
        fh.write(doc)
    return out_path


def main():
    # Windows: stdout costuma ser cp1252 e quebra em "→"/acentos. Force UTF-8.
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding="utf-8")
        except (AttributeError, ValueError):
            pass
    ap = argparse.ArgumentParser(description="Gera o preview antes/depois da dudu-check-modais.")
    ap.add_argument("findings", help="caminho do findings.json")
    ap.add_argument("-o", "--out", default="dudu-modais-report/index.html")
    args = ap.parse_args()
    try:
        with open(args.findings, encoding="utf-8") as fh:
            data = json.load(fh)
    except (OSError, json.JSONDecodeError) as e:
        print(f"erro ao ler {args.findings}: {e}", file=sys.stderr)
        sys.exit(1)
    out = render(data, args.out)
    ab = os.path.abspath(out)
    print(f"preview → {out}")
    print(f"file:///{ab.replace(os.sep, '/')}")


if __name__ == "__main__":
    main()
