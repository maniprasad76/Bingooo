import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  RotateCcw, ZoomIn, ZoomOut, Compass
} from 'lucide-react';
import {
  buildGarmentMesh,
  createCottonFabricBumpTexture,
  type GarmentModelType,
  type GarmentMeshPackage
} from './garmentMeshBuilder';
import { triggerHaptic } from '../../lib/native/capacitorBridge';
import { loadCanvasFont } from './studioFonts';

export interface Garment3DViewerProps {
  garmentId: string;
  color: string;
  viewSide: 'FRONT' | 'BACK';
  customText: string;
  fontFamily: string;
  textColor: string;
  letterSpacing?: string;
  isBold?: boolean;
  isItalic?: boolean;
  isUppercase?: boolean;
  uploadedImage: string | null;
  designMode: 'upload' | 'text';
  dragXVal?: number;
  dragYVal?: number;
  zoomScale?: number;
  rotation?: number;
  onViewSideChange?: (side: 'FRONT' | 'BACK') => void;
}

type LightingPreset = 'atelier' | 'cyber' | 'minimal';

export function Garment3DViewer({
  garmentId,
  color,
  viewSide,
  customText,
  fontFamily,
  textColor,
  letterSpacing = '0.05em',
  isBold = false,
  isItalic = false,
  isUppercase = false,
  uploadedImage,
  designMode,
  dragXVal = 0,
  dragYVal = 0,
  zoomScale = 1,
  rotation = 0,
  onViewSideChange,
}: Garment3DViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [lightingPreset, setLightingPreset] = useState<LightingPreset>('atelier');
  const [cameraDistance, setCameraDistance] = useState<number>(4.8);

  // References to keep Three.js instances alive across state updates
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const currentGarmentRef = useRef<GarmentMeshPackage | null>(null);
  const bumpTextureRef = useRef<THREE.CanvasTexture | null>(null);
  const lightsRef = useRef<{
    ambient: THREE.AmbientLight;
    keyLight: THREE.DirectionalLight;
    rimLight: THREE.DirectionalLight;
  } | null>(null);

  // Rotation & Drag state
  const isDraggingRef = useRef(false);
  const prevMousePosRef = useRef({ x: 0, y: 0 });
  const garmentRotationRef = useRef({ x: 0, y: 0 });
  const animFrameIdRef = useRef<number | null>(null);

  // Texture canvas for decals
  const textureCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const activeTextureRef = useRef<THREE.CanvasTexture | null>(null);

  // Map garmentId to model type
  const modelType: GarmentModelType =
    garmentId === 'tshirt' ? 'tshirt' : garmentId === 'hoodie' ? 'hoodie' : 'oversized';

  /**
   * Helper to draw text or uploaded artwork to dynamic decal texture
   */
  const updateDecalTexture = useCallback(() => {
    if (!textureCanvasRef.current) {
      textureCanvasRef.current = document.createElement('canvas');
      textureCanvasRef.current.width = 512;
      textureCanvasRef.current.height = 512;
    }

    const canvas = textureCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, 512, 512);

    const centerX = 256 + (dragXVal || 0) * 1.2;
    const centerY = 256 + (dragYVal || 0) * 1.2;
    const scale = Math.max(0.2, zoomScale || 1);
    const rad = ((rotation || 0) * Math.PI) / 180;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rad);
    ctx.scale(scale, scale);

    if (designMode === 'upload' && uploadedImage) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.drawImage(img, -140, -140, 280, 280);
        if (activeTextureRef.current) {
          activeTextureRef.current.needsUpdate = true;
        }
      };
      img.src = uploadedImage;
    } else {
      // Custom Typography
      const displayFont = fontFamily || 'sans-serif';
      const weight = isBold ? 'bold ' : 'normal ';
      const style = isItalic ? 'italic ' : '';
      const textToRender = (isUppercase ? customText.toUpperCase() : customText) || 'BINGOOO.';

      ctx.font = `${style}${weight}48px ${displayFont}`;
      ctx.fillStyle = textColor || '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 6;
      ctx.fillText(textToRender, 0, 0);
    }

    ctx.restore();

    if (!activeTextureRef.current) {
      activeTextureRef.current = new THREE.CanvasTexture(canvas);
      activeTextureRef.current.needsUpdate = true;
    } else {
      activeTextureRef.current.needsUpdate = true;
    }

    // Apply active texture to garment decal meshes
    if (currentGarmentRef.current) {
      const targetMesh =
        viewSide === 'FRONT'
          ? currentGarmentRef.current.decalMeshFront
          : currentGarmentRef.current.decalMeshBack;

      const otherMesh =
        viewSide === 'FRONT'
          ? currentGarmentRef.current.decalMeshBack
          : currentGarmentRef.current.decalMeshFront;

      const targetMat = targetMesh.material as THREE.MeshBasicMaterial;
      targetMat.map = activeTextureRef.current;
      targetMat.needsUpdate = true;
      targetMesh.visible = true;

      const otherMat = otherMesh.material as THREE.MeshBasicMaterial;
      otherMat.map = null;
      otherMesh.visible = false;
    }
  }, [
    customText,
    fontFamily,
    textColor,
    letterSpacing,
    isBold,
    isItalic,
    isUppercase,
    uploadedImage,
    designMode,
    dragXVal,
    dragYVal,
    zoomScale,
    rotation,
    viewSide,
  ]);

  // Initial Scene Setup
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 450;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, cameraDistance);
    cameraRef.current = camera;

    // WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    // Bump Texture
    const bumpTexture = createCottonFabricBumpTexture();
    bumpTextureRef.current = bumpTexture;

    // Lighting
    const ambient = new THREE.AmbientLight(0xfbf8f2, 0.75);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.35);
    keyLight.position.set(4, 5, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xe6321c, 0.4);
    rimLight.position.set(-4, -2, -4);
    scene.add(rimLight);

    lightsRef.current = { ambient, keyLight, rimLight };

    // Build initial garment
    const garment = buildGarmentMesh(modelType, color, bumpTexture);
    currentGarmentRef.current = garment;
    scene.add(garment.group);

    // Sync orientation with viewSide
    garmentRotationRef.current.y = viewSide === 'BACK' ? Math.PI : 0;
    garment.group.rotation.y = garmentRotationRef.current.y;

    // Render loop
    const animate = () => {
      if (autoRotate && !isDraggingRef.current && currentGarmentRef.current) {
        garmentRotationRef.current.y += 0.007;
        currentGarmentRef.current.group.rotation.y = garmentRotationRef.current.y;
      }
      renderer.render(scene, camera);
      animFrameIdRef.current = requestAnimationFrame(animate);
    };
    animFrameIdRef.current = requestAnimationFrame(animate);

    // Resize observer
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      garment.dispose();
      bumpTexture.dispose();
      if (activeTextureRef.current) activeTextureRef.current.dispose();
      renderer.dispose();
    };
  }, []); // Run once on mount

  // React to garmentId or color change
  useEffect(() => {
    if (!sceneRef.current || !bumpTextureRef.current) return;

    if (currentGarmentRef.current) {
      sceneRef.current.remove(currentGarmentRef.current.group);
      currentGarmentRef.current.dispose();
    }

    const newGarment = buildGarmentMesh(modelType, color, bumpTextureRef.current);
    newGarment.group.rotation.y = garmentRotationRef.current.y;
    newGarment.group.rotation.x = garmentRotationRef.current.x;
    currentGarmentRef.current = newGarment;
    sceneRef.current.add(newGarment.group);

    updateDecalTexture();
  }, [modelType, color, updateDecalTexture]);

  // React to lighting preset change
  useEffect(() => {
    if (!lightsRef.current) return;
    const { ambient, keyLight, rimLight } = lightsRef.current;

    if (lightingPreset === 'atelier') {
      ambient.color.setHex(0xfbf8f2);
      ambient.intensity = 0.75;
      keyLight.color.setHex(0xffffff);
      keyLight.intensity = 1.35;
      rimLight.color.setHex(0xe6321c);
      rimLight.intensity = 0.45;
    } else if (lightingPreset === 'cyber') {
      ambient.color.setHex(0x1a1a2e);
      ambient.intensity = 0.6;
      keyLight.color.setHex(0x00d2ff);
      keyLight.intensity = 1.4;
      rimLight.color.setHex(0xe6321c);
      rimLight.intensity = 0.8;
    } else {
      // Minimal daylight
      ambient.color.setHex(0xffffff);
      ambient.intensity = 0.9;
      keyLight.color.setHex(0xffffff);
      keyLight.intensity = 1.1;
      rimLight.color.setHex(0xdddddd);
      rimLight.intensity = 0.25;
    }
  }, [lightingPreset]);

  // Update dynamic decal texture whenever customization parameters change.
  // Canvas text doesn't repaint when a web font finishes downloading, so draw
  // again once the selected font is ready.
  useEffect(() => {
    updateDecalTexture();
    if ((designMode === 'upload' && uploadedImage) || !fontFamily) return;
    let cancelled = false;
    const font = `${isItalic ? 'italic ' : ''}${isBold ? 'bold ' : 'normal '}48px ${fontFamily}`;
    loadCanvasFont(font).then(() => {
      if (!cancelled) updateDecalTexture();
    });
    return () => {
      cancelled = true;
    };
  }, [updateDecalTexture, designMode, uploadedImage, fontFamily, isBold, isItalic]);

  // Snap orientation on viewSide change from parent
  const snapToSide = (side: 'FRONT' | 'BACK') => {
    triggerHaptic('selection');
    setAutoRotate(false);
    garmentRotationRef.current.x = 0;
    garmentRotationRef.current.y = side === 'BACK' ? Math.PI : 0;
    if (currentGarmentRef.current) {
      currentGarmentRef.current.group.rotation.x = 0;
      currentGarmentRef.current.group.rotation.y = garmentRotationRef.current.y;
    }
    if (onViewSideChange) onViewSideChange(side);
  };

  // Mouse & Touch Orbit Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    prevMousePosRef.current = { x: e.clientX, y: e.clientY };
    setAutoRotate(false);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !currentGarmentRef.current) return;

    const deltaX = e.clientX - prevMousePosRef.current.x;
    const deltaY = e.clientY - prevMousePosRef.current.y;

    garmentRotationRef.current.y += deltaX * 0.009;
    garmentRotationRef.current.x = Math.max(
      -0.4,
      Math.min(0.4, garmentRotationRef.current.x + deltaY * 0.009)
    );

    currentGarmentRef.current.group.rotation.y = garmentRotationRef.current.y;
    currentGarmentRef.current.group.rotation.x = garmentRotationRef.current.x;

    prevMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!cameraRef.current) return;
    const newDist = Math.max(3.0, Math.min(7.0, cameraDistance + e.deltaY * 0.004));
    setCameraDistance(newDist);
    cameraRef.current.position.z = newDist;
  };

  return (
    <div className="relative w-full h-full min-h-[460px] flex items-center justify-center select-none overflow-hidden rounded-3xl bg-gradient-to-b from-[#1a1917] via-[#141414] to-[#0e0e0e] border border-[#2b2926] shadow-2xl">
      {/* Three.js Canvas Mount */}
      <div
        ref={mountRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onWheel={handleWheel}
        className="w-full h-full cursor-grab active:cursor-grabbing touch-none flex items-center justify-center"
      />

      {/* Top Left: 3D Studio Live Badge & View Side Quick-Snap */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white text-[9px] font-bold tracking-widest uppercase">
          <span className="w-2 h-2 rounded-full bg-[#E6321C] animate-pulse" />
          Three.js 3D Studio
        </div>

        <div className="flex gap-1 bg-[#171717]/90 backdrop-blur-md p-1 rounded-xl border border-[#333]">
          <button
            type="button"
            onClick={() => snapToSide('FRONT')}
            className={`px-3 py-1 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${viewSide === 'FRONT' ? 'bg-[#E6321C] text-white shadow-sm' : 'text-[#888] hover:text-white'}`}
          >
            Front
          </button>
          <button
            type="button"
            onClick={() => snapToSide('BACK')}
            className={`px-3 py-1 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${viewSide === 'BACK' ? 'bg-[#E6321C] text-white shadow-sm' : 'text-[#888] hover:text-white'}`}
          >
            Back
          </button>
        </div>
      </div>

      {/* Top Right: Orbit & Lighting Atmosphere Controls */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-[#171717]/90 backdrop-blur-md p-1.5 rounded-2xl border border-[#333] shadow-md">
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            setAutoRotate(prev => !prev);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer ${autoRotate ? 'bg-[#E6321C] text-white shadow-sm' : 'text-[#888] hover:text-white bg-[#222]'}`}
          title="Toggle 360° Turntable Orbit"
        >
          <Compass size={12} className={autoRotate ? 'animate-spin' : ''} />
          <span>{autoRotate ? 'Orbit On' : 'Orbit Off'}</span>
        </button>

        <div className="h-4 w-px bg-[#333] mx-0.5" />

        {/* Lighting Selector */}
        <div className="flex items-center gap-1">
          {(['atelier', 'cyber', 'minimal'] as LightingPreset[]).map(preset => (
            <button
              key={preset}
              type="button"
              onClick={() => {
                triggerHaptic('selection');
                setLightingPreset(preset);
              }}
              className={`px-2 py-1 rounded-lg text-[8px] font-bold uppercase tracking-wider transition-all cursor-pointer ${lightingPreset === preset ? 'bg-white text-[#171717]' : 'text-[#777] hover:text-white'}`}
              title={`Preset: ${preset}`}
            >
              {preset === 'atelier' ? 'Warm' : preset === 'cyber' ? 'Cyber' : 'Clean'}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Center: Gesture Instructions */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 px-4 py-2 rounded-full bg-[#171717]/85 backdrop-blur-md border border-[#333] text-[9px] font-medium text-[#aaa] pointer-events-none">
        <span className="flex items-center gap-1">
          <RotateCcw size={11} className="text-[#E6321C]" /> Drag to Orbit 360°
        </span>
        <span className="w-1 h-1 rounded-full bg-[#444]" />
        <span className="flex items-center gap-1">
          <ZoomIn size={11} className="text-[#E6321C]" /> Pinch / Scroll to Zoom
        </span>
      </div>

      {/* Bottom Right: Quick Zoom +/- Buttons */}
      <div className="absolute bottom-4 right-4 z-20 hidden sm:flex items-center gap-1 bg-[#171717]/90 backdrop-blur-md p-1 rounded-xl border border-[#333]">
        <button
          type="button"
          onClick={() => {
            if (!cameraRef.current) return;
            const newDist = Math.min(7.0, cameraDistance + 0.5);
            setCameraDistance(newDist);
            cameraRef.current.position.z = newDist;
          }}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-[#aaa] hover:text-white hover:bg-[#252525] cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut size={13} />
        </button>
        <button
          type="button"
          onClick={() => {
            if (!cameraRef.current) return;
            const newDist = Math.max(3.0, cameraDistance - 0.5);
            setCameraDistance(newDist);
            cameraRef.current.position.z = newDist;
          }}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-[#aaa] hover:text-white hover:bg-[#252525] cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn size={13} />
        </button>
      </div>
    </div>
  );
}
