import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

// Carpeta de XAMPP donde están los PHP (C:\xampp\htdocs\sucursales-api)
export const API_URL = 'http://localhost/sucursales-api/';

// withCredentials hace que el navegador mande la cookie de sesión del login.
const OPCIONES = { withCredentials: true };

export interface Sucursal {
  idSucursal: number;
  nombre: string;
  ciudad: string;
  direccion: string;
  cantempleado?: number; // solo llega si el usuario está logueado
}

export interface Cliente {
  idCliente: number;
  nombre: string;
  apellido: string;
  situacionFiscal: string;
  dni: number;
  facturas: number;
  deuda: string;
}

export interface ClienteForm {
  idCliente?: number;
  nombre: string;
  apellido: string;
  situacionFiscal: string;
  dni: string;
}

export interface VentasAnio {
  anio: number;
  anios: number[];
  sucursales: string[];
  ventas: number[][]; // 12 meses x sucursales
}

export const ESTADOS_FACTURA = ['Pagado', 'Pendiente', 'Atrasado'] as const;
export type EstadoFactura = (typeof ESTADOS_FACTURA)[number];

export interface Factura {
  NroFactura: number;
  FechaFactura: string;
  Importe: string;
  Estado: EstadoFactura;
  idCliente: number;
  cliente: string;
  idSucursal: number;
  sucursal: string;
}

export interface NuevaFactura {
  fecha: string;
  idCliente: number | string;
  idSucursal: number | string;
  importe: number | string;
  estado: EstadoFactura;
}

export interface FiltroFacturas {
  estado?: string;
  sucursal?: number | string;
  cliente?: number | string;
  desde?: string;
  hasta?: string;
  pagina?: number;
  porPagina?: number;
}

export interface PaginaFacturas {
  total: number;
  pagina: number;
  paginas: number;
  porPagina: number;
  resumen: Record<EstadoFactura, { cantidad: number; importe: number }>;
  facturas: Factura[];
}

export const SITUACIONES_FISCALES = [
  'Responsable Inscripto',
  'Monotributista',
  'Exento',
  'Consumidor Final',
  'No Categorizado',
];

@Injectable({ providedIn: 'root' })
export class DatosService {
  private http = inject(HttpClient);

  recuperarSucus() {
    return this.http.get<Sucursal[]>(`${API_URL}Get_Sucus.php`, OPCIONES);
  }

  recuperarClientes() {
    return this.http.get<Cliente[]>(`${API_URL}Get_Clientes.php`, OPCIONES);
  }

  recuperarVentas(anio?: number) {
    const filtro = anio ? `?anio=${anio}` : '';
    return this.http.get<VentasAnio>(`${API_URL}Get_Ventas.php${filtro}`, OPCIONES);
  }

  altaCliente(cliente: ClienteForm) {
    return this.http.post(`${API_URL}Alta_Cliente.php`, cliente, OPCIONES);
  }

  modificarCliente(cliente: ClienteForm) {
    return this.http.post(`${API_URL}Modificar_Cliente.php`, cliente, OPCIONES);
  }

  bajaCliente(idCliente: number) {
    return this.http.get(`${API_URL}Baja_Cliente.php?id=${idCliente}`, OPCIONES);
  }

  recuperarFacturas(filtro: FiltroFacturas) {
    // Solo se mandan los filtros que tienen valor
    const params: Record<string, string> = {};
    for (const [clave, valor] of Object.entries(filtro)) {
      if (valor !== undefined && valor !== null && valor !== '') {
        params[clave] = String(valor);
      }
    }
    return this.http.get<PaginaFacturas>(`${API_URL}Get_Facturas.php`, { ...OPCIONES, params });
  }

  cambiarEstadoFactura(nroFactura: number, estado: EstadoFactura) {
    return this.http.post(`${API_URL}Cambiar_Estado_Factura.php`, { nroFactura, estado }, OPCIONES);
  }

  altaFactura(factura: NuevaFactura) {
    return this.http.post(`${API_URL}Alta_Factura.php`, factura, OPCIONES);
  }

  bajaFactura(nroFactura: number) {
    return this.http.get(`${API_URL}Baja_Factura.php?nro=${nroFactura}`, OPCIONES);
  }

  altaSucursal(sucursal: Omit<Sucursal, 'idSucursal'>) {
    return this.http.post(`${API_URL}Alta_Sucursal.php`, sucursal, OPCIONES);
  }

  bajaSucursal(idSucursal: number) {
    return this.http.get(`${API_URL}Baja_Sucursal.php?id=${idSucursal}`, OPCIONES);
  }

  modificarSucursal(sucursal: Sucursal) {
    return this.http.post(`${API_URL}Modificar_Sucursal.php`, sucursal, OPCIONES);
  }
}

// Convierte un error de la llamada HTTP en un mensaje para mostrar.
export function mensajeDeError(e: unknown): string {
  if (e instanceof HttpErrorResponse) {
    if (e.status === 0) {
      return 'No se pudo conectar con el servidor. ¿Están prendidos Apache y MySQL en XAMPP?';
    }
    return e.error?.error ?? `Error del servidor (${e.status})`;
  }
  return 'Ocurrió un error inesperado';
}

export function formatoPesos(valor: number | string): string {
  return '$ ' + Math.round(Number(valor)).toLocaleString('es-AR');
}
