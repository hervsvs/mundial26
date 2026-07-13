# ⚽ El Colado del Mundial (Mundial 2026)

Juego web estilo *7a0*: tu país entra al Mundial 2026 reemplazando a la selección
más débil de un grupo sorteado al azar. Robás 5 jugadores de otras selecciones,
completás el plantel reclutando por LinkedIn (homenaje a Cabo Verde) y tratás de
ganar el Mundial. Es difícil a propósito: la gracia es intentarlo muchas veces.

**Stack:** Vite + React + TypeScript. Sin backend obligatorio, sin login.
El nombre de tu país y tu historial quedan en `localStorage`.

## Correr en local

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # genera dist/ para deploy (Vercel, Netlify, GitHub Pages)
```

## Cómo probar mientras editás

1. `npm run dev` y abrí `http://localhost:5173`.
2. Editá cualquier archivo de `src/data/` y guardá: **Vite recarga solo** (hot reload),
   no hace falta reiniciar nada. Si estás a mitad de una partida, la partida sigue
   (está en `localStorage`); los datos nuevos aplican a lo que aún no pasó.
3. Para empezar de cero: en la consola del navegador (F12) →
   `localStorage.removeItem('mundial26')` y recargá.
4. Trucos para probar rápido:
   - En [config.ts](src/data/config.ts) subí `groupStageBonus` a 20 para ganar siempre
     y llegar rápido a la pantalla que quieras probar (bajalo después).
   - `gemChance: 1` te da 6 joyas de LinkedIn seguidas para ver esas historias.
   - `eventChance: 1` con un solo evento con `weight: 1000` fuerza a que salga
     siempre ese evento (ideal para probar un texto nuevo).
   - En `groupWeights` poné `A: 100` para que siempre te toque el grupo A.

## Dónde se edita cada cosa

| Qué | Archivo |
|---|---|
| Nombre del juego, URL, dificultad, **pesos del sorteo de grupo**, chance de evento/joya, donaciones, Supabase | [src/data/config.ts](src/data/config.ts) |
| Los 48 equipos, grupos reales, ratings y **peso en el robo** (`heistWeight`) | [src/data/teams.ts](src/data/teams.ts) |
| Jugadores (6 por selección, un overall por jugador) | [src/data/players.ts](src/data/players.ts) |
| **Eventos de partido** (bilingües, con peso y jugador afectado) | [src/data/events.ts](src/data/events.ts) |
| Historias de reclutamiento por LinkedIn (bilingües, con peso) | [src/data/recruits.ts](src/data/recruits.ts) |
| **Comodines** (uno por torneo, un solo uso) | [src/data/wildcards.ts](src/data/wildcards.ts) |
| Formaciones disponibles (4-4-2, 4-3-3...) | [src/data/formations.ts](src/data/formations.ts) |
| Textos de la interfaz en español/inglés | [src/i18n.ts](src/i18n.ts) |

### Pesos de sorteo (probabilidades editables)

Todo lo que sale "al azar" respeta un peso relativo que podés editar:

- **Grupo que te toca**: `groupWeights` en config.ts (ej: `A: 3` = grupo A sale el triple).
- **Selección que sale en el robo**: `heistWeight` en teams.ts (ej: ponerle `heistWeight: 5`
  a Argentina hace que aparezca 5 veces más seguido en las tiradas).
- **Evento del partido**: `weight` en events.ts.
- **Historia de LinkedIn**: `weight` en recruits.ts.
- **Chance de joya**: `gemChance` en config.ts.

El peso es relativo al total: un item con weight 10 sale el doble que uno con weight 5.

### Agregar un evento de partido

En `src/data/events.ts`, copiá cualquier bloque y ajustá:

```ts
{
  id: 'mi-evento', emoji: '🐐',
  title: 'Una cabra invade el vestuario', titleEn: 'A goat invades the locker room',
  text: 'A {jugador} lo persiguió una cabra en el vestuario. Llega shockeado.',
  textEn: 'A goat chased {jugador} around the locker room. He arrives in shock.',
  moment: 'previa',    // 'previa' (antes del partido) | 'partido' (aparece en el
                       // minuto a minuto) | 'descuento' (los goles van al 90+)
  ratingDelta: -3,     // resta 3 de fuerza a tu equipo en ese partido
  // yourGoals: -1,    // opcional: te anulan un gol (se ve tachado en el ticker)
  // oppGoals: 1,      // opcional: goles que se suman al rival (en minutos coherentes)
  // vsTeam: 'NOR',    // opcional: SOLO puede salir contra ese rival
  // stage: 'grupos',  // opcional: 'grupos' | 'eliminatorias' (sin campo = cualquiera)
  weight: 8,           // frecuencia relativa
  mood: 'malo',        // malo | neutro | bueno (color de la carta)
  affects: 'random',   // opcional: 'star' o 'random' → {jugador} se reemplaza
                       // por el nombre real de un jugador de TU plantel
},
```

Los goles de evento funcionan en los cuatro sentidos: `yourGoals: 3` te regala
tres goles, `yourGoals: -1` te anula uno (se ve tachado), `oppGoals: 2` le suma
al rival y `oppGoals: -1` le invalida un gol al rival (también tachado).

Con `eventChance` en config.ts controlás la probabilidad de que pase un evento
por partido (1 = siempre pasa exactamente **uno**; nunca pasan dos).
Ejemplo de evento con rival específico ya incluido: **Furia vikinga** solo puede
salir contra Noruega (Haaland te hace tres). También hay uno para Argentina y
otro para Brasil.

### Comodines

En [wildcards.ts](src/data/wildcards.ts): al empezar el torneo se te sortea UNO
(ponderado por `weight`) y lo podés activar UNA vez, antes de cualquier partido,
desde el hub. Efectos disponibles: `ratingDelta` (tu equipo), `oppRatingDelta`
(debilita al rival), `yourGoals` (goles de regalo) y `special: 'steal'` (te robás
la figura del rival de ese partido para el resto del torneo). Incluidos: llamada
a Infantino, bidón de Branco, charla motivacional, robo extra, denuncia de doping,
visita nocturna y cazar a la estrella (jugás con 10).

### ¿A quién reemplaza el jugador?

Al equipo con **menor rating** de cada grupo (se calcula solo desde `teams.ts`).
Hoy: A Sudáfrica, B Qatar, C Haití, D Australia, E Curazao, F Túnez,
G Nueva Zelanda, H Cabo Verde, I Irak, J Jordania, K Uzbekistán, L Panamá.
El listado completo también se ve dentro del juego, en la pantalla de inicio.

## Publicar el juego online

El juego es 100% estático (HTML+JS+CSS, sin backend): `npm run build` genera
la carpeta `dist/` y eso es todo lo que hay que servir.

**Opción A — Vercel (recomendada, gratis):**
1. Subí el proyecto a un repo de GitHub.
2. En [vercel.com](https://vercel.com) → Add New Project → importá el repo.
   Detecta Vite solo; no hay que configurar nada.
3. Deploy → te da una URL `https://tuproyecto.vercel.app`.
4. Poné esa URL en `config.ts` → `gameUrl`, commiteá y pusheá: se redeploya solo.

**Opción B — Netlify Drop (sin Git, 2 minutos):**
1. `npm run build`
2. Arrastrá la carpeta `dist/` a [app.netlify.com/drop](https://app.netlify.com/drop).

**Opción C — Tu propia compu como servidor:** funciona pero tiene contras
(la PC prendida 24/7, tu ancho de banda, IP dinámica). Si igual querés:
1. `npm run build`
2. `npx serve dist` (sirve el juego en http://localhost:3000)
3. Exponelo a internet sin abrir puertos con Cloudflare Tunnel:
   `winget install Cloudflare.cloudflared` y luego
   `cloudflared tunnel --url http://localhost:3000` → te da una URL pública
   `https://algo.trycloudflare.com` (cambia en cada corrida; para URL fija
   necesitás cuenta gratuita de Cloudflare y un "named tunnel").

## Métricas de uso (Supabase, opcional)

1. Creá un proyecto gratis en [supabase.com](https://supabase.com).
2. En el SQL Editor ejecutá:

```sql
create table public.runs (
  id bigint generated always as identity primary key,
  created_at timestamptz default now(),
  country text,
  group_letter text,
  stage text,
  matches int,
  champion boolean
);

alter table public.runs enable row level security;

-- Solo permite INSERTAR de forma anónima (nadie puede leer ni borrar desde el juego)
create policy "insert anon runs" on public.runs
  for insert to anon with check (true);
```

3. Copiá la **URL** del proyecto y la **anon key** (Settings → API) en
   `src/data/config.ts`. Listo: cada partida terminada inserta una fila
   (país, grupo, fase alcanzada, partidos jugados, si salió campeón).

Consultas útiles: `select stage, count(*) from runs group by stage;`

## Donaciones

En `config.ts` reemplazá `tuusuario` por tus usuarios reales de Cafecito,
PayPal, Mercado Pago y Buy Me a Coffee. Las plataformas con URL vacía (`''`)
se ocultan solas.

## Compartir en redes

Al terminar cada partida se genera una **imagen 1080×1350 (formato post de
Instagram)** en un canvas del navegador, con el recorrido completo y el link
al juego. El botón de WhatsApp usa la Web Share API en celulares (comparte la
imagen + texto + link); en desktop cae a `wa.me` con el texto y el link.
Acordate de poner la URL real del juego en `config.ts` → `gameUrl`.

## Notas de diseño

- Simulación: modelo Poisson sobre la diferencia de ratings; tu fuerza pesa
  58% los 5 mejores y 42% el resto (robá bien).
- La formación importa: los jugadores fuera de posición pierden overall
  (penalizaciones en [src/engine/lineup.ts](src/engine/lineup.ts)).
- Dificultad calibrada para que TIENDAS a pasar de grupo (aunque sea como mejor
  tercero) gracias a `groupStageBonus`. En eliminatorias, `koRoundBonus` es un
  array con tu bonus por ronda `[16avos, Octavos, Cuartos, Semifinal, Final]`:
  llegar a la final es alcanzable, pero en la final el bonus es 0 y ganar el
  título es a pelo. Todas las perillas en config.ts.
- Si perdés la SEMIFINAL jugás el partido por el **tercer puesto** contra el
  perdedor de la otra semi (ganás = 3º del mundo, perdés = 4º). Perder la final
  te deja **subcampeón**.
- Al quedar eliminado, el juego simula el resto de la llave (coherente con lo
  que jugaste: tu verdugo sigue en carrera) y te muestra **quién salió campeón**.
- Nombres de fases correctos: con 32 clasificados, la primera ronda eliminatoria
  son los **16avos** (dieciseisavos de final), después octavos, cuartos, etc.
- Formato 2026 real: 12 grupos de 4, clasifican los 2 primeros + los 8 mejores
  terceros; luego llave fija de 32 sembrada por rendimiento de grupos.
- Los eventos marcados `real: true` están inspirados en cosas que pasaron de
  verdad en el Mundial 2026 (las 3 rojas del partido inaugural, el brujo de
  Ghana contra Kane, el offside milimétrico a Irán, el árbitro explicando el
  VAR por altoparlante, etc.).
