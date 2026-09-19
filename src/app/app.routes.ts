import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { Inicio } from './components/inicio/inicio';
import { Usuarios } from './components/usuarios/usuarios';
import { roleGuard } from './guards/role-guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'inicio', component: Inicio },
  { 
    path: 'administracion/usuarios', 
    component: Usuarios,
    canActivate: [roleGuard], // Activa nuestro guardián
    data: { rolRequerido: 'ROLE_ADMIN' } // Le decimos al guardián qué rol exigir
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];