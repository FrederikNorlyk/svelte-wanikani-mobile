import { Repository } from '$lib/repository/local-storage/repository';

const KEY = 'settings';

export const AUDIO_CHOICES = ['Feminine', 'Masculine', 'Random'] as const;

export type AudioChoice = (typeof AUDIO_CHOICES)[number];

export interface Settings {
	preferredAudio: AudioChoice;
	playAudio: boolean;
}

export default class SettingsRepository extends Repository {
	public static get(): Settings {
		let settings: Settings | undefined = Repository.read(KEY);

		settings ??= {
			preferredAudio: 'Random',
			playAudio: true
		};

		return settings;
	}

	public static set(settings: Settings) {
		Repository.write(KEY, settings);
	}
}
