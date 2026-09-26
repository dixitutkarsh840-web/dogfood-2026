
import sys, json, urllib.request, urllib.error, re, os

def parse_toml_simple(path):
    # super simple parser for our .dogfood.toml shape
    cfg = {'portal':{}, 'tiers':{}, 'auth':{}, 'routes':{}}
    current = None
    with open(path,'r',encoding='utf-8') as f:
        for line in f:
            line=line.strip()
            if not line or line.startswith('#'): continue
            if line.startswith('[') and line.endswith(']'):
                sec=line[1:-1].strip()
                if sec in cfg: current=sec
                else: current=None
                continue
            if '=' in line and current:
                k,v = line.split('=',1)
                k=k.strip(); v=v.strip()
                # remove quotes
                if (v.startswith('"') and v.endswith('"')) or (v.startswith("'") and v.endswith("'")):
                    v=v[1:-1]
                # handle list like ["T1","T2"]
                if v.startswith('['):
                    # extract quoted strings
                    vals = re.findall(r'"([^"]+)"', v)
                    cfg[current][k]=vals
                else:
                    cfg[current][k]=v
    return cfg

def load_toml(path):
    try:
        import tomllib
        with open(path,'rb') as f:
            return tomllib.load(f)
    except:
        return parse_toml_simple(path)

def req(url, header_str=None):
    h = {}
    if header_str:
        if ':' in header_str:
            k,v = header_str.split(':',1)
            h[k.strip()] = v.strip()
    r = urllib.request.Request(url, headers=h)
    try:
        with urllib.request.urlopen(r, timeout=5) as resp:
            body = resp.read().decode(errors='ignore')
            return resp.status, body
    except urllib.error.HTTPError as e:
        try:
            b = e.read().decode(errors='ignore')
        except: b=""
        return e.code, b
    except Exception as e:
        return 0, str(e)

def post_req(url, header_str):
    h={}
    if header_str:
        if ':' in header_str:
            k,v = header_str.split(':',1)
            h[k.strip()] = v.strip()
    data = b'{}'
    r = urllib.request.Request(url, data=data, headers=h, method='POST')
    r.add_header('Content-Type','application/json')
    try:
        with urllib.request.urlopen(r, timeout=5) as resp:
            return resp.status, resp.read().decode(errors='ignore')
    except urllib.error.HTTPError as e:
        try: b=e.read().decode(errors='ignore')
        except: b=""
        return e.code, b
    except Exception as e:
        return 0, str(e)

def main():
    toml_path = sys.argv[1] if len(sys.argv)>1 else '.dogfood.toml'
    if not os.path.exists(toml_path):
        print(f"File not found: {toml_path}")
        sys.exit(1)
    cfg = load_toml(toml_path)
    base = cfg['portal']['base_url'].rstrip('/')
    routes = cfg['routes']
    auth = cfg['auth']
    print(f"DOGFOOD 2026 acceptance report")
    print(f"portal: {base}")
    claimed = cfg['tiers'].get('claimed', [])
    if isinstance(claimed, str): claimed=[claimed]
    print(f"claimed: {' '.join(claimed)}")
    print(f"fixtures: fixtures.json")
    print()
    checks=[]
    s,b = req(base+routes['gallery'])
    checks.append(("T1  gallery is public", s==200))
    checks.append(("T1  project from fixtures shown", "Quantum Garden" in b))
    s,b = post_req(base+routes['submit'], auth.get('participant'))
    checks.append(("T1  closed event refuses submissions", 400 <= s < 500))
    s,b = req(base+routes['judge_scores'], auth.get('judge_a'))
    checks.append(("T2  judge sees own scores", s==200))
    s,b = req(base+routes['peer_scores'], auth.get('judge_b'))
    checks.append(("T2  judge cannot see peer scores", s in (401,403)))
    s,b = req(base+routes['judge_scores'], auth.get('participant'))
    checks.append(("T2  participant blocked", s in (401,403)))
    s,b = req(base+routes['csv_export'], auth.get('organizer'))
    checks.append(("T2  csv export works", s==200 and 'project' in b.lower()))
    
    for name, ok in checks:
        dots = '.' * max(2, 35 - len(name))
        print(f"{name} {dots} {'PASS' if ok else 'FAIL'}")
    print()
    verified=[]
    if all(ok for name,ok in checks if name.startswith('T1')):
        verified.append('T1')
    if all(ok for name,ok in checks if name.startswith('T2')):
        verified.append('T2')
    print(f"claimed {' '.join(claimed)}, verified {' '.join(verified) if verified else 'none'}")
    if 'T1' not in verified or 'T2' not in verified:
        print("note: claimed but not verified:", ", ".join([c for c in claimed if c not in verified]))

if __name__=='__main__':
    main()