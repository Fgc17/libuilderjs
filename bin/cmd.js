#!/usr/bin/env node

import { join } from "path";
import { watch, readFileSync } from "fs";
import { generateIndexFile } from "../src/lib_builder.js";

let timeout;

const args = process.argv.slice(2);
if (args.length !== 1) {
  console.error("Usage: node path_to_script.js project_folder_path");
  process.exit(1);
}

const projectFolderPath = args[0];
const packageJsonPath = join(projectFolderPath, "package.json");
const packageJsonContent = readFileSync(packageJsonPath, "utf8");
const packageJson = JSON.parse(packageJsonContent);
const _liBuilderJs = packageJson._liBuilderJs;

function buildTypes(projectFolderPath, _liBuilderJs) {
  clearTimeout(timeout);

  timeout = setTimeout(() => {
    generateIndexFile(projectFolderPath, _liBuilderJs);
  }, 300); 
}

buildTypes(projectFolderPath, _liBuilderJs);

watch(_liBuilderJs.src, { recursive: true }, (eventType, filename) => {
  if (
    filename &&
    (filename.endsWith(".ts") || filename.endsWith(".tsx")) &&
    filename !== _liBuilderJs.dist.split("/")[-1]
  ) {
    console.log(`File ${filename} has been changed, rebuilding types...`);
    buildTypes();
  }
});
