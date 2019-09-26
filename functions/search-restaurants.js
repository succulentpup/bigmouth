const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const topN = process.env.topN || 8;
const tableName = process.env.restaurants_table;

async function searchRestaurantsByTheme(theme, topN) {
    const params = {
        TableName: tableName,
        Limit: topN,
        FilterExpression: "contains(themes, :theme)",
        ExpressionAttributeValues: {":theme": theme}
    };
    return dynamoDB.scan(params).promise();
}

module.exports.handler = async event => {
    const body = JSON.parse(event.body);
    const restaurants = await searchRestaurantsByTheme(body.theme, topN);
    return {
        statusCode: 200,
        body: JSON.stringify(restaurants.Items)
    }
};
