import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  Cliente, ClienteForm, DatosService, SITUACIONES_FISCALES, formatoPesos, mensajeDeError,
} from '../servicios/datos.service';
import { AuthService } from '../servicios/auth.service';

const FORM_VACIO: ClienteForm = { nombre: '', apellido: '', situacionFiscal: 'Consumidor Final', dni: '' };

@Component({
  selector: 'app-clientes',
  imports: [FormsModule, RouterLink],
  templateUrl: './clientes.html',
  styleUrl: './clientes.css'
})
export class Clientes implements OnInit {
  private datos = inject(DatosService);
  protected auth = inject(AuthService);

  clients = signal<Cliente[]>([]);
  cargando = signal(true);
  error = signal('');
  mensaje = signal('');
  busqueda = signal('');

  situaciones = SITUACIONES_FISCALES;
  formAbierto = signal(false);
  form: ClienteForm = { ...FORM_VACIO };

  esAdmin = computed(() => this.auth.categoria() >= 2);

  filtrados = computed(() => {
    const texto = this.busqueda().toLowerCase().trim();
    if (!texto) return this.clients();
    return this.clients().filter((c) =>
      `${c.apellido} ${c.nombre} ${c.dni}`.toLowerCase().includes(texto)
    );
  });

  pesos = formatoPesos;

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.datos.recuperarClientes().subscribe({
      next: (c) => {
        this.clients.set(c);
        this.cargando.set(false);
      },
      error: (e) => {
        this.error.set(mensajeDeError(e));
        this.cargando.set(false);
      },
    });
  }

  nuevo(): void {
    this.form = { ...FORM_VACIO };
    this.limpiarMensajes();
    this.formAbierto.set(true);
  }

  editar(c: Cliente): void {
    this.form = {
      idCliente: c.idCliente,
      nombre: c.nombre,
      apellido: c.apellido,
      situacionFiscal: c.situacionFiscal,
      dni: String(c.dni),
    };
    this.limpiarMensajes();
    this.formAbierto.set(true);
  }

  cerrarForm(): void {
    this.formAbierto.set(false);
  }

  guardar(): void {
    const esNuevo = !this.form.idCliente;
    const pedido = esNuevo ? this.datos.altaCliente(this.form) : this.datos.modificarCliente(this.form);
    pedido.subscribe({
      next: () => {
        this.formAbierto.set(false);
        this.mensaje.set(esNuevo ? 'Cliente agregado' : 'Cliente modificado');
        this.cargar();
      },
      error: (e) => this.error.set(mensajeDeError(e)),
    });
  }

  borrar(c: Cliente): void {
    if (!confirm(`¿Borrar a ${c.apellido}, ${c.nombre}?`)) return;
    this.limpiarMensajes();
    this.datos.bajaCliente(c.idCliente).subscribe({
      next: () => {
        this.mensaje.set('Cliente borrado');
        this.cargar();
      },
      error: (e) => this.error.set(mensajeDeError(e)),
    });
  }

  private limpiarMensajes(): void {
    this.mensaje.set('');
    this.error.set('');
  }
}
