/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/* global describe, it, before, expect, pryv, testData */

const { createId: cuid } = require('@paralleldrive/cuid2');

// Note: testData.username is a non-MFA-protected test user, so we cannot
// exercise the success paths of mfaChallenge / mfaVerify against pryv.me.
// What we can verify:
//   - argument validation
//   - bogus mfaToken → PryvError on the wire
//   - MfaRequiredError type + export shape
// The happy path is exercised end-to-end by open-pryv.io's MFA test suite
// (which spins up a fake SMS provider); replicating that here would require
// a mock layer the project doesn't ship.

describe('[MFLX] Service MFA', function () {
  let service;

  before(async function () {
    this.timeout(15000);
    await testData.prepare();
    service = new pryv.Service(testData.serviceInfoUrl);
  });

  describe('[MCHX] Service.mfaChallenge', function () {
    it('[MCHA] rejects when args are missing', async function () {
      let caught;
      try { await service.mfaChallenge(testData.username); } catch (e) { caught = e; }
      expect(caught).to.be.instanceOf(pryv.PryvError);
    });

    it('[MCHB] throws PryvError on bogus mfaToken', async function () {
      this.timeout(15000);
      let caught;
      try {
        await service.mfaChallenge(testData.username, 'bogus-' + cuid().slice(0, 8));
      } catch (e) { caught = e; }
      expect(caught).to.be.instanceOf(pryv.PryvError);
      expect(caught.status).to.be.gte(400);
    });
  });

  describe('[MVRX] Service.mfaVerify', function () {
    it('[MVRA] rejects when args are missing', async function () {
      let caught;
      try { await service.mfaVerify(testData.username, 'token'); } catch (e) { caught = e; }
      expect(caught).to.be.instanceOf(pryv.PryvError);
    });

    it('[MVRB] throws PryvError on bogus mfaToken', async function () {
      this.timeout(15000);
      let caught;
      try {
        await service.mfaVerify(
          testData.username,
          'bogus-' + cuid().slice(0, 8),
          '123456'
        );
      } catch (e) { caught = e; }
      expect(caught).to.be.instanceOf(pryv.PryvError);
      expect(caught.status).to.be.gte(400);
    });
  });

  describe('[MERX] MfaRequiredError', function () {
    it('[MERA] is exported on the package root and extends PryvError', function () {
      expect(pryv.MfaRequiredError).to.be.a('function');
      const err = new pryv.MfaRequiredError(
        'tok-abc',
        { status: 200 },
        { mfaToken: 'tok-abc' }
      );
      expect(err).to.be.instanceOf(pryv.MfaRequiredError);
      expect(err).to.be.instanceOf(pryv.PryvError);
      expect(err.mfaToken).to.equal('tok-abc');
      expect(err.id).to.equal('mfa-required');
      expect(err.status).to.equal(200);
      expect(err.name).to.equal('MfaRequiredError');
    });

    it('[MERB] picks up id/message from API error body when provided', function () {
      const err = new pryv.MfaRequiredError(
        'tok-xyz',
        { status: 401 },
        { error: { id: 'custom-id', message: 'custom msg' } }
      );
      expect(err.id).to.equal('custom-id');
      expect(err.message).to.equal('custom msg');
    });
  });
});
