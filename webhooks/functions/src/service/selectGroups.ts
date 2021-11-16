import {IConversationWithParams} from '../type';
import {getGroupsFromFeed, isValidHttpUrl} from '../utils';
import {ok} from 'assert';

export async function selectGroup(url: string, number: number, conv: IConversationWithParams) {
  ok(isValidHttpUrl(url), 'url not valid');
  const list = await getGroupsFromFeed(url);
  const group = list[number - 1];
  if (!group) {
    console.log('NO GROUPS found !!');
    conv.add(`Le numéro ${number} est inconnu. Veuillez choisir un autre numéro.`);
    conv.scene.next.name = conv.scene.name; // loop selection or search

    return;
  }

  console.log('Groups: ', group);

  conv.user.params.selection.url = group.groupUrl;
  // conv.scene.next.name = 'select_pub_after_selection';
}
