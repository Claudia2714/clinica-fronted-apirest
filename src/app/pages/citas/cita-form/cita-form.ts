import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { CitaService } from '../../../services/cita.service';
import { PacienteService } from '../../../services/paciente';
import { MedicoService } from '../../../services/medico.service';
import { Paciente } from '../../../models/paciente.model';
import { Medico } from '../../../models/medico.model';

@Component({
  selector: 'app-cita-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cita-form.html',
  styleUrl: './cita-form.css'
})
export class CitaFormComponent implements OnInit {
  pacientes: Paciente[] = [];
  medicos: Medico[] = [];

  cita = {
    pacienteId: '',
    medicoId: '',
    fecha: '',
    hora: '',
    motivo: '',
    estado: 'PROGRAMADA'
  };

  cargando = true;
  guardando = false;
  error = '';

  private citaService = inject(CitaService);
  private pacienteService = inject(PacienteService);
  private medicoService = inject(MedicoService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.cargarCatalogos();
  }

  cargarCatalogos(): void {
    this.cargando = true;
    this.error = '';

    forkJoin({
      pacientes: this.pacienteService.obtenerPacientes(),
      medicos: this.medicoService.obtenerMedicos()
    })
      .pipe(
        finalize(() => {
          this.cargando = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (resp: any) => {
          const pacs = resp.pacientes;
          const meds = resp.medicos;
          this.pacientes = Array.isArray(pacs) ? pacs : (pacs?.content || pacs?.data || []);
          this.medicos = Array.isArray(meds) ? meds : (meds?.content || meds?.data || []);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error al cargar catálogos:', err);
          this.error = 'No se pudieron cargar los pacientes y médicos para agendar la cita.';
          this.cdr.detectChanges();
        }
      });
  }

  guardar(): void {
    if (!this.cita.pacienteId || !this.cita.medicoId || !this.cita.fecha || !this.cita.hora || !this.cita.motivo) {
      alert('Por favor completa todos los campos del formulario');
      return;
    }

    this.guardando = true;
    this.error = '';
    this.cdr.detectChanges();

    this.citaService.crearCita(this.cita)
      .pipe(
        finalize(() => {
          this.guardando = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: () => {
          alert('Cita médica programada exitosamente.');
          this.router.navigate(['/inicio/citas']);
        },
        error: (err) => {
          console.error('Error al agendar cita:', err);
          this.error = 'Ocurrió un error al agendar la cita en el servidor.';
          this.cdr.detectChanges();
        }
      });
  }

  cancelar(): void {
    this.router.navigate(['/inicio/citas']);
  }
}
