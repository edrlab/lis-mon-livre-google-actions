import * as util from 'util';
import {ISessionScene, IStorage, IStoragePlayer, IStoragePlayerCurrent, IStoragePlayerHistory, IStorageSession, IStorageUser, TStateAuthentication} from './storage.interface';
import {classToPlain, Exclude, plainToClass, Transform, TransformationType, Type} from 'class-transformer';
import {Equals, IsBoolean, IsDate, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, IsUrl, Min, ValidateNested, validateSync} from 'class-validator';
import {resetSelection} from '../controller/handler/selection.helper';

const DB_VERSION = 1;

class StoragePlayerHistoryDto implements IStoragePlayerHistory {
  @Min(0)
  @IsNumber()
    index: number;

  @Min(0)
  @IsNumber()
    time: number;

  @IsDate()
    date: Date;

  // set(data: IStoragePlayerHistory) {
  //   this.date = data.date;
  //   this.index = data.index;
  //   this.time = data.time;
  // }
}

class StoragePlayerCurrentDto implements IStoragePlayerCurrent {
  @IsNumber()
  @Min(0)
  @IsOptional()
    index?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
    time?: number;

  @IsUrl()
  @IsString()
  @IsOptional()
    url?: string;

  @IsBoolean()
    playing: boolean;

  // set(data: IStoragePlayerCurrent) {
  //   this.index = data.index;
  //   this.time = data.time;
  //   this.url = data.url;
  //   this.playing = data.playing;
  // }

  constructor() {
    this.playing = false;
  }
}

class StoragePlayerDto implements IStoragePlayer {
  @IsObject()
  @IsNotEmpty()
  @Type(() => StoragePlayerCurrentDto)
  @ValidateNested()
    current: StoragePlayerCurrentDto;

  @IsNotEmpty()
  @Type(() => StoragePlayerHistoryDto)
  @Transform(({value, type}) => { // transform new Map() to plain and from plain
    if (type === TransformationType.PLAIN_TO_CLASS) {
      return new Map(typeof value === 'object' ? Object.entries(value) : []);
    }
    if (type === TransformationType.CLASS_TO_PLAIN && typeof value === 'object' && value.entries) {
      return Array.from<Array<any>>(value.entries()).reduce((pv, [key, value]) => ({...pv, [key]: value}), {});
    }
  })
  @ValidateNested({
    each: true,
  })
    history: Map<string, StoragePlayerHistoryDto>;

  constructor() {
    this.current = new StoragePlayerCurrentDto();
    this.history = new Map<string, StoragePlayerHistoryDto>();
  }
}

class StorageSessionDto implements IStorageSession {
  @IsObject()
  @IsNotEmpty()
    scene: ISessionScene;

  constructor() {
    this.scene = {
      'home_user': {
        state: 'DEFAULT',
      },
      'selection': resetSelection(),
    };
  }
}

class StorageUserDto implements IStorageUser {
  @IsNotEmpty()
    authentication: TStateAuthentication;

  @IsOptional()
  @IsString()
    sessionId: string;

  constructor() {
    this.authentication = 'NO_LINKED';
  }
}

export class StorageDto implements IStorage {
  @IsNumber()
  @Equals(DB_VERSION)
    dbVersion: number;

  @IsNotEmpty()
    bearerToken: string;

  @IsObject()
  @IsNotEmpty()
  @Type(() => StoragePlayerDto)
  @ValidateNested()
    player: StoragePlayerDto;

  @IsObject()
  @IsNotEmpty()
  @Type(() => StorageSessionDto)
  @ValidateNested()
    session: StorageSessionDto;

  @IsObject()
  @IsNotEmpty()
  @Type(() => StorageUserDto)
  @ValidateNested()
    user: StorageUserDto;

  @Exclude()
    snapshot: IStorage;

  constructor(bearerToken: string) {
    this.dbVersion = DB_VERSION;
    this.bearerToken = bearerToken;
    this.player = new StoragePlayerDto();
    this.snapshot = classToPlain(this) as IStorage;
    this.session = new StorageSessionDto();
    this.user = new StorageUserDto();
  }

  @Exclude()
  static create(bearerToken: string, data?: Record<string, any>): StorageDto {
    if (!data && bearerToken) {
      return new StorageDto(bearerToken);
    }

    const storage = plainToClass(StorageDto, data);
    const errors = validateSync(storage);

    if (errors.length > 0) {
      throw new Error(JSON.stringify(errors, null, 4));
    }
    if (storage.bearerToken !== bearerToken) {
      throw new Error('the bearerToken doesn\'t match beetween the key and value');
    }

    storage.snapshot = classToPlain(this) as IStorage;
    return storage;
  }

  @Exclude()
  public extract(): Record<string, any> {
    const errors = validateSync(this);

    if (errors.length) {
      console.error('storage DTO \'extract\' errors', util.inspect(errors, {depth: 8}));
      console.error('return the last snapshot', this.snapshot);

      return this.snapshot;
    }

    const storage = classToPlain(this, {exposeUnsetFields: false});
    return storage;
  }
}
