export abstract class Repository {
	protected static read<T>(key: string): T | undefined {
		const raw = localStorage.getItem(key);

		if (!raw) {
			return undefined;
		}

		let parsed;
		try {
			parsed = JSON.parse(raw);
		} catch {
			return undefined;
		}

		if (!parsed) {
			return undefined;
		}

		return parsed;
	}

	protected static write(key: string, value: object) {
		localStorage.setItem(key, JSON.stringify(value));
	}
}
