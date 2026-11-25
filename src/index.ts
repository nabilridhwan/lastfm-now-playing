import { getRecentLastFMTracks } from './lastfm.api';
import { generateBadge, theme as importedThemes, BadgeTheme } from './generateBadge';

export default {
	async fetch(request, env, ctx): Promise<Response> {

		const url = new URL(request.url);
		const searchParams = url.searchParams;

		const image = searchParams.get('image');
		const theme = searchParams.get('theme');

		try {
			const { recenttracks: { track: tracks } } = await getRecentLastFMTracks({
				lastFmUsername: env.LAST_FM_USERNAME,
				lastFmApikey: env.LAST_FM_API_KEY
			});

			if (tracks.length == 0) {
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

			const validThemes = Object.keys(importedThemes);

			// If requested for an image, return an image
			if (image) {


				let finalisedTheme: BadgeTheme = 'default';

				if (theme && validThemes.includes(theme)) {
					finalisedTheme = theme as BadgeTheme;
				}

				const svgRes = await generateBadge({
					name,
					artistName,
					isCurrentlyPlaying,
					images
				}, finalisedTheme);

				return new Response(svgRes, {
					headers: {
						'Content-Type': 'image/svg+xml; charset=utf-8',
						'Cache-Control': 'public, max-age=30',
						'Access-Control-Allow-Origin': '*'
					}
				});
			}

			const urlObjCopy = new URL(request.url);

			const themeRes: Record<string, string> = Object.keys(importedThemes).reduce((acc, theme) => {

				urlObjCopy.searchParams.set('image', 'true');
				urlObjCopy.searchParams.set('theme', theme);

				acc[theme] = urlObjCopy.toString();
				return acc;
			}, {} as Record<string, string>);

			return Response.json({
				track: body,
				user: env.LAST_FM_USERNAME,
				themes: themeRes
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
