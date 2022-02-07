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

      const welcomeNewUser = 'Welcome to EDRLAB Library!\nTo fully enjoy your audiobooks and access your personal bookshelf, you will need to link your EDRLAB account.\nWould you like to do so now ?\n';

      data.prompt.firstSimple.speech.should.to.be.eq(welcomeNewUser);

      data.scene.next.name.should.to.be.eq('home_new_user');
    });

    it('main new user not linked', async () => {
      body.user.accountLinkingStatus = 'NOT_LINKED';
      const data = await expressMocked(body, headers);

      const welcomeNewUser = 'Welcome to EDRLAB Library!\nTo fully enjoy your audiobooks and access your personal bookshelf, you will need to link your EDRLAB account.\nWould you like to do so now ?\n';

      data.prompt.firstSimple.speech.should.to.be.eq(welcomeNewUser);

      data.scene.next.name.should.to.be.eq('home_new_user');
    });

    it('main new user linked', async () => {
      body.user.accountLinkingStatus = 'LINKED';
      const data = await expressMocked(body, headers);

      const welcomeUser = 'Welcome back to your EDRLAB Library!\nCongratulations! You have succesfully linked your account and can now access all of your favorite books!\nWould you like to search for a specific book or author, get a recommendation or would you prefer starting a book from your selection?\n';

      data.prompt.firstSimple.speech.should.to.be.eq(welcomeUser);

      data.scene.next.name.should.to.be.eq('home_user');
    });
  });
});
