const middy = require('middy');
const middyBeeline = require('.');

describe('middy-beeline', () => {
    it('should extract keys', (done) => {
        const handler = middy((event, context, callback) => {
            callback(null, event.extracted);
        });

        handler.use(
            middyBeeline({
                writeKey: 'key',
                serviceName: 'myService',
                dataset: 'myDataset',
            }),
        );

        const event = {
            requestContext: {
                
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
