/**
 * Loads a value once and hands the same promise to every later caller.
 * Failures are cached too - a resource that could not be loaded must keep
 * failing loudly instead of silently degrading to a no-op.
 */
/**
 * Loads a value once and hands the same promise to every later caller.
 * Failures are cached too - a resource that could not be loaded must keep
 * failing loudly instead of degrading into a silent no-op.
 */
export const lazy = <T>(load: () => Promise<T>) => {
	let cached: Promise<T> | undefined

	return () => (cached ??= load())
}
