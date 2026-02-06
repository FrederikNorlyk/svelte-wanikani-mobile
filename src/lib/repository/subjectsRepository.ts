import type { Subject } from '$lib/functions/subjects.remote';
import * as API from '$lib/functions/subjects.remote';

const DB_NAME = 'wanikani';
const DB_VERSION = 2;

const SUBJECTS_STORE = 'subjects';

const IDX_SUBJECT_LEVEL = 'by_level';
const IDX_SUBJECT_TYPE = 'by_type';
const IDX_SUBJECT_LEVEL_TYPE = 'by_level_type';

interface SyncHandlers {
	onSynchronize: () => void;
	afterSynchronize: () => void;
}

// TODO: Replace with `idb` npm package.
export default class SubjectsRepository {
	private static openPromise: Promise<IDBDatabase> | null = null;

	public static async getSubject(
		id: number,
		{ onSynchronize, afterSynchronize }: SyncHandlers
	): Promise<Subject | undefined> {
		let subject: Subject | undefined = await this.readSubject(id);

		if (!subject) {
			onSynchronize();
			const subjects = await API.getAllSubjects();
			// TODO: Chunking, pr page
			await this.writeSubjects(subjects);
			afterSynchronize();

			subject = await this.readSubject(id);
		}

		return subject;
	}

	public static async deleteAll(): Promise<void> {
		await this.withStore('readwrite', (store) => store.clear());
	}

	public static async getSubjectsByLevel(level: number): Promise<Subject[]> {
		return this.withStore('readonly', (store) =>
			store.index(IDX_SUBJECT_LEVEL).getAll(level)
		);
	}

	public static async getSubjectsByType(
		type: Subject['type']
	): Promise<Subject[]> {
		return this.withStore('readonly', (store) =>
			store.index(IDX_SUBJECT_TYPE).getAll(type)
		);
	}

	public static async getSubjectsByLevelAndType(
		level: number,
		type: Subject['type']
	): Promise<Subject[]> {
		return this.withStore('readonly', (store) =>
			store.index(IDX_SUBJECT_LEVEL_TYPE).getAll([level, type])
		);
	}

	private static open(): Promise<IDBDatabase> {
		if (this.openPromise) {
			return this.openPromise;
		}

		this.openPromise = new Promise((resolve, reject) => {
			if (typeof indexedDB === 'undefined') {
				reject(new Error('IndexedDB is not available in this environment.'));
				return;
			}

			const request = indexedDB.open(DB_NAME, DB_VERSION);

			request.onupgradeneeded = () => {
				const db = request.result;

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
			};

			request.onsuccess = () => resolve(request.result);

			request.onerror = () =>
				reject(request.error ?? new Error('Failed to open IndexedDB.'));
		});

		return this.openPromise;
	}

	private static async withStore<T>(
		mode: IDBTransactionMode,
		fn: (store: IDBObjectStore) => IDBRequest<T>
	): Promise<T> {
		const db = await this.open();

		return new Promise<T>((resolve, reject) => {
			const transaction = db.transaction(SUBJECTS_STORE, mode);
			const store = transaction.objectStore(SUBJECTS_STORE);

			const request = fn(store);

			request.onsuccess = () => resolve(request.result);
			request.onerror = () =>
				reject(request.error ?? new Error('IndexedDB request failed.'));

			transaction.onabort = () =>
				reject(
					transaction.error ?? new Error('IndexedDB transaction aborted.')
				);
		});
	}

	private static async writeSubjects(subjects: Subject[]): Promise<void> {
		const db = await this.open();

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
		const result = await this.withStore('readonly', (store) => store.get(id));
		return result ?? undefined;
	}
}
