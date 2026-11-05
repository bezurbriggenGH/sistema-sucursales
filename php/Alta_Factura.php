<?php
// Crea una factura. Solo administrador.
// POST: { "fecha": "2025-06-15", "idCliente": 3, "idSucursal": 2, "importe": 15000, "estado": "Pendiente" }
// El IVA se calcula como el 21 % del importe.
include 'conexion.php';
exigir_categoria(2);

$f = leer_json();
$estados = ['Pagado', 'Pendiente', 'Atrasado'];

$fecha   = $f['fecha'] ?? '';
$importe = $f['importe'] ?? '';

if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $fecha)) {
    responder(['ok' => false, 'error' => 'Fecha inválida'], 400);
}
if (empty($f['idCliente']) || empty($f['idSucursal'])) {
    responder(['ok' => false, 'error' => 'Elegí el cliente y la sucursal'], 400);
}
if (!is_numeric($importe) || $importe <= 0) {
    responder(['ok' => false, 'error' => 'El importe debe ser un número mayor a 0'], 400);
}
if (!in_array($f['estado'] ?? '', $estados, true)) {
    responder(['ok' => false, 'error' => 'Estado inválido'], 400);
}

// La columna IVA admite como máximo 999.99 (así está definida en la base).
$iva = min(round($importe * 0.21, 2), 999.99);

try {
    $r = ejecutar(
        'INSERT INTO facturas (FechaFactura, IdCliente, Importe, IVA, Estado, idSucursal) VALUES (?, ?, ?, ?, ?, ?)',
        'siddsi',
        [$fecha, (int) $f['idCliente'], (float) $importe, $iva, $f['estado'], (int) $f['idSucursal']]
    );
} catch (mysqli_sql_exception $e) {
    responder(['ok' => false, 'error' => 'El cliente o la sucursal no existen'], 400);
}

responder(['ok' => true, 'nroFactura' => $r['id']]);
