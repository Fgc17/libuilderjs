#!/usr/bin/env node

import { join, basename } from "path";
import { readFileSync } from "fs";
import { generateIndex } from "./lib_builder.js";
import chokidar from "chokidar";
import debounce from "lodash/debounce.js";
import { LibuilderConfig } from "./Config.js";

const mandatoryliBuilderJsKeys: (keyof LibuilderConfig)[] = ["src", "index"];

let timeout: any;

const configPath = process.argv.slice(-1)[0];

const options = process.argv.slice(2, -1);

if (!configPath) throw "Missing .libuilderrc.js config file";

import(join(process.cwd(), configPath)).then(({ default: config }) => {
  if (!mandatoryliBuilderJsKeys.every((key) => config[key])) {
    console.error("Missing required keys in .libuilderrc.js config file");
    process.exit(1);
  }

  function buildIndex() {
    clearTimeout(timeout);

    timeout = setTimeout(() => {
      generateIndex(config);
    }, 300);
  }

  buildIndex();

  if (options.includes("--watch") || options.includes("-w")) {
    const projectFolderPath = process.cwd();

    const sourceCodeDirectory = join(projectFolderPath, config.src);

    const serverIndexPath = join(projectFolderPath, config.index);

    const clientIndexPath = join(projectFolderPath, config.client_index);

    const watcher = chokidar.watch(sourceCodeDirectory, {
      ignored: [clientIndexPath, serverIndexPath],
    });

    const debouncedBuild = debounce(buildIndex, 300);

    watcher.on("change", (filename) => {
      console.log(`File ${filename} has been changed, rebuilding...`);
      debouncedBuild();
    });
  } else {
    process.exit(0);
  }
});
