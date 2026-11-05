<?php
// Modifica un cliente. Solo administrador.
// POST: { "idCliente", "nombre", "apellido", "situacionFiscal", "dni" }
include 'conexion.php';
exigir_categoria(2);

$c = leer_json();
$situaciones = ['Responsable Inscripto', 'Monotributista', 'Exento', 'Consumidor Final', 'No Categorizado'];

if (!isset($c['idCliente']) || trim($c['nombre'] ?? '') === '' || trim($c['apellido'] ?? '') === ''
    || !in_array($c['situacionFiscal'] ?? '', $situaciones, true) || !ctype_digit((string) ($c['dni'] ?? ''))) {
    responder(['ok' => false, 'error' => 'Datos del cliente incompletos o inválidos'], 400);
}

ejecutar(
    'UPDATE cliente SET nombre = ?, apellido = ?, situacionFiscal = ?, dni = ? WHERE idCliente = ?',
    'sssii',
    [trim($c['nombre']), trim($c['apellido']), $c['situacionFiscal'], (int) $c['dni'], (int) $c['idCliente']]
);

responder(['ok' => true]);
