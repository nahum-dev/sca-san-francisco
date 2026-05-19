<?php
declare(strict_types=1);
namespace App\Services;

use App\Models\UsuarioModel;
use App\Utils\JwtHelper;
use RuntimeException;

final class AuthService
{
    private UsuarioModel $usuarioModel;

    public function __construct()
    {
        $this->usuarioModel = new UsuarioModel();
    }
    

    public function login(string $identifier, string $password): array
    {
        if (empty($identifier) || empty($password)) {
            throw new RuntimeException('Usuario y contraseña son obligatorios.', 400);
        }

        $usuario = $this->usuarioModel->findByEmailOrUsername($identifier);

        if (!$usuario || !password_verify($password, $usuario['password_hash'])) {
            throw new RuntimeException('Credenciales incorrectas.', 401);
        }

        $payload = [
            'id'       => $usuario['id'],
            'username' => $usuario['username'],
            'email'    => $usuario['email'],
            'rol'      => $usuario['rol'],
        ];

        // Si es estudiante, agregar su ID de estudiante al payload
        if ((int)$usuario['rol'] === 3) {
            $pdo  = \App\Config\Database::getConnection();
            $sql  = "SELECT id FROM ESTUDIANTES WHERE usuario_id = :uid";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([':uid' => $usuario['id']]);
            $est  = $stmt->fetch();
            if ($est) {
                $payload['estudiante_id'] = $est['id'];
            }
        }

        // Si es docente, agregar su ID de docente al payload
        if ((int)$usuario['rol'] === 2) {
            $pdo  = \App\Config\Database::getConnection();
            $sql  = "SELECT id FROM DOCENTES WHERE usuario_id = :uid";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([':uid' => $usuario['id']]);
            $doc  = $stmt->fetch();
            if ($doc) {
                $payload['docente_id'] = $doc['id'];
            }
        }

        return [
            'token'     => JwtHelper::generateToken($payload),
            'usuario'   => $payload,
            'expira_en' => (int)($_ENV['JWT_EXPIRATION'] ?? 3600),
        ];
    }

    public function register(array $data): array
    {
        $required = ['username', 'email', 'password', 'rol'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                throw new RuntimeException("El campo {$field} es obligatorio.", 400);
            }
        }

        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            throw new RuntimeException('El formato del email no es válido.', 400);
        }

        if (!in_array((int)$data['rol'], [1, 2, 3], true)) {
            throw new RuntimeException('Rol inválido.', 400);
        }

        if ($this->usuarioModel->emailExists($data['email'])) {
            throw new RuntimeException('El email ya está registrado.', 409);
        }

        $passwordHash = password_hash($data['password'], PASSWORD_BCRYPT, ['cost' => 12]);
        $id = $this->usuarioModel->create($data['username'], $data['email'], $passwordHash, (int)$data['rol']);

        return ['id' => $id, 'username' => $data['username'], 'email' => $data['email']];
    }

    public function cambiarPassword(int $userId, string $passwordActual, string $passwordNueva): void
{
    if (empty($passwordActual) || empty($passwordNueva)) {
        throw new RuntimeException('Todos los campos son obligatorios.', 400);
    }

    if (strlen($passwordNueva) < 6) {
        throw new RuntimeException('La nueva contraseña debe tener al menos 6 caracteres.', 400);
    }

    $usuario = $this->usuarioModel->findById($userId);
    if (!$usuario) {
        throw new RuntimeException('Usuario no encontrado.', 404);
    }

    if (!password_verify($passwordActual, $usuario['password_hash'])) {
        throw new RuntimeException('La contraseña actual es incorrecta.', 401);
    }

    if ($passwordActual === $passwordNueva) {
        throw new RuntimeException('La nueva contraseña debe ser diferente a la actual.', 400);
    }

    $nuevoHash = password_hash($passwordNueva, PASSWORD_BCRYPT, ['cost' => 12]);
    $this->usuarioModel->updatePassword($userId, $nuevoHash);
}
}