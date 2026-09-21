import { build } from "esbuild";
import { copyFile } from "node:fs/promises";

// Build a browser bundle that opens directly and include the complete dependency license.
await build({
  entryPoints: ["js/explorer.js"],
  bundle: true,
  minify: true,
  format: "iife",
  target: "es2022",
  outfile: "dist/explorer.js",
  legalComments: "linked",
  logLevel: "info",
});
await copyFile("node_modules/three/LICENSE", "dist/third_party_licenses.txt");
