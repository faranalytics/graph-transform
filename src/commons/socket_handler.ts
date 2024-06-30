/* eslint-disable @typescript-eslint/no-unused-vars */
import * as s from 'node:stream';
import * as net from 'node:net';
import { Transform, $write, $stream } from '../transform.js';

export interface SocketHandlerOptions {
    reviver?: (this: unknown, key: string, value: unknown) => unknown;
    replacer?: (this: unknown, key: string, value: unknown) => unknown;
    space?: string | number;
}

export class SocketHandler<InT extends object, OutT extends object> extends Transform<InT, OutT> {

    public ingressQueue: Buffer;
    public egressQueue: Buffer;
    public messageSize: number | null;
    public reviver?: (this: unknown, key: string, value: unknown) => unknown;
    public replacer?: (this: unknown, key: string, value: unknown) => unknown;
    public space?: string | number;
    public socket: net.Socket;

    constructor(socket: net.Socket, { reviver, replacer, space }: SocketHandlerOptions = {}, options?: s.DuplexOptions) {
        super(new s.Duplex({
            ...options, ...{
                writableObjectMode: true,
                readableObjectMode: true,
                read: (size: number) => {
                    this.push();
                },
                write: (chunk: InT, _encoding: BufferEncoding, callback: s.TransformCallback) => {
                    const data = this.serializeMessage(chunk);
                    const size = Buffer.alloc(6, 0);
                    size.writeUIntBE(data.length + 6, 0, 6);
                    const buf = Buffer.concat([size, data]);
                    if (!this.socket.write(buf)) {
                        this.socket.once('drain', callback);
                    }
                    else {
                        callback();
                    }
                }
            }
        }));

        this.push = this.push.bind(this);
        this.ingressQueue = Buffer.allocUnsafe(0);
        this.egressQueue = Buffer.allocUnsafe(0);
        this.messageSize = null;
        this.reviver = reviver;
        this.replacer = replacer;
        this.space = space;
        this.socket = socket;
        this.messageSize = null;

        this.socket.on('data', (data: Buffer) => {
            this.ingressQueue = Buffer.concat([this.ingressQueue, data]);
        });
    }

    push() {
        if (this.ingressQueue.length > 6) {
            this.messageSize = this.ingressQueue.readUintBE(0, 6);
        }
        else {
            this.socket.once('data', this.push);
            return;
        }

        if (this.ingressQueue.length >= this.messageSize) {
            const buf = this.ingressQueue.subarray(6, this.messageSize);
            this.ingressQueue = this.ingressQueue.subarray(this.messageSize, this.ingressQueue.length);
            const message = this.deserializeMessage(buf);
            if (this[$stream] instanceof s.Readable) {
                this[$stream].push(message);
            }
        }
        else {
            this.socket.once('data', this.push);
        }
    }

    async write(data: InT): Promise<void> {
        await super[$write](data);
    }

    protected deserializeMessage(data: Buffer): OutT {
        return <OutT>JSON.parse(data.toString('utf-8'), this.reviver);
    }

    protected serializeMessage(message: InT): Buffer {
        return Buffer.from(JSON.stringify(message, this.replacer, this.space), 'utf-8');
    }
}