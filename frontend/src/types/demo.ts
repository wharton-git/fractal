export type TestType = "health" | "info" | "cpu" | "latency" | "mixed" | "status";

export type Intensity = "low" | "medium" | "high";
export type BackendState = "idle" | "loading" | "ok" | "down";
export type AppRuntimeState =
	| "idle"
	| "test_running"
	| "monitoring"
	| "stop_requested";

export type FormState = {
	testType: TestType;
	durationMs: number;
	delayMs: number;
	intensity: Intensity;
	repeatCount: number;
	intervalMs: number;
};

export type RequestRecord = {
	id: string;
	testType: TestType;
	endpoint: string;
	paramsLabel: string;
	durationMs: number;
	statusCode: number;
	statusText: string;
	podName: string;
	timestamp: string;
	ok: boolean;
	response: unknown;
	errorMessage?: string;
	cancelled?: boolean;
};

export type ResourceSnapshot = {
	cpuLogicalCores: number;
	goMaxProcs: number;
	cpuQuotaCores?: number | null;
	networkRxBytesTotal?: number | null;
	networkTxBytesTotal?: number | null;
	memoryGoAllocBytes: number;
	memoryGoSysBytes: number;
	memoryCgroupCurrentBytes?: number | null;
	memoryCgroupLimitBytes?: number | null;
	memoryLimitUnlimited?: boolean;
	goroutines: number;
	timestamp: string;
};

export type PodMetricUsage = {
	cpuUsageMillicores: number;
	memoryUsageBytes: number;
};

export type PodMetricsSnapshot = {
	available: boolean;
	source: string;
	namespace?: string;
	timestamp: string;
	pods: Record<string, PodMetricUsage>;
	error?: string;
};

export type StatusPayload = {
	podName: string;
	timestamp: string;
	requestCount: number;
	averageResponseTimeMs: number;
	errorCount: number;
	inFlightRequests: number;
	uptime: string;
	lastRequest: {
		method: string;
		path: string;
		statusCode: number;
		durationMs: number;
		timestamp: string | null;
		hasRecentValue: boolean;
	};
	resources?: ResourceSnapshot;
};

export type InfoPayload = {
	hostname: string;
	podName: string;
	pid: number;
	timestamp: string;
	version: string;
	uptime: string;
	environment: string;
	region: string;
	instanceId: string;
	resources?: ResourceSnapshot;
};

export type PodObservation = {
	podName: string;
	requestCount: number | null;
	inFlightRequests: number | null;
	errorCount: number | null;
	averageResponseTimeMs: number | null;
	cpuUsageMillicores: number | null;
	cpuQuotaCores: number | null;
	memoryUsageBytes: number | null;
	memoryCgroupLimitBytes: number | null;
	memoryLimitUnlimited: boolean;
	lastSeen: string;
	hasBackendSnapshot: boolean;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === "object" && value !== null;

const isResourceSnapshot = (value: unknown): value is ResourceSnapshot =>
	isRecord(value) &&
	typeof value.cpuLogicalCores === "number" &&
	typeof value.goMaxProcs === "number" &&
	typeof value.memoryGoAllocBytes === "number" &&
	typeof value.memoryGoSysBytes === "number" &&
	typeof value.goroutines === "number" &&
	typeof value.timestamp === "string";

export const isStatusPayload = (value: unknown): value is StatusPayload =>
	isRecord(value) &&
	typeof value.podName === "string" &&
	typeof value.requestCount === "number" &&
	typeof value.averageResponseTimeMs === "number" &&
	(!("resources" in value) || value.resources == null || isResourceSnapshot(value.resources));

export const isInfoPayload = (value: unknown): value is InfoPayload =>
	isRecord(value) &&
	typeof value.hostname === "string" &&
	typeof value.podName === "string" &&
	typeof value.environment === "string" &&
	(!("resources" in value) || value.resources == null || isResourceSnapshot(value.resources));

export const isPodMetricsSnapshot = (value: unknown): value is PodMetricsSnapshot => {
	if (
		!isRecord(value) ||
		typeof value.available !== "boolean" ||
		typeof value.source !== "string" ||
		typeof value.timestamp !== "string" ||
		!("pods" in value) ||
		!isRecord(value.pods)
	) {
		return false;
	}

	return Object.values(value.pods).every(
		(podMetric) =>
			isRecord(podMetric) &&
			typeof podMetric.cpuUsageMillicores === "number" &&
			typeof podMetric.memoryUsageBytes === "number",
	);
};
