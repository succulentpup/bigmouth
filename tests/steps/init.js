const awsCred = require('awscred');
let initialised = false;

const init = async () => {
    if (initialised){
        return;
    }
    process.env.AWS_REGION = 'us-east-1';
    process.env.restaurants_api = 'https://1tg2d7k11l.execute-api.us-east-1.amazonaws.com/dev/restaurants';
    process.env.restaurants_table = 'restaurants';
    process.env.cognitoClientId = 'testCognitoClientId';
    process.env.cognitoUserPoolId = 'testCognitoUserPoolId';
    const cred = await (new Promise((resolve, reject) => {
        awsCred.load((err, data) => {
            if (err)
                reject(err);
            resolve(data.credentials);
        });
    }));
    process.env.AWS_ACCESS_KEY_ID = cred.accessKeyId;
    process.env.AWS_SECRET_ACCESS_KEY = cred.secretAccessKey;
    initialised = true;
};

module.exports = {
    init
};