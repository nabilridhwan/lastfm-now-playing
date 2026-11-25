import { BadgeTheme, themeStyles } from './badgeThemes';

interface BadgeTrack {
	name: string;
	artistName: string;
	images: {
		size: 'small' | 'medium' | 'large' | 'extralarge';
		'#text': string;
	}[];
	isCurrentlyPlaying: boolean;
	theme?: BadgeTheme;
}


// Escapes special characters in a string for use in XML.
function escapeXml(value: string) {
	return value.replace(/[&<>"']/g, character => ({
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&apos;',
	})[character] ?? character);
}

// Truncates a string to a maximum length, adding an ellipsis if it was truncated.
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
export async function generateBadge(args: BadgeTrack) {
	const style = themeStyles[args.theme ?? 'default'];
	const artworkUrl = args
		? [...args.images].reverse().find(image => image['#text'])?.['#text']
		: undefined;
	const artwork = await embedArtwork(artworkUrl);
	const textX = artwork ? 68 : 16;
	const title = args ? truncate(args.name, 40) : 'Not listening right now';
	const artist = args ? truncate(args.artistName, 38) : 'Last.fm';
	const label = `Currently playing ${title} by ${artist}`;

	return `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="80" viewBox="0 0 320 80" role="img" aria-label="${escapeXml(label)}">
	<defs>
		<clipPath id="card"><rect width="260" height="64" rx="${style.cardRadius}"/></clipPath>
		<clipPath id="art"><rect x="16" y="12" width="40" height="40" rx="${style.artRadius}"/></clipPath>
	</defs>
	<g clip-path="url(#card)">
		<rect x=".5" y=".5" width="259" height="63" rx="${style.cardRadius - 0.5}" fill="${style.background}" stroke="${style.border}" stroke-opacity="${style.borderOpacity}"/>
		${artwork ? `<image href="${artwork}" x="16" y="12" width="40" height="40" preserveAspectRatio="xMidYMid slice" clip-path="url(#art)"/>` : ''}
		<g font-family="${style.fontFamily}" fill="${style.text}">
			<text x="${textX}" y="28" font-size="${style.titleFontSize}" font-weight="${style.titleFontWeight}">${escapeXml(title)}</text>
			<text x="${textX}" y="44" font-size="${style.artistFontSize}" fill-opacity="${style.artistOpacity}">${escapeXml(artist)}</text>
			<text x="250" y="47" text-anchor="end" font-size="${style.sourceFontSize}" font-style="${style.sourceFontStyle}" fill-opacity="${style.sourceOpacity}">Source: Last.fm</text>
		</g>
	</g>
</svg>`;
}
