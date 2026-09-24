import subprocess,difflib,sys
def split(b):
    res=[];parts=b.split(b'\n')
    for i,p in enumerate(parts):
        if i==len(parts)-1:
            if p: res.append((p.rstrip(b'\r'),b''))
            break
        res.append((p[:-1],b'\r\n') if p.endswith(b'\r') else (p,b'\n'))
    return res
for f in sys.argv[1:]:
    r=subprocess.run(['git','cat-file','-p','HEAD:'+f],capture_output=True)
    cur=split(open(f,'rb').read())
    if r.returncode!=0:
        data=b''.join(c+(e and b'\r\n') for c,e in cur); open(f,'wb').write(data); continue
    head=split(r.stdout); hc=[c for c,_ in head]; cc=[c for c,_ in cur]
    out=[]
    for op,i1,i2,j1,j2 in difflib.SequenceMatcher(None,hc,cc,autojunk=False).get_opcodes():
        if op=='equal': out+= [cc[j1+k]+head[i1+k][1] for k in range(i2-i1)]
        else: out+= [cc[k]+(cur[k][1] and b'\r\n') for k in range(j1,j2)]
    open(f,'wb').write(b''.join(out))
print('ok')
