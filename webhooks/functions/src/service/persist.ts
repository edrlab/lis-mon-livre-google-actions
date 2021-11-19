import {isValidHttpUrl} from '../utils';
import {IConversationWithParams} from '../type';
import {ok} from '..';

export function persistMediaPlayer(conv: IConversationWithParams) {
  if (!conv.request.context) {
    console.log('NO conv.request.context !!');
    return;
  }

  // Persist the media progress value

  const _progress = conv.request.context?.media?.progress || '0';
  const progress = parseInt(_progress, 10);
  const index = conv.request.context?.media?.index || 0;
  const url = conv.user.params.player.current.url;
  ok(isValidHttpUrl(url), 'error.urlNotValid');

  conv.user.params.player.current.index = index;
  conv.user.params.player.current.time = progress;

  conv.user.params.player.history.set(url, {
    index,
    time: progress,
    date: new Date(),
  });
}
