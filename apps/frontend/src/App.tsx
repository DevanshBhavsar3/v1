import { BrowserRouter, Routes, Route } from "react-router";
import EditorPage from "../pages/EditorPage.tsx"

export default function App() {
  return <BrowserRouter>
    <Routes>
      <Route path="/editor" element={<EditorPage />} />
    </Routes>
  </BrowserRouter>
}
