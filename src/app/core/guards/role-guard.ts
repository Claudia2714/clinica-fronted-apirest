import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth'; // Revisa que la ruta a tu servicio esté bien

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const rolesUsuario = authService.obtenerRoles();
  const rolRequerido = route.data['rolRequerido'];

  // 1. LLAVE MAESTRA: Si es Admin, lo dejamos pasar a cualquier ruta protegida
  if (rolesUsuario.includes('ROLE_ADMIN')) {
    return true;
  }

  // 2. Si no es Admin, verificamos si tiene el rol específico que pide la ruta
  if (rolesUsuario.includes(rolRequerido)) {
    return true;
  } else {
    alert('Acceso Denegado: Tu rol actual no tiene permisos para ver esta página.');
    router.navigate(['/inicio']);
    return false;
  }
};