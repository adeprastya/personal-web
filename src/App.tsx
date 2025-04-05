import { BrowserRouter, Routes, Route } from "react-router";
import Nav from "./components/layout/Nav";
import BackgroundText from "./components/layout/BackgroundText";
import CanvasScene from "./components/canvas/CanvasScene";
import Home from "./pages/home";

const routes = [
	{ path: "/", label: "home", bgText: "Do It Yourself" },
	{ path: "/about", label: "about", bgText: "Behind The Scenes" },
	{ path: "/work", label: "works", bgText: "What I Do" },
	{ path: "/contact", label: "contact", bgText: "Reach Out" },
	{ path: "/credit", label: "credit", bgText: "High Fives" }
];

export default function App() {
	return (
		<>
			<CanvasScene />

			<BrowserRouter>
				<Nav routes={routes} />
				<BackgroundText routes={routes} />

				<Routes>
					<Route path="/" element={<Home />} />
				</Routes>
			</BrowserRouter>
		</>
	);
}
