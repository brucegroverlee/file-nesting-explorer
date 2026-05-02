import { FileSystem } from "@/components/FileSystem";
import { ScrollArea } from "@/components/ui/scroll-area";

function App() {
  return (
    <div className="flex h-full flex-col">
      <ScrollArea className="flex-1">
        <FileSystem children={[]} />
      </ScrollArea>
    </div>
  );
}

export default App;
