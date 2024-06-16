import * as stream from "node:stream";
import { Transform } from 'graph-transform';


class StringToNumber extends Transform<string, number> {

    constructor(options: stream.TransformOptions) {
        super(new stream.Transform({
            ...options, ...{
                writableObjectMode: true,
                readableObjectMode: true,
                transform: (chunk: string, encoding: BufferEncoding, callback: stream.TransformCallback) => {
                    const result = parseFloat(chunk.toString());
                    callback(null, result);
                }
            }
        }));
    }
}