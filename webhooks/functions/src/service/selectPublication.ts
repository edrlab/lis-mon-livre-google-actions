import {IConversationWithParams} from '../type';
import {getPubsFromFeed} from '../utils';

export async function selectPublication(url: string, number: number, conv: IConversationWithParams) {
  const list = await getPubsFromFeed(url);
  const pub = list[number - 1];
  if (!pub) {
    console.log('NO PUBS found !!');
    conv.add(`Le numéro ${number} est inconnu. Veuillez choisir un autre numéro.`);
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
