<?php
declare(strict_types=1);

require_once __DIR__ . '/../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    exit;
}

$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri    = rtrim($uri, '/');
$method = $_SERVER['REQUEST_METHOD'];

if (str_starts_with($uri, '/api/auth')) {
    $controller = new App\Controllers\AuthController();
    $controller->handle($method, $uri);
} elseif (str_starts_with($uri, '/api/estudiantes')) {
    $controller = new App\Controllers\EstudianteController();
    $controller->handle($method, $uri);
}
 elseif (str_starts_with($uri, '/api/docentes')) {
    $controller = new App\Controllers\DocenteController();
    $controller->handle($method, $uri);
}
elseif (str_starts_with($uri, '/api/asistencia')) {
    $controller = new App\Controllers\AsistenciaController();
    $controller->handle($method, $uri);
} elseif (str_starts_with($uri, '/api/notas')) {
    $controller = new App\Controllers\NotaController();
    $controller->handle($method, $uri);
} elseif (str_starts_with($uri, '/api/asignaturas')) {
    $controller = new App\Controllers\AsignaturaController();
    $controller->handle($method, $uri);
}
elseif (str_starts_with($uri, '/api/cursos')) {
    $controller = new App\Controllers\CursoController();
    $controller->handle($method, $uri);
} elseif (str_starts_with($uri, '/api/matriculas')) {
    $controller = new App\Controllers\MatriculaController();
    $controller->handle($method, $uri);
}
else {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Ruta no encontrada.']);
}