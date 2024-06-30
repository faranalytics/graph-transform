/* eslint-disable @typescript-eslint/no-explicit-any */
import * as stream from 'node:stream';
import { Transform } from '../transform.js';


export class AnyToVoid extends Transform<any, never> {

    constructor() {
        super(new stream.Writable({
            objectMode: true,
            write(chunk: any, encoding: BufferEncoding, callback: (error?: Error | null | undefined) => void) {
                callback();
            }
        })
        );
    }
}