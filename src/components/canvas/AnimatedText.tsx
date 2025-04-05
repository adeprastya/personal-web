import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { useFrame, useThree, useLoader } from "@react-three/fiber";
import { AnimationOptions, useAnimate } from "motion/react";

const texts = [
	" ADE FATHONI PRASTYA  ADE FATHONI PRASTYA ",
	" ADE FATHONI PRASTYA  ADE FATHONI PRASTYA ",
	" ADE FATHONI PRASTYA  ADE FATHONI PRASTYA ",
	" ADE FATHONI PRASTYA  ADE FATHONI PRASTYA "
];

export default function AnimatedText() {
	console.log("__AnimatedText rendered");

	const { width, height } = useThree((state) => state.viewport);

	// material & font loading
	const material = useMemo(() => new THREE.MeshBasicMaterial({ color: "#999999" }), []);
	const font = useLoader(FontLoader, "/fonts/LibreBarcode39ExtendedText_Regular.json");
	const charGeometries = useMemo(() => {
		return texts.map((text) =>
			text.split("").map(
				(char) =>
					new TextGeometry(char, {
						font,
						size: 1,
						depth: 0.01,
						curveSegments: 1.0,
						bevelEnabled: true,
						bevelThickness: 0.0,
						bevelSize: 0.0,
						bevelSegments: 1.0
					})
			)
		);
	}, [font]);

	const circleRadius = 1.0 + width * 0.1;
	const textScale = 0.13 + width * 0.004;

	const [scope, animate] = useAnimate();
	// start animation
	useEffect(() => {
		if (!scope.current) return;

		const meshes: THREE.Mesh[] = scope.current.children;
		const balanceIdx = (i: number) => i - charGeometries.length / 2 + 0.5;
		const transition: AnimationOptions = { duration: 3, ease: "easeInOut" };
		meshes.forEach((mesh, i) =>
			animate(
				mesh.position,
				{
					y: balanceIdx(i) * 0.2 + (balanceIdx(i) < 0 ? -0.4 : 0.4) + (balanceIdx(i) < 0 ? -1 : 1) * width * 0.0085
				},
				transition
			)
		);
	});
	// infinite rotation
	useFrame(() => {
		if (!scope.current) return;

		scope.current.children.forEach((mesh: THREE.Mesh) => (mesh.rotation.y += 0.001));
	});

	return (
		<group ref={scope}>
			{charGeometries.length &&
				charGeometries.map((lineGeometries, lineIdx) => {
					return (
						<group
							key={lineIdx}
							rotation={[lineIdx % 2 ? 0 : Math.PI, 0, 0]}
							position={[0, lineIdx % 2 ? height : -height, 0]}
						>
							{lineGeometries.map((geometry, charIdx) => {
								const angle = (-charIdx / lineGeometries.length) * Math.PI * 2;
								const x = circleRadius * Math.cos(angle);
								const z = circleRadius * Math.sin(angle);
								const yRotation = Math.PI / 2 - angle;

								return (
									<mesh
										key={charIdx}
										geometry={geometry}
										material={material}
										scale={textScale}
										position={[x, 0, z]}
										rotation={[0, yRotation, 0]}
									/>
								);
							})}
						</group>
					);
				})}
		</group>
	);
}
