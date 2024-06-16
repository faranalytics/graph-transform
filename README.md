# Graph-Transform

Graph-Transform provides a framework for building type-safe data transformation graphs based on Node.js streams.

## Introduction

Graph-Transform provides an intuitive framework for constructing data tansformation graphs using native Node.js streams.  You can use the built-in library of commonly used `Transforms` or implement your own.

### Features

- Consume any native Node.js Readable, Writable, Duplex, or Transform stream and add it to your graph.
- Error propagation and selective termination of inoperable graph components.
- Automatic message queueing in order to assist with handling of backpressure.

## Table of Contents

- [Installation](#installation)
- [Concepts](#concepts)
- [API](#api)
- [How to Implement a Transform](#how-to-implement-a-transform)
- [How to Consume a Readable, Writable, Duplex, or Transform Native Node.js Stream](#how-to-consume-a-readable-writable-duplex-or-transform-native-nodejs-stream)
- [Backpressue](#backpressure)
- [Best Practices](#best-practices)

## Installation

```bash
npm install graph-transform
```

## Concepts

### Transform

A `Transform` is a node in a graph-like data pipeline. Each `Transform` is reponsible for transforming its inputs into an output that can be consumed by its connected `Transforms`.  By successively connecting `Transforms` into a network of data transformations, sophisticated graph-like pipelines can be constructed.

## API

### The Transform class.

**new graph-transform.Transform\<InT, OutT\>(stream)**
- `stream` `<stream.Writable | stream.Readable>` An instance of a `Writable`, `Readable`, `Duplex`, or `Transform` Node.js stream.

**transform.connect\<T extends Transform\<OutT, unknown\>\>(...transforms: Array\<T\>)**
- transforms `<Array<T>>` An array of `Transform<OutT, unknown>` to be connected to this `Transform`.

Returns: `<Transform<InT, OutT>>`

**transform.disconnect\<T extends Transform\<OutT, unknown\>\>(...transforms: Array\<T\>)**
- transforms `<Array<T>>` An array of `Transform<OutT, unknown>` to be disconnected to this `Transform`.

Returns: `<Transform<InT, OutT>>`

**transform.write(data: InT)**
- data `<InT>` Data to write to the writable side of the stream.

Returns: `<Promise<void>>`

## How to Implement a Transform

In order to implement a `Transform`, extend the `graph-transform.Transform` class and pass a Node.js `stream.Transform` implementation to the super's constructor.  

For example, the following `StringToNumber` implementation will convert a numeric string to a number.  

> NB: `writableObjectMode` and `readableObjectMode` are both set to true in this example; hence, the Node.js stream implementation will handle the input and output as objects.  It's important that `writableObjectMode` and `readableObjectMode` accurately reflect the input and output types of your `Transform`.

```ts
class StringToNumber extends Transform<string, number> {

    constructor(options: stream.TransformOptions) {
        super(new stream.Transform({
            ...options, ...{
                writableObjectMode: true,
                readableObjectMode: true,
                transform: (chunk: string, encoding: BufferEncoding, callback: stream.TransformCallback) => {
                    const result = parseFloat(chunk.toString());
                    callback(null, result);
                }
            }
        }));
    }
}
```

## How to Consume a Readable, Writable, Duplex, or Transform Native Node.js Stream

In this hypothetical example a type-safe `Transform` is constructed from a `net.Socket`.  The resulting `Transform` instance can be used in a data transformation graph.

```ts
net.createServer((socket: net.Socket) => socket.pipe(socket)).listen(3000);
const socket = net.createConnection({ port: 3000 });
await new Promise((r, e) => socket.once('connect', r).once('error', e));
const socketHandler = new Transform<Buffer, Buffer>(socket);
```

## Backpressure
Backpressure is an important security concern associated with streaming APIs.  Graph-Transform respects backpressue; when a stream is draining it will queue messages until a `drain` event is emitted by the `Transform's` stream.  On each call to `transform.write` the `transform.queueSize` property will be synchronously incremented in order to reflect the current size of the queue.  For object mode streams the queue size is equal to the number of logged objects.  For streams not in object mode, the queue size is calculated using the `length` property of the logged `string` or `Buffer`.   Your application can optionally monitor the size of the queue and respond appropriately.

## Best Practices

### Avoid Reuse of Transform Instances (unless you know what you are doing)
Reusing the same Transform instance can result in unexpected phenomena.  If the same Transform instance is used in different locations in your graph, you need to think carefully about the resulting edges that are connected to both the input and the output of the Transform instance.  Most of the time if you need to use the same class of Transform more than once, it's advisable to create a new instance for each use.