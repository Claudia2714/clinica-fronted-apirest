import { HttpInterceptorFn } from '@angular/common/http';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  // 1. Buscamos el token en el almacenamiento local
  const token = localStorage.getItem('token');

  // 2. Si existe el token, clonamos la petición y le inyectamos el encabezado Authorization
  if (token) {
    const peticionConToken = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}` // Aquí se pega el JWT con el formato Bearer
      }
    });
    return next(peticionConToken); // Enviamos la petición modificada al backend
  }

  // 3. Si no hay token (por ejemplo, cuando apenas te vas a loguear), pasa normal
  return next(req);
};