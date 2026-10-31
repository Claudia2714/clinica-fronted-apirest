export interface Paciente {
  id?: number;
  idPaciente?: number;
  nombre?: string;
  nombres?: string;
  apellido?: string;
  apellidos?: string;
  telefono: string;
  dpi: string;
  correo: string;
  fechaNacimiento: string;
  activo?: boolean;
}
