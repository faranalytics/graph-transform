import * as s from 'node:stream';
import { ConnectError } from './errors';

export class Transform<InT, OutT> {

    protected stream: s.Writable | s.Readable;
    protected queue: Array<InT>;
    protected connected: boolean;
    protected queueSize: number;

    constructor(stream: s.Writable | s.Readable) {
        this.stream = stream;
        this.queue = [];
        this.connected = false;
        this.queueSize = 0;

        this.stream.once('error', (err: Error) => console.error);
    }

    public connect<T extends Transform<OutT, unknown>>(...transforms: Array<T>): typeof this {
        for (const transform of transforms) {
            if (this.stream instanceof s.Readable && transform.stream instanceof s.Writable) {
                this.stream?.pipe(transform.stream);
                this.stream.once('error', transform.stream.destroy);
                transform.stream.once('error', (err: Error) => {
                    if (this.stream instanceof s.Readable && transform.stream instanceof s.Writable) {
                        this.stream.unpipe(transform.stream);
                    }
                });
            }
        }
        this.connected = true;
        return this;
    }

    public disconnect<T extends Transform<OutT, unknown>>(...transforms: Array<T>): typeof this {
        for (const transform of transforms) {
            if (this.stream instanceof s.Readable && transform.stream instanceof s.Writable) {
                this.stream.unpipe(transform.stream);
            }
        }
        return this;
    }

    protected async write(data: InT, encoding?: BufferEncoding): Promise<void> {
        try {
            if (!this.stream.closed) {
                if (this.stream instanceof s.Writable && !this.stream.writableNeedDrain) {
                    this.queue.push(data);
                    if (data instanceof Buffer || typeof data == 'string') {
                        this.queueSize = this.queueSize + data.length;
                    }
                    else {
                        this.queueSize = this.queueSize + 1;
                    }
                    while (this.queue.length) {
                        const data = this.queue.shift();
                        if (data instanceof Buffer || typeof data == 'string') {
                            this.queueSize = this.queueSize - data.length;
                        }
                        else {
                            this.queueSize = this.queueSize - 1;
                        }
                        if (!this.stream.write(data, encoding ?? 'utf-8')) {
                            await new Promise((r, e) => this.stream.once('drain', r).once('error', e));
                        }
                    }
                }
                else {
                    this.queue.push(data);
                }
            }
        }
        catch (err) {
            console.error(err);
            throw err;
        }
    }
}
