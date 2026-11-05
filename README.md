# Sistema de Sucursales — BenZurb's Project

Sistema web para consultar las sucursales, los clientes, las ventas y las facturas de una empresa.
El frontend está hecho en **Angular** y consulta una base de datos **MySQL** a través de servicios en **PHP**.
Tiene login con tres niveles de usuario, y cada uno ve distintas opciones del menú.

## Funcionalidades

- **Login** contra la tabla `usuarios`: verifica usuario y contraseña (encriptada) y asigna una categoría.
- **Menú según la categoría** del usuario:

| Categoría | Qué puede hacer |
|---|---|
| Invitado (sin login) | Ver el inicio y la lista de sucursales |
| Usuario | Además: clientes, ventas con gráficos y el personal de cada sucursal |
| Administrador | Además: facturas (crear, borrar y cambiar su estado), y alta / baja / modificación de clientes y sucursales |

- **Sucursales:** datos de cada sede. El administrador puede agregarlas, editarlas y borrarlas (si no tienen facturas).
- **Clientes:** situación fiscal, DNI, cantidad de facturas y deuda (facturas no pagadas). Tiene buscador.
- **Ventas:** total facturado por mes y por sucursal, con tabla, resumen y gráficos de líneas y barras apiladas. Se puede elegir el año.
- **Facturas** (solo administrador): listado con filtros por estado, sucursal, cliente y fechas, resumen por estado y paginado. Se pueden crear (el IVA se calcula solo), borrar y cambiar de estado.

Los permisos se controlan en Angular (menú y rutas) y también en cada PHP, así que no se pueden saltear llamando al servicio directamente.

## Tecnologías

| Parte | Tecnología |
|---|---|
| Frontend | Angular 22 (standalone components, signals, router con guards, HttpClient) · TypeScript · HTML · CSS |
| Gráficos | SVG generado por Angular, sin librerías externas |
| Backend | PHP 8 (servicios que devuelven JSON, sesiones para el login, consultas preparadas con mysqli) |
| Base de datos | MySQL / MariaDB (base `bdfacturas`) |
| Servidor local | XAMPP (Apache + MySQL) |
| Herramientas | Node.js · npm · Angular CLI · Git |

## Estructura

```
P2-Angular/
├── src/app/                Código Angular
│   ├── servicios/          datos.service.ts (consultas a PHP) y auth.service.ts (login y permisos)
│   ├── home/ sucursales/ clientes/ ventas/ facturas/ login/
│   └── reloj/ footer/
├── php/                    Servicios PHP (se copian a C:\xampp\htdocs\sucursales-api)
│   ├── conexion.php        Conexión a la base y control de permisos
│   ├── Login.php  Sesion.php  Logout.php
│   ├── Get_Sucus.php  Get_Clientes.php  Get_Ventas.php  Get_Facturas.php
│   ├── Alta_Cliente.php  Modificar_Cliente.php  Baja_Cliente.php
│   ├── Alta_Sucursal.php  Modificar_Sucursal.php  Baja_Sucursal.php
│   └── Alta_Factura.php  Baja_Factura.php  Cambiar_Estado_Factura.php
├── database/bdfacturas.sql Base de datos completa (tablas y datos)
├── xampp-web/              Versión ya compilada de la página, para usar solo con XAMPP
└── instalar.bat            Instalador para Windows
```

## Cómo instalarlo en otra PC

### Opción rápida: solo con XAMPP (no hace falta Node)

1. Instalar [XAMPP](https://www.apachefriends.org/es/index.html) en `C:\xampp`.
2. Abrir el panel de XAMPP y tocar **Start** en **Apache** y en **MySQL**.
3. Descargar este repositorio: botón verde **Code → Download ZIP**, y descomprimirlo.
4. Hacer doble clic en **`instalar.bat`**. El instalador:
   - importa la base `bdfacturas`,
   - copia los PHP a `C:\xampp\htdocs\sucursales-api`,
   - copia la página a `C:\xampp\htdocs\sucursales`,
   - abre **http://localhost/sucursales/** en el navegador.

### Opción para desarrollar (con Angular)

Además de los pasos anteriores:

1. Instalar [Node.js](https://nodejs.org/) (versión LTS).
2. En una terminal, dentro de la carpeta del proyecto:

```bash
npm install
npm start
```

3. Abrir **http://localhost:4200**.

> En PowerShell, si aparece el error "la ejecución de scripts está deshabilitada", usar `npm.cmd install` y `npm.cmd start`.

Si se modifica el código Angular, se actualiza la versión para XAMPP con `npm run build:xampp` y se vuelve a ejecutar `instalar.bat`.

### Instalación manual (sin el instalador)

1. En phpMyAdmin (http://localhost/phpmyadmin) → **Importar** → elegir `database/bdfacturas.sql`.
2. Copiar los archivos de `php/` a `C:\xampp\htdocs\sucursales-api\`.
3. Copiar el contenido de `xampp-web/` a `C:\xampp\htdocs\sucursales\`.

## Usuarios de prueba

| Usuario | Contraseña | Categoría |
|---|---|---|
| `usuario` | `usuario123` | Usuario |
| `admin` | `admin123` | Administrador |

## Configuración

- Conexión a la base: `php/conexion.php` (por defecto `root` sin contraseña, como viene XAMPP).
- Dirección de los PHP que usa Angular: `API_URL` en `src/app/servicios/datos.service.ts`.
