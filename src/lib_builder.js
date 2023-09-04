import { readdirSync, statSync, readFileSync, writeFileSync } from "fs";
import { join, relative } from "path";

const jsExtensions = [".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"]

function getFiles(dir, files_) {
  files_ = files_ || [];
  const files = readdirSync(dir);
  for (const i in files) {
    const name = join(dir, files[i]);
    if (statSync(name).isDirectory()) {
      getFiles(name, files_);
    } else if (jsExtensions.some((ext) => name.endsWith(ext))) {
      files_.push(name);
    }
  }
  return files_;
}

function generateExportContent(files, _relativePath) {
  const groupedExports = {};
  files.forEach((file) => {
    if (file.includes(".private.")) return;

    const fileContent = readFileSync(file, "utf8");
    const exportMatches = fileContent.match(/export (type|class|interface|function|const)\s+(\w+)/g);

    if (!exportMatches) return;

    const relativePath = relative(_relativePath, file)
      .replace(/\\/g, "/")
      .replace(/\.[^/.]+$/, "");

    groupedExports[relativePath] = groupedExports[relativePath] || [];
    exportMatches.forEach((match) => {
      const exportName = match.split(" ")[2];
      const exportKind = match.split(" ")[1];
      groupedExports[relativePath].push([exportKind, exportName]);
    });
  });

  let content = "";
  for (const relativePath in groupedExports) {
    content += `export { ${groupedExports[relativePath]
      .map((type) => (type[0] != "type" ? type[1] : `type ${type[1]}`))
      .join(", ")} } from './${relativePath}';\n`;
  }

  return content;
}

export function generateIndexFile(projectFolderPath, buildScripts) {
  
  const mandatoryBuildScriptsKeys = ['files', 'dist']
  
  if (!buildScripts || !mandatoryBuildScriptsKeys.every((key) => buildScripts[key])) {
    console.error('Missing or incomplete "_build-scripts" configuration in package.json');
    process.exit(1);
  }

  const directoryPath = join(projectFolderPath, buildScripts.files);
  const outputFilePath = join(projectFolderPath, buildScripts.dist);

  const packageFiles = getFiles(directoryPath);

  const packageIndexContent = generateExportContent(packageFiles, join(outputFilePath, ".."));

  writeFileSync(outputFilePath, packageIndexContent, "utf8");
}
