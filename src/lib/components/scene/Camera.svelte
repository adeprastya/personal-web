<script lang="ts">
	import { useTask, useThrelte } from '@threlte/core';
	import { PerspectiveCamera, Vector3 } from 'three';

	import { route } from '$lib/state/route.svelte';
	import { device } from '$lib/state/device.svelte';
	import { pointer } from '$lib/state/pointer.svelte';
	import { type AppRouteType, AppRoute } from '$lib/types/AppRoute';

	type Vec3 = {
		x: number;
		y: number;
		z: number;
	};

	const cameraConfig = {
		fov: 60,
		near: 0.1,
		far: 100,
		lerp: 0.025,
		mouseSmooth: 0.1
	} as const;

	const routesConfig = {
		[AppRoute.Home]: {
			position: { x: 0, y: 0, z: 2.5 },
			lookAt: { x: 0, y: 0, z: 0 }
		},
		[AppRoute.About]: {
			position: { x: 0, y: 1, z: 2.5 },
			lookAt: { x: 0, y: 0, z: 0 }
		},
		[AppRoute.Works]: {
			position: { x: 0, y: -0.5, z: 2.5 },
			lookAt: { x: 0, y: 0, z: 0 }
		}
	} satisfies Record<AppRouteType, { position: Vec3; lookAt: Vec3 }>;

	const { camera } = useThrelte();

	let basePosition = { ...routesConfig[AppRoute.Home].position };
	let baseLookAt = { ...routesConfig[AppRoute.Home].lookAt };

	const currentLookAt = new Vector3();
	const targetPosition = new Vector3();
	const pointerOffset = { x: 0, y: 0 };
	let elapsed = 0;

	function updateProjection(camera: PerspectiveCamera) {
		camera.near = cameraConfig.near;
		camera.far = cameraConfig.far;
		camera.fov = cameraConfig.fov * (device.isMobile ? 1.25 : 1);
		camera.updateProjectionMatrix();
	}

	function updatePointer() {
		const x = (pointer.x / window.innerWidth) * 2 - 1;
		const y = -(pointer.y / window.innerHeight) * 2 + 1;

		pointerOffset.x += (x - pointerOffset.x) * cameraConfig.mouseSmooth;
		pointerOffset.y += (y - pointerOffset.y) * cameraConfig.mouseSmooth;
	}

	function updateCamera(camera: PerspectiveCamera, delta: number) {
		elapsed += delta;

		targetPosition.set(
			basePosition.x + pointerOffset.x * 0.3,
			basePosition.y + pointerOffset.y * 0.2,
			basePosition.z
		);

		camera.position.lerp(targetPosition, cameraConfig.lerp);

		currentLookAt.lerp(new Vector3(baseLookAt.x, baseLookAt.y, baseLookAt.z), cameraConfig.lerp);

		// Subtle idle movement to avoid a static camera.
		camera.lookAt(
			currentLookAt.x + Math.sin(elapsed * 0.7) * 0.05,
			currentLookAt.y + Math.sin(elapsed * 0.9 + 0.4) * 0.03,
			currentLookAt.z
		);
	}

	$effect(function syncProjection() {
		const cam = camera.current;
		if (!(cam instanceof PerspectiveCamera)) return;

		updateProjection(cam);
	});

	$effect(function syncRouteCamera() {
		const curConf = routesConfig[route.current];
		basePosition = { ...curConf.position };
		baseLookAt = { ...curConf.lookAt };

		const cam = camera.current;
		if (cam instanceof PerspectiveCamera) {
			updateProjection(cam);
		}
	});

	useTask(function runAnimation(delta) {
		const cam = camera.current;
		if (!(cam instanceof PerspectiveCamera)) return;

		updatePointer();
		updateCamera(cam, delta);
	});
</script>
