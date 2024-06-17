import * as s from 'node:stream';
import { Transform } from '../transform';

export interface ObjectToJSONOptions {
    replacer?: (this: unknown, key: string, value: unknown) => unknown;
    space?: string | number;
}

export class ObjectToJSON extends Transform<object, string> {

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

    async write(data: object) {
        super.write(data);
    }
}