/* eslint-disable @typescript-eslint/no-explicit-any */
import * as s from 'node:stream';
import { $write, Transform } from '../transform.js';

export interface AnyToTestSuite<T> {
    (chunk: T, encoding: BufferEncoding, callback: (error?: Error | null | undefined) => void): Promise<void>;
}

export class AnyToTest<InT> extends Transform<InT, never> {

    constructor(suite: AnyToTestSuite<InT>, options?: s.WritableOptions) {
        super(new s.Writable({
            ...options, ...{
                objectMode: true,
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                write: async (chunk: InT, encoding: BufferEncoding, callback: (error?: Error | null | undefined) => void) => {
                    await suite(chunk, encoding, callback);
                }
            }
        }));
    }

    async write(data: any): Promise<void> {
        await super[$write](data);
    }
}