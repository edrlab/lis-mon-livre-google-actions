import 'reflect-metadata';
import {StorageDto} from './storage.dto';
import * as assert from 'assert';


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
    }, extr);
  });
});
