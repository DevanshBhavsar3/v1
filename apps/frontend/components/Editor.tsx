import { useFile } from "../store/useFile"
import { useSocket } from "../store/useSocket"
import React, { useRef } from "react"

export default function Editor() {
  const editorRef = useRef<null | HTMLTextAreaElement>(null)
  const socket = useSocket(state => state.socket);
  const { setFile, file } = useFile(state => state)

  function handleChange() {
    if (editorRef.current && socket && file.path) {
      const updatedFile = { content: editorRef.current.value, path: file.path }

      setFile(updatedFile.content, updatedFile.path)

      socket.emit("writeContent", updatedFile, () => {
        // TODO: Show this on the ui
        console.log("File saved")
      })
    }
  }

  if (file.content) {
    return <textarea ref={editorRef} style={{ width: "80vw", height: "60vh", backgroundColor: "#d9d9d9" }} value={file.content} onChange={handleChange} ></textarea >
  }

  return <p>Editor</p>
}
