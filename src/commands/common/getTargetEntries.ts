import { Entry } from "../../Entry";

/**
 * There is an issue when the user has selected multiple entries and clicks on one that is not selected,
 * the action is applied in the selected entries instead of just the clicked entry.
 *
 * This function determines which entries should be deleted based on whether the clicked entry is in the selection.
 * If the clicked entry is in the selection, delete all selected entries.
 * Otherwise, delete only the clicked entry.
 *
 * @param entry The entry that was clicked
 * @param selectedEntries The currently selected entries
 * @returns The entries to be deleted
 */
export const getTargetEntries = (
  entry: Entry,
  selectedEntries: readonly Entry[],
) => {
  const isClickInSelectedEntries = selectedEntries
    .map((selectedEntry) => selectedEntry.path)
    .includes(entry.path);

  return isClickInSelectedEntries ? selectedEntries : [entry];
};
