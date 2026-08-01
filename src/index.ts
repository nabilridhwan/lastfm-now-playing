import { getRecentTracks } from './lastfm.api';
import { generateBadge } from './generateBadge';

export default {
	async fetch(request, env, ctx): Promise<Response> {

		const url = new URL(request.url);

		const image= url.searchParams.get("image");

		try{
			const {recenttracks: {track: tracks} }= await getRecentTracks({
				lastFmUsername: env.LAST_FM_USERNAME,
				lastFmApikey: env.LAST_FM_API_KEY
			})

			if(tracks.length == 0){
				return Response.json({track: null})
			}

			const latestTrack = tracks[0]

			const {name, artist: {"#text": artistName}, image: images} = latestTrack
			const isCurrentlyPlaying = latestTrack['@attr']?.nowplaying === 'true'

			const body = {
				name,
				artistName,
				images,
				isCurrentlyPlaying
			}

			// If requested for an image, return an image
			if (image) {
				const svgRes = await generateBadge({
					name,
					artistName,
					isCurrentlyPlaying,
					images
				});

				return new Response(svgRes, {
					headers: {
						'Content-Type': 'image/svg+xml; charset=utf-8',
						'Cache-Control': 'public, max-age=30',
						'Access-Control-Allow-Origin': '*',
					}
				});
			}

			return Response.json({
				track: body
			}, {
				headers: {
					"Access-Control-Allow-Origin": "*",
					"Access-Control-Allow-Methods": "GET",
					"Access-Control-Max-Age": "86400",
				}
			});
		}catch(e){
			return Response.json(e);
		}

	},
} satisfies ExportedHandler<Env>;
