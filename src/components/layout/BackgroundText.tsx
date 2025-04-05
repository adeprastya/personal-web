import { InfiniteElement } from "../../components/InfiniteElement";
import { FilterEffect, FeGaussianBlur } from "../../components/SvgFilters";
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
				style={{ filter: "url(#fe-background-text)" }}
				className="pointer-events-none fixed z-40 top-0 left-0 w-screen h-screen"
			>
				<FilterEffect id="fe-background-text">
					<FeGaussianBlur x={50} y={2} animate={true} transition={{ ease: "circOut", duration: 0.3 }} />
				</FilterEffect>

				<InfiniteElement baseVelocity={20} className="pointer-events-auto absolute top-0 bg-neutral-300">
					<span className="px-6 font-decor font-regular text-2xl/snug text-neutral-700">{text}</span>
					<div className="inline-block size-[6px] bg-neutral-700 rotate-45" />
				</InfiniteElement>

				<InfiniteElement baseVelocity={-20} className="pointer-events-auto absolute bottom-0 bg-neutral-300">
					<span className="px-6 font-decor font-regular text-2xl/snug text-neutral-700">{text}</span>
					<div className="inline-block size-[6px] bg-neutral-700 rotate-45" />
				</InfiniteElement>
			</div>
		</AnimatePresence>
	);
}
