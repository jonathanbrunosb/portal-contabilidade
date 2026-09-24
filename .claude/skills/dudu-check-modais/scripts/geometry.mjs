// geometry.mjs — abre um modal/painel do app EQTL AO VIVO e mede sua geometria,
// para a skill dudu-check-modais achar campo cortado, espaço morto e rolagem
// evitável com NÚMEROS (px), não impressão.
//
// Reusa a infra do skill run-eqtl-frontend: mesmo login (admin do seed) e portas.
// Rode a partir de frontend/ para o playwright resolver de frontend/node_modules.
//
// Uso:
//   BASE=http://127.0.0.1:5199 \
//   node ../.claude/skills/dudu-check-modais/scripts/geometry.mjs \
//     --route /cadastros \
//     --open '[{"click":"text=Nova empresa"},{"wait":300}]' \
//     --container '[role=dialog], .modal, .drawer, .side-panel' \
//     --viewport 1440x900 \
//     --out /tmp/modais/empresa.json --shot /tmp/modais/empresa.png
//
// Passos de --open: {"click":sel} | {"fill":sel,"value":v} | {"select":sel,"value":v} | {"wait":ms}
// Credenciais: EMAIL / PASSWORD (default admin do seed já com senha trocada).
// playwright é resolvido a partir do CWD (rode a partir de frontend/), não da
// pasta deste script — assim o script pode viver em .claude/ na raiz do repo.
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

const require = createRequire(pathToFileURL(join(process.cwd(), "noop.js")));
const pw = await import(pathToFileURL(require.resolve("playwright")).href);
const chromium = pw.chromium ?? pw.default?.chromium;

const BASE = process.env.BASE ?? "http://127.0.0.1:5199";
const EMAIL = process.env.EMAIL ?? "admin@equatorial.com.br";
const PASSWORD = process.env.PASSWORD ?? "NovaSenha@123";

function arg(name, def) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : def;
}
const ROUTE = arg("route", "/cadastros");
const OPEN = JSON.parse(arg("open", "[]"));
const CONTAINER = arg("container", "[role=dialog], .modal, .drawer, .side-panel, dialog");
// --ignore: seletor(es) de regiões com scroll interno PROPOSITAL (ex.: lista de um
// picker com max-height/overflow). Seus filhos NÃO contam como campo/cortado/rolagem
// do painel — senão uma lista de 181 itens vira falso "346 cortados / 7731px scroll".
const IGNORE = arg("ignore", null);
const OUT = arg("out", null);
const SHOT = arg("shot", null);
const [vw, vh] = arg("viewport", "1440x900").split("x").map((n) => parseInt(n, 10));

async function login(page) {
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(/dashboard|trocar-senha/, { timeout: 10000 }).catch(() => {});
  await page.waitForLoadState("networkidle");
  if (page.url().includes("trocar-senha")) {
    console.error("! conta ainda exige troca de senha — passe EMAIL/PASSWORD de conta pronta");
  }
}

async function runStep(page, step) {
  if (step.wait != null) return page.waitForTimeout(step.wait);
  if (step.click) return page.click(step.click, { timeout: 8000 });
  if (step.fill) return page.fill(step.fill, step.value ?? "");
  if (step.select) return page.selectOption(step.select, step.value ?? "");
  console.error("! passo desconhecido:", JSON.stringify(step));
}

// Roda no contexto da página: mede o container e cada campo.
function measure({ containerSel, ignoreSel }) {
  const q = (root, sel) => Array.from(root.querySelectorAll(sel));
  const el = document.querySelector(containerSel);
  if (!el) return { error: `container não encontrado: ${containerSel}` };
  const cr = el.getBoundingClientRect();
  const vp = { w: window.innerWidth, h: window.innerHeight };

  // Regiões com scroll interno proposital (picker/lista): medidas à parte, e seus
  // filhos ficam FORA da contagem de campos/cortados/rolagem do painel.
  const ignored = ignoreSel ? q(el, ignoreSel) : [];
  const inIgnored = (n) => ignored.some((ig) => ig === n || ig.contains(n));
  const ignoredRegions = ignored.map((ig) => ({
    selector: ignoreSel,
    innerScrollPx: Math.max(0, Math.round(ig.scrollHeight - ig.clientHeight)),
    rows: ig.children.length,
  }));

  // Corpo rolável: o próprio container ou o descendente com overflow auto/scroll
  // e conteúdo maior que a área. Ignora as regiões de scroll proposital.
  const scrollables = [el, ...q(el, "*")].filter((n) => {
    if (inIgnored(n)) return false;
    const s = getComputedStyle(n);
    const oy = s.overflowY, ox = s.overflowX;
    return (
      (/(auto|scroll)/.test(oy) && n.scrollHeight - n.clientHeight > 1) ||
      (/(auto|scroll)/.test(ox) && n.scrollWidth - n.clientWidth > 1)
    );
  });
  const body = scrollables.sort(
    (a, b) => (b.scrollHeight - b.clientHeight) - (a.scrollHeight - a.clientHeight)
  )[0] || el;
  const needsVScroll = Math.max(0, Math.round(body.scrollHeight - body.clientHeight));
  const needsHScroll = Math.max(0, Math.round(body.scrollWidth - body.clientWidth));

  const cs = getComputedStyle(el);
  const padL = parseFloat(cs.paddingLeft) || 0;
  const padR = parseFloat(cs.paddingRight) || 0;
  const contentWidth = Math.round(cr.width - padL - padR);
  const visibleBottom = Math.min(cr.bottom, vp.h);
  const visibleRight = Math.min(cr.right, vp.w);

  const controls = q(el, "input, select, textarea, button, [role=combobox], [role=listbox], label")
    .filter((n) => !inIgnored(n));
  const fields = controls.map((n) => {
    const r = n.getBoundingClientRect();
    const s = getComputedStyle(n);
    const tag = n.tagName.toLowerCase();
    const type = n.getAttribute("type") || n.getAttribute("role") || tag;
    // cortado: sai da área visível do container, OU conteúdo truncado no próprio campo
    const outBottom = r.bottom > visibleBottom + 1;
    const outRight = r.right > visibleRight + 1;
    const outTop = r.top < cr.top - 1;
    const selfClip = n.scrollWidth > n.clientWidth + 1 || n.scrollHeight > n.clientHeight + 1;
    const label = (n.getAttribute("aria-label") || n.name || n.id || n.textContent || "")
      .trim().slice(0, 40);
    return {
      tag, type, label,
      box: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
      fontSize: parseFloat(s.fontSize),
      widthPctOfContent: contentWidth ? Math.round((r.width / contentWidth) * 100) : null,
      clipped: outBottom || outRight || outTop || selfClip,
      clipReason: [outRight && "direita", outBottom && "abaixo da dobra", outTop && "acima", selfClip && "conteúdo truncado"].filter(Boolean),
    };
  });

  // espaço horizontal desperdiçado: quanto da largura de conteúdo o campo mais
  // largo NÃO usa (colunas estreitas num painel largo).
  const inputs = fields.filter((f) => ["input", "select", "textarea"].includes(f.tag));
  const widest = inputs.reduce((m, f) => Math.max(m, f.box.w), 0);
  const wastedRightPx = contentWidth ? Math.max(0, contentWidth - widest) : null;

  // gaps verticais mortos entre linhas de campo consecutivas (> 24px acima do típico)
  const rows = inputs
    .map((f) => f.box)
    .sort((a, b) => a.y - b.y);
  let deadGapPx = 0;
  const gaps = [];
  for (let i = 1; i < rows.length; i++) {
    const gap = rows[i].y - (rows[i - 1].y + rows[i - 1].h);
    if (gap > 24) { deadGapPx += gap - 24; gaps.push(Math.round(gap)); }
  }

  return {
    viewport: vp,
    container: {
      selector: containerSel,
      box: { x: Math.round(cr.x), y: Math.round(cr.y), w: Math.round(cr.width), h: Math.round(cr.height) },
      contentWidth,
      overflowsViewport: cr.bottom > vp.h + 1 || cr.right > vp.w + 1 || cr.top < -1 || cr.left < -1,
    },
    scroll: { needsVScroll, needsHScroll, scrollableFound: body !== el },
    ignoredRegions,
    space: { wastedRightPx, widestInputPx: widest, deadGapPx: Math.round(deadGapPx), bigGaps: gaps },
    counts: {
      fields: fields.length,
      inputs: inputs.length,
      clipped: fields.filter((f) => f.clipped).length,
    },
    clippedFields: fields.filter((f) => f.clipped),
    fields,
  };
}

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: vw || 1440, height: vh || 900 }, deviceScaleFactor: 2 });
  await login(page);
  await page.goto(`${BASE}${ROUTE}`, { waitUntil: "networkidle" });
  for (const step of OPEN) await runStep(page, step);
  await page.waitForTimeout(250);

  await page.waitForSelector(CONTAINER, { timeout: 8000 }).catch(() => {
    console.error(`! container "${CONTAINER}" não apareceu — confira a receita --open`);
  });

  const data = await page.evaluate(measure, { containerSel: CONTAINER, ignoreSel: IGNORE });
  data.meta = { base: BASE, route: ROUTE, open: OPEN, container: CONTAINER, ignore: IGNORE, viewport: `${vw}x${vh}`, url: page.url() };

  if (SHOT) { mkdirSync(dirname(SHOT), { recursive: true }); await page.screenshot({ path: SHOT, fullPage: false }); }
  const json = JSON.stringify(data, null, 2);
  if (OUT) { mkdirSync(dirname(OUT), { recursive: true }); writeFileSync(OUT, json); console.error("geometria →", OUT); }
  if (SHOT) console.error("screenshot →", SHOT);

  // resumo legível no stderr; JSON completo no stdout
  if (!data.error) {
    console.error(
      `\n[${ROUTE} @ ${vw}px] campos=${data.counts.fields} cortados=${data.counts.clipped} ` +
      `| rolagem=${data.scroll.needsVScroll}px (h=${data.scroll.needsHScroll}px) ` +
      `| espaço morto lateral=${data.space.wastedRightPx}px vertical=${data.space.deadGapPx}px` +
      (data.container.overflowsViewport ? " | ⚠ container estoura a viewport" : "") +
      (data.ignoredRegions?.length ? ` | (ignorado: ${data.ignoredRegions.map((r) => `${r.rows} itens/${r.innerScrollPx}px scroll interno`).join("; ")})` : "")
    );
    if (data.counts.clipped) {
      for (const f of data.clippedFields)
        console.error(`  ✖ cortado: ${f.tag}[${f.type}] "${f.label}" (${f.clipReason.join(", ")})`);
    }
  } else {
    console.error("ERRO:", data.error);
  }
  console.log(json);
  await browser.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
