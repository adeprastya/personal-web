import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree, extend } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import vs from "../../shaders/hero/vs.glsl";
import fs from "../../shaders/hero/fs.glsl";
import { AnimationOptions, useAnimate, useScroll, useSpring } from "motion/react";

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
	console.log("__HeroObject rendered");

	const { width } = useThree((state) => state.viewport);

	const { scrollYProgress } = useScroll();
	const smoothScrollY = useSpring(scrollYProgress, { bounce: 0 });

	// infinite rotation & update uniforms
	const [scope, animate] = useAnimate();
	const materialRef = useRef<THREE.ShaderMaterial & { uTime: number; uFrequency: number }>(null);
	useFrame(({ clock }) => {
		if (materialRef.current) {
			materialRef.current.uTime = clock.getElapsedTime();
			materialRef.current.uFrequency = 1.0 - smoothScrollY.get();
		}

		if (scope.current) {
			scope.current.rotation.y += 0.0005;
			scope.current.rotation.x += 0.0005;
		}
	});

	// enter animation
	useEffect(() => {
		if (!scope.current) return;

		const transition: AnimationOptions = { duration: 3, ease: "circInOut" };
		animate(scope.current.position, { z: 0 }, transition);
		animate(scope.current.rotation, { x: 0, y: 0, z: 0 }, transition);
	});

	return (
		<mesh ref={scope} scale={0.6 + width * 0.06} position-z={5} rotation={-Math.PI / 2}>
			<sphereGeometry args={[1, 256, 128]} />
			{/* @ts-expect-error: maybe @types/three is outdated */}
			<heroMaterial ref={materialRef} side={THREE.DoubleSide} wireframe={true} />
		</mesh>
	);
}
