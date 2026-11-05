<?php
// Lista de clientes con su cantidad de facturas y lo que deben (facturas no pagadas).
// Requiere estar logueado (categoría 1 o más).
include 'conexion.php';
exigir_categoria(1);

$filas = consultar(
    "SELECT c.idCliente, c.nombre, c.apellido, c.situacionFiscal, c.dni,
            COUNT(f.NroFactura) AS facturas,
            COALESCE(SUM(CASE WHEN f.Estado <> 'Pagado' THEN f.Importe END), 0) AS deuda
     FROM cliente c
     LEFT JOIN facturas f ON f.IdCliente = c.idCliente
     GROUP BY c.idCliente
     ORDER BY c.apellido, c.nombre"
);

responder($filas);
