import { Paciente } from './paciente.model';
import { Medico } from './medico.model';

export interface Cita {
  id?: number;
  paciente?: Paciente;
  pacienteId?: number;
  medico?: Medico;
  medicoId?: number;
  fecha: string;
  hora: string;
  motivo: string;
  estado?: string;
}
