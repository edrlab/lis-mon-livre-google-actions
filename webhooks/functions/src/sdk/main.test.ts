import {expressMocked, shell, storageModelMocked} from '../test/utils.test';
import * as chai from 'chai';
// import * as sinon from 'sinon';
import {headers, body} from './conv.test';
import {parsedDataClone} from '../model/data.model.test';

chai.should();

describe('main handler', () => {
  describe('sdk', () => {
    it('check main scene', (done) => {
      shell('cat custom/global/actions.intent.MAIN.yaml | grep "webhookHandler: main"', (stdout) => {
        stdout.should.to.be.eq('  webhookHandler: main\n');
      }, done);
    });
  });

  describe('app', () => {
    it('main new user unspecified', async () => {
      body.user.accountLinkingStatus = 'ACCOUNT_LINKING_STATUS_UNSPECIFIED';
      const data = await expressMocked(body, headers);

      const welcomeNewUser = 'Welcome to EOLE Library, where you can easily access your favorite audio books.\n';

      data.prompt.firstSimple.speech.should.to.be.eq(welcomeNewUser);

      data.scene.next.name.should.to.be.eq('home_new_user');
    });

    it('main new user not linked', async () => {
      body.user.accountLinkingStatus = 'NO_LINKED';
      const data = await expressMocked(body, headers);

      const welcomeNewUser = 'Welcome to EOLE Library, where you can easily access your favorite audio books.\n';

      data.prompt.firstSimple.speech.should.to.be.eq(welcomeNewUser);

      data.scene.next.name.should.to.be.eq('home_new_user');
    });

    it('main new user linked', async () => {
      body.user.accountLinkingStatus = 'LINKED';

      const pullData = parsedDataClone();
      const model = await storageModelMocked(pullData);
      const data = await expressMocked(body, headers, undefined, undefined, undefined, model.data);

      const welcomeUser = 'Welcome back to your EOLE Library! Remember, you can ask for help at any time.\n';

      data.prompt.firstSimple.speech.should.to.be.eq(welcomeUser);

      model.data.store.user.authentication.should.to.be.eq('NEWLY_LINKED');
      data.scene.next.name.should.to.be.eq('home_user');
    });
    it('main user linked', async () => {
      body.user.accountLinkingStatus = 'LINKED';

      const pullData = parsedDataClone();
      const model = await storageModelMocked(pullData);
      model.data.store.user.authentication = 'NEWLY_LINKED';
      const data = await expressMocked(body, headers, undefined, undefined, undefined, model.data);

      const welcomeUser = 'Welcome back to your EOLE Library! Remember, you can ask for help at any time.\n';

      data.prompt.firstSimple.speech.should.to.be.eq(welcomeUser);

      model.data.store.user.authentication.should.to.be.eq('LINKED');
      data.scene.next.name.should.to.be.eq('home_user');
    });
  });
});
