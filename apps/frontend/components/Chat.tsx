import React, { useRef } from "react";
import axios from "axios";
import { useDiff } from "../store/useDiff";
import { useNavigate } from "react-router";

export default function Chat({ type }: { type: "chat" | "edit" }) {
  const navigate = useNavigate();
  const diff = useDiff((state) => state.updatedFiles);
  const promptRef = useRef<null | HTMLTextAreaElement>(null);
  const token = localStorage.getItem("token");

  async function sendPrompt() {
    if (!promptRef.current?.value) return;

    const body =
      type === "chat"
        ? {
            prompt: promptRef.current.value,
          }
        : {
            projectId: window.location.hostname.split(".")[0],
            prompt: promptRef.current.value,
            context: JSON.stringify(diff),
          };

    const response = await axios.post(
      `${import.meta.env.VITE_PUBLIC_BACKEND_URL}/${type}`,
      body,
      {
        withCredentials: true,
      }
    );

    const projectId = response.data.id;

    if (projectId) {
      window.location.href = `http://${projectId}.localhost:5173/editor`;
    } else {
      navigate("/editor");
    }
  }

  return (
    <div className="w-full h-full bg-black/10 flex flex-col">
      <textarea
        ref={promptRef}
        id=""
        className="w-full h-32 bg-black text-white"
        placeholder="What do you want to ship?"
      ></textarea>
      <button
        className="bg-black/60 text-white cursor-pointer"
        onClick={sendPrompt}
      >
        Build
      </button>
    </div>
  );
}
