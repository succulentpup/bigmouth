const AWS = require('aws-sdk');

const Sns = new AWS.SNS();

const snsTopicArnDlq = process.env.restaurant_dlq_notification_topic;

//this file can be enhanced to retry sending the push notification to restaurant
//left it handle it later as I'm implementing this for understanding purpose
async function retry(event) {
    console.log('retry-notify-restaurant is called');
    const order = JSON.parse(event.Records[0].Sns.Message);
    order.retried = true;
    const pubReq = {
        Message: JSON.stringify(order),
        TopicArn: snsTopicArnDlq
    };
    console.log('publishing it to dlq');
    await Sns.publish(pubReq).promise();
    console.log('sns notification has been sent');
}

module.exports.handler = async event => await retry(event);
