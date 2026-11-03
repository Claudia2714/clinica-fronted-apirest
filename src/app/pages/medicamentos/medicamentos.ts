import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { MedicamentoService } from '../../services/medicamento.service';
import { Medicamento } from '../../models/medicamento.model';

@Component({
  selector: 'app-medicamentos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './medicamentos.html',
  styleUrl: './medicamentos.css'
})
export class MedicamentosComponent implements OnInit {
  medicamentos: Medicamento[] = [];
  medicamentosFiltrados: Medicamento[] = [];
  terminoBusqueda = '';
  cargando = true;
  error = '';

  // Modal
  mostrarModal = false;
  guardando = false;
  medForm: Medicamento = {
    nombre: '',
    presentacion: 'Tableta',
    dosis: '',
    stockDisponible: 100
  };

  private medService = inject(MedicamentoService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.cargarMedicamentos();
  }

  cargarMedicamentos(): void {
    this.cargando = true;
    this.error = '';

    this.medService.obtenerMedicamentos()
      .pipe(
        finalize(() => {
          this.cargando = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (data: any) => {
          const lista = Array.isArray(data) ? data : (data?.content || data?.data || []);
          this.medicamentos = lista.sort((a: any, b: any) => (b.id || 0) - (a.id || 0));
          this.aplicarFiltro();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error al cargar medicamentos:', err);
          this.error = 'No se pudieron cargar los medicamentos.';
          this.cdr.detectChanges();
        }
      });
  }

  aplicarFiltro(): void {
    const term = this.terminoBusqueda.trim().toLowerCase();
    if (!term) {
      this.medicamentosFiltrados = this.medicamentos;
      return;
    }
    this.medicamentosFiltrados = this.medicamentos.filter(m =>
      (m.nombre || '').toLowerCase().includes(term) ||
      (m.presentacion || '').toLowerCase().includes(term) ||
      (m.dosis || '').toLowerCase().includes(term)
    );
  }

  limpiarBusqueda(): void {
    this.terminoBusqueda = '';
    this.aplicarFiltro();
  }

  abrirCrear(): void {
    this.medForm = {
      nombre: '',
      presentacion: 'Tableta',
      dosis: '',
      stockDisponible: 50
    };
    this.mostrarModal = true;
  }

  abrirEditar(m: Medicamento): void {
    this.medForm = { ...m };
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  guardar(): void {
    if (!this.medForm.nombre.trim()) {
      alert('El nombre del medicamento es obligatorio');
      return;
    }

    this.guardando = true;
    this.cdr.detectChanges();

    const req$ = this.medForm.id
      ? this.medService.actualizarMedicamento(this.medForm.id, this.medForm)
      : this.medService.crearMedicamento(this.medForm);

    req$.pipe(
      finalize(() => {
        this.guardando = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: () => {
        alert(this.medForm.id ? 'Medicamento actualizado.' : 'Medicamento agregado al inventario.');
        this.cerrarModal();
        this.cargarMedicamentos();
      },
      error: (err) => {
        console.error('Error al guardar medicamento:', err);
        alert('Error al guardar medicamento en la base de datos.');
      }
    });
  }

  eliminar(id?: number, nombre?: string): void {
    if (!id) return;
    if (confirm(`¿Eliminar medicamento "${nombre || id}"?`)) {
      this.cargando = true;
      this.cdr.detectChanges();
      this.medService.eliminarMedicamento(id).subscribe({
        next: () => {
          alert('Medicamento eliminado.');
          this.cargarMedicamentos();
        },
        error: (err) => {
          console.error('Error al eliminar medicamento:', err);
          alert('No se pudo eliminar el medicamento.');
          this.cargando = false;
          this.cdr.detectChanges();
        }
      });
    }
  }
}
