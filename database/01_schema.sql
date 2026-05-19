CREATE DATABASE IF NOT EXISTS sca_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE sca_db;

CREATE TABLE IF NOT EXISTS USUARIOS (
    id            INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    username      VARCHAR(50)   NOT NULL UNIQUE,
    email         VARCHAR(100)  NOT NULL UNIQUE,
    password_hash VARCHAR(255)  NOT NULL,
    rol           TINYINT       NOT NULL DEFAULT 3 COMMENT '1=Admin 2=Docente 3=Estudiante',
    activo        BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ESTUDIANTES (
    id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    usuario_id  INT UNSIGNED  NOT NULL,
    codigo      VARCHAR(20)   NOT NULL UNIQUE,
    nombres     VARCHAR(80)   NOT NULL,
    apellidos   VARCHAR(80)   NOT NULL,
    fecha_nac   DATE          NOT NULL,
    genero      ENUM('M','F') NOT NULL,
    grado       VARCHAR(30)   NOT NULL,
    seccion     VARCHAR(5)    NOT NULL,
    telefono    VARCHAR(20),
    direccion   TEXT,
    created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (usuario_id) REFERENCES USUARIOS(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS DOCENTES (
    id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
    usuario_id   INT UNSIGNED NOT NULL,
    codigo       VARCHAR(20)  NOT NULL UNIQUE,
    nombres      VARCHAR(80)  NOT NULL,
    apellidos    VARCHAR(80)  NOT NULL,
    dui          VARCHAR(10)  NOT NULL UNIQUE,
    especialidad VARCHAR(100),
    telefono     VARCHAR(20),
    created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (usuario_id) REFERENCES USUARIOS(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ASIGNATURAS (
    id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
    codigo      VARCHAR(15)  NOT NULL UNIQUE,
    nombre      VARCHAR(100) NOT NULL,
    descripcion TEXT,
    activa      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS CURSOS (
    id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
    asignatura_id INT UNSIGNED NOT NULL,
    docente_id    INT UNSIGNED NOT NULL,
    anio_escolar  YEAR        NOT NULL,
    periodo       VARCHAR(20)  NOT NULL,
    grado         VARCHAR(30)  NOT NULL,
    seccion       VARCHAR(5)   NOT NULL,
    created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (asignatura_id) REFERENCES ASIGNATURAS(id),
    FOREIGN KEY (docente_id)    REFERENCES DOCENTES(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS MATRICULA (
    id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
    curso_id      INT UNSIGNED NOT NULL,
    estudiante_id INT UNSIGNED NOT NULL,
    fecha_matricula DATE       NOT NULL DEFAULT (CURRENT_DATE),
    estado        ENUM('activo','retirado','egresado') NOT NULL DEFAULT 'activo',
    created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_matricula (curso_id, estudiante_id),
    FOREIGN KEY (curso_id)      REFERENCES CURSOS(id),
    FOREIGN KEY (estudiante_id) REFERENCES ESTUDIANTES(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS NOTAS (
    id           INT UNSIGNED  NOT NULL AUTO_INCREMENT,
    matricula_id INT UNSIGNED   NOT NULL,
    tipo_eval    ENUM('examen','tarea','proyecto','participacion') NOT NULL,
    descripcion  VARCHAR(150)   NOT NULL,
    calificacion DECIMAL(5,2)   NOT NULL,
    nota_maxima  DECIMAL(5,2)   NOT NULL DEFAULT 10.00,
    fecha_eval   DATE           NOT NULL,
    created_at   TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (matricula_id) REFERENCES MATRICULA(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ASISTENCIA (
    id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
    matricula_id   INT UNSIGNED  NOT NULL,
    fecha          DATE          NOT NULL,
    estado         ENUM('presente','ausente','tardanza','justificado') NOT NULL DEFAULT 'presente',
    observaciones  VARCHAR(255),
    registrado_por INT UNSIGNED  NOT NULL,
    created_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_asistencia (matricula_id, fecha),
    FOREIGN KEY (matricula_id)   REFERENCES MATRICULA(id) ON DELETE CASCADE,
    FOREIGN KEY (registrado_por) REFERENCES USUARIOS(id)
) ENGINE=InnoDB;