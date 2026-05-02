import { File, Folder, FolderOpen } from "lucide-react";

interface IconProps {
  open: boolean;
  type: "folder" | "file";
  extension?: string;
}

export const Icon = ({ open, type /*, extension*/ }: IconProps) => {
  if (type === "folder") {
    return open ? (
      <FolderOpen
        className="size-3.5 shrink-0 text-muted-foreground"
        aria-hidden
      />
    ) : (
      <Folder className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
    );
  }

  return <File />;
};
