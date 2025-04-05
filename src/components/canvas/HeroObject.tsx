export default function HeroObject() {
	return (
		<mesh>
			<sphereGeometry args={[1.5, 16, 16]} />
			<meshBasicMaterial color="#333333" wireframe />
		</mesh>
	);
}
