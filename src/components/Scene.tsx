"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Scene() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- Renderer ---
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.appendChild(renderer.domElement);

    // --- Scene & Camera ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05020e, 0.02);

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      200
    );
    camera.position.set(0, 0, 8);

    // --- Lights ---
    const ambientLight = new THREE.AmbientLight(0x1a1a2e, 0.6);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x6366f1, 100, 50);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xec4899, 80, 50);
    pointLight2.position.set(-5, -3, 3);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0x06b6d4, 60, 50);
    pointLight3.position.set(0, 5, -5);
    scene.add(pointLight3);

    const pointLight4 = new THREE.PointLight(0xf59e0b, 50, 40);
    pointLight4.position.set(3, -8, 2);
    scene.add(pointLight4);

    // --- Materials ---
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x8b5cf6,
      metalness: 0.1,
      roughness: 0.05,
      transmission: 0.92,
      thickness: 1.5,
      ior: 1.5,
      transparent: true,
      opacity: 0.85,
    });

    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
    });

    const emissiveMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e1b4b,
      emissive: 0x6366f1,
      emissiveIntensity: 0.4,
      metalness: 0.9,
      roughness: 0.1,
    });

    const pinkMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xec4899,
      metalness: 0.2,
      roughness: 0.1,
      transmission: 0.8,
      thickness: 1,
      ior: 1.4,
      transparent: true,
      opacity: 0.7,
    });

    const cyanMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x06b6d4,
      metalness: 0.3,
      roughness: 0.05,
      transmission: 0.85,
      thickness: 1.2,
      ior: 1.6,
      transparent: true,
      opacity: 0.75,
    });

    const goldMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xf59e0b,
      metalness: 0.8,
      roughness: 0.15,
      transparent: true,
      opacity: 0.9,
    });

    // =============================================
    // SECTION 1 — Hero: Central complex geometry
    // =============================================

    interface MeshConfig {
      mesh: THREE.Mesh | THREE.Group | THREE.Points;
      rotSpeed: THREE.Vector3;
      floatSpeed: number;
      floatAmp: number;
      baseY: number;
      baseX?: number;
    }
    const meshes: MeshConfig[] = [];

    // Central icosahedron (high detail)
    const icoGeo = new THREE.IcosahedronGeometry(1.3, 1);
    const icoMesh = new THREE.Mesh(icoGeo, glassMaterial);
    icoMesh.scale.set(0, 0, 0);
    scene.add(icoMesh);
    meshes.push({
      mesh: icoMesh,
      rotSpeed: new THREE.Vector3(0.003, 0.005, 0.002),
      floatSpeed: 0.8,
      floatAmp: 0.3,
      baseY: 0,
      baseX: 0,
    });

    // Nested wireframe icosahedrons (3 layers)
    [2.2, 3.0, 3.8].forEach((radius, i) => {
      const geo = new THREE.IcosahedronGeometry(radius, i === 2 ? 2 : 1);
      const mat = wireframeMaterial.clone();
      mat.opacity = 0.08 - i * 0.015;
      const mesh = new THREE.Mesh(geo, mat);
      mesh.scale.set(0, 0, 0);
      scene.add(mesh);
      meshes.push({
        mesh,
        rotSpeed: new THREE.Vector3(
          0.001 * (i + 1) * (i % 2 === 0 ? 1 : -1),
          0.002 * (i + 1) * (i % 2 === 0 ? -1 : 1),
          0.0015 * (i + 1)
        ),
        floatSpeed: 0.2,
        floatAmp: 0.05,
        baseY: 0,
        baseX: 0,
      });
    });

    // Torus knot — top right
    const torusKnotGeo = new THREE.TorusKnotGeometry(0.6, 0.18, 128, 32, 2, 3);
    const torusKnotMesh = new THREE.Mesh(torusKnotGeo, emissiveMaterial);
    torusKnotMesh.position.set(4, 2.2, -2);
    torusKnotMesh.scale.set(0, 0, 0);
    scene.add(torusKnotMesh);
    meshes.push({
      mesh: torusKnotMesh,
      rotSpeed: new THREE.Vector3(0.008, 0.006, 0.004),
      floatSpeed: 1.2,
      floatAmp: 0.4,
      baseY: 2.2,
      baseX: 4,
    });

    // Octahedron — bottom left
    const octaMesh = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.8, 0),
      pinkMaterial
    );
    octaMesh.position.set(-3.5, -1.8, -1);
    octaMesh.scale.set(0, 0, 0);
    scene.add(octaMesh);
    meshes.push({
      mesh: octaMesh,
      rotSpeed: new THREE.Vector3(0.006, 0.004, 0.008),
      floatSpeed: 1.0,
      floatAmp: 0.35,
      baseY: -1.8,
      baseX: -3.5,
    });

    // Torus — upper left
    const torusMesh = new THREE.Mesh(
      new THREE.TorusGeometry(0.7, 0.22, 32, 64),
      cyanMaterial
    );
    torusMesh.position.set(-4, 1.8, -1.5);
    torusMesh.scale.set(0, 0, 0);
    scene.add(torusMesh);
    meshes.push({
      mesh: torusMesh,
      rotSpeed: new THREE.Vector3(0.005, 0.007, 0.003),
      floatSpeed: 0.9,
      floatAmp: 0.25,
      baseY: 1.8,
      baseX: -4,
    });

    // Dodecahedron — right
    const dodecaMat = glassMaterial.clone();
    dodecaMat.color.set(0xa78bfa);
    const dodecaMesh = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.6, 0),
      dodecaMat
    );
    dodecaMesh.position.set(3.5, -2, -0.5);
    dodecaMesh.scale.set(0, 0, 0);
    scene.add(dodecaMesh);
    meshes.push({
      mesh: dodecaMesh,
      rotSpeed: new THREE.Vector3(0.004, 0.006, 0.005),
      floatSpeed: 1.1,
      floatAmp: 0.3,
      baseY: -2,
      baseX: 3.5,
    });

    // =============================================
    // DNA Double Helix
    // =============================================
    const helixGroup = new THREE.Group();
    const helixSphereGeo = new THREE.SphereGeometry(0.06, 8, 8);
    const helixBarGeo = new THREE.CylinderGeometry(0.02, 0.02, 1, 4);
    const helixCount = 80;

    for (let i = 0; i < helixCount; i++) {
      const t = i / helixCount;
      const angle = t * Math.PI * 6;
      const y = (t - 0.5) * 12;
      const radius = 1.0;

      // Strand A
      const sphereA = new THREE.Mesh(
        helixSphereGeo,
        i % 2 === 0 ? pinkMaterial.clone() : cyanMaterial.clone()
      );
      sphereA.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
      (sphereA.material as THREE.MeshPhysicalMaterial).opacity = 0.6;
      helixGroup.add(sphereA);

      // Strand B
      const sphereB = new THREE.Mesh(
        helixSphereGeo,
        i % 2 === 0 ? cyanMaterial.clone() : pinkMaterial.clone()
      );
      sphereB.position.set(
        Math.cos(angle + Math.PI) * radius,
        y,
        Math.sin(angle + Math.PI) * radius
      );
      (sphereB.material as THREE.MeshPhysicalMaterial).opacity = 0.6;
      helixGroup.add(sphereB);

      // Connecting bar every 4 nodes
      if (i % 4 === 0) {
        const bar = new THREE.Mesh(helixBarGeo, wireframeMaterial.clone());
        bar.position.set(0, y, 0);
        bar.lookAt(sphereA.position);
        bar.scale.y = radius * 2;
        (bar.material as THREE.MeshBasicMaterial).opacity = 0.08;
        helixGroup.add(bar);
      }
    }

    helixGroup.position.set(6, 0, -4);
    helixGroup.scale.set(0, 0, 0);
    scene.add(helixGroup);
    meshes.push({
      mesh: helixGroup,
      rotSpeed: new THREE.Vector3(0, 0.003, 0),
      floatSpeed: 0.4,
      floatAmp: 0.2,
      baseY: 0,
      baseX: 6,
    });

    // =============================================
    // Orbital Ring System
    // =============================================
    const ringGroup = new THREE.Group();

    // Three tilted rings
    [
      { radius: 2.0, tilt: 0.3, color: 0x6366f1 },
      { radius: 2.4, tilt: -0.5, color: 0xec4899 },
      { radius: 2.8, tilt: 0.8, color: 0x06b6d4 },
    ].forEach(({ radius, tilt, color }) => {
      const ringGeo = new THREE.TorusGeometry(radius, 0.015, 8, 128);
      const ringMat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.3,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2 + tilt;
      ring.rotation.z = tilt * 0.5;
      ringGroup.add(ring);
    });

    // Orbiting spheres
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const r = 2.0 + Math.random() * 0.8;
      const orbitSphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.04 + Math.random() * 0.06, 8, 8),
        new THREE.MeshStandardMaterial({
          emissive: [0x6366f1, 0xec4899, 0x06b6d4][i % 3],
          emissiveIntensity: 1,
          color: 0x000000,
        })
      );
      orbitSphere.position.set(
        Math.cos(angle) * r,
        (Math.random() - 0.5) * 0.5,
        Math.sin(angle) * r
      );
      ringGroup.add(orbitSphere);
    }

    ringGroup.position.set(-5.5, 0, -3);
    ringGroup.scale.set(0, 0, 0);
    scene.add(ringGroup);
    meshes.push({
      mesh: ringGroup,
      rotSpeed: new THREE.Vector3(0.002, 0.004, 0.001),
      floatSpeed: 0.6,
      floatAmp: 0.3,
      baseY: 0,
      baseX: -5.5,
    });

    // =============================================
    // Scattered tetrahedrons + small shapes
    // =============================================
    const scatterGeos = [
      new THREE.TetrahedronGeometry(0.15, 0),
      new THREE.OctahedronGeometry(0.12, 0),
      new THREE.IcosahedronGeometry(0.1, 0),
    ];
    const scatterPositions = [
      [2, 3, -3], [-2, -3, -2], [4.5, 0.5, -4], [-4, 2.5, -3],
      [1.5, -2.5, -2.5], [-1, 3.5, -3.5], [3.5, -0.5, -3], [-3, 0.5, -2.5],
      [0, 4, -4], [5, -2, -5], [-5, -1, -4], [2, -4, -3],
    ];
    scatterPositions.forEach((pos, i) => {
      const mat = wireframeMaterial.clone();
      mat.color.set([0x6366f1, 0xec4899, 0x06b6d4][i % 3]);
      mat.opacity = 0.15 + Math.random() * 0.15;
      const mesh = new THREE.Mesh(scatterGeos[i % scatterGeos.length], mat);
      mesh.position.set(pos[0], pos[1], pos[2]);
      mesh.scale.set(0, 0, 0);
      scene.add(mesh);
      meshes.push({
        mesh,
        rotSpeed: new THREE.Vector3(
          0.01 + Math.random() * 0.02,
          0.01 + Math.random() * 0.02,
          0.01 + Math.random() * 0.02
        ),
        floatSpeed: 0.5 + Math.random() * 1.5,
        floatAmp: 0.15 + Math.random() * 0.2,
        baseY: pos[1],
        baseX: pos[0],
      });
    });

    // =============================================
    // Parametric wave grid
    // =============================================
    const gridSize = 40;
    const gridSpacing = 0.5;
    const gridGeo = new THREE.BufferGeometry();
    const gridVertices: number[] = [];
    const gridColors: number[] = [];

    for (let x = 0; x < gridSize; x++) {
      for (let z = 0; z < gridSize; z++) {
        const px = (x - gridSize / 2) * gridSpacing;
        const pz = (z - gridSize / 2) * gridSpacing;
        gridVertices.push(px, 0, pz);
        const color = new THREE.Color().setHSL(0.7 + Math.random() * 0.15, 0.8, 0.5);
        gridColors.push(color.r, color.g, color.b);
      }
    }
    gridGeo.setAttribute("position", new THREE.Float32BufferAttribute(gridVertices, 3));
    gridGeo.setAttribute("color", new THREE.Float32BufferAttribute(gridColors, 3));
    const gridMat = new THREE.PointsMaterial({
      size: 0.04,
      vertexColors: true,
      transparent: true,
      opacity: 0.4,
      sizeAttenuation: true,
    });
    const gridPoints = new THREE.Points(gridGeo, gridMat);
    gridPoints.position.set(0, -6, -5);
    gridPoints.rotation.x = -0.3;
    scene.add(gridPoints);

    // =============================================
    // Section 2 — Morphing Sphere (vertex animation)
    // =============================================
    const morphGeo = new THREE.IcosahedronGeometry(1.5, 4);
    const morphMesh = new THREE.Mesh(morphGeo, emissiveMaterial.clone());
    (morphMesh.material as THREE.MeshStandardMaterial).emissive.set(0xec4899);
    (morphMesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.2;
    morphMesh.position.set(0, -18, 0);
    morphMesh.scale.set(0.5, 0.5, 0.5);
    scene.add(morphMesh);

    const morphOrigPositions = morphGeo.attributes.position.array.slice();

    // =============================================
    // Section 3 — Gold torus knot cluster
    // =============================================
    const clusterGroup = new THREE.Group();
    const knotConfigs = [
      { p: 2, q: 3, r: 0.8, tube: 0.25, pos: [0, 0, 0] },
      { p: 3, q: 5, r: 0.5, tube: 0.15, pos: [2, 1, -1] },
      { p: 2, q: 5, r: 0.4, tube: 0.12, pos: [-1.8, -0.8, 0.5] },
      { p: 3, q: 7, r: 0.35, tube: 0.1, pos: [1.2, -1.5, -0.8] },
      { p: 5, q: 2, r: 0.3, tube: 0.08, pos: [-1, 1.5, 1] },
    ];
    knotConfigs.forEach(({ p, q, r, tube, pos }) => {
      const geo = new THREE.TorusKnotGeometry(r, tube, 100, 16, p, q);
      const mat = [goldMaterial, glassMaterial, pinkMaterial, cyanMaterial, emissiveMaterial][
        knotConfigs.indexOf({ p, q, r, tube, pos }) % 5
      ] || goldMaterial.clone();
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(pos[0], pos[1], pos[2]);
      clusterGroup.add(mesh);
    });
    clusterGroup.position.set(0, -38, 0);
    scene.add(clusterGroup);

    // =============================================
    // Section 4 — Particle galaxy
    // =============================================
    const galaxyCount = 3000;
    const galaxyGeo = new THREE.BufferGeometry();
    const galaxyPositions = new Float32Array(galaxyCount * 3);
    const galaxyColorArr = new Float32Array(galaxyCount * 3);
    const galaxySizes = new Float32Array(galaxyCount);
    for (let i = 0; i < galaxyCount; i++) {
      const armAngle = ((i % 3) / 3) * Math.PI * 2;
      const dist = Math.random() * 6;
      const spin = dist * 0.8;
      const randomness = 0.3;
      galaxyPositions[i * 3] =
        Math.cos(armAngle + spin) * dist + (Math.random() - 0.5) * randomness * dist;
      galaxyPositions[i * 3 + 1] = (Math.random() - 0.5) * 0.5 * (1 - dist / 6);
      galaxyPositions[i * 3 + 2] =
        Math.sin(armAngle + spin) * dist + (Math.random() - 0.5) * randomness * dist;

      const mixRatio = dist / 6;
      const innerColor = new THREE.Color(0x6366f1);
      const outerColor = new THREE.Color(0xec4899);
      const c = innerColor.clone().lerp(outerColor, mixRatio);
      galaxyColorArr[i * 3] = c.r;
      galaxyColorArr[i * 3 + 1] = c.g;
      galaxyColorArr[i * 3 + 2] = c.b;
      galaxySizes[i] = Math.random() * 0.08 + 0.02;
    }
    galaxyGeo.setAttribute("position", new THREE.BufferAttribute(galaxyPositions, 3));
    galaxyGeo.setAttribute("color", new THREE.BufferAttribute(galaxyColorArr, 3));
    const galaxyMat = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
    });
    const galaxy = new THREE.Points(galaxyGeo, galaxyMat);
    galaxy.position.set(0, -58, 0);
    scene.add(galaxy);

    // =============================================
    // Background particles (always visible)
    // =============================================
    const particleCount = 800;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      particlePos[i * 3] = (Math.random() - 0.5) * 30;
      particlePos[i * 3 + 1] = (Math.random() - 0.5) * 80;
      particlePos[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x6366f1,
      size: 0.025,
      transparent: true,
      opacity: 0,
      sizeAttenuation: true,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // =============================================
    // GSAP Entrance Animations
    // =============================================
    meshes.forEach((cfg, i) => {
      gsap.to(cfg.mesh.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 1.4,
        delay: 0.1 * Math.min(i, 8),
        ease: "elastic.out(1, 0.5)",
      });
    });

    gsap.to(particleMat, {
      opacity: 0.6,
      duration: 3,
      delay: 0.5,
      ease: "power2.inOut",
    });

    // =============================================
    // Scroll-driven camera & scene transitions
    // =============================================
    const scrollState = { progress: 0 };

    // Section 1 → 2: Camera drops to morphing sphere
    ScrollTrigger.create({
      trigger: "#section-features",
      start: "top bottom",
      end: "bottom top",
      scrub: 1,
      onUpdate: (self) => {
        const p = self.progress;
        // Camera Y moves from 0 → -18
        gsap.set(camera.position, {
          y: p * -18,
          z: 8 - p * 3,
        });
        // Morph sphere scales up
        const s = 0.5 + p * 1.5;
        morphMesh.scale.set(s, s, s);
      },
    });

    // Section 2 → 3: Camera drops to torus knot cluster
    ScrollTrigger.create({
      trigger: "#section-showcase",
      start: "top bottom",
      end: "bottom top",
      scrub: 1,
      onUpdate: (self) => {
        const p = self.progress;
        gsap.set(camera.position, {
          y: -18 + p * -20,
          z: 5 + p * 2,
        });
        clusterGroup.rotation.y = p * Math.PI * 2;
      },
    });

    // Section 3 → 4: Camera drops to galaxy
    ScrollTrigger.create({
      trigger: "#section-cta",
      start: "top bottom",
      end: "bottom top",
      scrub: 1,
      onUpdate: (self) => {
        const p = self.progress;
        gsap.set(camera.position, {
          y: -38 + p * -20,
          z: 7 - p * 2,
        });
        galaxy.rotation.y = p * Math.PI;
      },
    });

    // =============================================
    // Mouse Interaction
    // =============================================
    const mouse = { x: 0, y: 0 };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // --- Resize ---
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    // =============================================
    // Animation Loop
    // =============================================
    const clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Rotate & float each mesh
      meshes.forEach((cfg) => {
        cfg.mesh.rotation.x += cfg.rotSpeed.x;
        cfg.mesh.rotation.y += cfg.rotSpeed.y;
        cfg.mesh.rotation.z += cfg.rotSpeed.z;
        cfg.mesh.position.y =
          cfg.baseY + Math.sin(elapsed * cfg.floatSpeed) * cfg.floatAmp;
      });

      // Slowly rotate particles
      particles.rotation.y = elapsed * 0.015;

      // Orbit lights
      pointLight1.position.x = 5 * Math.sin(elapsed * 0.3);
      pointLight1.position.z = 5 * Math.cos(elapsed * 0.3);
      pointLight2.position.x = -5 * Math.cos(elapsed * 0.2);
      pointLight2.position.z = 3 * Math.sin(elapsed * 0.2);
      pointLight3.position.y = camera.position.y + 5 * Math.sin(elapsed * 0.25);
      pointLight4.position.y = camera.position.y - 5;

      // Vertex morphing on the morphing sphere
      const morphPositions = morphGeo.attributes.position;
      for (let i = 0; i < morphPositions.count; i++) {
        const ox = morphOrigPositions[i * 3];
        const oy = morphOrigPositions[i * 3 + 1];
        const oz = morphOrigPositions[i * 3 + 2];
        const len = Math.sqrt(ox * ox + oy * oy + oz * oz);
        const noise =
          Math.sin(ox * 3 + elapsed * 1.5) *
          Math.sin(oy * 3 + elapsed * 1.2) *
          Math.sin(oz * 3 + elapsed * 0.8) *
          0.25;
        const scale = 1 + noise;
        morphPositions.setXYZ(
          i,
          (ox / len) * len * scale,
          (oy / len) * len * scale,
          (oz / len) * len * scale
        );
      }
      morphPositions.needsUpdate = true;
      morphGeo.computeVertexNormals();
      morphMesh.rotation.y = elapsed * 0.3;
      morphMesh.rotation.x = elapsed * 0.15;

      // Cluster rotation
      clusterGroup.children.forEach((child, i) => {
        child.rotation.x = elapsed * 0.2 * (i % 2 === 0 ? 1 : -1);
        child.rotation.z = elapsed * 0.15 * (i % 2 === 0 ? -1 : 1);
      });

      // Galaxy rotation
      galaxy.rotation.y += 0.001;

      // Wave grid animation
      const gridPositions = gridGeo.attributes.position;
      for (let i = 0; i < gridPositions.count; i++) {
        const x = gridPositions.getX(i);
        const z = gridPositions.getZ(i);
        const wave =
          Math.sin(x * 0.5 + elapsed * 1.5) * 0.3 +
          Math.sin(z * 0.5 + elapsed * 1.2) * 0.3 +
          Math.sin((x + z) * 0.3 + elapsed) * 0.2;
        gridPositions.setY(i, wave);
      }
      gridPositions.needsUpdate = true;

      // Camera mouse offset (additive, doesn't fight scroll)
      const targetCamX = mouse.x * 1.2;
      camera.position.x += (targetCamX - camera.position.x) * 0.02;
      const mouseYOffset = mouse.y * 0.6;
      camera.lookAt(camera.position.x * 0.3, camera.position.y + mouseYOffset, -2);

      renderer.render(scene, camera);
    };

    animate();

    // --- Cleanup ---
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      ScrollTrigger.getAll().forEach((t) => t.kill());
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0"
      style={{
        background:
          "radial-gradient(ellipse at center, #0f0b1a 0%, #050208 70%, #000000 100%)",
        zIndex: 0,
      }}
    />
  );
}
