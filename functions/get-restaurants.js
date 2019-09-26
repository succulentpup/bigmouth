const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const topN = process.env.topN || 8;
const tableName = process.env.restaurants_table;

async function getRestaurants(topN) {
    const params = {
        TableName: tableName,
        Limit: topN
    };
    return dynamoDB.scan(params).promise();
}

module.exports.handler = async event => {
    const restaurants = await getRestaurants(topN);
    console.log('restaurants:', restaurants);
    return {
        statusCode: 200,
        body: JSON.stringify(restaurants.Items)
    }
};
