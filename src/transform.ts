import * as s from 'node:stream';

export const $stream = Symbol('stream');
export const $queue = Symbol('queue');
export const $connected = Symbol('connected');
export const $size = Symbol('size');
export const $write = Symbol('write');

export class Transform<InT, OutT> {

    protected [$stream]: s.Writable | s.Readable;
    protected [$queue]: Array<InT>;
    protected [$connected]: boolean;
    protected [$size]: number;

    constructor(stream: s.Writable | s.Readable) {
        this[$stream] = stream;
        this[$queue] = [];
        this[$connected] = false;
        this[$size] = 0;
        this[$stream].once('error', console.error);
    }

    public connect<T extends Transform<OutT, unknown>>(...transforms: Array<T>): typeof this {
        for (const transform of transforms) {
            if (this[$stream] instanceof s.Readable && transform[$stream] instanceof s.Writable) {
                this[$stream]?.pipe(transform[$stream]);
                this[$stream].once('error', transform[$stream].destroy);
                transform[$stream].once('error', () => {
                    if (this[$stream] instanceof s.Readable && transform[$stream] instanceof s.Writable) {
                        this[$stream].unpipe(transform[$stream]);
                    }
                });
            }
        }
        this[$connected] = true;
        return this;
    }

    public disconnect<T extends Transform<OutT, unknown>>(...transforms: Array<T>): typeof this {
        for (const transform of transforms) {
            if (this[$stream] instanceof s.Readable && transform[$stream] instanceof s.Writable) {
                this[$stream].unpipe(transform[$stream]);
            }
        }
        return this;
    }

    protected async [$write](data: InT, encoding?: BufferEncoding): Promise<void> {
        if (!this[$stream].closed && this[$stream] instanceof s.Writable && !this[$stream].writableNeedDrain) {
            this[$queue].push(data);
            if (!this[$stream].writableObjectMode && (data instanceof Buffer || typeof data == 'string')) {
                this[$size] = this[$size] + data.length;
            }
            else {
                this[$size] = this[$size] + 1;
            }
            while (this[$queue].length) {
                const data = this[$queue].shift();
                if (!this[$stream].writableObjectMode && (data instanceof Buffer || typeof data == 'string')) {
                    this[$size] = this[$size] - data.length;
                }
                else {
                    this[$size] = this[$size] - 1;
                }
                if (!this[$stream].write(data, encoding ?? 'utf-8')) {
                    await new Promise((r) => this[$stream].once('drain', r));
                }
            }
        }
        else {
            this[$queue].push(data);
        }
    }
}
