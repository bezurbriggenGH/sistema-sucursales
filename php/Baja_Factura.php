<?php
// Borra una factura y su detalle. Solo administrador.
// Uso: Baja_Factura.php?nro=14996
include 'conexion.php';
exigir_categoria(2);

$nro = (int) ($_GET['nro'] ?? 0);

$conn = db_connect();
$conn->begin_transaction();

// Primero los renglones del detalle (si tiene), después la factura
$stmt = $conn->prepare('DELETE FROM detalle WHERE NroFact = ?');
$stmt->bind_param('i', $nro);
$stmt->execute();

$stmt = $conn->prepare('DELETE FROM facturas WHERE NroFactura = ?');
$stmt->bind_param('i', $nro);
$stmt->execute();
$borradas = $stmt->affected_rows;

$conn->commit();
$conn->close();

if ($borradas === 0) {
    responder(['ok' => false, 'error' => 'La factura no existe'], 404);
}

responder(['ok' => true]);
