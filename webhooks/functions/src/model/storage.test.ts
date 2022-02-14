import 'reflect-metadata';
import {StorageDto} from './storage.dto';
import * as assert from 'assert';
import {classToPlain} from 'class-transformer';
import {inspect} from 'util';
import * as chai from 'chai';
// import { StorageModel } from './storage.model';
import * as sinon from 'sinon';

import {StorageModel} from './storage.model';
import {storageModelMocked} from '../test/utils.test';
import { freshDataClone } from './data.model.test';

let freshData = freshDataClone();

describe('storage DTO', () => {
  beforeEach(() => {
    freshData = freshDataClone();
  });

  it('create storage object without bearerToken', () => {
    const obj = {
      dbVersion: 1,
      bearerToken: undefined,
      player: {
        current: {

          playing: false,
        },
        history: {

        },
      },
    };

    chai.expect(() => StorageDto.create('', obj)).to.throw();
  });

  it('create storage object failed dbversion', () => {
    const obj = {
      dbVersion: 2,
      bearerToken: 'test',
      player: {
        current: {

          playing: false,
        },
        history: {

        },
      },
    };

    chai.expect(() => StorageDto.create('test', obj)).to.throw();
  });

  it('create storage object failed dbversion and bearer', () => {
    const obj = {
      dbVersion: 2,
      bearerToken: undefined,
      player: {
        current: {

          playing: false,
        },
        history: {

        },
      },
    };

    chai.expect(() => StorageDto.create('test', obj)).to.throw();
  });

  it('undefined storage', () => {
    const instance = StorageDto.create('test', undefined);

    chai.expect(instance.bearerToken).to.be.eq('test');
  });

  it('bad validation extract', () => {
    const instance = StorageDto.create('test');

    instance.player.current.index = -34;

    const extr = instance.extract();

    const instance2 = StorageDto.create('test', extr);

    chai.expect(instance2.player.current.index).to.be.undefined;
  });

  it('create error', () => {
    const date = new Date();

    const obj = freshData;
    // @ts-ignore
    obj.player.history.test = {
      index: 0,
      time: 0,
      date: date,
    };
    const instance = StorageDto.create('test', obj);

    assert.deepEqual(instance.player.history.get('test'), {
      index: 0,
      time: 0,
      date: date,
    });

    instance.player.history.set('test2', {
      index: 0,
      time: 0,
      date: date,
    });

    const extr = classToPlain(instance);

    assert.deepEqual({
      test2: {
        index: 0,
        time: 0,
        date: date,
      },
      test: {
        index: 0,
        time: 0,
        date: date,
      },
    }, extr.player.history);

    console.log(inspect(extr, {depth: 7}));
    console.log(new Date());

    const instance2 = StorageDto.create('test', extr);

    assert.deepEqual(instance2.player.history.get('test2'), {
      index: 0,
      time: 0,
      date: date,
    });
  });
});


describe('storage Model', () => {
  chai.should();

  beforeEach(() => {
    freshData = {
      dbVersion: 1,
      bearerToken: 'test',
      player: {
        current: {
          playing: false,
        },
        history: {

        },
      },
      session: {
        scene: {
          home_user: {
            state: 'DEFAULT',
          },
        },
      },
      user: {
        authentication: 'NO_LINKED',
      },
    };
  });

  // @ts-ignore
  let {data, push, pull}: {
    data: StorageModel;
    pull: sinon.SinonStub<any[], any>;
    push: sinon.SinonStub<any[], any>;
  } = {};

  beforeEach(async () => {
    ({data, push, pull} = await storageModelMocked());
  });

  it('create a storeModel', async () => {
    console.log(JSON.stringify(data.store.extract(), null, 4));

    assert.deepEqual(data.store.extract(), freshData);

    data.store.should.instanceOf(StorageDto);
    data.store.extract().should.to.deep.eq(freshData);
    pull.calledOnce.should.eq(true);
  });

  it('push store', async () => {
    data.save();

    push.calledOnce.should.eq(true);
    push.args.should.to.deep.equal([['test', freshData]]);
  });
});
