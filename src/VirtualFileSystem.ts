import * as vscode from "vscode";

import { File, Folder } from "./Entry";

const now = Date.now();

export const RootFolder: Folder = {
  type: "folder",
  path: "/",
  name: "/",
  entries: new Map(),
};

const srcFolder: Folder = {
  type: "folder",
  path: "/src",
  name: "src",
  entries: new Map(),
};

const srcIndexFile: File = {
  type: "file",
  path: "/src/index.ts",
  name: "index.ts",
  extension: "ts",
};

const srcLayoutTsxFile: File = {
  type: "file",
  path: "/src/@App/Layout.tsx",
  name: "Layout.tsx",
  extension: "tsx",
};

const srcHeaderTsxFile: File = {
  type: "file",
  path: "/src/@App/@Layout/Header.tsx",
  name: "Header.tsx",
  extension: "tsx",
};

const srcNavigationTsxFile: File = {
  type: "file",
  path: "/src/@App/@Layout/Navigation.tsx",
  name: "Navigation.tsx",
  extension: "tsx",
};
srcLayoutTsxFile.isNesting = true;
srcLayoutTsxFile.entries = new Map([
  ["Header.tsx", srcHeaderTsxFile],
  ["Navigation.tsx", srcNavigationTsxFile],
]);

const srcContentTsxFile: File = {
  type: "file",
  path: "/src/@App/Content.tsx",
  name: "Content.tsx",
  extension: "tsx",
};

const srcAppTsxFile: File = {
  type: "file",
  path: "/src/App.tsx",
  name: "App.tsx",
  extension: "tsx",
  isNesting: true,
  entries: new Map([
    ["Layout.tsx", srcLayoutTsxFile],
    ["Content.tsx", srcContentTsxFile],
  ]),
};

srcFolder.entries.set("index.ts", srcIndexFile);
srcFolder.entries.set("App.tsx", srcAppTsxFile);

const rootIndexHtmlFile: File = {
  type: "file",
  path: "/index.html",
  name: "index.html",
  extension: "html",
};

const rootIndexJsFile: File = {
  type: "file",
  path: "/index.js",
  name: "index.js",
  extension: "js",
};

const rootIndexCssFile: File = {
  type: "file",
  path: "/index.css",
  name: "index.css",
  extension: "css",
};

RootFolder.entries.set("src", srcFolder);
RootFolder.entries.set("index.html", rootIndexHtmlFile);
RootFolder.entries.set("index.js", rootIndexJsFile);
RootFolder.entries.set("index.css", rootIndexCssFile);
