import fs from "fs"

const BASE_DIR = "/home/devansh/CodePlayground"

interface File {
  type: "dir" | "file"
  path: string,
  name: string
}

export class ExplorerManager {

  watchFiles(path: string, callback: () => void) {
    fs.watch(path, (event, filename) => {
      callback()
    })
  }

  getFiles(path: string, callback: (files: File[]) => void) {
    fs.readdir(path, { withFileTypes: true }, (err, data) => {
      if (err) {
        console.error(err)
        return err;
      }

      const files: File[] = data.map(file => ({ type: file.isDirectory() ? "dir" : "file", path: `${path}/${file.name}`, name: file.name }))
      callback(files)
    })
  }

  getContent(path: string, callback: (data: string) => void) {
    fs.readFile(path, "utf-8", (err, data) => {
      if (err) {
        console.error(err)
        return err;
      }

      callback(data)
    })
  }

  writeContent(file: { path: string, content: string }, callback: () => void) {
    fs.writeFile(file.path, file.content, (err) => {
      if (err) {
        console.error(err)
        return err;
      }
      callback()
    })
  }
}
