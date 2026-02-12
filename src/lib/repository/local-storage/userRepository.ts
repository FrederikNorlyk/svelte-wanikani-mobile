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
		if (forceSync) {
			const user = await UserAPI.getUser();
			Repository.write(KEY, user);
			return user;
		} else {
			let user: User | undefined = Repository.read(KEY);

			if (!user) {
				user = await UserAPI.getUser();
				Repository.write(KEY, user);
			}

			return user;
		}
	}

	public static setUser(user: User) {
		Repository.write(KEY, user);
	}
}
