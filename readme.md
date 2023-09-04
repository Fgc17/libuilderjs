

### LibBuilderJs

While developing a library it can be real painful to write the index file manually, having to write code and then export export in the index file each time.

I wrote this script to automate the process of writing the index file, it recursively reads all files inside a given directory and generates an index file.

### Configuration

The script should be configured using the "_lib-builder" key inside your library package.json, here is the possible options for it:

```ts
// package.json
{
  "_lib-builder": {
    src: string, // path to the directory where your files are
    index: string, // path to the index file
    mostly: "private" | "public", // public by default
  }
}
```

The `mostly` key is set to public by default, which means that all files under `src` will be exported in the index file, unless you add `.private` to the file name, in this case the file will not be exported. But if you set it to private, then all files will be private unless you add `.public` to the file name. This is useful when you want to export more files than you want to hide.

### Contributing

I plan to add more features to this script, as an array of directories for `src`, but for now it's just a simple script that does the job. If you have any ideas or suggestions, feel free to open an issue or a pull request.