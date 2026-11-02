import { Component, OnInit, OnDestroy, inject, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../services/auth';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent implements OnInit, OnDestroy {
  credenciales = { username: '', password: '' };
  error       = false;
  errorMsg    = 'Credenciales inválidas. Intenta de nuevo.';
  cargando    = false;

  /** Token devuelto por el widget de Cloudflare Turnstile al ser resuelto */
  turnstileToken = '';

  /** Site Key del entorno — se inyecta como data-attribute en el widget */
  readonly turnstileSiteKey = environment.turnstileSiteKey;

  private authService = inject(AuthService);
  private router      = inject(Router);
  private ngZone      = inject(NgZone);
  private cdr         = inject(ChangeDetectorRef);

  ngOnInit(): void {
    // 1. Exponer callbacks en window para que Turnstile los invoque al resolver el reto
    (window as any).onCaptchaResolved = (token: string) => {
      this.ngZone.run(() => {
        this.onCaptchaResolved(token);
        this.cdr.detectChanges();
      });
    };

    (window as any).onCaptchaExpired = () => {
      this.ngZone.run(() => {
        this.onCaptchaExpired();
        this.cdr.detectChanges();
      });
    };

    // Alias por compatibilidad
    (window as any).onTurnstileCallback = (window as any).onCaptchaResolved;
    (window as any).onTurnstileExpired  = (window as any).onCaptchaExpired;

    // 2. Cargar el script de Turnstile si aún no está presente en el documento
    if (!document.getElementById('cf-turnstile-script')) {
      const script = document.createElement('script');
      script.id    = 'cf-turnstile-script';
      script.src   = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    } else if (typeof (window as any).turnstile !== 'undefined') {
      // Si el script ya estaba cargado de una navegación previa, reiniciar el widget
      setTimeout(() => {
        try {
          (window as any).turnstile.reset();
        } catch (e) {
          console.warn('[Turnstile] Error al reiniciar widget:', e);
        }
      }, 100);
    }
  }

  ngOnDestroy(): void {
    // Limpieza de referencias globales en window
    delete (window as any).onCaptchaResolved;
    delete (window as any).onCaptchaExpired;
    delete (window as any).onTurnstileCallback;
    delete (window as any).onTurnstileExpired;
  }

  /**
   * Captura el token emitido por el widget de Cloudflare Turnstile
   */
  onCaptchaResolved(token: string): void {
    console.log('[Turnstile] Token recibido exitosamente');
    this.turnstileToken = token;
    // Si había un mensaje de error por falta de CAPTCHA, limpiarlo
    if (this.errorMsg.includes('seguridad')) {
      this.error = false;
      this.errorMsg = '';
    }
  }

  /**
   * Se ejecuta si el token emitido expira antes de enviar el formulario
   */
  onCaptchaExpired(): void {
    console.warn('[Turnstile] El token de verificación ha expirado');
    this.turnstileToken = '';
  }

  iniciarSesion(): void {
    // Verificamos que el usuario completó la verificación
    if (!this.turnstileToken) {
      this.error    = true;
      this.errorMsg = 'Por favor completa la verificación de seguridad (CAPTCHA).';
      this.cdr.detectChanges();
      return;
    }

    this.cargando = true;
    this.error    = false;
    this.cdr.detectChanges();

    const payload = {
      username:       this.credenciales.username,
      password:       this.credenciales.password,
      turnstileToken: this.turnstileToken
    };

    this.authService.login(payload)
      .pipe(
        finalize(() => {
          this.cargando = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (token: string) => {
          this.authService.guardarToken(token);
          console.log('Ingreso exitoso. Roles asignados:', this.authService.obtenerRoles());
          this.router.navigate(['/inicio']);
        },
        error: (err: any) => {
          this.cargando = false;
          this.error    = true;
          // Diferenciamos el error 429 (rate limit) de otros errores de credenciales
          if (err.status === 429) {
            this.errorMsg = 'Demasiados intentos. Espera un momento antes de volver a intentar.';
          } else if (err.status === 0) {
            this.errorMsg = 'No se pudo conectar con el servidor de autenticación. Espera unos segundos e intenta de nuevo.';
          } else {
            this.errorMsg = 'Credenciales inválidas o acceso denegado. Verifica tu usuario y contraseña.';
          }
          // Reseteamos el token y el widget para exigir una nueva verificación
          this.turnstileToken = '';
          if (typeof (window as any).turnstile !== 'undefined') {
            try {
              (window as any).turnstile.reset();
            } catch (e) {
              console.warn('[Turnstile] Error al reiniciar widget:', e);
            }
          }
          this.cdr.detectChanges();
        }
      });
  }
}
