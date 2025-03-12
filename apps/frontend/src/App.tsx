import { BrowserRouter, Routes, Route } from "react-router";
import EditorPage from "../pages/EditorPage.tsx";
import ChatPage from "../pages/ChatPage.tsx";
import SignUpPage from "../pages/SignupPage.tsx";
import LogInPage from "../pages/LoginPage.tsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/editor" element={<EditorPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<LogInPage />} />
      </Routes>
    </BrowserRouter>
  );
}
