import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../servicios/auth.service';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  protected auth = inject(AuthService);
  protected categoria = computed(() => this.auth.categoria());

  // Qué puede hacer cada tipo de usuario
  protected roles = [
    { nivel: 0, nombre: 'Invitado', detalle: 'Ve el inicio y la lista de sucursales.' },
    { nivel: 1, nombre: 'Usuario', detalle: 'Ve clientes, ventas, gráficos y el personal de cada sucursal.' },
    { nivel: 2, nombre: 'Administrador', detalle: 'Además ve las facturas y puede cambiar su estado, agregar, modificar y borrar clientes y editar sucursales.' },
  ];

  // Si no tiene permiso, la tarjeta lleva al login
  ruta(destino: string, minima: number): string {
    return this.categoria() >= minima ? destino : '/login';
  }
}
