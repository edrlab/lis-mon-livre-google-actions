import { IStorage, IStoragePlayer, IStoragePlayerCurrent, IStoragePlayerHistory } from "./storage.interface";
import { classToPlain, Exclude, plainToClass, Type } from 'class-transformer';
import { Equals, IsBoolean, IsDate, IsDefined, IsNotEmpty, IsNumber, IsObject, IsOptional, IsPositive, IsString, IsUrl, validate, ValidateNested, validateOrReject, validateSync } from "class-validator";

const DB_VERSION = 1;

class StoragePlayerHistoryDto implements IStoragePlayerHistory {

  @IsNumber()
  index: number;

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

  @IsPositive()
  @IsNumber()
  @IsOptional()
  index?: number;

  @IsPositive()
  @IsNumber()
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
  @ValidateNested()
  history: Map<string, StoragePlayerHistoryDto>;

  constructor() {
    this.current = new StoragePlayerCurrentDto();
    this.history = new Map<string, StoragePlayerHistoryDto>();
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

      bearerToken = bearerToken || typeof data?.bearerToken === "string" ? data?.bearerToken : undefined;
      if (!bearerToken) {
        throw new Error("bearerToken is empty");
      }

      console.error("Storage DTO 'create' errors", errors);
      console.error("new fresh storageDto created");

      return new StorageDto(bearerToken);
    }

    storage.snapshot = classToPlain(this) as IStorage;
    return storage;
  }

  @Exclude()
  public extract(): Record<string, any> {

    const errors = validateSync(this);

    if (errors.length) {
      console.error("storage DTO 'extract' errors", errors);
      console.error("return the last snapshot", this.snapshot);

      return this.snapshot;
    }

    const storage = classToPlain(this);
    return storage;
  }
}