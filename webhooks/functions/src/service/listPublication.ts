import {TSdkScene} from '../sdk';
import {IConversationWithParams} from '../type';
import {getPubsFromFeed, isValidHttpUrl} from '../utils';
import {ok} from 'assert';
import {t} from '../translation';

export async function listPublication(url: string, conv: IConversationWithParams,
    errorScene: TSdkScene = conv.session?.params?.scene) {
  ok(isValidHttpUrl(url), 'url not valid');
  const list = await getPubsFromFeed(url);
  console.log('PUBs: ', list);

  const length = list.length;
  if (length > 1 || conv.session.params.nextUrlCounter) {
    let text = t('homeMembers.list.numberPublication', {length}) + '\n';

    list.map(({title, author}, i) => {
      text += t('homeMembers.list.numeroWithAuthor',
          {i: i + 1, title, author: author ? t('homeMembers.list.numeroWithAuthorOf', {author}) : ''});
    });

    text += '\n';
    text += t('homeMembers.selection.publication');

    conv.add('free', {text});
  } else if (length === 1) {
    conv.scene.next.name = 'ask_to_resume_listening_at_last_offset';
    conv.user.params.player.current.url = list[0].webpuburl;
  } else {
    conv.scene.next.name = errorScene;
    conv.add('homeMembers.list.noResult');
  }
}
