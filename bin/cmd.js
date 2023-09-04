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
const buildScripts = packageJson._buildScripts;

function buildTypes(projectFolderPath, buildScripts) {
  // Clear any existing timeouts to prevent multiple calls
  clearTimeout(timeout);

  // Set a timeout to call the script after a delay, providing a debounce effect
  timeout = setTimeout(() => {
    generateIndexFile(projectFolderPath, buildScripts);
  }, 300); // 300 ms delay
}

// Initial build
buildTypes(projectFolderPath, buildScripts);

// Watch for changes in TypeScript files
watch(buildScripts.files, { recursive: true }, (eventType, filename) => {
  if (
    filename &&
    (filename.endsWith(".ts") || filename.endsWith(".tsx")) &&
    filename !== buildScripts.dist.split("/")[-1]
  ) {
    console.log(`File ${filename} has been changed, rebuilding types...`);
    buildTypes();
  }
});
