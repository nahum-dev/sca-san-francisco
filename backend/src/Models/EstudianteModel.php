<?php
declare(strict_types=1);
namespace App\Models;

use App\Config\Database;
use PDO;

final class EstudianteModel
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function getAll(int $limit = 100, int $offset = 0, string $search = ''): array
{
    $params = [];
    $sql = "SELECT e.id, e.codigo, e.nombres, e.apellidos,
                   e.fecha_nac, e.genero, e.grado, e.seccion,
                   e.telefono, u.email, u.activo
            FROM ESTUDIANTES e
            INNER JOIN USUARIOS u ON u.id = e.usuario_id
            WHERE u.activo = 1";

    if (!empty($search)) {
        $sql .= " AND (e.nombres LIKE :search1
                   OR e.apellidos LIKE :search2
                   OR e.codigo LIKE :search3)";
        $params[':search1'] = "%{$search}%";
        $params[':search2'] = "%{$search}%";
        $params[':search3'] = "%{$search}%";
    }

    $sql .= " ORDER BY e.apellidos, e.nombres";
    $stmt = $this->db->prepare($sql);
    $stmt->execute($params);
    return $stmt->fetchAll();
}
        public function findByUsuarioId(int $usuarioId): array|false
    {
        $sql = "SELECT e.*, u.email, u.username
                FROM ESTUDIANTES e
                INNER JOIN USUARIOS u ON u.id = e.usuario_id
                WHERE e.usuario_id = :usuario_id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':usuario_id' => $usuarioId]);
        return $stmt->fetch();
    }

    public function findById(int $id): array|false
    {
        $sql = "SELECT e.*, u.email, u.username, u.activo
                FROM ESTUDIANTES e
                INNER JOIN USUARIOS u ON u.id = e.usuario_id
                WHERE e.id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $id]);
        return $stmt->fetch();
    }

    public function codigoExists(string $codigo): bool
    {
        $sql  = "SELECT COUNT(*) FROM ESTUDIANTES WHERE codigo = :codigo";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':codigo' => $codigo]);
        return (int)$stmt->fetchColumn() > 0;
    }

    public function create(array $data): int
    {
        $sql = "INSERT INTO ESTUDIANTES
                    (usuario_id, codigo, nombres, apellidos,
                     fecha_nac, genero, grado, seccion, telefono, direccion)
                VALUES
                    (:usuario_id, :codigo, :nombres, :apellidos,
                     :fecha_nac, :genero, :grado, :seccion, :telefono, :direccion)";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':usuario_id' => $data['usuario_id'],
            ':codigo'     => $data['codigo'],
            ':nombres'    => $data['nombres'],
            ':apellidos'  => $data['apellidos'],
            ':fecha_nac'  => $data['fecha_nac'],
            ':genero'     => $data['genero'],
            ':grado'      => $data['grado'],
            ':seccion'    => $data['seccion'],
            ':telefono'   => $data['telefono'] ?? null,
            ':direccion'  => $data['direccion'] ?? null,
        ]);
        return (int)$this->db->lastInsertId();
    }

    public function update(int $id, array $data): bool
    {
        $sql = "UPDATE ESTUDIANTES
                SET nombres = :nombres, apellidos = :apellidos,
                    fecha_nac = :fecha_nac, genero = :genero,
                    grado = :grado, seccion = :seccion,
                    telefono = :telefono, direccion = :direccion
                WHERE id = :id";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':nombres'   => $data['nombres'],
            ':apellidos' => $data['apellidos'],
            ':fecha_nac' => $data['fecha_nac'],
            ':genero'    => $data['genero'],
            ':grado'     => $data['grado'],
            ':seccion'   => $data['seccion'],
            ':telefono'  => $data['telefono'] ?? null,
            ':direccion' => $data['direccion'] ?? null,
            ':id'        => $id,
        ]);
        return $stmt->rowCount() > 0;
    }

    public function delete(int $id): bool
    {
        // Primero obtenemos el usuario_id
        $sql  = "SELECT usuario_id FROM ESTUDIANTES WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $id]);
        $est  = $stmt->fetch();

        if (!$est) return false;

        // Desactivar el usuario
        $sql  = "UPDATE USUARIOS SET activo = 0 WHERE id = :uid";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':uid' => $est['usuario_id']]);
        return $stmt->rowCount() > 0;
    }
}