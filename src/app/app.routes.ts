import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Ventas } from './ventas/ventas';
import { Sucursales } from './sucursales/sucursales';
import { Clientes } from './clientes/clientes';
import { Login } from './login/login';
import { Facturas } from './facturas/facturas';
import { requiereCategoria } from './servicios/auth.service';

export const routes: Routes = [
  { path: 'home', component: Home },
  { path: 'sucursales', component: Sucursales },
  { path: 'clientes', component: Clientes, canActivate: [requiereCategoria(1)] },
  { path: 'ventas', component: Ventas, canActivate: [requiereCategoria(1)] },
  { path: 'facturas', component: Facturas, canActivate: [requiereCategoria(2)] },
  { path: 'login', component: Login },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'home' }
];
