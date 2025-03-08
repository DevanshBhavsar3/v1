import React, { useRef } from "react";
import axios from "axios";

export default function Chat() {
  const promptRef = useRef<null | HTMLTextAreaElement>(null);

  async function sendPrompt() {
    if (!promptRef.current?.value) return;

    await axios.post(`${import.meta.env.VITE_PUBLIC_BACKEND_URL}/prompt`, {
      prompt: promptRef.current.value,
    });
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
