import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authUrl = 'http://localhost:8081/auth/login';

  constructor(
    private http: HttpClient, 
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  login(credentials: any) {
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
        // Si tu claim de roles en Spring se llama diferente (ej. authorities), cámbialo aquí
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