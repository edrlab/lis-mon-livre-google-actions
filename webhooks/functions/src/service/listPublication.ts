import {TSdkScene} from '../sdk';
import {IConversationWithParams} from '../type';
import {getNextLinkFromPublicationsFeed, getPubsFromFeed, isPublicationAvailable, isValidHttpUrl} from '../utils';
import {ok} from 'assert';
import {t} from '../translation';

export async function listPublication(url: string, conv: IConversationWithParams,
    errorScene: TSdkScene = conv.session?.params?.scene) {
  ok(isValidHttpUrl(url), 'url not valid');
  const [list, totalLength] = await getPubsFromFeed(conv.di.opds, url);
  const nextUrl = await getNextLinkFromPublicationsFeed(conv.di.opds, url);
  console.log('PUBs: ', list);

  const length = list.length;
  if (length > 1 || conv.session.params.nextUrlCounter) {
    const page = conv.session.params.nextUrlCounter + 1;
    const nextAvailable = !!nextUrl && await isPublicationAvailable(conv.di.opds, nextUrl);
    let text = '';
    if (page === 1) {
      text += t('homeMembers.list.numberPublication', {length: totalLength}) + '\n';
    }
    if (page > 1 || nextAvailable) {
      text += t('homeMembers.list.pagePublication', {page}) + '\n';
    }

    list.map(({title, author}, i) => {
      text += t('homeMembers.list.numeroWithAuthor',
          {i: i + 1, title, author: author ? t('homeMembers.list.numeroWithAuthorOf', {author}) : ''});
    });

    text += '\n';
    text += t('homeMembers.selection.publication') + '\n';
    if (nextAvailable) {
      text += t('homeMembers.selection.next');
    }

    conv.add('free', {text});
  } else if (length === 1) {
    conv.scene.next.name = 'ask_to_resume_listening_at_last_offset';
    conv.user.params.player.current.url = list[0].webpuburl;
  } else {
    conv.scene.next.name = errorScene;
    conv.add('homeMembers.list.noResult');
  }
}
