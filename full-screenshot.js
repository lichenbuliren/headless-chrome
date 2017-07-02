const util = require('./util');
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

init();

async function init() {
  const {
    chrome,
    protocol
  } = await util.devInit();

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

  await Page.navigate({
    url
  });

  Page.loadEventFired(async () => {
    const scrollToBottom = fs.readFileSync('./scrollBottom.js', {
      encoding: 'UTF-8'
    });
    console.log(scrollToBottom);

    const evaluate = await Runtime.evaluate({
      expression: scrollToBottom
    })

    const {
      root: {
        nodeId: documentNodeId
      }
    } = await DOM.getDocument();
    const {
      nodeId: bodyNodeId
    } = await DOM.querySelector({
      selector: 'body',
      nodeId: documentNodeId
    });

    const {
      model: {
        height: bodyHeight
      }
    } = await DOM.getBoxModel({
      nodeId: bodyNodeId
    });

    await Emulation.setVisibleSize({
      width: viewportWidth,
      height: evaluate.result.value
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

        util({
          chrome,
          protocol
        });
      })
    }, 2000);
  });
};