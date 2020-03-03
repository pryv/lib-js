
const should = chai.should();
const expect = chai.expect;

const Controller = require('../src/Auth/Controller.js')


describe('Auth.Controller', function () {
  let myWindow;
  let myNavigator;

  this.beforeEach(async () => {
    myWindow = global.window || null;
    myNavigator = global.navigator || null;
  });

  this.afterEach(async () =>  {
    if (!myWindow) {
      delete global.window;
    } else {
      global.window = myWindow;
    }
    if (! myNavigator) {
      delete global.navigator;
    } else {
      global.navigator = myNavigator;
    }
    
  });

  it('getReturnURL()', async () => {
    const myUrl = 'https://mysite.com/bobby';

    global.window = {location: {href: myUrl }}

    let error = null;
    try {
      Controller.getReturnURL('auto');
    } catch (e) {
      error = e;
    }
    expect(error).to.be.not.null;

    global.navigator = { userAgent: 'android' };
    expect(Controller.getReturnURL('auto#')).to.equal(myUrl + '#');
    expect(Controller.getReturnURL('auto?')).to.equal(myUrl + '?');
    expect(Controller.getReturnURL(false)).to.equal(myUrl + '#');
    expect(Controller.getReturnURL('self?')).to.equal(myUrl + '?');

    expect(Controller.getReturnURL('http://zou.zou/toto#')).to.equal('http://zou.zou/toto#');

    global.navigator = { userAgent: 'Safari' };
    expect(Controller.getReturnURL('auto#')).to.equal(false);
    expect(Controller.getReturnURL('auto?')).to.equal(false);
    expect(Controller.getReturnURL(false)).to.equal(false);
    expect(Controller.getReturnURL('self?')).to.equal(myUrl + '?');

    expect(Controller.getReturnURL('http://zou.zou/toto#')).to.equal('http://zou.zou/toto#');


    global.window = { location: { href: myUrl + '?prYvStatus=zouzou'} }
    expect(Controller.getReturnURL('self?')).to.equal(myUrl);

    
  });

  it('browserIsMobileOrTablet()', async () => {
    global.navigator = {userAgent : 'android'};
    expect(Controller.browserIsMobileOrTablet()).to.be.true;

    global.navigator = { userAgent: 'Safari' };
    expect(Controller.browserIsMobileOrTablet()).to.be.false;
  });



  it('cleanStatusFromURL()', async () => {

    expect('https://my.Url.com/?bobby=2').to.equal(Controller.cleanStatusFromURL(
      'https://my.Url.com/?bobby=2&prYvZoutOu=1&prYvStatus=2jsadh'));

    expect('https://my.Url.com/').to.equal(Controller.cleanStatusFromURL(
      'https://my.Url.com/?prYvStatus=2jsadh'));

    expect('https://my.Url.com/').to.equal(Controller.cleanStatusFromURL(
      'https://my.Url.com/#prYvStatus=2jsadh'));

    expect('https://my.Url.com/#bobby=2').to.equal(Controller.cleanStatusFromURL(
      'https://my.Url.com/#bobby=2&prYvZoutOu=1&prYvStatus=2jsadh'));
    
  });

});


