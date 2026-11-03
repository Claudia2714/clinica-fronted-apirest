import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../services/auth';
import { PacienteService } from '../../services/paciente';
import { MedicoService } from '../../services/medico.service';
import { CitaService } from '../../services/cita.service';
import { UsuarioService } from '../../services/usuario.service';
import { Cita } from '../../models/cita.model';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css'
})
export class Inicio implements OnInit {
  esAdmin = false;
  esOperador = false;
  usuarioActual = '';

  // Métricas del Dashboard
  totalPacientes = 0;
  totalMedicos = 0;
  totalCitas = 0;
  citasProgramadas = 0;
  citasAtendidas = 0;
  totalUsuarios = 0;
  cargandoMetricas = false;

  // Próximas citas para el panel de actividad
  proximasCitas: Cita[] = [];

  private authService = inject(AuthService);
  private pacienteService = inject(PacienteService);
  private medicoService = inject(MedicoService);
  private citaService = inject(CitaService);
  private usuarioService = inject(UsuarioService);
  private cdr = inject(ChangeDetectorRef);
  public router = inject(Router);

  ngOnInit(): void {
    const roles = this.authService.obtenerRoles();
    this.esAdmin = roles.includes('ROLE_ADMIN');
    this.esOperador = roles.includes('ROLE_OPERADOR');
    this.usuarioActual = this.esAdmin ? 'Administrador' : (this.esOperador ? 'Operador' : 'Usuario');

    this.cargarDashboard();
  }

  cargarDashboard(): void {
    this.cargandoMetricas = true;

    const peticiones: any = {
      pacientes: this.pacienteService.obtenerPacientes(),
      medicos: this.medicoService.obtenerMedicos(),
      citas: this.citaService.obtenerCitas()
    };

    if (this.esAdmin) {
      peticiones.usuarios = this.usuarioService.obtenerUsuarios();
    }

    forkJoin(peticiones).subscribe({
      next: (resp: any) => {
        const pacList = Array.isArray(resp.pacientes) ? resp.pacientes : (resp.pacientes?.content || resp.pacientes?.data || []);
        const medList = Array.isArray(resp.medicos) ? resp.medicos : (resp.medicos?.content || resp.medicos?.data || []);
        const citaList: Cita[] = Array.isArray(resp.citas) ? resp.citas : (resp.citas?.content || resp.citas?.data || []);

        this.totalPacientes = pacList.length;
        this.totalMedicos = medList.length;
        this.totalCitas = citaList.length;
        this.citasProgramadas = citaList.filter(c => c.estado === 'PROGRAMADA').length;
        this.citasAtendidas = citaList.filter(c => c.estado === 'ATENDIDA').length;

        if (resp.usuarios) {
          this.totalUsuarios = resp.usuarios.length;
        }

        // Mostrar las 5 citas más recientes o programadas
        this.proximasCitas = citaList
          .sort((a, b) => (b.id || 0) - (a.id || 0))
          .slice(0, 5);

        this.cargandoMetricas = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar datos del dashboard:', err);
        this.cargandoMetricas = false;
        this.cdr.detectChanges();
      }
    });
  }

  cerrarSesion(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
