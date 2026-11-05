import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Cliente, DatosService, ESTADOS_FACTURA, EstadoFactura, Factura, FiltroFacturas, NuevaFactura,
  PaginaFacturas, Sucursal, formatoPesos, mensajeDeError,
} from '../servicios/datos.service';
import { AuthService } from '../servicios/auth.service';

const FILTRO_VACIO: FiltroFacturas = { estado: '', sucursal: '', cliente: '', desde: '', hasta: '' };

@Component({
  selector: 'app-facturas',
  imports: [FormsModule],
  templateUrl: './facturas.html',
  styleUrl: './facturas.css'
})
export class Facturas implements OnInit {
  private datos = inject(DatosService);
  private ruta = inject(ActivatedRoute);
  private router = inject(Router);
  protected auth = inject(AuthService);

  estados = ESTADOS_FACTURA;
  sucursales = signal<Sucursal[]>([]);
  clientes = signal<Cliente[]>([]);

  filtro: FiltroFacturas = { ...FILTRO_VACIO };
  pagina = signal<PaginaFacturas | null>(null);
  cargando = signal(true);
  error = signal('');
  mensaje = signal('');

  esAdmin = computed(() => this.auth.categoria() >= 2);
  pesos = formatoPesos;

  importeTotal = computed(() => {
    const r = this.pagina()?.resumen;
    return r ? ESTADOS_FACTURA.reduce((a, e) => a + r[e].importe, 0) : 0;
  });

  ngOnInit(): void {
    // Listas para los filtros
    this.datos.recuperarSucus().subscribe((s) => this.sucursales.set(s));
    this.datos.recuperarClientes().subscribe((c) => this.clientes.set(c));

    // Los filtros viajan en la dirección (por ejemplo /facturas?cliente=3)
    this.ruta.queryParamMap.subscribe((q) => {
      this.filtro = {
        estado: q.get('estado') ?? '',
        sucursal: q.get('sucursal') ?? '',
        cliente: q.get('cliente') ?? '',
        desde: q.get('desde') ?? '',
        hasta: q.get('hasta') ?? '',
      };
      this.cargar(Number(q.get('pagina') ?? 1));
    });
  }

  cargar(pagina = 1): void {
    this.cargando.set(true);
    this.datos.recuperarFacturas({ ...this.filtro, pagina, porPagina: 50 }).subscribe({
      next: (p) => {
        this.pagina.set(p);
        this.error.set('');
        this.cargando.set(false);
      },
      error: (e) => {
        this.error.set(mensajeDeError(e));
        this.cargando.set(false);
      },
    });
  }

  // Guarda los filtros en la dirección; eso dispara la carga
  aplicar(pagina = 1): void {
    const queryParams: Record<string, string | number | null> = { pagina: pagina > 1 ? pagina : null };
    for (const [clave, valor] of Object.entries(this.filtro)) {
      queryParams[clave] = valor === '' || valor === undefined ? null : (valor as string | number);
    }
    this.router.navigate([], { relativeTo: this.ruta, queryParams });
  }

  filtrarEstado(estado: EstadoFactura): void {
    this.filtro.estado = this.filtro.estado === estado ? '' : estado;
    this.aplicar();
  }

  limpiar(): void {
    this.filtro = { ...FILTRO_VACIO };
    this.aplicar();
  }

  hayFiltros(): boolean {
    return Object.values(this.filtro).some((v) => v !== '' && v !== undefined);
  }

  irAPagina(p: number): void {
    const total = this.pagina()?.paginas ?? 1;
    if (p >= 1 && p <= total) this.aplicar(p);
  }

  cambiarEstado(f: Factura, evento: Event): void {
    const estado = (evento.target as HTMLSelectElement).value as EstadoFactura;
    this.mensaje.set('');
    this.datos.cambiarEstadoFactura(f.NroFactura, estado).subscribe({
      next: () => {
        this.mensaje.set(`Factura ${f.NroFactura} marcada como ${estado}`);
        this.cargar(this.pagina()?.pagina ?? 1);
      },
      error: (e) => this.error.set(mensajeDeError(e)),
    });
  }

  // --- Nueva factura ---
  formAbierto = signal(false);
  nueva: NuevaFactura = this.facturaVacia();

  private facturaVacia(): NuevaFactura {
    return { fecha: new Date().toISOString().slice(0, 10), idCliente: '', idSucursal: '', importe: '', estado: 'Pendiente' };
  }

  abrirForm(): void {
    this.nueva = this.facturaVacia();
    this.mensaje.set('');
    this.error.set('');
    this.formAbierto.set(true);
  }

  cerrarForm(): void {
    this.formAbierto.set(false);
  }

  ivaEstimado(): number {
    const importe = Number(this.nueva.importe) || 0;
    return Math.min(Math.round(importe * 21) / 100, 999.99);
  }

  crear(): void {
    this.datos.altaFactura(this.nueva).subscribe({
      next: (r: any) => {
        this.formAbierto.set(false);
        this.error.set('');
        this.mensaje.set(`Factura ${r.nroFactura} creada`);
        this.cargar(1);
      },
      error: (e) => this.error.set(mensajeDeError(e)),
    });
  }

  borrar(f: Factura): void {
    if (!confirm(`¿Borrar la factura ${f.NroFactura} de ${f.cliente} por ${formatoPesos(f.Importe)}?`)) return;
    this.mensaje.set('');
    this.datos.bajaFactura(f.NroFactura).subscribe({
      next: () => {
        this.mensaje.set(`Factura ${f.NroFactura} borrada`);
        this.cargar(this.pagina()?.pagina ?? 1);
      },
      error: (e) => this.error.set(mensajeDeError(e)),
    });
  }

  fecha(f: string): string {
    const [a, m, d] = f.split('-');
    return `${d}/${m}/${a}`;
  }
}
