import * as util from 'util';
import {IStorage, IStoragePlayer, IStoragePlayerCurrent, IStoragePlayerHistory, IStorageSelection} from './storage.interface';
import {classToPlain, Exclude, plainToClass, Transform, TransformationType, Type} from 'class-transformer';
import {Equals, IsBoolean, IsDate, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, IsUrl, Min, ValidateNested, validateSync} from 'class-validator';

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

class StorageSelectionDto implements IStorageSelection {
  @IsOptional()
  @IsUrl()
    topUrl?: string;

  @IsOptional()
  @IsUrl()
    url?: string;
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
  @Type(() => StorageSelectionDto)
  @ValidateNested()
    selection: StorageSelectionDto;

  @Exclude()
    snapshot: IStorage;

  constructor(bearerToken: string) {
    this.dbVersion = DB_VERSION;
    this.bearerToken = bearerToken;
    this.player = new StoragePlayerDto();
    this.snapshot = classToPlain(this) as IStorage;
  }

  @Exclude()
  static create(data?: Record<string, any>, bearerToken?: string): StorageDto {
    if (!data && bearerToken) {
      return new StorageDto(bearerToken);
    }

    const storage = plainToClass(StorageDto, data);
    const errors = validateSync(storage);

    if (errors.length) {
      bearerToken = bearerToken || typeof data?.bearerToken === 'string' ? data?.bearerToken : undefined;
      if (!bearerToken) {
        throw new Error('bearerToken is empty');
      }

      console.error('Storage DTO \'create\' errors', util.inspect(errors, {depth: 8}));

      console.error('new fresh storageDto created');

      return new StorageDto(bearerToken);
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

    const storage = classToPlain(this);
    return storage;
  }
}
