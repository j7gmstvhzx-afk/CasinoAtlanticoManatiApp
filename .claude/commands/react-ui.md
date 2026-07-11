---
description: Audita los componentes UI de React (consistencia, props, convenciones de diseño)
---

Audita los componentes React de este repo. Si el usuario da un argumento, limita el alcance a ese archivo/carpeta/ruta específica: $ARGUMENTS. Si no, enfócate en los directorios de componentes del proyecto (típicamente `components/`, `src/components/`, `app/components/` o `ui/` — usa el que exista).

No hagas cambios todavía — esta es una pasada de **solo lectura**. Al final, presenta un reporte y pregunta si se aplican los arreglos.

## Paso 0 — Descubre las convenciones del proyecto (NO asumas)

Antes de juzgar nada, aprende cómo está construido ESTE repo:

1. **Tokens de diseño** — lee `tailwind.config.{ts,js}` (o `globals.css`/`@theme` en Tailwind v4) para conocer los colores, sombras, radios y spacing personalizados. Si no hay tokens custom, evalúa contra el uso consistente de las clases Tailwind crudas.
2. **Sistema de motion** — busca una carpeta/módulo de primitivas de animación (ej. `motion/`, `lib/motion`, springs/easings/variants compartidos) y wrappers reutilizables. Identifica qué librería se usa (`motion`/`framer-motion`, CSS transitions, etc.).
3. **Componentes base y helpers** — identifica los componentes "fuente de verdad" (ej. Card, Section, Button, Badge) y los helpers compartidos (`lib/`, `utils/`) que ya existen, para detectar lógica/markup que debería reusarlos.

Reporta brevemente las convenciones detectadas antes del análisis, para que el usuario confirme que entendiste bien el sistema.

## Paso 1 — Revisa cada componente contra esas convenciones

1. **Tokens de diseño** — uso de los tokens del sistema (definidos en el config) en vez de valores crudos sueltos (`#hex` inline, `slate-50`, `shadow-sm`, magic numbers) que no están atados al sistema y rompen consistencia.
2. **Sistema de motion** — ¿el componente usa los springs/easings/wrappers compartidos en vez de reinventar transiciones inline? ¿Respeta `prefers-reduced-motion` (`useReducedMotion()`/`MotionConfig`/`motion-safe:`) donde anima?
3. **Props y API** — props consistentes con componentes hermanos (misma forma para `icon`, `color`, `size`, `variant`, etc.); detecta props duplicadas/redundantes o nombres inconsistentes entre componentes similares.
4. **Accesibilidad** — `aria-*`, roles, `tabIndex`, contraste de texto suficiente (WCAG), botones de solo-ícono con `aria-label`, foco visible, alternativas no-color para estado.
5. **Duplicación** — lógica/markup repetido que ya debería vivir en un componente o helper compartido.
6. **Responsive** — uso de breakpoints consistente con el resto de la app; nada que se rompa en mobile (~375px) ni en contenedores con scroll (`overflow-x-auto` de tablas).

## Reporte

Para cada hallazgo, reporta: `archivo:línea`, qué está mal o inconsistente, y una sugerencia concreta de arreglo. Agrupa por severidad (**alto** impacto visual/funcional, **menor** inconsistencia, **nit**). Si no hay nada que valga la pena señalar en un componente, no lo menciones — prioriza señal sobre exhaustividad.
