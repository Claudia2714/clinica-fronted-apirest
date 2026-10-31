export const environment = {
  production: false,

  // URL base del auth-server (genera tokens JWT)
  authUrl: 'http://localhost:8080',

  // URL base del apirest-demo (datos de la clínica)
  apiUrl: 'http://localhost:8081',

  // Site Key oficial de Cloudflare Turnstile que FUERZA un reto interactivo real (Visible con Checkbox)
  // Reemplázala por tu clave personalizada de https://dash.cloudflare.com si tienes una
  turnstileSiteKey: '3x00000000000000000000FF'
};
