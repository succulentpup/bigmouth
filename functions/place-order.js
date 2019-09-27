const Chance = require('chance').Chance();
const AWS = require('aws-sdk');

const Kinesis = new AWS.Kinesis();
const StreamName = process.env.order_events_stream;

module.exports.handler = async event => {
    const restaurant = JSON.parse(event.body).restaurantName;
    const emailId = event.requestContext.authorizer.claims.email;
    const orderId = Chance.guid();

    const data = {
        orderId,
        emailId,
        restaurant,
        eventType: 'order-placed'
    };

    const putReq = {
        Data: JSON.stringify(data),
        PartitionKey: orderId,
        StreamName: StreamName
    };

    await Kinesis.putRecord(putReq).promise();

    return {
        statusCode: 200,
        body: JSON.stringify({orderId})
    };
};
