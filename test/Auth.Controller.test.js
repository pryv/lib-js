
const should = chai.should();
const expect = chai.expect;

const Controller = require('../src/Auth/Controller.js')


describe('Auth.Controller', function () {


  it('getReturnURL()', async () => {
    const myUrl = 'https://mysite.com/bobby';

    let error = null;
    try {
      Controller.getReturnURL('auto');
    } catch (e) {
      error = e;
    }
    expect(error).to.be.not.null;

    let fakeNavigator = { userAgent: 'android' };
    expect(Controller.getReturnURL('auto#', myUrl, fakeNavigator)).to.equal(myUrl + '#');
    expect(Controller.getReturnURL('auto?', myUrl, fakeNavigator)).to.equal(myUrl + '?');
    expect(Controller.getReturnURL(false, myUrl, fakeNavigator)).to.equal(myUrl + '#');
    expect(Controller.getReturnURL('self?', myUrl, fakeNavigator)).to.equal(myUrl + '?');

    expect(Controller.getReturnURL('http://zou.zou/toto#', myUrl, fakeNavigator)).to.equal('http://zou.zou/toto#');

    fakeNavigator =  { userAgent: 'Safari' };
    expect(Controller.getReturnURL('auto#', myUrl, fakeNavigator)).to.equal(false);
    expect(Controller.getReturnURL('auto?', myUrl, fakeNavigator)).to.equal(false);
    expect(Controller.getReturnURL(false, myUrl, fakeNavigator)).to.equal(false);
    expect(Controller.getReturnURL('self?', myUrl, fakeNavigator)).to.equal(myUrl + '?');

    expect(Controller.getReturnURL('http://zou.zou/toto#', myUrl, fakeNavigator)).to.equal('http://zou.zou/toto#');


    global.window = { location: { href: myUrl + '?prYvstatus=zouzou'} }
    expect(Controller.getReturnURL('self?', myUrl, fakeNavigator)).to.equal(myUrl + '?');

    
  });

  it('browserIsMobileOrTablet()', async () => {
    expect(Controller.browserIsMobileOrTablet({ userAgent: 'android' })).to.be.true;

    expect(Controller.browserIsMobileOrTablet({ userAgent: 'Safari' })).to.be.false;
  });

  it('getStatusFromURL()', async () => {
    expect('2jsadh').to.equal(Controller.getStatusFromURL(
      'https://my.Url.com/?bobby=2&prYvZoutOu=1&prYvstatus=2jsadh'));
  });

  it('getServiceInfoFromURL()', async () => {
    const serviceInfoUrl = Controller.getServiceInfoFromURL(
      'https://my.Url.com/?bobby=2&prYvZoutOu=1&pryvServiceInfoUrl=' + encodeURIComponent('https://reg.pryv.me/service/infos'));

    expect('https://reg.pryv.me/service/infos').to.equal(serviceInfoUrl);
  });


  it('cleanURLFromPrYvParams()', async () => {

    expect('https://my.Url.com/?bobby=2').to.equal(Controller.cleanURLFromPrYvParams(
      'https://my.Url.com/?bobby=2&prYvZoutOu=1&prYvstatus=2jsadh'));

    expect('https://my.Url.com/?pryvServiceInfoUrl=zzz').to.equal(Controller.cleanURLFromPrYvParams(
      'https://my.Url.com/?pryvServiceInfoUrl=zzz#prYvZoutOu=1&prYvstatus=2jsadh'));

    expect('https://my.Url.com/').to.equal(Controller.cleanURLFromPrYvParams(
      'https://my.Url.com/?prYvstatus=2jsadh'));

    expect('https://my.Url.com/').to.equal(Controller.cleanURLFromPrYvParams(
      'https://my.Url.com/#prYvstatus=2jsadh'));

    expect('https://my.Url.com/#bobby=2').to.equal(Controller.cleanURLFromPrYvParams(
      'https://my.Url.com/#bobby=2&prYvZoutOu=1&prYvstatus=2jsadh'));
    
  });

});


