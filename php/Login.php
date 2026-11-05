<?php
// Verifica usuario y contraseña contra la tabla usuarios y asigna la categoría.
// Recibe por POST: { "usuario": "...", "clave": "..." }
include 'conexion.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responder(['error' => 'Usar POST'], 405);
}

$datos   = leer_json();
$usuario = trim($datos['usuario'] ?? '');
$clave   = $datos['clave'] ?? '';

if ($usuario === '' || $clave === '') {
    responder(['ok' => false, 'error' => 'Completá usuario y contraseña'], 400);
}

$filas = consultar(
    'SELECT idUsuario, usuario, clave, nombre, categoria FROM usuarios WHERE usuario = ?',
    's',
    [$usuario]
);

if (count($filas) === 0 || !password_verify($clave, $filas[0]['clave'])) {
    responder(['ok' => false, 'error' => 'Usuario o contraseña incorrectos'], 401);
}

$u = $filas[0];
session_regenerate_id(true);
$_SESSION['idUsuario'] = (int) $u['idUsuario'];
$_SESSION['usuario']   = $u['usuario'];
$_SESSION['nombre']    = $u['nombre'];
$_SESSION['categoria'] = (int) $u['categoria'];

responder([
    'ok'        => true,
    'usuario'   => $u['usuario'],
    'nombre'    => $u['nombre'],
    'categoria' => (int) $u['categoria'],
]);
