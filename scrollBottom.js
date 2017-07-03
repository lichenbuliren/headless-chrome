(async () => {
  return new Promise((resolve) => {
    const totalScrollHeight = document.body.scrollHeight;
    let scrollHeight = window.innerHeight;
    let prevScroll = 0;

    const timer = setInterval(() => {
      if (scrollHeight < totalScrollHeight) {
        window.scrollTo(prevScroll, scrollHeight);
        prevScroll = scrollHeight;
        scrollHeight += scrollHeight;
      } else {
        window.scrollTo(prevScroll, totalScrollHeight);
        clearInterval(timer);
        resolve(totalScrollHeight);
      }
    }, 500);
  });
})();
