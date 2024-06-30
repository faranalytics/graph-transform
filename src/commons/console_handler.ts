/* eslint-disable @typescript-eslint/no-explicit-any */
import * as s from 'node:stream';
import { $write, Transform } from '../transform.js';

export class ConsoleHandler extends Transform<never, never> {

    constructor(options?: s.TransformOptions) {
        super(new s.Writable({
            ...options, ...{
                objectMode: true,
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                write: async (chunk: unknown, encoding: BufferEncoding, callback: s.TransformCallback) => {
                    console.log(chunk);
                    callback();
                }
            }
        }));
    }

    async write(data: never): Promise<void> {
        await super[$write](data);
    }
}