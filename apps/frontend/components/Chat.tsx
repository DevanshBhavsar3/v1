import React, { useRef } from "react";
import axios from "axios";
import { useDiff } from "../store/useDiff";
import { useNavigate } from "react-router";

export default function Chat({ type }: { type: "chat" | "edit" }) {
  const navigate = useNavigate();
  const diff = useDiff((state) => state.updatedFiles);
  const promptRef = useRef<null | HTMLTextAreaElement>(null);

  async function sendPrompt() {
    if (!promptRef.current?.value) return;

    await axios.post(
      `${import.meta.env.VITE_PUBLIC_BACKEND_URL}/${type}`,
      {
        prompt: promptRef.current.value,
        context: JSON.stringify(diff),
      },
      {
        withCredentials: true,
      }
    );

    navigate("/editor");
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
