import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CanActivateFn, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { API_URL } from './datos.service';

// 0 = Invitado (sin login), 1 = Usuario, 2 = Administrador
export const CATEGORIAS = ['Invitado', 'Usuario', 'Administrador'];

export interface UsuarioLogueado {
  usuario: string;
  nombre: string;
  categoria: number;
}

const OPCIONES = { withCredentials: true };

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private sesionCargada?: Promise<void>;

  readonly usuario = signal<UsuarioLogueado | null>(null);
  readonly categoria = computed(() => this.usuario()?.categoria ?? 0);
  readonly nombreCategoria = computed(() => CATEGORIAS[this.categoria()] ?? 'Invitado');

  // Pregunta al PHP si ya hay una sesión abierta (por ejemplo, al recargar la página).
  cargarSesion(): Promise<void> {
    this.sesionCargada ??= firstValueFrom(
      this.http.get<{ logueado: boolean } & UsuarioLogueado>(`${API_URL}Sesion.php`, OPCIONES)
    )
      .then((r) => this.usuario.set(r.logueado ? { usuario: r.usuario, nombre: r.nombre, categoria: r.categoria } : null))
      .catch(() => this.usuario.set(null));
    return this.sesionCargada;
  }

  async login(usuario: string, clave: string): Promise<void> {
    const r = await firstValueFrom(
      this.http.post<UsuarioLogueado>(`${API_URL}Login.php`, { usuario, clave }, OPCIONES)
    );
    this.usuario.set({ usuario: r.usuario, nombre: r.nombre, categoria: r.categoria });
  }

  async logout(): Promise<void> {
    try {
      await firstValueFrom(this.http.get(`${API_URL}Logout.php`, OPCIONES));
    } finally {
      this.usuario.set(null);
    }
  }
}

// Protege una ruta: si el usuario no llega a la categoría mínima, lo manda al login.
export function requiereCategoria(minima: number): CanActivateFn {
  return async (_ruta, estado) => {
    const auth = inject(AuthService);
    const router = inject(Router);
    await auth.cargarSesion();
    if (auth.categoria() >= minima) {
      return true;
    }
    // Ya logueado pero sin permiso suficiente: vuelve al inicio
    if (auth.categoria() > 0) {
      return router.createUrlTree(['/home']);
    }
    return router.createUrlTree(['/login'], { queryParams: { volver: estado.url } });
  };
}
