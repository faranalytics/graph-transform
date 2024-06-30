/* eslint-disable @typescript-eslint/no-explicit-any */
import * as s from 'node:stream';
import { $write, Transform } from '../transform.js';

export interface AnyToTestSuite {
    (chunk: unknown, encoding: BufferEncoding, callback: (error?: Error | null | undefined) => void): Promise<void>;
}

export class AnyToTest extends Transform<any, never> {

    constructor(suite: AnyToTestSuite, options?: s.WritableOptions) {
        super(new s.Writable({
            ...options, ...{
                objectMode: true,
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                write: async (chunk: unknown, encoding: BufferEncoding, callback: (error?: Error | null | undefined) => void) => {
                    await suite(chunk, encoding, callback);
                }
            }
        }));
    }

    async write(data: any): Promise<void> {
        await super[$write](data);
    }
}