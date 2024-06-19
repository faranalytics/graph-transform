// eslint-disable-next-line quotes
import * as s from "node:stream";
import { StringDecoder } from 'node:string_decoder';
import { Transform } from '../transform.js';

export interface BufferToStringOptions {
    encoding?: BufferEncoding;
}

export class BufferToString extends Transform<Buffer, string> {

    public stringDecoder: StringDecoder;

    constructor({ encoding }: BufferToStringOptions = { encoding: 'utf-8' }, options?: s.TransformOptions) {
        super(new s.Transform({
            ...options, ...{
                writableObjectMode: false,
                readableObjectMode: false,
                transform: async (chunk: Buffer, _encoding: BufferEncoding, callback: s.TransformCallback) => {
                    callback(null, this.stringDecoder.write(chunk));
                }
            }
        }));

        this.stringDecoder = new StringDecoder(encoding);
    }

    async write(data: Buffer): Promise<void> {
        await super.write(data);
    }
}