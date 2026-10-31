import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { PacienteService } from '../../../services/paciente.service';
import { Paciente } from '../../../models/paciente.model';

@Component({
  selector: 'app-paciente-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './paciente-form.html',
  styleUrl: './paciente-form.css'
})
export class PacienteFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private pacienteService = inject(PacienteService);

  pacienteForm!: FormGroup;
  esEdicion = false;
  pacienteId: number | null = null;
  cargando = false;
  guardando = false;
  errorMensaje = '';

  ngOnInit(): void {
    this.inicializarFormulario();
    this.verificarModo();
  }

  private inicializarFormulario(): void {
    this.pacienteForm = this.fb.group({
      nombres: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      apellidos: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]{8,15}$')]],
      dpi: ['', [Validators.required, Validators.pattern('^[0-9]{13}$')]],
      correo: ['', [Validators.required, Validators.email]],
      fechaNacimiento: ['', [Validators.required]]
    });
  }

  private verificarModo(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      if (isNaN(id) || id <= 0) {
        this.errorMensaje = 'El ID del paciente no es válido.';
        this.cargando = false;
        return;
      }
      this.esEdicion = true;
      this.pacienteId = id;
      this.cargarPaciente(this.pacienteId);
    } else {
      this.esEdicion = false;
      this.pacienteId = null;
      this.cargando = false;
    }
  }

  private extraerPaciente(resp: any): any {
    if (!resp) return null;

    let p = resp;
    // Si viene dentro de wrappers comunes (data, content, body, paciente, result)
    if (p && typeof p === 'object') {
      if (p.data !== undefined && p.data !== null) {
        p = p.data;
      } else if (p.content !== undefined && p.content !== null) {
        p = p.content;
      } else if (p.paciente !== undefined && p.paciente !== null) {
        p = p.paciente;
      } else if (p.result !== undefined && p.result !== null) {
        p = p.result;
      } else if (p.body !== undefined && p.body !== null) {
        p = p.body;
      }
    }

    // Si después de desenvolver es un arreglo (ej. Page.content o array directo)
    if (Array.isArray(p)) {
      p = p.length > 0 ? p[0] : null;
    }

    // Si dentro del elemento hay todavía un wrapper .data
    if (p && typeof p === 'object' && p.data !== undefined && p.data !== null) {
      p = p.data;
    }

    return p;
  }

  private formatearFecha(fechaRaw: any): string {
    if (!fechaRaw) return '';

    try {
      if (typeof fechaRaw === 'string') {
        return fechaRaw.includes('T') ? fechaRaw.split('T')[0] : fechaRaw.trim();
      }
      if (Array.isArray(fechaRaw) && fechaRaw.length >= 3) {
        const y = fechaRaw[0];
        const m = String(fechaRaw[1]).padStart(2, '0');
        const d = String(fechaRaw[2]).padStart(2, '0');
        return `${y}-${m}-${d}`;
      }
      if (typeof fechaRaw === 'number') {
        const d = new Date(fechaRaw);
        if (!isNaN(d.getTime())) {
          return d.toISOString().split('T')[0];
        }
      }
      if (fechaRaw instanceof Date && !isNaN(fechaRaw.getTime())) {
        return fechaRaw.toISOString().split('T')[0];
      }
    } catch (e) {
      console.warn('[PacienteForm] No se pudo formatear la fecha:', fechaRaw, e);
    }

    return '';
  }

  private cargarPaciente(id: number): void {
    this.cargando = true;
    this.errorMensaje = '';

    this.pacienteService.obtenerPacientePorId(id)
      .pipe(
        finalize(() => {
          // Garantiza al 100% que la bandera de carga se apaga ante éxito, error o cancelación
          this.cargando = false;
        })
      )
      .subscribe({
        next: (resp: any) => {
          try {
            console.log('[PacienteForm] Datos del paciente recibidos:', resp);

            const p = this.extraerPaciente(resp);

            if (!p || typeof p !== 'object') {
              this.errorMensaje = 'No se encontró la información del paciente o el formato no es válido.';
              return;
            }

            const fechaFormateada = this.formatearFecha(p.fechaNacimiento);

            // Mapeo tolerante a variantes de nombres de campos del backend
            this.pacienteForm.patchValue({
              nombres: p.nombres || p.nombre || '',
              apellidos: p.apellidos || p.apellido || '',
              telefono: p.telefono || '',
              dpi: p.dpi || '',
              correo: p.correo || '',
              fechaNacimiento: fechaFormateada
            });
          } catch (error: any) {
            console.error('[PacienteForm] Error al procesar datos del paciente:', error);
            this.errorMensaje = 'Ocurrió un error al procesar la información del paciente.';
          }
        },
        error: (err: any) => {
          console.error('[PacienteForm] Error HTTP al cargar paciente:', err);
          if (err.status === 404) {
            this.errorMensaje = `No se encontró ningún paciente con el ID: ${id}.`;
          } else if (err.status === 0) {
            this.errorMensaje = 'No se pudo conectar con el servidor (http://localhost:8081). Verifica que el backend esté activo.';
          } else {
            this.errorMensaje = 'No se pudo cargar la información del paciente desde el servidor.';
          }
        }
      });
  }

  guardar(): void {
    if (this.pacienteForm.invalid) {
      this.pacienteForm.markAllAsTouched();
      return;
    }

    this.guardando = true;
    this.errorMensaje = '';

    const formValues = this.pacienteForm.value;
    const pacienteData: Paciente = {
      nombres: formValues.nombres?.trim() || '',
      apellidos: formValues.apellidos?.trim() || '',
      nombre: formValues.nombres?.trim() || '',
      apellido: formValues.apellidos?.trim() || '',
      telefono: formValues.telefono?.trim() || '',
      dpi: formValues.dpi?.trim() || '',
      correo: formValues.correo?.trim() || '',
      fechaNacimiento: formValues.fechaNacimiento || ''
    };

    if (this.esEdicion && this.pacienteId !== null) {
      this.pacienteService.actualizarPaciente(this.pacienteId, pacienteData)
        .pipe(
          finalize(() => {
            this.guardando = false;
          })
        )
        .subscribe({
          next: () => {
            this.router.navigate(['/inicio/pacientes']);
          },
          error: (err: any) => {
            console.error('Error al actualizar paciente:', err);
            this.errorMensaje = 'Error al actualizar el paciente. Verifica los datos ingresados.';
          }
        });
    } else {
      this.pacienteService.crearPaciente(pacienteData)
        .pipe(
          finalize(() => {
            this.guardando = false;
          })
        )
        .subscribe({
          next: () => {
            this.router.navigate(['/inicio/pacientes']);
          },
          error: (err: any) => {
            console.error('Error al registrar paciente:', err);
            this.errorMensaje = 'Error al registrar el paciente. Verifica que el DPI o correo no estén duplicados.';
          }
        });
    }
  }

  cancelar(): void {
    this.router.navigate(['/inicio/pacientes']);
  }
}
