<?php
declare(strict_types=1);
namespace App\Models;

use App\Config\Database;
use PDO;

final class CursoModel
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function getAll(string $search = ''): array
{
    $params = [];
    $sql = "SELECT c.id, c.anio_escolar, c.periodo, c.grado, c.seccion, c.activo,
                   a.id AS asignatura_id, a.codigo AS asignatura_codigo,
                   a.nombre AS asignatura_nombre,
                   d.id AS docente_id, d.nombres AS docente_nombres,
                   d.apellidos AS docente_apellidos
            FROM CURSOS c
            INNER JOIN ASIGNATURAS a ON a.id = c.asignatura_id
            INNER JOIN DOCENTES d    ON d.id = c.docente_id
            WHERE c.activo = 1";

    if (!empty($search)) {
        $sql .= " AND (a.nombre LIKE :search1
                   OR d.nombres LIKE :search2
                   OR d.apellidos LIKE :search3
                   OR c.grado LIKE :search4)";
        $params[':search1'] = "%{$search}%";
        $params[':search2'] = "%{$search}%";
        $params[':search3'] = "%{$search}%";
        $params[':search4'] = "%{$search}%";
    }

    $sql .= " ORDER BY c.anio_escolar DESC, c.grado, c.seccion";
    $stmt = $this->db->prepare($sql);
    $stmt->execute($params);
    return $stmt->fetchAll();
}

    public function findById(int $id): array|false
    {
        $sql = "SELECT c.*, 
                       a.nombre AS asignatura_nombre, a.codigo AS asignatura_codigo,
                       d.nombres AS docente_nombres, d.apellidos AS docente_apellidos
                FROM CURSOS c
                INNER JOIN ASIGNATURAS a ON a.id = c.asignatura_id
                INNER JOIN DOCENTES d    ON d.id = c.docente_id
                WHERE c.id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $id]);
        return $stmt->fetch();
    }

    public function getByDocente(int $docenteId): array
    {
        $sql = "SELECT c.id, c.anio_escolar, c.periodo, c.grado, c.seccion,
                       a.nombre AS asignatura_nombre, a.codigo AS asignatura_codigo
                FROM CURSOS c
                INNER JOIN ASIGNATURAS a ON a.id = c.asignatura_id
                WHERE c.docente_id = :docente_id AND c.activo = 1
                ORDER BY c.anio_escolar DESC, a.nombre";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':docente_id' => $docenteId]);
        return $stmt->fetchAll();
    }

    public function create(array $data): int
    {
        $sql = "INSERT INTO CURSOS
                    (asignatura_id, docente_id, anio_escolar, periodo, grado, seccion, activo)
                VALUES
                    (:asignatura_id, :docente_id, :anio_escolar, :periodo, :grado, :seccion, 1)";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':asignatura_id' => $data['asignatura_id'],
            ':docente_id'    => $data['docente_id'],
            ':anio_escolar'  => $data['anio_escolar'],
            ':periodo'       => $data['periodo'],
            ':grado'         => $data['grado'],
            ':seccion'       => $data['seccion'],
        ]);
        return (int)$this->db->lastInsertId();
    }

    public function update(int $id, array $data): bool
    {
        $sql = "UPDATE CURSOS
                SET asignatura_id = :asignatura_id,
                    docente_id    = :docente_id,
                    anio_escolar  = :anio_escolar,
                    periodo       = :periodo,
                    grado         = :grado,
                    seccion       = :seccion
                WHERE id = :id";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':asignatura_id' => $data['asignatura_id'],
            ':docente_id'    => $data['docente_id'],
            ':anio_escolar'  => $data['anio_escolar'],
            ':periodo'       => $data['periodo'],
            ':grado'         => $data['grado'],
            ':seccion'       => $data['seccion'],
            ':id'            => $id,
        ]);
        return $stmt->rowCount() > 0;
    }

    public function delete(int $id): bool
    {
        $sql  = "UPDATE CURSOS SET activo = 0 WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $id]);
        return $stmt->rowCount() > 0;
    }
}