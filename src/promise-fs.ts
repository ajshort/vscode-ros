import * as fs from "fs";

function call(fn: Function, ...args: any[]): Promise<any> {
  return new Promise((c, e) => fn(...args, (err, res) => err ? e(err) : c(res)));
}

export function readFile(filename: string, encoding: string): Promise<string>;
export function readFile(filename: string): Promise<Buffer>;

export function readFile(filename: string, encoding?: string) {
  return call(fs.readFile, ...arguments);
}
