import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { Inicio } from './pages/inicio/inicio';
import { Usuarios } from './pages/usuarios/usuarios';
import { Pacientes } from './pages/pacientes/pacientes';
import { roleGuard } from './core/guards/role-guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { 
    path: 'inicio', 
    component: Inicio, // Inicio ahora es el "cascarón"
    children: [
      { 
        path: 'pacientes', // La ruta real será /inicio/pacientes
        component: Pacientes,
        canActivate: [roleGuard],
        data: { rolRequerido: 'ROLE_OPERADOR' }
      },
      { 
        path: 'administracion/usuarios', 
        component: Usuarios,
        canActivate: [roleGuard],
        data: { rolRequerido: 'ROLE_ADMIN' }
      }
    ]
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];