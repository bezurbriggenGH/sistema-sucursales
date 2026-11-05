<?php
// Modifica una sucursal. Solo administrador.
// POST: { "idSucursal", "nombre", "ciudad", "direccion", "cantempleado" }
include 'conexion.php';
exigir_categoria(2);

$s = leer_json();

if (!isset($s['idSucursal']) || trim($s['nombre'] ?? '') === '' || trim($s['ciudad'] ?? '') === ''
    || trim($s['direccion'] ?? '') === '' || !ctype_digit((string) ($s['cantempleado'] ?? ''))) {
    responder(['ok' => false, 'error' => 'Datos de la sucursal incompletos o inválidos'], 400);
}

ejecutar(
    'UPDATE sucursal SET nombre = ?, ciudad = ?, direccion = ?, cantempleado = ? WHERE idSucursal = ?',
    'sssii',
    [trim($s['nombre']), trim($s['ciudad']), trim($s['direccion']), (int) $s['cantempleado'], (int) $s['idSucursal']]
);

responder(['ok' => true]);
