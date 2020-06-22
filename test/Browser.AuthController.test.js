
const should = chai.should();
const expect = chai.expect;

const AuthController = require('../src/Browser/AuthController.js')


describe('Browser.AuthController', function () {

  it('getReturnURL()', async () => {
    const myUrl = 'https://mysite.com/bobby';

    let error = null;
    try {
      AuthController.getReturnURL('auto');
    } catch (e) {
      error = e;
    }
    expect(error).to.be.not.null;

    let fakeNavigator = { userAgent: 'android' };
    expect(AuthController.getReturnURL('auto#', myUrl, fakeNavigator)).to.equal(myUrl + '#');
    expect(AuthController.getReturnURL('auto?', myUrl, fakeNavigator)).to.equal(myUrl + '?');
    expect(AuthController.getReturnURL(false, myUrl, fakeNavigator)).to.equal(myUrl + '#');
    expect(AuthController.getReturnURL('self?', myUrl, fakeNavigator)).to.equal(myUrl + '?');

    expect(AuthController.getReturnURL('http://zou.zou/toto#', myUrl, fakeNavigator)).to.equal('http://zou.zou/toto#');

    fakeNavigator =  { userAgent: 'Safari' };
    expect(AuthController.getReturnURL('auto#', myUrl, fakeNavigator)).to.equal(false);
    expect(AuthController.getReturnURL('auto?', myUrl, fakeNavigator)).to.equal(false);
    expect(AuthController.getReturnURL(false, myUrl, fakeNavigator)).to.equal(false);
    expect(AuthController.getReturnURL('self?', myUrl, fakeNavigator)).to.equal(myUrl + '?');

    expect(AuthController.getReturnURL('http://zou.zou/toto#', myUrl, fakeNavigator)).to.equal('http://zou.zou/toto#');


    global.window = { location: { href: myUrl + '?prYvstatus=zouzou'} }
    expect(AuthController.getReturnURL('self?', myUrl, fakeNavigator)).to.equal(myUrl + '?');

    
  });

  it('browserIsMobileOrTablet()', async () => {
    expect(AuthController.browserIsMobileOrTablet({ userAgent: 'android' })).to.be.true;

    expect(AuthController.browserIsMobileOrTablet({ userAgent: 'Safari' })).to.be.false;
  });

  it('getStatusFromURL()', async () => {
    expect('2jsadh').to.equal(AuthController.getStatusFromURL(
      'https://my.Url.com/?bobby=2&prYvZoutOu=1&prYvstatus=2jsadh'));
  });

  it('getServiceInfoFromURL()', async () => {
    const serviceInfoUrl = AuthController.getServiceInfoFromURL(
      'https://my.Url.com/?bobby=2&prYvZoutOu=1&pryvServiceInfoUrl=' + encodeURIComponent('https://reg.pryv.me/service/infos'));

    expect('https://reg.pryv.me/service/infos').to.equal(serviceInfoUrl);
  });


  it('cleanURLFromPrYvParams()', async () => {

    expect('https://my.Url.com/?bobby=2').to.equal(AuthController.cleanURLFromPrYvParams(
      'https://my.Url.com/?bobby=2&prYvZoutOu=1&prYvstatus=2jsadh'));

    expect('https://my.Url.com/?pryvServiceInfoUrl=zzz').to.equal(AuthController.cleanURLFromPrYvParams(
      'https://my.Url.com/?pryvServiceInfoUrl=zzz#prYvZoutOu=1&prYvstatus=2jsadh'));

    expect('https://my.Url.com/').to.equal(AuthController.cleanURLFromPrYvParams(
      'https://my.Url.com/?prYvstatus=2jsadh'));

    expect('https://my.Url.com/').to.equal(AuthController.cleanURLFromPrYvParams(
      'https://my.Url.com/#prYvstatus=2jsadh'));

    expect('https://my.Url.com/#bobby=2').to.equal(AuthController.cleanURLFromPrYvParams(
      'https://my.Url.com/#bobby=2&prYvZoutOu=1&prYvstatus=2jsadh'));
    
  });

});


