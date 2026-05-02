import { EntryNode } from "./@FileSystem/EntryNode";

import type { Entry } from "../../../Entry";

interface FileTreeProps {
  children: Entry[];
}

export function FileSystem({ children }: FileTreeProps) {
  return (
    <div data-testid="file-system" className="py-1 text-[13px] leading-[22px]">
      {children.map((entry) => (
        <EntryNode key={entry.name} entry={entry} />
      ))}
    </div>
  );
}
