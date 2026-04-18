import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useTheme } from '../context/ThemeContext';
import earthDayUrl from '../assets/earth/earth-day.jpg';
import earthNormalUrl from '../assets/earth/earth-normal.jpg';
import earthSpecularUrl from '../assets/earth/earth-specular.jpg';
import earthCloudsUrl from '../assets/earth/earth-clouds.png';
import countriesData from '../assets/earth/countries.geo.json';

const loadImage = (src) => new Promise((resolve, reject) => {
  const image = new Image();
  image.onload = () => resolve(image);
  image.onerror = reject;
  image.src = src;
});

const loadTexture = (loader, url) => new Promise((resolve, reject) => {
  loader.load(url, resolve, undefined, reject);
});

function drawRing(context, ring, width, height) {
  if (!ring?.length) return;

  ring.forEach(([longitude, latitude], index) => {
    const x = ((longitude + 180) / 360) * width;
    const y = ((90 - latitude) / 180) * height;

    if (index === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  });
}

function drawCountryBorders(context, width, height) {
  const geometries = countriesData.features ?? [];

  geometries.forEach((feature) => {
    const { geometry } = feature;
    if (!geometry) return;

    if (geometry.type === 'Polygon') {
      geometry.coordinates.forEach((ring) => {
        context.beginPath();
        drawRing(context, ring, width, height);
        context.stroke();
      });
    }

    if (geometry.type === 'MultiPolygon') {
      geometry.coordinates.forEach((polygon) => {
        polygon.forEach((ring) => {
          context.beginPath();
          drawRing(context, ring, width, height);
          context.stroke();
        });
      });
    }
  });
}

function createEarthTexture(baseImage, isLight) {
  const canvas = document.createElement('canvas');
  canvas.width = 4096;
  canvas.height = 2048;

  const context = canvas.getContext('2d');
  if (!context) return null;

  context.filter = isLight ? 'contrast(1.04) saturate(0.92) brightness(1.06)' : 'contrast(1.16) saturate(1.08) brightness(0.92)';
  context.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
  context.filter = 'none';

  const oceanGlow = context.createRadialGradient(
    canvas.width * 0.34,
    canvas.height * 0.48,
    canvas.width * 0.04,
    canvas.width * 0.34,
    canvas.height * 0.48,
    canvas.width * 0.62,
  );
  oceanGlow.addColorStop(0, isLight ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)');
  oceanGlow.addColorStop(1, 'rgba(0,0,0,0)');
  context.fillStyle = oceanGlow;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.strokeStyle = isLight ? 'rgba(15, 23, 42, 0.34)' : 'rgba(255, 255, 255, 0.28)';
  context.lineWidth = 1.15;
  drawCountryBorders(context, canvas.width, canvas.height);

  context.strokeStyle = isLight ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.08)';
  context.lineWidth = 2.2;
  drawCountryBorders(context, canvas.width, canvas.height);

  const vignette = context.createRadialGradient(
    canvas.width * 0.5,
    canvas.height * 0.5,
    canvas.width * 0.12,
    canvas.width * 0.5,
    canvas.height * 0.5,
    canvas.width * 0.76,
  );
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, isLight ? 'rgba(15,23,42,0.08)' : 'rgba(0,0,0,0.16)');
  context.fillStyle = vignette;
  context.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.needsUpdate = true;

  return texture;
}

function createStars(count, radiusMin, radiusMax, color) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);

  for (let index = 0; index < count; index += 1) {
    const radius = THREE.MathUtils.randFloat(radiusMin, radiusMax);
    const theta = THREE.MathUtils.randFloat(0, Math.PI * 2);
    const phi = Math.acos(THREE.MathUtils.randFloatSpread(2));

    positions[index * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[index * 3 + 1] = radius * Math.cos(phi);
    positions[index * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  return new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      color,
      size: 0.11,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.78,
      depthWrite: false,
    }),
  );
}

export default function BackgroundScene() {
  const mountRef = useRef(null);
  const frameRef = useRef(null);
  const { isLight } = useTheme();

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 8.2);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const theme = isLight
      ? {
          ambient: '#f4fbff',
          directional: '#ffffff',
          rim: '#8bd6ff',
          atmosphere: '#dff6ff',
          stars: '#111827',
          ring: '#0f172a',
          bgGlowA: 'rgba(11, 15, 25, 0.05)',
          bgGlowB: 'rgba(56, 189, 248, 0.16)',
          specular: '#d4deea',
        }
      : {
          ambient: '#8fd3ff',
          directional: '#ffffff',
          rim: '#6ee7ff',
          atmosphere: '#41d5ff',
          stars: '#ffffff',
          ring: '#8be9ff',
          bgGlowA: 'rgba(57, 208, 255, 0.14)',
          bgGlowB: 'rgba(139, 92, 246, 0.16)',
          specular: '#9fc8ff',
        };

    const worldGroup = new THREE.Group();
    worldGroup.position.set(isLight ? 1.4 : 1.2, -0.38, 0);
    scene.add(worldGroup);

    const earthMaterial = new THREE.MeshPhongMaterial({
      color: '#ffffff',
      shininess: isLight ? 14 : 28,
      specular: new THREE.Color(theme.specular),
    });

    const earth = new THREE.Mesh(
      new THREE.SphereGeometry(2.12, 128, 128),
      earthMaterial,
    );
    worldGroup.add(earth);

    const cloudsMaterial = new THREE.MeshPhongMaterial({
      transparent: true,
      opacity: isLight ? 0.16 : 0.22,
      depthWrite: false,
    });

    const clouds = new THREE.Mesh(
      new THREE.SphereGeometry(2.17, 96, 96),
      cloudsMaterial,
    );
    worldGroup.add(clouds);

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(2.33, 96, 96),
      new THREE.MeshBasicMaterial({
        color: theme.atmosphere,
        transparent: true,
        opacity: isLight ? 0.05 : 0.09,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
      }),
    );
    worldGroup.add(atmosphere);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(3.15, 0.016, 16, 180),
      new THREE.MeshBasicMaterial({
        color: theme.ring,
        transparent: true,
        opacity: isLight ? 0.12 : 0.2,
      }),
    );
    ring.rotation.x = 1.12;
    ring.rotation.y = 0.3;
    worldGroup.add(ring);

    const secondaryRing = new THREE.Mesh(
      new THREE.TorusGeometry(3.55, 0.008, 16, 180),
      new THREE.MeshBasicMaterial({
        color: theme.ring,
        transparent: true,
        opacity: isLight ? 0.08 : 0.12,
      }),
    );
    secondaryRing.rotation.x = 0.24;
    secondaryRing.rotation.z = 0.65;
    worldGroup.add(secondaryRing);

    const starField = createStars(isLight ? 1400 : 1800, 10, 24, theme.stars);
    scene.add(starField);

    const ambientLight = new THREE.AmbientLight(theme.ambient, isLight ? 1.45 : 0.7);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(theme.directional, isLight ? 1.7 : 2.2);
    sunLight.position.set(6, 3.4, 8);
    scene.add(sunLight);

    const rimLight = new THREE.PointLight(theme.rim, isLight ? 5.2 : 8, 24, 2);
    rimLight.position.set(-4.8, -1.6, 4.2);
    scene.add(rimLight);

    const aura = document.createElement('div');
    aura.className = 'absolute inset-0';
    aura.style.background = isLight
      ? `radial-gradient(circle at 68% 44%, ${theme.bgGlowB} 0%, rgba(255,255,255,0) 26%),
         radial-gradient(circle at 22% 18%, rgba(255,255,255,0.94) 0%, rgba(255,255,255,0) 24%),
         radial-gradient(circle at 72% 76%, ${theme.bgGlowA} 0%, rgba(255,255,255,0) 20%)`
      : `radial-gradient(circle at 66% 42%, ${theme.bgGlowA} 0%, rgba(0,0,0,0) 24%),
         radial-gradient(circle at 22% 20%, ${theme.bgGlowB} 0%, rgba(0,0,0,0) 18%),
         radial-gradient(circle at 72% 78%, rgba(53,240,177,0.12) 0%, rgba(0,0,0,0) 20%)`;
    mount.appendChild(aura);

    const loader = new THREE.TextureLoader();
    const disposableTextures = [];
    let cancelled = false;

    Promise.all([
      loadImage(earthDayUrl),
      loadTexture(loader, earthNormalUrl),
      loadTexture(loader, earthSpecularUrl),
      loadTexture(loader, earthCloudsUrl),
    ]).then(([earthImage, normalMap, specularMap, cloudMap]) => {
      if (cancelled) return;

      const detailedEarth = createEarthTexture(earthImage, isLight);
      if (detailedEarth) {
        earthMaterial.map = detailedEarth;
        detailedEarth.colorSpace = THREE.SRGBColorSpace;
        disposableTextures.push(detailedEarth);
      }

      normalMap.wrapS = THREE.RepeatWrapping;
      normalMap.wrapT = THREE.ClampToEdgeWrapping;
      specularMap.wrapS = THREE.RepeatWrapping;
      specularMap.wrapT = THREE.ClampToEdgeWrapping;
      cloudMap.wrapS = THREE.RepeatWrapping;
      cloudMap.wrapT = THREE.ClampToEdgeWrapping;
      cloudMap.colorSpace = THREE.SRGBColorSpace;

      earthMaterial.normalMap = normalMap;
      earthMaterial.normalScale = new THREE.Vector2(0.8, 0.8);
      earthMaterial.specularMap = specularMap;
      cloudsMaterial.map = cloudMap;

      disposableTextures.push(normalMap, specularMap, cloudMap);

      earthMaterial.needsUpdate = true;
      cloudsMaterial.needsUpdate = true;
    }).catch(() => {
      if (cancelled) return;
      earthMaterial.color = new THREE.Color(isLight ? '#dbeafe' : '#0f172a');
    });

    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const drag = { active: false, startX: 0, startY: 0, offsetX: 0, offsetY: 0 };

    const handleMouseMove = (event) => {
      pointer.tx = (event.clientX / window.innerWidth - 0.5) * 2;
      pointer.ty = (event.clientY / window.innerHeight - 0.5) * 2;

      if (drag.active) {
        drag.offsetX += (event.clientX - drag.startX) * 0.0025;
        drag.offsetY += (event.clientY - drag.startY) * 0.0018;
        drag.startX = event.clientX;
        drag.startY = event.clientY;
      }
    };

    const handleMouseLeave = () => {
      pointer.tx = 0;
      pointer.ty = 0;
      drag.active = false;
    };

    const handleMouseDown = (event) => {
      drag.active = true;
      drag.startX = event.clientX;
      drag.startY = event.clientY;
    };

    const handleMouseUp = () => {
      drag.active = false;
    };

    const resize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);

      const mobile = width < 768;
      worldGroup.position.x = mobile ? 0.2 : isLight ? 1.4 : 1.2;
      worldGroup.position.y = mobile ? -0.18 : -0.38;
      camera.position.z = mobile ? 9.1 : 8.2;
      earth.position.y = mobile ? -0.1 : 0;
      clouds.position.y = mobile ? -0.1 : 0;
      atmosphere.position.y = mobile ? -0.1 : 0;
    };

    const clock = new THREE.Clock();

    const animate = () => {
      const elapsed = clock.getElapsedTime();

      pointer.x += (pointer.tx - pointer.x) * 0.035;
      pointer.y += (pointer.ty - pointer.y) * 0.035;

      drag.offsetX *= 0.995;
      drag.offsetY *= 0.995;

      earth.rotation.y = elapsed * 0.18 + pointer.x * 0.22 + drag.offsetX;
      earth.rotation.x = pointer.y * 0.08 + drag.offsetY;

      clouds.rotation.y = elapsed * 0.21 + 0.25 + pointer.x * 0.26 + drag.offsetX * 1.05;
      clouds.rotation.x = pointer.y * 0.09 + drag.offsetY * 1.05;

      ring.rotation.z = elapsed * 0.1 + pointer.x * 0.12;
      secondaryRing.rotation.y = elapsed * 0.08 - pointer.y * 0.12;

      worldGroup.rotation.z = Math.sin(elapsed * 0.35) * 0.04 + pointer.x * 0.08;
      worldGroup.rotation.x = Math.sin(elapsed * 0.22) * 0.05 + pointer.y * 0.12;

      camera.position.x = pointer.x * 0.35;
      camera.position.y = -pointer.y * 0.22;
      camera.lookAt(worldGroup.position.x * 0.65, 0, 0);

      starField.rotation.y = elapsed * 0.01;
      starField.rotation.x = Math.sin(elapsed * 0.04) * 0.02;

      renderer.render(scene, camera);
      frameRef.current = window.requestAnimationFrame(animate);
    };

    resize();
    animate();

      window.addEventListener('resize', resize);
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseleave', handleMouseLeave);
      window.addEventListener('mousedown', handleMouseDown);
      window.addEventListener('mouseup', handleMouseUp);

    return () => {
      cancelled = true;

      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);

      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
      }

      mount.removeChild(renderer.domElement);
      mount.removeChild(aura);

      earth.geometry.dispose();
      earth.material.dispose();
      clouds.geometry.dispose();
      clouds.material.dispose();
      atmosphere.geometry.dispose();
      atmosphere.material.dispose();
      ring.geometry.dispose();
      ring.material.dispose();
      secondaryRing.geometry.dispose();
      secondaryRing.material.dispose();
      starField.geometry.dispose();
      starField.material.dispose();
      disposableTextures.forEach((texture) => texture.dispose());
      renderer.dispose();
    };
  }, [isLight]);

  return (
    <div className="pointer-events-none fixed inset-0 -z-20 overflow-hidden">
      <div ref={mountRef} className="absolute inset-0" />
    </div>
  );
}
