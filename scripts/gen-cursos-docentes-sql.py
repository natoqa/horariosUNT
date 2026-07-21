import json, re

PERIODO_ID = "b59f7c27-3f9e-492f-b570-da694b1e5018"

NAME_TO_ID = {
    "Marcelino Torres Villanueva": "4baed0ce-5a38-467a-aaba-add2753183f4",
    "Alberto Mendoza de los Santos": "576df7de-868e-49c0-8cd6-c3b90b462f3a",
    "Paul Cotrina Castellanos": "17f35b7c-eb0d-4b0c-aec9-53fc3536fbd0",
    "Bertha Urtecho Zavaleta": "a10032e7-fcf1-4de5-86a9-e710b59c8425",
    "Jose Luis Ponte Bejarano": "245d4a73-40f7-4d63-ab6a-3ab86a918c65",
    "Jorge Luis Rios Gonzales": "16983c8a-5782-45fa-ba6c-ea29f70871de",
    "Segundo Guibar Obeso": "a66d3adb-79e4-4efd-bb46-a15826f99894",
    "Miguel Ipanaque Zapata": "4bb4e617-a4af-4eb9-ad1a-88157bd709cd",
    "Martha Cardoso": "89442c73-703a-4d0d-81d4-d9768feaff75",
    "Zoraida Vidal Melgarejo": "d04f1011-c31f-4c9d-a7bc-1fc962d8fffd",
    "Everson David Agreda Gamboa": "2779fcc3-684e-4b74-a059-26b2d945ac89",
    "Juan Carlos Obando Roldan": "22a0ef1c-8d41-4f60-908d-233a707a5291",
    "Marcos Ferrer Reyna": "61da9b38-f602-4ef7-856b-3be710515b4f",
    "Teresita Rojas Garcia": "30ae5fa9-bbba-49d7-a4ea-b90ae237a2ec",
    "Juan Carrascal Cabanillas": "3808a4e0-a59d-46e0-94d5-54756138fbe4",
    "Vilma Mendez Gil": "53741d94-f669-4fe0-aaed-510507d2fc50",
    "Sheyla Laura Escobedo Rodriguez": "ff8a0f60-5991-4538-939d-0a3ca98589e0",
    "Luis Boy Chavil": "d1788166-93d8-48d8-95e7-6a62aa6e8751",
    "Robert Jerry Sánchez Ticona": "0b141ce0-f957-494c-8af7-19e3c5f62a8f",
    "Cesar Arellano Salazar": "82271db8-ed8a-4189-99aa-230a67f8d3ee",
    "Camilo Suárez Rebaza": "a8592ffa-450f-4ac5-9e23-f3b7d1d58543",
    "Marcos Baca Lopez": "0e8821aa-eccf-425f-bdf8-770d5b5799e5",
    "Ana Cuadra Mitzugaray": "ee617482-97ff-4118-bbf1-89a346f221b3",
    "Juan Pedro Santos Fernández": "77cd84fc-b2d9-4d20-9b0f-86f3bcd3d4e4",
    "Ricardo Mendoza Rivera": "f1d6c39e-e15e-4866-88ce-93acdd29efba",
    "Oscar Romel Alcántara Moreno": "7657c8d9-71c1-47d8-80b8-e2c73d01828f",
    "José Gómez Ávila": "61cd4aad-5d47-4459-b165-05acd5ef7691",
    "Jhoe Gonzalez Vasquez": "8d8dfe01-df5b-4fa7-9523-3e134cfeaed4",
}

# PDF course name (normalized) ->DB curso_id
# Mapping built by comparing PDF output with Supabase cursos query
CURSO_MAP = {
    # Ciclo I
    ("I", "Introducción a la Programación"): "68d60cd0-0269-4c63-8967-ef6d73d87ad1",
    ("I", "Introducción a la Ing. de Sistemas"): "7dbf76ad-1116-4b82-bb23-a82ef854fec2",
    ("I", "Desarrollo Personal"): "f6eb0429-ae9e-4e01-b5d0-efbe9ffef3ac",
    ("I", "Desarrollo del Pens. Logico Matemat."): "36e76f4b-34ce-44a5-b04d-2933c8858ec8",
    ("I", "Lectura Critica y Redac. Textos Acad."): "d76c44d2-a042-4028-b941-e28ba941d81a",
    ("I", "Introduccion al Analisis Matemático"): "4f6f1d6c-454d-44fc-8fdd-1a81cf6f3de1",
    ("I", "Estadistica General"): "c9999956-23ce-4752-a254-10292b9a8547",
    # Ciclo III
    ("III", "Programación Orientada a Objetos II"): "88217bc0-9adc-4c17-a3b4-4b6d04ddf51c",
    ("III", "Sistémica"): "222eb215-8b4f-47e5-9491-50a87ca8b8e7",
    ("III", "Ingeniería Gráfica (e )"): "848f1d37-58cc-49f2-9225-b48e9685ad0f",
    ("III", "Matemática Aplicada"): "39bc0400-9ffc-4163-a0c1-d9f7ef92ae00",
    ("III", "Estadística Aplicada"): "11abde00-2ea5-47c9-bdfc-f9ebb34dafb1",
    ("III", "Administración General"): "d9264203-1739-4856-9f9e-e334a95ef001",
    ("III", "Física Electrónica"): "4fd63588-0764-4ddd-999e-800d587856c0",
    ("III", "Psicologia Organizacional (e )"): "2664afaa-fc32-43d2-891f-f0aed8384b65",
    # Ciclo V
    ("V", "Ingenieria de Datos I"): "56d6fd77-2f7c-46b7-922b-7058744099d4",
    ("V", "Sistemas de Información"): "313ce128-394c-4a41-acaf-ef668afbe4a9",
    ("V", "Transformación digital"): "ecc9734e-6eec-4cc6-a24b-b56a01ba290d",
    ("V", "Tecnología web"): "ae8e1a33-2d6a-49d0-baf6-4e73f0618ff0",
    ("V", "Arquitectura de computadoras"): "87edc23f-cdd8-484f-b605-1ffc4098835d",
    ("V", "Teleinformática(e)"): "c5500423-3c62-4f39-92d3-f47dff7bac67",
    ("V", "Investigación de Operaciones"): "d6b62f9c-7679-44fb-94f4-9a8ea4cfe5f4",
    ("V", "Contabilidad Gerencial"): "9e35d1ae-54b3-4309-8ee7-55d2cd83f849",
    # Ciclo VII
    ("VII", "Ingeniería de Software I"): "db8277a1-64ec-471c-8402-5fe3bd1eb351",
    ("VII", "Redes y Comunicaciones I"): "6a4e746c-ce0b-411a-873b-e5f5ab9923fd",
    ("VII", "Negocios Electrónicos (e )"): "3d010d2e-a3d4-4142-9777-b3c06a75bb09",
    ("VII", "Gestión de Servicios de TI"): "0db755a1-e521-4261-afc1-6e1d3c1c58d2",
    ("VII", "Metodología de la Investigación Científica"): "2dade41f-d1e2-45f8-be7f-f751a9ef5348",
    ("VII", "Administración de Base de Datos"): "b2560629-e7b1-4d94-bb9d-450985232987",
    ("VII", "Planeamiento Estratégico de TI"): "86ff4aea-eacf-4da9-becd-0b07afeb74ba",
    ("VII", "Cadena de Suministros ( e )"): "fbb2e25c-5b0f-4d03-857a-57e6d35eb324",
    # Ciclo IX
    ("IX", "Tesis I"): "23c23781-10c9-40f7-a6a0-981ed2a620af",
    ("IX", "Analítica de Negocios"): "d698dc6f-4d18-450b-92bd-b3b3f498336f",
    ("IX", "Auditoría Informática"): "63789662-9288-4e0c-8557-923780ffffff",
    ("IX", "Gestión de Proyectos de TI"): "734cd993-7ac5-468a-a92b-d78c6530fce1",
    ("IX", "Emprendimiento Tecnológico"): "e55d56bd-f7ea-458f-905f-73ac5f1f4b84",
    ("IX", "Ingenieria Web"): "e1b8adc0-2b9c-4ded-ba69-35472ae59088",
    ("IX", "Computación en la Nube"): "22b15925-c13a-458e-b49d-80534cb4909d",
    ("IX", "Hackeo Ético (e)"): "490010e4-ee42-41ab-bc82-4880c7f82923",
}

# Fix garbled encoding from PDF
def fix_encoding(s):
    reps = {
        "ó": "ó", "á": "á", "é": "é", "í": "í", "ú": "ú",
        "Ó": "Ó", "Á": "Á", "É": "É", "Í": "Í", "Ú": "Ú",
        "ñ": "ñ", "Ñ": "Ñ",
    }
    for k, v in reps.items():
        s = s.replace(k, v)
    return s

# Also try fixing the garbled "Administración de Ba se de Datos" ->merge
def fix_curso_name(name):
    name = fix_encoding(name)
    name = name.replace("Ba se de Datos", "Base de Datos")
    return name.strip()

with open(r"C:\Users\User\Desktop\horarios_unt\scripts\cursos-docentes.json", "r", encoding="utf-8") as f:
    assignments = json.load(f)

# Fix curso names
for a in assignments:
    a["curso"] = fix_curso_name(a["curso"])

# Determine main docente per course (the one with theory hours)
# Group assignments by (ciclo, curso)
by_course = {}
for a in assignments:
    if not a["curso"]:
        continue
    key = (a["ciclo"], a["curso"])
    by_course.setdefault(key, []).append(a)

# Build grupo assignments: main docente gets grupo 'A', secondary gets 'B', etc.
grupo_inserts = []  # list of (curso_id, docente_id, grupo_name, docente_name, curso_name, ciclo)
unmatched = []

for (ciclo, curso), asigs in sorted(by_course.items()):
    curso_id = CURSO_MAP.get((ciclo, curso))
    if not curso_id:
        unmatched.append((ciclo, curso))
        continue

    # Sort: docentes with theory hours first (main), lab-only second
    def sort_key(a):
        t = a.get("t", "")
        has_theory = t and t not in ("-", "", "0")
        return (0 if has_theory else 1, a["num"])

    asigs_sorted = sorted(asigs, key=sort_key)

    # Assign grupo names
    grupo_name = ord('A')
    seen_docentes = set()
    for a in asigs_sorted:
        docente_id = NAME_TO_ID.get(a["docente"])
        if not docente_id:
            print(f"WARNING: no docente_id for {a['docente']}")
            continue
        if docente_id in seen_docentes:
            continue
        seen_docentes.add(docente_id)

        grupo_inserts.append({
            "curso_id": curso_id,
            "docente_id": docente_id,
            "nombre": chr(grupo_name),
            "docente_name": a["docente"],
            "curso_name": curso,
            "ciclo": ciclo,
        })
        grupo_name += 1

# Generate SQL
lines = []
lines.append("-- Asignación de cursos a docentes (grupos) desde PDF horario 2026-I")
lines.append("-- 44 asignaciones del PDF ->grupos con docente_id")
lines.append("")
lines.append("BEGIN;")
lines.append("")
lines.append("-- 1. Agregar columna docente_id a grupos si no existe")
lines.append("DO $$")
lines.append("BEGIN")
lines.append("  IF NOT EXISTS (")
lines.append("    SELECT 1 FROM information_schema.columns")
lines.append("    WHERE table_schema = 'public'")
lines.append("    AND table_name = 'grupos'")
lines.append("    AND column_name = 'docente_id'")
lines.append("  ) THEN")
lines.append("    ALTER TABLE public.grupos ADD COLUMN docente_id UUID REFERENCES public.docentes(id);")
lines.append("  END IF;")
lines.append("END$$;")
lines.append("")
lines.append(f"-- 2. Limpiar grupos existentes para el periodo")
lines.append(f"DELETE FROM grupos WHERE periodo_id = '{PERIODO_ID}';")
lines.append("")
lines.append(f"-- 3. Insertar grupos con docente asignado ({len(grupo_inserts)} grupos)")

prev_ciclo = None
for g in sorted(grupo_inserts, key=lambda x: (x["ciclo"], x["curso_name"])):
    if g["ciclo"] != prev_ciclo:
        lines.append(f"\n-- === CICLO {g['ciclo']} ===")
        prev_ciclo = g["ciclo"]

    lines.append(f"-- {g['curso_name']} ->{g['docente_name']} (Grupo {g['nombre']})")
    lines.append(
        f"INSERT INTO grupos (curso_id, periodo_id, docente_id, nombre, num_estudiantes) "
        f"VALUES ('{g['curso_id']}', '{PERIODO_ID}', '{g['docente_id']}', '{g['nombre']}', 30) "
        f"ON CONFLICT (curso_id, periodo_id, nombre) DO UPDATE SET docente_id = EXCLUDED.docente_id;"
    )

lines.append("")
lines.append("COMMIT;")
lines.append("")
lines.append("-- Verificación: cursos asignados por docente")
lines.append(f"SELECT")
lines.append(f"  d.nombres || ' ' || d.apellidos AS docente,")
lines.append(f"  c.nombre AS curso,")
lines.append(f"  c.ciclo,")
lines.append(f"  g.nombre AS grupo")
lines.append(f"FROM grupos g")
lines.append(f"JOIN cursos c ON c.id = g.curso_id")
lines.append(f"JOIN docentes d ON d.id = g.docente_id")
lines.append(f"WHERE g.periodo_id = '{PERIODO_ID}'")
lines.append(f"ORDER BY c.ciclo, c.nombre, g.nombre;")

sql = "\n".join(lines)

with open(r"C:\Users\User\Desktop\horarios_unt\scripts\seed-grupos.sql", "w", encoding="utf-8") as f:
    f.write(sql)

print(f"SQL generado: {len(grupo_inserts)} grupos")
if unmatched:
    print(f"\nCursos sin match en DB ({len(unmatched)}):")
    for ciclo, curso in unmatched:
        print(f"  Ciclo {ciclo}: {curso}")

print(f"\nResumen por ciclo:")
by_ciclo = {}
for g in grupo_inserts:
    by_ciclo.setdefault(g["ciclo"], []).append(g)
for ciclo in sorted(by_ciclo.keys()):
    gs = by_ciclo[ciclo]
    print(f"  Ciclo {ciclo}: {len(gs)} grupos")
    for g in gs:
        print(f"    {g['curso_name']:<50} ->{g['docente_name']} (Grupo {g['nombre']})")
