import { Repository } from '$lib/repository/local-storage/repository';

const KEY = 'appMetadata';

export interface AppMetadata {
	lastAssignmentsFetchTimestamp: Date;
	hasSeenNotificationSubscribeButton: boolean;
}

export default class AppMetadataRepository extends Repository {
	public static get(): AppMetadata {
		let metadata: AppMetadata | undefined = Repository.read(KEY);

		metadata ??= {
			lastAssignmentsFetchTimestamp: new Date(),
			hasSeenNotificationSubscribeButton: false
		};

		return metadata;
	}

	private static set(appState: AppMetadata) {
		Repository.write(KEY, appState);
	}

	public static setLastAssignmentsFetchTimestamp(date: Date) {
		const existing = this.get();
		this.set({ ...existing, lastAssignmentsFetchTimestamp: date });
	}

	public static setHasSeenNotificationSubscribeButton(value: boolean) {
		const existing = this.get();
		this.set({ ...existing, hasSeenNotificationSubscribeButton: value });
	}
}
