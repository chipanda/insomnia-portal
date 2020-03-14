### 检测浏览器是否支持passive event listener

```
try {
    const opts = {};
    let supportsPassive = false;
    Object.defineProperty(opts, 'passive', {
      get() {
        supportsPassive = true;
      }
    });
    window.addEventListener('test-passive', null, opts);
 } catch (e) {}
```