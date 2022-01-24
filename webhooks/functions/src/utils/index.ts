import {OpdsFetcher} from 'opds-fetcher-parser';
import * as assert from 'assert';
import {IOpdsLinkView} from 'opds-fetcher-parser/build/src/interface/opds';
import {URL} from 'url';

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

export async function getPubsFromFeed(opds: OpdsFetcher, url: string): Promise<[{
  title: string;
  author: string;
  webpuburl: string;
}[], number]> {
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

  return [list, feed.metadata?.numberOfItems || list.length];
}

export async function getGroupsFromFeed(opds: OpdsFetcher, url: string) {
  const feed = await opds.feedRequest(url);

  assert.ok(Array.isArray(feed.groups), 'no groups');
  const list = feed.groups
      .filter(({selfLink: l}) /* : l is IOpdsLinkView[]*/ => {
        return l?.title && l?.url && isValidHttpUrl(l.url);
      })
      .slice(0, 5)
      .map(({selfLink: {title, url}}) => ({
        title: title,
        groupUrl: url,
      }));

  return list;
}

export async function isPublicationAvailable(opds: OpdsFetcher, url: string): Promise<boolean> {
  assert.ok(isValidHttpUrl(url));
  const [pubs] = await getPubsFromFeed(opds, url);

  if (pubs.length) {
    return true;
  }
  return false;
}

export async function getNextLinkFromPublicationsFeed(opds: OpdsFetcher, url: string): Promise<string | undefined> {
  assert.ok(isValidHttpUrl(url));
  const feed = await opds.feedRequest(url);

  try {
    const nextLink = feed.links?.next[0].url;
    if (nextLink && await isPublicationAvailable(opds, nextLink)) {
      return nextLink;
    } else {
    }
  } catch {
  }
  return undefined;
}
