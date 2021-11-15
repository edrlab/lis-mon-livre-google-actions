import {OpdsFetcher} from 'opds-fetcher-parser';
import * as assert from 'assert';
import {IOpdsLinkView} from 'opds-fetcher-parser/build/src/interface/opds';

export function isValidHttpUrl(url: string | undefined): url is string {
  let _url: URL;

  try {
    if (!url) return false;
    _url = new URL(url);
  } catch (_) {
    return false;
  }

  return _url.protocol === 'http:' || _url.protocol === 'https:';
}

export async function getPubsFromFeed(url: string) {
  const opds = new OpdsFetcher();
  const feed = await opds.feedRequest(url);

  assert.ok(Array.isArray(feed.publications), 'no publications');
  const list = feed.publications
      .filter(({openAccessLinks: l}) /* : l is IOpdsLinkView[]*/ => {
        return (
          Array.isArray(l) &&
          l[0] &&
          isValidHttpUrl(l[0].url)
        );
      })
      .slice(0, 5)
      .map(({title, authors, openAccessLinks}) => ({
        title: title,
        author: Array.isArray(authors) ? authors[0].name : '',
        webpuburl: (openAccessLinks as IOpdsLinkView[])[0].url,
      }));

  return list;
}
