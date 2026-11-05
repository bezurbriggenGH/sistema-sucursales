<?php
// Agrega un cliente. Solo administrador.
// POST: { "nombre", "apellido", "situacionFiscal", "dni" }
include 'conexion.php';
exigir_categoria(2);

$c = leer_json();
validar_cliente($c);

$r = ejecutar(
    'INSERT INTO cliente (nombre, apellido, situacionFiscal, dni) VALUES (?, ?, ?, ?)',
    'sssi',
    [trim($c['nombre']), trim($c['apellido']), $c['situacionFiscal'], (int) $c['dni']]
);

responder(['ok' => true, 'idCliente' => $r['id']]);

function validar_cliente(array $c): void {
    $situaciones = ['Responsable Inscripto', 'Monotributista', 'Exento', 'Consumidor Final', 'No Categorizado'];
    if (trim($c['nombre'] ?? '') === '' || trim($c['apellido'] ?? '') === '') {
        responder(['ok' => false, 'error' => 'Nombre y apellido son obligatorios'], 400);
    }
    if (!in_array($c['situacionFiscal'] ?? '', $situaciones, true)) {
        responder(['ok' => false, 'error' => 'Situación fiscal inválida'], 400);
    }
    if (!ctype_digit((string) ($c['dni'] ?? ''))) {
        responder(['ok' => false, 'error' => 'El DNI debe ser un número'], 400);
    }
}
