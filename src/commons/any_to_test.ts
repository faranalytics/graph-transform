/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, test } from 'node:test';
import * as assert from 'node:assert';
import * as s from 'node:stream';
import { $write, Transform } from '../transform.js';

export class AnyToTest extends Transform<any, never> {

    constructor(expected: string, options?: s.WritableOptions) {
        super(new s.Writable({
            ...options, ...{
                objectMode: true,
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                write: async (chunk: unknown, encoding: BufferEncoding, callback: s.TransformCallback) => {
                    if (typeof chunk != 'string') {
                        chunk = JSON.stringify(chunk);
                    }
                    await describe('Test.', async () => {
                        await test('Assert that `chunk` is strictly equal to `expected`.', async () => {
                            assert.strictEqual(chunk, expected);
                        });
                    });
                    callback();
                }
            }
        }));
    }

    async write(data: any): Promise<void> {
        await super[$write](data);
    }
}