import pdfplumber, re, json

pdf = pdfplumber.open(r"c:\Users\User\Desktop\Horarios x ciclos 2026-I 15 abril 2026.pdf")

HOUR_MAP = {
    "7-8": "07:00 - 08:00", "8-9": "08:00 - 09:00", "9-10": "09:00 - 10:00",
    "10-11": "10:00 - 11:00", "11-12": "11:00 - 12:00", "12-1": "12:00 - 13:00",
    "1-2": "13:00 - 14:00", "2-3": "14:00 - 15:00", "3-4": "15:00 - 16:00",
    "4-5": "16:00 - 17:00", "5-6": "17:00 - 18:00", "6-7": "18:00 - 19:00",
}

DIAS_ORDER = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"]

def normalize(s):
    if not s: return ""
    reps = {"é":"e","á":"a","í":"i","ó":"o","ú":"u","ñ":"n",
            "É":"E","Á":"A","Í":"I","Ó":"O","Ú":"U","Ñ":"N"}
    for k,v in reps.items():
        s = s.replace(k,v)
    return s

# Returns docente number if cell starts with one, else None
def get_leading_docente_num(cell):
    if not cell:
        return None
    for line in cell.split("\n"):
        line = line.strip()
        m = re.match(r"^(\d{1,2})\b", line)
        if m:
            n = int(m.group(1))
            if 1 <= n <= 13:
                return n
    return None

# Returns True if cell is a "room continuation" label (Lab. N, posgrado, Fisica, etc.)
def is_room_continuation(cell):
    if not cell or not cell.strip():
        return False
    c = cell.strip()
    patterns = [
        r"^\(posgrado",
        r"^Lab\.?\s*\d",
        r"^Lab\.?\s*Fisica",
        r"^Audiovisuales$",
    ]
    for p in patterns:
        if re.match(p, c, re.IGNORECASE):
            return True
    return False

# Returns True if cell should clear the continuation (empty or irrelevant)
def is_empty_or_noise(cell):
    if not cell or not cell.strip():
        return True
    c = cell.strip()
    noise = [r"^Taller", r"^ESTUDIOS", r"^GENERALES", r"^Ing\.\s", r"^None$"]
    for p in noise:
        if re.match(p, c, re.IGNORECASE):
            return True
    return False

# Returns list of (docente_num) found in cell, using continuation logic
def parse_cell(cell, prev_doc):
    if not cell or not cell.strip():
        return [], None  # (found_nums, new_prev_doc)

    lines = cell.split("\n") if "\n" in cell else [cell]
    found = []
    last_doc = None

    for line in lines:
        line = line.strip()
        if not line:
            continue

        # Check for leading docente number: "3 Lab1", "8 Practica", "5", etc.
        m = re.match(r"^(\d{1,2})\b", line)
        if m:
            n = int(m.group(1))
            if 1 <= n <= 13:
                found.append(n)
                last_doc = n
            continue

        # Check for room continuation (Lab. N, posgrado, etc.)
        if is_room_continuation(line):
            if prev_doc and prev_doc not in found:
                found.append(prev_doc)
                last_doc = prev_doc
            continue

        # Noise patterns - ignore
        if is_empty_or_noise(line):
            continue

        # "I-4", "I I - 2" pattern
        m2 = re.match(r"^I[\s\-I]*(\d+)", line)
        if m2:
            n = int(m2.group(1))
            if 1 <= n <= 13:
                found.append(n)
                last_doc = n

    new_prev = last_doc if last_doc else (prev_doc if found else None)
    return found, new_prev

# Canonical name mapping for deduplication
NAME_ALIASES = {
    "paul cotrinacastellanos": "Paul Cotrina Castellanos",
    "paul cotrina catellanos": "Paul Cotrina Castellanos",
    "paul cotrina castellanos": "Paul Cotrina Castellanos",
    "juan carlos obando roldan": "Juan Carlos Obando Roldan",
}

def norm_for_alias(name):
    return re.sub(r'\s+', ' ', normalize(name).strip().lower())

seen_normalized = {}  # norm_name -> first canonical name

def canon_name(name):
    n = norm_for_alias(name)
    if n in NAME_ALIASES:
        return NAME_ALIASES[n]
    if n in seen_normalized:
        return seen_normalized[n]
    seen_normalized[n] = name.strip()
    return name.strip()

schedule = {}

for page_idx, page in enumerate(pdf.pages):
    tables = page.extract_tables()
    if len(tables) < 2:
        continue

    # Parse docente list
    docente_map = {}
    for row in tables[0][1:]:
        if row[1] and row[1].strip().isdigit():
            num = int(row[1].strip())
            name = (row[2] or "").strip()
            if name:
                docente_map[num] = canon_name(name)

    print(f"=== PAGE {page_idx+1} docentes ===")
    for k,v in sorted(docente_map.items()):
        print(f"  {k}: {v}")

    # Parse schedule grid
    grid = tables[1]
    header = grid[0]

    day_cols = {}
    for ci, h in enumerate(header):
        if h:
            h_n = normalize(h).strip().upper()
            if "LUN" in h_n: day_cols["Lunes"] = ci
            elif "MART" in h_n: day_cols["Martes"] = ci
            elif "MI" in h_n: day_cols["Miercoles"] = ci
            elif "JUEV" in h_n: day_cols["Jueves"] = ci
            elif "VIER" in h_n: day_cols["Viernes"] = ci
            elif "SAB" in h_n: day_cols["Sabado"] = ci

    # Track previous docente per column for continuation
    prev_doc_per_col = {ci: None for ci in day_cols.values()}
    past_midday = False

    for row in grid[1:]:
        hora_raw = (row[0] or "").strip()
        if not hora_raw:
            continue

        if hora_raw in ("1-2", "2-3", "3-4"):
            past_midday = True

        if hora_raw == "7-8" and past_midday:
            bloque = "19:00 - 20:00"
        elif hora_raw == "8-9" and past_midday:
            bloque = "20:00 - 21:00"
        else:
            bloque = HOUR_MAP.get(hora_raw)

        if not bloque:
            continue

        for dia, ci in day_cols.items():
            parts = []
            if ci < len(row) and row[ci]:
                parts.append(row[ci])
            # Check adjacent merged column
            if ci + 1 < len(row) and (ci + 1) not in day_cols.values():
                if row[ci + 1] and row[ci + 1].strip():
                    parts.append(row[ci + 1])

            combined = "\n".join(parts) if parts else ""

            doc_nums, new_prev = parse_cell(combined, prev_doc_per_col.get(ci))

            if new_prev is not None:
                prev_doc_per_col[ci] = new_prev
            elif is_empty_or_noise(combined):
                prev_doc_per_col[ci] = None

            for dn in doc_nums:
                if dn in docente_map:
                    name = docente_map[dn]
                    if name not in schedule:
                        schedule[name] = set()
                    schedule[name].add((dia, bloque))

print("\n\n========== HORARIO POR DOCENTE ==========\n")
total_hours = 0
for name in sorted(schedule.keys(), key=lambda x: normalize(x)):
    slots = sorted(schedule[name], key=lambda x: (DIAS_ORDER.index(x[0]) if x[0] in DIAS_ORDER else 99, x[1]))
    total_hours += len(slots)
    print(f"{name} ({len(slots)} horas):")
    for dia, bloque in slots:
        print(f"  {dia:<12} {bloque}")
    print()

print(f"Total docentes: {len(schedule)}")
print(f"Total horas asignadas: {total_hours}")

# Output as JSON for SQL generation
output = {}
for name, slots in schedule.items():
    output[name] = [{"dia": d, "bloque": b} for d,b in sorted(slots)]

with open(r"C:\Users\User\Desktop\horarios_unt\scripts\horario-parsed.json", "w", encoding="utf-8") as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print(f"\nJSON guardado en scripts/horario-parsed.json")
