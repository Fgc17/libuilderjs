import { LibuilderConfig } from "../dist/Config.js";

const config = new LibuilderConfig({
  src: "./examples/src",
  index: "./examples/dist/index.ts",
  client_index: "./examples/dist/index.client.ts",
});

export default config;
