'use strict';
const __awaiter = (this && this.__awaiter) || function(thisArg, _arguments, P, generator) {
	function adopt(value) {
		return value instanceof P ? value : new P(function(resolve) {
			resolve(value);
		});
	}
	return new (P || (P = Promise))(function(resolve, reject) {
		function fulfilled(value) {
			try {
				step(generator.next(value));
			} catch (e) { reject(e); }
		}
		function rejected(value) {
			try {
				step(generator['throw'](value));
			} catch (e) { reject(e); }
		}
		function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
		step((generator = generator.apply(thisArg, _arguments || [])).next());
	});
};
const __importDefault = (this && this.__importDefault) || function(mod) {
	return (mod && mod.__esModule) ? mod : { 'default': mod };
};

Object.defineProperty(exports, '__esModule', { value: true });
exports.Facebook = void 0;
const erela_js_1 = require('erela.js');
const axios_1 = __importDefault(require('axios'));
const REGEX = /(https?:\/\/)(www\.|m\.)?(facebook|fb).com\/.*\/videos\/.*/;
const fetch = require('node-fetch').default;
const { JSDOM } = require('jsdom');

const check = (options) => {
    if (typeof options.convertUnresolved !== "undefined" &&
        typeof options.convertUnresolved !== "boolean")
        throw new TypeError('Spotify option "convertUnresolved" must be a boolean.');

};

const buildSearch = (loadType, tracks, error) => ({
	loadType: loadType,
	tracks: tracks !== null && tracks !== void 0 ? tracks : [],
	playlist: null,
	exception: error ? {
		message: error,
		severity: 'COMMON',
	} : null,
});

class Facebook extends erela_js_1.Plugin {
	constructor(options) {
		super();
		check(options);
    this.options = Object.assign({}, options);
		this.functions = {
			track: this.getTrack.bind(this),
		};
	}

	load(manager) {
		this.manager = manager;
		this._search = manager.search.bind(manager);
		manager.search = this.search.bind(this);
	}

	search(query, requester) {
		let _a, _b, _c;
		return __awaiter(this, void 0, void 0, function* () {
			const finalQuery = query.query || query;
			const [, type, id] = (_a = finalQuery.match(REGEX)) !== null && _a !== void 0 ? _a : [];
			if (finalQuery.match(REGEX)) {
				try {
					const html = yield fetch(query.replace('/m.', '/')).then(res => res.text());
					const document = new JSDOM(html).window.document;
					const rawdata = document.querySelector('script[type="application/ld+json"]').innerHTML;
					const json = JSON.parse(rawdata);
					const obj = {
						title: document.querySelector('meta[property="og:title"]').attributes.item(1).value,
						thumbnail: json.thumbnailUrl,
						streamURL: json.url,
						url: html.split('",page_uri:"')[1].split('",')[0],
						author: json.author.name,
					};
					if (obj.streamURL) {
						const data = yield this.manager.search(obj.streamURL, requester);
						data.tracks[0].title = obj.title;
						data.tracks[0].thumbnail = obj.thumbnail;
						data.tracks[0].uri = obj.url;
						// if (this.options.convertUnresolved) {track.resolve();}
						return buildSearch('TRACK_LOADED', [data.tracks], null);
					} else {
						const msg = 'Incorrect type for Facebook URL.';
						return buildSearch('LOAD_FAILED', null, msg);
					}
				} catch (e) {
					console.log(e);
					return buildSearch((_b = e.loadType) !== null && _b !== void 0 ? _b : 'LOAD_FAILED', null, (_c = e.message) !== null && _c !== void 0 ? _c : null, null);
				}
			}
			return this._search(query, requester);
		});
	}

	getTrack(id) {
		console.log('dfhjldfshj');
		return __awaiter(this, void 0, void 0, function* () {
			try {
				const html = yield fetch(id.replace('/m.', '/')).text();
				const document = new JSDOM(html).window.document;
				const rawdata = document.querySelector('script[type="application/ld+json"]').innerHTML;
				const json = JSON.parse(rawdata);
				const obj = {
					title: document.querySelector('meta[property="og:title"]').attributes.item(1).value,
					thumbnail: json.thumbnailUrl,
					streamURL: json.url,
					url: html.split('",page_uri:"')[1].split('",')[0],
					author: json.author.name,
				};
				const track = obj.streamURL;// Facebook.convertToUnresolved(json.url);
				console.log('Hello' + track);
				return { tracks: [track] };
			} catch (e) {
				console.log(e);
				return { tracks: null };
			}
		});
	}
}
exports.Facebook = Facebook;
