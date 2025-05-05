import { useId, useRef } from "react";
import { useInView, motion, AnimatePresence } from "motion/react";
import { FeGaussianBlur } from "../../components/SvgFilters";
import AnimatedButton from "../../components/AnimatedButton";

export default function Home() {
	return (
		<main>
			<div className="absolute z-0 top-0 left-0 w-full min-h-screen">
				<Section>
					<AnimatedButton>Bonjour</AnimatedButton>

					<p className="font-sans uppercase text-xs tracking-wider text-neutral-300">
						Welcome to my digital realm, Where functionality meets beauty, innovation fuels design, and passion powers
						creation
					</p>
				</Section>

				<Section>
					<AnimatedButton>About Me</AnimatedButton>

					<p className="font-sans uppercase text-xs tracking-wider text-neutral-300">
						Pleased to Meet You, I'm Ade, dedicated to crafting solutions that work seamlessly and also leave a lasting
						impression
					</p>
				</Section>

				<Section>
					<AnimatedButton>My Works</AnimatedButton>

					<p className="font-sans uppercase text-xs tracking-wider text-neutral-300">
						Here, you will find projects that I've built with intention, enriched through curiosity, and fueled by
						passion.
					</p>
				</Section>

				<Section>
					<AnimatedButton>Let's Connect</AnimatedButton>

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
	const id = useId();

	return (
		<section ref={ref} className="w-full h-screen">
			<AnimatePresence mode="sync">
				{inView && (
					<>
						<FeGaussianBlur id={`section-blur-${id}`} x={40} y={2} animate={true} />

						<motion.div
							key={id}
							style={{ filter: `url(#section-blur-${id})` }}
							className="fixed top-0 w-full h-screen py-36 px-6 sm:px-12 lg:px-20 flex items-end justify-start"
						>
							<div className="w-xs flex flex-col gap-4">{children}</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>
		</section>
	);
}
