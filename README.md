# Mariano Laura — Portafolio

Portafolio personal de **Mariano Laura**: diseñador y desarrollador digital. Construido como un sitio premium en Next.js con animaciones avanzadas, 3D interactivo y transiciones tipo cámara.

## Stack

- **Next.js 15** (App Router)
- **React 19**
- **TypeScript**
- **TailwindCSS 4**
- **GSAP + ScrollTrigger** (animaciones de scroll y transiciones de ruta)
- **Three.js / React Three Fiber / Drei** (escenas 3D)
- **Matter.js** (partículas físicas)
- **Motion** (microinteracciones)

## Estructura

```
app/
  page.tsx              # Home con escena líquida WebGL
  about/                # Acerca de + katana 3D
  blog/                 # Blog y posts
  contacto/             # Formulario de contacto
  projects/             # Lista de proyectos
    [slug]/             # Página de detalle (acceso directo)
    @modal/             # Slot interceptado (overlay encima de la lista)
components/             # Componentes y escenas
public/                 # Imágenes WebP, texturas, modelos GLB
```

## Scripts

```bash
npm install        # Instalar dependencias
npm run dev        # Desarrollo
npm run build      # Build de producción
npm run start      # Servir build
npm run lint       # ESLint
```

## Hosting

Optimizado para hosting Node.js (Hostinger, Vercel, Netlify, Cloud Run, VPS).

En Hostinger:
1. Subir el repo / código.
2. Configurar Node.js como entorno.
3. Comando de instalación: `npm install`.
4. Comando de build: `npm run build`.
5. Comando de arranque: `npm run start`.

## Autor

**Mariano Laura** — laurapazmariano652@gmail.com
