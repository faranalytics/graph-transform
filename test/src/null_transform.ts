import * as s from "node:stream";
import { Transform } from "graph-transform";


export class NullTransform extends Transform<any, any> {

    constructor() {
        super(new s.Transform({
                writableObjectMode: false,
                readableObjectMode: false,
                transform: async (chunk: string, encoding: BufferEncoding, callback: s.TransformCallback) => {
                    callback(null);
                }
            })
        );
    }
}