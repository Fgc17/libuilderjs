

### LiBuilderJs

While developing a library it can be real painful to write the index file manually, having to write code and then export the export in the index file each time.

I wrote this script to automate the process of writing the index file, it recursively reads all files inside a given directory and generates an index file.

### Configuration

The script should be configured using the "_liBuilderJs" (just one B) key inside your library package.json, here are the possible options for it:

```ts
// package.json
{
  "_liBuilderJs": {
    src: string, // script will watch files inside this directory
    index: string, // path to the index file
    additional_code: string, // path to the additional code file
    mostly: "private" | "public", // public by default
  }
}
```

### Usage

#### Mostly

The `mostly` key is set to public by default, which means that all files under `src` will be exported in the index file, unless you add `.private` to the file name, in this case the file will not be exported. But if you set it to private, then all files will be private unless you add `.public` to the file name. This is useful when you want to export more files than you want to hide.

#### Additional code

The `additional_code` key is used to add additional code to the index file, for example, if you want to add a global import to all files, you can add it to the `additional_code` file and it will be added to the index file.

### Contributing

I plan to add more features to this script, as an array of directories for `src`, but for now it's just a simple script that does the job. If you have any ideas or suggestions, feel free to open an issue or a pull request.