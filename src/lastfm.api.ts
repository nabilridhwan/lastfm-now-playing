const BASE_URL = 'https://ws.audioscrobbler.com/2.0/';

interface GetRecentTracksResponse {
	recenttracks: {
		track: {
			artist: {
				mbid: string,
				'#text': string;
			},
			streamable: '0' | '1',
			image: {
				size: 'small' | 'medium' | 'large' | 'extralarge',
				'#text': string
			}[],
			album: {
				mbid: string;
				'#text': string
			},
			name: string,
			url: string,
			'@attr'?: {
				'nowplaying': 'true' | 'false'
			}
		}[]
		'@attr': {
			user: string,
			totalPages: string,
			page: string,
			perPage: string,
			total: string;
		}
	};
}

interface GetRecentTracksProps {
	lastFmUsername: string;
	lastFmApikey: string;
}

export async function getRecentLastFMTracks({ lastFmUsername, lastFmApikey }: GetRecentTracksProps) {
	const url = new URL(BASE_URL);
	url.search = new URLSearchParams({
		method: 'user.getrecenttracks',
		user: lastFmUsername,
		format: 'json',
		api_key: lastFmApikey
	}).toString();

	const data = await fetch(url.toString()).then(res => res.json());

	return data as GetRecentTracksResponse;
}
