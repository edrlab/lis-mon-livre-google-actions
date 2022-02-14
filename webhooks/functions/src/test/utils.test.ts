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
import {info} from 'firebase-functions/logger';
import { IStorage } from '../model/storage.interface';
import { parsedDataClone } from '../model/data.model.test';

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

export const expressMocked = async (body: JsonObject, headers: JsonObject, pullData: IStorage | undefined = undefined) => {
  const {data /* , push, pull*/} = await storageModelMocked(pullData);

  const assistant = new Assistant({storageModel: data});

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

    info('DATA RETURNED TO GOOGLE ASSISTANT: ', data);

    if (data.error) {
      reject(data.error);
    }

    resolve(data);
  }));

  assistant.app(req, res);

  return promise;
};
