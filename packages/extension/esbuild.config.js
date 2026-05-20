/**
 * Bundle the extension entry point into a single CommonJS file consumed by
 * VS Code. Bundling is required when the extension depends on a workspace
 * package (`@file-nesting/shared`): vsce can't follow the workspace symlink
 * out of the package directory and Microsoft recommends bundling for
 * performance regardless. Tests still rely on the `tsc -b` output in `out/`,
 * but the extension entry (`out/extension.js`) is overwritten by esbuild so
 * `main` in `package.json` keeps pointing at it.
 */
const esbuild = require("esbuild");
const path = require("path");

const watch = process.argv.includes("--watch");
const minify = process.argv.includes("--minify");

/** @type {import("esbuild").BuildOptions} */
const options = {
  entryPoints: [path.resolve(__dirname, "src", "extension.ts")],
  outfile: path.resolve(__dirname, "out", "extension.js"),
  bundle: true,
  format: "cjs",
  platform: "node",
  target: "node18",
  // vscode is supplied by the host at runtime; never bundle it.
  external: ["vscode"],
  sourcemap: !minify,
  minify,
  logLevel: "info",
};

async function run() {
  if (watch) {
    const ctx = await esbuild.context(options);
    await ctx.watch();
    console.log("[esbuild] watching extension entry...");
  } else {
    await esbuild.build(options);
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
