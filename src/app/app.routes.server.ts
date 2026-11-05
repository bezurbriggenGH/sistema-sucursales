import { RenderMode, ServerRoute } from '@angular/ssr';

// Las páginas se arman en el navegador: así las consultas a PHP y el login
// usan la sesión del usuario que está mirando.
export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Client
  }
];
