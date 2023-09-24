#!/usr/bin/env node

import { join, basename, extname } from "path";
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

function buildTypes() {
  clearTimeout(timeout);

  timeout = setTimeout(() => {
    generateIndexFile(projectFolderPath, _liBuilderJs);
  }, 300); 
}

buildTypes();

const srcDir = join(projectFolderPath, _liBuilderJs.src)

watch(srcDir, { recursive: true }, (eventType, filename) => {
  const whiteList = [
    '.jsx',
    '.tsx',
    '.ts',
    '.js',
    '.cjs',
    '.mjs'
  ];

  const fileExtension = extname(filename);
  
  const baseFileName = basename(filename);

  const indexFileName = basename(_liBuilderJs.index)

  if (!filename || baseFileName === indexFileName || !whiteList.includes(fileExtension)) return;

  console.log(`File ${filename} has been changed, rebuilding...`);
  
  buildTypes();
});