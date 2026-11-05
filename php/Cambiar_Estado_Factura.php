<?php
// Cambia el estado de una factura. Solo administrador.
// POST: { "nroFactura": 11347, "estado": "Pagado" }
include 'conexion.php';
exigir_categoria(2);

$d = leer_json();
$estados = ['Pagado', 'Pendiente', 'Atrasado'];

if (empty($d['nroFactura']) || !in_array($d['estado'] ?? '', $estados, true)) {
    responder(['ok' => false, 'error' => 'Factura o estado inválido'], 400);
}

ejecutar(
    'UPDATE facturas SET Estado = ? WHERE NroFactura = ?',
    'si',
    [$d['estado'], (int) $d['nroFactura']]
);

responder(['ok' => true]);
