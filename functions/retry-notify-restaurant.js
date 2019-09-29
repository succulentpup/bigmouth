const AWS = require('aws-sdk');

const Sns = new AWS.SNS();

const snsTopicArn = process.env.restaurant_dlq_notification_topic;

async function notify(event) {
    console.log('retry-notify-restaurant is called');
    const order = JSON.parse(event.Records[0].Sns.Message);
    order.retried = true;
    const pubReq = {
        Message: JSON.stringify(order),
        TopicArn: snsTopicArn
    };
    console.log('publishing it to dlq');
    await Sns.publish(pubReq).promise();
    console.log('sns notification has been sent');
}

module.exports.handler = async event => await notify(event);
