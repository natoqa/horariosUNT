import json

with open(r"C:\Users\User\Desktop\horarios_unt\scripts\horario-parsed.json", "r", encoding="utf-8") as f:
    data = json.load(f)

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

DIA_FIX = {
    "Miercoles": "Miércoles",
    "Sabado": "Sábado",
    "Lunes": "Lunes",
    "Martes": "Martes",
    "Jueves": "Jueves",
    "Viernes": "Viernes",
}

PERIODO_ID = "b59f7c27-3f9e-492f-b570-da694b1e5018"

lines = []
lines.append("-- Seed disponibilidad desde horario-parsed.json (348 bloques, 28 docentes)")
lines.append(f"-- Generado automaticamente")
lines.append("")
lines.append("BEGIN;")
lines.append("")
lines.append(f"-- Limpiar disponibilidad existente para el periodo")
lines.append(f"DELETE FROM disponibilidad WHERE periodo_id = '{PERIODO_ID}';")
lines.append("")

total = 0
skipped = []

for name, slots in sorted(data.items()):
    docente_id = NAME_TO_ID.get(name)
    if not docente_id:
        skipped.append(name)
        continue

    lines.append(f"-- {name} ({len(slots)} bloques)")
    for slot in slots:
        dia = DIA_FIX.get(slot["dia"], slot["dia"])
        bloque = slot["bloque"]
        lines.append(
            f"INSERT INTO disponibilidad (docente_id, periodo_id, dia, bloque, estado) "
            f"VALUES ('{docente_id}', '{PERIODO_ID}', '{dia}', '{bloque}', 'Disponible') "
            f"ON CONFLICT (docente_id, periodo_id, dia, bloque) DO UPDATE SET estado = 'Disponible';"
        )
        total += 1
    lines.append("")

lines.append("COMMIT;")
lines.append("")
lines.append("-- Verificacion")
lines.append(f"SELECT d.nombres || ' ' || d.apellidos AS docente, COUNT(*) AS bloques")
lines.append(f"FROM disponibilidad disp")
lines.append(f"JOIN docentes d ON d.id = disp.docente_id")
lines.append(f"WHERE disp.periodo_id = '{PERIODO_ID}'")
lines.append(f"GROUP BY d.nombres, d.apellidos")
lines.append(f"ORDER BY docente;")

sql = "\n".join(lines)

with open(r"C:\Users\User\Desktop\horarios_unt\scripts\seed-disponibilidad.sql", "w", encoding="utf-8") as f:
    f.write(sql)

print(f"SQL generado: {total} inserts, {len(skipped)} docentes sin ID")
if skipped:
    print(f"Skipped: {skipped}")
