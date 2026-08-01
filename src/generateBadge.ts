interface BadgeTrack {
	name: string;
	artistName: string;
	images: {
		size: 'small' | 'medium' | 'large' | 'extralarge';
		'#text': string;
	}[];
	isCurrentlyPlaying: boolean;
}

function escapeXml(value: string) {
	return value.replace(/[&<>"']/g, character => ({
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&apos;',
	})[character] ?? character);
}

function truncate(value: string, maxLength: number) {
	return value.length > maxLength
		? `${value.slice(0, maxLength - 1).trimEnd()}…`
		: value;
}

async function embedArtwork(url: string | undefined) {
	if (!url) return undefined;

	try {
		const response = await fetch(url);
		if (!response.ok) return undefined;

		const contentType = response.headers.get('Content-Type')?.split(';')[0];
		if (!contentType?.startsWith('image/')) return undefined;

		const bytes = new Uint8Array(await response.arrayBuffer());
		let binary = '';
		for (let offset = 0; offset < bytes.length; offset += 8192) {
			binary += String.fromCharCode(...bytes.subarray(offset, offset + 8192));
		}

		return `data:${contentType};base64,${btoa(binary)}`;
	} catch {
		return undefined;
	}
}

// Returns a compact SVG card for the currently listening track.
export async function generateBadge(track: BadgeTrack | null) {
	const artworkUrl = track
		? [...track.images].reverse().find(image => image['#text'])?.['#text']
		: undefined;
	const artwork = await embedArtwork(artworkUrl);
	const textX = artwork ? 68 : 16;
	const title = track ? truncate(track.name, 40) : 'Not listening right now';
	const artist = track ? truncate(track.artistName, 38) : 'Last.fm';
	const label = `Currently playing ${title} by ${artist}`;

	return `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="80" viewBox="0 0 320 80" role="img" aria-label="${escapeXml(label)}">
	<defs>
		<clipPath id="card"><rect width="260" height="64" rx="16"/></clipPath>
		<clipPath id="art"><rect x="16" y="12" width="40" height="40" rx="6"/></clipPath>
	</defs>
	<g clip-path="url(#card)">
		<rect x=".5" y=".5" width="259" height="63" rx="15.5" fill="#000" stroke="#fff" stroke-opacity=".2"/>
		${artwork ? `<image href="${artwork}" x="16" y="12" width="40" height="40" preserveAspectRatio="xMidYMid slice" clip-path="url(#art)"/>` : ''}
		<g font-family="Inter,Arial,sans-serif" fill="#fff">
			<!-- <text x="${textX}" y="14" font-size="9" font-weight="600" fill-opacity=".5" letter-spacing=".5">NOW PLAYING</text> -->
			<text x="${textX}" y="28" font-size="14" font-weight="700">${escapeXml(title)}</text>
			<text x="${textX}" y="44" font-size="11" fill-opacity=".78">${escapeXml(artist)}</text>
			<text x="250" y="47" text-anchor="end" font-size="9" font-style="italic" fill-opacity=".2">Source: Last.fm</text>
		</g>
	</g>
</svg>`;
}
