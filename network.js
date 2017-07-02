const chromeLauncher = require('lighthouse/chrome-launcher/chrome-launcher');
const CDP = require('chrome-remote-interface');
const util =  require('./util');

async function launchChrome(headless = true) {
  return await chromeLauncher.launch({
    chromeFlags: [
      '--disable-gpu',
      '--hide-scrollbars',
      headless ? '--headless' : ''
    ]
  });
}

init();

async function init() {
  try {
    const chrome = await launchChrome();
    const protocol = await CDP({
      port: chrome.port
    });

    const {
      Page,
      DOM,
      Runtime,
      Emulation,
      Network
    } = protocol;

    await Promise.all([
      Page.enable(),
      DOM.enable(),
      Runtime.enable(),
      Network.enable()
    ]);

    // Network.loadingFinished((params) => {

    // });

    await Page.navigate({
      url: 'https://www.meizu.com'
    });

    let prev = current = '';
    // 在 window loaded 之前开启，不然无法抓去所有的请求
    Network.requestWillBeSent((params) => {
      if (params.request.url.match(/https:\/\/openfile.meizu.com/)) {
        prev = current;
        current = params.request.url;
        console.log(params.request.url);
      }
    });

    Page.loadEventFired(async() => {
      
      const scrollToBottom = 'window.scrollTo(0,document.body.scrollHeight); window.scrollY;';
      const evaluate = await Runtime.evaluate({
        expression: scrollToBottom
      });

      setTimeout(() => {
        util.shutdown({
          chrome,
          protocol
        });
      }, 1000);
    });
  } catch (e) {
    util.shutdown({
      chrome,
      protocol
    });
    console.error('Exception while taking screenshot:', e);
  }
};