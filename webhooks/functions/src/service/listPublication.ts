import {TSdkScene} from '../sdk';
import {IConversationWithParams} from '../type';
import {getPubsFromFeed, isValidHttpUrl} from '../utils';
import {ok} from 'assert';

export async function listPublication(url: string, conv: IConversationWithParams, nextScene: TSdkScene, errorScene: TSdkScene = conv.scene.name) {
  ok(isValidHttpUrl(url), 'url not valid');
  const list = await getPubsFromFeed(url);
  console.log('PUBs: ', list);

  const length = list.length;
  if (length > 1) {
    conv.scene.next.name = nextScene;
    conv.add('list.numberPublication', { length });

    let text = '';
    list.map(({title, author}, i) => {
      text += `numero ${i + 1} : ${title} ${author ? `de ${author}` : ''}\n`;
    });
    conv.add('free', { text });
  } else if (length === 1) {
    conv.scene.next.name = 'ask_to_resume_listening_at_last_offset';
    conv.user.params.player.current.url = list[0].webpuburl;
  } else {
    conv.scene.next.name = errorScene;
    conv.add('noResult');
  }
}
