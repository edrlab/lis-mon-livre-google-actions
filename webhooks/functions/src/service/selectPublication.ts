import {ok} from '..';
import {IConversationWithParams} from '../type';
import {getPubsFromFeed, isValidHttpUrl} from '../utils';

export async function selectPublication(url: string, number: number, conv: IConversationWithParams) {
  ok(isValidHttpUrl(url), 'error.urlNotValid');
  const [list] = await getPubsFromFeed(url);
  const pub = list[number - 1];
  if (!pub) {
    console.log('NO PUBS found !!');
    conv.add('homeMembers.list.wrongNumber', {number});
    conv.scene.next.name = conv.scene.name; // loop selection or search

    return;
  }

  console.log('PUB: ', pub);

  const urlWebpub = pub.webpuburl;
  const history = conv.user.params.player.history.get(urlWebpub);
  conv.user.params.player.current.index = history ? history.index : 0;
  conv.user.params.player.current.time = history ? history.time : 0;
  conv.user.params.player.current.url = urlWebpub;

  conv.scene.next.name = 'ask_to_resume_listening_at_last_offset';
}
