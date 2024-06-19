import * as s from 'node:stream';
import { Transform } from '../transform.js';

export interface JSONToObjectOptions {
    reviver?: (this: unknown, key: string, value: unknown) => unknown;
}

export class JSONToObject<OutT = object> extends Transform<string, OutT> {

    constructor({ reviver }: JSONToObjectOptions = {}, options?: s.TransformOptions) {
        super(new s.Transform({
            ...options, ...{
                writableObjectMode: true,
                readableObjectMode: true,
                transform: async (chunk: string, _encoding: BufferEncoding, callback: s.TransformCallback) => {
                    callback(null, JSON.parse(chunk, reviver));
                }
            }
        }));
    }

    async write(data: string): Promise<void> {
        await super.write(data);
    }
}