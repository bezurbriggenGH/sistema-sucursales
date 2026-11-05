<?php
// Devuelve quién está logueado (o invitado). Angular lo consulta al abrir la página.
include 'conexion.php';

if (categoria_actual() === 0) {
    responder(['logueado' => false, 'categoria' => 0]);
}

responder([
    'logueado'  => true,
    'usuario'   => $_SESSION['usuario'],
    'nombre'    => $_SESSION['nombre'],
    'categoria' => categoria_actual(),
]);
