# PAGOS (gestion-pagos)

App de gestión de pagos de la empresa (control de pagos por empresa, proyecto, concepto, aprobaciones y estado de pago).

## Stack
- Frontend: un solo archivo estático `index.html` (HTML + CSS + JS inline, sin build ni framework).
- Backend/datos: Supabase (Postgres + Auth). Tablas principales: `pagos`, `perfiles`, `empresas`, `proyectos`, `presupuestos_concepto`, `aprobaciones`.
- Hosting: Vercel (despliega automático al hacer push a `main`).
- Repo: https://github.com/JHONFREDYGONZALEZ/gestion-pagos

## Contexto importante
- Es una app en producción con datos reales de pagos (~4000 registros a sept. 2026, creciendo).
- Todo el frontend vive en un solo archivo `index.html` de +2000 líneas — al editar, mantener el mismo estilo (sin introducir un build step ni dividir en módulos salvo que se pida explícitamente).
- El estado de pagos se carga completo en memoria del navegador (`pagos` array) porque el volumen actual (~4000 filas) no justifica paginación real desde el servidor; si el volumen crece mucho (decenas de miles), reconsiderar.

## Flujo de trabajo con git
- Se puede editar, hacer `git add` y `git commit` libremente al hacer cambios.
- **Nunca hacer `git push` sin mostrar antes el resumen/diff del cambio y pedir confirmación explícita al usuario** — es una app financiera en producción, cada despliegue afecta a usuarios reales usando datos de pagos reales.
