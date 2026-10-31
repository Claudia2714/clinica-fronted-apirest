export const environment = {
  production: true,

  // URLs de los servicios en Render
  authUrl: 'https://clinica-auth-server.onrender.com',
  apiUrl:  'https://clinica-apirest-demo.onrender.com',

  // Site Key oficial de Cloudflare Turnstile para producción
  // Puedes usar tu Site Key pública creada en Cloudflare Dashboard
  // o '3x00000000000000000000FF' para mantener el reto interactivo siempre activo
  turnstileSiteKey: '3x00000000000000000000FF'
};
