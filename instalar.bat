@echo off
setlocal
cd /d "%~dp0"

set XAMPP=C:\xampp
set MYSQL=%XAMPP%\mysql\bin\mysql.exe

echo ================================================
echo   Instalador - BenZurb's Project
echo ================================================
echo.

if not exist "%MYSQL%" (
  echo [ERROR] No se encontro XAMPP en %XAMPP%
  echo Instala XAMPP en C:\xampp y volve a ejecutar este archivo.
  goto fin
)

"%MYSQL%" -u root -e "SELECT 1" >nul 2>&1
if errorlevel 1 (
  echo [ERROR] MySQL no esta prendido.
  echo Abri el panel de XAMPP, toca Start en Apache y en MySQL, y volve a ejecutar este archivo.
  goto fin
)

echo ATENCION: esto borra y vuelve a crear la base "bdfacturas" con los datos del proyecto.
set /p SEGUIR=Continuar? (S/N):
if /i not "%SEGUIR%"=="S" goto fin

echo.
echo [1/3] Importando la base de datos bdfacturas...
"%MYSQL%" -u root --default-character-set=utf8mb4 < "database\bdfacturas.sql"
if errorlevel 1 (
  echo [ERROR] No se pudo importar la base de datos.
  goto fin
)

echo [2/3] Copiando los PHP a %XAMPP%\htdocs\sucursales-api...
if not exist "%XAMPP%\htdocs\sucursales-api" mkdir "%XAMPP%\htdocs\sucursales-api"
copy /y "php\*.php" "%XAMPP%\htdocs\sucursales-api\" >nul

echo [3/3] Copiando la pagina a %XAMPP%\htdocs\sucursales...
if exist "%XAMPP%\htdocs\sucursales" rmdir /s /q "%XAMPP%\htdocs\sucursales"
xcopy /e /i /q /y "xampp-web" "%XAMPP%\htdocs\sucursales" >nul

echo.
echo Listo. Abriendo http://localhost/sucursales/
start "" "http://localhost/sucursales/"

:fin
echo.
pause
