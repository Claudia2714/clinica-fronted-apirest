export interface Medicamento {
  id?: number;
  nombre: string;
  presentacion?: string;
  dosis?: string;
  stockDisponible?: number;
}

export interface Receta {
  id?: number;
  citaId?: number;
  medicamento: Medicamento;
  indicaciones: string;
  cantidad: number;
}

export interface HistorialPaciente {
  paciente: any;
  totalConsultas: number;
  consultas: {
    cita: any;
    recetas: Receta[];
  }[];
}
