#!/usr/bin/env python3
"""
Import-graph reachability for src/ (P2 audit). Roots = every Next.js entry file in src/app
(page/layout/template/loading/error/not-found/route/default/sitemap/robots/opengraph-image),
src/middleware.ts and src/instrumentation*.ts. Prints files under src/ that no root reaches.
Usage: python3 scripts/audit/reachability.py [path-prefix-filter]
"""
import os, re, sys

SRC = "src"
EXTS = (".tsx", ".ts", ".js", ".jsx", ".scss", ".css")
IMPORT = re.compile(r"""(?:import|export)\s[^'"]*?from\s*['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)|require\(\s*['"]([^'"]+)['"]\s*\)|^\s*import\s+['"]([^'"]+)['"]""", re.M)
ENTRY = re.compile(r"/(page|layout|template|loading|error|global-error|not-found|route|default|sitemap|robots|opengraph-image|icon)\.(tsx|ts|js)$")

def all_files():
    for d, _, fs in os.walk(SRC):
        for f in fs:
            if f.endswith((".tsx", ".ts", ".js", ".jsx")):
                yield os.path.join(d, f)

def resolve(spec, frm):
    if spec.startswith("@/"):
        base = os.path.join(SRC, spec[2:])
    elif spec.startswith("."):
        base = os.path.normpath(os.path.join(os.path.dirname(frm), spec))
    else:
        return None
    for cand in [base] + [base + e for e in EXTS] + [os.path.join(base, "index" + e) for e in EXTS]:
        if os.path.isfile(cand):
            return cand
    return None

files = list(all_files())
graph = {}
for f in files:
    txt = open(f, encoding="utf8").read()
    deps = set()
    for m in IMPORT.finditer(txt):
        spec = next(g for g in m.groups() if g)
        r = resolve(spec, f)
        if r: deps.add(r)
    graph[f] = deps

roots = [f for f in files if (f.startswith("src/app/") and ENTRY.search(f)) or re.match(r"src/(middleware|instrumentation[^/]*)\.(ts|js)$", f)]
seen, stack = set(), list(roots)
while stack:
    f = stack.pop()
    if f in seen: continue
    seen.add(f)
    stack.extend(graph.get(f, ()))

prefix = sys.argv[1] if len(sys.argv) > 1 else ""
dead = sorted(f for f in files if f not in seen and f.startswith(prefix))
for f in dead: print(f)
print(f"# {len(dead)} unreachable of {len(files)} files ({len(roots)} roots)", file=sys.stderr)
