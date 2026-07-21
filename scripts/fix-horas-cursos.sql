-- Corregir horas de cursos según PDF "Horarios x ciclos 2026-I"
-- horasTeoricas = T (del PDF)
-- horasPracticas = P + L (práctica + laboratorio por grupo)

BEGIN;

-- === CICLO I ===
-- Introducción a la Programación: T=2, P=0, L=2 → T=2, P=2
UPDATE cursos SET horas_teoricas = 2, horas_practicas = 2 WHERE id = '68d60cd0-0269-4c63-8967-ef6d73d87ad1';
-- Introducción a la Ing. de Sistemas: T=1, P=2, L=0 → T=1, P=2
UPDATE cursos SET horas_teoricas = 1, horas_practicas = 2 WHERE id = '7dbf76ad-1116-4b82-bb23-a82ef854fec2';
-- Desarrollo Personal: T=2, P=2 → T=2, P=2
UPDATE cursos SET horas_teoricas = 2, horas_practicas = 2 WHERE id = 'f6eb0429-ae9e-4e01-b5d0-efbe9ffef3ac';
-- Desarrollo del Pens. Logico Matemat.: T=1, P=4 → T=1, P=4
UPDATE cursos SET horas_teoricas = 1, horas_practicas = 4 WHERE id = '36e76f4b-34ce-44a5-b04d-2933c8858ec8';
-- Lectura Critica y Redac. Textos Acad.: T=2, P=2 → T=2, P=2
UPDATE cursos SET horas_teoricas = 2, horas_practicas = 2 WHERE id = 'd76c44d2-a042-4028-b941-e28ba941d81a';
-- Introducción al Análisis Matemático: T=2, P=4 → T=2, P=4
UPDATE cursos SET horas_teoricas = 2, horas_practicas = 4 WHERE id = '4f6f1d6c-454d-44fc-8fdd-1a81cf6f3de1';
-- Estadística General: T=2, P=2 → T=2, P=2
UPDATE cursos SET horas_teoricas = 2, horas_practicas = 2 WHERE id = 'c9999956-23ce-4752-a254-10292b9a8547';

-- === CICLO III ===
-- Programación Orientada a Objetos II: T=2, P=0, L=4 → T=2, P=4
UPDATE cursos SET horas_teoricas = 2, horas_practicas = 4 WHERE id = '88217bc0-9adc-4c17-a3b4-4b6d04ddf51c';
-- Sistémica: T=2, P=1, L=2 → T=2, P=3
UPDATE cursos SET horas_teoricas = 2, horas_practicas = 3 WHERE id = '222eb215-8b4f-47e5-9491-50a87ca8b8e7';
-- Ingeniería Gráfica: T=1, P=1, L=2 → T=1, P=3
UPDATE cursos SET horas_teoricas = 1, horas_practicas = 3 WHERE id = '848f1d37-58cc-49f2-9225-b48e9685ad0f';
-- Matemática Aplicada: T=1, P=2, L=2 → T=1, P=4
UPDATE cursos SET horas_teoricas = 1, horas_practicas = 4 WHERE id = '39bc0400-9ffc-4163-a0c1-d9f7ef92ae00';
-- Estadística Aplicada: T=1, P=2, L=2 → T=1, P=4
UPDATE cursos SET horas_teoricas = 1, horas_practicas = 4 WHERE id = '11abde00-2ea5-47c9-bdfc-f9ebb34dafb1';
-- Administración General: T=2, P=2 → T=2, P=2
UPDATE cursos SET horas_teoricas = 2, horas_practicas = 2 WHERE id = 'd9264203-1739-4856-9f9e-e334a95ef001';
-- Física Electrónica: T=1, P=2, L=2 → T=1, P=4
UPDATE cursos SET horas_teoricas = 1, horas_practicas = 4 WHERE id = '4fd63588-0764-4ddd-999e-800d587856c0';
-- Psicología Organizacional: T=2, P=2 → T=2, P=2
UPDATE cursos SET horas_teoricas = 2, horas_practicas = 2 WHERE id = '2664afaa-fc32-43d2-891f-f0aed8384b65';

-- === CICLO V ===
-- Ingeniería de Datos I: T=2, P=1, L=3 → T=2, P=4
UPDATE cursos SET horas_teoricas = 2, horas_practicas = 4 WHERE id = '56d6fd77-2f7c-46b7-922b-7058744099d4';
-- Sistemas de Información: T=2, P=2, L=2 → T=2, P=4
UPDATE cursos SET horas_teoricas = 2, horas_practicas = 4 WHERE id = '313ce128-394c-4a41-acaf-ef668afbe4a9';
-- Transformación Digital: T=2, P=0, L=2 → T=2, P=2
UPDATE cursos SET horas_teoricas = 2, horas_practicas = 2 WHERE id = 'ecc9734e-6eec-4cc6-a24b-b56a01ba290d';
-- Tecnología Web: T=1, P=1, L=2 → T=1, P=3
UPDATE cursos SET horas_teoricas = 1, horas_practicas = 3 WHERE id = 'ae8e1a33-2d6a-49d0-baf6-4e73f0618ff0';
-- Arquitectura de Computadoras: T=1, P=2, L=2 → T=1, P=4
UPDATE cursos SET horas_teoricas = 1, horas_practicas = 4 WHERE id = '87edc23f-cdd8-484f-b605-1ffc4098835d';
-- Teleinformática: T=1, P=2, L=2 → T=1, P=4
UPDATE cursos SET horas_teoricas = 1, horas_practicas = 4 WHERE id = 'c5500423-3c62-4f39-92d3-f47dff7bac67';
-- Investigación de Operaciones: T=1, P=2, L=2 → T=1, P=4
UPDATE cursos SET horas_teoricas = 1, horas_practicas = 4 WHERE id = 'd6b62f9c-7679-44fb-94f4-9a8ea4cfe5f4';
-- Contabilidad Gerencial: T=1, P=2, L=2 → T=1, P=4
UPDATE cursos SET horas_teoricas = 1, horas_practicas = 4 WHERE id = '9e35d1ae-54b3-4309-8ee7-55d2cd83f849';

-- === CICLO VII ===
-- Ingeniería de Software I: T=2, P=1, L=3 → T=2, P=4
UPDATE cursos SET nombre = 'Ingeniería de Software I', horas_teoricas = 2, horas_practicas = 4 WHERE id = 'db8277a1-64ec-471c-8402-5fe3bd1eb351';
-- Redes y Comunicaciones I: T=1, P=1, L=3 → T=1, P=4
UPDATE cursos SET horas_teoricas = 1, horas_practicas = 4 WHERE id = '6a4e746c-ce0b-411a-873b-e5f5ab9923fd';
-- Negocios Electrónicos: T=2, P=0, L=0 → T=2, P=0
UPDATE cursos SET horas_teoricas = 2, horas_practicas = 0 WHERE id = '3d010d2e-a3d4-4142-9777-b3c06a75bb09';
-- Gestión de Servicios de TI: T=1, P=2, L=2 → T=1, P=4
UPDATE cursos SET horas_teoricas = 1, horas_practicas = 4 WHERE id = '0db755a1-e521-4261-afc1-6e1d3c1c58d2';
-- Metodología de la Investigación Científica: T=2, P=2 → T=2, P=2
UPDATE cursos SET horas_teoricas = 2, horas_practicas = 2 WHERE id = '2dade41f-d1e2-45f8-be7f-f751a9ef5348';
-- Administración de Base de Datos: T=1, P=1, L=3 → T=1, P=4
UPDATE cursos SET horas_teoricas = 1, horas_practicas = 4 WHERE id = 'b2560629-e7b1-4d94-bb9d-450985232987';
-- Planeamiento Estratégico de TI: T=1, P=2, L=2 → T=1, P=4
UPDATE cursos SET horas_teoricas = 1, horas_practicas = 4 WHERE id = '86ff4aea-eacf-4da9-becd-0b07afeb74ba';
-- Cadena de Suministros: T=2, P=2 → T=2, P=2
UPDATE cursos SET horas_teoricas = 2, horas_practicas = 2 WHERE id = 'fbb2e25c-5b0f-4d03-857a-57e6d35eb324';

-- === CICLO IX ===
-- Tesis I: T=2, P=2, L=2 → T=2, P=4
UPDATE cursos SET horas_teoricas = 2, horas_practicas = 4 WHERE id = '23c23781-10c9-40f7-a6a0-981ed2a620af';
-- Analítica de Negocios: T=1, P=2, L=2 → T=1, P=4
UPDATE cursos SET horas_teoricas = 1, horas_practicas = 4 WHERE id = 'd698dc6f-4d18-450b-92bd-b3b3f498336f';
-- Auditoría Informática: T=1, P=2, L=2 → T=1, P=4
UPDATE cursos SET horas_teoricas = 1, horas_practicas = 4 WHERE id = '63789662-9288-4e0c-8557-923780ffffff';
-- Gestión de Proyectos de TI: T=1, P=2, L=2 → T=1, P=4
UPDATE cursos SET horas_teoricas = 1, horas_practicas = 4 WHERE id = '734cd993-7ac5-468a-a92b-d78c6530fce1';
-- Emprendimiento Tecnológico: T=2, P=0, L=2 → T=2, P=2
UPDATE cursos SET horas_teoricas = 2, horas_practicas = 2 WHERE id = 'e55d56bd-f7ea-458f-905f-73ac5f1f4b84';
-- Ingeniería Web: T=1, P=1, L=3 → T=1, P=4
UPDATE cursos SET horas_teoricas = 1, horas_practicas = 4 WHERE id = 'e1b8adc0-2b9c-4ded-ba69-35472ae59088';
-- Computación en la Nube: T=1, P=1, L=3 → T=1, P=4
UPDATE cursos SET horas_teoricas = 1, horas_practicas = 4 WHERE id = '22b15925-c13a-458e-b49d-80534cb4909d';
-- Hackeo Ético: T=2, P=0, L=2 → T=2, P=2
UPDATE cursos SET horas_teoricas = 2, horas_practicas = 2 WHERE id = '490010e4-ee42-41ab-bc82-4880c7f82923';

COMMIT;

-- Verificar resultado
SELECT nombre, ciclo, horas_teoricas, horas_practicas, (horas_teoricas + horas_practicas) as total
FROM cursos
WHERE estado = 'Activo'
ORDER BY ciclo, nombre;
