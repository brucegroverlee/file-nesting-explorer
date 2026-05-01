import { FileTree } from "@/components/file-tree";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FAKE_TREE } from "@/lib/fake-fs";

function App() {
  return (
    <div className="flex h-full flex-col">
      <ScrollArea className="flex-1">
        <FileTree root={FAKE_TREE} />
      </ScrollArea>
    </div>
  );
}

export default App;
