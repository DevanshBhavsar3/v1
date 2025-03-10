import React, { useEffect } from "react";
import { useState } from "react";
import { useSocket } from "../store/useSocket.ts";
import { useFile } from "../store/useFile.ts";
import { WORK_DIR } from "@repo/common";

interface Files {
  type: "file" | "dir";
  name: string;
  path: string;
  children: Files[];
}

export default function Explorer() {
  const socket = useSocket((state) => state.socket);
  const setFile = useFile((state) => state.setFile);
  const [explorer, setExplorer] = useState<Files[]>([]);

  useEffect(() => {
    getData(WORK_DIR, "dir");
  }, [socket]);

  useEffect(() => {
    socket?.on("updateFiles", (data) => {
      const updatedFiles = updateFiles(explorer, data.path, data.files);
      setExplorer(updatedFiles);
    });

    socket?.on("updateContent", (data) => {
      setFile(data.data, data.path);
    });
  }, [socket, explorer]);

  function updateFiles(
    files: Files[],
    path: string,
    newChildren: Files[]
  ): Files[] {
    if (path === WORK_DIR) {
      return [...newChildren];
    }

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
    if (!socket) return;

    if (filetype === "dir") {
      socket.emit("getFiles", path, (data: Files[]) => {
        const newFiles = updateFiles(explorer, path, data);
        setExplorer(newFiles);
      });
    } else {
      socket.emit("getContent", path, (data: string) => {
        setFile(data, path);
      });
    }
  }

  return (
    <div className="w-1/4 bg-[#d5d5d5] overflow-auto">
      {explorer.map((file) => (
        <FileTab key={file.name} file={file} getData={getData} />
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
  const [toggle, setToggle] = useState(true);

  function handleClick(type: "dir" | "file", path: string) {
    if (type === "dir") {
      if (!toggle) {
        getData(path, type);
      }
      setToggle(!toggle);
    } else {
      getData(path, type);
    }
  }

  return (
    <div>
      <p onClick={() => handleClick(file.type, file.path)}>{file.name}</p>
      {file.children &&
        toggle &&
        file.children.map((child) => (
          <FileTab key={child.name} file={child} getData={getData} />
        ))}
    </div>
  );
}
