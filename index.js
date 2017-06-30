const chromeLauncher = require('lighthouse/chrome-launcher/chrome-launcher');
const CDP = require('chrome-remote-interface');

async function launchChrome(headless = true) {
  return await chromeLauncher.launch({
    port: '9222',
    chromeFlags: [
      '--window-siz=414,732',
      '--disable-gpu',
      headless ? '--headless' : ''
    ]
  });
}

(async function () {
  const chrome = await launchChrome();
  const protocol = await CDP({
    port: chrome.port
  });

  const {
    Page,
    DOM,
    Runtime
  } = protocol;

  await Promise.all([Page.enable(), Runtime.enable(), DOM.enable()]);

  Page.navigate({
    url: 'https://www.meizu.com'
  });

  Page.loadEventFired(async() => {
    const document = await DOM.getDocument();
    const js = "[].map.call(document.querySelectorAll('.rank-list .book-list .name'), el => el.innerHTML);";

    console.log(document);

    const slides = await DOM.querySelectorAll({
      nodeId: document.root.nodeId,
      selector: '#mz-index-banner .swiper-wrapper'
    });

    console.log(slides);

    // Evaluate the JS expression in the page.
    // const result = await Runtime.evaluate({
    //   expression: js,
    //   returnByValue: true
    // });


    // protocol.close();
    // chrome.kill();
  });
})();