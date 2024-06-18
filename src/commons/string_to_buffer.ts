import * as s from 'node:stream';
import { Transform } from '../transform.js';

export interface StringToBufferOptions {
    encoding?: BufferEncoding;
}

export class StringToBuffer extends Transform<string, Buffer> {

    constructor({ encoding }: StringToBufferOptions = { encoding: 'utf-8' }, options?: s.TransformOptions) {
        super(new s.Transform({
            ...options, ...{
                writableObjectMode: false,
                readableObjectMode: true,
                transform: async (chunk: string, _encoding: BufferEncoding, callback: s.TransformCallback) => {
                    callback(null, Buffer.from(chunk, _encoding ?? encoding));
                }
            }
        }));
    }

    async write(data: string): Promise<void> {
        await super.write(data);
    }
}