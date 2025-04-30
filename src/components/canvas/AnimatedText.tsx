import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { useFrame, useThree } from "@react-three/fiber";

const texts = [
	" ADE FATHONI PRASTYA  ADE FATHONI PRASTYA ",
	" ADE FATHONI PRASTYA  ADE FATHONI PRASTYA ",
	" ADE FATHONI PRASTYA  ADE FATHONI PRASTYA ",
	" ADE FATHONI PRASTYA  ADE FATHONI PRASTYA "
];

export default function AnimatedText() {
	const { width } = useThree((state) => state.viewport);

	const material = useMemo(() => new THREE.MeshBasicMaterial({ color: "#999999" }), []);
	const [charGeometries, setCharGeometries] = useState<THREE.BufferGeometry[][]>([]);
	useEffect(() => {
		const loader = new FontLoader();
		loader.load("/fonts/LibreBarcode39ExtendedText_Regular.json", (font) => {
			const newGeometries = texts.map((text) =>
				text.split("").map(
					(char) =>
						new TextGeometry(char, {
							font: font,
							size: 1,
							depth: 0.01,
							curveSegments: 1,
							bevelEnabled: true,
							bevelThickness: 0,
							bevelSize: 0,
							bevelSegments: 1
						})
				)
			);
			setCharGeometries(newGeometries);
		});
	}, []);

	const groupRef = useRef<THREE.Group>(null);
	useFrame(() => {
		if (groupRef.current) {
			groupRef.current.children.forEach((child) => {
				child.rotation.y += 0.001;
			});
		}
	});

	const verticalSpace = 0.4 + width * 0.0085;
	const circleRadius = 1.0 + width * 0.1;
	const textScale = 0.13 + width * 0.004;

	return (
		<group ref={groupRef}>
			{charGeometries.length &&
				charGeometries.map((lineGeometries, lineIndex) => {
					const normalizedIndex = lineIndex - charGeometries.length / 2 + 0.5;
					const lineY = normalizedIndex * verticalSpace;

					return (
						<group key={lineIndex} position={[0, lineY, 0]} rotation={[lineIndex % 2 ? Math.PI : 0, 0, 0]}>
							{lineGeometries.map((geometry, charIndex) => {
								const angle = (-charIndex / lineGeometries.length) * Math.PI * 2;
								const x = circleRadius * Math.cos(angle);
								const z = circleRadius * Math.sin(angle);
								const yRotation = Math.PI / 2 - angle;

								return (
									<mesh
										key={charIndex}
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
