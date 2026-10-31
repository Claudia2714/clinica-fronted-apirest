import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css'
})
export class Inicio implements OnInit {
  esAdmin: boolean = false;
  esOperador: boolean = false;
  usuarioActual: string = '';

  constructor(
    private authService: AuthService, 
    public router: Router
  ) {}

  ngOnInit(): void {
    const roles = this.authService.obtenerRoles();
    this.esAdmin = roles.includes('ROLE_ADMIN');
    this.esOperador = roles.includes('ROLE_OPERADOR');
    this.usuarioActual = this.esAdmin ? 'Administrador' : (this.esOperador ? 'Operador' : 'Usuario');
  }

  cerrarSesion(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
