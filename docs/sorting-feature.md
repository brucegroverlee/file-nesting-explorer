# File and Folder Sorting Feature

## Overview

The File Nesting Explorer now supports custom sorting of files and folders within any directory. This feature allows you to manually arrange the order of items in your file tree.

## How It Works

### Context Menu Options

When you right-click on any file or folder in the File Nesting Explorer, you'll see two new options:
- **Move Up** - Moves the selected item up one position in the list
- **Move Down** - Moves the selected item down one position in the list

### Sorting Persistence

When you use the Move Up or Move Down commands, the extension creates a `.sorting` file in the parent directory. This file stores the custom order of all items in that directory.

**Example `.sorting` file:**
```json
[
  "components",
  "utils",
  "App.tsx",
  "index.tsx",
  "styles.css"
]
```

### Behavior

1. **Initial State**: Without a `.sorting` file, items are displayed in the default order (folders first, then files, both alphabetically sorted).

2. **Creating Custom Order**: When you first use Move Up or Move Down on an item, a `.sorting` file is created with the current order of all items in that directory.

3. **New Files**: Any new files or folders added to a directory with a `.sorting` file will automatically appear at the end of the sorted list.

4. **Hidden Files**: The `.sorting` files are automatically hidden from the File Nesting Explorer view, so they won't clutter your file tree.

5. **Nested Folders**: Each directory can have its own `.sorting` file, allowing you to customize the order at every level of your project structure.

6. **Automatic Cleanup**: The `.sorting` file is automatically updated when:
   - **Delete**: Entries are removed from the sorting order when deleted
   - **Cut/Paste**: Entries are removed from the original parent's sorting order when moved
   - **Rename**: Entry names are updated in the sorting order when renamed
   - **Empty Directory**: The `.sorting` file is deleted if all entries are removed

## Implementation Details

### New Files

- **`src/SortingManager.ts`**: Core utility class that handles reading/writing `.sorting` files and applying sort order
- **`src/commands/moveUp.ts`**: Command implementation for moving items up
- **`src/commands/moveDown.ts`**: Command implementation for moving items down

### Modified Files

- **`src/FileNestingCommands.ts`**: Registered the new commands
- **`src/FileNestingSystem.ts`**: Integrated sorting logic into the file tree generation
- **`src/commands/deleteEntry.ts`**: Added cleanup of sorting files when entries are deleted
- **`src/commands/pasteEntry.ts`**: Added cleanup of sorting files when entries are cut/moved
- **`src/commands/renameEntry.ts`**: Added update of sorting files when entries are renamed
- **`package.json`**: Added command definitions and context menu items

### Key Features

- **Automatic Refresh**: The view automatically refreshes after moving items to show the new order
- **Error Handling**: User-friendly error messages if something goes wrong
- **Confirmation Messages**: Success notifications when items are moved
- **Non-intrusive**: `.sorting` files are hidden from the explorer view

## Usage Example

1. Right-click on a file or folder in the File Nesting Explorer
2. Select "Move Up" or "Move Down" from the context menu
3. The item will move one position in the specified direction
4. A `.sorting` file is created/updated in the parent directory
5. The view refreshes to show the new order

## Technical Notes

- The `.sorting` file uses JSON format for easy readability and manual editing if needed
- The sorting is applied at the directory level, not globally
- The feature works with both regular folders and file nesting containers
- The sorting order is preserved across VS Code sessions
