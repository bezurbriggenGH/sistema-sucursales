<?php
// Borra una sucursal. Solo administrador.
// Uso: Baja_Sucursal.php?id=6
// No se puede borrar una sucursal que tiene facturas.
include 'conexion.php';
exigir_categoria(2);

$id = (int) ($_GET['id'] ?? 0);

$facturas = consultar('SELECT COUNT(*) AS n FROM facturas WHERE idSucursal = ?', 'i', [$id]);
if ($facturas[0]['n'] > 0) {
    responder(['ok' => false, 'error' => 'No se puede borrar: la sucursal tiene ' . $facturas[0]['n'] . ' facturas'], 409);
}

$r = ejecutar('DELETE FROM sucursal WHERE idSucursal = ?', 'i', [$id]);

responder(['ok' => $r['afectadas'] > 0]);
