<?php
declare(strict_types=1);
namespace App\Models;

use App\Config\Database;
use PDO;

final class MatriculaModel
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function getByCurso(int $cursoId): array
    {
        $sql = "SELECT m.id, m.estado, m.fecha_matricula,
                       e.id AS estudiante_id, e.codigo,
                       e.nombres, e.apellidos, e.grado, e.seccion
                FROM MATRICULA m
                INNER JOIN ESTUDIANTES e ON e.id = m.estudiante_id
                WHERE m.curso_id = :curso_id
                ORDER BY e.apellidos, e.nombres";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([':curso_id' => $cursoId]);
        return $stmt->fetchAll();
    }

    public function getByEstudiante(int $estudianteId): array
    {
        $sql = "SELECT m.id, m.estado, m.fecha_matricula,
                       c.id AS curso_id, c.anio_escolar, c.periodo, c.grado, c.seccion,
                       a.nombre AS asignatura_nombre, a.codigo AS asignatura_codigo,
                       d.nombres AS docente_nombres, d.apellidos AS docente_apellidos
                FROM MATRICULA m
                INNER JOIN CURSOS c      ON c.id = m.curso_id
                INNER JOIN ASIGNATURAS a ON a.id = c.asignatura_id
                INNER JOIN DOCENTES d    ON d.id = c.docente_id
                WHERE m.estudiante_id = :estudiante_id
                ORDER BY c.anio_escolar DESC, a.nombre";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([':estudiante_id' => $estudianteId]);
        return $stmt->fetchAll();
    }

    public function findById(int $id): array|false
    {
        $sql = "SELECT m.*, e.nombres, e.apellidos,
                       c.grado, c.seccion, c.periodo
                FROM MATRICULA m
                INNER JOIN ESTUDIANTES e ON e.id = m.estudiante_id
                INNER JOIN CURSOS c      ON c.id = m.curso_id
                WHERE m.id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $id]);
        return $stmt->fetch();
    }

    public function exists(int $cursoId, int $estudianteId): bool
    {
        $sql = "SELECT COUNT(*) FROM MATRICULA
                WHERE curso_id = :curso_id AND estudiante_id = :estudiante_id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':curso_id'      => $cursoId,
            ':estudiante_id' => $estudianteId,
        ]);
        return (int)$stmt->fetchColumn() > 0;
    }

    public function create(array $data): int
    {
        $sql = "INSERT INTO MATRICULA (curso_id, estudiante_id, fecha_matricula, estado)
                VALUES (:curso_id, :estudiante_id, :fecha_matricula, 'activo')";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':curso_id'       => $data['curso_id'],
            ':estudiante_id'  => $data['estudiante_id'],
            ':fecha_matricula'=> $data['fecha_matricula'] ?? date('Y-m-d'),
        ]);
        return (int)$this->db->lastInsertId();
    }

    public function updateEstado(int $id, string $estado): bool
    {
        $sql  = "UPDATE MATRICULA SET estado = :estado WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':estado' => $estado, ':id' => $id]);
        return $stmt->rowCount() > 0;
    }

    public function delete(int $id): bool
    {
        $sql  = "DELETE FROM MATRICULA WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $id]);
        return $stmt->rowCount() > 0;
    }
}