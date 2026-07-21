import pdfplumber, re, json

pdf = pdfplumber.open(r"c:\Users\User\Desktop\Horarios x ciclos 2026-I 15 abril 2026.pdf")

HOUR_MAP = {
    "7-8": "07:00 - 08:00", "8-9": "08:00 - 09:00", "9-10": "09:00 - 10:00",
    "10-11": "10:00 - 11:00", "11-12": "11:00 - 12:00", "12-1": "12:00 - 13:00",
    "1-2": "13:00 - 14:00", "2-3": "14:00 - 15:00", "3-4": "15:00 - 16:00",
    "4-5": "16:00 - 17:00", "5-6": "17:00 - 18:00", "6-7": "18:00 - 19:00",
}
DIAS_ORDER = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"]
BLOQUES = [
    "07:00 - 08:00","08:00 - 09:00","09:00 - 10:00","10:00 - 11:00",
    "11:00 - 12:00","12:00 - 13:00","13:00 - 14:00","14:00 - 15:00",
    "15:00 - 16:00","16:00 - 17:00","17:00 - 18:00","18:00 - 19:00",
    "19:00 - 20:00","20:00 - 21:00"
]

def normalize(s):
    if not s: return ""
    reps = {"é":"e","á":"a","í":"i","ó":"o","ú":"u","ñ":"n",
            "É":"E","Á":"A","Í":"I","Ó":"O","Ú":"U","Ñ":"N"}
    for k,v in reps.items(): s = s.replace(k,v)
    return s

NAME_ALIASES = {
    "paul cotrinacastellanos": "Paul Cotrina Castellanos",
    "paul cotrina catellanos": "Paul Cotrina Castellanos",
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

schedule = {}

for page_idx, page in enumerate(pdf.pages):
    tables = page.extract_tables()
    if len(tables) < 2:
        continue

    # Parse docente list from table 0
    docente_map = {}
    for row in tables[0][1:]:
        if row[1] and row[1].strip().isdigit():
            num = int(row[1].strip())
            name = (row[2] or "").strip()
            if name:
                docente_map[num] = canon_name(name)

    # Use word-level extraction for the schedule grid
    words = page.extract_words(x_tolerance=3, y_tolerance=3)

    # Find HORA header to locate grid start
    day_headers = {}
    hora_y = None
    for w in words:
        txt = normalize(w["text"]).upper()
        if txt == "HORA" and hora_y is None:
            hora_y = w["top"]

    if hora_y is None:
        continue

    # Find day column centers from header row
    for w in words:
        if abs(w["top"] - hora_y) > 5:
            continue
        txt = normalize(w["text"]).upper()
        cx = (w["x0"] + w["x1"]) / 2
        if "LUN" in txt: day_headers["Lunes"] = cx
        elif "MART" in txt: day_headers["Martes"] = cx
        elif "MI" in txt and "RCOL" in txt: day_headers["Miercoles"] = cx
        elif "JUEV" in txt: day_headers["Jueves"] = cx
        elif "VIER" in txt: day_headers["Viernes"] = cx
        elif "SAB" in txt: day_headers["Sabado"] = cx

    # Build column boundaries (midpoints between adjacent headers)
    sorted_days = sorted(day_headers.items(), key=lambda x: x[1])
    col_ranges = {}
    for i, (day, cx) in enumerate(sorted_days):
        left = (sorted_days[i-1][1] + cx) / 2 if i > 0 else cx - 60
        right = (cx + sorted_days[i+1][1]) / 2 if i < len(sorted_days)-1 else cx + 60
        col_ranges[day] = (left, right)

    # Get grid words below header
    grid_words = [w for w in words if w["top"] > hora_y + 8]

    # Group words into rows by y-position
    row_groups = {}
    for w in grid_words:
        y_key = round(w["top"] / 11) * 11
        row_groups.setdefault(y_key, []).append(w)

    # For each row, identify hour label and assign words to day columns
    prev_doc = {}  # day -> last docente number
    past_midday = False

    for y_key in sorted(row_groups.keys()):
        row_words = sorted(row_groups[y_key], key=lambda w: w["x0"])

        # Find hour label (leftmost, usually x < 90)
        hora_label = None
        for w in row_words:
            if w["x0"] < 90 and re.match(r"^\d{1,2}-\d{1,2}$", w["text"]):
                hora_label = w["text"]
                break

        if hora_label:
            if hora_label in ("1-2", "2-3", "3-4"):
                past_midday = True

            if hora_label == "7-8" and past_midday:
                bloque = "19:00 - 20:00"
            elif hora_label == "8-9" and past_midday:
                bloque = "20:00 - 21:00"
            else:
                bloque = HOUR_MAP.get(hora_label)
        else:
            bloque = None  # continuation row (sub-row), use previous bloque
            # For sub-rows without an hour label, we still need to process
            # but they belong to the same time slot as the previous labeled row

        if bloque is None:
            continue  # skip sub-rows for now

        # Assign words to day columns
        for day, (left, right) in col_ranges.items():
            day_words = [w for w in row_words if left <= (w["x0"] + w["x1"])/2 <= right]
            if not day_words:
                # No content in this cell, could mean empty
                # Only clear prev_doc if this is a labeled row
                if hora_label:
                    # Check if truly empty (no words at all in range)
                    any_word = any(left <= w["x0"] <= right for w in row_words)
                    if not any_word:
                        prev_doc[day] = None
                continue

            cell_text = " ".join(w["text"] for w in sorted(day_words, key=lambda w: w["x0"]))

            # Extract docente numbers
            found_docs = []

            # Check for leading number: "1", "3 (posgrado", "8 Practica", "5 Teoria"
            m = re.match(r"^(\d{1,2})\b", cell_text.strip())
            if m:
                n = int(m.group(1))
                if 1 <= n <= 13:
                    found_docs.append(n)
                    prev_doc[day] = n

            # Check for "I-N" or "I I - N" pattern
            if not found_docs:
                m = re.match(r"^I[\s\-I]*(\d+)", cell_text.strip())
                if m:
                    n = int(m.group(1))
                    if 1 <= n <= 13:
                        found_docs.append(n)
                        prev_doc[day] = n

            # Check for room continuation: Lab. N, (posgrado, Lab. Fisica
            if not found_docs:
                is_room = bool(re.match(r"^(\(posgrado|Lab\.?\s|Audiovisuales)", cell_text.strip(), re.IGNORECASE))
                if is_room and day in prev_doc and prev_doc[day]:
                    found_docs.append(prev_doc[day])

            # Check for noise (Taller, ESTUDIOS, etc.) - clear prev
            if not found_docs:
                if re.match(r"^(Taller|ESTUDIOS|GENERALES|Ing\.)", cell_text.strip(), re.IGNORECASE):
                    prev_doc[day] = None

            # Record found slots
            for dn in found_docs:
                if dn in docente_map:
                    name = docente_map[dn]
                    if name not in schedule:
                        schedule[name] = set()
                    schedule[name].add((day, bloque))

    print(f"Page {page_idx+1}: {len(docente_map)} docentes, cols: {list(day_headers.keys())}")

# Ensure minimum 2 consecutive hours per day
fixes = 0
for name in schedule:
    by_day = {}
    for d, b in schedule[name]:
        by_day.setdefault(d, set()).add(b)
    for dia, bloques in by_day.items():
        for b in list(bloques):
            idx = BLOQUES.index(b)
            has_prev = idx > 0 and BLOQUES[idx-1] in bloques
            has_next = idx < len(BLOQUES)-1 and BLOQUES[idx+1] in bloques
            if not has_prev and not has_next:
                add = BLOQUES[idx+1] if idx < len(BLOQUES)-1 else BLOQUES[idx-1]
                bloques.add(add)
                schedule[name].add((dia, add))
                fixes += 1

print(f"\nFixes (min 2h consecutivas): {fixes}")
total = sum(len(v) for v in schedule.values())
print(f"Total bloques: {total}")

# Print summary
print(f"\n{'DOCENTE':<40} {'HORAS':>6}")
print("-" * 48)
for name in sorted(schedule.keys(), key=lambda x: normalize(x)):
    slots = schedule[name]
    by_day = {}
    for d, b in slots:
        by_day.setdefault(d, []).append(b)
    days = ", ".join(f"{d[:3]}:{len(by_day[d])}" for d in DIAS_ORDER if d in by_day)
    print(f"{name:<40} {len(slots):>4}  {days}")

# Save
output = {}
for name, slots in schedule.items():
    output[name] = [{"dia": d, "bloque": b} for d,b in sorted(slots)]
with open(r"C:\Users\User\Desktop\horarios_unt\scripts\horario-parsed.json", "w", encoding="utf-8") as f:
    json.dump(output, f, ensure_ascii=False, indent=2)
print(f"\nJSON guardado")
