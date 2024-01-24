import {
  readdirSync,
  statSync,
  readFileSync,
  writeFileSync,
  existsSync,
  unlinkSync,
  mkdirSync,
} from "fs";
import path, { basename, join, relative } from "path";
import { LibuilderConfig } from "./Config";
import {
  jsExtensions,
  getDirectoryFromFilePath,
  getNestedFilesFromDirectory,
} from "./utils.js";

function generateExportContent(files: string[], indexFilePath: string) {
  const relativeExportsPaths: string[] = [];

  for (const file of files) {
    const relativePath = relative(getDirectoryFromFilePath(indexFilePath), file)
      .replace(/\\/g, "/")
      .replace(/\.[^/.]+$/, "");

    relativeExportsPaths.push(relativePath);
  }

  let content = "";

  for (const relativePath of relativeExportsPaths) {
    content += `export * from './${relativePath}';\n`;
  }

  return content;
}

export function generateIndex(liBuilderJs: LibuilderConfig) {
  const projectFolderPath = process.cwd();

  const sourceCodeDirectory = join(projectFolderPath, liBuilderJs.src);

  const indexFilePath = join(projectFolderPath, liBuilderJs.index);

  const clientIndexFilePath = join(projectFolderPath, liBuilderJs.client_index);

  if (existsSync(indexFilePath)) {
    unlinkSync(indexFilePath);
  }

  const sourceCodeFiles = getNestedFilesFromDirectory(
    sourceCodeDirectory,
    liBuilderJs
  );

  const publicFiles = sourceCodeFiles.filter((file) =>
    file.tags.includes("public")
  );

  const clientFiles = publicFiles
    .filter((file) => file.tags.includes("client"))
    .map((file) => file.file);

  const serverFiles = publicFiles
    .filter(
      (file) => file.tags.includes("server") || !file.tags.includes("client")
    )
    .map((file) => file.file);

  let serverIndexContent = generateExportContent(serverFiles, indexFilePath);

  let clientIndexContent = generateExportContent(
    clientFiles,
    clientIndexFilePath
  );

  if (liBuilderJs.additional_code) {
    const additionalCodePath = join(
      projectFolderPath,
      liBuilderJs.additional_code
    );

    if (existsSync(additionalCodePath)) {
      const additionalCodeContent = readFileSync(additionalCodePath, "utf8");
      serverIndexContent = additionalCodeContent + "\n" + serverIndexContent;
      clientIndexContent = additionalCodeContent + "\n" + clientIndexContent;
    }
  }

  if (!existsSync(getDirectoryFromFilePath(indexFilePath))) {
    mkdirSync(getDirectoryFromFilePath(indexFilePath));
  }
  if (!existsSync(getDirectoryFromFilePath(clientIndexFilePath))) {
    mkdirSync(getDirectoryFromFilePath(clientIndexFilePath));
  }

  writeFileSync(indexFilePath, serverIndexContent, "utf8");
  writeFileSync(clientIndexFilePath, clientIndexContent, "utf8");
}
