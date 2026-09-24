import re,sys
p=sys.argv[1]; DEAD=sys.argv[2].split(',')
css=open(p,'rb').read().decode('utf-8')
dead_re=re.compile(r'\.(?:'+'|'.join(map(re.escape,DEAD))+r')(?![\w-])')
def parse(s):
    out=[];i=0;n=len(s)
    while i<n:
        j=s.find('{',i)
        if j<0: out.append(('',None,s[i:]));break
        pre=s[i:j]; depth=1;k=j+1
        while depth and k<n:
            if s[k]=='{':depth+=1
            elif s[k]=='}':depth-=1
            k+=1
        out.append((pre,s[j+1:k-1],s[i:k])); i=k
    return out
removed=[]
def clean(s):
    res=[]
    for pre,body,raw in parse(s):
        if body is None: res.append(raw);continue
        sel=pre.strip()
        if sel.startswith('@media') or sel.startswith('@supports'):
            inner=clean(body)
            if inner.strip(): res.append(pre+'{'+inner+'}')
            else: removed.append(sel)
            continue
        if sel.startswith('@'): res.append(raw);continue
        comentarios=''.join(re.findall(r'/\*.*?\*/',pre,re.S))
        sel=re.sub(r'/\*.*?\*/','',pre,flags=re.S).strip()
        lead=pre[:len(pre)-len(pre.lstrip())]
        parts=[x.strip() for x in sel.split(',')]
        keep=[x for x in parts if not dead_re.search(x)]
        if not keep:
            if comentarios: res.append(lead+comentarios)
            removed.append(sel);continue
        if len(keep)<len(parts):
            res.append(lead+comentarios+(chr(13)+chr(10) if comentarios else '')+','.join(keep)+' {'+body+'}'); removed.append('(parcial) '+sel)
        else: res.append(raw)
    return ''.join(res)
new=clean(css)
new=re.sub(r'(\r?\n){4,}',lambda m:m.group(0)[:len(m.group(0))//2+1] if False else '\r\n\r\n\r\n',new)
assert new.count('/*')==new.count('*/')==css.count('/*'),'comentarios desbalanceados: abortado'
open(p,'wb').write(new.encode('utf-8'))
print(len(removed),'removidas:',' | '.join(removed))
