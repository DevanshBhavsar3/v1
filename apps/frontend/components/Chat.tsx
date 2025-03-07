import React, { useRef } from "react";

export default function Chat() {
  const promptRef = useRef<null | HTMLTextAreaElement>(null);

  return (
    <div className="w-full h-full bg-black/10 flex flex-col">
      <textarea
        ref={promptRef}
        id=""
        className="w-1/2 h-32 bg-black text-white"
        placeholder="What do you want to ship?"
      ></textarea>
      <button className="bg-black/60 text-white cursor-pointer">Build</button>
    </div>
  );
}
