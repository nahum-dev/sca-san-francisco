<?php
declare(strict_types=1);
namespace App\Models;

use App\Config\Database;
use PDO;

final class AsignaturaModel
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function getAll(string $search = ''): array
    {
        $params = [];
        $sql = "SELECT id, codigo, nombre, descripcion, activa, created_at
                FROM ASIGNATURAS WHERE 1=1";

        if (!empty($search)) {
            $sql .= " AND (nombre LIKE :search OR codigo LIKE :search)";
            $params[':search'] = "%{$search}%";
        }

        $sql .= " ORDER BY nombre";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public function findById(int $id): array|false
    {
        $sql  = "SELECT * FROM ASIGNATURAS WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $id]);
        return $stmt->fetch();
    }

    public function codigoExists(string $codigo, ?int $excludeId = null): bool
    {
        $sql    = "SELECT COUNT(*) FROM ASIGNATURAS WHERE codigo = :codigo";
        $params = [':codigo' => $codigo];

        if ($excludeId !== null) {
            $sql .= " AND id != :id";
            $params[':id'] = $excludeId;
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return (int)$stmt->fetchColumn() > 0;
    }

    public function create(array $data): int
    {
        $sql = "INSERT INTO ASIGNATURAS (codigo, nombre, descripcion, activa)
                VALUES (:codigo, :nombre, :descripcion, :activa)";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':codigo'      => $data['codigo'],
            ':nombre'      => $data['nombre'],
            ':descripcion' => $data['descripcion'] ?? null,
            ':activa'      => $data['activa'] ?? 1,
        ]);
        return (int)$this->db->lastInsertId();
    }

    public function update(int $id, array $data): bool
    {
        $sql = "UPDATE ASIGNATURAS
                SET codigo      = :codigo,
                    nombre      = :nombre,
                    descripcion = :descripcion,
                    activa      = :activa
                WHERE id = :id";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':codigo'      => $data['codigo'],
            ':nombre'      => $data['nombre'],
            ':descripcion' => $data['descripcion'] ?? null,
            ':activa'      => $data['activa'] ?? 1,
            ':id'          => $id,
        ]);
        return $stmt->rowCount() > 0;
    }

    public function delete(int $id): bool
    {
        $sql  = "UPDATE ASIGNATURAS SET activa = 0 WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $id]);
        return $stmt->rowCount() > 0;
    }
}