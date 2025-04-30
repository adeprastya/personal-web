import { useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree, extend } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import vs from "../../shaders/hero/vs.glsl";
import fs from "../../shaders/hero/fs.glsl";
import { useScroll, useSpring } from "motion/react";

const HeroMaterial = shaderMaterial(
	{
		uTime: 0.0,
		uFrequency: 0.0
	},
	vs,
	fs
);
extend({ HeroMaterial });

export default function HeroObject() {
	const { width } = useThree((state) => ({
		width: state.viewport.width
	}));

	const { scrollYProgress } = useScroll();
	const smoothScrollY = useSpring(scrollYProgress, {
		stiffness: 15,
		damping: 15
	});

	const meshRef = useRef<THREE.Mesh>(null);
	const materialRef = useRef<THREE.ShaderMaterial & { uTime: number; uFrequency: number }>(null);
	useFrame(({ clock }) => {
		if (materialRef.current) {
			materialRef.current.uTime = clock.getElapsedTime();
			materialRef.current.uFrequency = 1.0 - smoothScrollY.get();
		}

		if (meshRef.current) {
			meshRef.current.rotation.y += 0.0005;
			meshRef.current.rotation.x += 0.0005;
		}
	});

	return (
		<mesh ref={meshRef} scale={0.6 + width * 0.06}>
			<sphereGeometry args={[1, 128, 128]} />
			{/* @ts-expect-error: maybe @types/three is outdated */}
			<heroMaterial ref={materialRef} side={THREE.DoubleSide} wireframe={true} />
		</mesh>
	);
}
