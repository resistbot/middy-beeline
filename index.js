let HC_INIT = false;

const setopts = (opts) => {
  const defaults = {
    writeKey: 'null',
    serviceName: '',
    dataset: 'test',
    sampleRate: 10,
    headerContext: [],
    errorMessageContext: 'error_message',
  };

  const options = { ...defaults, ...opts };
  return options;
};

const honeycombMiddleware = (opts) => {
  const options = setopts(opts);

  const honeycombMiddlewareBefore = (request) => {
    if (!HC_INIT) {
      if (options.samplerHook) {
        // eslint-disable-next-line no-param-reassign, global-require
        request.event.beeline = require('honeycomb-beeline')({
          writeKey: options.writeKey,
          samplerHook: options.samplerHook,
          serviceName: options.serviceName,
          dataset: options.dataset,
        });
      } else {
        // eslint-disable-next-line no-param-reassign, global-require
        request.event.beeline = require('honeycomb-beeline')({
          writeKey: options.writeKey,
          sampleRate: options.sampleRate,
          serviceName: options.serviceName,
          dataset: options.dataset,
        });
      }
      HC_INIT = true;
    } else {
      // eslint-disable-next-line no-param-reassign, global-require
      request.event.beeline = require('honeycomb-beeline')();
    }
    // eslint-disable-next-line no-param-reassign
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

  const honeycombMiddlewareAfter = (request) => {
    request.event.beeline.finishTrace(request.event.trace);
    request.event.beeline.flush();
  };

  const honeycombMiddlewareOnError = (request) => {
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
