export const nodeTemplate =
  '<v1Artifact id="initial-node-setup" title="Initial Node.js App Setup">\n  <v1Action type="file" filePath="package.json">\n{\n  "name": "my-node-app",\n  "version": "1.0.0",\n  "description": "Initial setup for a Node.js application",\n  "main": "index.js",\n  "scripts": {\n    "start": "node index.js"\n  },\n  "author": "v1",\n  "license": "ISC"\n}\n  </v1Action>\n  <v1Action type="file" filePath="index.js">\nconsole.log(\'Hello, Node.js!\');\n  </v1Action>\n  <v1Action type="shell">\nnpm install && node index.js\n  </v1Action>\n</v1Artifact>';
