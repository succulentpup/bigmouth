const fs = require('fs-extra');
const Mustache = require('mustache');
const BlueBirdPromise = require('bluebird');
const http = require('superagent-promise')(require('superagent'), BlueBirdPromise);
const AWS4 = require('aws4');
const URL = require('url');

const restaurantsApiRoot = process.env.restaurants_api;
const ordersApiRoot = process.env.orders_api;
const awsRegion = process.env.awsRegion;
const cognitoUserPoolId = process.env.cognitoUserPoolId;
const cognitoClientId = process.env.cognitoClientId;

let html;
const days = ['Sunday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

async function loadHtml() {
    if (html === undefined) {
        html = await (new Promise((resolve, reject) => {
            fs.readFile('static/index.html', 'utf8')
                .then(data => resolve(data))
                .catch(err => reject(err));
        }));
    }
    return html;
}

async function getRestaurants() {
    const url = URL.parse(restaurantsApiRoot);
    const opts = {
        host: url.hostname,
        path: url.pathname
    };
    AWS4.sign(opts);

    const httpReq = http
        .get(restaurantsApiRoot)
        .set('Host', opts.headers['Host'])
        .set('X-Amz-Date', opts.headers['X-Amz-Date'])
        .set('Authorization', opts.headers['Authorization']);
    if (opts.headers['X-Amz-Security-Token']) {
        httpReq
            .set('X-Amz-Security-Token', opts.headers['X-Amz-Security-Token']);
    }
    return (await httpReq).body;
}

module.exports.handler = async event => {
    const template = await loadHtml();
    const restaurants = await getRestaurants();
    const dayOfWeek = days[new Date().getDay()];
    const view = {
        dayOfWeek,
        restaurants,
        awsRegion,
        cognitoUserPoolId,
        cognitoClientId,
        searchUrl: `${restaurantsApiRoot}/search`,
        placeOrderUrl: `${ordersApiRoot}`
    };
    const html = Mustache.render(template, view);
    return {
        statusCode: 200,
        body: html,
        headers: {
            'Content-Type': 'text/html; charset=UTF-8'
        }
    };
};
