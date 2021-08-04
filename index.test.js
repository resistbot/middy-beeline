const middyBeeline = require('.');

describe('middy-beeline', () => {
  it('should extract keys', () => {
    const middleware = middyBeeline({
      writeKey: 'key',
      serviceName: 'myService',
      dataset: 'myDataset',
      samplerHook: () => false,
    });

    const event = {
      requestContext: {},
      headers: {
        'Content-Type': 'application/json',
      },
    };
    const request = { event };
    middleware.before(request);
  });
});
