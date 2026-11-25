interface BadgeTrack {
	name: string;
	artistName: string;
	images: {
		size: 'small' | 'medium' | 'large' | 'extralarge';
		'#text': string;
	}[];
	isCurrentlyPlaying: boolean;
}

const defaultTheme = {
	background: '#000',
	border: '#fff',
	borderOpacity: '.2',
	text: '#fff',
	artistOpacity: '.78',
	sourceOpacity: '.2',
	fontFamily: 'Inter,Arial,sans-serif',
	titleFontSize: 14,
	titleFontWeight: 700,
	artistFontSize: 11,
	sourceFontSize: 9,
	sourceFontStyle: 'italic',
	cardRadius: 16,
	artRadius: 6,
};

export const theme = {
	default: defaultTheme,
	retro: {
		...defaultTheme,
		background: '#f2d8a7',
		border: '#8b412b',
		borderOpacity: '.75',
		text: '#512817',
		sourceOpacity: '.6',
		fontFamily: 'Courier New,Courier,monospace',
		cardRadius: 5,
		artRadius: 2,
	},
	cyberpunk: {
		...defaultTheme,
		background: '#160d2c',
		border: '#ff52d9',
		borderOpacity: '.9',
		text: '#6affef',
		sourceOpacity: '.55',
		fontFamily: 'Courier New,Courier,monospace',
		cardRadius: 3,
		artRadius: 1,
	},
	pink: {
		...defaultTheme,
		background: '#fce4ef',
		border: '#c64c86',
		borderOpacity: '.5',
		text: '#702044',
		sourceOpacity: '.6',
	},
	red: {
		...defaultTheme,
		background: '#420e16',
		border: '#ff626d',
		borderOpacity: '.65',
		text: '#fff1f1',
		sourceOpacity: '.55',
	},
	green: {
		...defaultTheme,
		background: '#102e24',
		border: '#58ce97',
		borderOpacity: '.65',
		text: '#e0ffed',
		sourceOpacity: '.55',
	},
	blue: {
		...defaultTheme,
		background: '#11294c',
		border: '#66adff',
		borderOpacity: '.65',
		text: '#eaf4ff',
		sourceOpacity: '.55',
	},
} as const;

export type BadgeTheme = keyof typeof theme;

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
export async function generateBadge(track: BadgeTrack | null, themeName: BadgeTheme = 'default') {
	const style = theme[themeName];
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
