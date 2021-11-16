import {TSdkScene} from '../sdk';
import {IConversationWithParams} from '../type';
import {getGroupsFromFeed, isValidHttpUrl} from '../utils';
import { ok } from 'assert';

export async function listGroups(url: string, conv: IConversationWithParams, nextScene: TSdkScene, errorScene: TSdkScene = conv.scene.name) {

  ok(isValidHttpUrl(url), "url not valid");
  const list = await getGroupsFromFeed(url);
  console.log('SELECTIONS: ', list);

  const length = list.length;
  if (length > 1) {
    conv.scene.next.name = nextScene;
    conv.add(`Il y a ${length} sélections :\n`);

    let text = '';
    list.map(({title}, i) => {
      text += `numero ${i + 1} : ${title}\n`;
    });
    conv.add(text);
  } else if (length === 1) {
    conv.scene.next.name = 'select_pub_after_selection';
    conv.user.params.selection.url = list[0].groupUrl;
  } else {
    conv.scene.next.name = errorScene;
    conv.add('aucun résultat trouvé');
  }
}
