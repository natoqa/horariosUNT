-- Diferenciar fecha_ingreso de docentes para que el scoring produzca prioridades distintas
-- Santos > Arellano en antigüedad (según indicación del usuario)
-- NOTA: Estas fechas son APROXIMADAS. Ajusta según datos reales.
--
-- Tiers de score resultante (con Principal/Nombrado + 84/84 slots):
--   20+ años → score ≈ 90
--   15-19 años → score ≈ 85
--   10-14 años → score ≈ 80
--   5-9 años → score ≈ 75
--   1-4 años → score ≈ 70

BEGIN;

-- === TIER 1: 20+ años (score ≈ 90) — Más antiguos ===
-- Marcelino Torres Villanueva (1995)
UPDATE docentes SET fecha_ingreso = '1995-03-01' WHERE id = '4baed0ce-5a38-467a-aaba-add2753183f4';
-- Juan Pedro Santos Fernández (1998)
UPDATE docentes SET fecha_ingreso = '1998-03-01' WHERE id = '77cd84fc-b2d9-4d20-9b0f-86f3bcd3d4e4';
-- Alberto Mendoza de los Santos (2000)
UPDATE docentes SET fecha_ingreso = '2000-03-01' WHERE id = '576df7de-868e-49c0-8cd6-c3b90b462f3a';
-- Zoraida Vidal Melgarejo (2002)
UPDATE docentes SET fecha_ingreso = '2002-03-01' WHERE id = 'd04f1011-c31f-4c9d-a7bc-1fc962d8fffd';
-- Ricardo Mendoza Rivera (2004)
UPDATE docentes SET fecha_ingreso = '2004-03-01' WHERE id = 'f1d6c39e-e15e-4866-88ce-93acdd29efba';

-- === TIER 2: 15-19 años (score ≈ 85) ===
-- Cesar Arellano Salazar (2008)
UPDATE docentes SET fecha_ingreso = '2008-03-01' WHERE id = '82271db8-ed8a-4189-99aa-230a67f8d3ee';
-- Everson David Agreda Gamboa (2008)
UPDATE docentes SET fecha_ingreso = '2008-06-01' WHERE id = '2779fcc3-684e-4b74-a059-26b2d945ac89';
-- Luis Boy Chavil (2009)
UPDATE docentes SET fecha_ingreso = '2009-03-01' WHERE id = 'd1788166-93d8-48d8-95e7-6a62aa6e8751';
-- Oscar Romel Alcántara Moreno (2010)
UPDATE docentes SET fecha_ingreso = '2010-03-01' WHERE id = '7657c8d9-71c1-47d8-80b8-e2c73d01828f';
-- Camilo Suárez Rebaza (2010)
UPDATE docentes SET fecha_ingreso = '2010-06-01' WHERE id = 'a8592ffa-450f-4ac5-9e23-f3b7d1d58543';

-- === TIER 3: 10-14 años (score ≈ 80) ===
-- Paul Cotrina Castellanos (2013)
UPDATE docentes SET fecha_ingreso = '2013-03-01' WHERE id = '17f35b7c-eb0d-4b0c-aec9-53fc3536fbd0';
-- Juan Carlos Obando Roldan (2013)
UPDATE docentes SET fecha_ingreso = '2013-06-01' WHERE id = '22a0ef1c-8d41-4f60-908d-233a707a5291';
-- Robert Jerry Sánchez Ticona (2014)
UPDATE docentes SET fecha_ingreso = '2014-03-01' WHERE id = '0b141ce0-f957-494c-8af7-19e3c5f62a8f';
-- José Gómez Ávila (2015)
UPDATE docentes SET fecha_ingreso = '2015-03-01' WHERE id = '61cd4aad-5d47-4459-b165-05acd5ef7691';

-- === TIER 4: 5-9 años (score ≈ 75) ===
-- Marcos Ferrer Reyna (2018)
UPDATE docentes SET fecha_ingreso = '2018-03-01' WHERE id = '61da9b38-f602-4ef7-856b-3be710515b4f';
-- Teresita Rojas Garcia (2018)
UPDATE docentes SET fecha_ingreso = '2018-06-01' WHERE id = '30ae5fa9-bbba-49d7-a4ea-b90ae237a2ec';
-- Marcos Baca Lopez (2019)
UPDATE docentes SET fecha_ingreso = '2019-03-01' WHERE id = '0e8821aa-eccf-425f-bdf8-770d5b5799e5';
-- Vilma Mendez Gil (2019)
UPDATE docentes SET fecha_ingreso = '2019-06-01' WHERE id = '53741d94-f669-4fe0-aaed-510507d2fc50';
-- Juan Carrascal Cabanillas (2020)
UPDATE docentes SET fecha_ingreso = '2020-03-01' WHERE id = '3808a4e0-a59d-46e0-94d5-54756138fbe4';
-- Ana Cuadra Mitzugaray (2020)
UPDATE docentes SET fecha_ingreso = '2020-06-01' WHERE id = 'ee617482-97ff-4118-bbf1-89a346f221b3';

-- === TIER 5: 1-4 años (score ≈ 70) — Más recientes ===
-- Segundo Guibar Obeso (2022)
UPDATE docentes SET fecha_ingreso = '2022-03-01' WHERE id = 'a66d3adb-79e4-4efd-bb46-a15826f99894';
-- Miguel Ipanaque Zapata (2022)
UPDATE docentes SET fecha_ingreso = '2022-06-01' WHERE id = '4bb4e617-a4af-4eb9-ad1a-88157bd709cd';
-- Martha Cardoso (2023)
UPDATE docentes SET fecha_ingreso = '2023-03-01' WHERE id = '89442c73-703a-4d0d-81d4-d9768feaff75';
-- Bertha Urtecho Zavaleta (2023)
UPDATE docentes SET fecha_ingreso = '2023-06-01' WHERE id = 'a10032e7-fcf1-4de5-86a9-e710b59c8425';
-- Jose Luis Ponte Bejarano (2024)
UPDATE docentes SET fecha_ingreso = '2024-03-01' WHERE id = '245d4a73-40f7-4d63-ab6a-3ab86a918c65';
-- Jorge Luis Rios Gonzales (2024)
UPDATE docentes SET fecha_ingreso = '2024-06-01' WHERE id = '16983c8a-5782-45fa-ba6c-ea29f70871de';
-- Sheyla Laura Escobedo Rodriguez (2025)
UPDATE docentes SET fecha_ingreso = '2025-03-01' WHERE id = 'ff8a0f60-5991-4538-939d-0a3ca98589e0';
-- Jhoe Gonzalez Vasquez (2025)
UPDATE docentes SET fecha_ingreso = '2025-06-01' WHERE id = '8d8dfe01-df5b-4fa7-9523-3e134cfeaed4';

COMMIT;

-- Verificar resultado
SELECT
  nombres || ' ' || apellidos AS docente,
  categoria,
  condicion,
  fecha_ingreso,
  EXTRACT(YEAR FROM AGE(CURRENT_DATE, fecha_ingreso::date)) AS anos_antiguedad
FROM docentes
WHERE estado = 'Activo'
ORDER BY fecha_ingreso ASC;
