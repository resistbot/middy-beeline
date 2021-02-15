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
module.exports = (opts) => ({
  before: (handler, next) => {
    const options = setopts(opts);

    if (!HC_INIT) {
      if (options.samplerHook) {
        // eslint-disable-next-line no-param-reassign, global-require
        handler.event.beeline = require('honeycomb-beeline')({
          writeKey: options.writeKey,
          samplerHook: options.samplerHook,
          serviceName: options.serviceName,
          dataset: options.dataset,
        });
      } else {
        // eslint-disable-next-line no-param-reassign, global-require
        handler.event.beeline = require('honeycomb-beeline')({
          writeKey: options.writeKey,
          sampleRate: options.sampleRate,
          serviceName: options.serviceName,
          dataset: options.dataset,
        });
      }
      HC_INIT = true;
    } else {
      // eslint-disable-next-line no-param-reassign, global-require
      handler.event.beeline = require('honeycomb-beeline')();
    }
    // eslint-disable-next-line no-param-reassign
    handler.event.trace = handler.event.beeline.startTrace();

    options.headerContext.forEach((head) => {
      const { header, contextname } = head;
      if (handler.event.headers[header]) {
        handler.event.beeline.addContext({
          [contextname]: handler.event.headers[header],
        });
      }
    });
    return next();
  },
  after: (handler, next) => {
    handler.event.beeline.finishTrace(handler.event.trace);
    handler.event.beeline.flush();
    return next();
  },
  onError: (handler, next) => {
    const options = setopts(opts);
    if (handler.event.beeline) {
      handler.event.beeline.addContext({
        error: true,
        [options.errorMessageContext]: handler.error.toString(),
      });
      handler.event.beeline.finishTrace(handler.event.trace);
      handler.event.beeline.flush();
    }

    return next(handler.error);
  },
});
