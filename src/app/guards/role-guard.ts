import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth'; // Verifica que la ruta a tu servicio sea correcta

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. Obtenemos los roles que tiene el usuario actualmente en su token
  const rolesUsuario = authService.obtenerRoles();
  
  // 2. Obtenemos el rol que exige la ruta a la que intenta entrar
  const rolRequerido = route.data['rolRequerido'];

  // 3. Verificamos si tiene el permiso
  if (rolesUsuario.includes(rolRequerido)) {
    return true; // ¡Pase adelante!
  } else {
    // No tiene permiso: lanzamos una alerta y lo pateamos al inicio
    alert('Acceso Denegado: Tu rol actual no tiene permisos para ver esta página.');
    router.navigate(['/inicio']);
    return false; // Bloquea la navegación
  }
};