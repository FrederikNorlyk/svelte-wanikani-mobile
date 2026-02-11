import * as UserAPI from '$lib/functions/user.remote';
import { type User } from '$lib/functions/user.remote';
import { Repository } from '$lib/repository/local-storage/repository';

const KEY = 'user';

export default class UserRepository extends Repository {
	public static async getUser(): Promise<User> {
		let user: User | undefined = Repository.read(KEY);

		if (!user) {
			user = await UserAPI.getUser();
			Repository.write(KEY, user);
		}

		return user;
	}

	public static setUser(user: User) {
		Repository.write(KEY, user);
	}
}
