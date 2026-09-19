import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  credenciales = { username: '', password: '' };
  error = false;

  private authService = inject(AuthService);
  private router = inject(Router);

  iniciarSesion() {
    this.authService.login(this.credenciales).subscribe({
      next: (token: string) => {
        // 1. Guardamos el token
        this.authService.guardarToken(token);
        
        // 2. Leemos los roles para confirmar en consola
        console.log('Ingreso exitoso. Roles asignados:', this.authService.obtenerRoles());
        
        // 3. Redirigimos a la página de inicio (que crearemos después)
        this.router.navigate(['/inicio']);
      },
      error: () => {
        this.error = true;
      }
    });
  }
}