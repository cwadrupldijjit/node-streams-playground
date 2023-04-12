import { Readable, Writable, Duplex, Transform } from 'node:stream';

const readableItems = [ 1, 2, 3, 4 ];
let currentIndex = 0;
/**
 * A Readable stream is a source of values; it contains the data and only provides one of the
 * values when requested
 */
const readable = new Readable({
    // this `push`es the data, which allows you to do an asynchronous operation to read the
    // necessary data
    read() {
        if (currentIndex == readableItems.length) {
            // pushing "null" will signal the end of the stream
            this.push(null);
        }
        else {
            this.push(readableItems[currentIndex++]);
        }
    },
    objectMode: true,
});

// this is the shorthand for the above:
// const readable = Readable.from([ 1, 2, 3, 4 ]);
// The data passed to the `.from` method can be an async iterator (even such as another stream)

/**
 * As such, this will iterate through each item provided in the array above and then end;
 * because readable streams implement an async iterator, you can loop over it using the
 * `for...await` loop syntax
 */
for await (const num of readable) {
    console.log('readable:', num);
}

/**
 * A Writable stream is a destination; it cannot be read from and has the expectation that when
 * something tells it to write something, it will execute the provided "write" method
 */
const writable = new Writable({
    write(chunk, encoding, done) {
        console.log('writable:', chunk);
        // if the "done" is never called, it seems to assume that the writable is now ready to
        // close; this means that you can wait until another async operation is complete before
        // calling "done", though calling it synchronously here works fine, too
        done();
    },
    // this allows any value through it, not just strings, Buffers, and UInt8Arrays
    objectMode: true,
});

const items = [ 1, 2, 3, 4 ];

for (const item of items) {
    writable.write(item);
}

writable.end();


const duplexReadItems = [ 1, 2, 3, 4 ];
const duplexWriteItems = [ 'a', 'b', 'c', 'd' ];
let duplexIndex = 0;
/**
 * A Duplex stream is both a Readable and Writable stream, but its input (written data) isn't
 * necessarily its output (read data); a network socket is a good example, where something
 * read from a request through that socket isn't directly regurgitated back to where the
 * request came from
 */
const duplex = new Duplex({
    read() {
        if (duplexIndex >= duplexReadItems.length) {
            this.push(null);
        }
        else {
            this.push(duplexReadItems[duplexIndex++]);
        }
    },
    write(chunk, encoding, done) {
        console.log('duplex write:', chunk);
        done();
    },
    objectMode: true,
    // this is required so that I can show reading and writing done separately
    autoDestroy: false,
});

for await (const item of duplex) {
    console.log('duplex read:', item);
}

for (const item of duplexWriteItems) {
    duplex.write(item);
}

duplex.end();

/**
 * A Transform stream is a duplex stream that has the linkage from the input (write) to
 * the output (read); examples of this are encryption, code preprocessors, etc.
 */
const transform = new Transform({
    transform(chunk, encoding, next) {
        if (typeof chunk == 'number') {
            next(null, `number: ${chunk.toFixed(1)}`);
        }
        else {
            next(null, `string: ${chunk.toUpperCase()}`);
        }
    },
    objectMode: true,
});
const transformItems = [ 1, 'a', 2, 'b' ];

for (const item of transformItems) {
    transform.write(item);
}

for await (const result of transform) {
    console.log('transform', result);
}
