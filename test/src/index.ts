import * as net from 'node:net';
import { Transform, ObjectToBuffer, BufferToObject, BufferToString } from 'graph-transform';
// import { TemporalTransform } from './temporal_transform.js';
// import { NullTransform } from './null_transform.js';

class Greeter {
    public greeting: string = '0'.repeat(16);
}

async function test1() {

    // const temporalTransform1 = new TemporalTransform({ time: 1000 });
    // const temporalTransform2 = new TemporalTransform({ time: 1000 });
    const objectToBuffer1 = new ObjectToBuffer<Greeter>();
    const objectToBuffer2 = new ObjectToBuffer<Greeter>();
    const bufferToObject = new BufferToObject<Greeter>();
    const bufferToString = new BufferToString();
    const stdout = new Transform<never, never>(process.stdout);

    net.createServer((socket: net.Socket) => socket.pipe(socket)).listen(3000);
    const socket = net.createConnection({ port: 3000 });
    await new Promise((r, e) => socket.once('connect', r).once('error', e));
    const socketHandler = new Transform<Buffer, Buffer>(socket);

    const transform =
        objectToBuffer1.connect(
            socketHandler.connect(
                bufferToObject.connect(
                    objectToBuffer2.connect(
                        bufferToString.connect(
                            stdout
                        )
                    )
                )
            )
        );

    transform.write(new Greeter());
    transform.write(new Greeter());
}


function main() {
    test1();
}

main();

