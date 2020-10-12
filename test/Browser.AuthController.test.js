
const should = chai.should();
const expect = chai.expect;

const LoginButton = require('../src/Browser/LoginButton.js')

describe('Browser.LoginButton', function () {

  it('getReturnURL()', async () => {
    const myUrl = 'https://mysite.com/bobby';

    let error = null;
    try {
      LoginButton.getReturnURL('auto');
    } catch (e) {
      error = e;
    }
    expect(error).to.be.not.null;

    let fakeNavigator = { userAgent: 'android' };
    expect(LoginButton.getReturnURL('auto#', myUrl, fakeNavigator)).to.equal(myUrl + '#');
    expect(LoginButton.getReturnURL('auto?', myUrl, fakeNavigator)).to.equal(myUrl + '?');
    expect(LoginButton.getReturnURL(false, myUrl, fakeNavigator)).to.equal(myUrl + '#');
    expect(LoginButton.getReturnURL('self?', myUrl, fakeNavigator)).to.equal(myUrl + '?');

    expect(LoginButton.getReturnURL('http://zou.zou/toto#', myUrl, fakeNavigator)).to.equal('http://zou.zou/toto#');

    fakeNavigator =  { userAgent: 'Safari' };
    expect(LoginButton.getReturnURL('auto#', myUrl, fakeNavigator)).to.equal(false);
    expect(LoginButton.getReturnURL('auto?', myUrl, fakeNavigator)).to.equal(false);
    expect(LoginButton.getReturnURL(false, myUrl, fakeNavigator)).to.equal(false);
    expect(LoginButton.getReturnURL('self?', myUrl, fakeNavigator)).to.equal(myUrl + '?');

    expect(LoginButton.getReturnURL('http://zou.zou/toto#', myUrl, fakeNavigator)).to.equal('http://zou.zou/toto#');


    global.window = { location: { href: myUrl + '?prYvstatus=zouzou'} }
    expect(LoginButton.getReturnURL('self?', myUrl, fakeNavigator)).to.equal(myUrl + '?');

    
  });

  it('browserIsMobileOrTablet()', async () => {
    expect(LoginButton.browserIsMobileOrTablet({ userAgent: 'android' })).to.be.true;

    expect(LoginButton.browserIsMobileOrTablet({ userAgent: 'Safari' })).to.be.false;
  });

  it('getStatusFromURL()', async () => {
    expect('2jsadh').to.equal(LoginButton.getStatusFromURL(
      'https://my.Url.com/?bobby=2&prYvZoutOu=1&prYvstatus=2jsadh'));
  });

  it('getServiceInfoFromURL()', async () => {
    const serviceInfoUrl = LoginButton.getServiceInfoFromURL(
      'https://my.Url.com/?bobby=2&prYvZoutOu=1&pryvServiceInfoUrl=' + encodeURIComponent('https://reg.pryv.me/service/infos'));

    expect('https://reg.pryv.me/service/infos').to.equal(serviceInfoUrl);
  });


  it('cleanURLFromPrYvParams()', async () => {

    expect('https://my.Url.com/?bobby=2').to.equal(LoginButton.cleanURLFromPrYvParams(
      'https://my.Url.com/?bobby=2&prYvZoutOu=1&prYvstatus=2jsadh'));

    expect('https://my.Url.com/?pryvServiceInfoUrl=zzz').to.equal(LoginButton.cleanURLFromPrYvParams(
      'https://my.Url.com/?pryvServiceInfoUrl=zzz#prYvZoutOu=1&prYvstatus=2jsadh'));

    expect('https://my.Url.com/').to.equal(LoginButton.cleanURLFromPrYvParams(
      'https://my.Url.com/?prYvstatus=2jsadh'));

    expect('https://my.Url.com/').to.equal(LoginButton.cleanURLFromPrYvParams(
      'https://my.Url.com/#prYvstatus=2jsadh'));

    expect('https://my.Url.com/#bobby=2').to.equal(LoginButton.cleanURLFromPrYvParams(
      'https://my.Url.com/#bobby=2&prYvZoutOu=1&prYvstatus=2jsadh'));
    
  });

});


