import HomeSection from "./HomeSection";
import AnimatedButton from "../../components/AnimatedButton";

export default function Home() {
	return (
		<main className="absolute z-0 top-0 left-0 w-full min-h-screen">
			<HomeSection>
				<AnimatedButton>Bonjour</AnimatedButton>

				<p className="font-sans uppercase text-xs tracking-wider text-neutral-300">
					Its my digital realm, Where functionality meets beauty, innovation fuels design, and passion powers creation
				</p>
			</HomeSection>

			<HomeSection>
				<AnimatedButton>About Me</AnimatedButton>

				<p className="font-sans uppercase text-xs tracking-wider text-neutral-300">
					Pleased to Meet You, I'm Ade, dedicated to crafting solutions that work seamlessly and also leave a lasting
					impression
				</p>
			</HomeSection>

			<HomeSection>
				<AnimatedButton>My Works</AnimatedButton>

				<p className="font-sans uppercase text-xs tracking-wider text-neutral-300">
					Here, you will find projects that I've built with intention, enriched through curiosity, and fueled by passion
				</p>
			</HomeSection>

			<HomeSection>
				<AnimatedButton>Let's Connect</AnimatedButton>

				<p className="font-sans uppercase text-xs tracking-wider text-neutral-300">
					Looking to collaborate, bounce around ideas, or simply talk about the latest in tech, I'd love to hear from
					you
				</p>
			</HomeSection>
		</main>
	);
}
