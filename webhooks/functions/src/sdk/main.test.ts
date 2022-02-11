import {expressMocked, shell} from '../test/utils.test';
import * as chai from 'chai';
// import * as sinon from 'sinon';
import {headers, body} from './conv.test';

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

      const welcomeNewUser = 'Welcome to EDRLAB Library!\n';

      data.prompt.firstSimple.speech.should.to.be.eq(welcomeNewUser);

      data.scene.next.name.should.to.be.eq('home_new_user');
    });

    it('main new user not linked', async () => {
      body.user.accountLinkingStatus = 'NOT_LINKED';
      const data = await expressMocked(body, headers);

      const welcomeNewUser = 'Welcome to EDRLAB Library!\n';

      data.prompt.firstSimple.speech.should.to.be.eq(welcomeNewUser);

      data.scene.next.name.should.to.be.eq('home_new_user');
    });

    it('main new user linked', async () => {
      body.user.accountLinkingStatus = 'LINKED';
      const data = await expressMocked(body, headers);

      const welcomeUser = 'Welcome back to your EDRLAB Library!\n';

      data.prompt.firstSimple.speech.should.to.be.eq(welcomeUser);

      data.scene.next.name.should.to.be.eq('home_user');
    });
  });
});
