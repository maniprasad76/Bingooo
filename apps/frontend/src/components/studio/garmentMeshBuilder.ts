import * as THREE from 'three';

export type GarmentModelType = 'oversized' | 'tshirt' | 'hoodie';

/**
 * Generates a subtle procedural bump texture simulating 240–280 GSM combed cotton weave.
 */
export function createCottonFabricBumpTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 256, 256);

    // Fine weave cross-hatch pattern
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    for (let x = 0; x < 256; x += 4) {
      for (let y = 0; y < 256; y += 4) {
        if ((x + y) % 8 === 0) {
          ctx.fillRect(x, y, 2, 2);
        }
      }
    }

    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    for (let x = 2; x < 256; x += 4) {
      for (let y = 2; y < 256; y += 4) {
        if ((x + y) % 8 === 0) {
          ctx.fillRect(x, y, 2, 2);
        }
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(12, 12);
  texture.needsUpdate = true;
  return texture;
}

export interface GarmentMeshPackage {
  group: THREE.Group;
  decalMeshFront: THREE.Mesh;
  decalMeshBack: THREE.Mesh;
  bodyMaterials: THREE.MeshStandardMaterial[];
  dispose: () => void;
}

/**
 * Builds the complete 3D garment hierarchy with body, sleeves, collar, details,
 * and designated front/back decal planes for typography and artwork projection.
 */
export function buildGarmentMesh(
  type: GarmentModelType,
  baseHexColor: string,
  bumpTexture: THREE.CanvasTexture
): GarmentMeshPackage {
  const group = new THREE.Group();
  const geometries: THREE.BufferGeometry[] = [];
  const bodyMaterials: THREE.MeshStandardMaterial[] = [];

  const mainColor = new THREE.Color(baseHexColor);

  // High-density combed cotton fabric material
  const fabricMaterial = new THREE.MeshStandardMaterial({
    color: mainColor,
    roughness: 0.88,
    metalness: 0.02,
    bumpMap: bumpTexture,
    bumpScale: 0.003,
    side: THREE.DoubleSide,
  });
  bodyMaterials.push(fabricMaterial);

  // Subtle ribbing material for collar, cuffs, hem
  const ribbingMaterial = new THREE.MeshStandardMaterial({
    color: mainColor.clone().multiplyScalar(0.96),
    roughness: 0.94,
    metalness: 0.01,
    bumpMap: bumpTexture,
    bumpScale: 0.006,
    side: THREE.DoubleSide,
  });
  bodyMaterials.push(ribbingMaterial);

  const isOversized = type === 'oversized';
  const isHoodie = type === 'hoodie';

  // 1. Torso Geometry
  const bodyWidth = isOversized ? 2.3 : isHoodie ? 2.35 : 2.05;
  const bodyHeight = isHoodie ? 2.7 : 2.5;
  const bodyDepth = isHoodie ? 0.95 : 0.75;

  const torsoGeo = new THREE.BoxGeometry(bodyWidth, bodyHeight, bodyDepth, 16, 16, 8);
  geometries.push(torsoGeo);

  // Add subtle organic curve and drape to torso vertices
  const pos = torsoGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);

    // Taper slightly from chest to hem for boxy cut
    const taper = isOversized ? 1.0 : 1.0 - (y + 1.25) * 0.03;
    // Front/back drape curvature
    const curveZ = Math.cos(x * 1.1) * (z > 0 ? 0.08 : -0.06);

    pos.setXYZ(i, x * taper, y, z + curveZ);
  }
  torsoGeo.computeVertexNormals();

  const torsoMesh = new THREE.Mesh(torsoGeo, fabricMaterial);
  torsoMesh.castShadow = true;
  torsoMesh.receiveShadow = true;
  group.add(torsoMesh);

  // 2. Collar / Crewneck Ribbing
  if (!isHoodie) {
    const collarGeo = new THREE.TorusGeometry(0.48, 0.07, 12, 32);
    geometries.push(collarGeo);
    collarGeo.rotateX(Math.PI / 2);
    collarGeo.scale(1.1, 1.0, 0.9);
    const collarMesh = new THREE.Mesh(collarGeo, ribbingMaterial);
    collarMesh.position.set(0, bodyHeight / 2 - 0.02, 0);
    collarMesh.castShadow = true;
    group.add(collarMesh);
  } else {
    // 3. Hoodie Hood Structure
    const hoodGeo = new THREE.TorusGeometry(0.68, 0.32, 16, 32, Math.PI * 1.35);
    geometries.push(hoodGeo);
    hoodGeo.rotateX(Math.PI * 0.35);
    hoodGeo.rotateZ(-Math.PI * 0.17);
    const hoodMesh = new THREE.Mesh(hoodGeo, fabricMaterial);
    hoodMesh.position.set(0, bodyHeight / 2 + 0.35, -0.15);
    hoodMesh.scale.set(1.1, 1.35, 1.1);
    hoodMesh.castShadow = true;
    group.add(hoodMesh);

    // Kangaroo Pouch Pocket on Front
    const pocketGeo = new THREE.BoxGeometry(1.45, 0.75, 0.12, 10, 8, 2);
    geometries.push(pocketGeo);
    const pocketMesh = new THREE.Mesh(pocketGeo, fabricMaterial);
    pocketMesh.position.set(0, -0.45, bodyDepth / 2 + 0.08);
    pocketMesh.castShadow = true;
    pocketMesh.receiveShadow = true;
    group.add(pocketMesh);

    // Drawstrings
    const stringGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.75, 8);
    geometries.push(stringGeo);
    const stringMat = new THREE.MeshStandardMaterial({ color: 0xefefef, roughness: 0.9 });
    bodyMaterials.push(stringMat);

    const leftString = new THREE.Mesh(stringGeo, stringMat);
    leftString.position.set(-0.25, 0.65, bodyDepth / 2 + 0.1);
    leftString.rotation.z = 0.05;
    group.add(leftString);

    const rightString = new THREE.Mesh(stringGeo, stringMat);
    rightString.position.set(0.25, 0.65, bodyDepth / 2 + 0.1);
    rightString.rotation.z = -0.05;
    group.add(rightString);
  }

  // 4. Sleeves
  const sleeveLength = isOversized ? 1.25 : isHoodie ? 1.6 : 1.1;
  const sleeveRadius = isOversized ? 0.44 : isHoodie ? 0.46 : 0.38;

  // Left Sleeve
  const leftSleeveGeo = new THREE.CylinderGeometry(sleeveRadius * 0.9, sleeveRadius * 1.1, sleeveLength, 16);
  geometries.push(leftSleeveGeo);
  leftSleeveGeo.rotateZ(Math.PI * 0.28);
  const leftSleeve = new THREE.Mesh(leftSleeveGeo, fabricMaterial);
  leftSleeve.position.set(-(bodyWidth / 2 + sleeveLength * 0.35), bodyHeight / 2 - 0.42, 0);
  leftSleeve.castShadow = true;
  group.add(leftSleeve);

  // Right Sleeve
  const rightSleeveGeo = new THREE.CylinderGeometry(sleeveRadius * 0.9, sleeveRadius * 1.1, sleeveLength, 16);
  geometries.push(rightSleeveGeo);
  rightSleeveGeo.rotateZ(-Math.PI * 0.28);
  const rightSleeve = new THREE.Mesh(rightSleeveGeo, fabricMaterial);
  rightSleeve.position.set(bodyWidth / 2 + sleeveLength * 0.35, bodyHeight / 2 - 0.42, 0);
  rightSleeve.castShadow = true;
  group.add(rightSleeve);

  // Ribbed Hem Band at Bottom
  const hemGeo = new THREE.BoxGeometry(bodyWidth * 1.01, 0.22, bodyDepth * 1.01);
  geometries.push(hemGeo);
  const hemMesh = new THREE.Mesh(hemGeo, ribbingMaterial);
  hemMesh.position.set(0, -bodyHeight / 2 + 0.1, 0);
  hemMesh.castShadow = true;
  group.add(hemMesh);

  // 5. Decal Projection Planes (Front & Back)
  // Transparent planes aligned directly in front of and behind the garment chest
  const decalFrontGeo = new THREE.PlaneGeometry(1.35, 1.45);
  geometries.push(decalFrontGeo);
  const decalFrontMat = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 1,
    side: THREE.FrontSide,
    depthWrite: false,
  });
  const decalMeshFront = new THREE.Mesh(decalFrontGeo, decalFrontMat);
  decalMeshFront.position.set(0, isHoodie ? 0.32 : 0.18, bodyDepth / 2 + 0.045);
  group.add(decalMeshFront);

  const decalBackGeo = new THREE.PlaneGeometry(1.35, 1.45);
  geometries.push(decalBackGeo);
  const decalBackMat = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 1,
    side: THREE.FrontSide,
    depthWrite: false,
  });
  const decalMeshBack = new THREE.Mesh(decalBackGeo, decalBackMat);
  decalMeshBack.rotation.y = Math.PI;
  decalMeshBack.position.set(0, 0.18, -(bodyDepth / 2 + 0.045));
  group.add(decalMeshBack);

  return {
    group,
    decalMeshFront,
    decalMeshBack,
    bodyMaterials,
    dispose: () => {
      geometries.forEach(g => g.dispose());
      bodyMaterials.forEach(m => m.dispose());
      decalFrontMat.dispose();
      decalBackMat.dispose();
    },
  };
}
