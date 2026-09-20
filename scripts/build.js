import { build } from "esbuild";
import { copyFile } from "node:fs/promises";

// 构建可直接打开的浏览器包，并随产物分发依赖的完整许可。
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
