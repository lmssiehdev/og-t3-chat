import { BrowserRouter, Route, Routes } from "react-router";
 
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/chat/:id" element={<p>page one</p>} />
      </Routes>
    </BrowserRouter>
  );
}