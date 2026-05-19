<?php
declare(strict_types=1);
namespace App\Services;

use App\Models\EstudianteModel;
use App\Models\UsuarioModel;
use RuntimeException;

final class EstudianteService
{
    private EstudianteModel $estudianteModel;
    private UsuarioModel    $usuarioModel;

    public function __construct()
    {
        $this->estudianteModel = new EstudianteModel();
        $this->usuarioModel    = new UsuarioModel();
    }

    public function getAll(string $search = ''): array
    {
        return $this->estudianteModel->getAll(search: $search);
    }

    public function getById(int $id): array
    {
        $estudiante = $this->estudianteModel->findById($id);
        if (!$estudiante) {
            throw new RuntimeException('Estudiante no encontrado.', 404);
        }
        return $estudiante;
    }

    public function create(array $data): array
    {
        $required = ['nombres', 'apellidos', 'fecha_nac', 'genero', 'grado', 'seccion', 'email', 'password'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                throw new RuntimeException("El campo {$field} es obligatorio.", 400);
            }
        }

        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            throw new RuntimeException('El formato del email no es válido.', 400);
        }

        if ($this->usuarioModel->emailExists($data['email'])) {
            throw new RuntimeException('El email ya está registrado.', 409);
        }

        $codigo       = $this->generarCodigo();
        $passwordHash = password_hash($data['password'], PASSWORD_BCRYPT, ['cost' => 12]);
        $username     = strtolower('est.' . explode('@', $data['email'])[0]);
        $usuarioId    = $this->usuarioModel->create($username, $data['email'], $passwordHash, 3);

        $estudianteId = $this->estudianteModel->create([
            'usuario_id' => $usuarioId,
            'codigo'     => $codigo,
            'nombres'    => trim($data['nombres']),
            'apellidos'  => trim($data['apellidos']),
            'fecha_nac'  => $data['fecha_nac'],
            'genero'     => $data['genero'],
            'grado'      => $data['grado'],
            'seccion'    => $data['seccion'],
            'telefono'   => $data['telefono'] ?? null,
            'direccion'  => $data['direccion'] ?? null,
        ]);

        return $this->estudianteModel->findById($estudianteId);
    }

    public function update(int $id, array $data): array
    {
        $this->getById($id);
        $required = ['nombres', 'apellidos', 'fecha_nac', 'genero', 'grado', 'seccion'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                throw new RuntimeException("El campo {$field} es obligatorio.", 400);
            }
        }
        $this->estudianteModel->update($id, $data);
        return $this->estudianteModel->findById($id);
    }

    public function delete(int $id): void
    {
        $this->getById($id);
        $this->estudianteModel->delete($id);
    }

    private function generarCodigo(): string
    {
        $anio = date('Y');
        $num  = 1;
        do {
            $codigo = $anio . '-' . str_pad((string)$num, 3, '0', STR_PAD_LEFT);
            $num++;
        } while ($this->estudianteModel->codigoExists($codigo));
        return $codigo;
    }
}