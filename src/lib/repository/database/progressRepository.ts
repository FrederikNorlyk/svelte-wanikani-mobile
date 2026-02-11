import { openDb, withStore } from '$lib/repository/database/database';

export const PROGRESS_STORE = 'progress';

export const IDX_PROGRESS_LEVEL = 'by_level';

export interface Progress {
	subjectId: number;
	level: number;
}

// TODO: Replace with `idb` npm package.
export default class ProgressRepository {
	/**
	 * Returns a map: { 1: n1, 2: n2, ..., 60: n60 }
	 * (levels outside the range are not included; missing levels are filled with 0)
	 */
	public static async countAllLevels(): Promise<Record<number, number>> {
		const counts: Record<number, number> = {};

		for (let lvl = 1; lvl <= 60; lvl++) {
			counts[lvl] = 0;
		}

		const db = await openDb();

		return await new Promise<Record<number, number>>((resolve, reject) => {
			const transaction = db.transaction(PROGRESS_STORE, 'readonly');
			const store = transaction.objectStore(PROGRESS_STORE);
			const index = store.index(IDX_PROGRESS_LEVEL);

			const range = IDBKeyRange.bound(1, 60);
			const request = index.openCursor(range);

			request.onsuccess = () => {
				const cursor = request.result;

				if (!cursor) {
					return;
				}

				const level = cursor.key as number;
				counts[level] = counts[level] + 1;

				cursor.continue();
			};

			request.onerror = () =>
				reject(request.error ?? new Error('IndexedDB cursor failed.'));

			transaction.oncomplete = () => resolve(counts);

			transaction.onabort = () =>
				reject(
					transaction.error ?? new Error('IndexedDB transaction aborted.')
				);

			transaction.onerror = () =>
				reject(transaction.error ?? new Error('IndexedDB transaction failed.'));
		});
	}

	public static async getByLevel(level: number): Promise<Progress[]> {
		return withStore(PROGRESS_STORE, 'readonly', (store) =>
			store.index(IDX_PROGRESS_LEVEL).getAll(level)
		);
	}

	public static async get(subjectId: number): Promise<Progress | undefined> {
		const result = await withStore(PROGRESS_STORE, 'readonly', (store) =>
			store.get(subjectId)
		);
		return result ?? undefined;
	}

	public static async set(progress: Progress): Promise<void> {
		const db = await openDb();

		await new Promise<void>((resolve, reject) => {
			const tx = db.transaction(PROGRESS_STORE, 'readwrite');
			const store = tx.objectStore(PROGRESS_STORE);

			store.put(progress);

			tx.oncomplete = () => resolve();

			tx.onabort = () =>
				reject(tx.error ?? new Error('IndexedDB transaction aborted.'));

			tx.onerror = () =>
				reject(tx.error ?? new Error('IndexedDB transaction failed.'));
		});
	}

	public static async deleteByLevel(level: number): Promise<void> {
		const db = await openDb();

		await new Promise<void>((resolve, reject) => {
			const transaction = db.transaction(PROGRESS_STORE, 'readwrite');
			const store = transaction.objectStore(PROGRESS_STORE);
			const index = store.index(IDX_PROGRESS_LEVEL);

			const request = index.openCursor(IDBKeyRange.only(level));

			request.onsuccess = () => {
				const cursor = request.result;

				if (!cursor) {
					return;
				}

				cursor.delete();
				cursor.continue();
			};

			request.onerror = () =>
				reject(request.error ?? new Error('IndexedDB cursor failed.'));

			transaction.oncomplete = () => resolve();

			transaction.onabort = () =>
				reject(
					transaction.error ?? new Error('IndexedDB transaction aborted.')
				);

			transaction.onerror = () =>
				reject(transaction.error ?? new Error('IndexedDB transaction failed.'));
		});
	}

	public static onUpgradeNeeded(db: IDBDatabase, request: IDBOpenDBRequest) {
		let store: IDBObjectStore;
		if (db.objectStoreNames.contains(PROGRESS_STORE)) {
			store = request.transaction!.objectStore(PROGRESS_STORE);
		} else {
			store = db.createObjectStore(PROGRESS_STORE, { keyPath: 'subjectId' });
		}

		if (!store.indexNames.contains(IDX_PROGRESS_LEVEL)) {
			store.createIndex(IDX_PROGRESS_LEVEL, 'level', { unique: false });
		}
	}
}
