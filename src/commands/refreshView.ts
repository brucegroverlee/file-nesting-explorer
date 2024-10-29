import { fileNestingProvider } from "../FileNestingProvider";

export const refreshView = () => {
  fileNestingProvider.refresh();
};
