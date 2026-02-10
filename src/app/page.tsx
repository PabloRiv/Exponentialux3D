"use client";

import { useRef, useState, useEffect } from "react";
import HeroOverlay from "@/components/HeroOverlay";
import Scene, { type SceneHandle } from "@/components/Scene";

export default function Home() {
  const sceneRef = useRef<SceneHandle>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="relative bg-black">
      {mounted && <Scene ref={sceneRef} />}
      <HeroOverlay
        onActuatorCycle={() => sceneRef.current?.playActuatorCycle()}
        onCutawayToggle={(enabled) => sceneRef.current?.setCutawayEnabled(enabled)}
        onCutawayPosition={(value) => sceneRef.current?.setCutawayPosition(value)}
        onCutawayAxis={(axis) => sceneRef.current?.setCutawayAxis(axis)}
      />
    </main>
  );
}
