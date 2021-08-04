[![GitHub release](https://img.shields.io/github/release/resistbot/middy-beeline?include_prereleases=&sort=semver)](https://github.com/resistbot/middy-beeline/releases/) [![Tests](https://github.com/resistbot/middy-beeline/workflows/Tests/badge.svg)](https://github.com/resistbot/middy-beeline/actions?query=workflow:"Tests")

[![NPM](https://nodei.co/npm/@resistbot/middy-beeline.png?compact=true)](https://npmjs.org/package/@resistbot/middy-beeline)

# middy-beeline

Middy middleware for instrumenting with [Honeycomb](https://honeycomb.io).

## Getting Started

Installing `@resistbot/middy-beeline`

```bash
npm install --save middy # You need middy installed
npm install --save @resistbot/middy-beeline
```

Running the tests

```bash
npm test
```

## Usage

```javascript
const middyBeeline = require('@resistbot/middy-beeline')
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

The middleware will startup [Beeline for Nodejs](https://docs.honeycomb.io/getting-data-in/javascript/beeline-nodejs) with the options you configure before your handler runs, create a trace, and add any of the header context you supplied. It adds the `beeline` instance to the handler.event so you can use it in your function- add spans, more context, etc.

Once your handler is done, the middleware will close the trace and run a `beeline.flush()` to make sure all the events are sent.

## Options

Some are obvious from the beeline for nodejs documentation (writeKey, dataset, serviceName, sampleRate) but there are a few extras. Just like the beeline docs say, you can substitute `sampleRate` with `samplerHook: fn()` and the middleware will use your samplerhook function instead of the standard rate.

Also the headerContext list allows you to tell middy-beeline which headers to capture as context and what they should be named. Also by default, any errors are marked as `error:true` and `error_message: <the error message>`. You can change the context key for errors using `errorMessageContext`.

## Contributing

Feel free to open a Pull Request or Issue w/ a bug report or feature request.

## Creating a release

1. Update `package.json` version element to match the release you'll be using.
1. Create a new Release once your code is merged. If the two versions match, a new version will be delivered to [npm](https://www.npmjs.com/package/@resistbot/middy-beeline).
