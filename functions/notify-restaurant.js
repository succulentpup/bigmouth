const AWS = require('aws-sdk');
const GetRecords = require('../lib/kinesis').getRecords;

const Kinesis = new AWS.Kinesis();
const Sns = new AWS.SNS();

const snsTopicArn = process.env.restaurant_notification_topic;
const streamName = process.env.order_events_stream;

module.exports.handler = async event => {
    const records = GetRecords(event);
    const ordersPlaced = records.filter(record => record.eventType === 'order-placed');

    for(let order of ordersPlaced){
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

        Kinesis.putRecord(putRecordReq).promise();
        console.log(`published 'restaurant_notified' event to kinesis`);
    }
};
