import {expressMocked, shell} from '../test/utils.test';
import * as chai from 'chai';
// import * as sinon from 'sinon';
import {headers, request} from './conv.test';

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
    it('main', async () => {
      const data = await expressMocked(request, headers);

      data.prompt.firstSimple.speech.should.to.be.eq('Welcome to EDRLAB Library!\nTo fully enjoy your audiobooks and access your personal bookshelf, you will need to link your EDRLAB account.\nWould you like to do so now ?\n');
    });
  });
});
