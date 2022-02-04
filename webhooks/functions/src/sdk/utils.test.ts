
// class-transformer
import 'reflect-metadata';  
import { exec } from "child_process";
export const SDK_PATH = "../../sdk";

export const defaults = {
  cwd: process.env.PWD + "/" + SDK_PATH,
  env: process.env
};

export const shell = (s: string, fn: (s: string) => void, done: (...a: any[]) => any) => {

  exec(s, defaults, (err, stdout) => {

    fn(stdout);

    done(err);
  });
}