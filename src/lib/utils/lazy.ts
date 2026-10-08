export const lazy = <T>(load: () => Promise<T>) => {
	let cached: Promise<T> | undefined

	return () => (cached ??= load())
}
