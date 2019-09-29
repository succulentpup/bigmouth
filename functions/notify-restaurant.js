const AWS = require('aws-sdk');
const Chance = require('chance').Chance();

const GetRecords = require('../lib/kinesis').getRecords;

const Kinesis = new AWS.Kinesis();
const Sns = new AWS.SNS();

const snsTopicArn = process.env.restaurant_notification_topic;
const retrySnsTopicArn = process.env.restaurant_retry_notification_topic;
const streamName = process.env.order_events_stream;

async function notify(order) {
    if (Chance.bool({likelihood: 25})){ // 25% chances to failure
        throw new Error("boom");
    }
    const pubReq = {
        Message: JSON.stringify(order),
        TopicArn: snsTopicArn
    };
    await Sns.publish(pubReq).promise();
    console.log('SNS notification has been sent');

    const data = Object.create(order);
    data.eventType = 'restaurant_notified';
    const putRecordReq = {
        Data: JSON.stringify(data),
        PartitionKey: order.orderId,
        StreamName: streamName
    };
    await Kinesis.putRecord(putRecordReq).promise();
    console.log(`published 'restaurant_notified' event to kinesis`);
}

module.exports.handler = async event => {
    const records = GetRecords(event);
    const ordersPlaced = records.filter(record => record.eventType === 'order-placed');

    for (let order of ordersPlaced) {
        try {
            await notify(order, snsTopicArn);
        } catch (e) {
            const pubReq = {
                Message: JSON.stringify(order),
                TopicArn: retrySnsTopicArn
            };
            console.log('sending notification for retry purpose');
            await Sns.publish(pubReq).promise();
            console.log(`retrying this order: ${JSON.stringify(order)}`);
        }
    }
};
