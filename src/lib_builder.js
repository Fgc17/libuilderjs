import { readdirSync, statSync, readFileSync, writeFileSync, existsSync, unlinkSync } from "fs";
import { basename, join, relative } from "path";

const jsExtensions = [".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"];

function getFiles(dir, blacklist) {
  const files = [];
  const stack = [dir];

  while (stack.length) {
    const currentDir = stack.pop();
    const entries = readdirSync(currentDir);

    for (const entry of entries) {
      const entryPath = join(currentDir, entry);
      const isDirectory = statSync(entryPath).isDirectory();

      if (isDirectory) {
        stack.push(entryPath);
      } else if (jsExtensions.some((ext) => entry.endsWith(ext))) {
        if (!blacklist.includes(basename(entryPath))) {
          files.push(entryPath);
        }
      }
    }
  }

  return files;
}

function generateExportContent(files, _relativePath) {
  const groupedExports = {};

  for (const file of files) {
    if (file.includes(".private.")) continue;

    const fileContent = readFileSync(file, "utf8");
    const exportMatches = fileContent.match(/export (type|class|interface|function|const)\s+(\w+)/g);

    if (!exportMatches) continue;

    const relativePath = relative(_relativePath, file).replace(/\\/g, "/").replace(/\.[^/.]+$/, "");

    groupedExports[relativePath] = groupedExports[relativePath] || [];
    for (const match of exportMatches) {
      const [, exportKind, exportName] = match.split(" ");
      groupedExports[relativePath].push([exportKind, exportName]);
    }
  }

  let content = "";
  for (const relativePath in groupedExports) {
    content += `export { ${groupedExports[relativePath]
      .map(([exportKind, exportName]) => (exportKind !== "type" ? exportName : `type ${exportName}`))
      .join(", ")} } from './${relativePath}';\n`;
  }

  return content;
}

export function generateIndexFile(projectFolderPath, liBuilderJs) {
  const mandatoryliBuilderJsKeys = ['src', 'index'];

  if (!liBuilderJs) {
    console.error('Missing "_libuilderjs" key in package.json');
    process.exit(1);
  }

  if (!mandatoryliBuilderJsKeys.every((key) => liBuilderJs[key])) {
    console.error('Missing "src" or "index" key in "_libuilderjs" key in package.json');
    process.exit(1);
  }

  const directoryPath = join(projectFolderPath, liBuilderJs.src);
  const outputFilePath = join(projectFolderPath, liBuilderJs.index);

  if (existsSync(outputFilePath)) {
    unlinkSync(outputFilePath);
  }

  let blackList = [
    basename(liBuilderJs.additional_code || '')
  ]

  const packageFiles = getFiles(directoryPath, blackList);
  let packageIndexContent = generateExportContent(packageFiles, join(outputFilePath, ".."));

  if (liBuilderJs.additional_code) {
    const additionalCodePath = join(projectFolderPath, liBuilderJs.additional_code);

    if (existsSync(additionalCodePath)) {
      const additionalCodeContent = readFileSync(additionalCodePath, 'utf8');
      packageIndexContent = additionalCodeContent + '\n' + packageIndexContent;
    }
  }

  writeFileSync(outputFilePath, packageIndexContent, "utf8");
}