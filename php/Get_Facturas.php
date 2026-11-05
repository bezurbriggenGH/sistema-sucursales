<?php
// Lista de facturas con filtros y paginado. Solo administrador (categoría 2).
// Parámetros (todos opcionales):
//   estado=Pagado|Pendiente|Atrasado   sucursal=ID   cliente=ID
//   desde=AAAA-MM-DD   hasta=AAAA-MM-DD   pagina=1   porPagina=50
include 'conexion.php';
exigir_categoria(2);

$condiciones = [];
$tipos = '';
$params = [];

$estados = ['Pagado', 'Pendiente', 'Atrasado'];
if (!empty($_GET['estado']) && in_array($_GET['estado'], $estados, true)) {
    $condiciones[] = 'f.Estado = ?';
    $tipos .= 's';
    $params[] = $_GET['estado'];
}
if (!empty($_GET['sucursal'])) {
    $condiciones[] = 'f.idSucursal = ?';
    $tipos .= 'i';
    $params[] = (int) $_GET['sucursal'];
}
if (!empty($_GET['cliente'])) {
    $condiciones[] = 'f.IdCliente = ?';
    $tipos .= 'i';
    $params[] = (int) $_GET['cliente'];
}
foreach (['desde' => '>=', 'hasta' => '<='] as $campo => $operador) {
    if (!empty($_GET[$campo]) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $_GET[$campo])) {
        $condiciones[] = "f.FechaFactura $operador ?";
        $tipos .= 's';
        $params[] = $_GET[$campo];
    }
}

$where = $condiciones ? 'WHERE ' . implode(' AND ', $condiciones) : '';

// Resumen de lo filtrado: cantidad e importe por estado
$resumenFilas = consultar(
    "SELECT f.Estado AS estado, COUNT(*) AS cantidad, SUM(f.Importe) AS importe
     FROM facturas f $where
     GROUP BY f.Estado",
    $tipos,
    $params
);
$resumen = [];
$total = 0;
foreach ($estados as $e) {
    $resumen[$e] = ['cantidad' => 0, 'importe' => 0];
}
foreach ($resumenFilas as $r) {
    $resumen[$r['estado']] = ['cantidad' => (int) $r['cantidad'], 'importe' => (float) $r['importe']];
    $total += (int) $r['cantidad'];
}

// Página pedida
$porPagina = min(200, max(10, (int) ($_GET['porPagina'] ?? 50)));
$paginas = max(1, (int) ceil($total / $porPagina));
$pagina = min($paginas, max(1, (int) ($_GET['pagina'] ?? 1)));
$offset = ($pagina - 1) * $porPagina;

$facturas = consultar(
    "SELECT f.NroFactura, f.FechaFactura, f.Importe, f.Estado,
            c.idCliente, CONCAT(c.apellido, ', ', c.nombre) AS cliente,
            s.idSucursal, s.nombre AS sucursal
     FROM facturas f
     JOIN cliente c ON c.idCliente = f.IdCliente
     JOIN sucursal s ON s.idSucursal = f.idSucursal
     $where
     ORDER BY f.FechaFactura DESC, f.NroFactura DESC
     LIMIT $porPagina OFFSET $offset",
    $tipos,
    $params
);

responder([
    'total'     => $total,
    'pagina'    => $pagina,
    'paginas'   => $paginas,
    'porPagina' => $porPagina,
    'resumen'   => $resumen,
    'facturas'  => $facturas,
]);
