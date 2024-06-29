import * as s from 'node:stream';
import { $write, Transform } from '../transform.js';

export interface ObjectToBufferOptions {
    replacer?: (this: unknown, key: string, value: unknown) => unknown;
    space?: string | number;
}

export class ObjectToBuffer<InT = object> extends Transform<InT, Buffer> {

    public replacer?: (this: unknown, key: string, value: unknown) => unknown;
    public space?: string | number;
    public egressQueue: Buffer;

    constructor({ replacer, space }: ObjectToBufferOptions = {}, options?: s.TransformOptions) {
        super(new s.Transform({
            ...options, ...{
                writableObjectMode: true,
                readableObjectMode: false,
                transform: async (chunk: InT, _encoding: BufferEncoding, callback: s.TransformCallback) => {
                    const data = this.serializeMessage(chunk);
                    const size = Buffer.alloc(6, 0);
                    size.writeUIntBE(data.length + 6, 0, 6);
                    const buf = Buffer.concat([size, data]);
                    callback(null, buf);
                }
            }
        }));

        this.egressQueue = Buffer.allocUnsafe(0);
        this.replacer = replacer;
        this.space = space;
    }

    async write(data: InT): Promise<void> {
        await super[$write](data);
    }

    protected serializeMessage(message: InT): Buffer {
        return Buffer.from(JSON.stringify(message, this.replacer, this.space), 'utf-8');
    }
}