import { useFile } from "../store/useFile";
import { useSocket } from "../store/useSocket";
import React, { useEffect, useState } from "react";

export default function Editor() {
  const [content, setContent] = useState<string>("");
  const socket = useSocket((state) => state.socket);
  const { setFile, file } = useFile((state) => state);

  useEffect(() => {
    if (file.content) {
      setContent(file.content);
    }
  }, [file.content, file.path]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (socket && file.path) {
        const updatedFile = { content, path: file.path };

        setFile(updatedFile.content, updatedFile.path);

        socket.emit("writeContent", updatedFile, () => {
          // TODO: Show this on the ui
          console.log("File saved");
        });
      }
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [content]);

  if (file.content) {
    return (
      <textarea
        className="bg-[#d9d9d9] w-full h-full overflow-auto"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      ></textarea>
    );
  }

  return <p>Editor</p>;
}
