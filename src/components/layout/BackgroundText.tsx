import { InfiniteElement } from "../../components/InfiniteElement";
import { FeGaussianBlur } from "../../components/SvgFilters";
import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { AnimatePresence } from "motion/react";

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
		<AnimatePresence mode="sync">
			<div
				key={text}
				className="pointer-events-none fixed z-40 top-0 left-0 w-screen h-screen font-decor font-regular leading-tight text-4xl text-zinc-950"
			>
				<FeGaussianBlur id="background-text-blur" x={60} y={2} animate={true} />

				<InfiniteElement baseVelocity={-25} className="pointer-events-auto absolute top-0 bg-zinc-400">
					<span style={{ filter: "url(#background-text-blur)" }} className="p-4">
						{text}
					</span>
				</InfiniteElement>

				<InfiniteElement baseVelocity={25} className="pointer-events-auto absolute bottom-0 bg-zinc-400">
					<span style={{ filter: "url(#background-text-blur)" }} className="p-4">
						{text}
					</span>
				</InfiniteElement>
			</div>
		</AnimatePresence>
	);
}
