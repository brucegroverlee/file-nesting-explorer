import * as vscode from "vscode";
import { join } from "path";
import * as fs from "fs";

/**
 * Manages the sorting order of files and folders within a directory.
 * The sorting order is stored in a .sorting file in the directory.
 */
export class SortingManager {
  private static readonly SORTING_FILE = ".sorting";

  /**
   * Reads the sorting order from a .sorting file in the given directory.
   * @param directoryPath The path to the directory
   * @returns An array of basenames in the order they should appear, or null if no sorting file exists
   */
  public static async readSortingOrder(
    directoryPath: string
  ): Promise<string[] | null> {
    const sortingFilePath = join(directoryPath, this.SORTING_FILE);

    try {
      const uri = vscode.Uri.file(sortingFilePath);
      const fileData = await vscode.workspace.fs.readFile(uri);
      const content = Buffer.from(fileData).toString("utf8");
      
      // Parse the JSON content
      const sortingOrder = JSON.parse(content);
      
      if (Array.isArray(sortingOrder)) {
        return sortingOrder;
      }
      
      return null;
    } catch (error) {
      // File doesn't exist or is invalid
      return null;
    }
  }

  /**
   * Writes the sorting order to a .sorting file in the given directory.
   * @param directoryPath The path to the directory
   * @param basenames An array of basenames in the order they should appear
   */
  public static async writeSortingOrder(
    directoryPath: string,
    basenames: string[]
  ): Promise<void> {
    const sortingFilePath = join(directoryPath, this.SORTING_FILE);
    const uri = vscode.Uri.file(sortingFilePath);
    
    const content = JSON.stringify(basenames, null, 2);
    const buffer = Buffer.from(content, "utf8");
    
    await vscode.workspace.fs.writeFile(uri, buffer);
  }

  /**
   * Applies sorting order to a list of entries.
   * Entries not in the sorting order are placed at the end.
   * @param entries The entries to sort
   * @param sortingOrder The sorting order (array of basenames)
   * @returns The sorted entries
   */
  public static applySortingOrder<T extends { name: string }>(
    entries: T[],
    sortingOrder: string[]
  ): T[] {
    // Create a map for quick lookup of sorting indices
    const orderMap = new Map<string, number>();
    sortingOrder.forEach((name, index) => {
      orderMap.set(name, index);
    });

    // Sort entries based on the order map
    return entries.sort((a, b) => {
      const aIndex = orderMap.get(a.name);
      const bIndex = orderMap.get(b.name);

      // If both are in the sorting order, compare their indices
      if (aIndex !== undefined && bIndex !== undefined) {
        return aIndex - bIndex;
      }

      // If only a is in the sorting order, it comes first
      if (aIndex !== undefined) {
        return -1;
      }

      // If only b is in the sorting order, it comes first
      if (bIndex !== undefined) {
        return 1;
      }

      // If neither is in the sorting order, maintain their relative order
      return 0;
    });
  }

  /**
   * Moves an entry up in the sorting order.
   * Creates or updates the .sorting file in the parent directory.
   * @param entryPath The path to the entry to move
   * @param parentPath The path to the parent directory
   * @param siblings An array of sibling entry names
   */
  public static async moveUp(
    entryPath: string,
    parentPath: string,
    siblings: string[]
  ): Promise<void> {
    const basename = entryPath.split("/").pop()!;
    
    // Read existing sorting order or create a new one
    let sortingOrder = await this.readSortingOrder(parentPath);
    
    if (!sortingOrder) {
      // Create a new sorting order based on current siblings
      sortingOrder = [...siblings];
    } else {
      // Add any new siblings that aren't in the sorting order
      const newSiblings = siblings.filter(s => !sortingOrder!.includes(s));
      sortingOrder = [...sortingOrder, ...newSiblings];
    }

    // Find the current index of the entry
    const currentIndex = sortingOrder.indexOf(basename);
    
    if (currentIndex === -1) {
      // Entry not in sorting order, add it at the beginning
      sortingOrder.unshift(basename);
    } else if (currentIndex > 0) {
      // Swap with the previous entry
      [sortingOrder[currentIndex - 1], sortingOrder[currentIndex]] = 
        [sortingOrder[currentIndex], sortingOrder[currentIndex - 1]];
    }

    // Write the updated sorting order
    await this.writeSortingOrder(parentPath, sortingOrder);
  }

  /**
   * Moves an entry down in the sorting order.
   * Creates or updates the .sorting file in the parent directory.
   * @param entryPath The path to the entry to move
   * @param parentPath The path to the parent directory
   * @param siblings An array of sibling entry names
   */
  public static async moveDown(
    entryPath: string,
    parentPath: string,
    siblings: string[]
  ): Promise<void> {
    const basename = entryPath.split("/").pop()!;
    
    // Read existing sorting order or create a new one
    let sortingOrder = await this.readSortingOrder(parentPath);
    
    if (!sortingOrder) {
      // Create a new sorting order based on current siblings
      sortingOrder = [...siblings];
    } else {
      // Add any new siblings that aren't in the sorting order
      const newSiblings = siblings.filter(s => !sortingOrder!.includes(s));
      sortingOrder = [...sortingOrder, ...newSiblings];
    }

    // Find the current index of the entry
    const currentIndex = sortingOrder.indexOf(basename);
    
    if (currentIndex === -1) {
      // Entry not in sorting order, add it at the end
      sortingOrder.push(basename);
    } else if (currentIndex < sortingOrder.length - 1) {
      // Swap with the next entry
      [sortingOrder[currentIndex], sortingOrder[currentIndex + 1]] = 
        [sortingOrder[currentIndex + 1], sortingOrder[currentIndex]];
    }

    // Write the updated sorting order
    await this.writeSortingOrder(parentPath, sortingOrder);
  }

  /**
   * Removes entries from the sorting order in a directory.
   * Updates or deletes the .sorting file as needed.
   * @param entryPaths Array of full paths to entries to remove
   * @param parentPath The path to the parent directory
   */
  public static async removeFromSortingOrder(
    entryPaths: string[],
    parentPath: string
  ): Promise<void> {
    // Read existing sorting order
    const sortingOrder = await this.readSortingOrder(parentPath);
    
    if (!sortingOrder) {
      // No sorting file exists, nothing to do
      return;
    }

    // Get basenames of entries to remove
    const basenamesToRemove = entryPaths.map(path => path.split("/").pop()!);
    
    // Filter out the removed entries
    const updatedSortingOrder = sortingOrder.filter(
      name => !basenamesToRemove.includes(name)
    );

    if (updatedSortingOrder.length === 0) {
      // If no entries left, delete the .sorting file
      const sortingFilePath = join(parentPath, this.SORTING_FILE);
      try {
        await vscode.workspace.fs.delete(vscode.Uri.file(sortingFilePath));
      } catch (error) {
        // File might not exist, ignore
      }
    } else {
      // Write the updated sorting order
      await this.writeSortingOrder(parentPath, updatedSortingOrder);
    }
  }
}
