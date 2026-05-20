/**
 * Fake in-memory file tree used by the prototype React Explorer panel.
 * No real filesystem access yet — this is just sample data that roughly
 * mirrors a small React project layout with some nested files.
 */

export type FsNode = FolderNode | FileNode

export interface FolderNode {
  kind: 'folder'
  name: string
  children: FsNode[]
}

export interface FileNode {
  kind: 'file'
  name: string
  /** Nested "sibling" files (e.g. Button.tsx → Button.test.tsx, Button.css). */
  nested?: FileNode[]
}

export const FAKE_TREE: FolderNode = {
  kind: 'folder',
  name: 'my-app',
  children: [
    {
      kind: 'folder',
      name: 'src',
      children: [
        {
          kind: 'folder',
          name: 'components',
          children: [
            {
              kind: 'file',
              name: 'Button.tsx',
              nested: [
                { kind: 'file', name: 'Button.test.tsx' },
                { kind: 'file', name: 'Button.module.css' },
                { kind: 'file', name: 'Button.stories.tsx' },
              ],
            },
            {
              kind: 'file',
              name: 'Card.tsx',
              nested: [
                { kind: 'file', name: 'Card.test.tsx' },
                { kind: 'file', name: 'Card.module.css' },
              ],
            },
            { kind: 'file', name: 'Input.tsx' },
          ],
        },
        {
          kind: 'folder',
          name: 'hooks',
          children: [
            { kind: 'file', name: 'useAuth.ts' },
            { kind: 'file', name: 'useDebounce.ts' },
          ],
        },
        {
          kind: 'folder',
          name: 'pages',
          children: [
            {
              kind: 'file',
              name: 'Home.tsx',
              nested: [{ kind: 'file', name: 'Home.test.tsx' }],
            },
            { kind: 'file', name: 'About.tsx' },
          ],
        },
        {
          kind: 'file',
          name: 'App.tsx',
          nested: [
            { kind: 'file', name: 'App.test.tsx' },
            { kind: 'file', name: 'App.css' },
          ],
        },
        { kind: 'file', name: 'main.tsx' },
        { kind: 'file', name: 'index.css' },
      ],
    },
    {
      kind: 'folder',
      name: 'public',
      children: [
        { kind: 'file', name: 'favicon.svg' },
        { kind: 'file', name: 'robots.txt' },
      ],
    },
    { kind: 'file', name: 'package.json' },
    { kind: 'file', name: 'tsconfig.json' },
    { kind: 'file', name: 'vite.config.ts' },
    { kind: 'file', name: 'README.md' },
  ],
}
