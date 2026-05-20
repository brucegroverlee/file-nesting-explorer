import { useMemo } from "react";

import manifest from "material-icon-theme/dist/material-icons.json";

import { cn } from "@/lib/utils";

declare global {
  interface Window {
    __materialIconBaseUri?: string;
  }
}

type IconDefinitions = Record<string, { iconPath: string }>;

interface ManifestShape {
  iconDefinitions: IconDefinitions;
  fileExtensions?: Record<string, string>;
  fileNames?: Record<string, string>;
  languageIds?: Record<string, string>;
  folderNames?: Record<string, string>;
  folderNamesExpanded?: Record<string, string>;
  file?: string;
  folder?: string;
  folderExpanded?: string;
}

const m = manifest as unknown as ManifestShape;

/**
 * Material Icon Theme registers some icons via VS Code's `languageIds` instead
 * of `fileExtensions` (e.g. `.ts` → `typescript`, `.js` → `javascript`). When
 * running outside VS Code we don't have a language service, so we map common
 * extensions to their language id manually and then look them up in
 * `manifest.languageIds`.
 */
const EXTENSION_TO_LANGUAGE_ID: Record<string, string> = {
  ts: "typescript",
  mts: "typescript",
  cts: "typescript",
  js: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  html: "html",
  htm: "html",
  xhtml: "html",
  yml: "yaml",
  yaml: "yaml",
  toml: "toml",
  ini: "ini",
  bat: "bat",
  cmd: "bat",
  ps1: "powershell",
  psm1: "powershell",
  psd1: "powershell",
  swift: "swift",
  kt: "kotlin",
  dart: "dart",
  r: "r",
  pl: "perl",
  pm: "perl",
  lua: "lua",
  php: "php",
  vb: "vb",
  fs: "fsharp",
  fsi: "fsharp",
  fsx: "fsharp",
  clj: "clojure",
  cljs: "clojure",
  cljc: "clojure",
  ex: "elixir",
  exs: "elixir",
  erl: "erlang",
  hrl: "erlang",
  hs: "haskell",
  lhs: "haskell",
  jl: "julia",
  nim: "nim",
  nix: "nix",
  ml: "ocaml",
  mli: "ocaml",
  pas: "pascal",
  rkt: "racket",
  scala: "scala",
  sc: "scala",
  tcl: "tcl",
  zig: "zig",
  groovy: "groovy",
  coffee: "coffeescript",
  mm: "objective-cpp",
  proto: "proto",
  sol: "solidity",
  tf: "terraform",
  twig: "twig",
  pug: "jade",
  jade: "jade",
  styl: "stylus",
  astro: "astro",
  ipynb: "jupyter",
  mdx: "mdx",
  rst: "restructuredtext",
  tex: "latex",
  ltx: "latex",
  bib: "bibtex",
  adoc: "asciidoc",
};

/**
 * Material-icon-theme stores `iconPath` like `./../icons/react_ts.svg`.
 * We only care about the basename (`react_ts.svg`); the directory prefix is
 * resolved via `window.__materialIconBaseUri` injected by the extension.
 */
function iconFileName(definitionName: string | undefined): string | null {
  if (!definitionName) {
    return null;
  }
  const def = m.iconDefinitions[definitionName];
  if (!def) {
    return null;
  }
  const segments = def.iconPath.split("/");
  return segments[segments.length - 1] || null;
}

function resolveFileIconName(name: string): string {
  const lower = name.toLowerCase();

  // 1) Exact filename match (e.g. "package.json", ".gitignore").
  const byName = m.fileNames?.[lower];
  if (byName) {
    return byName;
  }

  // 2) Try progressively shorter extensions (e.g. "Component.test.tsx" →
  //    "test.tsx" → "tsx") so multi-part extensions like ".test.tsx" win
  //    over single ones when defined.
  const parts = lower.split(".");
  for (let i = 1; i < parts.length; i++) {
    const ext = parts.slice(i).join(".");
    const byExt = m.fileExtensions?.[ext];
    if (byExt) {
      return byExt;
    }
  }

  // 3) Fall back to VS Code language id resolution for extensions Material
  //    Icon Theme registers via `languageIds` (e.g. `.ts`, `.js`, `.html`).
  for (let i = 1; i < parts.length; i++) {
    const ext = parts.slice(i).join(".");
    const languageId = EXTENSION_TO_LANGUAGE_ID[ext];
    if (languageId) {
      const byLang = m.languageIds?.[languageId];
      if (byLang) {
        return byLang;
      }
    }
  }

  return m.file ?? "file";
}

function resolveFolderIconName(name: string, open: boolean): string {
  const lower = name.toLowerCase();

  if (open) {
    const byNameExpanded = m.folderNamesExpanded?.[lower];
    if (byNameExpanded) {
      return byNameExpanded;
    }
    return m.folderExpanded ?? m.folder ?? "folder-open";
  }

  const byName = m.folderNames?.[lower];
  if (byName) {
    return byName;
  }
  return m.folder ?? "folder";
}

interface MaterialIconProps {
  /** File or folder name (e.g. "App.tsx", "src"). */
  name: string;
  /** Whether the entry is a folder; defaults to file. */
  type?: "file" | "folder";
  /** For folders, whether the expanded variant should be used. */
  open?: boolean;
  className?: string;
}

export const MaterialIcon = ({
  name,
  type = "file",
  open = false,
  className,
}: MaterialIconProps) => {
  const fileName = useMemo(() => {
    const definition =
      type === "folder"
        ? resolveFolderIconName(name, open)
        : resolveFileIconName(name);
    return iconFileName(definition);
  }, [name, type, open]);

  const baseUri =
    typeof window !== "undefined" ? window.__materialIconBaseUri : undefined;

  if (!fileName || !baseUri) {
    // Render an empty span so layout is preserved even if the icon can't be
    // resolved (e.g. running outside of the VS Code webview host).
    return (
      <span
        aria-hidden
        className={cn("inline-block size-[16px] shrink-0", className)}
      />
    );
  }

  return (
    <img
      src={`${baseUri}/${fileName}`}
      alt=""
      aria-hidden
      draggable={false}
      className={cn("size-[16px] shrink-0", className)}
    />
  );
};
