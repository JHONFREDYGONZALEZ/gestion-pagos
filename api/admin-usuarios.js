// Función de servidor (Vercel): administración de usuarios.
// La clave service_role vive SOLO aquí, en la variable de entorno SUPABASE_SERVICE_ROLE_KEY (nunca en el navegador).

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://zcrwgoydzuqocwrpcrld.supabase.co';
const ROLES_VALIDOS = ['pagador', 'profesional', 'gerencia', 'admin'];
const ROLES_QUE_ADMINISTRAN = ['admin'];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

module.exports = async (req, res) => {
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const fallo = (codigo, mensaje) => res.status(codigo).json({ error: mensaje });

  if (req.method !== 'POST') return fallo(405, 'Método no permitido');
  if (!SERVICE_KEY) return fallo(500, 'El servidor no está configurado (falta SUPABASE_SERVICE_ROLE_KEY en Vercel).');

  const admin = (ruta, opciones = {}) => fetch(SUPABASE_URL + ruta, {
    ...opciones,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: 'Bearer ' + SERVICE_KEY,
      'Content-Type': 'application/json',
      ...(opciones.headers || {}),
    },
  });

  try {
    // 1. Quién llama: se valida el token de sesión contra Supabase
    const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    if (!token) return fallo(401, 'Sesión no válida. Inicia sesión de nuevo.');
    const rUser = await fetch(SUPABASE_URL + '/auth/v1/user', {
      headers: { apikey: SERVICE_KEY, Authorization: 'Bearer ' + token },
    });
    if (!rUser.ok) return fallo(401, 'Sesión no válida. Inicia sesión de nuevo.');
    const quien = await rUser.json();

    // 2. Solo los roles autorizados pueden administrar usuarios
    const rPerfil = await admin(`/rest/v1/perfiles?id=eq.${encodeURIComponent(quien.id)}&select=rol,activo`);
    const [perfil] = rPerfil.ok ? await rPerfil.json() : [];
    if (!perfil || perfil.activo === false || !ROLES_QUE_ADMINISTRAN.includes(perfil.rol)) {
      return fallo(403, 'No tienes permiso para administrar usuarios.');
    }

    const { accion } = req.body || {};
    const { email, password, nombre, rol, userId } = req.body || {};

    if (accion === 'crear') {
      if (!nombre || !EMAIL.test(email || '') || !password || password.length < 6) {
        return fallo(400, 'Datos incompletos: nombre, correo válido y contraseña de mínimo 6 caracteres.');
      }
      if (!ROLES_VALIDOS.includes(rol)) return fallo(400, 'Rol no válido.');

      const r = await admin('/auth/v1/admin/users', {
        method: 'POST',
        body: JSON.stringify({ email, password, email_confirm: true, user_metadata: { nombre, rol } }),
      });
      const d = await r.json();
      if (!r.ok || !d.id) return fallo(400, d.msg || d.error_description || d.error || 'No se pudo crear el usuario.');

      // Perfil con nombre y rol correctos (reemplaza uno previo con el mismo correo)
      await admin(`/rest/v1/perfiles?email=eq.${encodeURIComponent(email)}`, { method: 'DELETE' });
      const rp = await admin('/rest/v1/perfiles', {
        method: 'POST',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({ id: d.id, nombre, email, rol }),
      });
      if (!rp.ok) return fallo(500, 'El usuario se creó pero no se pudo crear su perfil: ' + (await rp.text()));
      return res.status(200).json({ ok: true, id: d.id });
    }

    if (accion === 'resetear') {
      if (!UUID.test(userId || '') || !password || password.length < 6) {
        return fallo(400, 'Datos incompletos: usuario y contraseña de mínimo 6 caracteres.');
      }
      const r = await admin('/auth/v1/admin/users/' + userId, { method: 'PUT', body: JSON.stringify({ password }) });
      if (!r.ok) return fallo(400, 'No se pudo cambiar la contraseña.');
      return res.status(200).json({ ok: true });
    }

    if (accion === 'eliminar') {
      if (!UUID.test(userId || '')) return fallo(400, 'Usuario no válido.');
      if (userId === quien.id) return fallo(400, 'No puedes eliminar tu propio usuario.');
      await admin(`/rest/v1/perfiles?id=eq.${userId}`, { method: 'DELETE' });
      const r = await admin('/auth/v1/admin/users/' + userId, { method: 'DELETE' });
      if (!r.ok) return fallo(400, 'No se pudo eliminar el usuario.');
      return res.status(200).json({ ok: true });
    }

    return fallo(400, 'Acción no válida.');
  } catch (e) {
    console.error('admin-usuarios:', e);
    return fallo(500, 'Error interno al administrar usuarios.');
  }
};
