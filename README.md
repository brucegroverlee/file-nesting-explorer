# React File Nesting Explorer

> Note: This extension is not the same as the [VSCode's File Nesting](https://code.visualstudio.com/updates/v1_67#_explorer-file-nesting) and is not integrated with it.

Build large React applications with ease by organizing your files in a minimalistic way. This extension allows you to nest your files in a tree structure, making it easier and more intuitive to compose your components and navigate your project.

![React File Nesting Explorer](./docs/file-nesting-explorer-overview.gif)

## Learn more about React File Nesting Design Pattern

Read [React file nesting design pattern](https://medium.com/@brucegroverlee/react-file-nesting-design-pattern-74fe6edba127) on Medium.

## Pre-requisites

- Install [Material Icon Theme](https://marketplace.visualstudio.com/items?itemName=PKief.material-icon-theme). To get the best experience, make sure to use the Material Icon Theme.

## Features

- **New Nested File**: Create a new file and nest it under the currently selected file.

![New Nested File](./docs/file-nesting-explorer-showcase-new-file.gif)

- **New Nested Folder**: Create a new folder and nest it under the currently selected file.

![New Nested Folder](./docs/file-nesting-explorer-showcase-new-folder.gif)

- **Delete File Nesting Container**: Delete nested files and folders under the currently selected file.

![Delete File Nesting Container](./docs/file-nesting-explorer-showcase-delete-container.gif)

## Get Started

1. Install the extension.
2. Open the FILE-NESTING-EXPLORER view.
3. Right-click on a react file to create a new nested file or folder.

## How does it work?

In the File system, the extension creates a Folder Container with the basename of the React file with the prefix @ (at) every time the user creates a nested file/folder related to the React file. On top of that, the extension creates a Virtual File System that hides the Folder Container and shows the nested files/folders under the React file. In this way, the Explorer Panel shows a more intuitive and organized view of the React file structure.

![Virtual File System](./docs/virtual-file-system.gif)

## Known Issues

Below are the known issues with the extension that are in the process of being fixed. Meantime, if you need any of these functionalities you can still open the default `vscode explorer panel` do what you need to do and go back to the `File nesting explorer`. If you find a bug, please report it [here](https://github.com/brucegroverlee/file-nesting-explorer/issues).

- **Paste file/folder from other vscode project**: When copying a file or folder from another vscode project and pasting it into the current project, the user gets an error message. [Issue #1](https://github.com/brucegroverlee/file-nesting-explorer/issues/1#issue-2716404277)

- **Copy and Paste a nesting file doesn't copy the folder container**: When copying a file and pasting it into another file, the folder container is not copied. [Issue #2](https://github.com/brucegroverlee/file-nesting-explorer/issues/2)

- **In the Panel's empty space, the Context Menu doesn't open**: This is a limitation of the VSCode API. The context menu only opens when you right-click on a View Item.

- **None of the `File nesting explorer` items can be editable**: Due to the VSCode API limitations, the items in the `File nesting explorer` are not editable. Instead, any time you need to rename a file or folder, or you have to create a new file or folder, you'll see the `InputBox` dialog at the top/center of the screen.

![InputBox Dialog](./docs/file-nesting-explorer-known-issues-rename.gif)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
