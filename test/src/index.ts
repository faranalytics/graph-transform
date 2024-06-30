/* eslint-disable @typescript-eslint/no-unused-vars */
import * as net from 'node:net';
import { Transform, ObjectToBuffer, BufferToObject, ConsoleHandler, SocketHandler, BufferToString, AnyToTest } from 'graph-transform';
import { TemporalTransform } from './temporal_transform.js';

class Greeter {
    public greeting: string = '0'.repeat(1e6);
}

async function test1() {

    const temporalTransform = new TemporalTransform({ time: 1000 });
    const objectToBuffer1 = new ObjectToBuffer<Greeter>();
    const objectToBuffer2 = new ObjectToBuffer<Greeter>();
    const bufferToString = new BufferToString();
    const bufferToObject = new BufferToObject<Greeter>();
    const consoleHandler = new ConsoleHandler();
    const anyToTest = new AnyToTest(JSON.stringify(new Greeter()));

    net.createServer((socket: net.Socket) => {
        const socketHandler1 = new SocketHandler<Greeter, Greeter>(socket);
        const socketHandler2 = new SocketHandler<Greeter, Greeter>(socket);

        socketHandler1.connect(socketHandler2);

    }).listen(3000);
    const socket = net.createConnection({ port: 3000 });
    await new Promise((r, e) => socket.once('connect', r).once('error', e));
    const socketHandler = new SocketHandler<Greeter, Greeter>(socket);


    const transform = temporalTransform.connect(
        objectToBuffer1.connect(
            bufferToObject.connect(
                socketHandler.connect(
                    objectToBuffer2.connect(
                        bufferToString.connect(
                            consoleHandler,
                            anyToTest
                        )
                    )
                )
            )
        )
    );


    transform.write(new Greeter());
    transform.write(new Greeter());
}

test1();