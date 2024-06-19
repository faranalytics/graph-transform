import * as s from 'node:stream';
import { Transform } from '../transform.js';

export interface JSONToObjectOptions {
    reviver?: (this: unknown, key: string, value: unknown) => unknown;
}

export class JSONToObject<OutT = object> extends Transform<string, OutT> {

    public _queue: string = '';

    constructor({ reviver }: JSONToObjectOptions = {}, options?: s.TransformOptions) {
        super(new s.Transform({
            ...options, ...{
                writableObjectMode: true,
                readableObjectMode: true,
                transform: async (chunk: string, _encoding: BufferEncoding, callback: s.TransformCallback) => {
                    try {
                        const obj = JSON.parse(this._queue + chunk, reviver);
                        callback(null, obj);
                        this._queue = '';
                    }
                    catch(err) {
                        this._queue = this.queue + chunk;
                        callback();
                    }
                }
            }
        }));

        this._queue = '';
    }

    async write(data: string): Promise<void> {
        await super.write(data);
    }
}