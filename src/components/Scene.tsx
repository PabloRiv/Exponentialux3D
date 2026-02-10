"use client";

import { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export interface HotspotConfig {
  id: string;
  meshName: string;
  label: string;
  description: string;
}

export interface HotspotScreenPosition {
  id: string;
  x: number;
  y: number;
  visible: boolean;
}

export interface SceneHandle {
  playActuatorCycle: () => void;
  setCutawayEnabled: (enabled: boolean) => void;
  setCutawayPosition: (value: number) => void;
  setCutawayAxis: (axis: "x" | "y" | "z") => void;
  setExplodeEnabled: (enabled: boolean) => void;
  setExplodeIntensity: (value: number) => void;
}

interface SceneProps {
  hotspots?: HotspotConfig[];
  onHotspotPositions?: (positions: HotspotScreenPosition[]) => void;
}

const Scene = forwardRef<SceneHandle, SceneProps>(function Scene({ hotspots, onHotspotPositions }, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const actuatorActionRef = useRef<THREE.AnimationAction | null>(null);

  // Hotspot anchors — resolved on model load, just store mesh reference
  const hotspotAnchorsRef = useRef<{ id: string; mesh: THREE.Object3D }[]>([]);
  const onHotspotPositionsRef = useRef(onHotspotPositions);
  onHotspotPositionsRef.current = onHotspotPositions;

  // Cutaway clipping state — plane starts at 99999 (nothing clipped)
  const clippingPlaneRef = useRef(new THREE.Plane(new THREE.Vector3(-1, 0, 0), 99999));
  const cutawayEnabledRef = useRef(false);
  const cutawayAxisRef = useRef<"x" | "y" | "z">("x");
  const cutawayPositionRef = useRef(100); // slider value 0-100
  const modelBoundsRef = useRef({ min: new THREE.Vector3(), max: new THREE.Vector3() });

  // Explode state
  const explodeDataRef = useRef<{ object: THREE.Object3D; originalPos: THREE.Vector3; direction: THREE.Vector3 }[]>([]);
  const explodeEnabledRef = useRef(false);
  const explodeIntensityRef = useRef(0);
  const explodeRadiusRef = useRef(1);

  const playActuatorCycle = useCallback(() => {
    const action = actuatorActionRef.current;
    if (!action) return;
    action.reset();
    action.setLoop(THREE.LoopOnce, 1);
    action.clampWhenFinished = true;
    action.play();
  }, []);

  const updateClippingPlaneNormal = useCallback((axis: "x" | "y" | "z") => {
    const plane = clippingPlaneRef.current;
    const normal = new THREE.Vector3(
      axis === "x" ? -1 : 0,
      axis === "y" ? -1 : 0,
      axis === "z" ? -1 : 0
    );
    plane.normal.copy(normal);
  }, []);

  const applyPlaneConstant = useCallback((sliderValue: number) => {
    const plane = clippingPlaneRef.current;
    const bounds = modelBoundsRef.current;
    const axis = cutawayAxisRef.current;
    const minVal = axis === "x" ? bounds.min.x : axis === "y" ? bounds.min.y : bounds.min.z;
    const maxVal = axis === "x" ? bounds.max.x : axis === "y" ? bounds.max.y : bounds.max.z;
    plane.constant = minVal + (sliderValue / 100) * (maxVal - minVal);
  }, []);

  const setCutawayEnabled = useCallback((enabled: boolean) => {
    cutawayEnabledRef.current = enabled;
    if (enabled) {
      applyPlaneConstant(cutawayPositionRef.current);
    } else {
      clippingPlaneRef.current.constant = 99999;
    }
  }, [applyPlaneConstant]);

  const setCutawayPosition = useCallback((value: number) => {
    cutawayPositionRef.current = value;
    if (cutawayEnabledRef.current) {
      applyPlaneConstant(value);
    }
  }, [applyPlaneConstant]);

  const setCutawayAxis = useCallback((axis: "x" | "y" | "z") => {
    cutawayAxisRef.current = axis;
    updateClippingPlaneNormal(axis);
    cutawayPositionRef.current = 100;
    if (cutawayEnabledRef.current) {
      applyPlaneConstant(100);
    }
  }, [updateClippingPlaneNormal, applyPlaneConstant]);

  const applyExplodePositions = useCallback((intensity: number) => {
    const data = explodeDataRef.current;
    const radius = explodeRadiusRef.current;
    data.forEach(({ object, originalPos, direction }) => {
      const offset = direction.clone().multiplyScalar((intensity / 100) * radius);
      const target = originalPos.clone().add(offset);
      gsap.to(object.position, {
        x: target.x,
        y: target.y,
        z: target.z,
        duration: 0.5,
        ease: "power2.out",
      });
    });
  }, []);

  const setExplodeEnabled = useCallback((enabled: boolean) => {
    explodeEnabledRef.current = enabled;
    if (enabled) {
      applyExplodePositions(explodeIntensityRef.current);
    } else {
      // Animate all children back to original positions
      explodeDataRef.current.forEach(({ object, originalPos }) => {
        gsap.to(object.position, {
          x: originalPos.x,
          y: originalPos.y,
          z: originalPos.z,
          duration: 0.5,
          ease: "power2.out",
        });
      });
      explodeIntensityRef.current = 0;
    }
  }, [applyExplodePositions]);

  const setExplodeIntensity = useCallback((value: number) => {
    explodeIntensityRef.current = value;
    if (explodeEnabledRef.current) {
      applyExplodePositions(value);
    }
  }, [applyExplodePositions]);

  useImperativeHandle(ref, () => ({
    playActuatorCycle,
    setCutawayEnabled,
    setCutawayPosition,
    setCutawayAxis,
    setExplodeEnabled,
    setExplodeIntensity,
  }), [playActuatorCycle, setCutawayEnabled, setCutawayPosition, setCutawayAxis, setExplodeEnabled, setExplodeIntensity]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- Renderer ---
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    renderer.localClippingEnabled = true;
    container.appendChild(renderer.domElement);

    // --- Scene & Camera ---
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      500
    );
    camera.position.set(0, 2, 10);

    // --- Lights ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    const pointLight1 = new THREE.PointLight(0x6366f1, 60, 40);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xec4899, 40, 40);
    pointLight2.position.set(-5, -3, 3);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0x06b6d4, 30, 40);
    pointLight3.position.set(0, 5, -5);
    scene.add(pointLight3);

    // --- Load GLB Model ---
    let model: THREE.Group | null = null;

    const loader = new GLTFLoader();
    loader.load(
      "/model.glb",
      (gltf) => {
        model = gltf.scene;

        // Center and scale the model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 5 / maxDim;

        model.scale.setScalar(scale);
        model.position.sub(center.multiplyScalar(scale));
        model.position.y = 0;

        // Compute world-space bounding box for cutaway mapping
        const worldBox = new THREE.Box3().setFromObject(model);
        // Store scaled bounds for cutaway slider mapping
        modelBoundsRef.current.min.copy(worldBox.min);
        modelBoundsRef.current.max.copy(worldBox.max);

        // Compute explode data — drill into hierarchy until we find 2+ children
        const bboxSize = worldBox.getSize(new THREE.Vector3());
        explodeRadiusRef.current = bboxSize.length() * 0.5;

        let explodeParent: THREE.Object3D = model;
        while (explodeParent.children.length === 1 && explodeParent.children[0].children.length > 0) {
          explodeParent = explodeParent.children[0];
        }
        const parts = explodeParent.children;

        // Compute the centroid of all parts (in parent-local space) so directions radiate from center
        const centroid = new THREE.Vector3();
        const partCenters: THREE.Vector3[] = [];
        for (const part of parts) {
          const partBox = new THREE.Box3().setFromObject(part);
          const c = partBox.getCenter(new THREE.Vector3());
          // Convert world-space center to the explodeParent's local space
          explodeParent.worldToLocal(c);
          partCenters.push(c);
          centroid.add(c);
        }
        if (parts.length > 0) centroid.divideScalar(parts.length);

        const explodeData: typeof explodeDataRef.current = [];
        for (let i = 0; i < parts.length; i++) {
          const part = parts[i];
          const dir = partCenters[i].clone().sub(centroid);
          if (dir.lengthSq() < 0.0001) {
            dir.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
          }
          dir.normalize();
          explodeData.push({
            object: part,
            originalPos: part.position.clone(),
            direction: dir,
          });
        }
        explodeDataRef.current = explodeData;

        // Traverse all meshes: attach clipping plane and set DoubleSide
        // Plane is attached NOW (before first render) so the shader compiles with clipping support.
        // Plane constant starts at 99999 so nothing is clipped until user enables cutaway.
        const clipPlane = clippingPlaneRef.current;
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            mats.forEach((mat) => {
              mat.side = THREE.DoubleSide;
              mat.clippingPlanes = [clipPlane];
            });
          }
        });

        // Resolve hotspot anchors — just store mesh references
        if (hotspots && hotspots.length > 0) {
          const anchors: typeof hotspotAnchorsRef.current = [];
          hotspots.forEach((hs) => {
            let targetMesh: THREE.Object3D | null = null;
            model!.traverse((child) => {
              if (child.name === hs.meshName) targetMesh = child;
            });
            if (targetMesh) {
              anchors.push({ id: hs.id, mesh: targetMesh });
            }
          });
          hotspotAnchorsRef.current = anchors;
        }

        // Start invisible for entrance animation
        model.scale.set(0, 0, 0);
        scene.add(model);

        console.log({"Animations in GLTF": gltf.animations.map((c) => c.name)});

        // Set up animation mixer
        if (gltf.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(model);
          mixerRef.current = mixer;

          // Log available animations for debugging
          console.log(
            "Available animations:",
            gltf.animations.map((c) => c.name)
          );

          // Find and store Actuator_Cycle action (don't auto-play)
          const actuatorClip = gltf.animations.find(
            (clip) => clip.name === "Actuator_Cycle"
          );
          if (actuatorClip) {
            const action = mixer.clipAction(actuatorClip);
            action.setLoop(THREE.LoopOnce, 1);
            action.clampWhenFinished = true;
            actuatorActionRef.current = action;
          }
        }

        // Entrance animation
        gsap.to(model.scale, {
          x: scale,
          y: scale,
          z: scale,
          duration: 1.8,
          ease: "elastic.out(1, 0.5)",
          delay: 0.3,
        });

        gsap.from(model.rotation, {
          y: -Math.PI,
          duration: 2,
          ease: "power3.out",
          delay: 0.3,
        });

        // --- Scroll-driven model transforms ---
        ScrollTrigger.create({
          trigger: "#section-features",
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
          onUpdate: (self) => {
            if (!model) return;
            const p = self.progress;
            model.rotation.y = p * Math.PI * 2;
            camera.position.z = 10 - p * 4;
            camera.position.y = 2 - p * 1;
          },
        });

        ScrollTrigger.create({
          trigger: "#section-showcase",
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
          onUpdate: (self) => {
            if (!model) return;
            const p = self.progress;
            const angle = p * Math.PI;
            camera.position.x = Math.sin(angle) * 8;
            camera.position.z = Math.cos(angle) * 8;
            camera.position.y = 1 + p * 2;
          },
        });

        ScrollTrigger.create({
          trigger: "#section-cta",
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
          onUpdate: (self) => {
            if (!model) return;
            const p = self.progress;
            camera.position.z = -8 + p * 20;
            camera.position.y = 3 + p * 4;
            model.rotation.x = p * 0.3;
          },
        });
      },
      (progress) => {
        const pct = (progress.loaded / progress.total) * 100;
        console.log(`Loading model: ${pct.toFixed(0)}%`);
      },
      (error) => {
        console.error("Error loading model:", error);
      }
    );

    // --- Background particles ---
    const particleCount = 600;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      particlePos[i * 3] = (Math.random() - 0.5) * 40;
      particlePos[i * 3 + 1] = (Math.random() - 0.5) * 40;
      particlePos[i * 3 + 2] = (Math.random() - 0.5) * 40;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x6366f1,
      size: 0.03,
      transparent: true,
      opacity: 0,
      sizeAttenuation: true,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    gsap.to(particleMat, {
      opacity: 0.5,
      duration: 3,
      delay: 0.5,
      ease: "power2.inOut",
    });

    // --- Mouse Interaction ---
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

    // --- Animation Loop ---
    const clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Update animation mixer
      if (mixerRef.current) mixerRef.current.update(delta);

      // Gentle model float
      if (model) {
        model.position.y = Math.sin(elapsed * 0.5) * 0.15;
      }

      // Slow particle rotation
      particles.rotation.y = elapsed * 0.01;

      // Orbit lights around model
      pointLight1.position.x = 5 * Math.sin(elapsed * 0.3);
      pointLight1.position.z = 5 * Math.cos(elapsed * 0.3);
      pointLight2.position.x = -5 * Math.cos(elapsed * 0.2);
      pointLight2.position.z = 3 * Math.sin(elapsed * 0.2);
      pointLight3.position.y = 5 * Math.sin(elapsed * 0.25);

      // Mouse-driven camera offset
      camera.position.x += (mouse.x * 1.0 - camera.position.x) * 0.01;
      camera.lookAt(0, 0, 0);

      // Project hotspot anchors to screen space
      const anchors = hotspotAnchorsRef.current;
      if (anchors.length > 0 && onHotspotPositionsRef.current) {
        const positions: HotspotScreenPosition[] = anchors.map((anchor) => {
          const worldPos = anchor.mesh.getWorldPosition(new THREE.Vector3());
          const projected = worldPos.clone().project(camera);
          const x = (projected.x * 0.5 + 0.5) * window.innerWidth;
          const y = (-projected.y * 0.5 + 0.5) * window.innerHeight;
          let visible = projected.z < 1; // not behind camera

          // Hide if cutaway clips this point
          if (visible && cutawayEnabledRef.current) {
            const plane = clippingPlaneRef.current;
            visible = plane.distanceToPoint(worldPos) >= 0;
          }

          return { id: anchor.id, x, y, visible };
        });
        onHotspotPositionsRef.current(positions);
      }

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
      className="fixed inset-0 pointer-events-none"
      style={{
        background:
          "radial-gradient(ellipse at center, #0f0b1a 0%, #050208 70%, #000000 100%)",
        zIndex: 0,
      }}
    />
  );
});

export default Scene;
