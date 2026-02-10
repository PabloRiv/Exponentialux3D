"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import HeroOverlay from "@/components/HeroOverlay";
import Scene, { type SceneHandle, type HotspotConfig, type HotspotScreenPosition } from "@/components/Scene";

const hotspotConfigs: HotspotConfig[] = [
  {
    id: "input-shaft",
    meshName: "inputshaft",
    label: "Input Shaft",
    description: "The input shaft transmits rotational power from the motor into the planetary gear train, driving the sun gear at the center of the mechanism.",
  },
];

export default function Home() {
  const sceneRef = useRef<SceneHandle>(null);
  const [mounted, setMounted] = useState(false);
  const [hotspotPositions, setHotspotPositions] = useState<HotspotScreenPosition[]>([]);
  const lastPositionsRef = useRef<HotspotScreenPosition[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Throttle position updates — only re-render when a marker moves >0.5px
  const handleHotspotPositions = useCallback((positions: HotspotScreenPosition[]) => {
    const prev = lastPositionsRef.current;
    let changed = prev.length !== positions.length;
    if (!changed) {
      for (let i = 0; i < positions.length; i++) {
        const p = prev[i];
        const n = positions[i];
        if (p.visible !== n.visible || Math.abs(p.x - n.x) > 0.5 || Math.abs(p.y - n.y) > 0.5) {
          changed = true;
          break;
        }
      }
    }
    if (changed) {
      lastPositionsRef.current = positions;
      setHotspotPositions(positions);
    }
  }, []);

  return (
    <main className="relative bg-black">
      {mounted && (
        <Scene
          ref={sceneRef}
          hotspots={hotspotConfigs}
          onHotspotPositions={handleHotspotPositions}
        />
      )}
      <HeroOverlay
        onActuatorCycle={() => sceneRef.current?.playActuatorCycle()}
        onCutawayToggle={(enabled) => sceneRef.current?.setCutawayEnabled(enabled)}
        onCutawayPosition={(value) => sceneRef.current?.setCutawayPosition(value)}
        onCutawayAxis={(axis) => sceneRef.current?.setCutawayAxis(axis)}
        onExplodeToggle={(enabled) => sceneRef.current?.setExplodeEnabled(enabled)}
        onExplodeIntensity={(value) => sceneRef.current?.setExplodeIntensity(value)}
        hotspotConfigs={hotspotConfigs}
        hotspotPositions={hotspotPositions}
      />
    </main>
  );
}
