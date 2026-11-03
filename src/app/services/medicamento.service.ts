import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Medicamento, HistorialPaciente } from '../models/medicamento.model';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MedicamentoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl || 'http://localhost:8081'}/api`;

  // Medicamentos
  obtenerMedicamentos(): Observable<Medicamento[]> {
    return this.http.get<Medicamento[]>(`${this.apiUrl}/medicamentos`);
  }

  crearMedicamento(medicamento: Medicamento): Observable<Medicamento> {
    return this.http.post<Medicamento>(`${this.apiUrl}/medicamentos`, medicamento);
  }

  actualizarMedicamento(id: number, medicamento: Medicamento): Observable<Medicamento> {
    return this.http.put<Medicamento>(`${this.apiUrl}/medicamentos/${id}`, medicamento);
  }

  eliminarMedicamento(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/medicamentos/${id}`);
  }

  // Historial Clínico y Prescripción de Medicamentos
  obtenerHistorialPorPaciente(pacienteId: number): Observable<HistorialPaciente> {
    return this.http.get<HistorialPaciente>(`${this.apiUrl}/historial/paciente/${pacienteId}`);
  }

  agregarReceta(payload: { citaId: number; medicamentoId: number; indicaciones: string; cantidad: number }): Observable<any> {
    return this.http.post(`${this.apiUrl}/historial/recetas`, payload);
  }

  eliminarReceta(recetaId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/historial/recetas/${recetaId}`);
  }
}
