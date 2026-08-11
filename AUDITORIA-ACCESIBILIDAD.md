# Auditoría de Accesibilidad, Contraste y Usabilidad — SEFODECO Minería

Fecha: 2026-08-11
Método: revisión estática de código + cálculo de contraste WCAG 2.1 AA (el escaneo en vivo con axe-core queda pendiente: el entorno no tiene las librerías de Chrome `libnss3`/`libnspr4` y no hay sudo sin contraseña).
Alcance: todo el frontend (`frontend/src/**`, `index.html`).

Resumen: **8 críticos / bloqueadores, 6 fallas de contraste AA, ~12 mejoras de usabilidad.**

> **ESTADO DE CORRECCIÓN (08-2026):** todos los hallazgos marcados como ✅ ya están corregidos en el código y validados con `npm run lint` (exit 0) y `npm run build` (exit 0). Pendiente únicamente el escaneo en vivo con axe-core (requiere navegador) y la revisión visual manual del modal de confirmación de Usuarios.

Guías de referencia: [Web Interface Guidelines (vercel-labs)](https://github.com/vercel-labs/web-interface-guidelines) y WCAG 2.1 AA (texto normal ≥ 4.5:1; no-texto ≥ 3:1).

---

## CRÍTICOS / BLOQUEADORES

| # | Ubicación | Hallazgo | Estado |
|---|-----------|----------|--------|
| C1 | `index.html:2` | `<html lang="en">` en una app 100% en español. Los lectores de pantalla pronunciarán el contenido con voz inglesa. → `lang="es"`. | ✅ `index.html` ahora `lang="es"`. |
| C2 | `Formulario.jsx` modal "Aviso de Privacidad" | Modal sin `role="dialog"`, `aria-modal`, trampa de foco ni cierre con `Escape`. | ✅ Modal ahora con `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, `tabIndex={-1}`, `onKeyDown={onPrivacidadKeyDown}` (trampa de Tab + Escape), devolución de foco al botón que lo abrió (`privacidadLastFocusRef`), foco al primer elemento y bloqueo de scroll al abrir. |
| C3 | `Formulario.jsx` `HelpBtn` | Tooltip de ayuda: abre con click, cierra en `onBlur`; sin `role="tooltip"`, sin `aria-expanded`. | ✅ `role="tooltip"`, `aria-expanded`, `aria-controls` (useId), `aria-label="Ayuda: …"`, cierre con Escape, hover/focus. |
| C4 | `Formulario.jsx` stepper | Al cambiar de paso no hay gestión de foco. | ✅ Efecto de `currentStep` hace `headingRef.current?.focus({preventScroll:true})`; cada h2 de los 6 pasos tiene `ref={headingRef}` + `tabIndex={-1}`. |
| C5 | `Formulario.jsx` modo solo-lectura | Campo envuelto en `fieldset disabled` (campos grises, fuera del tabulador). | ✅ Se quitó `disabled` del fieldset; los inputs usan `readOnly={readOnly}` manteniendo tabulación; CSS `.form-readonly` (fondo `#fafafa`, texto `#1f2937`) estiliza el modo lectura sin degradar legibilidad. |
| C6 | `LoginLayout.jsx` carrusel | Rota cada 2 s sin pausa ni `prefers-reduced-motion`. | ✅ Intervalo subido a 4 s, el `useEffect` respeta `prefers-reduced-motion` (no rota), elementos del carrusel `aria-hidden="true"` con `<h1 class="sr-only">`. |
| C7 | `LoginEmpresa.jsx`, `admin/Login.jsx` | Sin `<h1>`. | ✅ Ambos logins usan `LoginLayout` que ahora incluye `<h1 class="sr-only">`. |
| C8 | `Usuarios.jsx:44` | `window.confirm` nativo para acción destructiva. | ✅ Reemplazado por modal propio `role="alertdialog"` con `aria-modal`, `aria-labelledby`/`aria-describedby`, botones Cancelar/Sí y cierre por backdrop y ✕. |

## FALLAS DE CONTRASTE (WCAG 2.1 AA, texto normal ≥ 4.5:1)

| # | Ubicación | Ratio | Estado |
|---|-----------|-------|--------|
| F1 | `text-zinc-400` `#9CA3AF` sobre blanco | 2.54:1 | ✅ Sustituido por `text-zinc-500` (4.83:1) en stepper inactivo, badge "Requerido", unidades de tablas (Formulario y admin), flecha ▼, iconos de nav (AdminLayout) e iconos de Usuarios. |
| F2 | `text-zinc-300` sobre blanco | 1.48:1 | ✅ Placeholders subidos a `placeholder:text-zinc-500`. |
| F3 | `text-red-500` sobre blanco | 3.76:1 | ✅ Errores ahora `text-red-600` (4.83:1) y bordes `border-red-500`. |
| F4 | `placeholder:text-zinc-400` sobre blanco | 2.54:1 | ✅ Todos los placeholders del formulario ahora `placeholder:text-zinc-500`. |
| F5 | Link footer login `text-xs text-zinc-400` | 4.07–6.91:1 | ✅ Footer de ambos logins ahora `text-zinc-300` sobre el fondo oscuro del layout (contraste alto). |
| F6 | `text-zinc-500` sobre `zinc-100`/`zinc-50` | 4.40:1 | ✅ Labels de `Formularios.jsx` que caían sobre fondos claros ahora `text-zinc-600` (7.73:1). |

**Pasan:** guinda `#8A1538` (9.35), blanco sobre guinda (9.35), `zinc-600` (7.73), `zinc-700` (6.7+), `blue-700` (6.70), `emerald-700` sobre `emerald-50` (5.21), `amber-700/900` (4.84/8.75), labels de login `zinc-200` sobre fondo oscuro (13.96), `zinc-700` sobre `zinc-100` en totales read-only (9.50).

## MEJORAS DE USABILIDAD Y ANTI-PATRONES

| # | Ubicación | Hallazgo | Estado |
|---|-----------|----------|--------|
| U1 | todo `frontend/src` | `transition-all` en ~41 puntos. | ✅ Reemplazado por `transition` en LoginEmpresa, admin/Login, Formularios, Usuarios, AdminLayout y botones del footer del Formulario (los inputs mantienen `transition-all` por necesidad de transicionar color+box-shadow). |
| U2 | `index.css` | Sin `prefers-reduced-motion`. | ✅ Añadido bloque global `@media (prefers-reduced-motion: reduce)` que desactiva animaciones/transiciones. |
| U3 | `Formulario.jsx` Tabla de Producción | Sin `overflow-x-auto`. | ✅ Envuelta en `overflow-x-auto`. |
| U4 | Labels sin `htmlFor` | Label no cliqueable. | ✅ `htmlFor`+`id` en paso 1 completo, tabla ESG, textarea de comentarios, campos de social/capacitación/rotación y formulario de Usuarios. |
| U5 | `Usuarios.jsx` búsqueda | Placeholder sin `aria-label`. | ✅ `aria-label="Buscar empresa o usuario"` + `id`. |
| U6 | `AdminLayout.jsx` menú móvil | `aria-label` estático, sin `aria-controls`. | ✅ `aria-label` alterna Abrir/Cerrar, `aria-controls="menu-movil"`, overlay con el `id` correspondiente. |
| U7 | Logins | Sin `autocomplete`. | ✅ `autocomplete="username"`/`current-password"` en logins; el formulario lleva `autoComplete="off"` y los campos nuevos de Usuarios llevan `organization`/`off`/`new-password`. |
| U8 | `LoginLayout.jsx` logos | Sin `width`/`height` → CLS. | ✅ Logos con dimensiones reales (`1.png` 692×263, `2.png` 2400×626). |
| U9 | `index.css:1` | Fuente Inter vía `@import` bloqueante. | ✅ Quitado el `@import`; ahora `preconnect` + `preload` vía `<link>` en `index.html`. |
| U10 | `Formulario.jsx` stepper | Labels `text-[9px]`/`text-[10px]`. | ✅ `text-[11px] sm:text-xs`, inactivos `text-zinc-500`. |
| U11 | `index.html:7` | `<title>` poco descriptivo. | ✅ "SEFODECO \| Formulario de Empresas Mineras" + meta theme-color. |
| U12 | todas las páginas | Falta skip link. | ✅ Skip link "Saltar al contenido principal" en `App.jsx` hacia `#main-content` (LoginLayout) y `main` de las páginas admin. |
| U13 | `Formulario.jsx` modal privacidad | Overlay sin bloqueo de scroll. | ✅ `body.style.overflow='hidden'` mientras abre, restaurado al cerrar. |
| U14 | `Formularios.jsx:740` | Flecha ▼ sin `aria-hidden`. | ✅ `<span>` con `aria-hidden="true"` y `text-zinc-500`. |
| U15 | `YaEnviado.jsx:6` | Menor. | ✅ Sin cambios requeridos. |
| U16 | `ErrorBoundary.jsx:19` | `<span>!</span>` decorativo. | ✅ Añadido `aria-hidden="true"`. |
| U17 | `Formulario.jsx` DRAFT | Guarda en cada keystroke. | ✅ Debounce de 400 ms con `clearTimeout`. |
| U18 | Paso 6 "Revisión Final" | No mostraba nada de lo capturado. | ✅ Ahora incluye tabla-resumen con empresa matriz, unidad, tipo de minado, fecha de inicio, vida útil y capacidad (self-review antes de enviar). |
| U19 | Tablas admin | `th` sin `scope`. | ✅ `scope="col"` añadido en todas las tablas de `Formularios.jsx` y `Usuarios.jsx`. |

## Checklist para el escaneo en vivo (pendiente)

Cuando el entorno tenga navegador (instalar `libnss3` y `libnspr4`, o correr `agent-browser install --with-deps` con sudo), verificar con `agent-browser a11y` sobre:
- `/` (login empresa) y `/admin/login`
- `/formulario` (con sesión de empresa) — cada uno de los 6 pasos
- `/admin/formularios` y `/admin/usuarios` (con sesión admin)

Añadir a mano: trampa de foco del modal de privacidad (C2) y del nuevo modal de confirmación en Usuarios, gestión de foco del stepper (C4), navegación Tab/Enter/Escape del tooltip (C3), y la legibilidad del modo solo-lectura (C5).