import ProgressRepository from '$lib/repository/database/progressRepository';
import SubjectsRepository from '$lib/repository/database/subjectsRepository';

const DB_NAME = 'wanikani';
const DB_VERSION = 3;

let openPromise: Promise<IDBDatabase> | null = null;

export async function deleteAll(): Promise<void> {
	// If we have an open connection, close it before deleting the DB.
	const existingOpen = openPromise;
	openPromise = null;

	try {
		const db = await existingOpen;
		db?.close();
	} catch {
		// ignore: db might not be open / open might have failed
	}

	await new Promise<void>((resolve, reject) => {
		if (typeof indexedDB === 'undefined') {
			reject(new Error('IndexedDB is not available in this environment.'));
			return;
		}

		const request = indexedDB.deleteDatabase(DB_NAME);

		request.onsuccess = () => resolve();

		request.onerror = () =>
			reject(
				request.error ?? new Error('Failed to delete IndexedDB database.')
			);

		request.onblocked = () =>
			reject(
				new Error(
					'Failed to delete IndexedDB database because it is blocked (another tab/window may still be using it).'
				)
			);
	});
}

export function openDb(): Promise<IDBDatabase> {
	if (openPromise) {
		return openPromise;
	}

	openPromise = new Promise((resolve, reject) => {
		if (typeof indexedDB === 'undefined') {
			reject(new Error('IndexedDB is not available in this environment.'));
			return;
		}

		const request = indexedDB.open(DB_NAME, DB_VERSION);

		request.onupgradeneeded = () => {
			const db = request.result;

			SubjectsRepository.onUpgradeNeeded(db, request);
			ProgressRepository.onUpgradeNeeded(db, request);
		};

		request.onsuccess = () => resolve(request.result);

		request.onerror = () =>
			reject(request.error ?? new Error('Failed to open IndexedDB.'));
	});

	return openPromise;
}

export async function withStore<T>(
	storeName: string,
	mode: IDBTransactionMode,
	fn: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
	const db = await openDb();

	return new Promise<T>((resolve, reject) => {
		const transaction = db.transaction(storeName, mode);
		const store = transaction.objectStore(storeName);

		const request = fn(store);

		request.onsuccess = () => resolve(request.result);

		request.onerror = () =>
			reject(request.error ?? new Error('IndexedDB request failed.'));

		transaction.onabort = () =>
			reject(transaction.error ?? new Error('IndexedDB transaction aborted.'));
	});
}
