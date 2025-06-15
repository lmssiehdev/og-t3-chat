import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { ChatPageWithId } from "./(chat)/[id]";
import { ChatLayout } from "./(chat)/components/layout";

export default function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Navigate to="/chat" replace />} />
				<Route
					path="/chat/:id"
					element={
						<ChatLayout>
							<ChatPageWithId />
						</ChatLayout>
					}
				/>
				<Route
					path="/chat"
					element={
						<ChatLayout>
							<ChatPageWithId />
						</ChatLayout>
					}
				/>
			</Routes>
		</BrowserRouter>
	);
}
