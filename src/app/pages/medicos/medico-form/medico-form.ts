import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { MedicoService } from '../../../services/medico.service';
import { Medico } from '../../../models/medico.model';

@Component({
  selector: 'app-medico-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './medico-form.html',
  styleUrl: './medico-form.css'
})
export class MedicoFormComponent implements OnInit {
  medico: Medico = {
    nombre: '',
    especialidad: '',
    numeroColegiado: '',
    telefono: ''
  };

  esEdicion = false;
  idMedico?: number;
  cargando = false;
  guardando = false;
  error = '';

  private medicoService = inject(MedicoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.esEdicion = true;
      this.idMedico = Number(idParam);
      this.cargarMedico(this.idMedico);
    }
  }

  cargarMedico(id: number): void {
    this.cargando = true;
    this.error = '';
    this.medicoService.obtenerMedicoPorId(id)
      .pipe(
        finalize(() => {
          this.cargando = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (data) => {
          this.medico = data;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error al cargar médico:', err);
          this.error = 'No se pudieron obtener los datos del médico.';
          this.cdr.detectChanges();
        }
      });
  }

  guardar(): void {
    if (!this.medico.nombre || !this.medico.especialidad || !this.medico.numeroColegiado) {
      alert('Por favor completa todos los campos requeridos (*)');
      return;
    }

    this.guardando = true;
    this.error = '';
    this.cdr.detectChanges();

    const request$ = this.esEdicion && this.idMedico
      ? this.medicoService.actualizarMedico(this.idMedico, this.medico)
      : this.medicoService.crearMedico(this.medico);

    request$
      .pipe(
        finalize(() => {
          this.guardando = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: () => {
          alert(this.esEdicion ? 'Médico actualizado exitosamente.' : 'Médico registrado exitosamente.');
          this.router.navigate(['/inicio/medicos']);
        },
        error: (err) => {
          console.error('Error al guardar médico:', err);
          this.error = 'Ocurrió un error al guardar la información del médico.';
          this.cdr.detectChanges();
        }
      });
  }

  cancelar(): void {
    this.router.navigate(['/inicio/medicos']);
  }
}

