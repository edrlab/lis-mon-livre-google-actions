import * as sinon from 'sinon';
import * as proxyquire from 'proxyquire';
import {StorageModel} from '../model/storage.model';

// class-transformer
import 'reflect-metadata';
import {exec} from 'child_process';
import {JsonObject} from '@assistant/conversation';
import {Assistant} from '../controller/Assistant';
import {handler} from '../controller/handler';
export const SDK_PATH = '../../sdk';

import * as httpMocks from 'node-mocks-http';
import {IStorage} from '../model/storage.interface';
import {OpdsFetcher} from 'opds-fetcher-parser';
import {IWebPubView} from 'opds-fetcher-parser/build/src/interface/webpub';
import {IOpdsResultView} from 'opds-fetcher-parser/build/src/interface/opds';

export const defaults = {
  cwd: process.env.PWD + '/' + SDK_PATH,
  env: process.env,
};

export const shell = (s: string, fn: (s: string) => void, done: (...a: any[]) => any) => {
  exec(s, defaults, (err, stdout) => {
    fn(stdout);

    done(err);
  });
};

export const storageModelMocked = async (pullData: IStorage | undefined = undefined) => {
  const pull = sinon.stub().resolves(pullData);
  const push = sinon.stub();

  const {StorageModel: _storageModel} = proxyquire('../model/storage.model', {
    './database': {
      pull,
      push,
    },
  }) as { StorageModel: StorageModel & { create: typeof StorageModel.create } };

  const data = await _storageModel.create('test');

  return {
    // @ts-ignore
    data,
    pull,
    push,
  };
};

export const fetcherMocked = (feed?: Partial<IOpdsResultView>, webpub?: Partial<IWebPubView>) => {
  const fetcher = sinon.createStubInstance(OpdsFetcher, {
    // @ts-ignore
    feedRequest: sinon.stub().returns(Promise.resolve(feed)),
    // @ts-ignore
    webpubRequest: sinon.stub().returns(Promise.resolve(webpub)),
  });

  return fetcher;
};

export const expressMocked = async (body: JsonObject, headers: JsonObject, pullData: IStorage | undefined = undefined, feed: Partial<IOpdsResultView> | undefined = undefined, webpub: Partial<IWebPubView> | undefined = undefined, data: StorageModel | undefined = undefined) => {
  if (!data) {
    console.log("NO DATA MOCKED YET");
    
    ({data /* , push, pull*/} = await storageModelMocked(pullData));
  } else {
    console.log("DATA MOCKED");
  }
  const fetcher = fetcherMocked(feed, webpub) as unknown as OpdsFetcher;

  const assistant = new Assistant({storageModel: data, fetcher});

  handler(assistant);

  const req = httpMocks.createRequest({
    body,
    headers,
    method: 'POST',
  });

  const res = httpMocks.createResponse({
    eventEmitter: require('events').EventEmitter,
  });

  const promise = new Promise<JsonObject>((resolve, reject) => res.on('end', () => {
    const data = res._getData();

    console.info('DATA RETURNED TO GOOGLE ASSISTANT: ', data);

    if (data.error) {
      reject(data.error);
    }

    resolve(data);
  }));

  assistant.app(req, res);

  return promise;
};
