import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { UsuarioService } from '../../services/usuario.service';
import { Usuario, Rol } from '../../models/usuario.model';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css',
})
export class Usuarios implements OnInit {
  usuarios: Usuario[] = [];
  rolesDisponibles: Rol[] = [];
  cargando = true;
  error = '';

  // Modal / Formulario de Creación / Edición
  mostrarModal = false;
  guardando = false;
  usuarioForm: {
    id?: number;
    username: string;
    password?: string;
    roles: { [key: string]: boolean };
  } = {
    username: '',
    password: '',
    roles: {}
  };

  private usuarioService = inject(UsuarioService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    this.error = '';

    this.usuarioService.obtenerRoles().subscribe({
      next: (roles) => {
        this.rolesDisponibles = roles;
      },
      error: (e) => console.error('Error cargando roles', e)
    });

    this.usuarioService.obtenerUsuarios()
      .pipe(
        finalize(() => {
          this.cargando = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (data) => {
          this.usuarios = data;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error al cargar usuarios:', err);
          this.error = 'No se pudieron cargar los usuarios.';
          this.cdr.detectChanges();
        }
      });
  }

  abrirCrear(): void {
    const rolesMap: { [key: string]: boolean } = {};
    this.rolesDisponibles.forEach(r => rolesMap[r.nombre] = false);
    rolesMap['ROLE_OPERADOR'] = true;

    this.usuarioForm = {
      username: '',
      password: '',
      roles: rolesMap
    };
    this.mostrarModal = true;
  }

  abrirEditar(u: Usuario): void {
    const rolesMap: { [key: string]: boolean } = {};
    this.rolesDisponibles.forEach(r => {
      rolesMap[r.nombre] = (u.roles || []).includes(r.nombre);
    });

    this.usuarioForm = {
      id: u.id,
      username: u.username,
      password: '',
      roles: rolesMap
    };
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  guardarUsuario(): void {
    if (!this.usuarioForm.username) {
      alert('El nombre de usuario es obligatorio');
      return;
    }
    if (!this.usuarioForm.id && !this.usuarioForm.password) {
      alert('La contraseña es obligatoria para nuevos usuarios');
      return;
    }

    const rolesSeleccionados = Object.keys(this.usuarioForm.roles)
      .filter(k => this.usuarioForm.roles[k]);

    this.guardando = true;
    this.cdr.detectChanges();

    const payload: Usuario = {
      username: this.usuarioForm.username,
      password: this.usuarioForm.password || undefined,
      roles: rolesSeleccionados
    };

    const req$ = this.usuarioForm.id
      ? this.usuarioService.actualizarUsuario(this.usuarioForm.id, payload)
      : this.usuarioService.crearUsuario(payload);

    req$.pipe(
      finalize(() => {
        this.guardando = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: () => {
        alert(this.usuarioForm.id ? 'Usuario actualizado exitosamente.' : 'Usuario creado exitosamente.');
        this.cerrarModal();
        this.cargarDatos();
      },
      error: (err) => {
        console.error('Error al guardar usuario:', err);
        alert(err.error?.error || 'Error al guardar usuario.');
      }
    });
  }

  desbloquear(u: Usuario): void {
    if (!u.id) return;
    if (confirm(`¿Desbloquear la cuenta de "${u.username}" inmediatamente?`)) {
      this.cargando = true;
      this.cdr.detectChanges();
      this.usuarioService.desbloquearUsuario(u.id).subscribe({
        next: () => {
          alert(`Usuario "${u.username}" desbloqueado con éxito.`);
          this.cargarDatos();
        },
        error: (err) => {
          console.error('Error al desbloquear usuario:', err);
          alert('No se pudo desbloquear el usuario.');
          this.cargando = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  eliminar(u: Usuario): void {
    if (!u.id) return;
    if (confirm(`¿Estás seguro de eliminar el usuario "${u.username}"?`)) {
      this.cargando = true;
      this.cdr.detectChanges();
      this.usuarioService.eliminarUsuario(u.id).subscribe({
        next: () => {
          alert('Usuario eliminado.');
          this.cargarDatos();
        },
        error: (err) => {
          console.error('Error al eliminar:', err);
          alert('No se pudo eliminar el usuario.');
          this.cargando = false;
          this.cdr.detectChanges();
        }
      });
    }
  }
}
