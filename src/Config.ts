import { basename } from "path";

export type FileTag = "private" | "public" | "client" | "server";

export class LibuilderConfig {
  constructor(
    {
      src,
      index,
      client_index,
      additional_code,
      defaultFileTags,
      exclude,
    }: {
      src: string;
      index: string;
      client_index: string;
      additional_code: string;
      defaultFileTags: FileTag[];
      exclude: string[];
    } = {
      src: "./src",
      index: "index.ts",
      client_index: "client_index.ts",
      additional_code: "",
      defaultFileTags: ["public", "server"],
      exclude: [],
    }
  ) {
    this.src = src || "./src";
    this.index = index || "index.ts";
    this.client_index = client_index || "client_index.ts";
    this.additional_code = additional_code = "";
    this.defaultFileTags = defaultFileTags || ["public", "server"];
    this.exclude = [...(exclude || []), basename(this.additional_code)];
  }

  src: string;
  index: string;
  client_index: string;
  additional_code: string;
  defaultFileTags: FileTag[];
  exclude: string[];
}
