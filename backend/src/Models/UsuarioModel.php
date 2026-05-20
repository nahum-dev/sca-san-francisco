<?php
declare(strict_types=1);
namespace App\Models;

use App\Config\Database;
use PDO;

final class UsuarioModel
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function findByEmailOrUsername(string $identifier): array|false
    {
        $sql = "SELECT id, username, email, password_hash, rol, activo
                FROM USUARIOS
                WHERE (email = :email OR username = :username)
                  AND activo = 1
                LIMIT 1";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([':email' => $identifier, ':username' => $identifier]);
        return $stmt->fetch();
    }

    public function findById(int $id): array|false
{
    $sql  = "SELECT id, username, email, rol, activo, password_hash 
             FROM USUARIOS 
             WHERE id = :id";
    $stmt = $this->db->prepare($sql);
    $stmt->execute([':id' => $id]);
    return $stmt->fetch();
}

    public function emailExists(string $email): bool
    {
        $sql  = "SELECT COUNT(*) FROM USUARIOS WHERE email = :email";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':email' => $email]);
        return (int)$stmt->fetchColumn() > 0;
    }

    public function updatePassword(int $userId, string $passwordHash): bool
{
    $sql  = "UPDATE USUARIOS SET password_hash = :hash WHERE id = :id";
    $stmt = $this->db->prepare($sql);
    $stmt->execute([':hash' => $passwordHash, ':id' => $userId]);
    return $stmt->rowCount() > 0;
}

    public function create(string $username, string $email, string $passwordHash, int $rol): int
    {
        $sql = "INSERT INTO USUARIOS (username, email, password_hash, rol)
                VALUES (:username, :email, :password_hash, :rol)";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':username'      => $username,
            ':email'         => $email,
            ':password_hash' => $passwordHash,
            ':rol'           => $rol,
        ]);
        return (int)$this->db->lastInsertId();
    }
}