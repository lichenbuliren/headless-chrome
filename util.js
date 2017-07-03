const chromeLauncher = require('lighthouse/chrome-launcher/chrome-launcher');
const CDP = require('chrome-remote-interface');
const fs = require('fs');

const shutdown = ({chrome, protocol}) => {
  protocol.close();
  chrome.kill();
}

const devInit = async () => {
  try {
    const chrome = await chromeLauncher.launch({
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

const loadFile = async (path) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, {
      encoding: 'UTF-8'
    }, (err, data) => {
      if (err) reject(err);
      resolve(data);
    });
  });
};

exports.shutdown = shutdown;
exports.devInit = devInit;
exports.loadFile = loadFile;