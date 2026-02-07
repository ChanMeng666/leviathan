import { useRef, useEffect, useCallback } from 'react';
import { Renderer, Program, Mesh, Triangle, type OGLRenderingContext } from 'ogl';

const VERTEX = /* glsl */ `
  attribute vec2 uv;
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0, 1);
  }
`;

const FRAGMENT = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uSpinSpeed;
  uniform float uSpinAmount;
  uniform float uOffset;
  uniform float uContrast;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;

  #define PI 3.14159265359
  #define SPIN_EASE 0.5

  vec2 spin(vec2 uv, vec2 center, float angle) {
    float s = sin(angle);
    float c = cos(angle);
    uv -= center;
    uv = vec2(uv.x * c - uv.y * s, uv.x * s + uv.y * c);
    uv += center;
    return uv;
  }

  void main() {
    float spinMix = pow(SPIN_EASE, 2.1);
    vec2 uv = vUv - 0.5;
    float dist = length(uv);
    float angle = uSpinAmount * spinMix * sin(-1.0 * uTime * uSpinSpeed + dist * 12.0);
    uv = spin(uv + 0.5, vec2(0.5), angle) - 0.5;

    float t = uTime * 0.3;

    // Layered noise-like pattern
    float pattern = 0.0;
    pattern += sin(uv.x * 8.0 + t) * sin(uv.y * 6.0 - t * 0.7) * 0.5;
    pattern += sin(uv.x * 12.0 - t * 1.3 + uv.y * 10.0) * 0.3;
    pattern += sin(length(uv) * 16.0 - t * 2.0) * 0.2;
    pattern += sin((uv.x + uv.y) * 14.0 + t * 0.8) * 0.2;

    pattern = pattern * 0.5 + 0.5; // normalize to 0-1

    // Contrast
    pattern = 0.5 + (pattern - 0.5) * uContrast;

    // Three-color gradient
    vec3 color;
    if (pattern < 0.5) {
      color = mix(uColor1, uColor2, pattern * 2.0);
    } else {
      color = mix(uColor2, uColor3, (pattern - 0.5) * 2.0);
    }

    // Vignette
    float vig = 1.0 - dist * 0.8;
    color *= vig;

    gl_FragColor = vec4(color, 1.0);
  }
`;

interface BalatroBackgroundProps {
  color1?: [number, number, number];
  color2?: [number, number, number];
  color3?: [number, number, number];
  spinSpeed?: number;
  spinAmount?: number;
  contrast?: number;
  className?: string;
}

function hexToGL(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return [r, g, b];
}

const DEFAULT_COLORS = {
  color1: hexToGL('#DE443B'),
  color2: hexToGL('#006BB4'),
  color3: hexToGL('#1B2B1B'),
};

export function BalatroBackground({
  color1 = DEFAULT_COLORS.color1,
  color2 = DEFAULT_COLORS.color2,
  color3 = DEFAULT_COLORS.color3,
  spinSpeed = 0.4,
  spinAmount = 0.8,
  contrast = 1.2,
  className = '',
}: BalatroBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const programRef = useRef<Program | null>(null);
  const rafRef = useRef<number>(0);

  // Check reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const render = useCallback((time: number) => {
    if (programRef.current && rendererRef.current) {
      programRef.current.uniforms.uTime.value = time * 0.001;
      rendererRef.current.render({ scene: (rendererRef.current as any)._mesh });
    }
    rafRef.current = requestAnimationFrame(render);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion || !containerRef.current) return;

    const container = containerRef.current;
    const renderer = new Renderer({
      alpha: false,
      antialias: false,
      dpr: Math.min(window.devicePixelRatio, 2),
    });
    rendererRef.current = renderer;
    const gl = renderer.gl as OGLRenderingContext;
    container.appendChild(gl.canvas);

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex: VERTEX,
      fragment: FRAGMENT,
      uniforms: {
        uTime: { value: 0 },
        uSpinSpeed: { value: spinSpeed },
        uSpinAmount: { value: spinAmount },
        uOffset: { value: 0 },
        uContrast: { value: contrast },
        uColor1: { value: color1 },
        uColor2: { value: color2 },
        uColor3: { value: color3 },
      },
    });
    programRef.current = program;

    const mesh = new Mesh(gl, { geometry, program });
    (renderer as any)._mesh = mesh;

    const resize = () => {
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    resize();
    window.addEventListener('resize', resize);

    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      container.removeChild(gl.canvas);
    };
  }, [prefersReducedMotion, spinSpeed, spinAmount, contrast, color1, color2, color3, render]);

  // Fallback gradient for reduced motion
  if (prefersReducedMotion) {
    return (
      <div
        className={`absolute inset-0 ${className}`}
        style={{
          background: `radial-gradient(ellipse at center,
            rgb(${color1.map(c => Math.round(c * 255)).join(',')}) 0%,
            rgb(${color2.map(c => Math.round(c * 255)).join(',')}) 50%,
            rgb(${color3.map(c => Math.round(c * 255)).join(',')}) 100%)`,
        }}
      />
    );
  }

  return <div ref={containerRef} className={`absolute inset-0 ${className}`} />;
}
