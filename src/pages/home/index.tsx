import { InfiniteText } from "../../components/InfiniteText";
import { useRef } from "react";
import { useInView, motion, AnimatePresence } from "motion/react";
import { FeGaussianBlur } from "../../components/SvgFilters";
import { HoverShiftText } from "../../components/HoverShiftText";

export default function Home() {
	return (
		<main>
			<FeGaussianBlur x={40} y={1} id="section-blur" />

			<TextBg />

			<div className="absolute z-20 top-0 left-0 w-full min-h-screen">
				<Section>
					<button className="overflow-clip relative w-full border-b font-decor tracking-wider italic text-3xl/relaxed text-start text-neutral-200 group">
						<HoverShiftText className="px-6">Bonjour</HoverShiftText>
						<div className="pointer-events-none absolute top-0 left-0 w-full h-full -translate-x-[120%] skew-x-52 backdrop-invert group-hover:translate-x-0 group-hover:skew-x-0 transition-all duration-1300" />
					</button>

					<p className="font-sans uppercase text-xs tracking-wider text-neutral-300">
						Welcome to my digital realm, Where functionality meets beauty, innovation fuels design, and passion powers
						creation
					</p>
				</Section>

				<Section>
					<button className="overflow-clip relative w-full border-b font-decor tracking-wider italic text-3xl/relaxed text-start text-neutral-200 group">
						<HoverShiftText className="px-6">About Me</HoverShiftText>
						<div className="pointer-events-none absolute top-0 left-0 w-full h-full -translate-x-[120%] skew-x-52 backdrop-invert group-hover:translate-x-0 group-hover:skew-x-0 transition-all duration-1300" />
					</button>

					<p className="font-sans uppercase text-xs tracking-wider text-neutral-300">
						Pleased to Meet You, I'm Ade, dedicated to crafting solutions that work seamlessly and also leave a lasting
						impression
					</p>
				</Section>

				<Section>
					<button className="overflow-clip relative w-full border-b font-decor tracking-wider italic text-3xl/relaxed text-start text-neutral-200 group">
						<HoverShiftText className="px-6">My Works</HoverShiftText>
						<div className="pointer-events-none absolute top-0 left-0 w-full h-full -translate-x-[120%] skew-x-52 backdrop-invert group-hover:translate-x-0 group-hover:skew-x-0 transition-all duration-1300" />
					</button>

					<p className="font-sans uppercase text-xs tracking-wider text-neutral-300">
						Here, you will find projects that I've built with intention, enriched through curiosity, and fueled by
						passion.
					</p>
				</Section>

				<Section>
					<button className="overflow-clip relative w-full border-b font-decor tracking-wider italic text-3xl/relaxed text-start text-neutral-200 group">
						<HoverShiftText className="px-6">Lets Connect</HoverShiftText>
						<div className="pointer-events-none absolute top-0 left-0 w-full h-full -translate-x-[120%] skew-x-52 backdrop-invert group-hover:translate-x-0 group-hover:skew-x-0 transition-all duration-1300" />
					</button>

					<p className="font-sans uppercase text-xs tracking-wider text-neutral-300">
						Looking to collaborate, bounce around ideas, or simply talk about the latest in tech, I'd love to hear from
						you.
					</p>
				</Section>
			</div>
		</main>
	);
}

function Section({ children }: { children: React.ReactNode }) {
	const ref = useRef(null);
	const inView = useInView(ref, { amount: 0.5 });

	return (
		<section ref={ref} className="w-full h-screen">
			<AnimatePresence>
				{inView && (
					<motion.div
						initial={{ opacity: 0, filter: "url(#section-blur)" }}
						animate={{ opacity: 1, filter: "none" }}
						exit={{ opacity: 0, filter: "url(#section-blur)" }}
						transition={{ duration: 1, ease: "easeInOut" }}
						className="fixed top-0 w-full h-screen py-36 px-6 sm:px-12 lg:px-20 flex items-end justify-start"
					>
						<div className="w-xs flex flex-col gap-4">{children}</div>
					</motion.div>
				)}
			</AnimatePresence>
		</section>
	);
}

function TextBg() {
	return (
		<div className="fixed z-10 top-0 left-0 w-screen h-screen font-decor font-regular leading-none">
			<InfiniteText
				baseVelocity={-25}
				containerStyle="absolute top-0 translate-y-7/8 text-[3.5rem] text-transparent bg-clip-text bg-gradient-to-t from-neutral-600 to-neutral-950"
			>
				{" ADE FATHONI PRASTYA -"}
			</InfiniteText>
			<InfiniteText
				baseVelocity={25}
				containerStyle="absolute top-0 text-[5rem] text-transparent bg-clip-text bg-gradient-to-t from-neutral-400 to-neutral-950"
			>
				{" ADE FATHONI PRASTYA -"}
			</InfiniteText>
			<InfiniteText
				baseVelocity={25}
				containerStyle="absolute bottom-0 -translate-y-7/8 text-[3.5rem] text-transparent bg-clip-text bg-gradient-to-b from-neutral-600 to-neutral-950"
			>
				{" ADE FATHONI PRASTYA -"}
			</InfiniteText>
			<InfiniteText
				baseVelocity={-25}
				containerStyle="absolute bottom-0 text-[5rem] text-transparent bg-clip-text bg-gradient-to-b from-neutral-400 to-neutral-950"
			>
				{" ADE FATHONI PRASTYA -"}
			</InfiniteText>
		</div>
	);
}
