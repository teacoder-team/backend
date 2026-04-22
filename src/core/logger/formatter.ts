export const formatters = {
	level: (label: string) => {
		return { level: label.toUpperCase() }
	},
	log: (object: Record<string, unknown>) => {
		return object
	},
}

export const serializers = {
	err: (err: unknown) => {
		if (err instanceof Error) {
			return {
				type: err.constructor.name,
				message: err.message,
				stack: err.stack,
			}
		}
		return err
	},
	request: (req: Request) => ({
		method: req.method,
		url: req.url,
	}),
}
