<?php
declare(strict_types=1);
namespace App\Models;

use App\Config\Database;
use PDO;

final class DocenteModel
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function getAll(string $search = ''): array
{
    $params = [];
    $sql = "SELECT d.id, d.codigo, d.nombres, d.apellidos,
                   d.dui, d.especialidad, d.telefono, u.email, u.activo
            FROM DOCENTES d
            INNER JOIN USUARIOS u ON u.id = d.usuario_id
            WHERE u.activo = 1";

    if (!empty($search)) {
        $sql .= " AND (d.nombres LIKE :search1
                   OR d.apellidos LIKE :search2
                   OR d.codigo LIKE :search3
                   OR CONCAT(d.nombres, ' ', d.apellidos) LIKE :search4)";
        $params[':search1'] = "%{$search}%";
        $params[':search2'] = "%{$search}%";
        $params[':search3'] = "%{$search}%";
        $params[':search4'] = "%{$search}%";
    }

    $sql .= " ORDER BY d.apellidos, d.nombres";
    $stmt = $this->db->prepare($sql);
    $stmt->execute($params);
    return $stmt->fetchAll();
}

    public function findById(int $id): array|false
    {
        $sql = "SELECT d.*, u.email, u.username, u.activo
                FROM DOCENTES d
                INNER JOIN USUARIOS u ON u.id = d.usuario_id
                WHERE d.id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $id]);
        return $stmt->fetch();
    }

    public function codigoExists(string $codigo): bool
    {
        $sql  = "SELECT COUNT(*) FROM DOCENTES WHERE codigo = :codigo";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':codigo' => $codigo]);
        return (int)$stmt->fetchColumn() > 0;
    }

    public function duiExists(string $dui): bool
    {
        $sql  = "SELECT COUNT(*) FROM DOCENTES WHERE dui = :dui";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':dui' => $dui]);
        return (int)$stmt->fetchColumn() > 0;
    }

    public function create(array $data): int
    {
        $sql = "INSERT INTO DOCENTES
                    (usuario_id, codigo, nombres, apellidos, dui, especialidad, telefono)
                VALUES
                    (:usuario_id, :codigo, :nombres, :apellidos, :dui, :especialidad, :telefono)";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':usuario_id'   => $data['usuario_id'],
            ':codigo'       => $data['codigo'],
            ':nombres'      => $data['nombres'],
            ':apellidos'    => $data['apellidos'],
            ':dui'          => $data['dui'],
            ':especialidad' => $data['especialidad'] ?? null,
            ':telefono'     => $data['telefono'] ?? null,
        ]);
        return (int)$this->db->lastInsertId();
    }

    public function update(int $id, array $data): bool
    {
        $sql = "UPDATE DOCENTES
                SET nombres      = :nombres,
                    apellidos    = :apellidos,
                    dui          = :dui,
                    especialidad = :especialidad,
                    telefono     = :telefono
                WHERE id = :id";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':nombres'      => $data['nombres'],
            ':apellidos'    => $data['apellidos'],
            ':dui'          => $data['dui'],
            ':especialidad' => $data['especialidad'] ?? null,
            ':telefono'     => $data['telefono'] ?? null,
            ':id'           => $id,
        ]);
        return $stmt->rowCount() > 0;
    }

    public function delete(int $id): bool
    {
        $sql  = "SELECT usuario_id FROM DOCENTES WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $id]);
        $doc  = $stmt->fetch();

        if (!$doc) return false;

        $sql  = "UPDATE USUARIOS SET activo = 0 WHERE id = :uid";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':uid' => $doc['usuario_id']]);
        return $stmt->rowCount() > 0;
    }
}