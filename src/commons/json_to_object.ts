import * as s from 'node:stream';
import { Transform, $queue, $write } from '../transform.js';

export interface JSONToObjectOptions {
    reviver?: (this: unknown, key: string, value: unknown) => unknown;
}

export class JSONToObject<OutT = object> extends Transform<string, OutT> {

    public buffer: string = '';

    constructor({ reviver }: JSONToObjectOptions = {}, options?: s.TransformOptions) {
        super(new s.Transform({
            ...options, ...{
                writableObjectMode: true,
                readableObjectMode: true,
                transform: async (chunk: string, _encoding: BufferEncoding, callback: s.TransformCallback) => {
                    try {
                        const obj = JSON.parse(this.buffer + chunk, reviver);
                        callback(null, obj);
                        this.buffer = '';
                    }
                    catch(err) {
                        this.buffer = this[$queue] + chunk;
                        callback();
                    }
                }
            }
        }));

        this.buffer = '';
    }

    async write(data: string): Promise<void> {
        await super[$write](data);
    }
}