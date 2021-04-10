import {
  Manager,
  Plugin,
  TrackUtils,
  UnresolvedTrack,
  UnresolvedQuery,
  LoadType,
  SearchQuery,
  Track,
} from "erela.js";

const REGEX = /(?:https?:\/\/)?(?:www.|web.|m.)?(facebook|fb).(com|watch)\/(?:video.php\?v=\d+|(\S+)|photo.php\?v=\d+|\?v=\d+)|\S+\/videos\/((\S+)\/(\d+)|(\d+))\/?/;
const { get } = require('axios');
const cheerio = require('cheerio');

const buildSearch = (
  loadType: LoadType,
  tracks: UnresolvedTrack[],
  error: string
): SearchResult => ({
  loadType: loadType,
  tracks: tracks ?? [],
  playlist: null,
  exception: error
    ? {
        message: error,
        severity: "COMMON",
      }
    : null,
});

export class Facebook extends Plugin {
  private _search: (
    query: string | SearchQuery,
    requester?: unknown
  ) => Promise<SearchResult>;
  private manager: Manager;
  private readonly options: Options;

  public constructor() {
    super();
  }

  public load(manager: Manager) {
    this.manager = manager;
    this._search = manager.search.bind(manager);
    manager.search = this.search.bind(this);
  }

  private async search(
    query: string | SearchQuery,
    requester?: unknown
  ): Promise<SearchResult> {
    const finalQuery = (query as SearchQuery).query || (query as string);
    if (finalQuery.match(REGEX)) {
      try {
        const html = get((query as string).replace('/m.', '/'));
        const $ = cheerio.load(html.data);
        const r = $('script[type=\'application/ld+json\']');
        const json = JSON.parse(r[0].children[0].data);
        const obj = {
          title: json.name || 'null',
          thumbnail: json.thumbnailUrl || 'null',
          streamURL: json.url || 'null',
          url: query || 'null',
          author: json.author.name || 'null',
        };
        if (obj.streamURL) {
          const data = await this.manager.search(obj.streamURL, requester);
          // @ts-ignore
          data.tracks[0].title = obj.title;
          // @ts-ignore
          data.tracks[0].thumbnail = obj.thumbnail;
          // @ts-ignore
          data.tracks[0].uri = obj.url;
          return buildSearch("TRACK_LOADED", data.tracks as UnresolvedTrack[], null);
        } else {
          const msg = "Incorrect type for Facebook URL.";
          return buildSearch("LOAD_FAILED", null, msg);
        }
      } catch (e) {
        return buildSearch(e.loadType ?? "LOAD_FAILED", null, e.message ?? null);
      }
    }
    return this._search(query, requester);
  }
}

export interface Result {
  tracks: UnresolvedQuery[];
  name?: string;
}

export interface Options {
  /**
   * Whether to convert UnresolvedTracks to Track. Defaults to false.
   * **Note: This is** ***not*** **recommended as it spams YouTube and takes a while if a large playlist is loaded.**
   */
  convertUnresolved?: boolean;
}

export interface SearchResult {
  exception?: {
    severity: string;
    message: string;
  };
  loadType: string;
  playlist?: {
    duration: number;
    name: string;
  };
  tracks: UnresolvedTrack[];
}
