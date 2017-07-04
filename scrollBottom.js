(async () => {
  return new Promise((resolve) => {
    let wHeight = document.body.clientHeight;
    let doucmentHeight = document.body.scrollHeight;
    // 注意，在 headless 模式下面 document.body.scrollTop 才能正确返回滚动距离的值
    // document.documentElement.scrollTop 总是会返回 0 ，
    // 这个两者表现在 chrome 浏览器的控制太下面是刚好相反的
    let timer = setInterval(() => {
      if (document.body.scrollTop >= doucmentHeight - wHeight) {
        clearInterval(timer);
        resolve(doucmentHeight + 30);
      } else {
        document.body.scrollTop += 30;
      }
    }, 30);
  });
})();
