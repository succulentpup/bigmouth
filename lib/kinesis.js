function parsePayload(record) {
    const res = new Buffer(record.kinesis.data, 'base64').toString('utf8');
    return JSON.parse(res);
}

function getRecords(event) {
    return event.Records.map(parsePayload);
}

module.exports = {
    getRecords
};