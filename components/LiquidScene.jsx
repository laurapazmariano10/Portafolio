"use client";
/* eslint-disable react-hooks/immutability */

import React, { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

// === SIMPLEX NOISE GLOBAL ===
const snoise = `
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m; m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }
`;

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// === FUNCIÓN METABALL GLOBAL ===
const metaballSmin = `
  float smin(float a, float b, float k) {
      float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
      return mix(b, a, h) - k * h * (1.0 - h);
  }
`;

// === CAPA 1: BACKGROUND TOPOGRÁFICO ===
const fragmentBackground = `
  ${snoise}
  ${metaballSmin}
  uniform float u_time;
  uniform vec3 u_trail[10];
  uniform vec2 u_resolution;
  uniform float u_sminK;
  varying vec2 vUv;

  float sdCapsule(vec2 p, vec2 a, vec2 b, float r1, float r2) {
      vec2 pa = p - a, ba = b - a;
      float dotB = dot(ba, ba);
      float h = dotB > 0.00001 ? clamp( dot(pa,ba)/dotB, 0.0, 1.0 ) : 0.0;
      float r = mix(r1, r2, h);
      return length( pa - ba*h ) - r;
  }

  void main() {
    // 1. Animación autónoma hyper-viva estilo MAGMA/PLASMA
    float t = u_time * 0.15; 
    
    vec2 uv = vUv;
    
    vec2 warp = vec2(
      snoise(uv * 1.5 + vec2(t * 0.3, -t * 0.2)),
      snoise(uv * 1.5 - vec2(t * 0.2, t * 0.4) + vec2(100.0))
    );
    
    // Suavizado del magma base limitando multiplicadores
    float n = snoise(uv * 1.5 + warp * 0.4 + vec2(t * 0.2));
    n += snoise(uv * 2.5 - warp * 0.2 - vec2(t * 0.1)) * 0.5;

    // Movimiento fluido pero mucho más calmado
    float lines = abs(sin(n * 8.0 + u_time * 0.15));
    // Valores aún más estrechos para hacer las líneas extra finas
    lines = smoothstep(0.0, 0.05, lines);

    // MÁSCARA ORGÁNICA REALISTA PARA EL FONDO (Cápsulas conectadas)
    vec2 s = max(u_resolution, vec2(1.0));
    vec2 p = vUv; p.x *= (s.x / s.y);

    float maxR = 0.0;
    float d = 100.0;
    for(int i = 0; i < 9; i++) {
        vec2 a = u_trail[i].xy; 
        vec2 b = u_trail[i+1].xy;
        a.x *= (s.x / s.y);
        b.x *= (s.x / s.y);
        
        float r1 = u_trail[i].z;
        float r2 = u_trail[i+1].z;
        maxR = max(maxR, max(r1, r2));
        
        float distSegment = sdCapsule(p, a, b, r1, r2);
        // Escalar SminK proporcionalmente para evitar que se vuelva un círculo cuando el radio es ínfimo
        float currentSminK = min(u_sminK, max(r1, r2) * 0.6);
        d = smin(d, distSegment, currentSminK);
    }

    float isActive = smoothstep(0.0001, 0.005, maxR);

    // Añade turbulencia de agua
    vec2 noiseUv = vUv * 5.0; 
    float n_mask = snoise(noiseUv - vec2(u_time * 2.0)); 
    d += n_mask * (maxR * 0.15);
    
    // Matemática pura para los bordes fluidos con corte sin pixeles duros
    float mask = (1.0 - smoothstep(0.0, 0.002, d)) * isActive;

    // COLORES EXACTOS
    // Fuera del cursor (Normal)
    vec3 normalBgColor = vec3(0.96, 0.96, 0.97); 
    vec3 normalLineColor = vec3(0.41, 0.45, 0.95); 

    // Dentro del cursor (Hover) -> Rojo oscuro en fondo azul medio oscuro
    vec3 hoverBgColor = vec3(0.12, 0.18, 0.35); // Azul medio oscuro, no tan negro
    vec3 hoverLineColor = vec3(0.55, 0.05, 0.05); // Rojo oscuro

    // Combinación basada ESTRICTAMENTE en la máscara
    vec3 currentBgColor = mix(normalBgColor, hoverBgColor, mask);
    vec3 currentLineColor = mix(normalLineColor, hoverLineColor, mask);

    vec3 col = mix(currentLineColor, currentBgColor, lines);

    float vignette = 1.0 - smoothstep(0.1, 1.5, length(vUv - vec2(0.5)));
    col *= mix(0.85, 1.0, vignette);

    gl_FragColor = vec4(col, 1.0);
  }
`;

// === CAPA 2: LÍQUIDO COMPLEX (BASE + REVEAL) ===
const fragmentLiquid = `
  ${snoise}
  ${metaballSmin}
  uniform sampler2D u_textureBase;
  uniform sampler2D u_textureReveal;
  uniform sampler2D u_textureDepth;
  uniform sampler2D u_textureDepthHero;
  uniform sampler2D u_textureScan;
  uniform vec3 u_trail[10];
  uniform float u_time;
  
  uniform vec2 u_resolution;
  uniform vec2 u_imageResolution;
  
  varying vec2 vUv;

  float sdCapsule(vec2 p, vec2 a, vec2 b, float r1, float r2) {
      vec2 pa = p - a, ba = b - a;
      float dotB = dot(ba, ba);
      float h = dotB > 0.00001 ? clamp( dot(pa,ba)/dotB, 0.0, 1.0 ) : 0.0;
      float r = mix(r1, r2, h);
      return length( pa - ba*h ) - r;
  }

  void main() {
    // MATEMÁTICA OBJECT-FIT COVER
    vec2 s = max(u_resolution, vec2(1.0));
    vec2 i = max(u_imageResolution, vec2(1.0));
    float rs = s.x / s.y;
    float ri = i.x / i.y;
    vec2 newRes = rs < ri ? vec2(i.x * s.y / i.y, s.y) : vec2(s.x, i.y * s.x / i.x);
    vec2 offset = (rs < ri ? vec2((newRes.x - s.x) / 2.0, 0.0) : vec2(0.0, (newRes.y - s.y) / 2.0)) / newRes;
    
    vec2 uvCover = vUv * s / newRes + offset;

    // Escalar la imagen ANCLADA ABAJO (+10% más de tamaño, reduciendo el multiplicador a 1.12)
    uvCover.x = (uvCover.x - 0.5) * 1.12 + 0.5; 
    uvCover.y = uvCover.y * 1.12; 

    // Anular pixeles si se salen del borde por la reducción
    float inside = step(0.0, uvCover.x) * step(uvCover.x, 1.0) * step(0.0, uvCover.y) * step(uvCover.y, 1.0);

    // MÁSCARA ORGÁNICA DEL CURSOR LÍQUIDO Y SU RASTRO
    vec2 p = vUv; p.x *= (s.x / s.y);

    float maxR = 0.0;
    float d = 100.0;
    for(int i = 0; i < 9; i++) {
        vec2 a = u_trail[i].xy; 
        vec2 b = u_trail[i+1].xy;
        a.x *= (s.x / s.y);
        b.x *= (s.x / s.y);
        
        float r1 = u_trail[i].z;
        float r2 = u_trail[i+1].z;
        maxR = max(maxR, max(r1, r2));
        
        float distSegment = sdCapsule(p, a, b, r1, r2);
        // Escalar SminK para que mantenga la forma de gota en radios pequeños
        float currentSminK = min(0.020, max(r1, r2) * 0.6);
        d = smin(d, distSegment, currentSminK);
    }

    float isActive = smoothstep(0.0001, 0.002, maxR);

    vec2 noiseUv = vUv * 5.0; 
    float n_mask = snoise(noiseUv - vec2(u_time * 2.0)); 
    d += n_mask * (maxR * 0.15);
    
    // Corte directo (sin difuminado en los bordes) manteniendo pureza
    float mask = (1.0 - smoothstep(0.0, 0.002, d)) * isActive;

    // Mapeo de profundidad 3D individual para tener parallax sincronizado puro
    float depthBase = texture2D(u_textureDepth, uvCover).r;
    float depthReveal = texture2D(u_textureDepthHero, uvCover).r;
    
    // Parallax realista basado en mapa de profundidad
    vec2 headMouse = u_trail[0].xy;
    vec2 depthParallaxBase = (vec2(0.5) - headMouse) * 0.019 * (depthBase - 0.5);
    vec2 depthParallaxReveal = (vec2(0.5) - headMouse) * 0.019 * (depthReveal - 0.5);

    // EXTRACCIÓN DE TEXTURAS con Desplazamiento de Profundidad
    vec4 texBase = texture2D(u_textureBase, uvCover + depthParallaxBase);
    vec2 uvReveal = uvCover + depthParallaxReveal;
    vec4 texReveal = texture2D(u_textureReveal, uvReveal); 

    // === ESCÁNER DESDE IMAGEN ESTÁTICA IMPORTADA ===
    // 1. Extraemos la textura del archivo Scaneo2.png usando las mismas coordenadas
    vec4 texScanOverlay = texture2D(u_textureScan, uvReveal); 
    
    // Magia Cromática: Como el dibujo tiene un "papel blanco" de fondo, 
    // calculamos qué tan oscura es la tinta / línea (Luminancia Invenida).
    // Blanco puro (Papel) = 0.0 intensidad. Negro (Tinta) = 1.0 intensidad.
    float luma = dot(texScanOverlay.rgb, vec3(0.299, 0.587, 0.114));
    float lineDarkness = 1.0 - luma;
    
    // Discriminador implacable: Ignora el fondo blanco (umbrales bajos) 
    // y rescata hasta el gris/raya más fina dotándola de gran solidez (pasando 0.4).
    float scanIntensity = smoothstep(0.04, 0.40, lineDarkness);
    
    // 2. Escáner de Barrido PING-PONG CON PAUSA
    float moveDur = 1.6; // Tiempo de movimiento (ida)
    // Pausa mínima: el rango extendido (-0.35 a 1.35) ya crea ~0.35s
    // de viaje fuera de pantalla, así que con 0.1 el giro es casi instantáneo.
    float pauseDur = 0.1; 
    float period = (moveDur + pauseDur) * 2.0;
    float t = mod(u_time, period);
    
    // Transiciones LINEALES: El problema era el "smoothstep" anterior que frenaba
    // y aceleraba el láser en los bordes, creando la ilusión de una pausa enorme.
    float down = clamp(t / moveDur, 0.0, 1.0);
    float up = clamp((t - (moveDur + pauseDur)) / moveDur, 0.0, 1.0);
    
    // Rango ampliado (-0.35 a 1.35) para que desaparezca limpiamente antes de pausar y darse la vuelta
    float phase = down - up; 
    float scanSpeed = mix(-0.35, 1.35, phase);
    
    float dir = step(t, moveDur + pauseDur) * 2.0 - 1.0; // 1.0 bajando, -1.0 subiendo
    
    float scanPos = 1.0 - uvCover.y; 
    float dist = (scanSpeed - scanPos) * dir; // Distancia desde el frente del láser
    
    // Banda inteligente bipolar: invierte la figura automáticamente al rebotar
    float fadeTail = 1.0 - smoothstep(0.0, 0.35, dist);
    float cutHead = smoothstep(-0.01, 0.0, dist);
    float visibilityBand = fadeTail * cutHead;

    // 3. Aplicamos la banda de láser a las líneas (Opacidad bajada a 0.61)
    float sketchOp = clamp(0.61 * visibilityBand * scanIntensity, 0.0, 1.0);

    // 4. Mostrar TODO EL DIBUJO
    // Eliminamos por completo la máscara restrictiva de la cara para que barra hasta los hombros/cuerpo

    // 5. Mezclar la textura directa de Scaneo2.png sobre el Sujeto base
    vec4 baseConBoceto = texBase;
    baseConBoceto.rgb = mix(baseConBoceto.rgb, texScanOverlay.rgb, sketchOp * baseConBoceto.a);

    // Recortar lo sobrante
    baseConBoceto.rgba *= inside;
    texReveal.rgba *= inside;
    
    // MEZCLA DE TEXTURAS DIRECTA (Sin luz en los bordes para mantener la pureza natural del revelado)
    vec4 finalColor = mix(baseConBoceto, texReveal, mask);
    
    gl_FragColor = finalColor;
  }
`;

function SceneContent() {
    const { size, viewport } = useThree();

    const [texBase, texReveal, texDepth, texDepthHero, texScan] = useTexture(["/Sujeto.png", "/Hero.png", "/DepthMap.png", "/DepthMapHero.png", "/Scaneo2.png"]);

    const bgRef = useRef(null);
    const liquidRef = useRef(null);

    // Referencias directas a los materiales para forzar actualización en GPU
    const bgMatRef = useRef(null);
    const liquidMatRef = useRef(null);

    const bgUniforms = useMemo(() => ({
        u_time: { value: 0 },
        u_trail: { value: new Array(10).fill(0).map(() => new THREE.Vector3(0.5, 0.5, 0.0)) },
        u_resolution: { value: new THREE.Vector2(1024, 1024) },
        u_sminK: { value: 0.020 }
    }), []);

    const liquidUniforms = useMemo(() => {
        const w = texBase.image?.videoWidth || texBase.image?.width || 1024;
        const h = texBase.image?.videoHeight || texBase.image?.height || 1024;
        return {
            u_time: { value: 0 },
            u_trail: { value: new Array(10).fill(0).map(() => new THREE.Vector3(0.5, 0.5, 0.0)) },
            u_resolution: { value: new THREE.Vector2(1024, 1024) },
            u_imageResolution: { value: new THREE.Vector2(w, h) },
            u_textureBase: { value: texBase },
            u_textureReveal: { value: texReveal },
            u_textureDepth: { value: texDepth },
            u_textureDepthHero: { value: texDepthHero },
            u_textureScan: { value: texScan }
        };
    }, [texBase, texReveal, texDepth, texDepthHero, texScan]);

    useEffect(() => {
        if (liquidUniforms.u_resolution) {
            liquidUniforms.u_resolution.value.set(size.width, size.height);
        }
        if (bgUniforms.u_resolution) {
            bgUniforms.u_resolution.value.set(size.width, size.height);
        }
    }, [size.width, size.height, liquidUniforms, bgUniforms]);

    const parallaxMouse = useRef(new THREE.Vector2(0.5, 0.5));

    // Nodos para el trail orgánico (x, y, radius)
    const trailRef = useRef(Array.from({ length: 10 }, () => new THREE.Vector3(0.5, 0.5, 0.0)));
    const lastRawPointer = useRef(new THREE.Vector2(0.5, 0.5));
    const smoothedSpeed = useRef(0.0);
    const activity = useRef(0.0);       // Factor continuo [0..1] en vez de boolean isIdle
    const headRadius = useRef(0.0);     // Radio computado del head por separado
    const isPointerInside = useRef(true);
    const smoothDir = useRef(new THREE.Vector2(0, 0)); // Dirección suavizada del movimiento

    // ── CONSTANTES TUNEABLES ──
    const MIN_R = 0.040;
    const MAX_R = 0.29;
    const SPEED_TO_RADIUS = 19.0;
    const ACTIVITY_RISE = 12.0;
    const ACTIVITY_FALL = 4.0;
    const TAPER_CURVE = 0.6;
    const FOLLOW_SPEED_ACTIVE = 25.0;
    const FOLLOW_SPEED_RETRACT = 10.0;
    const TELEPORT_THRESHOLD = 0.15;
    const DEATH_THRESHOLD = 0.0005;

    useFrame(({ pointer, clock }, delta) => {
        const dt = Math.min(delta, 0.05); // Clamp para evitar saltos por ALT+TAB

        // ─── 1. MOUSE EN UV (0..1) ───
        const mx = pointer.x * 0.5 + 0.5;
        const my = pointer.y * 0.5 + 0.5;

        // ─── 2. VELOCIDAD ───
        const dx = mx - lastRawPointer.current.x;
        const dy = my - lastRawPointer.current.y;
        const rawSpeed = Math.sqrt(dx * dx + dy * dy);
        lastRawPointer.current.set(mx, my);

        // Suavizar velocidad (EMA) para que el radio no vibre
        smoothedSpeed.current = THREE.MathUtils.damp(
            smoothedSpeed.current, rawSpeed, 10.0, dt
        );

        // ─── 2b. DIRECCIÓN SUAVIZADA ───
        // Trackear la última dirección de movimiento para mantener
        // la forma elongada cuando el cursor se detiene.
        if (rawSpeed > 0.001) {
            smoothDir.current.x = THREE.MathUtils.damp(smoothDir.current.x, dx / rawSpeed, 8.0, dt);
            smoothDir.current.y = THREE.MathUtils.damp(smoothDir.current.y, dy / rawSpeed, 8.0, dt);
        }

        // ─── 3. ACTIVIDAD CONTINUA (anti-parpadeo) ───
        // En vez de un switch on/off, usamos un valor que sube/baja suavemente.
        // Esto elimina el parpadeo a velocidades bajas.
        const isMoving = rawSpeed > 0.0005 && isPointerInside.current;
        const actTarget = isMoving ? 1.0 : 0.0;
        const actLambda = isMoving ? ACTIVITY_RISE : ACTIVITY_FALL;
        activity.current = THREE.MathUtils.damp(
            activity.current, actTarget, actLambda, dt
        );
        // Snap a 0 para eliminar residuos fantasma sub-pixel
        if (activity.current < 0.005) activity.current = 0.0;

        // ─── 4. TELEPORT CHECK ───
        if (rawSpeed > TELEPORT_THRESHOLD) {
            for (let i = 0; i < 10; i++) {
                trailRef.current[i].set(mx, my, 0.0);
            }
            activity.current = 0.0;
            headRadius.current = 0.0;
        }

        // ─── 5. HEAD: POSICIÓN EXACTA (sin delay) ───
        trailRef.current[0].x = mx;
        trailRef.current[0].y = my;

        // ─── 6. HEAD: RADIO ───
        const rawTargetR = MIN_R + smoothedSpeed.current * SPEED_TO_RADIUS;
        const clampedTarget = THREE.MathUtils.clamp(rawTargetR, MIN_R, MAX_R);
        const finalTarget = clampedTarget * activity.current;
        const radiusLambda = finalTarget > headRadius.current ? 18.0 : 5.0;
        headRadius.current = THREE.MathUtils.damp(
            headRadius.current, finalTarget, radiusLambda, dt
        );
        if (headRadius.current < DEATH_THRESHOLD) headRadius.current = 0.0;
        trailRef.current[0].z = headRadius.current;

        // ─── 7. COLA ───
        for (let i = 1; i < 10; i++) {
            const prev = trailRef.current[i - 1];
            const curr = trailRef.current[i];

            const followLambda = activity.current > 0.5
                ? FOLLOW_SPEED_ACTIVE
                : FOLLOW_SPEED_RETRACT;

            // SPREAD DIRECCIONAL: cuando activity baja, cada nodo se desplaza
            // ligeramente detrás de su predecesor en la última dirección de movimiento.
            // Esto mantiene la forma elongada/gota y evita que todos converjan
            // a un solo punto (lo que causaba el artefacto del círculo).
            const spread = (1.0 - activity.current) * 0.008;
            const tx = prev.x - smoothDir.current.x * spread;
            const ty = prev.y - smoothDir.current.y * spread;

            curr.x = THREE.MathUtils.damp(curr.x, tx, followLambda, dt);
            curr.y = THREE.MathUtils.damp(curr.y, ty, followLambda, dt);

            const taper_t = i / 9;
            const taperFactor = Math.pow(1.0 - taper_t, TAPER_CURVE);
            const idealRadius = headRadius.current * taperFactor;
            // Radio damp consistente para desaparecer suavemente
            curr.z = THREE.MathUtils.damp(curr.z, idealRadius, 10.0, dt);

            if (curr.z < DEATH_THRESHOLD) {
                curr.z = 0.0;
                curr.x = THREE.MathUtils.damp(curr.x, mx, 50.0, dt);
                curr.y = THREE.MathUtils.damp(curr.y, my, 50.0, dt);
            }
        }

        // ─── 8. PARALLAX ───
        parallaxMouse.current.x = THREE.MathUtils.damp(parallaxMouse.current.x, mx, 3.5, dt);
        parallaxMouse.current.y = THREE.MathUtils.damp(parallaxMouse.current.y, my, 3.5, dt);

        if (bgRef.current) {
            bgRef.current.position.set(0, 0, 0);
        }

        if (liquidRef.current) {
            liquidRef.current.position.x = (parallaxMouse.current.x - 0.5) * 0.003;
            liquidRef.current.position.y = (parallaxMouse.current.y - 0.5) * 0.003;
        }

        const t = clock.getElapsedTime();

        // ─── 9. GPU UPDATE ───
        if (bgMatRef.current) {
            bgMatRef.current.uniforms.u_time.value = t;
            bgMatRef.current.uniforms.u_trail.value = trailRef.current;
        }

        if (liquidMatRef.current) {
            liquidMatRef.current.uniforms.u_time.value = t;
            liquidMatRef.current.uniforms.u_trail.value = trailRef.current;
        }
    });

    return (
        <>
            {/* Eventos invisibles al fondo para captar si el mouse se sale */}
            <mesh
                position={[0, 0, 0.1]}
                visible={false}
                onPointerOver={() => { isPointerInside.current = true; }}
                onPointerOut={() => { isPointerInside.current = false; }}
            >
                <planeGeometry args={[100, 100]} />
            </mesh>

            {/* CAPA FONDO */}
            <mesh ref={bgRef} position={[0, 0, 0.0]} renderOrder={0}>
                <planeGeometry args={[viewport.width, viewport.height]} />
                <shaderMaterial
                    ref={bgMatRef}
                    vertexShader={vertexShader}
                    fragmentShader={fragmentBackground}
                    uniforms={bgUniforms}
                    depthTest={false}
                    depthWrite={false}
                />
            </mesh>

            {/* CAPA IMAGEN LÍQUIDO */}
            <mesh ref={liquidRef} position={[0, 0, 0.0]} renderOrder={1}>
                <planeGeometry args={[viewport.width, viewport.height]} />
                <shaderMaterial
                    ref={liquidMatRef}
                    vertexShader={vertexShader}
                    fragmentShader={fragmentLiquid}
                    uniforms={liquidUniforms}
                    transparent={true}
                    depthTest={false}
                    depthWrite={false}
                    blending={THREE.NormalBlending}
                />
            </mesh>
        </>
    );
}

// === COMPONENTE PRINCIPAL ===
export default function LiquidScene() {
    return (
        <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden" }} suppressHydrationWarning>
            <Canvas
                camera={{ position: [0, 0, 1], fov: 50 }}
                gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
                dpr={[1, 1.5]}
                style={{ width: "100%", height: "100%", position: "absolute", inset: 0, pointerEvents: "auto" }}
            >
                <React.Suspense fallback={null}>
                    <SceneContent />
                </React.Suspense>
            </Canvas>
        </div>
    );
}
