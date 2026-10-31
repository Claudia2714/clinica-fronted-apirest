import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // ✅ URL desde el archivo de entorno — cambia automáticamente en producción
  private authUrl = `${environment.authUrl}/auth/login`;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  /**
   * Envía las credenciales + token Turnstile al backend.
   * @param credentials objeto con username, password y turnstileToken
   */
  login(credentials: { username: string; password: string; turnstileToken: string }) {
    return this.http.post(this.authUrl, credentials, { responseType: 'text' });
  }

  guardarToken(token: string) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('token', token);
    }
  }

  obtenerToken() {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('token');
    }
    return null;
  }

  obtenerRoles(): string[] {
    const token = this.obtenerToken();
    if (token) {
      try {
        const decodificado: any = jwtDecode(token);
        return decodificado.roles || [];
      } catch (error) {
        return [];
      }
    }
    return [];
  }

  tieneRol(rolEsperado: string): boolean {
    const roles = this.obtenerRoles();
    return roles.includes(rolEsperado);
  }

  cerrarSesion() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
    }
  }
}