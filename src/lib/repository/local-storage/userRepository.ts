import * as UserAPI from '$lib/functions/user.remote';
import { type User } from '$lib/functions/user.remote';
import { Repository } from '$lib/repository/local-storage/repository';

const KEY = 'user';

interface GetUserParams {
	forceSync?: boolean;
}

export default class UserRepository extends Repository {
	public static async getUser({
		forceSync = false
	}: GetUserParams = {}): Promise<User> {
		console.trace('Getting user. ForceSync = ' + forceSync);

		if (forceSync) {
			const user = await UserAPI.getUser();
			Repository.write(KEY, user);
			console.trace('Fetched user and persisted it.');
			console.dir(user);
			return user;
		} else {
			let user: User | undefined = Repository.read(KEY);

			if (!user) {
				user = await UserAPI.getUser();
				Repository.write(KEY, user);
				console.trace('No persisted user. Fetched it and persisted it.');
			} else {
				console.trace('Found persisted user.');
			}

			console.dir(user);

			return user;
		}
	}

	public static setUser(user: User) {
		console.trace('Setting user');
		console.dir(user);
		Repository.write(KEY, user);
	}
}
