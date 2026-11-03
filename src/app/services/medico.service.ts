import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Medico } from '../models/medico.model';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MedicoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl || 'http://localhost:8081'}/api/medicos`;

  obtenerMedicos(): Observable<Medico[]> {
    return this.http.get<Medico[]>(this.apiUrl);
  }

  obtenerMedicoPorId(id: number): Observable<Medico> {
    return this.http.get<Medico>(`${this.apiUrl}/${id}`);
  }

  crearMedico(medico: Medico): Observable<Medico> {
    return this.http.post<Medico>(this.apiUrl, medico);
  }

  actualizarMedico(id: number, medico: Medico): Observable<Medico> {
    return this.http.put<Medico>(`${this.apiUrl}/${id}`, medico);
  }

  eliminarMedico(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

