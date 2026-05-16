import { EntryNode } from "./@FileSystem/EntryNode";

import type { Entry } from "../../../Entry";

interface FileTreeProps {
  entries: Entry[];
}

export function FileSystem({ entries }: FileTreeProps) {
  return (
    <div
      data-testid="file-system"
      className="py-1 text-[13px] leading-[22px] select-none"
    >
      {entries.map((entry) => (
        <EntryNode key={entry.name} entry={entry} />
      ))}
    </div>
  );
}
