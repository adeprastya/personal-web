import { useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree, extend } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import morphing from "../../shaders/vertices/morphing.glsl";
import hologram from "../../shaders/fragments/hologram.glsl";

const HologramMaterial = shaderMaterial(
	{
		time: 0,
		resolution: new THREE.Vector2(),
		mouse: new THREE.Vector2(),
		morphSpeed: 0.5,
		morphIntensity: 0.2,
		scanLineSpeed: 1.0,
		glitchIntensity: 0.1
	},
	morphing,
	hologram
);
extend({ HologramMaterial });

export default function HeroObject() {
	const { width, size } = useThree((state) => ({
		width: state.viewport.width,
		size: state.size
	}));

	const materialRef = useRef<any>(null);
	useFrame(({ clock }) => {
		if (materialRef.current) {
			materialRef.current.time = clock.getElapsedTime();
		}
	});

	return (
		<mesh scale={0.5 + width * 0.05}>
			<sphereGeometry args={[1, 64, 64]} />
			{/* @ts-ignore */}
			<hologramMaterial ref={materialRef} side={THREE.DoubleSide} resolution={new THREE.Vector2(size.width, size.height)}	 />
		</mesh>
	);
}
