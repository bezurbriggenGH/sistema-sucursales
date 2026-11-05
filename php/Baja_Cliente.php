<?php
// Borra un cliente. Solo administrador.
// Uso: Baja_Cliente.php?id=5
// No se puede borrar un cliente que tiene facturas.
include 'conexion.php';
exigir_categoria(2);

$id = (int) ($_GET['id'] ?? 0);

$facturas = consultar('SELECT COUNT(*) AS n FROM facturas WHERE IdCliente = ?', 'i', [$id]);
if ($facturas[0]['n'] > 0) {
    responder(['ok' => false, 'error' => 'No se puede borrar: el cliente tiene ' . $facturas[0]['n'] . ' facturas'], 409);
}

$r = ejecutar('DELETE FROM cliente WHERE idCliente = ?', 'i', [$id]);

responder(['ok' => $r['afectadas'] > 0]);
