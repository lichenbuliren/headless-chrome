const chromeLauncher = require('lighthouse/chrome-launcher/chrome-launcher');
const CDP = require('chrome-remote-interface');

const shutdown = ({chrome, protocol}) => {
  protocol.close();
  chrome.kill();
}

const devInit = async () => {
  try {
    const chrome = await chromeLauncher.launch({
      port: '9222',
      chromeFlags: [
        '--disable-gpu',
        '--hide-scrollbars',
        '--headless'
      ]
    });

    const protocol = await CDP({
      port: chrome.port
    });

    return {
      chrome,
      protocol
    }
  } catch (e) {
    console.log(e);
  }
}

exports.shutdown = shutdown;
exports.devInit = devInit;