import * as UserAPI from '$lib/functions/user.remote';
import { type User } from '$lib/functions/user.remote';
import { Repository } from '$lib/repository/repository';

const USER_KEY = 'user';

export default class UserRepository extends Repository {
	public static async getUser(): Promise<User> {
		let user: User | undefined = Repository.read(USER_KEY);

		if (!user) {
			user = await UserAPI.getUser();
			Repository.write(USER_KEY, user);
		}

		return user;
	}
}
