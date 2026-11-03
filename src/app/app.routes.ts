import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { Inicio } from './pages/inicio/inicio';
import { Usuarios } from './pages/usuarios/usuarios';
import { PacientesComponent } from './pages/pacientes/pacientes';
import { PacienteFormComponent } from './pages/pacientes/paciente-form/paciente-form';
import { MedicosComponent } from './pages/medicos/medicos';
import { MedicoFormComponent } from './pages/medicos/medico-form/medico-form';
import { CitasComponent } from './pages/citas/citas';
import { CitaFormComponent } from './pages/citas/cita-form/cita-form';
import { MedicamentosComponent } from './pages/medicamentos/medicamentos';
import { HistorialComponent } from './pages/historial/historial';
import { roleGuard } from './core/guards/role-guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { 
    path: 'inicio', 
    component: Inicio,
    children: [
      // ── PACIENTES ─────────────────────────────
      { 
        path: 'pacientes',
        component: PacientesComponent,
        canActivate: [roleGuard],
        data: { rolRequerido: 'ROLE_OPERADOR' }
      },
      { 
        path: 'pacientes/nuevo',
        component: PacienteFormComponent,
        canActivate: [roleGuard],
        data: { rolRequerido: 'ROLE_OPERADOR' }
      },
      { 
        path: 'pacientes/editar/:id',
        component: PacienteFormComponent,
        canActivate: [roleGuard],
        data: { rolRequerido: 'ROLE_OPERADOR' }
      },

      // ── MÉDICOS ───────────────────────────────
      { 
        path: 'medicos',
        component: MedicosComponent,
        canActivate: [roleGuard],
        data: { rolRequerido: 'ROLE_ADMIN' }
      },
      { 
        path: 'medicos/nuevo',
        component: MedicoFormComponent,
        canActivate: [roleGuard],
        data: { rolRequerido: 'ROLE_ADMIN' }
      },
      { 
        path: 'medicos/editar/:id',
        component: MedicoFormComponent,
        canActivate: [roleGuard],
        data: { rolRequerido: 'ROLE_ADMIN' }
      },

      // ── CITAS MÉDICAS ─────────────────────────
      { 
        path: 'citas',
        component: CitasComponent,
        canActivate: [roleGuard],
        data: { rolRequerido: 'ROLE_OPERADOR' }
      },
      { 
        path: 'citas/nueva',
        component: CitaFormComponent,
        canActivate: [roleGuard],
        data: { rolRequerido: 'ROLE_OPERADOR' }
      },

      // ── FARMACIA / MEDICAMENTOS ───────────────
      { 
        path: 'medicamentos',
        component: MedicamentosComponent,
        canActivate: [roleGuard],
        data: { rolRequerido: 'ROLE_OPERADOR' }
      },

      // ── EXPEDIENTE / HISTORIAL CLÍNICO ────────
      { 
        path: 'historial',
        component: HistorialComponent,
        canActivate: [roleGuard],
        data: { rolRequerido: 'ROLE_OPERADOR' }
      },

      // ── ADMINISTRACIÓN (USUARIOS Y ROLES) ─────
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
