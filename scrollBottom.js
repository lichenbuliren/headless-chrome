(async function() {
  return new Promise((resolve) => {
    const totalScrollHeight = document.body.scrollHeight;
    const windowHeight = window.innerHeight;
    let scrollHeight = windowHeight;
    let prevScroll = 0;

    const timer = setInterval(() => {
      if (scrollHeight < totalScrollHeight) {
        window.scrollTo(prevScroll, scrollHeight);
        prevScroll = scrollHeight;
        scrollHeight += windowHeight;
      } else {
        window.scrollTo(prevScroll, totalScrollHeight);
        clearInterval(timer);
        resolve(totalScrollHeight);
      }
    }, 500);
  });
})();
