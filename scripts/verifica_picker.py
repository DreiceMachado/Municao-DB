# -*- coding: utf-8 -*-
import json, re
from collections import defaultdict

src = open(r"c:/Users/dreic/Municao-DB/src/components/AllPickers.tsx", encoding="utf-8").read()
m = re.search(r"const calibreOptions = \(\) => \{(.*?)\n  \}\n", src, re.S)
body = m.group(1)

def norm(s):
    s = (s or "").lower().split("(")[0]
    s = s.replace("×", "x").replace(",", ".").replace("+p", "")
    return re.sub(r"\s+", "", s).strip()

tipos = {"REVÓLVER":"Revólver","PISTOLA":"Pistola","ESPINGARDA":"Espingarda",
 "CARABINA":"Carabina","FUZIL":"Fuzil","METRALHADORA":"Metralhadora",
 "SUBMETRALHADORA":"Submetralhadora","GARRUCHA":"Garrucha","PISTOLETE":"Pistolete"}

blocks = defaultdict(list)
for mt in re.finditer(r'weapon\.type === "([^"]+)"[^\[]*return \[(.*?)\n    \]', body, re.S):
    t = mt.group(1)
    # cada opcao: { l: "LABEL", d: "..." }  -> captura ate '", d:'
    labels = re.findall(r'l:\s*"(.*?)",\s*d:', mt.group(2))
    labels = [l.replace('\\"', '"') for l in labels]
    blocks[t].extend(labels)

d = json.load(open(r"c:/Users/dreic/Municao-DB/public/data/weaponCatalog.json", encoding="utf-8"))
byt = defaultdict(set)
for w in d:
    c = w.get("calibre_nominal")
    if c: byt[w.get("tipo")].add(c)

total = 0
for up, cat in tipos.items():
    opts = blocks.get(up)
    if not opts:
        print(f"### {up}: BLOCO NAO ENCONTRADO"); total += 999; continue
    pn = {norm(o) for o in opts}
    miss = sorted({c for c in byt.get(cat, set()) if norm(c) not in pn})
    total += len(miss)
    print(f"### {up}: {'OK ('+str(len(opts))+' opcoes)' if not miss else 'FALTA '+repr(miss)}")
print("\nTOTAL DESCASAMENTOS (arquivo real):", total)
