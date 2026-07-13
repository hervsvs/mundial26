// ============================================================
// MÉTRICAS ANÓNIMAS EN SUPABASE (opcional)
// Si supabaseUrl/supabaseAnonKey están vacíos en config.ts, no hace nada.
// El SQL para crear la tabla está en el README.
// ============================================================

import { CONFIG } from '../data/config'

interface RunEndPayload {
  country: string
  group: string
  stage: string
  matches: number
  champion: boolean
}

export function trackRunEnd(payload: RunEndPayload): void {
  if (!CONFIG.supabaseUrl || !CONFIG.supabaseAnonKey) return
  // fire-and-forget: nunca bloquea el juego ni rompe si falla
  fetch(`${CONFIG.supabaseUrl}/rest/v1/runs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: CONFIG.supabaseAnonKey,
      Authorization: `Bearer ${CONFIG.supabaseAnonKey}`,
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      country: payload.country.slice(0, 40),
      group_letter: payload.group,
      stage: payload.stage,
      matches: payload.matches,
      champion: payload.champion,
    }),
  }).catch(() => { /* sin conexión o mal configurado: no pasa nada */ })
}
