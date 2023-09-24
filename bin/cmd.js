#!/usr/bin/env node

import { join, basename } from "path";
import {  readFileSync } from "fs";
import { generateIndexFile } from "../src/lib_builder.js";
import chokidar from 'chokidar';
import debounce from 'lodash/debounce.js';

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

const indexAbsolutePath = join(projectFolderPath, _liBuilderJs.index)

const watcher = chokidar.watch(srcDir, { ignored: indexAbsolutePath });

const debouncedBuildTypes = debounce(buildTypes, 300);

watcher.on('change', (filename) => {
  console.log(`File ${filename} has been changed, rebuilding...`);
  debouncedBuildTypes();
});