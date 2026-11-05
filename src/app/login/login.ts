import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../servicios/auth.service';
import { mensajeDeError } from '../servicios/datos.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  private auth = inject(AuthService);
  private router = inject(Router);
  private ruta = inject(ActivatedRoute);

  usuario = '';
  clave = '';
  enviando = signal(false);
  error = signal('');

  async ingresar(): Promise<void> {
    if (!this.usuario.trim() || !this.clave) {
      this.error.set('Completá usuario y contraseña');
      return;
    }
    this.error.set('');
    this.enviando.set(true);
    try {
      await this.auth.login(this.usuario.trim(), this.clave);
      const volver = this.ruta.snapshot.queryParamMap.get('volver') ?? '/home';
      this.router.navigateByUrl(volver);
    } catch (e) {
      this.error.set(mensajeDeError(e));
    } finally {
      this.enviando.set(false);
    }
  }
}
