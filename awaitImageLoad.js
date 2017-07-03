(async () => {
  try {
    return new Promise((resolve, reject) => {
      const imagesList = document.querySelectorAll('[lazy-src]');
      let loadedCount = imagesList.length;
      imagesList.forEach((image, index) => {
        const lazySrc = image.getAttribute('lazy-src');
        image.setAttribute('src', lazySrc);
        image.onload = () => {
          loadedCount -= 1;
          if (loadedCount === 0) {
            resolve('image loaded success!');
          }
        };
      });
    });
  } catch (error) {
    console.log(error);
  }
})();