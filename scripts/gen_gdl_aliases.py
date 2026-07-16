# -*- coding: utf-8 -*-
"""Gera src/data/gdlAliases.ts a partir da saída do Mapeador-GDL + catálogo do app.

Reexecutável: rode de novo quando o mapeamento_REP_*.json (Mapeador-GDL) ou o
public/data/weaponCatalog.json (app) mudar.

Uso:
    python scripts/gen_gdl_aliases.py
    python scripts/gen_gdl_aliases.py "C:/Users/dreic/Mapeador-GDL/saida/mapeamento_REP_XXX.json"

Sem argumento, procura o mapeamento_REP_*.json mais recente em ../Mapeador-GDL/saida.
Para acrescentar/ajustar variações de grafia (app -> string exata do GDL), edite o
dicionário CURADO abaixo e rode de novo.
"""
import json, sys, unicodedata, os, glob

sys.stdout.reconfigure(encoding="utf-8")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # .../Municao-DB


def achar_mapeamento():
    if len(sys.argv) > 1:
        return sys.argv[1]
    cand = os.path.join(ROOT, "..", "Mapeador-GDL", "saida", "mapeamento_REP_*.json")
    arquivos = sorted(glob.glob(cand), key=os.path.getmtime)
    if not arquivos:
        print(f"[ERRO] Nenhum mapeamento encontrado em {cand}")
        print("       Rode o Mapeador-GDL primeiro ou passe o caminho como argumento.")
        sys.exit(1)
    return arquivos[-1]


MAP = achar_mapeamento()
M   = json.load(open(MAP, encoding="utf-8"))
cat = json.load(open(os.path.join(ROOT, "public/data/weaponCatalog.json"), encoding="utf-8"))
print(f"[i] mapeamento: {MAP}")


def lista(tipo, label):
    for _, l in M["tipos"][tipo]["listas"].items():
        if l.get("label") == label:
            return [o for o in l["opcoes"] if o not in ("Selecione", "Selecione um Tipo", "")]
    return []


def norm(s):
    s = unicodedata.normalize("NFKD", str(s)).encode("ascii", "ignore").decode().lower()
    for ch in ".,/-()'":
        s = s.replace(ch, " ")
    s = s.replace("&", " and ")
    return " ".join(s.split())


marcas_gdl = lista("REVÓLVER(ES)", "Marca da Arma")
gdl_set    = set(marcas_gdl)
gdl_simple = {}
for g in marcas_gdl:
    gdl_simple.setdefault(norm(g), g)

cat_marcas = sorted(set(w["marca"] for w in cat))

# ── Variações de grafia conferidas manualmente (app -> string EXATA do GDL) ──
CURADO = {
    "Accuracy International": "Accuracy Intl. Ltd.",
    "Amadeo Rossi":          "Rossi",
    "Armsan":                "ARMSAN (Turkey)",
    "Astra":                 "Astra, Espana",
    "Auto-Ordnance":         "Auto Ordnance",
    "Barrett":               "Barrett Firearms Mfg Co.",
    "Beretta":               "Beretta (FI Industries)",
    "Bernardelli":           "Bernardelli, vincenzo",
    "Bersa":                 "Bersa/bersa piccola",
    "Bushmaster":            "Bushmaster Firearms",
    "CZ":                    "Ceska Zbrojovka",
    "Canik":                 "Canik (Turkey)",
    "Chiappa":               "Chiappa Firearms",
    "Cimarron":              "Cimarron Arms",
    "DPMS":                  "DPMS Panther Arms",
    "Freedom Arms":          "Freedom arms co.",
    "Hatsan":                "Hatsan Arms Co. (Turkey)",
    "Heritage":              "Heritage mfg. inc.",
    "IWI":                   "Israel Weapon Industries (IWI)",
    "Kalashnikov":           "Kalashnikov Concern JSC",
    "KRISS":                 "Kriss USA Inc.",
    "Korth":                 "Korth W.",
    "Llama":                 "Llama (Gabilondo & Cia)",
    "Magnum Research":       "Magnum Research, Inc.",
    "Manurhin":              "Manurhin s.a.",
    "Norinco":               "Norinco (China North Industries Corporation)",
    "Remington":             "Remington arms co.",
    "Smith & Wesson":        "Smith and Wesson",
    "Springfield Armory":    "Springfield Armory, Geneseo, IL",
    "Stoeger":               "Stoeger arms",
    "Tisas":                 "TISAS (Trabzon Gun Industry Corp.)",
    "UTAS":                  "UTAS, Turkey",
    "Uberti":                "Uberti, aldo",
    "Weihrauch":             "Weihrauch Hermann",
}
for app_b, gdl_b in CURADO.items():
    assert gdl_b in gdl_set, f"CURADO invalido: {app_b!r} -> {gdl_b!r} nao existe no GDL"

# ── app -> GDL (envio): exato > caixa/acento > curado ──
app_para_gdl = {}
sem_equiv = []
for cm in cat_marcas:
    if cm in gdl_set:
        continue
    elif norm(cm) in gdl_simple:
        app_para_gdl[cm] = gdl_simple[norm(cm)]
    elif cm in CURADO:
        app_para_gdl[cm] = CURADO[cm]
    else:
        sem_equiv.append(cm)

# ── GDL -> app (importação) ──
gdl_para_app = {}
for cm in cat_marcas:
    gdl_para_app[norm(cm)] = cm
for app_b, gdl_b in CURADO.items():
    gdl_para_app[norm(gdl_b)] = app_b

# ── País: adjetivo (GDL) <-> substantivo (app) ──
PAIS_GDL_PARA_APP = {
    "Alemã": "Alemanha", "argentina": "Argentina", "austríaca": "Áustria",
    "Belga": "Bélgica", "brasileira": "Brasil", "canadense": "Canadá",
    "Chinesa": "China", "czechoslovakia": "Tchecoslováquia", "espanhola": "Espanha",
    "Estadunidense": "Estados Unidos", "filipena": "Filipinas", "finlandesa": "Finlândia",
    "Francesa": "França", "Israelense": "Israel", "italiana": "Itália",
    "mexicana": "México", "Não Aparente": "", "Russa": "Rússia",
    "sul-coreana": "Coreia do Sul", "Turca": "Turquia",
}
PAIS_APP_PARA_GDL = {}
for adj, subst in PAIS_GDL_PARA_APP.items():
    if subst:
        PAIS_APP_PARA_GDL.setdefault(subst, adj)

# ── Marca de munição: app -> GDL (dropdown de cartucho só tem 9) ──
import re
marca_cart_gdl = lista("CARTUCHO(S)", "Marca de Cartucho")
MUNICAO_CURADO = {"Sellier & Bellot": "S&B"}
municao_app_para_gdl = {}
cart_simple = {norm(g): g for g in marca_cart_gdl}
consts = open(os.path.join(ROOT, "src/data/constants.ts"), encoding="utf-8").read()
mblock = re.search(r"FABRICANTES_MUNICAO:\s*string\[\]\s*=\s*\[(.*?)\]", consts, re.S).group(1)
app_mun = re.findall(r'"([^"]+)"', mblock)
for a in app_mun:
    if a in ("Indeterminado", "Outro"):
        continue
    if a in marca_cart_gdl:
        continue
    if norm(a) in cart_simple:
        municao_app_para_gdl[a] = cart_simple[norm(a)]
    elif a in MUNICAO_CURADO:
        municao_app_para_gdl[a] = MUNICAO_CURADO[a]

# ── Marca de munição: GDL -> app (importação) ──
municao_gdl_para_app = {}
for g in marca_cart_gdl:
    if g == "Não Aparente":
        municao_gdl_para_app[g] = ""            # não é marca
    elif g == "S&B":
        municao_gdl_para_app[g] = "Sellier & Bellot"
    else:
        # CBC/Federal/Winchester/PMC/Aguila já existem no app; FMFLB/SP são
        # adicionados ao FABRICANTES_MUNICAO. Identidade nos dois casos.
        municao_gdl_para_app[g] = g

PLACEHOLDERS = ["Selecione", "Selecione um Tipo", "Não Aparente", "NÃO APARENTE",
                "Eficiente", "Deficiente", "(Arma Artesanal)", "(Fabricante Desconhecido)"]

CALIBRES = {
    "REVÓLVER":   lista("REVÓLVER(ES)", "Calibre Nominal Revolver"),
    "PISTOLA":    lista("PISTOLA(S)", "Calibre Nominal Pistola"),
    "ESPINGARDA": lista("ESPINGARDA(S)", "Calibre Nominal Espingarda"),
    "CARTUCHO":   lista("CARTUCHO(S)", "Calibre Nominal Cartucho"),
}

# ── Mapa de campos por tipo (label → sufixo do control ctlNN) ──
# Os índices ctlNN mudam por tipo (FUZIL/REVÓLVER têm campos extras que deslocam a
# numeração). Este mapa deixa a importação ler acabamento/funcionamento/calibre pelo
# tipo correto em vez de índice fixo.
_ROLE = {
    "Tipo Acabamento": "acabamento",
    "Funcionamento": "funcionamento",
    "Estado Geral da Arma": "estadoGeral",
    "Status do Número de Série": "statusSerie",
    "Marca da Arma": "marcaDropdown",
    "Marca de Cartucho": "marcaDropdown",   # munição usa este dropdown p/ a marca
    "Fabricação da Arma": "pais",
    "Tambor": "tambor",
    "Resultado PSA": "resultadoPSA",
    "ORIGEM/COLETA": "origemColeta",
    # CheckBoxList "Institucional?" (mesmo grupo Indeterminado/NÃO/SIM em todo tipo).
    "SIM": "institucionalSim",
    "NÃO": "institucionalNao",
}

def _sufixo_ctl(name):
    m = re.search(r"(\$ctl\d+\$(?:ddlField|txtField|ckbListField\$\d+))$", name or "")
    return m.group(1) if m else None

CAMPOS_POR_TIPO = {}
for tipo, info in M["tipos"].items():
    roles = {}
    for c in info.get("campos", []):
        lab = c.get("label", "")
        role = _ROLE.get(lab)
        if lab.startswith("Calibre Nominal"):
            role = "calibreDropdown"
        if role:
            suf = _sufixo_ctl(c.get("name", ""))
            if suf:
                roles[role] = suf
    if roles:
        CAMPOS_POR_TIPO[tipo] = roles

FUNCIONAMENTO = lista("REVÓLVER(ES)", "Funcionamento")
ACABAMENTO    = lista("REVÓLVER(ES)", "Tipo Acabamento")

# ── Calibres do picker do app, por tipo (parseado de AllPickers.tsx) ──
# Permite casar o calibre extraído do TEXTO livre da identificação com a opção
# exata do app (ex.: "CAL .44 MAGNUM" → ".44 Magnum"). Reexecutar após editar o picker.
_allpickers = open(os.path.join(ROOT, "src/components/AllPickers.tsx"), encoding="utf-8").read()
_calfn = re.search(r"const calibreOptions = \(\) => \{(.*?)\n  \}", _allpickers, re.S)
CALIBRES_APP = {}
if _calfn:
    for mo in re.finditer(r"if \((.*?)\)\s*return \[(.*?)\]", _calfn.group(1), re.S):
        cond, arr = mo.group(1), mo.group(2)
        tipos_app = re.findall(r'weapon\.type === "([^"]+)"', cond)
        labels = [l.replace('\\"', '"') for l in re.findall(r'\{\s*l:\s*"((?:[^"\\]|\\.)*)"', arr)]
        labels = [l for l in labels if l not in ("Outro", "Indeterminado")]
        for t in tipos_app:
            CALIBRES_APP[t] = labels
# ESTOJO compartilha a lista do CARTUCHO no picker (bloco "ESTOJO || CARTUCHO").
if "CARTUCHO" in CALIBRES_APP and "ESTOJO" not in CALIBRES_APP:
    CALIBRES_APP["ESTOJO"] = CALIBRES_APP["CARTUCHO"]


def js(obj):
    return json.dumps(obj, ensure_ascii=False, indent=2)


ts = f"""// ⚙️ ARQUIVO GERADO por scripts/gen_gdl_aliases.py a partir de:
//    Mapeador-GDL/saida/mapeamento_REP_*.json  +  public/data/weaponCatalog.json
// Regenerar quando o mapeamento do GDL ou o catálogo mudar:
//    python scripts/gen_gdl_aliases.py
// NÃO editar à mão os blocos automáticos; ajuste o dicionário CURADO no gerador.
//
// Cobertura de marcas de arma:
//   {len(cat_marcas)} marcas no catálogo do app
//   {len(app_para_gdl)} precisam de tradução p/ o GDL (caixa/acento + variações curadas)
//   {len(sem_equiv)} sem equivalente no GDL (passam sem alteração) — ver SEM_EQUIVALENTE_GDL

// GDL (qualquer grafia, normalizada) → marca canônica do app. Usado na IMPORTAÇÃO.
export const MARCA_GDL_PARA_APP: Record<string, string> = {js(gdl_para_app)}

// Marca canônica do app → string EXATA do dropdown do GDL. Usado no ENVIO.
export const MARCA_APP_PARA_GDL: Record<string, string> = {js(app_para_gdl)}

// Marcas do app que não existem no dropdown do GDL (revisar manualmente se necessário).
export const SEM_EQUIVALENTE_GDL: string[] = {js(sorted(sem_equiv))}

// País: adjetivo (GDL) → substantivo (app). Usado na IMPORTAÇÃO.
export const PAIS_GDL_PARA_APP: Record<string, string> = {js(PAIS_GDL_PARA_APP)}

// País: substantivo (app) → adjetivo (GDL). Usado no ENVIO.
export const PAIS_APP_PARA_GDL: Record<string, string> = {js(PAIS_APP_PARA_GDL)}

// Marca de munição do app → dropdown de cartucho do GDL (só 9 opções). Usado no ENVIO.
export const MARCA_MUNICAO_APP_PARA_GDL: Record<string, string> = {js(municao_app_para_gdl)}

// Marca de munição do GDL → fabricante de munição do app. Usado na IMPORTAÇÃO.
export const MARCA_MUNICAO_GDL_PARA_APP: Record<string, string> = {js(municao_gdl_para_app)}

// Valores que o GDL devolve mas NÃO são marca/país reais (placeholders/estado que vazam de coluna).
export const PLACEHOLDERS_GDL: string[] = {js(PLACEHOLDERS)}

// Calibres nominais oficiais do GDL, por tipo de peça.
export const CALIBRES_GDL: Record<string, string[]> = {js(CALIBRES)}

// Sufixo do control (ctlNN) de cada campo, POR TIPO do GDL (o índice muda por tipo).
// Usado na importação p/ ler acabamento/funcionamento/calibre no campo certo.
export const CAMPOS_GDL_POR_TIPO: Record<string, Record<string, string>> = {js(CAMPOS_POR_TIPO)}

// Opções do dropdown "Funcionamento" e "Tipo Acabamento" do GDL.
export const FUNCIONAMENTO_GDL: string[] = {js(FUNCIONAMENTO)}
export const ACABAMENTO_GDL: string[] = {js(ACABAMENTO)}

// Calibres do picker do app, por tipo (parseado de AllPickers.tsx). Usado para casar
// o calibre extraído do texto livre da identificação com a opção exata do app.
export const CALIBRES_APP_POR_TIPO: Record<string, string[]> = {js(CALIBRES_APP)}
"""

out = os.path.join(ROOT, "src/data/gdlAliases.ts")
open(out, "w", encoding="utf-8").write(ts)
print("[OK] gerado:", out)
print(f"     marcas app={len(cat_marcas)}  app->gdl={len(app_para_gdl)}  "
      f"sem_equiv={len(sem_equiv)}  gdl->app keys={len(gdl_para_app)}  municao={len(municao_app_para_gdl)}")
