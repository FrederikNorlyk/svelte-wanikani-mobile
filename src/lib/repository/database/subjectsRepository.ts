import type { Subject } from '$lib/functions/subjects.remote';
import * as API from '$lib/functions/subjects.remote';
import { openDb, withStore } from '$lib/repository/database/database';

export const SUBJECTS_STORE = 'subjects';

export const IDX_SUBJECT_LEVEL = 'by_level';
export const IDX_SUBJECT_TYPE = 'by_type';
export const IDX_SUBJECT_LEVEL_TYPE = 'by_level_type';

interface SyncHandlers {
	onSynchronize?: () => void;
	afterSynchronize?: () => void;
}

// TODO: Replace with `idb` npm package.
export default class SubjectsRepository {
	public static async count(): Promise<number> {
		return await withStore(SUBJECTS_STORE, 'readonly', (store) =>
			store.count()
		);
	}

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
			const transaction = db.transaction(SUBJECTS_STORE, 'readonly');
			const store = transaction.objectStore(SUBJECTS_STORE);
			const index = store.index(IDX_SUBJECT_LEVEL);

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

	public static async synchronize({
		onSynchronize,
		afterSynchronize
	}: SyncHandlers = {}) {
		onSynchronize?.();
		const subjects = await API.getAllSubjects();
		// TODO: Chunking, pr page
		await this.writeSubjects(subjects);
		afterSynchronize?.();
	}

	public static async getSubject(
		id: number,
		{ onSynchronize, afterSynchronize }: SyncHandlers
	): Promise<Subject | undefined> {
		let subject: Subject | undefined = await this.readSubject(id);

		if (!subject) {
			await this.synchronize({ onSynchronize, afterSynchronize });
			subject = await this.readSubject(id);
		}

		return subject;
	}

	public static async getSubjectsByLevel(level: number): Promise<Subject[]> {
		return withStore(SUBJECTS_STORE, 'readonly', (store) =>
			store.index(IDX_SUBJECT_LEVEL).getAll(level)
		);
	}

	public static async getSubjectsByType(
		type: Subject['type']
	): Promise<Subject[]> {
		return withStore(SUBJECTS_STORE, 'readonly', (store) =>
			store.index(IDX_SUBJECT_TYPE).getAll(type)
		);
	}

	public static async getSubjectsByLevelAndType(
		level: number,
		type: Subject['type']
	): Promise<Subject[]> {
		return withStore(SUBJECTS_STORE, 'readonly', (store) =>
			store.index(IDX_SUBJECT_LEVEL_TYPE).getAll([level, type])
		);
	}

	private static async writeSubjects(subjects: Subject[]): Promise<void> {
		const db = await openDb();

		await new Promise<void>((resolve, reject) => {
			const tx = db.transaction(SUBJECTS_STORE, 'readwrite');
			const store = tx.objectStore(SUBJECTS_STORE);

			for (const subject of subjects) {
				store.put(subject);
			}

			tx.oncomplete = () => resolve();
			tx.onabort = () =>
				reject(tx.error ?? new Error('IndexedDB transaction aborted.'));
			tx.onerror = () =>
				reject(tx.error ?? new Error('IndexedDB transaction failed.'));
		});
	}

	private static async readSubject(id: number): Promise<Subject | undefined> {
		const result = await withStore(SUBJECTS_STORE, 'readonly', (store) =>
			store.get(id)
		);
		return result ?? undefined;
	}

	public static onUpgradeNeeded(db: IDBDatabase, request: IDBOpenDBRequest) {
		let store: IDBObjectStore;
		if (db.objectStoreNames.contains(SUBJECTS_STORE)) {
			store = request.transaction!.objectStore(SUBJECTS_STORE);
		} else {
			store = db.createObjectStore(SUBJECTS_STORE, { keyPath: 'id' });
		}

		if (!store.indexNames.contains(IDX_SUBJECT_LEVEL)) {
			store.createIndex(IDX_SUBJECT_LEVEL, 'level', { unique: false });
		}

		if (!store.indexNames.contains(IDX_SUBJECT_TYPE)) {
			store.createIndex(IDX_SUBJECT_TYPE, 'type', { unique: false });
		}

		if (!store.indexNames.contains(IDX_SUBJECT_LEVEL_TYPE)) {
			store.createIndex(IDX_SUBJECT_LEVEL_TYPE, ['level', 'type'], {
				unique: false
			});
		}
	}
}
