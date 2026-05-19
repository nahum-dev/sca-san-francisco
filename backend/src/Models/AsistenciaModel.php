<?php
declare(strict_types=1);
namespace App\Models;

use App\Config\Database;
use PDO;

final class AsistenciaModel
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function getByCursoAndFecha(int $cursoId, string $fecha): array
{
    $sql = "SELECT a.id, a.fecha, a.estado, a.observaciones,
                   e.id AS estudiante_id, e.codigo,
                   e.nombres, e.apellidos, e.grado, e.seccion,
                   m.id AS matricula_id,
                   c.periodo, asig.nombre AS asignatura_nombre
            FROM MATRICULA m
            INNER JOIN ESTUDIANTES e ON e.id = m.estudiante_id
            INNER JOIN CURSOS c      ON c.id = m.curso_id
            INNER JOIN ASIGNATURAS asig ON asig.id = c.asignatura_id
            LEFT JOIN ASISTENCIA a ON a.matricula_id = m.id
                AND a.fecha = :fecha
            WHERE m.curso_id = :curso_id
              AND m.estado = 'activo'
            ORDER BY e.apellidos, e.nombres";

    $stmt = $this->db->prepare($sql);
    $stmt->execute([':fecha' => $fecha, ':curso_id' => $cursoId]);
    return $stmt->fetchAll();
}
    public function getResumenByMatricula(int $matriculaId): array
    {
        $sql = "SELECT COUNT(*) AS total_dias,
                    SUM(estado = 'presente')    AS presentes,
                    SUM(estado = 'ausente')     AS ausentes,
                    SUM(estado = 'tardanza')    AS tardanzas,
                    SUM(estado = 'justificado') AS justificados
                FROM ASISTENCIA WHERE matricula_id = :matricula_id";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([':matricula_id' => $matriculaId]);
        return $stmt->fetch();
    }

    public function exists(int $matriculaId, string $fecha): bool
    {
        $sql  = "SELECT COUNT(*) FROM ASISTENCIA WHERE matricula_id = :matricula_id AND fecha = :fecha";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':matricula_id' => $matriculaId, ':fecha' => $fecha]);
        return (int)$stmt->fetchColumn() > 0;
    }

    public function create(array $data): int
    {
        $sql = "INSERT INTO ASISTENCIA (matricula_id, fecha, estado, observaciones, registrado_por)
                VALUES (:matricula_id, :fecha, :estado, :observaciones, :registrado_por)";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':matricula_id'   => $data['matricula_id'],
            ':fecha'          => $data['fecha'],
            ':estado'         => $data['estado'],
            ':observaciones'  => $data['observaciones'] ?? null,
            ':registrado_por' => $data['registrado_por'],
        ]);
        return (int)$this->db->lastInsertId();
    }

    public function update(int $matriculaId, string $fecha, array $data): bool
    {
        $sql = "UPDATE ASISTENCIA SET estado = :estado, observaciones = :observaciones
                WHERE matricula_id = :matricula_id AND fecha = :fecha";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':estado'        => $data['estado'],
            ':observaciones' => $data['observaciones'] ?? null,
            ':matricula_id'  => $matriculaId,
            ':fecha'         => $fecha,
        ]);
        return $stmt->rowCount() > 0;
    }

    public function getReporteByMatricula(int $matriculaId): array
{
    $sql = "SELECT a.fecha, a.estado, a.observaciones,
                   e.nombres, e.apellidos, e.codigo,
                   asig.nombre AS asignatura_nombre,
                   c.grado, c.seccion, c.periodo, c.anio_escolar
            FROM ASISTENCIA a
            INNER JOIN MATRICULA m      ON m.id = a.matricula_id
            INNER JOIN ESTUDIANTES e    ON e.id = m.estudiante_id
            INNER JOIN CURSOS c         ON c.id = m.curso_id
            INNER JOIN ASIGNATURAS asig ON asig.id = c.asignatura_id
            WHERE a.matricula_id = :matricula_id
            ORDER BY a.fecha DESC";

    $stmt = $this->db->prepare($sql);
    $stmt->execute([':matricula_id' => $matriculaId]);
    return $stmt->fetchAll();
}

public function getReporteByCurso(int $cursoId): array
{
    $sql = "SELECT
                e.id AS estudiante_id,
                e.codigo, e.nombres, e.apellidos,
                m.id AS matricula_id,
                COUNT(a.id)                          AS total_dias,
                SUM(a.estado = 'presente')           AS presentes,
                SUM(a.estado = 'ausente')            AS ausentes,
                SUM(a.estado = 'tardanza')           AS tardanzas,
                SUM(a.estado = 'justificado')        AS justificados,
                ROUND(
                  (SUM(a.estado = 'presente') / NULLIF(COUNT(a.id), 0)) * 100
                , 1)                                 AS porcentaje
            FROM MATRICULA m
            INNER JOIN ESTUDIANTES e ON e.id = m.estudiante_id
            LEFT JOIN ASISTENCIA a   ON a.matricula_id = m.id
            WHERE m.curso_id = :curso_id
              AND m.estado = 'activo'
            GROUP BY e.id, m.id
            ORDER BY e.apellidos, e.nombres";

    $stmt = $this->db->prepare($sql);
    $stmt->execute([':curso_id' => $cursoId]);
    return $stmt->fetchAll();
}
}