-- Indices recomendados para la tabla "pagos" de la app PAGOS.
-- Ejecutar en Supabase: Dashboard -> SQL Editor -> pegar y correr.
-- Seguro de correr aunque ya existan (IF NOT EXISTS evita duplicados/errores).

-- Usado por el ORDER BY created_at en cada carga de pagos
CREATE INDEX IF NOT EXISTS idx_pagos_created_at
  ON pagos (created_at DESC);

-- Usados por los filtros de empresa y proyecto
CREATE INDEX IF NOT EXISTS idx_pagos_empresa_id
  ON pagos (empresa_id);

CREATE INDEX IF NOT EXISTS idx_pagos_proyecto_id
  ON pagos (proyecto_id);

-- Usado por el filtro de estado (Pendiente / Pagada)
CREATE INDEX IF NOT EXISTS idx_pagos_estado
  ON pagos (estado);

-- Usado por la tabla de aprobaciones al buscar por pago_id + estado
CREATE INDEX IF NOT EXISTS idx_aprobaciones_pago_id
  ON aprobaciones (pago_id);

CREATE INDEX IF NOT EXISTS idx_aprobaciones_estado
  ON aprobaciones (estado);
