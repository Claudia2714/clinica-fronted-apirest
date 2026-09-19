import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { HttpClient } from '@angular/common/http'; // 1. Agregamos esta importación

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css'
})
export class Inicio implements OnInit {
  esAdmin: boolean = false;
  esOperador: boolean = false;
  usuarioActual: string = '';

  // 2. Inyectamos el HttpClient en el constructor
  constructor(
    private authService: AuthService, 
    private router: Router,
    private http: HttpClient 
  ) {}

  ngOnInit(): void {
    const roles = this.authService.obtenerRoles();
    this.esAdmin = roles.includes('ROLE_ADMIN');
    this.esOperador = roles.includes('ROLE_OPERADOR');
    this.usuarioActual = this.esAdmin ? 'Administrador' : (this.esOperador ? 'Operador' : 'Usuario');

    // 3. Disparamos una petición al backend solo para probar el Interceptor
    // No importa si la ruta /api/prueba no existe y da error 404, la petición se hará.
    this.http.get('http://localhost:8081/api/prueba').subscribe({
      next: (res) => console.log(res),
      error: (err) => console.log('Petición ejecutada')
    });
  }

  cerrarSesion(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}