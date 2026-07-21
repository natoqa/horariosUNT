-- Asignación de cursos a docentes (grupos) desde PDF horario 2026-I
-- 44 asignaciones del PDF ->grupos con docente_id

BEGIN;

-- 1. Agregar columna docente_id a grupos si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'grupos'
    AND column_name = 'docente_id'
  ) THEN
    ALTER TABLE public.grupos ADD COLUMN docente_id UUID REFERENCES public.docentes(id);
  END IF;
END$$;

-- 2. Limpiar grupos existentes para el periodo
DELETE FROM grupos WHERE periodo_id = 'b59f7c27-3f9e-492f-b570-da694b1e5018';

-- 3. Insertar grupos con docente asignado (44 grupos)

-- === CICLO I ===
-- Desarrollo Personal ->Bertha Urtecho Zavaleta (Grupo A)
INSERT INTO grupos (curso_id, periodo_id, docente_id, nombre, num_estudiantes) VALUES ('f6eb0429-ae9e-4e01-b5d0-efbe9ffef3ac', 'b59f7c27-3f9e-492f-b570-da694b1e5018', 'a10032e7-fcf1-4de5-86a9-e710b59c8425', 'A', 30) ON CONFLICT (curso_id, periodo_id, nombre) DO UPDATE SET docente_id = EXCLUDED.docente_id;
-- Desarrollo del Pens. Logico Matemat. ->Jose Luis Ponte Bejarano (Grupo A)
INSERT INTO grupos (curso_id, periodo_id, docente_id, nombre, num_estudiantes) VALUES ('36e76f4b-34ce-44a5-b04d-2933c8858ec8', 'b59f7c27-3f9e-492f-b570-da694b1e5018', '245d4a73-40f7-4d63-ab6a-3ab86a918c65', 'A', 30) ON CONFLICT (curso_id, periodo_id, nombre) DO UPDATE SET docente_id = EXCLUDED.docente_id;
-- Estadistica General ->Martha Cardoso (Grupo A)
INSERT INTO grupos (curso_id, periodo_id, docente_id, nombre, num_estudiantes) VALUES ('c9999956-23ce-4752-a254-10292b9a8547', 'b59f7c27-3f9e-492f-b570-da694b1e5018', '89442c73-703a-4d0d-81d4-d9768feaff75', 'A', 30) ON CONFLICT (curso_id, periodo_id, nombre) DO UPDATE SET docente_id = EXCLUDED.docente_id;
-- Estadistica General ->Miguel Ipanaque Zapata (Grupo B)
INSERT INTO grupos (curso_id, periodo_id, docente_id, nombre, num_estudiantes) VALUES ('c9999956-23ce-4752-a254-10292b9a8547', 'b59f7c27-3f9e-492f-b570-da694b1e5018', '4bb4e617-a4af-4eb9-ad1a-88157bd709cd', 'B', 30) ON CONFLICT (curso_id, periodo_id, nombre) DO UPDATE SET docente_id = EXCLUDED.docente_id;
-- Introduccion al Analisis Matemático ->Segundo Guibar Obeso (Grupo A)
INSERT INTO grupos (curso_id, periodo_id, docente_id, nombre, num_estudiantes) VALUES ('4f6f1d6c-454d-44fc-8fdd-1a81cf6f3de1', 'b59f7c27-3f9e-492f-b570-da694b1e5018', 'a66d3adb-79e4-4efd-bb46-a15826f99894', 'A', 30) ON CONFLICT (curso_id, periodo_id, nombre) DO UPDATE SET docente_id = EXCLUDED.docente_id;
-- Introducción a la Ing. de Sistemas ->Alberto Mendoza de los Santos (Grupo A)
INSERT INTO grupos (curso_id, periodo_id, docente_id, nombre, num_estudiantes) VALUES ('7dbf76ad-1116-4b82-bb23-a82ef854fec2', 'b59f7c27-3f9e-492f-b570-da694b1e5018', '576df7de-868e-49c0-8cd6-c3b90b462f3a', 'A', 30) ON CONFLICT (curso_id, periodo_id, nombre) DO UPDATE SET docente_id = EXCLUDED.docente_id;
-- Introducción a la Programación ->Marcelino Torres Villanueva (Grupo A)
INSERT INTO grupos (curso_id, periodo_id, docente_id, nombre, num_estudiantes) VALUES ('68d60cd0-0269-4c63-8967-ef6d73d87ad1', 'b59f7c27-3f9e-492f-b570-da694b1e5018', '4baed0ce-5a38-467a-aaba-add2753183f4', 'A', 30) ON CONFLICT (curso_id, periodo_id, nombre) DO UPDATE SET docente_id = EXCLUDED.docente_id;
-- Introducción a la Programación ->Paul Cotrina Castellanos (Grupo B)
INSERT INTO grupos (curso_id, periodo_id, docente_id, nombre, num_estudiantes) VALUES ('68d60cd0-0269-4c63-8967-ef6d73d87ad1', 'b59f7c27-3f9e-492f-b570-da694b1e5018', '17f35b7c-eb0d-4b0c-aec9-53fc3536fbd0', 'B', 30) ON CONFLICT (curso_id, periodo_id, nombre) DO UPDATE SET docente_id = EXCLUDED.docente_id;
-- Lectura Critica y Redac. Textos Acad. ->Jorge Luis Rios Gonzales (Grupo A)
INSERT INTO grupos (curso_id, periodo_id, docente_id, nombre, num_estudiantes) VALUES ('d76c44d2-a042-4028-b941-e28ba941d81a', 'b59f7c27-3f9e-492f-b570-da694b1e5018', '16983c8a-5782-45fa-ba6c-ea29f70871de', 'A', 30) ON CONFLICT (curso_id, periodo_id, nombre) DO UPDATE SET docente_id = EXCLUDED.docente_id;

-- === CICLO III ===
-- Administración General ->Juan Carrascal Cabanillas (Grupo A)
INSERT INTO grupos (curso_id, periodo_id, docente_id, nombre, num_estudiantes) VALUES ('d9264203-1739-4856-9f9e-e334a95ef001', 'b59f7c27-3f9e-492f-b570-da694b1e5018', '3808a4e0-a59d-46e0-94d5-54756138fbe4', 'A', 30) ON CONFLICT (curso_id, periodo_id, nombre) DO UPDATE SET docente_id = EXCLUDED.docente_id;
-- Estadística Aplicada ->Teresita Rojas Garcia (Grupo A)
INSERT INTO grupos (curso_id, periodo_id, docente_id, nombre, num_estudiantes) VALUES ('11abde00-2ea5-47c9-bdfc-f9ebb34dafb1', 'b59f7c27-3f9e-492f-b570-da694b1e5018', '30ae5fa9-bbba-49d7-a4ea-b90ae237a2ec', 'A', 30) ON CONFLICT (curso_id, periodo_id, nombre) DO UPDATE SET docente_id = EXCLUDED.docente_id;
-- Física Electrónica ->Vilma Mendez Gil (Grupo A)
INSERT INTO grupos (curso_id, periodo_id, docente_id, nombre, num_estudiantes) VALUES ('4fd63588-0764-4ddd-999e-800d587856c0', 'b59f7c27-3f9e-492f-b570-da694b1e5018', '53741d94-f669-4fe0-aaed-510507d2fc50', 'A', 30) ON CONFLICT (curso_id, periodo_id, nombre) DO UPDATE SET docente_id = EXCLUDED.docente_id;
-- Ingeniería Gráfica (e ) ->Juan Carlos Obando Roldan (Grupo A)
INSERT INTO grupos (curso_id, periodo_id, docente_id, nombre, num_estudiantes) VALUES ('848f1d37-58cc-49f2-9225-b48e9685ad0f', 'b59f7c27-3f9e-492f-b570-da694b1e5018', '22a0ef1c-8d41-4f60-908d-233a707a5291', 'A', 30) ON CONFLICT (curso_id, periodo_id, nombre) DO UPDATE SET docente_id = EXCLUDED.docente_id;
-- Matemática Aplicada ->Marcos Ferrer Reyna (Grupo A)
INSERT INTO grupos (curso_id, periodo_id, docente_id, nombre, num_estudiantes) VALUES ('39bc0400-9ffc-4163-a0c1-d9f7ef92ae00', 'b59f7c27-3f9e-492f-b570-da694b1e5018', '61da9b38-f602-4ef7-856b-3be710515b4f', 'A', 30) ON CONFLICT (curso_id, periodo_id, nombre) DO UPDATE SET docente_id = EXCLUDED.docente_id;
-- Programación Orientada a Objetos II ->Zoraida Vidal Melgarejo (Grupo A)
INSERT INTO grupos (curso_id, periodo_id, docente_id, nombre, num_estudiantes) VALUES ('88217bc0-9adc-4c17-a3b4-4b6d04ddf51c', 'b59f7c27-3f9e-492f-b570-da694b1e5018', 'd04f1011-c31f-4c9d-a7bc-1fc962d8fffd', 'A', 30) ON CONFLICT (curso_id, periodo_id, nombre) DO UPDATE SET docente_id = EXCLUDED.docente_id;
-- Psicologia Organizacional (e ) ->Sheyla Laura Escobedo Rodriguez (Grupo A)
INSERT INTO grupos (curso_id, periodo_id, docente_id, nombre, num_estudiantes) VALUES ('2664afaa-fc32-43d2-891f-f0aed8384b65', 'b59f7c27-3f9e-492f-b570-da694b1e5018', 'ff8a0f60-5991-4538-939d-0a3ca98589e0', 'A', 30) ON CONFLICT (curso_id, periodo_id, nombre) DO UPDATE SET docente_id = EXCLUDED.docente_id;
-- Sistémica ->Everson David Agreda Gamboa (Grupo A)
INSERT INTO grupos (curso_id, periodo_id, docente_id, nombre, num_estudiantes) VALUES ('222eb215-8b4f-47e5-9491-50a87ca8b8e7', 'b59f7c27-3f9e-492f-b570-da694b1e5018', '2779fcc3-684e-4b74-a059-26b2d945ac89', 'A', 30) ON CONFLICT (curso_id, periodo_id, nombre) DO UPDATE SET docente_id = EXCLUDED.docente_id;

-- === CICLO IX ===
-- Analítica de Negocios ->Ricardo Mendoza Rivera (Grupo A)
INSERT INTO grupos (curso_id, periodo_id, docente_id, nombre, num_estudiantes) VALUES ('d698dc6f-4d18-450b-92bd-b3b3f498336f', 'b59f7c27-3f9e-492f-b570-da694b1e5018', 'f1d6c39e-e15e-4866-88ce-93acdd29efba', 'A', 30) ON CONFLICT (curso_id, periodo_id, nombre) DO UPDATE SET docente_id = EXCLUDED.docente_id;
-- Auditoría Informática ->Alberto Mendoza de los Santos (Grupo A)
INSERT INTO grupos (curso_id, periodo_id, docente_id, nombre, num_estudiantes) VALUES ('63789662-9288-4e0c-8557-923780ffffff', 'b59f7c27-3f9e-492f-b570-da694b1e5018', '576df7de-868e-49c0-8cd6-c3b90b462f3a', 'A', 30) ON CONFLICT (curso_id, periodo_id, nombre) DO UPDATE SET docente_id = EXCLUDED.docente_id;
-- Computación en la Nube ->José Gómez Ávila (Grupo A)
INSERT INTO grupos (curso_id, periodo_id, docente_id, nombre, num_estudiantes) VALUES ('22b15925-c13a-458e-b49d-80534cb4909d', 'b59f7c27-3f9e-492f-b570-da694b1e5018', '61cd4aad-5d47-4459-b165-05acd5ef7691', 'A', 30) ON CONFLICT (curso_id, periodo_id, nombre) DO UPDATE SET docente_id = EXCLUDED.docente_id;
-- Emprendimiento Tecnológico ->Oscar Romel Alcántara Moreno (Grupo A)
INSERT INTO grupos (curso_id, periodo_id, docente_id, nombre, num_estudiantes) VALUES ('e55d56bd-f7ea-458f-905f-73ac5f1f4b84', 'b59f7c27-3f9e-492f-b570-da694b1e5018', '7657c8d9-71c1-47d8-80b8-e2c73d01828f', 'A', 30) ON CONFLICT (curso_id, periodo_id, nombre) DO UPDATE SET docente_id = EXCLUDED.docente_id;
-- Gestión de Proyectos de TI ->José Gómez Ávila (Grupo A)
INSERT INTO grupos (curso_id, periodo_id, docente_id, nombre, num_estudiantes) VALUES ('734cd993-7ac5-468a-a92b-d78c6530fce1', 'b59f7c27-3f9e-492f-b570-da694b1e5018', '61cd4aad-5d47-4459-b165-05acd5ef7691', 'A', 30) ON CONFLICT (curso_id, periodo_id, nombre) DO UPDATE SET docente_id = EXCLUDED.docente_id;
-- Hackeo Ético (e) ->Camilo Suárez Rebaza (Grupo A)
INSERT INTO grupos (curso_id, periodo_id, docente_id, nombre, num_estudiantes) VALUES ('490010e4-ee42-41ab-bc82-4880c7f82923', 'b59f7c27-3f9e-492f-b570-da694b1e5018', 'a8592ffa-450f-4ac5-9e23-f3b7d1d58543', 'A', 30) ON CONFLICT (curso_id, periodo_id, nombre) DO UPDATE SET docente_id = EXCLUDED.docente_id;
-- Ingenieria Web ->Marcelino Torres Villanueva (Grupo A)
INSERT INTO grupos (curso_id, periodo_id, docente_id, nombre, num_estudiantes) VALUES ('e1b8adc0-2b9c-4ded-ba69-35472ae59088', 'b59f7c27-3f9e-492f-b570-da694b1e5018', '4baed0ce-5a38-467a-aaba-add2753183f4', 'A', 30) ON CONFLICT (curso_id, periodo_id, nombre) DO UPDATE SET docente_id = EXCLUDED.docente_id;
-- Tesis I ->Juan Pedro Santos Fernández (Grupo A)
INSERT INTO grupos (curso_id, periodo_id, docente_id, nombre, num_estudiantes) VALUES ('23c23781-10c9-40f7-a6a0-981ed2a620af', 'b59f7c27-3f9e-492f-b570-da694b1e5018', '77cd84fc-b2d9-4d20-9b0f-86f3bcd3d4e4', 'A', 30) ON CONFLICT (curso_id, periodo_id, nombre) DO UPDATE SET docente_id = EXCLUDED.docente_id;
-- Tesis I ->Ricardo Mendoza Rivera (Grupo B)
INSERT INTO grupos (curso_id, periodo_id, docente_id, nombre, num_estudiantes) VALUES ('23c23781-10c9-40f7-a6a0-981ed2a620af', 'b59f7c27-3f9e-492f-b570-da694b1e5018', 'f1d6c39e-e15e-4866-88ce-93acdd29efba', 'B', 30) ON CONFLICT (curso_id, periodo_id, nombre) DO UPDATE SET docente_id = EXCLUDED.docente_id;

-- === CICLO V ===
-- Arquitectura de computadoras ->Cesar Arellano Salazar (Grupo A)
INSERT INTO grupos (curso_id, periodo_id, docente_id, nombre, num_estudiantes) VALUES ('87edc23f-cdd8-484f-b605-1ffc4098835d', 'b59f7c27-3f9e-492f-b570-da694b1e5018', '82271db8-ed8a-4189-99aa-230a67f8d3ee', 'A', 30) ON CONFLICT (curso_id, periodo_id, nombre) DO UPDATE SET docente_id = EXCLUDED.docente_id;
-- Contabilidad Gerencial ->Ana Cuadra Mitzugaray (Grupo A)
INSERT INTO grupos (curso_id, periodo_id, docente_id, nombre, num_estudiantes) VALUES ('9e35d1ae-54b3-4309-8ee7-55d2cd83f849', 'b59f7c27-3f9e-492f-b570-da694b1e5018', 'ee617482-97ff-4118-bbf1-89a346f221b3', 'A', 30) ON CONFLICT (curso_id, periodo_id, nombre) DO UPDATE SET docente_id = EXCLUDED.docente_id;
-- Ingenieria de Datos I ->Luis Boy Chavil (Grupo A)
INSERT INTO grupos (curso_id, periodo_id, docente_id, nombre, num_estudiantes) VALUES ('56d6fd77-2f7c-46b7-922b-7058744099d4', 'b59f7c27-3f9e-492f-b570-da694b1e5018', 'd1788166-93d8-48d8-95e7-6a62aa6e8751', 'A', 30) ON CONFLICT (curso_id, periodo_id, nombre) DO UPDATE SET docente_id = EXCLUDED.docente_id;
-- Investigación de Operaciones ->Marcos Baca Lopez (Grupo A)
INSERT INTO grupos (curso_id, periodo_id, docente_id, nombre, num_estudiantes) VALUES ('d6b62f9c-7679-44fb-94f4-9a8ea4cfe5f4', 'b59f7c27-3f9e-492f-b570-da694b1e5018', '0e8821aa-eccf-425f-bdf8-770d5b5799e5', 'A', 30) ON CONFLICT (curso_id, periodo_id, nombre) DO UPDATE SET docente_id = EXCLUDED.docente_id;
-- Sistemas de Información ->Juan Carlos Obando Roldan (Grupo A)
INSERT INTO grupos (curso_id, periodo_id, docente_id, nombre, num_estudiantes) VALUES ('313ce128-394c-4a41-acaf-ef668afbe4a9', 'b59f7c27-3f9e-492f-b570-da694b1e5018', '22a0ef1c-8d41-4f60-908d-233a707a5291', 'A', 30) ON CONFLICT (curso_id, periodo_id, nombre) DO UPDATE SET docente_id = EXCLUDED.docente_id;
-- Tecnología web ->Robert Jerry Sánchez Ticona (Grupo A)
INSERT INTO grupos (curso_id, periodo_id, docente_id, nombre, num_estudiantes) VALUES ('ae8e1a33-2d6a-49d0-baf6-4e73f0618ff0', 'b59f7c27-3f9e-492f-b570-da694b1e5018', '0b141ce0-f957-494c-8af7-19e3c5f62a8f', 'A', 30) ON CONFLICT (curso_id, periodo_id, nombre) DO UPDATE SET docente_id = EXCLUDED.docente_id;
-- Teleinformática(e) ->Camilo Suárez Rebaza (Grupo A)
INSERT INTO grupos (curso_id, periodo_id, docente_id, nombre, num_estudiantes) VALUES ('c5500423-3c62-4f39-92d3-f47dff7bac67', 'b59f7c27-3f9e-492f-b570-da694b1e5018', 'a8592ffa-450f-4ac5-9e23-f3b7d1d58543', 'A', 30) ON CONFLICT (curso_id, periodo_id, nombre) DO UPDATE SET docente_id = EXCLUDED.docente_id;
-- Transformación digital ->Everson David Agreda Gamboa (Grupo A)
INSERT INTO grupos (curso_id, periodo_id, docente_id, nombre, num_estudiantes) VALUES ('ecc9734e-6eec-4cc6-a24b-b56a01ba290d', 'b59f7c27-3f9e-492f-b570-da694b1e5018', '2779fcc3-684e-4b74-a059-26b2d945ac89', 'A', 30) ON CONFLICT (curso_id, periodo_id, nombre) DO UPDATE SET docente_id = EXCLUDED.docente_id;

-- === CICLO VII ===
-- Administración de Base de Datos ->Ricardo Mendoza Rivera (Grupo A)
INSERT INTO grupos (curso_id, periodo_id, docente_id, nombre, num_estudiantes) VALUES ('b2560629-e7b1-4d94-bb9d-450985232987', 'b59f7c27-3f9e-492f-b570-da694b1e5018', 'f1d6c39e-e15e-4866-88ce-93acdd29efba', 'A', 30) ON CONFLICT (curso_id, periodo_id, nombre) DO UPDATE SET docente_id = EXCLUDED.docente_id;
-- Cadena de Suministros ( e ) ->Jhoe Gonzalez Vasquez (Grupo A)
INSERT INTO grupos (curso_id, periodo_id, docente_id, nombre, num_estudiantes) VALUES ('fbb2e25c-5b0f-4d03-857a-57e6d35eb324', 'b59f7c27-3f9e-492f-b570-da694b1e5018', '8d8dfe01-df5b-4fa7-9523-3e134cfeaed4', 'A', 30) ON CONFLICT (curso_id, periodo_id, nombre) DO UPDATE SET docente_id = EXCLUDED.docente_id;
-- Gestión de Servicios de TI ->Alberto Mendoza de los Santos (Grupo A)
INSERT INTO grupos (curso_id, periodo_id, docente_id, nombre, num_estudiantes) VALUES ('0db755a1-e521-4261-afc1-6e1d3c1c58d2', 'b59f7c27-3f9e-492f-b570-da694b1e5018', '576df7de-868e-49c0-8cd6-c3b90b462f3a', 'A', 30) ON CONFLICT (curso_id, periodo_id, nombre) DO UPDATE SET docente_id = EXCLUDED.docente_id;
-- Ingeniería de Software I ->Juan Pedro Santos Fernández (Grupo A)
INSERT INTO grupos (curso_id, periodo_id, docente_id, nombre, num_estudiantes) VALUES ('db8277a1-64ec-471c-8402-5fe3bd1eb351', 'b59f7c27-3f9e-492f-b570-da694b1e5018', '77cd84fc-b2d9-4d20-9b0f-86f3bcd3d4e4', 'A', 30) ON CONFLICT (curso_id, periodo_id, nombre) DO UPDATE SET docente_id = EXCLUDED.docente_id;
-- Ingeniería de Software I ->Robert Jerry Sánchez Ticona (Grupo B)
INSERT INTO grupos (curso_id, periodo_id, docente_id, nombre, num_estudiantes) VALUES ('db8277a1-64ec-471c-8402-5fe3bd1eb351', 'b59f7c27-3f9e-492f-b570-da694b1e5018', '0b141ce0-f957-494c-8af7-19e3c5f62a8f', 'B', 30) ON CONFLICT (curso_id, periodo_id, nombre) DO UPDATE SET docente_id = EXCLUDED.docente_id;
-- Metodología de la Investigación Científica ->Paul Cotrina Castellanos (Grupo A)
INSERT INTO grupos (curso_id, periodo_id, docente_id, nombre, num_estudiantes) VALUES ('2dade41f-d1e2-45f8-be7f-f751a9ef5348', 'b59f7c27-3f9e-492f-b570-da694b1e5018', '17f35b7c-eb0d-4b0c-aec9-53fc3536fbd0', 'A', 30) ON CONFLICT (curso_id, periodo_id, nombre) DO UPDATE SET docente_id = EXCLUDED.docente_id;
-- Negocios Electrónicos (e ) ->Everson David Agreda Gamboa (Grupo A)
INSERT INTO grupos (curso_id, periodo_id, docente_id, nombre, num_estudiantes) VALUES ('3d010d2e-a3d4-4142-9777-b3c06a75bb09', 'b59f7c27-3f9e-492f-b570-da694b1e5018', '2779fcc3-684e-4b74-a059-26b2d945ac89', 'A', 30) ON CONFLICT (curso_id, periodo_id, nombre) DO UPDATE SET docente_id = EXCLUDED.docente_id;
-- Negocios Electrónicos (e ) ->Paul Cotrina Castellanos (Grupo B)
INSERT INTO grupos (curso_id, periodo_id, docente_id, nombre, num_estudiantes) VALUES ('3d010d2e-a3d4-4142-9777-b3c06a75bb09', 'b59f7c27-3f9e-492f-b570-da694b1e5018', '17f35b7c-eb0d-4b0c-aec9-53fc3536fbd0', 'B', 30) ON CONFLICT (curso_id, periodo_id, nombre) DO UPDATE SET docente_id = EXCLUDED.docente_id;
-- Planeamiento Estratégico de TI ->Oscar Romel Alcántara Moreno (Grupo A)
INSERT INTO grupos (curso_id, periodo_id, docente_id, nombre, num_estudiantes) VALUES ('86ff4aea-eacf-4da9-becd-0b07afeb74ba', 'b59f7c27-3f9e-492f-b570-da694b1e5018', '7657c8d9-71c1-47d8-80b8-e2c73d01828f', 'A', 30) ON CONFLICT (curso_id, periodo_id, nombre) DO UPDATE SET docente_id = EXCLUDED.docente_id;
-- Redes y Comunicaciones I ->Cesar Arellano Salazar (Grupo A)
INSERT INTO grupos (curso_id, periodo_id, docente_id, nombre, num_estudiantes) VALUES ('6a4e746c-ce0b-411a-873b-e5f5ab9923fd', 'b59f7c27-3f9e-492f-b570-da694b1e5018', '82271db8-ed8a-4189-99aa-230a67f8d3ee', 'A', 30) ON CONFLICT (curso_id, periodo_id, nombre) DO UPDATE SET docente_id = EXCLUDED.docente_id;

COMMIT;

-- Verificación: cursos asignados por docente
SELECT
  d.nombres || ' ' || d.apellidos AS docente,
  c.nombre AS curso,
  c.ciclo,
  g.nombre AS grupo
FROM grupos g
JOIN cursos c ON c.id = g.curso_id
JOIN docentes d ON d.id = g.docente_id
WHERE g.periodo_id = 'b59f7c27-3f9e-492f-b570-da694b1e5018'
ORDER BY c.ciclo, c.nombre, g.nombre;