const middy = require('middy');
const beelineMiddlewareFactory = require('.');

describe('middy-beeline', () => {
  it('should extract keys', (done) => {
    const handler = middy((event, context, callback) => {
      callback(null, event.extracted);
    });

    handler.use(
      beelineMiddlewareFactory({
        writeKey: 'key',
        serviceName: 'myService',
        dataset: 'myDataset',
      }),
    );

    const event = {
      requestContext: {
        authorizer: {
          claims: {
            gender: 'male',
            'cognito:username': 'banglin',
          },
        },
      },
      headers: {
        'Content-Type': 'application/json',
      },
    };
    handler(event, null, (err) => {
      expect(err).toBe(null);
      done();
    });
  });
});
