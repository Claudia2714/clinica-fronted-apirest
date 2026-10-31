import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { PacienteService } from '../../services/paciente';
import { Paciente } from '../../models/paciente.model';

@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pacientes.html',
  styleUrl: './pacientes.css'
})
export class PacientesComponent implements OnInit {
  pacientes: Paciente[] = [];
  pacientesFiltrados: Paciente[] = [];
  terminoBusqueda = '';
  cargando = true; // Inicia en true para evitar el parpadeo de "Sin pacientes" en la carga inicial
  error = '';

  private pacienteService = inject(PacienteService);
  private router = inject(Router);

  ngOnInit(): void {
    this.cargarPacientes();
  }

  cargarPacientes(): void {
    this.cargando = true;
    this.error = '';

    this.pacienteService.obtenerPacientes()
      .pipe(
        finalize(() => {
          this.cargando = false;
        })
      )
      .subscribe({
        next: (datos: any) => {
          console.log('[Pacientes] Respuesta recibida del backend:', datos);

          // Soporta array directo, paginación Spring Data (content) o respuestas envueltas (data)
          const lista: any[] = Array.isArray(datos)
            ? datos
            : (datos?.content || datos?.data || []);

          // Normalizamos y ordenamos el arreglo original por ID descendente (los más recientes primero)
          this.pacientes = lista
            .map((p: any) => ({
              ...p,
              id: p.id ?? p.idPaciente,
              idPaciente: p.idPaciente ?? p.id,
              nombre: p.nombre ?? p.nombres ?? '',
              nombres: p.nombres ?? p.nombre ?? '',
              apellido: p.apellido ?? p.apellidos ?? '',
              apellidos: p.apellidos ?? p.apellido ?? '',
              telefono: p.telefono ?? '',
              dpi: p.dpi ?? '',
              correo: p.correo ?? '',
              fechaNacimiento: p.fechaNacimiento ?? ''
            }))
            .sort((a, b) => {
              const idA = Number(a.id ?? a.idPaciente ?? 0);
              const idB = Number(b.id ?? b.idPaciente ?? 0);
              return idB - idA;
            });

          // Mostramos únicamente los últimos 5 pacientes registrados al inicio
          this.aplicarFiltro();
        },
        error: (err: any) => {
          console.error('Error al cargar pacientes desde el puerto 8081:', err);
          this.error = 'No se pudieron cargar los pacientes. Verifica que apirest-demo esté corriendo en el puerto 8081.';
        }
      });
  }

  aplicarFiltro(): void {
    const termino = this.terminoBusqueda.trim().toLowerCase();

    // Si el buscador está vacío o se limpió, mostrar únicamente los últimos 5 pacientes registrados
    if (!termino) {
      this.pacientesFiltrados = this.pacientes.slice(0, 5);
      return;
    }

    // Cuando el usuario escribe, buscar sobre el arreglo completo (this.pacientes) sin límite de 5
    this.pacientesFiltrados = this.pacientes.filter(p => {
      const nombreCompleto = `${p.nombres || p.nombre || ''} ${p.apellidos || p.apellido || ''}`.toLowerCase();
      const dpi = (p.dpi || '').toLowerCase();
      const telefono = (p.telefono || '').toLowerCase();
      const correo = (p.correo || '').toLowerCase();

      return nombreCompleto.includes(termino) ||
             dpi.includes(termino) ||
             telefono.includes(termino) ||
             correo.includes(termino);
    });
  }

  limpiarBusqueda(): void {
    this.terminoBusqueda = '';
    this.aplicarFiltro(); // Restablece la vista a los últimos 5 pacientes
  }

  editarPaciente(id?: number): void {
    if (id !== undefined && id !== null) {
      this.router.navigate(['/inicio/pacientes/editar', id]);
    }
  }

  eliminarPaciente(id?: number, nombre?: string): void {
    if (id === undefined || id === null) {
      alert('Error: No se pudo identificar el identificador (ID) del paciente.');
      return;
    }

    const etiqueta = nombre ? `"${nombre}"` : 'este paciente';
    const confirmacion = window.confirm(`¿Estás seguro de que deseas eliminar a ${etiqueta}? Esta acción no se puede deshacer.`);

    if (confirmacion) {
      this.cargando = true;
      this.pacienteService.eliminarPaciente(id).subscribe({
        next: () => {
          alert('Paciente eliminado exitosamente.');
          this.cargarPacientes();
        },
        error: (err: any) => {
          console.error('Error al eliminar paciente:', err);
          alert('No se pudo eliminar el paciente. Verifica que no tenga citas registradas u otros datos asociados.');
          this.cargando = false;
        }
      });
    }
  }
}
