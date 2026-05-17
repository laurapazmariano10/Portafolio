'use client';


import { useEffect, useRef, useState } from 'react';
import { PROJECT_CARD_IMAGE_SCALE, PROJECT_COVER_INTERNAL_ZOOM } from '@/components/projects/projectAnimationConfig';

type ProjectDepthCardProps = {
  cover: string;
  depthMap: string;
  title: string;
  className?: string;
  strength?: number;
  invertDepth?: boolean;
};

const VERTEX_SHADER = `
attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
  v_texCoord = a_position * 0.5 + 0.5;
  v_texCoord.y = 1.0 - v_texCoord.y;
}
`;

const FRAGMENT_SHADER = `
precision mediump float;
#define INTERNAL_ZOOM ${PROJECT_COVER_INTERNAL_ZOOM.toFixed(6)}
uniform sampler2D u_image;
uniform sampler2D u_depth;
uniform vec2 u_mouse;
uniform vec2 u_imageSize;
uniform vec2 u_canvasSize;
uniform float u_strength;
uniform float u_invert;
varying vec2 v_texCoord;

vec2 coverUv(vec2 uv, vec2 imageSize, vec2 canvasSize) {
  float imageAspect = imageSize.x / imageSize.y;
  float canvasAspect = canvasSize.x / canvasSize.y;
  vec2 scale = vec2(1.0);

  if (canvasAspect > imageAspect) {
    scale.y = imageAspect / canvasAspect;
  } else {
    scale.x = canvasAspect / imageAspect;
  }

  return (uv - 0.5) * scale + 0.5;
}

void main() {
  vec2 baseUv = coverUv(v_texCoord, u_imageSize, u_canvasSize);
  vec4 depthColor = texture2D(u_depth, baseUv);
  float depth = depthColor.r;
  
  // If depth map is inverted (black = near), flip it
  depth = mix(depth, 1.0 - depth, u_invert);
  
  // Displace based on depth (white = near, black = far)
  vec2 offset = u_mouse * ((depth - 0.5) * u_strength);
  
  // Internal zoom keeps depth displacement away from texture edges.
  vec2 uv = (baseUv - 0.5) * INTERNAL_ZOOM + 0.5;
  vec2 sampleUv = clamp(uv + offset, vec2(0.001), vec2(0.999));
  
  vec4 color = texture2D(u_image, sampleUv);
  color.a = 1.0;
  gl_FragColor = color;
}
`;

function createShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export default function ProjectDepthCard({ cover, depthMap, title, className, strength = 0.035, invertDepth = false }: ProjectDepthCardProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const pointerRef = useRef({ tx: 0, ty: 0, x: 0, y: 0, active: false });
  const rafRef = useRef<number | null>(null);
  const canHoverRef = useRef(false);
  const shakeTimerRef = useRef<number | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [useCanvas, setUseCanvas] = useState(false);

  useEffect(() => {


    const canvas = canvasRef.current;
    if (!canvas) return;
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    canHoverRef.current = canHover;
    setUseCanvas(canHover);
    if (!canHover) return;

    const gl = canvas.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: false });
    if (!gl) return;

    // Build Program
    const vs = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vs || !fs) {
      if (vs) gl.deleteShader(vs);
      if (fs) gl.deleteShader(fs);
      return;
    }

    const program = gl.createProgram();
    if (!program) {
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      return;
    }
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      return;
    }

    gl.useProgram(program);

    // Quad Geometry
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1.0, -1.0,
         1.0, -1.0,
        -1.0,  1.0,
        -1.0,  1.0,
         1.0, -1.0,
         1.0,  1.0,
      ]),
      gl.STATIC_DRAW
    );

    const posLoc = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    // Helper to load textures
    let imageNaturalSize = { width: 1, height: 1 };
    let disposed = false;
    const textures: WebGLTexture[] = [];

    const createTexture = (src: string, index: number, uniformName: string, onLoad?: (img: HTMLImageElement) => void) => {
      const texture = gl.createTexture();
      if (!texture) return;
      textures.push(texture);

      gl.activeTexture(gl.TEXTURE0 + index);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      
      // Temporary 1x1 pixel until image loads
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([200, 200, 200, 255]));
      
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.src = src;
      img.onload = () => {
        if (disposed) return;
        gl.activeTexture(gl.TEXTURE0 + index);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        onLoad?.(img);
      };

      const loc = gl.getUniformLocation(program, uniformName);
      gl.uniform1i(loc, index);
    };

    createTexture(cover, 0, 'u_image', (img) => {
      imageNaturalSize = { width: img.naturalWidth || img.width, height: img.naturalHeight || img.height };
    });
    createTexture(depthMap, 1, 'u_depth');

    const mouseLoc = gl.getUniformLocation(program, 'u_mouse');
    const imageSizeLoc = gl.getUniformLocation(program, 'u_imageSize');
    const canvasSizeLoc = gl.getUniformLocation(program, 'u_canvasSize');
    const strengthLoc = gl.getUniformLocation(program, 'u_strength');
    const invertLoc = gl.getUniformLocation(program, 'u_invert');

    // Handle high-DPI screens for crisp images
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    
    // We observe resize instead of using just window resize
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    // Render Loop
    const render = () => {
      const p = pointerRef.current;
      p.x += (p.tx - p.x) * 0.12;
      p.y += (p.ty - p.y) * 0.12;

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(program);
      gl.uniform2f(mouseLoc, p.x, p.y);
      gl.uniform2f(imageSizeLoc, imageNaturalSize.width, imageNaturalSize.height);
      gl.uniform2f(canvasSizeLoc, canvas.width, canvas.height);
      gl.uniform1f(strengthLoc, strength);
      gl.uniform1f(invertLoc, invertDepth ? 1.0 : 0.0);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      rafRef.current = requestAnimationFrame(render);
    };
    render();

    return () => {
      disposed = true;
      observer.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (shakeTimerRef.current !== null) window.clearTimeout(shakeTimerRef.current);
      textures.forEach((texture) => gl.deleteTexture(texture));
      if (positionBuffer) gl.deleteBuffer(positionBuffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [cover, depthMap, strength, invertDepth]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!canHoverRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    pointerRef.current.tx = ((e.clientX - rect.left) / rect.width - 0.5) * 2.0;
    pointerRef.current.ty = ((e.clientY - rect.top) / rect.height - 0.5) * 2.0;
  };

  const handlePointerEnter = () => {
    if (!canHoverRef.current) return;
    pointerRef.current.active = true;
    setIsShaking(true);
    if (shakeTimerRef.current !== null) window.clearTimeout(shakeTimerRef.current);
    shakeTimerRef.current = window.setTimeout(() => {
      setIsShaking(false);
      shakeTimerRef.current = null;
    }, 220);
  };

  const handlePointerLeave = () => {
    pointerRef.current.active = false;
    pointerRef.current.tx = 0;
    pointerRef.current.ty = 0;
  };

  return (
    <div
      ref={wrapRef}
      className={`project-depth-card relative overflow-hidden rounded-[28px] bg-[#f1f1f1] ${isShaking ? 'project-depth-card--shake' : ''} ${className ?? ''}`}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={cover}
        alt={title}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ transform: `scale(${PROJECT_CARD_IMAGE_SCALE})` }}
        draggable={false}
      />
      <canvas ref={canvasRef} className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${useCanvas ? 'opacity-100' : 'opacity-0'}`} />
    </div>
  );
}
