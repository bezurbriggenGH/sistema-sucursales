import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DatosService, Sucursal, mensajeDeError } from '../servicios/datos.service';
import { AuthService } from '../servicios/auth.service';

@Component({
  selector: 'app-sucursales',
  imports: [FormsModule, RouterLink],
  templateUrl: './sucursales.html',
  styleUrl: './sucursales.css'
})
export class Sucursales implements OnInit {
  private datos = inject(DatosService);
  protected auth = inject(AuthService);

  suc = signal<Sucursal[]>([]);
  cargando = signal(true);
  error = signal('');
  mensaje = signal('');

  // Sucursal que el administrador está editando (copia para el formulario)
  editando = signal<number | null>(null);
  form: Sucursal = { idSucursal: 0, nombre: '', ciudad: '', direccion: '', cantempleado: 0 };

  esAdmin = computed(() => this.auth.categoria() >= 2);
  logueado = computed(() => this.auth.categoria() >= 1);

  ngOnInit(): void {
    this.auth.cargarSesion().then(() => this.cargar());
  }

  cargar(): void {
    this.cargando.set(true);
    this.datos.recuperarSucus().subscribe({
      next: (s) => {
        this.suc.set(s);
        this.error.set('');
        this.cargando.set(false);
      },
      error: (e) => {
        this.error.set(mensajeDeError(e));
        this.cargando.set(false);
      },
    });
  }

  editar(s: Sucursal): void {
    this.form = { ...s };
    this.mensaje.set('');
    this.editando.set(s.idSucursal);
  }

  cancelar(): void {
    this.editando.set(null);
  }

  guardar(): void {
    this.datos.modificarSucursal(this.form).subscribe({
      next: () => {
        this.editando.set(null);
        this.mensaje.set(`Sucursal "${this.form.nombre}" actualizada`);
        this.cargar();
      },
      error: (e) => this.error.set(mensajeDeError(e)),
    });
  }
}
