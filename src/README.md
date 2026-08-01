# Track
> This project exposes the recently listened/currently playing track via Last.fm and returns the data.

One-click deploy to Cloudflare workers:

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/nabilridhwan/track)

# Required Environment Variables
In `wrangler.jsonc` or from your Cloudflare dashboard, make sure that both exists:
- `LAST_FM_API_KEY`
	- type: `secret`
    - description: LastFM API key
- `LAST_FM_USERNAME`
	- type: `plaintext`
    - description: LastFM username that you want to get the currently/recently played track of


# Usage

### GET `/`
Return the currently listening / recently playing data track. `isCurrentlyPlaying` denotes whether the track is currently playing

Example:
```json
{
	"track": {
		"name": "Dine N'Dash",
		"artistName": "The Strokes",
		"images": [
			{
				"size": "small",
				"#text": "https://lastfm.freetls.fastly.net/i/u/34s/86e66c508b9644b0cf80e97439ae2ccd.jpg"
			},
			{
				"size": "medium",
				"#text": "https://lastfm.freetls.fastly.net/i/u/64s/86e66c508b9644b0cf80e97439ae2ccd.jpg"
			},
			{
				"size": "large",
				"#text": "https://lastfm.freetls.fastly.net/i/u/174s/86e66c508b9644b0cf80e97439ae2ccd.jpg"
			},
			{
				"size": "extralarge",
				"#text": "https://lastfm.freetls.fastly.net/i/u/300x300/86e66c508b9644b0cf80e97439ae2ccd.jpg"
			}
		],
		"isCurrentlyPlaying": true
	}
}
```

### GET `/?image=true`
Returns the currently listening track via a SVG badge

Example:

![Currently Listening track](https://track.nabilridhwan.com/?image=true)&nbsp;
