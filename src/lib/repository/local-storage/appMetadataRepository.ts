import { Repository } from '$lib/repository/local-storage/repository';

const KEY = 'appMetadata';

export interface AppMetadata {
	lastAssignmentsFetchTimestamp: Date;
}

export default class AppMetadataRepository extends Repository {
	public static get(): AppMetadata {
		let metadata: AppMetadata | undefined = Repository.read(KEY);

		metadata ??= {
			lastAssignmentsFetchTimestamp: new Date()
		};

		return metadata;
	}

	public static set(appState: AppMetadata) {
		Repository.write(KEY, appState);
	}
}
