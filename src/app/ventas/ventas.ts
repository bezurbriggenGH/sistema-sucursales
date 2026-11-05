import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatosService, VentasAnio, formatoPesos, mensajeDeError } from '../servicios/datos.service';

// Área de dibujo de los gráficos (coincide con el viewBox 600 x 300)
const ANCHO = 600;
const ALTO = 300;
const IZQ = 55;
const DER = 10;
const ARRIBA = 15;
const ABAJO = 25;
const ANCHO_UTIL = ANCHO - IZQ - DER;
const ALTO_UTIL = ALTO - ARRIBA - ABAJO;

@Component({
  selector: 'app-ventas',
  imports: [],
  templateUrl: './ventas.html',
  styleUrl: './ventas.css',
})
export class Ventas implements OnInit {
  private datos = inject(DatosService);

  info = signal<VentasAnio | null>(null);
  cargando = signal(true);
  error = signal('');

  meses = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
  colores = ['#5b8def', '#d9a441', '#4fa37a', '#a77bca', '#d0645c'];
  pesos = formatoPesos;

  readonly alto = ALTO;
  readonly izq = IZQ;
  readonly der = ANCHO - DER;
  readonly baseY = ALTO - ABAJO;

  ngOnInit(): void {
    this.cargar();
  }

  cargar(anio?: number): void {
    this.cargando.set(true);
    this.datos.recuperarVentas(anio).subscribe({
      next: (v) => {
        this.info.set(v);
        this.error.set('');
        this.cargando.set(false);
      },
      error: (e) => {
        this.error.set(mensajeDeError(e));
        this.cargando.set(false);
      },
    });
  }

  cambiarAnio(evento: Event): void {
    this.cargar(Number((evento.target as HTMLSelectElement).value));
  }

  color(i: number): string {
    return this.colores[i % this.colores.length];
  }

  // --- Totales para la tabla ---
  totalesMes = computed(() => this.info()?.ventas.map((fila) => fila.reduce((a, b) => a + b, 0)) ?? []);

  totalesSucursal = computed(() => {
    const v = this.info();
    if (!v) return [];
    return v.sucursales.map((_, s) => v.ventas.reduce((a, fila) => a + fila[s], 0));
  });

  totalAnio = computed(() => this.totalesMes().reduce((a, b) => a + b, 0));

  // --- Gráfico de líneas ---
  private maxLinea = computed(() => Math.max(1, ...(this.info()?.ventas.flat() ?? [1])));

  lineas = computed(() => {
    const v = this.info();
    if (!v) return [];
    const max = this.maxLinea();
    return v.sucursales.map((nombre, s) => ({
      nombre,
      color: this.color(s),
      puntos: v.ventas
        .map((fila, m) => `${this.xMes(m)},${this.y(fila[s], max)}`)
        .join(' '),
    }));
  });

  ejeLineas = computed(() => this.marcasEje(this.maxLinea()));

  // --- Gráfico de barras apiladas ---
  private maxBarras = computed(() => Math.max(1, ...this.totalesMes()));

  barras = computed(() => {
    const v = this.info();
    if (!v) return [];
    const max = this.maxBarras();
    const anchoGrupo = ANCHO_UTIL / 12;
    const anchoBarra = anchoGrupo * 0.7;
    const rects: { x: number; y: number; w: number; h: number; color: string; titulo: string }[] = [];
    v.ventas.forEach((fila, m) => {
      let acumulado = 0;
      fila.forEach((valor, s) => {
        const h = (valor / max) * ALTO_UTIL;
        acumulado += h;
        rects.push({
          x: IZQ + m * anchoGrupo + (anchoGrupo - anchoBarra) / 2,
          y: ALTO - ABAJO - acumulado,
          w: anchoBarra,
          h,
          color: this.color(s),
          titulo: `${this.meses[m]} · ${v.sucursales[s]}: ${formatoPesos(valor)}`,
        });
      });
    });
    return rects;
  });

  ejeBarras = computed(() => this.marcasEje(this.maxBarras()));

  xMes(m: number): number {
    return IZQ + (m / 11) * ANCHO_UTIL;
  }

  xMesBarra(m: number): number {
    return IZQ + (m + 0.5) * (ANCHO_UTIL / 12);
  }

  private y(valor: number, max: number): number {
    return ALTO - ABAJO - (valor / max) * ALTO_UTIL;
  }

  // 5 líneas guía horizontales con su valor en millones
  private marcasEje(max: number) {
    return [0, 0.25, 0.5, 0.75, 1].map((p) => ({
      y: this.y(max * p, max),
      texto: (max * p / 1_000_000).toFixed(1) + ' M',
    }));
  }
}
