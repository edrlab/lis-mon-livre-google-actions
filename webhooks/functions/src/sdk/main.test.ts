import { defaults, shell } from "./utils.test";
import * as chai from 'chai';
import * as sinon from 'sinon';
import { headers, request } from "./conv.test";
import { Assistant } from "../controller/Assistant";
import * as httpMocks from 'node-mocks-http';
import { handler } from "../controller/handler";
import * as proxyquire from 'proxyquire';
import { StorageModel } from "../model/storage.model";
import { document } from "firebase-functions/v1/firestore";
import { JsonObject } from "@assistant/conversation";

chai.should();

describe('main handler', () => {

  describe('sdk', () => {

    it('check main scene', (done) => {

      shell('cat custom/global/actions.intent.MAIN.yaml | grep "webhookHandler: main"', (stdout) => {

        stdout.should.to.be.eq("  webhookHandler: main\n");
        
      }, done);

    });
});

  describe('app', () => {

    it('main', async () => {

      let storageModel: StorageModel;
      const pull = sinon.stub().resolves({});
      const push = sinon.stub();

      const { StorageModel: _storageModel } = proxyquire('../model/storage.model', {
        './database': {
          pull,
          push,
        },
      }) as { StorageModel: StorageModel & { create: typeof StorageModel.create } };

      storageModel = await _storageModel.create('test');

      const assistant = new Assistant({ storageModel });

      handler(assistant);

      const req = httpMocks.createRequest({
        body: request,
        headers: headers,
        method: "POST",
      });

      const res = httpMocks.createResponse({
        eventEmitter: require('events').EventEmitter
      });

      const promise = new Promise<void>((resolve) => res.on('end', () => {
        const data = res._getData();
        data.prompt.firstSimple.speech.should.to.be.eq("Welcome to EDRLAB Library!\nTo fully enjoy your audiobooks and access your personal bookshelf, you will need to link your EDRLAB account.\nWould you like to do so now ?\n")

        resolve();
      }));

      assistant.app(req, res);

      return promise;
      
    });

  });

});