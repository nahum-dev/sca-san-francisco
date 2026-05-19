<?php
declare(strict_types=1);
namespace App\Models;

use App\Config\Database;
use PDO;

final class NotaModel
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function getByMatricula(int $matriculaId): array
{
    $sql = "SELECT n.id, n.tipo_eval, n.descripcion,
                   n.calificacion, n.nota_maxima, n.fecha_eval,
                   e.nombres, e.apellidos, e.codigo,
                   a.nombre AS asignatura_nombre,
                   m.id AS matricula_id
            FROM NOTAS n
            INNER JOIN MATRICULA m    ON m.id = n.matricula_id
            INNER JOIN ESTUDIANTES e  ON e.id = m.estudiante_id
            INNER JOIN CURSOS c       ON c.id = m.curso_id
            INNER JOIN ASIGNATURAS a  ON a.id = c.asignatura_id
            WHERE n.matricula_id = :matricula_id
            ORDER BY n.fecha_eval DESC";

    $stmt = $this->db->prepare($sql);
    $stmt->execute([':matricula_id' => $matriculaId]);
    return $stmt->fetchAll();
}

    public function getPromedio(int $matriculaId): array
{
    $sql = "SELECT
                COUNT(n.id)                AS total_evaluaciones,
                ROUND(AVG(n.calificacion), 2) AS promedio,
                MIN(n.calificacion)        AS nota_minima,
                MAX(n.calificacion)        AS nota_maxima,
                e.nombres, e.apellidos, e.codigo,
                a.nombre AS asignatura_nombre
            FROM MATRICULA m
            INNER JOIN ESTUDIANTES e  ON e.id = m.estudiante_id
            INNER JOIN CURSOS c       ON c.id = m.curso_id
            INNER JOIN ASIGNATURAS a  ON a.id = c.asignatura_id
            LEFT JOIN NOTAS n         ON n.matricula_id = m.id
            WHERE m.id = :matricula_id
            GROUP BY e.id, a.id";

    $stmt = $this->db->prepare($sql);
    $stmt->execute([':matricula_id' => $matriculaId]);
    return $stmt->fetch();
}

    public function findById(int $id): array|false
    {
        $sql  = "SELECT * FROM NOTAS WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $id]);
        return $stmt->fetch();
    }

    public function create(array $data): int
    {
        $sql = "INSERT INTO NOTAS (matricula_id, tipo_eval, descripcion, calificacion, nota_maxima, fecha_eval)
                VALUES (:matricula_id, :tipo_eval, :descripcion, :calificacion, :nota_maxima, :fecha_eval)";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':matricula_id' => $data['matricula_id'],
            ':tipo_eval'    => $data['tipo_eval'],
            ':descripcion'  => $data['descripcion'],
            ':calificacion' => $data['calificacion'],
            ':nota_maxima'  => $data['nota_maxima'] ?? 10.00,
            ':fecha_eval'   => $data['fecha_eval'],
        ]);
        return (int)$this->db->lastInsertId();
    }

    public function update(int $id, array $data): bool
    {
        $sql = "UPDATE NOTAS SET tipo_eval = :tipo_eval, descripcion = :descripcion,
                    calificacion = :calificacion, nota_maxima = :nota_maxima, fecha_eval = :fecha_eval
                WHERE id = :id";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':tipo_eval'    => $data['tipo_eval'],
            ':descripcion'  => $data['descripcion'],
            ':calificacion' => $data['calificacion'],
            ':nota_maxima'  => $data['nota_maxima'] ?? 10.00,
            ':fecha_eval'   => $data['fecha_eval'],
            ':id'           => $id,
        ]);
        return $stmt->rowCount() > 0;
    }

    public function delete(int $id): bool
    {
        $sql  = "DELETE FROM NOTAS WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $id]);
        return $stmt->rowCount() > 0;
    }
}