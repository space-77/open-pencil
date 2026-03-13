import type { Doc2TsConfig } from "doc2ts";

const doc2tsConfig: Doc2TsConfig = {
  outDir: "./src/services",
  origins: [{ url: "http://localhost:8180/swagger/doc.json" }],
  postRender: 'npm run lint:fix',
  languageType: "typeScript",
  baseClassName: "ApiClient",
  baseClassPath: "./src/services/client.ts",
  resultTypeRender: 'Promise<[any, {typeName}["data"], {typeName}]>',
};

export default doc2tsConfig;
