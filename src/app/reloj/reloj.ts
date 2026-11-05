import { ChangeDetectorRef, Component } from '@angular/core';

@Component({
  selector: 'app-reloj',
  standalone: true,
  templateUrl: './reloj.html',
  styleUrls: ['./reloj.css']
})
export class Reloj {
  horaActual: string = '';

  constructor(private cdr: ChangeDetectorRef) {
    this.actualizarHora();
    setInterval(() => {
      this.actualizarHora();
      this.cdr.detectChanges();
    }, 1000);
  }

  actualizarHora() {
    const ahora = new Date();
    this.horaActual = ahora.toLocaleTimeString('es-AR', { hour12: false });
  }
}
