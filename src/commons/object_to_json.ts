import * as s from "node:stream";
import { Transform } from "../transform";

export interface ObjectToJSONOptions {
    replacer?: (this: any, key: string, value: any) => any;
    space?: string | number;
}

export class ObjectToJSON extends Transform<object, string> {

    constructor({ replacer, space }: ObjectToJSONOptions = {}) {
        super(new s.Transform({
            writableObjectMode: true,
            readableObjectMode: false,
            transform: async (chunk: object, _encoding: BufferEncoding, callback: s.TransformCallback) => {
                callback(null, JSON.stringify(chunk, replacer, space));
            }
        }));
    }

    async write(data: object) {
        super.write(data);
    }
}