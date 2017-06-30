const chromeLauncher = require('lighthouse/chrome-launcher/chrome-launcher');
const CDP = require('chrome-remote-interface');
const argv = require('minimist')(process.argv.slice(2));
const fs = require('fs');

// 默认参数
const url = argv.url || 'https://www.baidu.com';
const format = argv.format === 'jpeg' ? 'jpeg' : 'png';
const viewportWidth = argv.viewportWidth || 1440;
const viewportHeight = argv.viewportHeight || 900;
const delay = argv.delay || 0;
const userAgent = argv.userAgent;
const fullPage = argv.full || true;

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

    if (userAgent) {
      await Network.setUserAgentOverrride({
        userAgent
      });
    }

    const deviceMetrics = {
      width: viewportWidth,
      height: viewportHeight,
      deviceScaleFactor: 0,
      mobile: false,
      fitWindow: false
    };

    await Emulation.setDeviceMetricsOverride(deviceMetrics);
    await Emulation.setVisibleSize({
      width: viewportWidth,
      height: viewportHeight
    });

    Page.navigate({
      url
    });

    Page.loadEventFired(async() => {

      const {root: {nodeId: documentNodeId}} = await DOM.getDocument();
      const {nodeId: bodyNodeId} = await DOM.querySelector({
        selector: 'body',
        nodeId: documentNodeId
      });

      const {model: {height: bodyHeight}} = await DOM.getBoxModel({
        nodeId: bodyNodeId
      });

      console.log('bodyBox: ', bodyHeight);

      await Emulation.setVisibleSize({
        width: viewportWidth,
        height: bodyHeight
      });

      await Emulation.forceViewport({
        x: 0,
        y: 0,
        scale: 1
      });

      setTimeout(async function () {
        const screenshot = await Page.captureScreenshot({
          format,
          fromSurface: true
        });
        const buffer = new Buffer(screenshot.data, 'base64');

        fs.writeFile('screenshot.png', buffer, 'base64', (err) => {
          if (err) {
            console.error(err);
          } else {
            console.log('Screenshot saved');
          }

          protocol.close();
          chrome.kill();
        })
      }, delay);
    });
  } catch (e) {
    console.error('Exception while taking screenshot:', e);
  }
};