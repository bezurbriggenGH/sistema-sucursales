// Compila Angular para servirlo desde XAMPP en http://localhost/sucursales/
// Uso: npm run build:xampp   -> deja el resultado en la carpeta xampp-web/
import { execSync } from 'node:child_process';
import { cpSync, existsSync, renameSync, rmSync, writeFileSync } from 'node:fs';

const salidaTemporal = 'dist/xampp';
const destino = 'xampp-web';

execSync(`npx ng build --base-href /sucursales/ --output-path ${salidaTemporal}`, { stdio: 'inherit' });

rmSync(destino, { recursive: true, force: true });
cpSync(`${salidaTemporal}/browser`, destino, { recursive: true });

// Con renderizado en el navegador Angular genera index.csr.html; Apache busca index.html
if (existsSync(`${destino}/index.csr.html`)) {
  renameSync(`${destino}/index.csr.html`, `${destino}/index.html`);
}

// Para que funcionen las rutas (/clientes, /ventas...) al recargar la página
writeFileSync(
  `${destino}/.htaccess`,
  [
    'RewriteEngine On',
    'RewriteBase /sucursales/',
    'RewriteCond %{REQUEST_FILENAME} !-f',
    'RewriteCond %{REQUEST_FILENAME} !-d',
    'RewriteRule . index.html [L]',
    '',
  ].join('\n')
);

console.log(`\nListo: copiá la carpeta ${destino} a C:\\xampp\\htdocs\\sucursales (o usá instalar.bat)`);
