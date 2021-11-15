import {TApp} from '..';

export const testConversation = (app: TApp) => {
  app.handle('test_player_sdk', (conv) => {
    const nb = conv.intent.params?.number.resolved;

    switch (nb) {
      case 123:

        conv.user.params.player.current.index = 2;
        conv.user.params.player.current.playing = true;
        conv.user.params.player.current.time = 123;
        conv.user.params.player.current.url = 'https://storage.googleapis.com/audiobook_edrlab/webpub/therese_raquin_emile_zola.json';
        conv.user.params.player.history.set('https://storage.googleapis.com/audiobook_edrlab/webpub/therese_raquin_emile_zola.json', {
          index: 2,
          date: new Date(),
          time: 123,
        });

        break;

      case 456:

        break;
      case 789:

        break;
    }

    console.log('test_PLAYER');
    console.log(conv.user.params);

    conv.add(`test player ${nb}`);
  });

  app.handle('test_setup_sdk', (conv) => {
    const nb = conv.intent.params?.number.resolved;


    console.log('HELLLO ');


    console.log(conv.user.params.bearerToken);
    conv.user.params.bearerToken = `test-${nb}`;
    console.log(conv.user.params.bearerToken);

    console.log('HELLLO ');

    conv.add(`setup test ${nb}`);
  });
};
