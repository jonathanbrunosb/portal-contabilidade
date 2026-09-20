"""Minimal Outlook .msg (CFB) reader: extracts subject, HTML body and attachments."""
import struct, sys, os, re, json

ENDOFCHAIN = 0xFFFFFFFE
FREESECT = 0xFFFFFFFF


class CFB:
    def __init__(self, data):
        self.d = data
        hdr = data[:512]
        assert hdr[:8] == bytes.fromhex('D0CF11E0A1B11AE1'), 'not CFB'
        self.ss = 1 << struct.unpack_from('<H', hdr, 30)[0]
        self.mss = 1 << struct.unpack_from('<H', hdr, 32)[0]
        nfat = struct.unpack_from('<I', hdr, 44)[0]
        dir_start = struct.unpack_from('<I', hdr, 48)[0]
        self.cutoff = struct.unpack_from('<I', hdr, 56)[0]
        minifat_start = struct.unpack_from('<I', hdr, 60)[0]
        difat_start = struct.unpack_from('<I', hdr, 68)[0]
        ndifat = struct.unpack_from('<I', hdr, 72)[0]
        difat = list(struct.unpack_from('<109I', hdr, 76))
        s = difat_start
        for _ in range(ndifat):
            if s in (ENDOFCHAIN, FREESECT):
                break
            sec = self.sector(s)
            vals = struct.unpack_from('<%dI' % (self.ss // 4), sec)
            difat.extend(vals[:-1])
            s = vals[-1]
        self.fat = []
        for s in difat[:nfat]:
            self.fat.extend(struct.unpack_from('<%dI' % (self.ss // 4), self.sector(s)))
        dirdata = self.chain(dir_start)
        self.entries = []
        for i in range(len(dirdata) // 128):
            e = dirdata[i * 128:(i + 1) * 128]
            nlen = struct.unpack_from('<H', e, 64)[0]
            name = e[:max(nlen - 2, 0)].decode('utf-16-le', 'replace')
            typ = e[66]
            left, right, child = struct.unpack_from('<III', e, 68)
            start = struct.unpack_from('<I', e, 116)[0]
            size = struct.unpack_from('<Q', e, 120)[0] & 0xFFFFFFFF
            self.entries.append(dict(name=name, type=typ, left=left, right=right, child=child, start=start, size=size))
        root = self.entries[0]
        self.ministream = self.chain(root['start'])[:root['size']] if root['start'] != ENDOFCHAIN else b''
        self.minifat = []
        if minifat_start not in (ENDOFCHAIN, FREESECT):
            mf = self.chain(minifat_start)
            self.minifat = list(struct.unpack_from('<%dI' % (len(mf) // 4), mf))

    def sector(self, n):
        o = 512 + n * self.ss
        return self.d[o:o + self.ss]

    def chain(self, start):
        out, s, seen = [], start, set()
        while s not in (ENDOFCHAIN, FREESECT) and s not in seen and s < len(self.fat):
            seen.add(s)
            out.append(self.sector(s))
            s = self.fat[s]
        return b''.join(out)

    def read(self, e):
        if e['size'] < self.cutoff:
            out, s = [], e['start']
            while s not in (ENDOFCHAIN, FREESECT) and s < len(self.minifat):
                o = s * self.mss
                out.append(self.ministream[o:o + self.mss])
                s = self.minifat[s]
            return b''.join(out)[:e['size']]
        return self.chain(e['start'])[:e['size']]

    def children(self, idx):
        res = []
        def walk(i):
            if i == FREESECT or i >= len(self.entries):
                return
            e = self.entries[i]
            walk(e['left']); res.append(i); walk(e['right'])
        walk(self.entries[idx]['child'])
        return res


def props(cfb, idx):
    out = {}
    for c in cfb.children(idx):
        e = cfb.entries[c]
        if e['type'] == 2 and e['name'].startswith('__substg1.0_'):
            out[e['name'][12:]] = cfb.read(e)
    return out


def s(v):
    return v.decode('utf-16-le', 'replace') if v else ''


def lzfu(data):
    """Decompress compressed RTF (MS-OXRTFCP)."""
    prebuf = (b"{\\rtf1\\ansi\\mac\\deff0\\deftab720{\\fonttbl;}{\\f0\\fnil \\froman \\fswiss \\fmodern \\fscript "
              b"\\fdecor MS Sans SerifSymbolArialTimes New RomanCourier{\\colortbl\\red0\\green0\\blue0\r\n\\par "
              b"\\pard\\plain\\f0\\fs20\\b\\i\\u\\tab\\tx")
    comp_size, raw_size, magic = struct.unpack_from('<III', data, 0)
    if magic == 0x414c454d:  # MELA uncompressed
        return data[16:16 + raw_size]
    buf = bytearray(4096)
    buf[:len(prebuf)] = prebuf
    wp = len(prebuf)
    out = bytearray()
    i = 16
    while i < len(data) and len(out) < raw_size:
        flags = data[i]; i += 1
        for bit in range(8):
            if i >= len(data) or len(out) >= raw_size:
                break
            if flags & (1 << bit):
                ref = (data[i] << 8) | data[i + 1]; i += 2
                off, ln = ref >> 4, (ref & 0xF) + 2
                if off == wp:
                    return bytes(out)
                for k in range(ln):
                    ch = buf[(off + k) % 4096]
                    out.append(ch); buf[wp] = ch; wp = (wp + 1) % 4096
            else:
                ch = data[i]; i += 1
                out.append(ch); buf[wp] = ch; wp = (wp + 1) % 4096
    return bytes(out)


def rtf_to_html(rtf):
    """Extract HTML embedded in RTF by \\fromhtml1 (htmlrtf/htmltag groups)."""
    t = rtf.decode('latin-1')
    if '\\fromhtml' not in t:
        return None
    out = []
    i, n = 0, len(t)
    skip = 0
    depth = 0
    htmlrtf = False
    while i < n:
        c = t[i]
        if c == '{':
            depth += 1; i += 1; continue
        if c == '}':
            depth -= 1; i += 1; continue
        if c == '\\':
            m = re.match(r"\\([a-z]+)(-?\d+)? ?|\\'([0-9a-fA-F]{2})|\\(.)", t[i:])
            if not m:
                i += 1; continue
            word, arg, hx, sym = m.groups()
            i += m.end()
            if word == 'htmlrtf':
                htmlrtf = arg != '0'
            elif htmlrtf:
                continue
            elif hx:
                out.append(bytes([int(hx, 16)]).decode('cp1252', 'replace'))
            elif sym:
                if sym in '{}\\':
                    out.append(sym)
            elif word == 'par':
                out.append('\n')
            elif word == 'tab':
                out.append('\t')
            elif word == 'u' and arg:
                out.append(chr(int(arg) % 65536))
                if i < n and t[i] == '?':
                    i += 1
            continue
        if c in '\r\n':
            i += 1; continue
        if not htmlrtf:
            out.append(c)
        i += 1
    return ''.join(out)


def extract(path, outdir):
    cfb = CFB(open(path, 'rb').read())
    p = props(cfb, 0)
    subject = s(p.get('0037001F'))
    sender = s(p.get('0C1A001F')) or s(p.get('0042001F'))
    date_hint = None
    html = p.get('10130102')
    source = 'html'
    if html:
        html = html.decode('utf-8', 'replace') if b'charset=utf-8' in html[:2000].lower() else html.decode('cp1252', 'replace')
    else:
        rtf = p.get('10090102')
        html = rtf_to_html(lzfu(rtf)) if rtf else None
        source = 'rtf-fromhtml'
    if not html:
        html = '<pre>' + s(p.get('1000001F')) + '</pre>'; source = 'plain'
    os.makedirs(outdir, exist_ok=True)
    atts = []
    for idx, e in enumerate(cfb.entries):
        if e['type'] == 1 and e['name'].startswith('__attach_version1.0_'):
            ap = props(cfb, idx)
            fname = s(ap.get('3707001F')) or s(ap.get('3704001F')) or e['name']
            cid = s(ap.get('3712001F'))
            mime = s(ap.get('370E001F'))
            data = ap.get('37010102', b'')
            safe = re.sub(r'[^\w.\-]', '_', fname)
            open(os.path.join(outdir, safe), 'wb').write(data)
            atts.append(dict(file=safe, cid=cid, mime=mime, size=len(data)))
    for a in atts:
        if a['cid']:
            html = html.replace('cid:' + a['cid'], a['file'])
    open(os.path.join(outdir, 'email.html'), 'w', encoding='utf-8').write(html)
    meta = dict(subject=subject, sender=sender, source=source, attachments=atts)
    json.dump(meta, open(os.path.join(outdir, 'meta.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
    return meta


if __name__ == '__main__':
    src, dst = sys.argv[1], sys.argv[2]
    for f in sorted(os.listdir(src)):
        if f.lower().endswith('.msg'):
            slug = re.sub(r'[^\w]+', '-', os.path.splitext(f)[0].lower()).strip('-')
            m = extract(os.path.join(src, f), os.path.join(dst, slug))
            print(slug, '|', m['subject'], '|', m['sender'], '|', m['source'], '|', [(a['file'], a['size']) for a in m['attachments']])
