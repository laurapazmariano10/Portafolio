Eres un senior frontend developer especializado en performance, animaciones, GSAP/ScrollTrigger, Three.js, React Three Fiber, canvas y Next.js App Router.

Vas a trabajar sobre una aplicación Next.js 15 existente llamada MiPortafolio. Stack real:
- Next.js 15 con App Router
- React 19
- TypeScript estricto
- Tailwind CSS 4
- GSAP + ScrollTrigger + @gsap/react
- Motion
- Three.js, @react-three/fiber y @react-three/drei
- Canvas 2D, WebGL manual y Matter.js
- Actualmente NO hay Lenis instalado/configurado

REGLA ABSOLUTA:
No modificar nada todavía sin auditoría previa. No romper animaciones, WebGL, ScrollTrigger, shaders, modelos 3D ni layouts existentes. Antes de cada cambio, explicar impacto, riesgo y archivos afectados. Si algo puede afectar scroll, WebGL, GSAP, canvas, shaders o responsive, advertirlo antes de tocar.

IMPORTANTE:
Trabajar por fases estrictas. No avanzar a la siguiente fase sin confirmar que la anterior está estable. Después de cada fase ejecutar, si aplica:
- npm run lint
- npx tsc --noEmit
- npm run build

También validar manualmente rutas principales:
- /
- /about
- /projects
- /projects/[slug]
- /blog
- /blog/[slug]
- /contacto

==== FASE 0: AUDITORÍA SIN CAMBIOS ====

Antes de modificar archivos, analizar la arquitectura real:

1. Mapear rutas del App Router:
   - app/layout.tsx
   - app/page.tsx
   - app/about/page.tsx
   - app/projects/page.tsx
   - app/projects/[slug]/page.tsx
   - app/blog/page.tsx
   - app/blog/[slug]/page.tsx
   - app/contacto/page.tsx

2. Mapear componentes pesados:
   - components/LiquidScene.jsx
   - components/AboutAxe/AboutAxe.tsx
   - components/AboutAxe/scene.ts
   - components/AboutAxe/scrollAnimation.ts
   - components/projects/ProjectDepthCard.tsx
   - components/projects/MathFluidParticles.tsx
   - components/projects/ProjectDetailClient.tsx
   - components/ServicesAboutSections.tsx
   - components/navbar.tsx

3. Detectar:
   - Uso de ScrollTrigger
   - Uso de window.scrollY, window.innerWidth, window.innerHeight
   - requestAnimationFrame propios
   - gsap.ticker
   - React Three Fiber useFrame
   - Canvas/WebGL manual
   - ResizeObserver
   - IntersectionObserver
   - <img> que puedan migrarse a next/image sin riesgo
   - <img> o new Image usados para texturas, previews dinámicos o canvas que NO deben migrarse ciegamente

4. Al finalizar Fase 0 entregar:
   - Mapa de arquitectura
   - Lista de archivos sensibles
   - Riesgos de performance
   - Riesgos de Lenis
   - Riesgos de ocultar scrollbar
   - Lista priorizada de cambios seguros

NO MODIFICAR ARCHIVOS EN FASE 0.

==== FASE 1: PERFORMANCE SEGURA Y LAZY LOADING ====

Aplicar solo optimizaciones de bajo riesgo.

1. Dynamic imports:
   - Componentes 3D/canvas pesados deben cargarse con next/dynamic y ssr:false cuando se rendericen desde páginas client.
   - Revisar especialmente:
     - LiquidScene: ya está dinámico en app/page.tsx; mantener.
     - AboutAxe: evaluar dynamic import en app/about/page.tsx con ssr:false.
     - ProjectDepthCard: evaluar dynamic import en app/projects/page.tsx.
     - MathFluidParticles: evaluar dynamic import en app/projects/page.tsx.
     - ProjectDetailClient: evaluar si conviene mantener como client directo o dynamic desde server route.
   - No cambiar si genera hydration issues o rompe animaciones.

2. Suspense/loading:
   - Agregar placeholders simples solo donde no afecten layout ni ScrollTrigger.
   - Evitar skeletons que cambien altura después de montar y rompan mediciones de ScrollTrigger.

3. Imágenes:
   - Migrar a next/image solo imágenes estáticas/decorativas seguras.
   - NO reemplazar:
     - new window.Image() en ProjectDepthCard, porque carga texturas WebGL.
     - Imágenes preview con ref/src dinámico si la migración cambia comportamiento.
   - Revisar candidatos:
     - ContactAndFooter foto estática.
     - Otros <img> simples que no dependan de manipulación directa.

4. Código muerto:
   - Eliminar imports no usados solo si TypeScript/ESLint lo confirma.
   - No eliminar dependencias de package.json solo por sospecha. Primero verificar uso real.
   - No tocar vendor files de public/draco.

5. Three.js imports:
   - Preferir imports nombrados en archivos TypeScript nuevos o fáciles de refactorizar.
   - No forzar refactor en LiquidScene.jsx si aumenta riesgo. Si se hace, probar build y escena visualmente.

6. CSS/fuentes:
   - Las fuentes ya usan next/font/google.
   - Revisar si falta display:'swap'. Agregar solo si no cambia diseño/hidratación.
   - No limpiar clases Tailwind de forma masiva si no hay error real.

7. Metadata:
   - Agregar metadata por página donde falte:
     - /blog
     - /contacto
     - /about
     - /projects
   - Agregar generateMetadata en /blog/[slug].
   - Mejorar generateMetadata en /projects/[slug] con description si los datos lo permiten.

Al terminar Fase 1 reportar:
- Archivos modificados
- Qué se optimizó
- Qué se dejó sin tocar por riesgo
- Resultado de lint/typecheck/build

==== FASE 2: SCROLLBAR PERSONALIZADO SIN ROMPER VIEWPORT ====

Objetivo: ocultar scrollbar nativa y agregar indicador minimalista, pero primero medir impacto.

1. Antes de modificar:
   - Identificar componentes que usan window.innerWidth/window.innerHeight:
     - AboutAxe scene.ts
     - ProjectDetailClient
     - app/projects/page.tsx
     - LiquidScene.jsx
     - Navbar y otros usos de scroll
   - Determinar si ocultar scrollbar puede cambiar cálculos.

2. CSS global:
   - Agregar ocultamiento en globals.css solo si no rompe scroll:
     html { scrollbar-width: none; }
     ::-webkit-scrollbar { display: none; }
     * { -ms-overflow-style: none; }

3. Crear CustomScrollbar:
   - Componente client.
   - fixed right.
   - width 2px o 3px.
   - z-index alto.
   - pointer-events: none.
   - opacity visible durante scroll.
   - ocultar después de 1.5s.
   - usar transform scaleY para progreso, no cambiar height continuamente si se puede evitar.
   - color acorde al sistema visual actual, preferiblemente #6872F2 o una variante compatible con el portfolio.

4. Integración:
   - Agregar en layout o por página según riesgo.
   - Inicialmente usar scroll nativo.
   - Si luego se instala Lenis, actualizar para leer progreso desde Lenis.

5. WebGL/viewport:
   - No cambiar masivamente window.innerWidth a document.documentElement.clientWidth sin probar.
   - Para Three.js fijo full viewport, evaluar usar document.documentElement.clientWidth solo donde el shift sea real.
   - Probar /about y /projects específicamente.

Al terminar Fase 2 reportar:
- Archivos modificados
- Si hubo shift de viewport
- Qué componentes se ajustaron
- Resultado de pruebas

==== FASE 3: LENIS SOLO SI ES SEGURO ====

ATENCIÓN:
Lenis no está instalado actualmente. Esta fase es de alto riesgo porque el sitio ya depende de GSAP ScrollTrigger, pin, scrub, containerAnimation, React Three Fiber useFrame, gsap.ticker y RAFs propios.

No instalar ni activar Lenis globalmente sin confirmar primero.

1. Auditoría previa:
   - Listar todos los ScrollTrigger:
     - app/page.tsx
     - app/about/page.tsx / AboutAxe scrollAnimation.ts
     - ServicesAboutSections.tsx
     - app/projects/page.tsx
     - ProjectDetailClient.tsx
     - MathFluidParticles.tsx
   - Listar todos los loops:
     - React Three Fiber useFrame en LiquidScene
     - gsap.ticker en AboutAxe
     - requestAnimationFrame en ProjectDepthCard
     - Matter.Runner y RAF en MathFluidParticles

2. Decisión:
   - Si el riesgo es alto, proponer dejar scroll nativo y solo usar CustomScrollbar.
   - Si se decide implementar Lenis, hacerlo detrás de un provider controlado y reversible.

3. Implementación Lenis, si se aprueba:
   - Instalar lenis.
   - Crear app/providers/LenisProvider.tsx.
   - Integrar Lenis con gsap.ticker, no con un RAF aislado adicional.
   - Llamar lenis.raf(time * 1000) desde gsap.ticker si GSAP está presente.
   - Llamar ScrollTrigger.update() en scroll de Lenis.
   - Evaluar scrollerProxy solo si se usa un contenedor custom. Si Lenis controla window/document, puede no ser necesario.
   - Exponer instancia por Context.
   - Cleanup correcto con lenis.destroy().

4. Adaptaciones:
   - Navbar debe leer scroll compatible con Lenis.
   - LiquidScene actualmente usa window.scrollY para sceneProgress; decidir si mantener porque Lenis actualiza scroll nativo o pasar valor desde provider.
   - No modificar ProjectDepthCard RAF.
   - No modificar React Three Fiber useFrame.
   - No intentar unificar todos los RAFs del sitio; solo evitar un RAF de Lenis desconectado de GSAP.

5. Mobile:
   - Evaluar smoothTouch/touchMultiplier.
   - Si interfiere, desactivar Lenis en mobile o ajustar touchMultiplier.

Al terminar Fase 3 reportar:
- Si Lenis se implementó o se descartó por riesgo
- Archivos modificados
- Cómo se integró con GSAP/ScrollTrigger
- Qué loops quedaron independientes y por qué
- Resultado de pruebas

==== FASE 4: RESPONSIVE DESIGN SIN ROMPER ANIMACIONES ====

Objetivo: mejorar responsive de forma incremental.

1. Auditar breakpoints:
   - 320px
   - 375px
   - 768px
   - 1024px
   - 1440px
   - 1920px

2. Revisar páginas:
   - Home
   - About
   - Projects listing
   - Project detail horizontal
   - Blog listing
   - Blog detail
   - Contact

3. Tipografía:
   - Preferir clamp() en títulos.
   - No cambiar escala visual global sin comparar.

4. WebGL/canvas:
   - AboutAxe:
     - Evaluar migrar resize de window resize a ResizeObserver solo si no rompe canvas fixed.
     - Mantener renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)).
   - ProjectDepthCard:
     - Ya usa ResizeObserver.
   - MathFluidParticles:
     - Ya usa ResizeObserver e IntersectionObserver.
   - LiquidScene:
     - React Three Fiber ya maneja tamaño del Canvas; cuidado con cambios manuales.

5. Navegación:
   - Revisar navbar en mobile.
   - No agregar overlay/hamburguesa que bloquee canvas o ScrollTrigger sin probar.
   - Asegurar targets mínimos de 44px cuando sea posible.

6. Touch:
   - ProjectDepthCard usa Pointer Events, compatible con touch.
   - LiquidScene usa eventos de React Three Fiber; revisar comportamiento en touch antes de modificar.
   - Previews hover deben tener fallback o no mostrarse en touch.

7. Reglas:
   - No desactivar animaciones abruptamente.
   - Respetar prefers-reduced-motion si se agrega soporte.
   - Evitar cambios masivos de px a rem si son valores calibrados para escenas 3D o layouts con ScrollTrigger.

Al terminar Fase 4 reportar:
- Qué se implementó
- Qué se dejó igual por estar calibrado
- Breakpoints probados
- Si hay scroll horizontal
- Resultado de lint/typecheck/build

FORMATO DE ENTREGA POR FASE:
✅ Implementado
⚠️ Advertencias
❌ No realizado y motivo
📁 Archivos modificados
🧪 Validación ejecutada