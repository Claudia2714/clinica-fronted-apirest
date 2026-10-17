import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Paciente } from '../models/paciente'; // Verifica que la ruta y el nombre coincidan con tu modelo

@Injectable({
  providedIn: 'root'
})
export class PacienteService {
  private apiUrl = 'http://localhost:8081/api/pacientes'; // URL de tu backend

  constructor(private http: HttpClient) { }

  obtenerPacientes(): Observable<Paciente[]> {
    return this.http.get<Paciente[]>(this.apiUrl);
  }
}