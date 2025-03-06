import React from "react";
import { useRef, useState } from "react";
import { useSocket } from "../store/useSocket.ts";
import { useFile } from "../store/useFile.ts";

const BASE_DIR = "/home/devansh/CodePlayground";

interface Files {
  type: "file" | "dir";
  name: string;
  path: string;
  children: Files[];
}

export default function Explorer() {
  const socket = useSocket(state => state.socket)
  const setFile = useFile(state => state.setFile)

  const [explorer, setExplorer] = useState<Files[]>([
    { type: "dir", name: "CodePlayground", path: BASE_DIR, children: [] },
  ]);

  function updateFiles(
    files: Files[],
    path: string,
    newChildren: Files[]
  ): Files[] {
    return files.map((file) => {
      // If this is the file we're looking for, update its children
      if (file.path === path) {
        return { ...file, children: newChildren };
      }
      // Otherwise, if it has children, recursively check them
      else if (file.children && file.children.length > 0) {
        return {
          ...file,
          children: updateFiles(file.children, path, newChildren),
        };
      }
      // If not a match and no children, return as is
      else {
        return file;
      }
    });
  }

  function getData(path: string, filetype: "dir" | "file") {
    if (!socket) return

    if (filetype === "dir") {
      socket.emit("getFiles", path, (data: Files[]) => {
        const newFiles = updateFiles(explorer, path, data);
        setExplorer(newFiles);
      });
    }
    else {
      socket.emit("getContent", path, (data: string) => {
        setFile(data, path)
      });
    }
  }



  return (
    <div style={{ height: "60vh", width: "20%", backgroundColor: "#d5d5d5" }}>
      {explorer.map((file) => (
        <FileTab
          key={file.name}
          file={file}
          getData={getData}
        />
      ))}
    </div>
  );
}

function FileTab({
  file,
  getData,
}: {
  file: Files;
  getData: (path: string, type: "dir" | "file") => void;
}) {
  const [toggle, setToggle] = useState(true)
  const isFetched = useRef<boolean>(false);

  function handleClick(type: "dir" | "file", path: string) {
    if (type === "dir") {

      if (!isFetched.current) {
        getData(path, type);
        isFetched.current = true;
      } else {
        setToggle(!toggle)
      }
    } else {
      getData(path, type);
    }
  }

  return (
    <div>
      <p onClick={() => handleClick(file.type, file.path)}>{file.name}</p>
      {(file.children && toggle) &&
        file.children.map((child) => (
          <FileTab key={child.name} file={child} getData={getData} />
        ))}
    </div>
  );
}
