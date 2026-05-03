# Casino Atlántico Manatí · App 2.0

Rediseño de la app móvil de Casino Atlántico Manatí. Reemplaza la versión
estática actual (lista de jackpots + páginas informativas) por una experiencia
moderna, oscura, animada y con jackpots en vivo.

> Estado: **prototipo funcional** listo para clickeo en Expo Go (iOS/Android/Web).

---

## Tech stack

| Capa | Decisión | Por qué |
| --- | --- | --- |
| Framework | **React Native + Expo SDK 52** | El app actual es iOS-first; Expo da builds para iOS/Android/Web sin Xcode/Android Studio y permite enviar prototipos vía QR. React Native es mejor que Flutter aquí porque el equipo del casino puede heredar talento JS/TS, y Expo Router 4 ofrece deep links + modal stacks listos para una app de marketing/lealtad. |
| Navegación | **Expo Router 4** (file-based) | Deep links para promociones (`/promotion/:id`), tabs nativas, modales, tipado automático de rutas. |
| Estado | **Zustand 5** | Ligero (~1KB), sin boilerplate Redux, perfecto para stores pequeños (user, jackpots, notificaciones). |
| Animaciones | **Reanimated 3** | Animaciones a 60fps en el thread UI: contadores de jackpot, pulse de "hot", microinteracciones, skeletons. |
| Tiempo real | Simulado con `JackpotStream` (setInterval). En producción → **WebSocket** (Socket.io o Firebase Realtime DB). | El UI ya consume un stream tipado — sólo se cambia la implementación. |
| Backend (sugerido) | **NestJS + PostgreSQL + Redis (pub/sub)** | Escalable, tipado, fácil para un panel admin (NestJS Admin o Refine). Firebase es opción válida si se prefiere serverless. |
| Notificaciones | `expo-notifications` (push) + store local | Producción: Expo Push o Firebase Cloud Messaging. |
| Diseño | Sistema propio en `src/theme` | Dark-first, paleta corporativa (azul atlántico + dorado), espaciados 4px-grid, radii suaves. |

### ¿Por qué React Native y no Flutter?
- App actual es iOS y la marca pide iOS+Android — Expo cubre ambos sin escribir
  código nativo.
- El ecosistema JS permite reusar el dev del CMS/admin.
- Reanimated 3 es comparable a Flutter en performance para este tipo de
  microinteracciones.

### ¿Por qué Zustand y no Redux Toolkit?
- 9 stores pequeños y desacoplados (user, jackpots, notificaciones) — Redux
  agrega ceremonia innecesaria.
- API basada en hooks, fácil de testear.

---

## Estructura del proyecto

```
.
├── app/                          # Expo Router (rutas)
│   ├── _layout.tsx               # Stack raíz, hidratación inicial
│   ├── (tabs)/                   # Bottom tabs
│   │   ├── _layout.tsx           # Tabs con BlurView (iOS) y blur fallback Android
│   │   ├── index.tsx             # Home Dashboard
│   │   ├── jackpots.tsx          # Lista con filtros + total acumulado
│   │   ├── promotions.tsx        # Promos + eventos
│   │   ├── rewards.tsx           # Club Atlántico (lealtad + giro diario)
│   │   └── profile.tsx           # Perfil + ajustes
│   ├── auth.tsx                  # Modal de login (email + social + invitado)
│   ├── notifications.tsx         # Modal de inbox
│   ├── jackpot/[id].tsx          # Detalle dinámico
│   └── promotion/[id].tsx        # Detalle dinámico
├── src/
│   ├── theme/                    # Tokens (colors, typography, spacing, radius, motion)
│   ├── components/
│   │   ├── ui/                   # Primitivos (Text, Card, Button, Badge, Chip, Skeleton, Header, Screen, SectionHeader)
│   │   ├── AnimatedAmount.tsx    # Counter animado con Reanimated
│   │   ├── Countdown.tsx         # Timers para promos
│   │   ├── DailySpin.tsx         # Gamificación: giro diario
│   │   ├── EventCard.tsx
│   │   ├── JackpotCard.tsx       # 3 variantes: hero, tile, row
│   │   ├── PromotionCard.tsx     # 2 variantes: card, compact
│   │   ├── QuickAction.tsx
│   │   ├── RewardCard.tsx
│   │   └── TierProgress.tsx      # Barra de progreso de niveles
│   ├── services/
│   │   ├── mockData.ts           # Seeds de jackpots, promos, eventos, premios
│   │   └── api.ts                # API tipada + JackpotStream (real-time simulado)
│   ├── store/
│   │   ├── useUserStore.ts       # Auth + lealtad + puntos
│   │   ├── useJackpotsStore.ts   # Stream de jackpots
│   │   └── useNotificationsStore.ts
│   ├── types/
│   │   └── domain.ts             # Tipos compartidos
│   └── utils/
│       └── format.ts             # Currency, fechas, countdowns
├── app.json
├── package.json
├── tsconfig.json
└── babel.config.js
```

---

## Cómo correrlo

```bash
# 1. Instalar dependencias (requiere Node 20+)
npm install

# 2. Iniciar Expo
npm start

# 3. Abrir en:
#    - iOS:     escanea el QR con la app Expo Go
#    - Android: escanea el QR con la app Expo Go
#    - Web:     pulsa "w" en el terminal (modo demo)
```

> Para builds nativas de release: `npx expo prebuild` + `eas build`.

---

## Funcionalidades implementadas

### 1. Auth (`/auth`)
- Login con email + contraseña (mock).
- Social login con Apple, Google, Facebook (mock).
- Modo invitado por defecto — no obliga a crear cuenta para explorar.

### 2. Home Dashboard (`/(tabs)/index`)
- Saludo personalizado según hora del día.
- Estado de cuenta con badge de tier.
- Hero card con jackpot "hot" y contador animado en vivo.
- 4 quick actions (Mapa, Menú, WhatsApp, Llamar).
- Carrusel de jackpots en vivo (auto-refresh cada 2.2s).
- Carrusel de promociones con countdown.
- Próximos eventos con barra de capacidad.
- Pull-to-refresh + skeletons.

### 3. Jackpots (`/(tabs)/jackpots`)
- Total acumulado en vivo (anima al cambiar).
- Chips de filtro: Todos / Progresivos / Slots / Mesas (con conteo).
- Lista con badges de tendencia: 🔥 Caliente · ↗ Subiendo · ✨ Nuevo · Estable.
- Glow animado para jackpots calientes.
- Detalle: `/jackpot/[id]` con info del juego, velocidad de subida, CTA.

### 4. Promociones & Eventos (`/(tabs)/promotions`)
- Cards full-bleed con gradiente por accent (gold/atlantic/ruby/emerald).
- Countdown grande en detalle, compacto en listado.
- Eventos con icono por categoría y barra de aforo.
- Detalle: `/promotion/[id]`.

### 5. Lealtad / Rewards (`/(tabs)/rewards`)
- Tarjeta de tier con barra de progreso animada.
- Niveles: Clásico → Plata → Oro → Platino → Diamante.
- **Giro diario**: gamificación con animación de spin, recompensa aleatoria,
  racha (streak) y limitación a 1 por día.
- Catálogo de premios canjeables (con validación de puntos).
- Sección "¿Cómo gano puntos?".

### 6. Notificaciones (`/notifications`)
- Inbox con tipos: jackpot/promo/event/loyalty/system.
- Marca de no leídos, "Marcar todas como leídas".
- Tinte por categoría.

### 7. Perfil (`/(tabs)/profile`)
- Avatar + identidad + badges.
- CTA gold para registro si es invitado.
- Toggles: push, marketing, hápticos.
- Accesos: historial, premios canjeados, info, términos, soporte.
- Logout para usuarios registrados.

---

## Real-time (cómo se simula y cómo se produciza)

`src/services/api.ts` expone un singleton `JackpotStream` con API
publish/subscribe:

```ts
const unsub = jackpotStream.subscribe((jackpots) => {
  // ... actualizar estado
});
```

Internamente usa `setInterval` con drift aleatorio + recálculo de tendencia.
Para producción se sustituye con un cliente WebSocket que escuche el canal
`jackpots:tick` desde NestJS o Firebase. **El componente UI no cambia.**

---

## Roadmap admin panel (no incluido en el prototipo)

Propuesta:
- **Refine + Ant Design** o **NestJS Admin Panel** sobre la misma API.
- Endpoints `POST /jackpots`, `PATCH /promotions/:id`, `POST /push` para
  notificaciones a segmentos.
- Roles: `admin`, `marketing`, `floor-manager`.

---

## Próximos pasos (sugeridos)

1. Conectar a la API real cuando esté disponible (cambiar `src/services/api.ts`).
2. Asset pipeline: subir logo oficial e imágenes de juegos a `assets/`.
3. Integrar `expo-notifications` con tokens reales y handler de tap.
4. Persistir sesión con `AsyncStorage` (envolver `useUserStore` con
   `zustand/middleware/persist`).
5. Tests E2E con Maestro o Detox para flujos críticos (login, canjeo).
6. Localización ES/EN con `expo-localization` + `i18n-js`.
