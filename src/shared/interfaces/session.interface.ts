/**
 * Basic user session.
 * Stored in Redis as a hash.
 */
export interface Session {
	/** Unique session ID */
	id: string
	/** Authentication token */
	token: string
	/** User ID */
	userId: string
}

/**
 * Geolocation information based on IP.
 */
export interface GeoInfo {
	/** Two-letter ISO country code */
	country: string
	/** Region / state */
	region: string
	/** City */
	city: string
	/** Coordinates [latitude, longitude] */
	ll: [number, number]
	/** ZIP / postal code */
	zip?: string
	/** International calling code */
	calling_code?: string
	/** Continent code */
	continent?: string
	/** Currency code of the country */
	currency_code?: string
	/** Timezone string */
	timezone?: string
	/** Is country a member of EU */
	is_eu_member?: boolean
}

/**
 * Fingerprint visit information.
 */
export interface FingerprintInfo {
	/** visitorId from FingerprintJS */
	visitorId: string
	/** requestId of the last request */
	requestId: string | null
}

/**
 * Information about the last visit.
 */
export interface VisitInfo {
	/** Visit time in ISO format */
	time: string
	/** URL visited by the user */
	url: string | null
	/** Incognito mode */
	incognito: boolean | null
}

/**
 * Detailed user session.
 * Stored in Redis as JSON.
 */
export interface UserSession {
	/** Unique UserSession ID */
	id: string
	/** Creation timestamp */
	createdAt: string
	/** Associated base session ID */
	sessionId: string
	/** User IP address */
	ip: string
	/** Geolocation information (null if unavailable) */
	geo: GeoInfo | null
	/** User Agent string */
	ua: string | null
	/** Browser information */
	browser: Record<string, any> | null
	/** CPU information */
	cpu: Record<string, any> | null
	/** Device information */
	device: Record<string, any> | null
	/** Browser engine information */
	engine: Record<string, any> | null
	/** Operating system information */
	os: Record<string, any> | null
	/** Fingerprint data, if provided */
	fingerprint: FingerprintInfo | null
	/** Information about the last visit */
	visit: VisitInfo
}
