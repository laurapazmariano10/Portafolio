'use client';


import { useEffect, useRef, useState } from 'react';

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
uniform sampler2D u_image;
uniform sampler2D u_depth;
uniform vec2 u_mouse;
uniform float u_strength;
uniform float u_invert;
varying vec2 v_texCoord;

void main() {
  vec4 depthColor = texture2D(u_depth, v_texCoord);
  float depth = depthColor.r;
  
  // If depth map is inverted (black = near), flip it
  depth = mix(depth, 1.0 - depth, u_invert);
  
  // Displace based on depth (white = near, black = far)
  vec2 offset = u_mouse * ((depth - 0.5) * u_strength);
  
  // Slight zoom to prevent edge wrapping/clamping from being visible
  vec2 uv = (v_texCoord - 0.5) * 0.96 + 0.5;
  
  gl_FragColor = texture2D(u_image, uv + offset);
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
  const [isShaking, setIsShaking] = useState(false);

  useEffect(() => {


    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: false });
    if (!gl) return;

    // Build Program
    const vs = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
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
    const createTexture = (src: string, index: number, uniformName: string) => {
      const texture = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0 + index);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      
      // Temporary 1x1 pixel until image loads
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([200, 200, 200, 255]));
      
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.src = src;
      img.onload = () => {
        gl.activeTexture(gl.TEXTURE0 + index);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      };

      const loc = gl.getUniformLocation(program, uniformName);
      gl.uniform1i(loc, index);
    };

    createTexture(cover, 0, 'u_image');
    createTexture(depthMap, 1, 'u_depth');

    const mouseLoc = gl.getUniformLocation(program, 'u_mouse');
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
      gl.uniform1f(strengthLoc, strength);
      gl.uniform1f(invertLoc, invertDepth ? 1.0 : 0.0);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      rafRef.current = requestAnimationFrame(render);
    };
    render();

    return () => {
      observer.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      gl.deleteProgram(program);
    };
  }, [cover, depthMap, strength, invertDepth]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    pointerRef.current.tx = ((e.clientX - rect.left) / rect.width - 0.5) * 2.0;
    pointerRef.current.ty = ((e.clientY - rect.top) / rect.height - 0.5) * 2.0;
  };

  const handlePointerEnter = () => {
    pointerRef.current.active = true;
    setIsShaking(true);
    window.setTimeout(() => setIsShaking(false), 320); // Matched with CSS duration
  };

  const handlePointerLeave = () => {
    pointerRef.current.active = false;
    pointerRef.current.tx = 0;
    pointerRef.current.ty = 0;
  };

  return (
    <div
      ref={wrapRef}
      className={`project-depth-card relative aspect-[1120/746] overflow-hidden rounded-[28px] bg-[#f1f1f1] ${isShaking ? 'project-depth-card--shake' : ''} ${className ?? ''}`}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full object-cover" />
    </div>
  );
}
