import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // 1. Importación clave para *ngFor y *ngIf
import { PacienteService } from '../../services/paciente.service'; // Ajusta si tu archivo se llama distinto
import { Paciente } from '../../models/paciente'; // Ajusta si tu archivo se llama distinto

@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [CommonModule], // 2. Debe estar declarado aquí adentro
  templateUrl: './pacientes.html',
  styleUrl: './pacientes.css'
})
export class PacientesComponent implements OnInit {
  // 3. ¡Súper importante el = [] al final! Evita el error de 'length'
  pacientes: Paciente[] = []; 

  constructor(private pacienteService: PacienteService) {}

  ngOnInit(): void {
    this.pacienteService.obtenerPacientes().subscribe({
      next: (datos) => {
        this.pacientes = datos;
      },
      error: (err) => {
        console.error('Error al cargar pacientes', err);
      }
    });
  }
}