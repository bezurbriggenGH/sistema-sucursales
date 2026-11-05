import { Component, OnInit, computed, inject } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Footer } from './footer/footer';
import { Reloj } from './reloj/reloj';
import { AuthService } from './servicios/auth.service';

interface OpcionMenu {
  ruta: string;
  texto: string;
  categoriaMinima: number;
}

// Cada opción se ve a partir de esa categoría (0 invitado, 1 usuario, 2 admin).
const MENU: OpcionMenu[] = [
  { ruta: '/home', texto: 'Home', categoriaMinima: 0 },
  { ruta: '/sucursales', texto: 'Sucursales', categoriaMinima: 0 },
  { ruta: '/clientes', texto: 'Clientes', categoriaMinima: 1 },
  { ruta: '/ventas', texto: 'Ventas', categoriaMinima: 1 },
  { ruta: '/facturas', texto: 'Facturas', categoriaMinima: 2 },
];

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Footer, Reloj],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected auth = inject(AuthService);
  private router = inject(Router);

  protected menu = computed(() => MENU.filter((o) => this.auth.categoria() >= o.categoriaMinima));

  ngOnInit(): void {
    this.auth.cargarSesion();
  }

  async salir(): Promise<void> {
    await this.auth.logout();
    this.router.navigate(['/home']);
  }
}
