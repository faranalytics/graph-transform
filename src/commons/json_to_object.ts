import * as s from "node:stream";
import { Transform } from "../transform";

export interface JSONToObjectOptions {
    reviver?: (this: any, key: string, value: any) => any;
}

export class JSONToObject extends Transform<string, object> {

    constructor({ reviver }: JSONToObjectOptions = {}, options?: s.TransformOptions) {
        super(new s.Transform({
            ...options, ...{
                writableObjectMode: false,
                readableObjectMode: true,
                transform: async (chunk: string, _encoding: BufferEncoding, callback: s.TransformCallback) => {
                    callback(null, JSON.parse(chunk, reviver));
                }
            }
        }));
    }

    async write(data: string) {
        super.write(data);
    }
}