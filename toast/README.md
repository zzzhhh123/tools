# toast

##使用方法和参数
```
var message = '提示信息';
var toast = new Toast(message, {
    iconPos: 'up', // up: icon在上；down：icon在下
    boxElement: 'toast-box', // toast外层元素类名，带默认样式
    contentElement: 'toast-content', toast内容元素类名，带默认样式
    customClass: '', // String或者Array，contentElement自定义类名
    fadeInIntervalTime: 20, // 淡入时长
    fadeOutIntervalTime: 20, // 淡出时长
    isRemove: true, // boxElement元素关闭后是否删除
    noClose: false, // 淡入后是否淡出
    max: 10, // fadeIn透明度最大值
    min: 0, // fadeOut透明度最小值
    start: 0, // fadeIn透明度起始值
    end: 10, // fadeOut透明度起始值 
    suffix: '.', // ./# , 参数boxElement和contentElement的类名或者id标识，默认.
    timeoutDelay: 1500, // fadeOut触发延迟时间
    iconType: '' // warning\loading\success，icon图案
});
toast.show(); // 显示提示信息
toast.resetProperty(key, value); // 重新给参数赋值
toast.resetIconType(type); // 重新设置iconType的值
toast.resetMessage(msg); // 重新设置提示信息
toast.resetCloseStatus(boolean); // 重新设置是否在淡入后关闭toast
toast.quickFadeIn(); // 淡入直接完成
toast.quickFadeOut(); // 淡出直接完成
toast.resetFadeIn(); // 重置淡入效果，透明度为0
toast.resetFadeOut(); // 重置淡入效果，透明度为1

```
