#!/usr/bin/env python3
"""
Reproducible scan of PUBLIC storefront source for hardcoded / demo content (P2 audit).
Scope: src/app (minus (admin), (superadmin), (marketing), api), src/components (minus admin,
marketing, superadmin), src/shared, src/contains, src/data, src/hooks, src/utils.
Usage: python3 scripts/audit/storefront-content-scan.py [--summary]
Prints file:line:category:text. It only FINDS candidates; each one is classified by hand in
PLATFORM_AUDIT_PROGRESS.md (P2 inventory).
"""
import os, re, sys

ROOTS = ["src/app", "src/components", "src/shared", "src/contains", "src/data", "src/hooks", "src/utils"]
EXCLUDE = re.compile(r"src/app/\((admin|superadmin|marketing)\)|src/app/api/|src/components/(admin|marketing|superadmin)/|src/app/\(admin\)")
CHECKS = [
    ("demo-data-import", re.compile(r"""from\s+['"]@/(contains/(fakeData|contants)|data/[^'"]*)['"]""")),
    ("stock-photo", re.compile(r"unsplash\.com|pexels\.com|picsum\.photos|placeimg|loremflickr", re.I)),
    ("static-image-import", re.compile(r"""from\s+['"]@/images/""")),
    ("lorem", re.compile(r"lorem ipsum", re.I)),
    ("fake-identity", re.compile(r"\b(John Doe|Jane Doe|Eden Smith|Enrico Cole|Jordan Smith|Ciseco|ciseco|Tony Nguyen|Alex Chen|Priya Nair)\b")),
    ("placeholder-contact", re.compile(r"@gmail\.com|@example\.com|\(?\+?\d{1,3}\)?[ -]?\d{3}[ -]\d{3}[ -]\d{3,4}|Los Angeles|New York, NY|1234 ")),
    ("money-claim", re.compile(r"""['">][^'"<>]*(\$\d|USD|Rs\.?\s?\d|PKR\s?\d)[^'"<>]*['"<]""")),
    ("policy-claim", re.compile(r"free shipping|free delivery|\d+[- ]day(s)? (return|refund|exchange)|money[- ]back|guarantee", re.I)),
    ("stat-claim", re.compile(r"""['">]\s*[\d.,]+\s?(k|K|M)?\+\s*['"<]|\b\d{2,}[kKmM]?\+?\s+(customers|users|products|orders|reviews|clients|stores)\b|happy customers""", re.I)),
    ("rating-claim", re.compile(r"\b[45]\.\d\s*(\(|stars?|rating)|\(\d+ reviews?\)", re.I)),
    ("promo-copy", re.compile(r"up to \d+%|\d+% off|gift card|sale ends|limited time|special offer|earn free", re.I)),
    ("fallback-prop", re.compile(r"""=\s*(DEMO_|DEMO\b|demo[A-Z_]|_get[A-Z][a-zA-Z]*Rd\(|PRODUCTS\b|DEFAULT_[A-Z_]*(DATA|ITEMS|SLIDES|CATEGORIES|REVIEWS))""")),
    ("undefined-fallback", re.compile(r"\.length\s*\?\s*[\w.]+\s*:\s*undefined")),
    ("rating-fallback", re.compile(r"""(\|\||\?\?)\s*['"][0-9]\.[0-9]['"]""")),
    ("long-copy-fallback", re.compile(r"""(rating|review|subtitle|description|desc)\w*\s*(\|\||\?\?)\s*['"`][A-Z][^'"`]{18,}['"`]""")),
]

def files():
    for root in ROOTS:
        if not os.path.isdir(root): continue
        for d, _, fs in os.walk(root):
            for f in fs:
                if f.endswith((".ts", ".tsx")):
                    p = os.path.join(d, f)
                    if not EXCLUDE.search(p): yield p

hits = []
for p in sorted(files()):
    for i, line in enumerate(open(p, encoding="utf8"), 1):
        for cat, rx in CHECKS:
            if rx.search(line):
                hits.append((p, i, cat, line.strip()[:160]))
if "--summary" in sys.argv:
    from collections import Counter
    for (p, c), n in sorted(Counter((h[0], h[2]) for h in hits).items()):
        print(f"{n:3d}  {c:20s} {p}")
    print(f"TOTAL {len(hits)} hits in {len({h[0] for h in hits})} files")
else:
    for h in hits: print(f"{h[0]}:{h[1]}:{h[2]}: {h[3]}")
