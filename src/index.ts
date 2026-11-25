import { getRecentLastFMTracks } from './lastfm.api';
import { generateBadge} from './generateBadge';
import {themeStyles, BadgeTheme} from './badgeThemes';
import * as sea from 'node:sea';

export default {
	async fetch(request, env, ctx): Promise<Response> {

		const searchParams = new URL(request.url).searchParams;
		const image = searchParams.get('image');
		const themeURL = searchParams.get('theme') as BadgeTheme | null;

		try {
			const { recenttracks: { track: tracks } } = await getRecentLastFMTracks({
				lastFmUsername: env.LAST_FM_USERNAME,
				lastFmApikey: env.LAST_FM_API_KEY
			});

			if (tracks.length == 0 || !tracks[0]) {
				return Response.json({ track: null });
			}

			const latestTrack = tracks[0];

			const { name, artist: { '#text': artistName }, image: images } = latestTrack;
			const isCurrentlyPlaying = latestTrack['@attr']?.nowplaying === 'true';

			const body = {
				name,
				artistName,
				images,
				isCurrentlyPlaying
			};

			const validThemes = Object.keys(themeStyles) as BadgeTheme[];

			// If requested for an image, return an image
			if (image) {
				let theme: BadgeTheme = (themeURL && validThemes.includes(themeURL)) ? themeURL : 'default';

				const svgResponse = await generateBadge({
					name,
					artistName,
					isCurrentlyPlaying,
					images,
					theme
				});

				return new Response(svgResponse, {
					headers: {
						'Content-Type': 'image/svg+xml; charset=utf-8',
						'Cache-Control': 'public, max-age=30',
						'Access-Control-Allow-Origin': '*'
					}
				});
			}

			const urlObjCopy = new URL(request.url);

			// An object with the theme name as the key and the url as the value, with the image and theme query params set
			const themeResponses: Record<string, string> = Object.keys(themeStyles).reduce((acc, theme) => {
				urlObjCopy.searchParams.set('image', 'true');
				urlObjCopy.searchParams.set('theme', theme);

				acc[theme] = urlObjCopy.toString();
				return acc;
			}, {} as Record<string, string>);

			return Response.json({
				track: body,
				themes: themeResponses
			}, {
				headers: {
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Methods': 'GET',
					'Access-Control-Max-Age': '86400'
				}
			});
		} catch (e) {
			console.error(e);
			return Response.json(e);
		}

	}
} satisfies ExportedHandler<Env>;
