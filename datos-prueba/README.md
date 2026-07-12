# Datos de Prueba para Sistema de Horarios

Este directorio contiene archivos CSV con datos de prueba para cargar en el sistema de gestión de horarios.

## Archivos Disponibles

### 1. docentes_prueba.csv
Contiene 15 docentes de prueba con diferentes categorías, regímenes y condiciones.

**Campos:**
- `id`: Identificador único (d1, d2, etc.)
- `nombres`: Nombres del docente
- `apellidos`: Apellidos del docente
- `dni`: Documento de identidad
- `correo`: Correo electrónico institucional
- `telefono`: Teléfono de contacto
- `categoria`: Principal, Asociado, Auxiliar
- `regimen`: Dedicación Exclusiva (40h), Tiempo Completo (20h), Tiempo Parcial (12h)
- `condicion`: Nombrado, Contratado
- `escuela`: Escuela de procedencia (Ingeniería, Contabilidad, Economía, etc.)
- `fechaIngreso`: Fecha de ingreso a la institución
- `cargaMaxima`: Carga horaria máxima según régimen
- `cargaElectiva`: Carga lectiva asignada (0 para nuevos docentes)
- `estado`: Activo o Inactivo
- `createdAt`: Fecha de creación del registro
- `updatedAt`: Fecha de última actualización

### 2. cursos_prueba.csv
Contiene 25 cursos de prueba de diferentes áreas y ciclos.

**Campos:**
- `id`: Identificador único (c1, c2, etc.)
- `codigo`: Código del curso (CS101, MAT101, etc.)
- `nombre`: Nombre del curso
- `ciclo`: Ciclo académico (I-X)
- `tipo`: Teórico, Práctico, Teórico-Práctico
- `horasTeoricas`: Horas de teoría semanales
- `horasPracticas`: Horas de práctica semanales
- `creditos`: Créditos académicos
- `requiereLaboratorio`: true/false
- `tipoLaboratorio`: Tipo de laboratorio requerido (si aplica)
- `estado`: Activo o Inactivo
- `planEstudioId`: ID del plan de estudios (plan1 para todos)
- `createdAt`: Fecha de creación del registro
- `updatedAt`: Fecha de última actualización

## Cómo Usar

### Opción 1: Carga Masiva desde la Interfaz
1. Inicia sesión como director o secretaria
2. Ve a la sección de Docentes o Cursos
3. Usa la función de "Carga Masiva" o "Importar"
4. Selecciona el archivo CSV correspondiente
5. Revisa los datos y confirma la importación

### Opción 2: Carga Manual
1. Abre el archivo CSV en Excel o Google Sheets
2. Copia los datos necesarios
3. Pega en el formulario de creación del sistema
4. Repite para cada registro

## Datos Adicionales Necesarios

Para generar horarios completos, también necesitarás:

### Grupos
Cada curso necesita al menos un grupo con:
- Número de estudiantes
- Docente asignado (opcional, el sistema puede asignar automáticamente)

### Aulas
Aulas disponibles con:
- Capacidad
- Tipo (Aula Teórica, Laboratorio, Auditorio)
- Estado (Activa/Inactiva)

### Disponibilidad
Horarios disponibles para cada docente:
- Día de la semana
- Bloque horario
- Estado (disponible, preferido, no_disponible)

### Plan de Estudios
Configuración del periodo académico:
- Nombre del periodo
- Fechas de inicio y fin
- Estado (Activo/Inactivo)

## Notas

- Los IDs en los archivos CSV son temporales y pueden ser reemplazados por UUIDs reales al importar
- Los correos electrónicos usan el dominio @unt.edu.pe como ejemplo
- Los DNIs son ficticios y solo para pruebas
- Las fechas están en formato ISO 8601
- Los docentes tienen cargaElectiva = 0, lo que significa que no tienen cursos asignados inicialmente
