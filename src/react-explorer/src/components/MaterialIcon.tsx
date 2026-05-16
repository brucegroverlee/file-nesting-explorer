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
  folderNames?: Record<string, string>;
  folderNamesExpanded?: Record<string, string>;
  file?: string;
  folder?: string;
  folderExpanded?: string;
}

const m = manifest as unknown as ManifestShape;

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
        className={cn("inline-block size-3.5 shrink-0", className)}
      />
    );
  }

  return (
    <img
      src={`${baseUri}/${fileName}`}
      alt=""
      aria-hidden
      draggable={false}
      className={cn("size-3.5 shrink-0", className)}
    />
  );
};
