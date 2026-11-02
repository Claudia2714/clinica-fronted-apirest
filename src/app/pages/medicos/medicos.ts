import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { MedicoService } from '../../services/medico.service';
import { Medico } from '../../models/medico.model';

@Component({
  selector: 'app-medicos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './medicos.html',
  styleUrl: './medicos.css'
})
export class MedicosComponent implements OnInit {
  medicos: Medico[] = [];
  medicosFiltrados: Medico[] = [];
  terminoBusqueda = '';
  cargando = true;
  error = '';

  private medicoService = inject(MedicoService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.cargarMedicos();
  }

  cargarMedicos(): void {
    this.cargando = true;
    this.error = '';

    this.medicoService.obtenerMedicos()
      .pipe(
        finalize(() => {
          this.cargando = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (datos: any) => {
          const lista: Medico[] = Array.isArray(datos) ? datos : (datos?.content || datos?.data || []);
          this.medicos = lista.sort((a, b) => (b.id || 0) - (a.id || 0));
          this.aplicarFiltro();
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          console.error('Error al cargar médicos:', err);
          this.error = 'No se pudieron cargar los médicos desde el servidor.';
          this.cdr.detectChanges();
        }
      });
  }

  aplicarFiltro(): void {
    const termino = this.terminoBusqueda.trim().toLowerCase();
    if (!termino) {
      this.medicosFiltrados = this.medicos;
      return;
    }
    this.medicosFiltrados = this.medicos.filter(m => {
      const nombre = (m.nombre || '').toLowerCase();
      const especialidad = (m.especialidad || '').toLowerCase();
      const colegiado = (m.numeroColegiado || '').toLowerCase();
      return nombre.includes(termino) || especialidad.includes(termino) || colegiado.includes(termino);
    });
  }

  limpiarBusqueda(): void {
    this.terminoBusqueda = '';
    this.aplicarFiltro();
  }

  irANuevo(): void {
    this.router.navigate(['/inicio/medicos/nuevo']);
  }

  editarMedico(id?: number): void {
    if (id) {
      this.router.navigate(['/inicio/medicos/editar', id]);
    }
  }

  eliminarMedico(id?: number, nombre?: string): void {
    if (!id) return;
    if (confirm(`¿Estás seguro de que deseas eliminar al médico "${nombre || id}"?`)) {
      this.cargando = true;
      this.cdr.detectChanges();
      this.medicoService.eliminarMedico(id).subscribe({
        next: () => {
          alert('Médico eliminado exitosamente.');
          this.cargarMedicos();
        },
        error: (err: any) => {
          console.error('Error al eliminar médico:', err);
          alert('No se pudo eliminar el médico. Verifica que no tenga citas asociadas.');
          this.cargando = false;
          this.cdr.detectChanges();
        }
      });
    }
  }
}
