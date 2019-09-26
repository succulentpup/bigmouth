const _ = require('lodash');

const APP_ROOT = '../../';

const viaHandler = async (event, functionName) => {
    const handler = require(`${APP_ROOT}/functions/${functionName}`).handler;
    try {
        const res = await handler(event, {});
        const content_type = _.get(res, 'headers.Content-Type', 'application/json');
        if (res.body && content_type === 'application/json') {
            res.body = JSON.parse(res.body);
        }
        return res;
    } catch (e) {
        return e;
    }
};

const we_invoke_get_index = () =>
    viaHandler(
        {},
        'get-index'
    );

const we_invoke_get_restaurants = () =>
    viaHandler(
        {},
        'get-restaurants'
    );

const we_invoke_search_restaurants = theme => {
    let event = {
        body: JSON.stringify({theme})
    };
    return viaHandler(event, 'search-restaurants');
};

module.exports = {
    we_invoke_get_index,
    we_invoke_get_restaurants,
    we_invoke_search_restaurants
}