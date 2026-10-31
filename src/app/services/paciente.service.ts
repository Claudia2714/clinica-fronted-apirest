import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Paciente } from '../models/paciente.model';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PacienteService {
  private http = inject(HttpClient);

  // URL dinámica hacia la API de pacientes según el entorno (local o producción en Render)
  private readonly apiUrl = `${environment.apiUrl || 'http://localhost:8081'}/api/pacientes`;

  obtenerPacientes(): Observable<Paciente[]> {
    return this.http.get<Paciente[]>(this.apiUrl);
  }

  obtenerPacientePorId(id: number): Observable<Paciente> {
    return this.http.get<Paciente>(`${this.apiUrl}/${id}`);
  }

  crearPaciente(paciente: Paciente): Observable<Paciente> {
    return this.http.post<Paciente>(this.apiUrl, paciente);
  }

  actualizarPaciente(id: number, paciente: Paciente): Observable<Paciente> {
    return this.http.put<Paciente>(`${this.apiUrl}/${id}`, paciente);
  }

  eliminarPaciente(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
