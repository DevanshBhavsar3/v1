import { useRef, useState } from "react";
import { Socket } from "socket.io-client";

const BASE_DIR = "/home/devansh/CodePlayground";

interface Files {
  type: "file" | "dir";
  name: string;
  path: string;
  children: Files[];
}

export default function Explorer({ socket }: { socket: Socket }) {
  const [files, setFiles] = useState<Files[]>([
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

  function getFiles(path: string) {
    socket.emit("getFiles", path, (data: Files[]) => {
      const newFiles = updateFiles(files, path, data);
      setFiles(newFiles);
    });
  }

  return (
    <div style={{ height: "60vh", width: "20%", backgroundColor: "#d5d5d5" }}>
      {files.map((file) => (
        <FileTab
          key={file.name}
          file={file}
          getFiles={(path: string) => getFiles(path)}
        />
      ))}
    </div>
  );
}

function FileTab({
  file,
  getFiles,
}: {
  file: Files;
  getFiles: (path: string) => void;
}) {
  const [toggle, setToggle] = useState(true)
  const isFetched = useRef<boolean>(false);

  function handleClick(type: "dir" | "file", path: string) {
    if (type === "dir") {
      if (!isFetched.current) {
        getFiles(path);
        isFetched.current = true;
      } else {
        setToggle(!toggle)
      }
    } else {
      console.log("Open file")
    }
  }

  return (
    <div>
      <p onClick={() => handleClick(file.type, file.path)}>{file.name}</p>
      {(file.children && toggle) &&
        file.children.map((child) => (
          <FileTab key={child.name} file={child} getFiles={getFiles} />
        ))}
    </div>
  );
}
