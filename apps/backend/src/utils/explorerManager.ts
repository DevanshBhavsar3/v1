import fs from "fs";
import path from "path";

interface File {
  type: "dir" | "file";
  path: string;
  name: string;
}

export class ExplorerManager {
  watchFiles(path: string, callback: () => void) {
    fs.watch(path, (event, filename) => {
      callback();
    });
  }

  getFiles(path: string, callback: (files: File[]) => void) {
    fs.readdir(path, { withFileTypes: true }, (err, data) => {
      if (err) {
        console.error(err);
        return err;
      }

      const files: File[] = data.map((file) => ({
        type: file.isDirectory() ? "dir" : "file",
        path: `${path}/${file.name}`,
        name: file.name,
      }));
      callback(files);
    });
  }

  getContent(path: string, callback: (data: string) => void) {
    fs.readFile(path, "utf-8", (err, data) => {
      if (err) {
        console.error(err);
        return err;
      }

      callback(data);
    });
  }

  writeContent(file: { path: string; content: string }, callback?: () => void) {
    // Create directory path if it doesn't exist
    const dirname = path.dirname(file.path);

    // Create directories recursively if they don't exist
    fs.mkdir(dirname, { recursive: true }, (mkdirErr) => {
      if (mkdirErr && mkdirErr.code !== "EEXIST") {
        console.error(mkdirErr);
        return mkdirErr;
      }
      console.log(file.path);

      // Now write the file
      fs.writeFile(file.path, file.content, (err) => {
        if (err) {
          console.error(err);
          return err;
        }
        if (callback) {
          callback();
        }
      });
    });
  }
}
