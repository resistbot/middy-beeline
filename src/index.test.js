const createEvent = require('@serverless/event-mocks');
const middyBeeline = require('.');

describe('middleware', () => {
  it('should append beeline to the event', () => {
    const middleware = middyBeeline({
      writeKey: 'key',
      serviceName: 'myService',
      dataset: 'myDataset',
      samplerHook: () => false,
    });

    const event = createEvent.default('aws:apiGateway');
    const request = { event };
    middleware.before(request);
    expect(request.event.beeline).toBeDefined();
    expect(request.event.trace).toBe('FAKE TRACE');

    // Second call should have it already init'd
    middleware.before(request);
    expect(request.event.beeline).toBeDefined();
    expect(request.event.trace).toBe('FAKE TRACE');
  });
});
