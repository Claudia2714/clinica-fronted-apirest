import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { CitaService } from '../../services/cita.service';
import { Cita } from '../../models/cita.model';

@Component({
  selector: 'app-citas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './citas.html',
  styleUrl: './citas.css'
})
export class CitasComponent implements OnInit {
  citas: Cita[] = [];
  citasFiltradas: Cita[] = [];
  terminoBusqueda = '';
  cargando = true;
  error = '';

  private citaService = inject(CitaService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.cargarCitas();
  }

  cargarCitas(): void {
    this.cargando = true;
    this.error = '';

    this.citaService.obtenerCitas()
      .pipe(
        finalize(() => {
          this.cargando = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (datos: any) => {
          const lista: Cita[] = Array.isArray(datos) ? datos : (datos?.content || datos?.data || []);
          this.citas = lista.sort((a, b) => (b.id || 0) - (a.id || 0));
          this.aplicarFiltro();
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          console.error('Error al cargar citas:', err);
          this.error = 'No se pudieron cargar las citas desde el servidor.';
          this.cdr.detectChanges();
        }
      });
  }

  aplicarFiltro(): void {
    const termino = this.terminoBusqueda.trim().toLowerCase();
    if (!termino) {
      this.citasFiltradas = this.citas;
      return;
    }
    this.citasFiltradas = this.citas.filter(c => {
      const pac = `${c.paciente?.nombres || c.paciente?.nombre || ''} ${c.paciente?.apellidos || c.paciente?.apellido || ''}`.toLowerCase();
      const med = (c.medico?.nombre || '').toLowerCase();
      const mot = (c.motivo || '').toLowerCase();
      const fecha = (c.fecha || '').toLowerCase();
      return pac.includes(termino) || med.includes(termino) || mot.includes(termino) || fecha.includes(termino);
    });
  }

  limpiarBusqueda(): void {
    this.terminoBusqueda = '';
    this.aplicarFiltro();
  }

  irANueva(): void {
    this.router.navigate(['/inicio/citas/nueva']);
  }

  cambiarEstado(cita: Cita, nuevoEstado: string): void {
    if (!cita.id) return;
    this.cargando = true;
    this.cdr.detectChanges();
    this.citaService.actualizarCita(cita.id, { estado: nuevoEstado })
      .subscribe({
        next: () => {
          cita.estado = nuevoEstado;
          this.cargando = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error al actualizar estado de la cita:', err);
          alert('No se pudo actualizar el estado de la cita.');
          this.cargando = false;
          this.cdr.detectChanges();
        }
      });
  }

  eliminarCita(id?: number): void {
    if (!id) return;
    if (confirm('¿Estás seguro de que deseas cancelar/eliminar esta cita médica?')) {
      this.cargando = true;
      this.cdr.detectChanges();
      this.citaService.eliminarCita(id).subscribe({
        next: () => {
          alert('Cita médica eliminada.');
          this.cargarCitas();
        },
        error: (err) => {
          console.error('Error al eliminar cita:', err);
          alert('No se pudo eliminar la cita.');
          this.cargando = false;
          this.cdr.detectChanges();
        }
      });
    }
  }
}
