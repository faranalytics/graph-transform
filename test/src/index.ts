import * as net from 'node:net';
import { Transform, StringToBuffer, BufferToString, ObjectToJSON, JSONToObject } from 'graph-transform';
import { TemporalTransform } from './temporal_transform.js';
// import { NullTransform } from './null_transform.js';

class Greeter {
    public greeting: string = 'Hello, World!'.repeat(1e4);
}

async function test1() {

    const temporalTransform1 = new TemporalTransform({ time: 1000 });
    const temporalTransform2 = new TemporalTransform({ time: 1000 });
    const objectToJSON1 = new ObjectToJSON();
    const objectToJSON2 = new ObjectToJSON();
    const jsonToObject = new JSONToObject<Greeter>();
    const stringToBuffer = new StringToBuffer();
    const bufferToString = new BufferToString();
    const stdout = new Transform<string, never>(process.stdout);

    net.createServer((socket: net.Socket) => socket.pipe(socket)).listen(3000);
    const socket = net.createConnection({ port: 3000 });
    await new Promise((r, e) => socket.once('connect', r).once('error', e));
    const socketHandler = new Transform<Buffer, Buffer>(socket);

    const transform = temporalTransform1.connect(
        objectToJSON1.connect(
            temporalTransform2.connect(
                stringToBuffer.connect(
                    socketHandler.connect(
                        bufferToString.connect(
                            jsonToObject.connect(
                                objectToJSON2.connect(
                                    stdout
                                )
                            )
                        )
                    )
                )
            )
        )
    );

    transform.write(new Greeter());
}


function main() {
    test1();
    // test2();
}

main();

// async function test2() {

//     const stringToBuffer = new StringToBuffer();
//     const bufferToString = new BufferToString();
//     const nullTransform = new NullTransform();

//     net.createServer((socket: net.Socket) => socket.pipe(socket)).listen(3001);
//     const socket = net.createConnection({ port: 3001 });
//     await new Promise((r, e) => socket.once('connect', r).once('error', e));
//     const socketHandler = new Transform<Buffer, Buffer>(socket);

//     const transform = stringToBuffer.connect(
//         socketHandler.connect(
//             bufferToString.connect(
//                 nullTransform
//             )
//         )
//     );

//     transform.write('0'.repeat(1e6));
//     transform.write('0'.repeat(1e6));
// }



