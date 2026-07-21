import pdfplumber, re, json

pdf = pdfplumber.open(r"c:\Users\User\Desktop\Horarios x ciclos 2026-I 15 abril 2026.pdf")

CICLOS = ["I", "III", "V", "VII", "IX"]

def normalize(s):
    if not s: return ""
    reps = {"é":"e","á":"a","í":"i","ó":"o","ú":"u","ñ":"n",
            "É":"E","Á":"A","Í":"I","Ó":"O","Ú":"U","Ñ":"N"}
    for k,v in reps.items(): s = s.replace(k,v)
    return s

NAME_ALIASES = {
    "paul cotrinacastellanos": "Paul Cotrina Castellanos",
    "paul cotrina catellanos": "Paul Cotrina Castellanos",
    "paul cotrina castellanos": "Paul Cotrina Castellanos",
    "juan carlos obando roldan": "Juan Carlos Obando Roldan",
    "cesar arellano salazar": "Cesar Arellano Salazar",
    "camilo suarez rebaza": "Camilo Suárez Rebaza",
    "jose gomez avila": "José Gómez Ávila",
    "oscar romel alcantara moreno": "Oscar Romel Alcántara Moreno",
    "robert jerry sanchez ticona": "Robert Jerry Sánchez Ticona",
    "juan pedro santos fernandez": "Juan Pedro Santos Fernández",
}
seen_normalized = {}

def canon_name(name):
    n = re.sub(r'\s+', ' ', normalize(name).strip().lower())
    if n in NAME_ALIASES:
        return NAME_ALIASES[n]
    if n in seen_normalized:
        return seen_normalized[n]
    seen_normalized[n] = name.strip()
    return name.strip()

def find_col(header, *keywords):
    for i, h in enumerate(header):
        if h:
            hn = normalize(h).strip().upper()
            for kw in keywords:
                if kw == hn or (len(kw) > 2 and kw in hn):
                    return i
    return None

all_assignments = []

for page_idx, page in enumerate(pdf.pages):
    tables = page.extract_tables()
    if len(tables) < 2:
        continue

    ciclo = CICLOS[page_idx] if page_idx < len(CICLOS) else f"?{page_idx}"
    table0 = tables[0]
    header = table0[0]

    col_num = 1  # Always N° at index 1
    col_prof = find_col(header, "PROFESOR", "DOCENTE")
    col_asig = find_col(header, "ASIGNATURA")
    col_t = find_col(header, "T. HORAS")
    if col_t is None:
        for i, h in enumerate(header):
            if h and h.strip() == "T" and i > (col_asig or 0):
                col_t = i
                break

    # Find T, P, L, G, T.HORAS by looking for the sequence after ASIGNATURA
    # Strategy: find "T. HORAS" first, then T/P/L/G are the 4 columns before it
    col_total = None
    for i, h in enumerate(header):
        if h and "HORAS" in (normalize(h).strip().upper()):
            col_total = i
            break

    if col_total and col_total >= 4:
        col_t = col_total - 4
        col_p = col_total - 3
        col_l = col_total - 2
        col_g = col_total - 1
    else:
        col_t = col_p = col_l = col_g = None

    print(f"\n=== PAGINA {page_idx+1} - CICLO {ciclo} ===")
    print(f"  col_num={col_num} col_prof={col_prof} col_asig={col_asig} col_t={col_t} col_p={col_p} col_l={col_l} col_g={col_g} col_total={col_total}")

    for row in table0[1:]:
        num_val = row[col_num] if col_num is not None and col_num < len(row) else None
        if not num_val or not num_val.strip().isdigit():
            continue

        num = int(num_val.strip())

        # Get name: join col_prof and next col if next is None in header (merged)
        name_parts = []
        if col_prof is not None and col_prof < len(row) and row[col_prof]:
            name_parts.append(row[col_prof].strip())
        # Check if next col after prof is None in header (merged col for name)
        if col_prof is not None and col_prof + 1 < len(header):
            if header[col_prof + 1] is None and col_prof + 1 < len(row) and row[col_prof + 1]:
                name_parts.append(row[col_prof + 1].strip())
        name = " ".join(name_parts).strip()
        if not name:
            continue
        name = canon_name(name)

        # Get course: join col_asig and adjacent None cols
        curso_parts = []
        if col_asig is not None and col_asig < len(row) and row[col_asig]:
            curso_parts.append(row[col_asig].strip())
        # Check cols after asig that are None in header
        if col_asig is not None:
            ci = col_asig + 1
            while ci < len(header) and header[ci] is None:
                if ci < len(row) and row[ci] and row[ci].strip():
                    curso_parts.append(row[ci].strip())
                ci += 1
        curso = " ".join(curso_parts).strip()

        def safe_get(idx):
            if idx is not None and idx < len(row) and row[idx]:
                return row[idx].strip()
            return ""

        t_h = safe_get(col_t)
        p_h = safe_get(col_p)
        l_h = safe_get(col_l)
        g_h = safe_get(col_g)
        total_h = safe_get(col_total)

        assignment = {
            "ciclo": ciclo,
            "num": num,
            "docente": name,
            "curso": curso,
            "t": t_h,
            "p": p_h,
            "l": l_h,
            "g": g_h,
            "total": total_h,
        }
        all_assignments.append(assignment)

print(f"\nTotal asignaciones: {len(all_assignments)}")
print(f"\n{'DOCENTE':<40} {'CURSO':<50} {'CICLO':>5} {'T':>3} {'P':>3} {'L':>3} {'G':>3} {'TOT':>4}")
print("-" * 155)
for a in sorted(all_assignments, key=lambda x: (x["ciclo"], x["num"])):
    print(f"{a['docente']:<40} {a['curso']:<50} {a['ciclo']:>5} {a['t']:>3} {a['p']:>3} {a['l']:>3} {a['g']:>3} {a['total']:>4}")

with open(r"C:\Users\User\Desktop\horarios_unt\scripts\cursos-docentes.json", "w", encoding="utf-8") as f:
    json.dump(all_assignments, f, ensure_ascii=False, indent=2)

print(f"\nJSON guardado en scripts/cursos-docentes.json")
