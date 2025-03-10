// import { ArtifactProcessor } from "./artifactProcessor";
// import fs from "fs";
// let response: string;

// describe("Artifact Processor", () => {
//   it("should parse and give content", () => {
//     const response = `
//         <Artifact type="javascript" path="app.js">
//             console.log("Hello World");
//         </Artifact>
//         <ShellCommand>npm install express</ShellCommand>`;

//     const parser = new ArtifactProcessor(
//       (command) => {
//         console.log(command);
//         expect(command).toContain("npm install express");
//       },
//       (content, path) => {
//         expect(content).toContain('console.log("Hello World");');
//         expect(path).toBe("app.js");
//       }
//     );

//     parser.parse(response);
//   });
// });
