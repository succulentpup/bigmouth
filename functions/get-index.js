const fs = require('fs-extra');
const Mustache = require('mustache');
const BlueBirdPromise = require('bluebird');
const http = require('superagent-promise')(require('superagent'), BlueBirdPromise);
const AWS4 = require('aws4');
const URL = require('url');

const restaurantsApiRoot = process.env.restaurants_api;
const awsRegion = process.env.awsRegion;
const cognitoUserPoolId = process.env.cognitoUserPoolId;
const cognitoClientId = process.env.cognitoClientId;

let html;
const days = ['Sunday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function loadHtml() {
    if (html === undefined) {
        fs.readFile('static/index.html', 'utf8')
            .then(data => html = data)
            .catch(err => html = new Error('something went wrong reading the file'))
    }
    return Promise.resolve(html);
}

async function getRestaurants() {
    const url = URL.parse(restaurantsApiRoot);
    const opts = {
        host: url.hostname,
        path: url.pathname
    };
    AWS4.sign(opts);

    const restaurants = await  http
        .get(restaurantsApiRoot)
        .set('Host', opts.headers['Host'])
        .set('X-Amz-Date', opts.headers['X-Amz-Date'])
        .set('Authorization', opts.headers['Authorization'])
        .set('X-Amz-Security-Token', opts.headers['X-Amz-Security-Token']);
    return restaurants.body;
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
        searchUrl: `${restaurantsApiRoot}/search`
    };
    const  html = Mustache.render(template, view);

    return {
        statusCode: 200,
        body: html,
        headers: {
            'Content-Type': 'text/html; charset=UTF-8'
        }
    };
};
