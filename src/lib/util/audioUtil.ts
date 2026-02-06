import type { Subject } from '$lib/functions/subjects.remote';
import type { AudioChoice } from '$lib/repository/settingsRepository';

export default class AudioUtil {
	public static async createAudioElement(
		subject: Subject,
		preferredAudio: AudioChoice,
		options?: { signal?: AbortSignal }
	): Promise<HTMLAudioElement | undefined> {
		const url = this.getAudioURL(subject, preferredAudio);

		if (!url) {
			return undefined;
		}

		const response = await fetch(url, { signal: options?.signal });
		const blob = await response.blob();
		const objectUrl = URL.createObjectURL(blob);

		const audio = new Audio(objectUrl);

		audio.onended = () => {
			URL.revokeObjectURL(objectUrl);
		};

		return audio;
	}

	private static getAudioURL(subject: Subject, preferredAudio: AudioChoice) {
		const primaryAudio = subject.audio.filter(
			(audio) =>
				audio.reading.toLowerCase() === subject.primaryReading?.toLowerCase()
		);

		let audioOptions = primaryAudio.length > 0 ? primaryAudio : subject.audio;

		if (preferredAudio !== 'Random') {
			const gender = preferredAudio === 'Feminine' ? 'female' : 'male';
			const filtered = audioOptions.filter((audio) => audio.gender === gender);

			audioOptions = filtered.length > 0 ? filtered : audioOptions;
		}

		if (audioOptions.length === 0) {
			return undefined;
		}

		const randomIndex = Math.floor(Math.random() * audioOptions.length);

		return audioOptions[randomIndex].url;
	}
}
