import 'reflect-metadata';
import {StorageDto} from './storage.dto';
import * as assert from 'assert';
import {classToPlain} from 'class-transformer';


describe('storage DTO', () => {
  it('create storage object', () => {
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
      selection: {},
    };

    assert.throws(() => StorageDto.create(obj));
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
      selection: {},
    };

    const instance = StorageDto.create(obj);

    assert.ok(instance instanceof StorageDto);
    assert.equal(instance.dbVersion, 1);
    console.log(instance);
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
        selection: {},
      },
    };

    assert.throws(() => StorageDto.create(obj));
  });

  it('undefined storage', () => {
    const instance = StorageDto.create(undefined, 'test');

    const extr = instance.extract();

    assert.deepEqual({
      dbVersion: 1,
      bearerToken: 'test',
      player: {
        current: {

          playing: false,
        },
        history: {

        },
      },
      selection: {},
    }, extr);
  });

  it('bad validation extract', () => {
    const instance = StorageDto.create(undefined, 'test');

    instance.player.current.index = -34;

    const extr = instance.extract();

    assert.deepEqual({
      dbVersion: 1,
      bearerToken: 'test',
      player: {
        current: {

          playing: false,
        },
        history: {

        },
      },
      // selection: {}
    }, extr);

    const instance2 = StorageDto.create(extr);

    assert.deepEqual(instance2.selection, {});
    assert.deepEqual(instance2.selection.url, undefined);
  });

  it('selection validation extract', () => {
    const instance = StorageDto.create(undefined, 'test');

    instance.selection.url = undefined;
    // instance.selection.topUrl = "http://google.com";

    const extr = instance.extract();

    assert.deepEqual({
      dbVersion: 1,
      bearerToken: 'test',
      player: {
        current: {

          playing: false,
        },
        history: {

        },
      },
      selection: {},
    }, extr);

    const instance2 = StorageDto.create(extr);

    assert.deepEqual(instance2.selection, {});
    assert.deepEqual(instance2.selection.url, undefined);
  });

  it('good validation extract', () => {
    const instance = StorageDto.create(undefined, 'test');

    instance.player.current.index = 0;

    const extr = instance.extract();

    assert.deepEqual({
      dbVersion: 1,
      bearerToken: 'test',
      player: {
        current: {
          index: 0,
          playing: false,
        },
        history: {

        },
      },
      selection: {},
    }, extr);
  });

  it('create error', () => {
    const date = new Date();

    const obj = {
      dbVersion: 1,
      bearerToken: '123',
      player: {
        current: {

          playing: false,
        },
        history: {
          'test': {
            index: 0,
            time: 0,
            date: date,
          },
        },
      },
      selection: {},
    };
    const instance = StorageDto.create(obj, 'test');

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
      dbVersion: 1,
      bearerToken: '123',
      player: {
        current: {

          playing: false,
        },
        history: {
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
        },
      },
      selection: {},
    }, extr);


    const instance2 = StorageDto.create(extr, 'test');

    assert.deepEqual(instance2.player.history.get('test2'), {
      index: 0,
      time: 0,
      date: date,
    });
  });
});
