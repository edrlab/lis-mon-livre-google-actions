import {TSdkScene} from '../sdk';
import {IConversationWithParams} from '../type';
import {getGroupsFromFeed, isValidHttpUrl} from '../utils';
import {ok} from 'assert';
import {t} from '../translation';

export async function listGroups(url: string, conv: IConversationWithParams, errorScene: TSdkScene = conv.scene.name) {
  ok(isValidHttpUrl(url), 'url not valid');
  const list = await getGroupsFromFeed(conv.di.opds, url);
  console.log('SELECTIONS: ', list);

  const length = list.length;
  if (length > 1) {
    let text = t('homeMembers.list.numberSelection', {length});
    list.map(({title}, i) => {
      text += t('homeMembers.list.numero', {i: i + 1, title});
    });

    text += '\n';
    text += t('homeMembers.selection.listAfterSelection');

    conv.add('free', {text});
  } else if (length === 1) {
    conv.scene.next.name = 'select_publication';
    conv.session.params.pubListUrl = list[0].groupUrl;
  } else {
    conv.scene.next.name = errorScene;
    conv.add('homeMembers.list.noResult');
  }
}
