let HC_INIT = false;

const defaults = {
  writeKey: 'null',
  serviceName: '',
  dataset: 'test',
  sampleRate: 10,
  headerContext: [],
  errorMessageContext: 'error_message',
};

const honeycombMiddleware = (opts = {}) => {
  const options = { ...defaults, ...opts };

  const honeycombMiddlewareBefore = async (request) => {
    if (!HC_INIT) {
      // eslint-disable-next-line no-console
      console.log('Initializing beeline', {
        ...options,
        ...{ writeKey: options.writeKey.slice(0, 4) },
      });
      // eslint-disable-next-line global-require
      request.event.beeline = require('honeycomb-beeline')(options);
      HC_INIT = true;
    } else {
      // eslint-disable-next-line no-console
      console.log('Initializing beeline, already init', {
        ...options,
        ...{ writeKey: options.writeKey.slice(0, 4) },
      });
      // eslint-disable-next-line global-require
      request.event.beeline = require('honeycomb-beeline')();
    }
    request.event.trace = request.event.beeline.startTrace();

    options.headerContext.forEach((head) => {
      const { header, contextname } = head;
      if (request.event.headers[header]) {
        request.event.beeline.addContext({
          [contextname]: request.event.headers[header],
        });
      }
    });
  };

  const honeycombMiddlewareAfter = async (request) => {
    request.event.beeline.finishTrace(request.event.trace);
    request.event.beeline.flush();
  };

  const honeycombMiddlewareOnError = async (request) => {
    if (request.event.beeline) {
      request.event.beeline.addContext({
        error: true,
        [options.errorMessageContext]: request.error.toString(),
      });
      request.event.beeline.finishTrace(request.event.trace);
      request.event.beeline.flush();
    }
  };

  return {
    before: honeycombMiddlewareBefore,
    after: honeycombMiddlewareAfter,
    onError: honeycombMiddlewareOnError,
  };
};

module.exports = honeycombMiddleware;
