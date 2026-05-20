#  Sistema de Control Académico
### Centro Escolar "San Francisco de Asís"

Sistema digital de control académico multiplataforma desarrollado con React Native, PHP y MySQL, contenerizado con Docker.

---

##  Tabla de Contenidos

- [Tecnologías](#tecnologías)
- [Requisitos Previos](#requisitos-previos)
- [Instalación con XAMPP](#instalación-con-xampp-desarrollo)
- [Instalación con Docker](#instalación-con-docker)
- [Usuarios de Prueba](#usuarios-de-prueba)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [API Endpoints](#api-endpoints)

---

##  Tecnologías

| Capa            | Tecnología                   |
|------           | ----------                   |
| Frontend        | React Native + Expo          |
| Backend         | PHP 8.2 (Clean Architecture) |
| Base de Datos   | MySQL 8.0                    |
| Autenticación   | JWT (JSON Web Tokens)        |
| Contenerización | Docker + Docker Compose      |

---

##  Requisitos Previos

### Para desarrollo con XAMPP
- [XAMPP](https://www.apachefriends.org/) (PHP 8.1+ y MySQL)
- [Composer](https://getcomposer.org/)
- [Node.js](https://nodejs.org/) (v20+)
- [Expo Go](https://expo.dev/go) en tu celular

### Para Docker
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

---

##  Instalación con XAMPP (Desarrollo)

### Paso 1 — Clonar el repositorio

```bash
git clone https://github.com/TU_USUARIO/sca-san-francisco.git
cd sca-san-francisco
```

### Paso 2 — Configurar la base de datos

1. Abre XAMPP y enciende **Apache** y **MySQL**
2. Ve a `http://localhost/phpmyadmin`
3. En la pestaña **SQL** ejecuta el archivo `database/01_schema.sql`
4. Luego ejecuta `database/02_seed.sql`
5. Genera el hash de contraseña:

```bash
php -r "echo password_hash('Admin2024', PASSWORD_BCRYPT, ['cost' => 12]);"
```

6. Actualiza las contraseñas en phpMyAdmin:

```sql
UPDATE USUARIOS SET password_hash = 'HASH_GENERADO_AQUI';
```

### Paso 3 — Configurar el backend

```bash
cd backend
composer install
```

Copia el archivo de variables de entorno:

```bash
copy .env.example .env
```

Edita el archivo `.env` con tus datos de MySQL.

### Paso 4 — Levantar el servidor PHP

```bash
php -S 0.0.0.0:8000 -t public/
```

### Paso 5 — Configurar el frontend

```bash
cd ../frontend
npm install
```

Abre `frontend/src/utils/constants.js` y actualiza la IP:

```javascript
// Reemplaza con tu IP local (ejecuta ipconfig para verla)
export const API_URL = 'http://TU_IP:8000';
```

### Paso 6 — Levantar Expo

```bash
npx expo start --clear
```

Escanea el QR con la app **Expo Go** en tu celular.

>  El celular y la computadora deben estar en la misma red WiFi.

---

## 🐳 Instalación con Docker

### Paso 1 — Clonar el repositorio

```bash
git clone https://github.com/TU_USUARIO/sca-san-francisco.git
cd sca-san-francisco
```

### Paso 2 — Construir y levantar los contenedores

```bash
docker compose up --build
```

Esto levanta automáticamente:
-  MySQL en el puerto `3307`
-  Backend PHP en el puerto `8000`
-  Frontend Expo Web en el puerto `8081`

### Paso 3 — Insertar datos de prueba

Con los contenedores corriendo, abre otra terminal:

```bash
docker exec -it sca_mysql mysql -u sca_user -psca_pass_2024 sca_db
```

Dentro del prompt MySQL pega el contenido de `database/02_seed.sql` y luego:

```sql
UPDATE USUARIOS SET password_hash = 'HASH_AQUI';
exit;
```

### Paso 4 — Acceder al sistema

| Servicio | URL |
|---|---|
| App Web | http://localhost:8081 |
| API Backend | http://localhost:8000 |
| Base de datos | localhost:3307 |

### Detener los contenedores

```bash
docker compose down
```

### Detener y eliminar datos

```bash
docker compose down -v
```

---

##  Usuarios de Prueba

| Usuario      | Contraseña | Rol           |
|--      -     |---         |---            |
| `admin`      | `password` | Administrador |
| `doc.carlos` | `password` | Docente       |
| `doc.maria`  | `password` | Docente       |
| `est.juan`   | `password` | Estudiante    |
| `est.sofia`  | `password` | Estudiante    |

---

##  Estructura del Proyecto

---

##  API Endpoints

### Autenticación
| Método | Endpoint | Descripción |
|---     |---|---|
| POST | `/api/auth/login` | Iniciar sesión |
| GET | `/api/auth/me` | Datos del usuario actual |
| POST | `/api/auth/cambiar-password` | Cambiar contraseña |

### Estudiantes
| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/estudiantes` | Listar estudiantes |
| GET | `/api/estudiantes/{id}` | Ver un estudiante |
| POST | `/api/estudiantes` | Crear estudiante |
| PUT | `/api/estudiantes/{id}` | Actualizar estudiante |
| DELETE | `/api/estudiantes/{id}` | Eliminar estudiante |

### Docentes
| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/docentes` | Listar docentes |
| POST | `/api/docentes` | Crear docente |
| PUT | `/api/docentes/{id}` | Actualizar docente |
| DELETE | `/api/docentes/{id}` | Eliminar docente |

### Asignaturas
| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/asignaturas` | Listar asignaturas |
| POST | `/api/asignaturas` | Crear asignatura |
| PUT | `/api/asignaturas/{id}` | Actualizar asignatura |
| DELETE | `/api/asignaturas/{id}` | Desactivar asignatura |

### Cursos
| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/cursos` | Listar cursos |
| GET | `/api/cursos/docente` | Cursos del docente actual |
| POST | `/api/cursos` | Crear curso |
| PUT | `/api/cursos/{id}` | Actualizar curso |
| DELETE | `/api/cursos/{id}` | Desactivar curso |

### Matrículas
| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/matriculas/curso?curso_id=1` | Estudiantes de un curso |
| GET | `/api/matriculas/estudiante?estudiante_id=1` | Cursos de un estudiante |
| POST | `/api/matriculas` | Matricular estudiante |
| DELETE | `/api/matriculas/{id}` | Eliminar matrícula |

### Notas
| Método | Endpoint                    | Descripción     |
|---     |---                          |---              |
| GET    | `/api/notas?matricula_id=1` | Ver notas de una matrícula |
| POST   | `/api/notas`                | Registrar nota  |
| PUT    | `/api/notas/{id}`           | Actualizar nota |
| DELETE | `/api/notas/{id}`           | Eliminar nota   |

### Asistencia
| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/asistencia?curso_id=1&fecha=2026-02-17` | Ver asistencia |
| POST | `/api/asistencia` | Guardar asistencia |
| GET | `/api/asistencia/reporte-curso?curso_id=1` | Reporte por curso |
| GET | `/api/asistencia/reporte?matricula_id=1` | Reporte por estudiante |

---

##  Seguridad Implementada

- **JWT** para autenticación stateless
- **bcrypt** para hash de contraseñas
- **Prepared Statements** para prevenir SQL Injection
- **Roles** de acceso (Admin, Docente, Estudiante)
- **CORS** configurado por variables de entorno

---

##  Equipo de Desarrollo

Anderson Ruben Portillo Alfaro                           PA250105                             
Nahum de Jesus Flore Giron                         FG250084                             
Ana Ruth López Lima                                            LL250088                             
Diana Guadalupe Rivera Navas RN250387                             
Rudy Mauricio Gonzalez Pineda            
GP250120 

Centro Escolar San Francisco de Asís — Universidad Don Bosco 2026