## chrome headless 模式练习

### 1、Headless 兼容性问题
- document.body.scrollTop vs document.documentElement.scrollTop   这两者，在正常的 chrome 浏览器和 headless 模式下的表现形式刚好相反；在正常浏览器下面，`document.body.scrollTop` 总是返回 0，而在 headless 模式下面，`document.documentElement.scrollTop` 却总是返回 0 ，谨记！