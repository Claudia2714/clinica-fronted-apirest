import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { jwtInterceptor } from './core/interceptors/jwt-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // Habilitamos la detección de cambios basada en Zone.js (requerido en Angular 21+ cuando se usa zone.js)
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    // Habilitamos el cliente HTTP y le conectamos el interceptor
    provideHttpClient(withInterceptors([jwtInterceptor]))
  ]
};
