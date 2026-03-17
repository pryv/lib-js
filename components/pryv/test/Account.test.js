/**
 * @license
 * [BSD-3-Clause](https://github.com/pryv/lib-js/blob/master/LICENSE)
 */
/* global describe, it, before, expect, pryv, testData */

let conn = null;

describe('[ACTX] Account', () => {
  before(async function () {
    this.timeout(15000);
    await testData.prepare();
    conn = new pryv.Connection(testData.apiEndpointWithToken);
  });

  describe('[AINX] account.get', function () {
    it('[AINA] get account info', async () => {
      const res = await conn.api([{
        method: 'account.get',
        params: {}
      }]);
      expect(res[0]).to.exist;
      expect(res[0].account).to.exist;
      expect(res[0].account.username).to.equal(testData.username);
      expect(res[0].account.email).to.exist;
    });
  });

  describe('[ASUX] account.get storageUsed', function () {
    it('[ASUA] storageUsed has expected fields', async () => {
      const res = await conn.api([{
        method: 'account.get',
        params: {}
      }]);
      const account = res[0].account;
      expect(account.storageUsed).to.exist;
      expect(account.storageUsed.dbDocuments).to.be.a('number');
      expect(account.storageUsed.attachedFiles).to.be.a('number');
    });
  });

  describe('[ACPX] account.changePassword', function () {
    it('[ACPA] change password and change back', async () => {
      const oldPassword = testData.password;
      const newPassword = oldPassword + '-new';

      // Change to new password
      const res1 = await conn.api([{
        method: 'account.changePassword',
        params: { oldPassword, newPassword }
      }]);
      expect(res1[0]).to.exist;
      expect(res1[0].error).to.not.exist;

      // Change back to original
      const res2 = await conn.api([{
        method: 'account.changePassword',
        params: { oldPassword: newPassword, newPassword: oldPassword }
      }]);
      expect(res2[0]).to.exist;
      expect(res2[0].error).to.not.exist;
    });

    it('[ACPB] reject wrong old password', async () => {
      const res = await conn.api([{
        method: 'account.changePassword',
        params: { oldPassword: 'wrong-password', newPassword: 'new-password' }
      }]);
      expect(res[0]).to.exist;
      expect(res[0].error).to.exist;
    });
  });
});
