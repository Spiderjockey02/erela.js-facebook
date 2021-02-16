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

const REGEX = /(https?:\/\/)(www\.|m\.)?(facebook|fb).com\/.*\/videos\/.*/;
const fetch = require("node-fetch").default;
const { JSDOM } = require("jsdom");

const check = (options: Options) => {
  if (!options) throw new TypeError("Options must not be empty.");
  if (
    typeof options.convertUnresolved !== "undefined" &&
    typeof options.convertUnresolved !== "boolean"
  )
    throw new TypeError(' option "convertUnresolved" must be a boolean.');
};

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

  public constructor(options: Options) {
    super();
    check(options);
    this.options = {
      ...options,
    };
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
        const html = fetch((query as string).replace("/m.", "/").replace("/m.", "/")).then((res) => res.text());
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
