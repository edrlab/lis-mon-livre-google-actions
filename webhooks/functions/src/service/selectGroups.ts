import {ok} from '..';
import {IConversationWithParams} from '../type';
import {getGroupsFromFeed, isValidHttpUrl} from '../utils';

export async function selectGroup(url: string, number: number, conv: IConversationWithParams) {
  ok(isValidHttpUrl(url), 'error.urlNotValid');
  const list = await getGroupsFromFeed(url);
  const group = list[number - 1];
  if (!group) {
    console.log('NO GROUPS found !!');
    conv.add('wrongNumber', {number});
    conv.scene.next.name = conv.scene.name; // loop selection or search

    return;
  }

  console.log('Groups: ', group);

  conv.user.params.selection.url = group.groupUrl;
  // conv.scene.next.name = 'select_pub_after_selection';
}
