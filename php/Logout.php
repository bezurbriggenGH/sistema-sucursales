<?php
// Cierra la sesión.
include 'conexion.php';

$_SESSION = [];
session_destroy();

responder(['ok' => true]);
