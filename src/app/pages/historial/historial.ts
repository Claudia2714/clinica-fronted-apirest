import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { PacienteService } from '../../services/paciente';
import { MedicamentoService } from '../../services/medicamento.service';
import { Paciente } from '../../models/paciente.model';
import { HistorialPaciente, Medicamento } from '../../models/medicamento.model';

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './historial.html',
  styleUrl: './historial.css'
})
export class HistorialComponent implements OnInit {
  pacientes: Paciente[] = [];
  pacienteSeleccionadoId: string = '';
  historial?: HistorialPaciente;

  medicamentosDisponibles: Medicamento[] = [];

  cargandoPacientes = true;
  cargandoHistorial = false;
  error = '';

  // Modal para prescribir receta
  mostrarModalReceta = false;
  guardandoReceta = false;
  citaSeleccionadaParaReceta: any = null;
  recetaForm = {
    medicamentoId: '',
    indicaciones: '',
    cantidad: 1
  };

  private pacienteService = inject(PacienteService);
  private medService = inject(MedicamentoService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.cargarPacientes();
    this.cargarMedicamentos();
  }

  cargarPacientes(): void {
    this.cargandoPacientes = true;
    this.pacienteService.obtenerPacientes()
      .pipe(
        finalize(() => {
          this.cargandoPacientes = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (data: any) => {
          this.pacientes = Array.isArray(data) ? data : (data?.content || data?.data || []);
          if (this.pacientes.length > 0) {
            const primerId = this.pacientes[0].id || this.pacientes[0].idPaciente;
            if (primerId) {
              this.pacienteSeleccionadoId = primerId.toString();
              this.cargarHistorial(Number(primerId));
            }
          }
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error cargando pacientes:', err)
      });
  }

  cargarMedicamentos(): void {
    this.medService.obtenerMedicamentos().subscribe({
      next: (meds: any) => {
        this.medicamentosDisponibles = Array.isArray(meds) ? meds : (meds?.content || meds?.data || []);
      },
      error: (e) => console.error('Error cargando medicamentos:', e)
    });
  }

  onPacienteChange(): void {
    if (this.pacienteSeleccionadoId) {
      this.cargarHistorial(Number(this.pacienteSeleccionadoId));
    }
  }

  cargarHistorial(pacienteId: number): void {
    this.cargandoHistorial = true;
    this.error = '';

    this.medService.obtenerHistorialPorPaciente(pacienteId)
      .pipe(
        finalize(() => {
          this.cargandoHistorial = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (data) => {
          this.historial = data;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error cargando historial:', err);
          this.error = 'No se pudo cargar el historial del paciente.';
          this.cdr.detectChanges();
        }
      });
  }

  abrirPrescribir(cita: any): void {
    this.citaSeleccionadaParaReceta = cita;
    this.recetaForm = {
      medicamentoId: '',
      indicaciones: '',
      cantidad: 1
    };
    this.mostrarModalReceta = true;
  }

  cerrarModalReceta(): void {
    this.mostrarModalReceta = false;
    this.citaSeleccionadaParaReceta = null;
  }

  guardarReceta(): void {
    if (!this.recetaForm.medicamentoId || !this.recetaForm.indicaciones.trim()) {
      alert('Por favor selecciona un medicamento e ingresa las indicaciones.');
      return;
    }

    this.guardandoReceta = true;
    this.cdr.detectChanges();

    const payload = {
      citaId: this.citaSeleccionadaParaReceta.id,
      medicamentoId: Number(this.recetaForm.medicamentoId),
      indicaciones: this.recetaForm.indicaciones.trim(),
      cantidad: this.recetaForm.cantidad || 1
    };

    this.medService.agregarReceta(payload)
      .pipe(
        finalize(() => {
          this.guardandoReceta = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: () => {
          alert('✅ Medicamento recetado exitosamente y descontado de farmacia.');
          this.cerrarModalReceta();
          if (this.pacienteSeleccionadoId) {
            this.cargarHistorial(Number(this.pacienteSeleccionadoId));
          }
        },
        error: (err) => {
          console.error('Error al prescribir:', err);
          alert('Error al recetar medicamento.');
        }
      });
  }

  eliminarReceta(recetaId?: number): void {
    if (!recetaId) return;
    if (confirm('¿Eliminar medicamento prescrito de esta consulta?')) {
      this.medService.eliminarReceta(recetaId).subscribe({
        next: () => {
          if (this.pacienteSeleccionadoId) {
            this.cargarHistorial(Number(this.pacienteSeleccionadoId));
          }
        },
        error: (err) => console.error('Error eliminando receta:', err)
      });
    }
  }
}

