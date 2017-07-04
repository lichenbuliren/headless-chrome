const util = require('./util');
const argv = require('minimist')(process.argv.slice(2));
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));

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

  try {
    const {
      chrome,
      protocol
    } = await util.devInit();

    const {
      Page,
      Runtime,
      Emulation,
      Network
    } = protocol;

    await Promise.all([
      Page.enable(),
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

    Page.loadEventFired(async() => {

      let [scrollToBottom, imageLoaded] = await Promise.all([
        fs.readFileAsync('./scrollBottom.js', { encoding: 'utf-8'}), 
        fs.readFileAsync('./awaitImageLoad.js', { encoding: 'utf-8'})
      ]);

      let evaluateScrollToBottom = await Runtime.evaluate({
        expression: scrollToBottom,
        awaitPromise: true,
        returnByValue: true
      });

      console.log(evaluateScrollToBottom.result);

      // 设置截图区域, 截图高度从计算表达式得到
      await Emulation.setVisibleSize({
        width: viewportWidth,
        height: evaluateScrollToBottom.result.value
      });

      await Emulation.forceViewport({
        x: 0,
        y: 0,
        scale: 1
      });

      let screenshot = await Page.captureScreenshot({
        format,
        fromSurface: true
      });

      let buffer = new Buffer(screenshot.data, 'base64');

      try {
        let writeFileResult = await fs.writeFileAsync('screenshot.png', buffer, 'base64');
        console.log('screenshot saved success');
      } catch (error) {
        console.log(error);
      }

      util.shutdown({
        chrome,
        protocol
      });
    });
  } catch (error) {
    console.log(error);
    util.shutdown({
      chrome,
      protocol
    });
  }
};