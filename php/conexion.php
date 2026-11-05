<?php
// Conexión a la base de datos y funciones comunes para todos los servicios.

// --- Datos de conexión (XAMPP por defecto) ---
const DB_SERVIDOR = 'localhost';
const DB_USUARIO  = 'root';
const DB_CLAVE    = '';
const DB_NOMBRE   = 'bdfacturas';

// --- Cabeceras CORS: permiten que Angular (ng serve, http://localhost:4200) llame a estos PHP ---
// Se acepta cualquier puerto de localhost. Hace falta indicar el origen exacto para que viaje la sesión.
$origen = $_SERVER['HTTP_ORIGIN'] ?? '';
if (preg_match('#^http://(localhost|127\.0\.0\.1)(:\d+)?$#', $origen)) {
    header('Access-Control-Allow-Origin: ' . $origen);
}
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
header('Content-Type: application/json; charset=utf-8');

// El navegador manda primero una consulta OPTIONS antes de un POST: se responde vacía.
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

session_start();

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

function db_connect(): mysqli {
    try {
        $conn = new mysqli(DB_SERVIDOR, DB_USUARIO, DB_CLAVE, DB_NOMBRE);
        $conn->set_charset('utf8mb4');
        return $conn;
    } catch (mysqli_sql_exception $e) {
        responder(['error' => 'No se pudo conectar a la base de datos'], 500);
    }
}

// Ejecuta una consulta con parámetros (evita inyección SQL) y devuelve las filas.
function consultar(string $sql, string $tipos = '', array $params = []): array {
    $conn = db_connect();
    $stmt = $conn->prepare($sql);
    if ($tipos !== '') {
        $stmt->bind_param($tipos, ...$params);
    }
    $stmt->execute();
    $res = $stmt->get_result();
    $filas = $res ? $res->fetch_all(MYSQLI_ASSOC) : [];
    $conn->close();
    return $filas;
}

// Ejecuta un INSERT / UPDATE / DELETE. Devuelve las filas afectadas y el id insertado.
function ejecutar(string $sql, string $tipos, array $params): array {
    $conn = db_connect();
    $stmt = $conn->prepare($sql);
    $stmt->bind_param($tipos, ...$params);
    $stmt->execute();
    $resultado = ['afectadas' => $stmt->affected_rows, 'id' => $conn->insert_id];
    $conn->close();
    return $resultado;
}

function responder($datos, int $codigo = 200): void {
    http_response_code($codigo);
    echo json_encode($datos, JSON_UNESCAPED_UNICODE);
    exit;
}

// Datos que manda Angular en el cuerpo de un POST (JSON).
function leer_json(): array {
    $datos = json_decode(file_get_contents('php://input'), true);
    return is_array($datos) ? $datos : [];
}

// Categoría del usuario logueado: 0 invitado, 1 usuario, 2 administrador.
function categoria_actual(): int {
    return isset($_SESSION['categoria']) ? (int) $_SESSION['categoria'] : 0;
}

// Corta el pedido si el usuario no tiene la categoría mínima.
function exigir_categoria(int $minima): void {
    if (categoria_actual() < $minima) {
        responder(['error' => 'No tenés permiso para esta acción'], 403);
    }
}
