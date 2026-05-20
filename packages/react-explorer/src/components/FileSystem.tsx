import { EntryNode } from "./@FileSystem/EntryNode";

import type { Entry } from "@file-nesting/shared";

interface FileTreeProps {
  entries: Entry[];
}

export function FileSystem({ entries }: FileTreeProps) {
  return (
    <div
      data-testid="file-system"
      className="py-1 text-[13px] leading-[22px] select-none"
      // This line prevents clicks on the file system from bubbling up to the parent
      onClick={(event) => event.stopPropagation()}
    >
      {entries.map((entry) => (
        <EntryNode key={entry.name} entry={entry} />
      ))}
    </div>
  );
}
