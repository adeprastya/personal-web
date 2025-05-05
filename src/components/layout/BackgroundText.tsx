import { InfiniteElement } from "../../components/InfiniteElement";
import { useEffect, useState } from "react";
import { useLocation } from "react-router";

export default function BackgroundText({ routes }: { routes: Array<{ path: string; label: string; bgText: string }> }) {
	const [text, setText] = useState(routes[0].bgText);
	const location = useLocation();

	useEffect(() => {
		const currentRoute = routes.find((r) => r.path === location.pathname);
		if (currentRoute) {
			setText(currentRoute.bgText);
		}
	}, [location, routes]);

	return (
		<div
			key={text}
			className="pointer-events-none fixed z-40 top-0 left-0 w-screen h-screen font-decor font-regular leading-none"
		>
			<InfiniteElement baseVelocity={25} className="pointer-events-auto absolute top-0">
				<span className="px-2 text-[4rem] text-neutral-500">{text}</span>
			</InfiniteElement>

			<InfiniteElement baseVelocity={-25} className="pointer-events-auto absolute bottom-0">
				<span className="px-2 text-[4rem] text-neutral-500">{text}</span>
			</InfiniteElement>
		</div>
	);
}
