-- ============================================================
-- DATOS DE PRUEBA - Sistema de Control Académico SFA
-- Contraseña para todos los usuarios: Admin2024
-- IMPORTANTE: Primero ejecutar 01_schema.sql
-- ============================================================

USE sca_db;

-- USUARIOS
INSERT INTO USUARIOS (username, email, password_hash, rol, activo) VALUES
('admin',        'admin@sfa.edu.sv',          '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, 1),
('doc.carlos',   'carlos.lopez@sfa.edu.sv',   '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 2, 1),
('doc.maria',    'maria.garcia@sfa.edu.sv',   '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 2, 1),
('doc.roberto',  'roberto.diaz@sfa.edu.sv',   '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 2, 1),
('est.juan',     'juan.martinez@sfa.edu.sv',  '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 3, 1),
('est.sofia',    'sofia.ramos@sfa.edu.sv',    '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 3, 1),
('est.pedro',    'pedro.hdz@sfa.edu.sv',      '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 3, 1),
('est.ana',      'ana.flores@sfa.edu.sv',     '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 3, 1),
('est.luis',     'luis.morales@sfa.edu.sv',   '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 3, 1),
('est.gabriela', 'gaby.torres@sfa.edu.sv',    '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 3, 1);

-- DOCENTES
INSERT INTO DOCENTES (usuario_id, codigo, nombres, apellidos, dui, especialidad, telefono) VALUES
(2, 'DOC-2026-001', 'Carlos Enrique', 'López Molina',  '01234567-8', 'Matemáticas',           '7890-1234'),
(3, 'DOC-2026-002', 'María Fernanda', 'García Reyes',  '09876543-2', 'Lenguaje y Literatura',  '7654-3210'),
(4, 'DOC-2026-003', 'Roberto José',   'Díaz Fuentes',  '05678901-3', 'Ciencias Naturales',    '7321-0987');

-- ESTUDIANTES
INSERT INTO ESTUDIANTES (usuario_id, codigo, nombres, apellidos, fecha_nac, genero, grado, seccion, telefono) VALUES
(5,  '2026-001', 'Juan Carlos',    'Martínez Pérez',   '2008-03-15', 'M', '9no Grado', 'A', '7100-0001'),
(6,  '2026-002', 'Sofía Alejandra','Ramos Velásquez',  '2008-07-22', 'F', '9no Grado', 'A', '7100-0002'),
(7,  '2026-003', 'Pedro Antonio',  'Hernández Torres', '2009-01-10', 'M', '8vo Grado', 'B', '7100-0003'),
(8,  '2026-004', 'Ana Lucía',      'Flores Guzmán',    '2008-11-05', 'F', '9no Grado', 'A', '7100-0004'),
(9,  '2026-005', 'Luis Fernando',  'Morales Castillo', '2009-04-18', 'M', '8vo Grado', 'B', '7100-0005'),
(10, '2026-006', 'Gabriela María', 'Torres Mendoza',   '2008-09-30', 'F', '9no Grado', 'B', '7100-0006');

-- ASIGNATURAS
INSERT INTO ASIGNATURAS (codigo, nombre, descripcion, activa) VALUES
('MAT-901', 'Matemáticas',           'Álgebra, geometría y aritmética avanzada',   1),
('LEN-901', 'Lenguaje y Literatura', 'Comprensión lectora, escritura y gramática',  1),
('CIE-901', 'Ciencias Naturales',    'Biología, química y física básica',           1),
('SOC-901', 'Estudios Sociales',     'Historia, geografía y civismo',               1),
('ING-901', 'Inglés',                'Comunicación en idioma inglés',               1);

-- CURSOS
INSERT INTO CURSOS (asignatura_id, docente_id, anio_escolar, periodo, grado, seccion, activo) VALUES
(1, 1, 2026, '1er Trimestre', '9no Grado', 'A', 1),
(2, 2, 2026, '1er Trimestre', '9no Grado', 'A', 1),
(3, 3, 2026, '1er Trimestre', '9no Grado', 'A', 1),
(1, 1, 2026, '1er Trimestre', '8vo Grado', 'B', 1),
(2, 2, 2026, '1er Trimestre', '8vo Grado', 'B', 1),
(3, 3, 2026, '1er Trimestre', '9no Grado', 'B', 1);

-- MATRÍCULAS
INSERT INTO MATRICULA (curso_id, estudiante_id, fecha_matricula, estado) VALUES
(1, 1, '2026-01-15', 'activo'),
(1, 2, '2026-01-15', 'activo'),
(1, 4, '2026-01-15', 'activo'),
(1, 6, '2026-01-15', 'activo'),
(2, 1, '2026-01-15', 'activo'),
(2, 2, '2026-01-15', 'activo'),
(2, 4, '2026-01-15', 'activo'),
(3, 1, '2026-01-15', 'activo'),
(3, 2, '2026-01-15', 'activo'),
(4, 3, '2026-01-15', 'activo'),
(4, 5, '2026-01-15', 'activo'),
(5, 3, '2026-01-15', 'activo'),
(5, 5, '2026-01-15', 'activo'),
(6, 6, '2026-01-15', 'activo');

-- NOTAS
INSERT INTO NOTAS (matricula_id, tipo_eval, descripcion, calificacion, nota_maxima, fecha_eval) VALUES
(1, 'examen',        'Examen Parcial 1 - Álgebra',     8.50, 10.00, '2026-02-20'),
(1, 'tarea',         'Tarea: Ecuaciones lineales',      9.00, 10.00, '2026-02-10'),
(1, 'proyecto',      'Proyecto: Geometría analítica',   8.75, 10.00, '2026-03-05'),
(1, 'participacion', 'Participación en clase',          9.50, 10.00, '2026-02-28'),
(2, 'examen',        'Examen Parcial 1 - Álgebra',     7.50, 10.00, '2026-02-20'),
(2, 'tarea',         'Tarea: Ecuaciones lineales',      9.50, 10.00, '2026-02-10'),
(3, 'examen',        'Examen Parcial 1 - Álgebra',     6.00, 10.00, '2026-02-20'),
(5, 'examen',        'Examen Comprensión Lectora',      8.00, 10.00, '2026-02-22'),
(5, 'tarea',         'Redacción: Ensayo argumentativo', 9.00, 10.00, '2026-02-15'),
(6, 'examen',        'Examen Comprensión Lectora',      9.00, 10.00, '2026-02-22'),
(10, 'examen',       'Examen Parcial 1',                7.00, 10.00, '2026-02-20'),
(11, 'examen',       'Examen Parcial 1',                6.50, 10.00, '2026-02-20');

-- ASISTENCIA
INSERT INTO ASISTENCIA (matricula_id, fecha, estado, registrado_por) VALUES
(1, '2026-02-17', 'presente',    2),
(1, '2026-02-18', 'presente',    2),
(1, '2026-02-19', 'tardanza',    2),
(1, '2026-02-20', 'presente',    2),
(1, '2026-02-21', 'presente',    2),
(2, '2026-02-17', 'presente',    2),
(2, '2026-02-18', 'ausente',     2),
(2, '2026-02-19', 'justificado', 2),
(2, '2026-02-20', 'presente',    2),
(2, '2026-02-21', 'presente',    2),
(3, '2026-02-17', 'presente',    2),
(3, '2026-02-18', 'presente',    2),
(3, '2026-02-19', 'presente',    2),
(10, '2026-02-17', 'presente',   2),
(10, '2026-02-18', 'presente',   2),
(11, '2026-02-17', 'ausente',    2),
(11, '2026-02-18', 'presente',   2);