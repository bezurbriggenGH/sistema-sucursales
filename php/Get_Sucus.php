<?php
// Lista de sucursales. Es pública (la ve también el invitado).
include 'conexion.php';

$filas = consultar(
    'SELECT idSucursal, nombre, ciudad, direccion, cantempleado FROM sucursal ORDER BY idSucursal'
);

// El invitado no ve la cantidad de empleados.
if (categoria_actual() < 1) {
    foreach ($filas as &$f) {
        unset($f['cantempleado']);
    }
}

responder($filas);
