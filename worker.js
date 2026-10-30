// Cloudflare Worker: intermediario de solo lectura hacia la API CIMA (añade cabeceras CORS).
// Solo reenvía las rutas que usa FichaMed.
const CIMA = 'https://cima.aemps.es/cima/rest';
const PERMITIDAS = ['/medicamentos', '/medicamento', '/docSegmentado/contenido/1', '/docSegmentado/secciones/1'];
const CORS = {
  'Access-Control-Allow-Origin': '*',          // opcional: sustituye * por https://TUUSUARIO.github.io
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': '*',
};
export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });
    if (request.method !== 'GET') return new Response('Método no permitido', { status: 405, headers: CORS });
    const url = new URL(request.url);
    if (!PERMITIDAS.includes(url.pathname)) return new Response('Ruta no permitida', { status: 404, headers: CORS });
    const r = await fetch(CIMA + url.pathname + url.search, { headers: { Accept: 'application/json', 'User-Agent': 'FichaMed-proxy' } });
    return new Response(r.body, { status: r.status, headers: { ...CORS, 'Content-Type': r.headers.get('Content-Type') || 'application/json', 'Cache-Control': 'public, max-age=3600' } });
  },
};
