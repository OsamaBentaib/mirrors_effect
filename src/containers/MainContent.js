import React, { Suspense } from "react";
import Pinterest from "./Pinterest";
import { Canvas } from "react-three-fiber";
import Loader from "./../components/Loader";
export default function MainContent(props) {
  const { sence } = props;
  return (
    <div className="content">
      <Canvas concurrent shadowMap camera={{ position: [0, 0, 5], fov: 70 }}>
        <color attach="background" args={["#000"]} />
        <Suspense fallback={<Loader color="#fff" />}>
          {sence === "Pinterest" && <Pinterest />}
        </Suspense>
        <ambientLight intensity={0.4} />
      </Canvas>
    </div>
  );
}
