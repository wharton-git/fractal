let fallbackSequence = 0;

const byteToHex = (value: number) => value.toString(16).padStart(2, "0");

const formatUuidFromBytes = (bytes: Uint8Array) => {
	const segments = [
		Array.from(bytes.slice(0, 4), byteToHex).join(""),
		Array.from(bytes.slice(4, 6), byteToHex).join(""),
		Array.from(bytes.slice(6, 8), byteToHex).join(""),
		Array.from(bytes.slice(8, 10), byteToHex).join(""),
		Array.from(bytes.slice(10, 16), byteToHex).join(""),
	];

	return segments.join("-");
};

export const createClientId = () => {
	const cryptoApi = globalThis.crypto;

	if (typeof cryptoApi?.randomUUID === "function") {
		return cryptoApi.randomUUID();
	}

	if (typeof cryptoApi?.getRandomValues === "function") {
		const bytes = cryptoApi.getRandomValues(new Uint8Array(16));

		bytes[6] = (bytes[6] & 0x0f) | 0x40;
		bytes[8] = (bytes[8] & 0x3f) | 0x80;

		return formatUuidFromBytes(bytes);
	}

	fallbackSequence += 1;

	return `fallback-${Date.now().toString(36)}-${fallbackSequence.toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};
