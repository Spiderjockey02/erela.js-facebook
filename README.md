<div align = "center">
<a href="https://github.com/Spiderjockey02/erela.js-facebook">
<img src="https://img.shields.io/npm/dw/erela.js-facebook?color=CC3534&logo=npm&style=for-the-badge" alt="Downloads">
</a>

<a href="https://github.com/Spiderjockey02/erela.js-facebook">
<img src="https://img.shields.io/npm/v/erela.js-facebook?color=red&label=Version&logo=npm&style=for-the-badge" alt="Npm version">
</a>
<br>

<a href="https://github.com/Spiderjockey02/erela.js-facebook">
<img src="https://img.shields.io/github/stars/Spiderjockey02/erela.js-facebook?color=333&logo=github&style=for-the-badge" alt="Github stars">
</a>

<a href="https://github.com/Spiderjockey02/erela.js-facebook/blob/master/LICENSE">
<img src="https://img.shields.io/github/license/Spiderjockey02/erela.js-facebook?color=6e5494&logo=github&style=for-the-badge" alt="License">
</a>
<hr>
</div>
This a plugin for Erela.JS to allow the use of Facebook URL's, it uses direct URL's to play the audio from the video.

- https://www.facebook.com/peopleareawesome/videos/best-videos-of-the-week/1426881677361006/
- https://www.facebook.com/peopleareawesome/videos/most-extreme-couples-duos-ultimate-compilation/340104053929709

## Documentation & Guides

It is recommended to read the documentation to start, and the guides to use the plugin.

- [Documentation](https://solaris.codes/projects/erelajs/docs/gettingstarted.html#getting-started 'Erela.js Documentation')

- [Guides](https://solaris.codes/projects/erelajs/guides/introduction.html 'Erela.js Guides')

## Installation

**NPM** :
```sh
npm install erela.js-facebook
```

**Yarn** :
```sh
yarn add erela.js-facebook
```

## Options

- ### convertUnresolved
> Converts all UnresolvedTracks into a Track. \
> **NOTE: THIS IS NOT RECOMMENDED AS IT WILL ATTEMPT TO CONVERT EVERY TRACK, INCLUDING ALBUMS AND PLAYLISTS TRACKS.** \
> **DEPENDING ON THE AMOUNT THIS WILL TAKE A WHILE AND MAY RATELIMIT YOUR LAVALINK NODE.**

## Example Usage

```javascript
const { Manager } = require("erela.js");
const Facebook = require("erela.js-facebook");

const manager = new Manager({
  plugins: [
    // Initiate the plugin
    new Facebook()
  ]
});

manager.search("https://www.facebook.com/peopleareawesome/videos/best-videos-of-the-week/1426881677361006");
```
