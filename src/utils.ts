import { readFileSync, readdirSync, statSync } from "fs";
import path, { basename, extname, join } from "path";
import { FileTag, LibuilderConfig } from "./Config";

export const jsExtensions = [".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"];

export function getDirectoryFromFilePath(path: string) {
  return join(path, "..");
}

export function getNestedFilesFromDirectory(
  dir: string,
  liBuilderJs: LibuilderConfig
): { file: string; tags: string[] }[] {
  const { defaultFileTags, additional_code, exclude } = liBuilderJs;

  return readdirSync(dir).reduce<{ file: string; tags: string[] }[]>(
    (files, file) => {
      if (exclude.includes(file) || !jsExtensions.includes(extname(file))) {
        return files;
      }

      const name = join(dir, file);

      const isDirectory = statSync(name).isDirectory();

      let fileTags = defaultFileTags;

      const fileFirstLine = getFileFirstLine(join(dir, file)).replace(
        /\s/g,
        ""
      );

      const fileFirstLineIsComment = fileFirstLine.startsWith("//");

      if (fileFirstLineIsComment) {
        const tags = fileFirstLine.replace("//", "").split("&");

        const serverTag = tags.includes("client") ? "client" : "server";

        const accessTag = tags.includes("private") ? "private" : "public";

        fileTags = [serverTag, accessTag];
      }

      const taggedFile = {
        file: name,
        tags: fileTags,
      };

      return isDirectory
        ? [...files, ...getNestedFilesFromDirectory(name, liBuilderJs)]
        : [...files, taggedFile];
    },
    []
  );
}

export function getFileFirstLine(filePath: string) {
  return readFileSync(filePath, "utf-8").split("\n")[0] || "";
}
