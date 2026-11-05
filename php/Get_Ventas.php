<?php
// Total vendido por mes y por sucursal, sumando las facturas de un año.
// Uso: Get_Ventas.php?anio=2025   (si no se pasa, usa el año con más facturas)
// Requiere estar logueado (categoría 1 o más).
include 'conexion.php';
exigir_categoria(1);

$porAnio = consultar(
    'SELECT YEAR(FechaFactura) AS anio, COUNT(*) AS cantidad FROM facturas GROUP BY anio ORDER BY anio'
);
$anios = array_map(fn($f) => (int) $f['anio'], $porAnio);

$anioPorDefecto = (int) date('Y');
$maximo = -1;
foreach ($porAnio as $f) {
    if ($f['cantidad'] > $maximo) {
        $maximo = $f['cantidad'];
        $anioPorDefecto = (int) $f['anio'];
    }
}

$anio = isset($_GET['anio']) ? (int) $_GET['anio'] : $anioPorDefecto;

$sucursales = consultar('SELECT idSucursal, nombre FROM sucursal ORDER BY idSucursal');

$totales = consultar(
    'SELECT MONTH(FechaFactura) AS mes, idSucursal, SUM(Importe) AS total
     FROM facturas
     WHERE YEAR(FechaFactura) = ?
     GROUP BY mes, idSucursal',
    'i',
    [$anio]
);

// Armo la matriz: 12 filas (meses) x una columna por sucursal.
$posicion = [];
foreach ($sucursales as $i => $s) {
    $posicion[$s['idSucursal']] = $i;
}
$ventas = array_fill(0, 12, array_fill(0, count($sucursales), 0));
foreach ($totales as $t) {
    $ventas[$t['mes'] - 1][$posicion[$t['idSucursal']]] = (float) $t['total'];
}

responder([
    'anio'       => $anio,
    'anios'      => $anios,
    'sucursales' => array_column($sucursales, 'nombre'),
    'ventas'     => $ventas,
]);
