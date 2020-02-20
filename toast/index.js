import './toast.scss'

function selectorElement(ele, all) {
    if (all) return document.querySelectorAll(ele);
    return document.querySelector(ele);
}

function createElement(ele) {
    return document.createElement(ele);
}

export default class Toast {
    constructor(message, params) {
        this.message = message || '';
        this.params = params;
        if (typeof message === 'object') {
            this.params = message;
        }
        this.fadeInTime = '';
        this.fadeOutTime = '';
        let opts = {
            iconPos: 'up',
            boxElement: 'toast-box',
            contentElement: 'toast-content',
            fadeInIntervalTime: 20,
            fadeOutIntervalTime: 20,
            isRemove: true,
            max: 10,
            min: 0,
            noClose: false,
            start: 0, // fadeIn透明度起始值
            end: 10, // fadeOut透明度起始值
            suffix: '.',
            timeoutDelay: 1500,
            iconType: '' // warning\loading\success
        };
        this.options = Object.assign({}, opts, this.params);
    }
    show() {
        let opts = this.options;
        let boxEle = selectorElement(`${opts.suffix}${opts.boxElement}`);
        let contentEle = selectorElement(`${opts.suffix}${opts.contentElement}`);
        if (!boxEle) {
            let b = createElement('div');
            let c = createElement('div');
            // 内层
            let msg = createElement('div');
            msg.innerHTML = this.message;
            c.appendChild(msg);
            c.classList.add(opts.contentElement);
            if (opts.iconType) {
                c.classList.add(opts.iconType, opts.iconType && 'has-icon', opts.iconPos);
                if (opts.iconType == 'loading') {
                    c.appendChild(createElement("span"));
                }
            } else {
                c.classList.add('no-icon');
            }
            // 外层
            b.appendChild(c);
            b.classList.add('toast', opts.boxElement);
            boxEle = b;
            contentEle = c;
            selectorElement('body').appendChild(b);
        } else {
            contentEle.innerHTML = this.message;
            if (opts.iconType) {
                contentEle.classList.remove('no-icon');
                contentEle.classList.add(opts.iconType, opts.iconType && 'has-icon', opts.iconPos);
                if (opts.iconType == 'loading') {
                    contentEle.appendChild(createElement("span"));
                }
            }
        }
        if (opts.customClass) {
            if (typeof opts.customClass == 'string') {
                contentEle.classList.add(opts.customClass);
            }
            else if (Array.isArray(opts.customClass)) {
                let list = opts.customClass.join(',');
                contentEle.classList.add(list);
            }
        }
        this.contentEle = contentEle;
        this.removeEle = boxEle;
        // fade in
        this.fadeIn();
        // fade out
        this.fadeOut();
    }
    resetProperty(key, val) {
        let obj = this.options;
        if (obj.hasOwnProperty(key)) {
            obj[key] = val;
        }
    }
    resetMessage(message) {
        this.message = message;
    }
    resetIconType(type) { // 重置提示icon
        this.options.iconType = type;
    }
    resetCloseStatus(bool) { // 重置是否关闭
        this.options.noClose = bool;
    }
    fadeIn() {
        this.fadeInEvent();
    }
    fadeOut() {
        let params = this.options;
        if (params.noClose == false) {
            let _this = this;
            let t = setTimeout(function () {
                clearTimeout(t);
                _this.fadeOutEvent();
            }, params.timeoutDelay);
        }
    }
    fadeInEvent(duration) { // 淡入事件
        let params = this.options;
        let start = params.start;
        this.removeEle.style.display = 'flex';
        this.contentEle.style.opacity = 0;
        this.fadeInTime = setInterval(() => {
            start++;
            this.contentEle.style.opacity = start / 10;
            if (start == params.max) {
                clearInterval(this.fadeInTime);
            }
        }, duration || params.fadeInDuration);
    }
    fadeOutEvent(duration) { // 淡出事件
        let params = this.options;
        let end = params.end;
        this.fadeOutTime = setInterval(() => {
            end--;
            this.contentEle.style.opacity = end / 10;
            if (end <= params.min) {
                this.removeEle.style.display = 'none';
                params.isRemove && this.removeEle.remove();
                clearInterval(this.fadeOutTime);
            }
        }, duration || params.fadeOutDuration);
    }
    resetFadeIn() { // 重置淡入效果
        clearInterval(this.fadeInTime);
        this.contentEle.style.opacity = 0;
    }
    resetFadeOut() { // 重置淡出效果
        clearInterval(this.fadeOutTime);
        this.contentEle.style.opacity = 1;
    }
    quickFadeIn() { // 直接入场
        clearInterval(this.fadeInTime);
        this.contentEle.style.opacity = 1;
    }
    quickFadeOut() { // 直接出场
        clearInterval(this.fadeOutTime);
        this.options.isRemove && this.removeEle.remove();
        this.contentEle.style.opacity = 0;
    }
}
