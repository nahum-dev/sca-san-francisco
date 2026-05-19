<?php
declare(strict_types=1);
namespace App\Services;

use App\Models\DocenteModel;
use App\Models\UsuarioModel;
use RuntimeException;

final class DocenteService
{
    private DocenteModel $docenteModel;
    private UsuarioModel $usuarioModel;

    public function __construct()
    {
        $this->docenteModel = new DocenteModel();
        $this->usuarioModel = new UsuarioModel();
    }

    public function getAll(string $search = ''): array
    {
        return $this->docenteModel->getAll($search);
    }

    public function getById(int $id): array
    {
        $docente = $this->docenteModel->findById($id);
        if (!$docente) {
            throw new RuntimeException('Docente no encontrado.', 404);
        }
        return $docente;
    }

    public function create(array $data): array
    {
        $required = ['nombres', 'apellidos', 'dui', 'email', 'password'];
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

        if ($this->docenteModel->duiExists($data['dui'])) {
            throw new RuntimeException('El DUI ya está registrado.', 409);
        }

        $codigo       = $this->generarCodigo();
        $passwordHash = password_hash($data['password'], PASSWORD_BCRYPT, ['cost' => 12]);
        $username     = strtolower('doc.' . explode('@', $data['email'])[0]);
        $usuarioId    = $this->usuarioModel->create($username, $data['email'], $passwordHash, 2);

        $docenteId = $this->docenteModel->create([
            'usuario_id'   => $usuarioId,
            'codigo'       => $codigo,
            'nombres'      => trim($data['nombres']),
            'apellidos'    => trim($data['apellidos']),
            'dui'          => $data['dui'],
            'especialidad' => $data['especialidad'] ?? null,
            'telefono'     => $data['telefono'] ?? null,
        ]);

        return $this->docenteModel->findById($docenteId);
    }

    public function update(int $id, array $data): array
    {
        $this->getById($id);
        $required = ['nombres', 'apellidos', 'dui'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                throw new RuntimeException("El campo {$field} es obligatorio.", 400);
            }
        }
        $this->docenteModel->update($id, $data);
        return $this->docenteModel->findById($id);
    }

    public function delete(int $id): void
    {
        $this->getById($id);
        $this->docenteModel->delete($id);
    }

    private function generarCodigo(): string
    {
        $anio = date('Y');
        $num  = 1;
        do {
            $codigo = 'DOC-' . $anio . '-' . str_pad((string)$num, 3, '0', STR_PAD_LEFT);
            $num++;
        } while ($this->docenteModel->codigoExists($codigo));
        return $codigo;
    }
}