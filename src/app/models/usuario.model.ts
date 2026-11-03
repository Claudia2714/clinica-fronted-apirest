export interface Usuario {
  id?: number;
  username: string;
  password?: string;
  intentosFallidos?: number;
  bloqueado?: boolean;
  roles: string[];
}

export interface Rol {
  id?: number;
  nombre: string;
}

