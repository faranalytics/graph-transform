import * as s from 'node:stream';
import { Transform, $write, $stream } from '../transform.js';

export interface ObjectToStringOptions {
    encoding: NodeJS.BufferEncoding;
}

export class BufferToString extends Transform<Buffer, string> {

    public ingressQueue: Buffer;
    public messageSize: number | null;
    public encoding?: NodeJS.BufferEncoding;

    constructor({ encoding }: ObjectToStringOptions = { encoding: 'utf-8' }, options?: s.TransformOptions) {
        super(new s.Transform({
            ...options, ...{
                writableObjectMode: false,
                readableObjectMode: true,
                transform: async (chunk: Buffer | string, _encoding: BufferEncoding, callback: s.TransformCallback) => {
                    if (!Buffer.isBuffer(chunk)) {
                        chunk = Buffer.from(chunk, 'utf-8');
                    }

                    this.ingressQueue = Buffer.concat([this.ingressQueue, chunk]);

                    if (this.messageSize === null) {
                        this.messageSize = this.ingressQueue.readUintBE(0, 6);
                    }

                    if (this.ingressQueue.length < this.messageSize) {
                        callback();
                        return;
                    }

                    while (this.ingressQueue.length >= this.messageSize) {
                        const buf = this.ingressQueue.subarray(6, this.messageSize);
                        this.ingressQueue = this.ingressQueue.subarray(this.messageSize, this.ingressQueue.length);
                        const message = buf.toString(this.encoding);

                        if (this[$stream] instanceof s.Readable) {
                            this[$stream].push(message);
                        }

                        if (this.ingressQueue.length > 6) {
                            this.messageSize = this.ingressQueue.readUintBE(0, 6);
                        }
                        else {
                            this.messageSize = null;
                            break;
                        }
                    }
                    callback();
                }
            }
        }));

        this.ingressQueue = Buffer.allocUnsafe(0);
        this.messageSize = null;
        this.encoding = encoding;
    }

    async write(data: Buffer): Promise<void> {
        await super[$write](data);
    }
}