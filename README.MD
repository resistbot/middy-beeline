middy-beeline
===

Middy middleware for instrumenting with [Honeycomb](https://honeycomb.io). 

## Getting Started

Installing `middy-beeline`

```bash
npm install --save middy # You need middy installed
npm install --save middy-beeline
```

Running the tests
```bash
npm test
```

## Usage

```javascript
const middyBeeline = require('middy-beeline')
const middy = require('middy')

const someHandler = (event, context, callback) => {

  // The beeline instance is accessible from the event object
  const { header, body, beeline }  = event;
  // all regular beeline calls work
  beeline.addContext({mycontext: "this"})
}

const handler = middy(someHandler)
  .use(middyBeeline({
    writeKey: "key",
    serviceName: "myService",
    dataset: "myDataset",
    sampleRate: 5,
    headerContext: [
        { header: 'x-my-header', contextname: 'my_header' },
    ],
    errorMessageContext: 'error_message',
})

module.exports = { handler }
```

## How it works
The middleware will startup beeline-node-js with the options you configure before your handler runs, create a trace, and add any of the header context you supplied. It adds the `beeline` instance to the handler.event so you can use it in your function- add spans, more context, etc.

Once your handler is done, the middleware will close the trace and run a `beeline.flush()` to make sure all the events are sent.

## Options
Some are obvious from the beeline for nodejs documentation (writeKey, dataset, serviceName, sampleRate) but there are a few extras. Just like the beeline docs say, you can substitute `sampleRate` with `samplerHook: fn()` and the middleware will use your samplerhook function instead of the standard rate.

Also the headerContext list allows you to tell middy-beeline which headers to capture as context and what they should be named. Also by default, any errors are marked as `error:true` and `error_message: <the error message>`. You can change the context key for errors using `errorMessageContext`.

## Contributing

Feel free to open a Pull Request or Issue w/ a bug report or feature request.
