import { defineConfig } from 'tsdown'

export default defineConfig({
	entry: ['./src/main.ts'],
	format: ['esm'],
	target: 'node22',
	clean: true,
	minify: true,
	sourcemap: true,
	treeshake: true,
})
