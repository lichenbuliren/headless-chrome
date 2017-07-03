const util = require('./util');
const argv = require('minimist')(process.argv.slice(2));
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));

// 默认参数
const url = argv.url || 'https://www.baidu.com';
const format = argv.format === 'jpeg' ? 'jpeg' : 'png';
const viewportWidth = argv.viewportWidth || 1440;
const viewportHeight = argv.viewportHeight || 400;
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
    Network,
    Console
  } = protocol;

  await Promise.all([
    Page.enable(),
    DOM.enable(),
    Runtime.enable(),
    Network.enable(),
    Console.enable()
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

  // 设置模拟器窗口规格
  await Emulation.setDeviceMetricsOverride(deviceMetrics);
  // 设置截图区域
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

    const evaluate = await Runtime.evaluate({
      expression: scrollToBottom,
      awaitPromise: true
    });

    console.dir(evaluate.result);

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

    // 设置截图区域
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

      fs.writeFileAsync('screenshot.png', buffer, 'base64').then(() => {
        console.log('screenshot save success!');
        util.shutdown({
          chrome,
          protocol
        });
      }).catch((e) => {
        console.log(e);
        util.shutdown({
          chrome,
          protocol
        });
      });
    }, 2000);
  });
};