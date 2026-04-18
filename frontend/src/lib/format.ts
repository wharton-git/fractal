const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
	dateStyle: "medium",
	timeStyle: "medium",
});

const compactDateFormatter = new Intl.DateTimeFormat("fr-FR", {
	hour: "2-digit",
	minute: "2-digit",
	second: "2-digit",
});

export const formatTimestamp = (timestamp: string) =>
	dateFormatter.format(new Date(timestamp));

export const formatCompactTimestamp = (timestamp: string) =>
	compactDateFormatter.format(new Date(timestamp));

export const formatDuration = (durationMs: number) =>
	durationMs >= 1000
		? `${(durationMs / 1000).toFixed(2)} s`
		: `${Math.round(durationMs)} ms`;

export const formatAverage = (durationMs: number) =>
	durationMs === 0 ? "0 ms" : formatDuration(durationMs);

export const formatPercentage = (value: number) =>
	`${Math.round(value * 100)}%`;

export const serializePayload = (payload: unknown) => {
	try {
		return JSON.stringify(payload, null, 2);
	} catch {
		return "Impossible d afficher la charge utile JSON.";
	}
};
