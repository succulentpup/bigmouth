const expect = require('chai').expect;
const when = require('../steps/when');
const init = require('../steps/init').init;

describe('When we invoke the GET / endpoint', async () => {
    before(async () => {
        await init();
    });
    it('Should return the index page with 8 restaurants', async () => {
        const res = await when.we_invoke_get_index();
        expect(res.statusCode).to.equal(200);
        expect(res.headers['Content-Type']).to.equal('text/html; charset=UTF-8');
        expect(res.body).to.not.be.null;
    });
});