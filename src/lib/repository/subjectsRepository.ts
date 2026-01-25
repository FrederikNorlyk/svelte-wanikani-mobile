import { getAllSubjects, type Subject } from '$lib/functions/subjects.remote';
import { Repository } from '$lib/repository/repository';

const KEY_PREFIX = 'subject.';

export default class SubjectsRepository extends Repository {
	public static async getSubject(id: string): Promise<Subject | undefined> {
		let subject: Subject | undefined = Repository.read(this.getKey(id));

		if (!subject) {
			// Delete all subjects from local storage
			Object.keys(localStorage)
				.filter((key) => key.startsWith(KEY_PREFIX))
				.forEach((key) => localStorage.removeItem(key));

			const allSubjects = await getAllSubjects();

			for (const newSubject of allSubjects) {
				Repository.write(this.getKey(String(newSubject.id)), newSubject);
			}

			subject = Repository.read(this.getKey(id));
		}

		return subject;
	}

	private static getKey(id: string): string {
		return `${KEY_PREFIX}${id}`;
	}
}
