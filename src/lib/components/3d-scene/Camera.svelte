<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { Vector3, PerspectiveCamera } from 'three';
	import { useThrelte, useTask } from '@threlte/core';
	import { deviceData } from '$lib/contexts/device.svelte';
	import { pointerData } from '$lib/contexts/pointer.svelte';
	import { AppRoute } from '$lib/types/Route';

	const FOV = 60;
	const NEAR = 0.1;
	const FAR = 10;
	const LERP_SPEED = 0.025;
	const MOUSE_SMOOTH = 0.1;

	type Vec3 = { x: number; y: number; z: number };

	const ROUTE_CONFIG: Record<string, { pos: Vec3; look: Vec3 }> = {
		[AppRoute.home]: {
			pos: { x: 0, y: 0, z: 2.5 },
			look: { x: 0, y: 0, z: 0 }
		},
		[AppRoute.about]: {
			pos: { x: 0, y: 1.0, z: 2.5 },
			look: { x: 0, y: 0, z: 0 }
		},
		[AppRoute.works]: {
			pos: { x: 0, y: 0, z: 2.5 },
			look: { x: 0, y: 0, z: 0 }
		}
	};
	const DEFAULT_ROUTE = ROUTE_CONFIG[AppRoute.home];

	const isCam = (c: unknown): c is PerspectiveCamera => c instanceof PerspectiveCamera;

	const { camera } = useThrelte();

	let posBase = { ...DEFAULT_ROUTE.pos };
	let lookAtBase = { ...DEFAULT_ROUTE.look };

	const currentLookAt = new Vector3();
	const smoothedMouse = { x: 0, y: 0 };
	let t = 0;

	function updateCameraParams(cam: PerspectiveCamera) {
		cam.near = NEAR;
		cam.far = FAR;
		cam.fov = FOV * (deviceData.isMobile ? 1.25 : 1.0);
		cam.updateProjectionMatrix();
	}

	$effect(() => {
		if (camera.current instanceof PerspectiveCamera) updateCameraParams(camera.current);
	});

	afterNavigate(({ to }) => {
		const cam = camera.current;
		const path = to?.url.pathname ?? AppRoute.home;

		const config = ROUTE_CONFIG[path] ?? DEFAULT_ROUTE;
		posBase = { ...config.pos };
		lookAtBase = { ...config.look };

		if (isCam(cam)) updateCameraParams(cam);
	});

	function updateSmoothedMouse() {
		const rawX = (pointerData.x / window.innerWidth) * 2 - 1;
		const rawY = -(pointerData.y / window.innerHeight) * 2 + 1;
		smoothedMouse.x += (rawX - smoothedMouse.x) * MOUSE_SMOOTH;
		smoothedMouse.y += (rawY - smoothedMouse.y) * MOUSE_SMOOTH;
	}

	function handleFloat(cam: PerspectiveCamera, delta: number) {
		t += delta;

		const targetPos = new Vector3(
			posBase.x + smoothedMouse.x * 0.3,
			posBase.y + smoothedMouse.y * 0.2,
			posBase.z
		);
		cam.position.lerp(targetPos, LERP_SPEED);

		currentLookAt.x += (lookAtBase.x - currentLookAt.x) * LERP_SPEED;
		currentLookAt.y += (lookAtBase.y - currentLookAt.y) * LERP_SPEED;
		currentLookAt.z += (lookAtBase.z - currentLookAt.z) * LERP_SPEED;

		const shiftX = Math.sin(t * 0.7) * 0.05;
		const shiftY = Math.sin(t * 0.9 + 0.4) * 0.03;

		cam.lookAt(currentLookAt.x + shiftX, currentLookAt.y + shiftY, currentLookAt.z);
	}

	useTask((delta) => {
		const cam = camera.current;
		if (!isCam(cam)) return;

		updateSmoothedMouse();
		handleFloat(cam, delta);
	});
</script>
