<?php
// Agrega una sucursal. Solo administrador.
// POST: { "nombre", "ciudad", "direccion", "cantempleado" }
include 'conexion.php';
exigir_categoria(2);

$s = leer_json();

if (trim($s['nombre'] ?? '') === '' || trim($s['ciudad'] ?? '') === ''
    || trim($s['direccion'] ?? '') === '' || !ctype_digit((string) ($s['cantempleado'] ?? ''))) {
    responder(['ok' => false, 'error' => 'Completá nombre, ciudad, dirección y cantidad de empleados'], 400);
}

$r = ejecutar(
    'INSERT INTO sucursal (nombre, ciudad, direccion, cantempleado) VALUES (?, ?, ?, ?)',
    'sssi',
    [trim($s['nombre']), trim($s['ciudad']), trim($s['direccion']), (int) $s['cantempleado']]
);

responder(['ok' => true, 'idSucursal' => $r['id']]);
