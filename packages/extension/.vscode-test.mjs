import { defineConfig } from '@vscode/test-cli';

export default defineConfig({
	files: ['out/*.test.js', 'out/test/**/*.test.js', 'out/commands/**/*.test.js'],
});
