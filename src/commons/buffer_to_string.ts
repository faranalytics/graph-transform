// eslint-disable-next-line quotes
import * as s from "node:stream";
import { Transform } from '../transform';

export interface BufferToStringOptions {
    encoding?: BufferEncoding;
}

export class BufferToString extends Transform<Buffer, string> {

    constructor({ encoding }: BufferToStringOptions = { encoding: 'utf-8' }, options?: s.TransformOptions) {
        super(new s.Transform({
            ...options, ...{
                writableObjectMode: true,
                readableObjectMode: false,
                transform: async (chunk: Buffer, _encoding: BufferEncoding, callback: s.TransformCallback) => {
                    callback(null, chunk.toString(_encoding ?? encoding));
                }
            }
        }));
    }

    async write(data: Buffer): Promise<void> {
        await super.write(data);
    }
}