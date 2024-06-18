/* eslint-disable @typescript-eslint/no-explicit-any */
import * as s from 'node:stream';
import { Transform } from 'graph-transform';

export interface TemporalTransformOptions {
    time?: number;
}

export class TemporalTransform extends Transform<any, any> {

    constructor({time = 1000}: TemporalTransformOptions = {}) {
        super(new s.Transform({
                writableObjectMode: true,
                readableObjectMode: true,
                transform: async (chunk: string, encoding: BufferEncoding, callback: s.TransformCallback) => {
                    await new Promise((r)=> setTimeout(r, time));
                    callback(null, chunk);
                }
            })
        );
    }

    async write(data: any): Promise<void> {
        await super.write(data);
    }
}