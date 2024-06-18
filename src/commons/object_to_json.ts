/* eslint-disable @typescript-eslint/no-explicit-any */
import * as s from 'node:stream';
import { Transform } from '../transform';

export interface ObjectToJSONOptions {
    replacer?: (this: unknown, key: string, value: unknown) => unknown;
    space?: string | number;
}

export class ObjectToJSON<InT = any> extends Transform<InT, string> {

    constructor({ replacer, space }: ObjectToJSONOptions = {}, options?: s.TransformOptions) {
        super(new s.Transform({
            ...options, ...{
                writableObjectMode: true,
                readableObjectMode: false,
                transform: async (chunk: object, _encoding: BufferEncoding, callback: s.TransformCallback) => {
                    callback(null, JSON.stringify(chunk, replacer, space));
                }
            }
        }));
    }

    async write(data: InT): Promise<void> {
        await super.write(data);
    }
}