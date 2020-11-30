import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useResource } from "react-three-fiber";
import { Text, Box, Octahedron, Plane } from "@react-three/drei";
import { Physics, useBox, usePlane } from "@react-three/cannon";

import useSlerp from "./../hooks/useSlerp";
import useRenderTarget from "./../hooks/useRenderTarget";
import useLayers from "./../hooks/useLayers";

const textProps = {
  fontSize: 4,
  font: "https://fonts.gstatic.com/s/kanit/v7/nKKU-Go6G5tXcr4WPBWnVac.woff",
};

const BG_COLOR = "#E60023";
const PINTERESR_COLOR = "#aaa";
const CLICKHERE_COLOR = "#f70131";
const REFLECTION_SIDE_COLOR = "#929292";
const DARK_SIDE_COLOR = "#E60023";

function Title({ layers, label = "", color = 0xffffff, ...props }) {
  const group = useRef();

  useEffect(() => {
    group.current.lookAt(0, 0, 0);
  }, []);

  return (
    <group {...props} ref={group}>
      <Text
        castShadow
        name={label}
        depthTest={false}
        material-toneMapped={false}
        {...textProps}
        layers={layers}
      >
        <svg
          role="img"
          width="100px"
          color="#fff"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z" />
        </svg>
      </Text>
    </group>
  );
}

function TitleCopies({ layers, label, color, ...props }) {
  const vertices = useMemo(() => {
    const y = new THREE.CircleGeometry(10, 4, 4);
    return y.vertices;
  }, []);

  return (
    <group name="titleCopies" {...props}>
      {vertices.map((vertex, i) => (
        <Title
          name={"titleCopy-" + i}
          label={label}
          position={vertex}
          layers={layers}
          color={color}
        />
      ))}
    </group>
  );
}

function PhysicalWalls(props) {
  usePlane(() => ({ ...props }));

  // back wall
  usePlane(() => ({ position: [0, 0, -20] }));

  return (
    <Plane args={[1000, 1000]} {...props} receiveShadow>
      <shadowMaterial transparent opacity={0.2} />
    </Plane>
  );
}

function PhysicalTitle(props) {
  useBox(() => ({ ...props }));
  return null;
}

function Mirror({ sideMaterial, reflectionMaterial, ...props }) {
  const [ref, api] = useBox(() => props);

  return (
    <Box
      ref={ref}
      args={props.args}
      onClick={() => api.applyImpulse([0, 0, -50], [0, 0, 0])}
      receiveShadow
      castShadow
      material={[
        sideMaterial,
        sideMaterial,
        sideMaterial,
        sideMaterial,
        reflectionMaterial,
        sideMaterial,
      ]}
    />
  );
}

function Mirrors({ envMap }) {
  const ROWS = 4;
  const COLS = 10;
  const BOX_SIZE = 2;

  const sideMaterial = useResource();
  const reflectionMaterial = useResource();

  const mirrorsData = useMemo(
    () =>
      new Array(ROWS * COLS).fill().map((_, index) => ({
        mass: 1,
        material: { friction: 1, restitution: 0 },
        args: [BOX_SIZE, BOX_SIZE, BOX_SIZE],
        position: [
          -COLS + ((index * BOX_SIZE) % (BOX_SIZE * COLS)),
          -1 + BOX_SIZE * Math.floor((index * BOX_SIZE) / (BOX_SIZE * COLS)),
          0,
        ],
      })),
    []
  );

  return (
    <>
      <meshPhysicalMaterial
        ref={sideMaterial}
        color={DARK_SIDE_COLOR}
        envMap={envMap}
        roughness={0.8}
        metalness={0.2}
      />
      <meshPhysicalMaterial
        ref={reflectionMaterial}
        envMap={envMap}
        roughness={0}
        metalness={1}
        color={REFLECTION_SIDE_COLOR}
      />
      <group name="mirrors">
        {mirrorsData.map((mirror, index) => (
          <Mirror
            key={`0${index}`}
            name={`mirror-${index}`}
            {...mirror}
            sideMaterial={sideMaterial.current}
            reflectionMaterial={reflectionMaterial.current}
          />
        ))}
      </group>
    </>
  );
}

function Background({ layers, ...props }) {
  const ref = useLayers(layers);
  return (
    <Octahedron ref={ref} name="background" args={[100]} {...props}>
      <meshBasicMaterial color={BG_COLOR} side={THREE.BackSide} />
    </Octahedron>
  );
}

export default function Pinterest() {
  const group = useSlerp();
  const [cubeCamera, renderTarget] = useRenderTarget();

  return (
    <>
      <group name="sceneContainer" ref={group}>
        <Background layers={[0, 11]} position={[0, 0, -5]} />
        <cubeCamera
          layers={[11]}
          name="cubeCamera"
          ref={cubeCamera}
          position={[0, 0, 0]}
          args={[0.1, 100, renderTarget]}
        />

        <Title
          name="title"
          label="Pinterest"
          position={[0, 2, -10]}
          color={PINTERESR_COLOR}
        />
        <TitleCopies
          position={[0, 2, -5]}
          rotation={[0, 0, 0]}
          layers={[11]}
          label="Pinterest"
          color={PINTERESR_COLOR}
        />

        <Title
          layers={[11]}
          name="title"
          label="Start now"
          position={[0, 2, 24]}
          scale={[-1, 1, 1]}
          color={CLICKHERE_COLOR}
        />

        <Physics gravity={[0, -10, 0]}>
          <Mirrors envMap={renderTarget.texture} />
          <PhysicalWalls
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, -2, 0]}
          />
          <PhysicalTitle args={[13, 2.5, 0.1]} position={[0, 2.25, -10]} />
        </Physics>
      </group>

      <pointLight
        castShadow
        position={[0, 10, 2]}
        intensity={4}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={100}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
    </>
  );
}
