function selectElement(ele, all) {
    if (all) document.querySelectorAll(ele);
    return document.querySelector(ele);
}
function bindEvent(ele, event, func) {
    return ele.addEventListener(event, func);
}
function setTranslate(wid) {
    return 'translate(' + wid + 'px, 0)';
}

class Gallery {
    constructor(opts) {
        this.swiperBox = selectElement(opts.box); // 滑动元素
        this.swiperContentBox = selectElement(opts.content); // 内容元素
        this.swiperPaginationBox = opts.pagination ? selectElement(opts.pagination) : ''; // 页码元素
        this.handleClose = opts.handleClose || '';
        this.data = opts.data; // 数据
        this.dataKey = opts.dataKey;
        this.contentWidth = opts.contentWidth || window.screen.width; // 单个展示元素宽度
        this.totalWidth = this.contentWidth * opts.data.length; // 总宽度 = 单个 * 长度
        this.halfWidth = this.contentWidth / 2; // 单个元素宽度的一半，主要用来判断是否往下/前一个元素滚动，超过一半就往下/前一个元素滚动，没超过就回原位
        this.dataIndex = opts.dataIndex || 0; // 初始定位：1
        this.currentIndex = this.dataIndex + 1; // 默认定位初始展示值 = 初始定位 + 1（初始定位从0开始，展示需要从1开始）
        this.swiperPos = parseFloat('-' + this.totalWidth * (this.dataIndex / opts.data.length)); // touchmove和touchend时偏移量
        this.swiperPoint = 'right'; // 偏移位置：left、right - 目前没用
        this.timer = ''; // 计时器，未必有用 - 还需要优化
        this.touchStartPos = ''; // touchstart时的偏移量
        this.touchMovePos = ''; // touchmove时的偏移量 - 目前没用
        this.touchEndPos = ''; // touchend时的偏移量
        this.touchStartTime = 0;
        // 宽度设定
        this.swiperBox.style.transform = setTranslate(this.swiperPos);
        this.swiperBox.style.width = this.totalWidth + 'px';
        this.swiperBox.innerHTML = '';
        // 页码设定
        this.setPagination(this.dataIndex + 1);

        this.isTouchMove = false;

        let _this = this;
        // 渲染数据和样式
        for (let j = 0; j < this.data.length; j++) {
            let element = this.data[j];
            if (this.dataKey) {
                element = this.data[j][this.dataKey];
            }
            const swiperEle = document.createElement('div');
            const imgEle = document.createElement('img');

            imgEle.setAttribute('src', element);

            swiperEle.classList.add('content');
            swiperEle.setAttribute('data-index', j + 1);
            swiperEle.appendChild(imgEle);
            swiperEle.style.width = this.contentWidth + 'px';

            this.swiperBox.appendChild(swiperEle);
        }
        bindEvent(this.swiperBox, 'touchmove', function (e) {
            _this.isTouchMove = true;
            _this.eleTouchMove(e, _this);
        });
        bindEvent(this.swiperBox, 'touchstart', function (e) {
            _this.eleTouchStart(e, _this);
        });
        bindEvent(this.swiperBox, 'touchend', function (e) {
            if (_this.isTouchMove == true) {
                _this.eleTouchEnd(e, _this);
            } else {
                _this.handleClose && _this.handleClose();
            }
        });
    }
    setPagination(i) {
        this.swiperPaginationBox.innerText = i + ' / ' + this.data.length;
    }
    setPos(ele, pos) {
        ele.style.transform = setTranslate(pos);
    }
    
    eleTouchStart(e, _this) {
        _this.touchStartTime = new Date().getTime();
        _this.touchStartPos = e.changedTouches[0].pageX; // 开始时点击的位置
        clearInterval(_this.timer);
    }

    eleTouchMove(e, _this) {
        // 最左侧偏移值为0，负值越大越右
        let distance = _this.touchStartPos - e.changedTouches[0].pageX; // 手指划过的长度，负值往左，正值往右
        let currentPos = _this.swiperPos - distance; // 手指当前滑动到的偏移值：touchstart时的位置 - 滑动长度（负值相加-往左，正值减去-往右）
        _this.touchEndPos = e.changedTouches[0].pageX; // 当前位置

        if (distance > 0) {
            // console.log('右');
            _this.swiperPoint = 'right';
            _this.currentIndex = Math.ceil((Math.abs(currentPos) + _this.halfWidth) / _this.contentWidth);
            if (currentPos <= parseFloat('-' + (_this.totalWidth - _this.contentWidth))) {
                currentPos = parseFloat('-' + (_this.totalWidth - _this.contentWidth));
                _this.currentIndex = _this.data.length;
            }
        } else if (distance < 0) {
            // console.log('左');
            _this.swiperPoint = 'left';
            _this.currentIndex = Math.ceil((Math.abs(currentPos) + _this.halfWidth) / _this.contentWidth);
            if (currentPos > 0) {
                currentPos = 0;
                _this.currentIndex = 1;
            }
        }
        _this.setPos(_this.swiperBox, currentPos);
        _this.setPagination(this.currentIndex);
    }
    
    eleTouchEnd(e, _this) {
        // startPos 滑动开始前的位置
        // 越往后平移距离越大负值越小，越往前平移距离越小负值越大，第一个为0
        let end = e.changedTouches[0].pageX; // 滑动结束后的位置
        let distance = _this.touchStartPos - end; // 手指划过的长度：正数（后）负数（前）
        let pointPos = _this.swiperPos - distance; // 手指滑动时位置：初始位置 - 滑动长度
        let swiperIndex = Math.ceil((Math.abs(pointPos) + _this.halfWidth) / _this.contentWidth) > _this.data.length ? _this.data.length : (Math.ceil((Math.abs(pointPos) + _this.halfWidth) / _this.contentWidth) < 0 ? 0 : Math.ceil((Math.abs(pointPos) + _this.halfWidth) / _this.contentWidth)); // 当前展示的索引

        _this.isTouchMove = false;

        let timer = new Date().getTime();
        if (Math.abs(distance) < 150 && timer - _this.touchStartTime < 200) {
            // console.log("quick move");
            if (distance >= 0) {
                _this.quickLeftToRight(pointPos, swiperIndex)
            } else {
                _this.quickRightToLeft(pointPos, swiperIndex)
            }
            // _this.quickMove(distance);
            return;
        }

        if (Math.abs(distance) >= _this.halfWidth) { // 如果滑动距离大于屏幕宽度的一半，表示需要往后或者往前
            // console.log("往前/后滑动");
            if (distance >= 0) {
                _this.moveLeftToRight(pointPos, swiperIndex)
            } else {
                _this.moveRightToLeft(pointPos, swiperIndex)
            }
        } else { // 小于一半时，还原位置
            // console.log('还原位置');
            if (distance >= 0) {
                _this.returnRightToLeft(pointPos, swiperIndex);
            } else {
                _this.returnLeftToRight(pointPos, swiperIndex);
            }
        }
    }

    quickLeftToRight(pos, index) {
        // 正数，往右移
        // console.log("下一个");
        let _this = this;
        if (pos < parseFloat('-' + (_this.totalWidth - _this.contentWidth))) {
            clearInterval(_this.timer)
            // console.log('大于所有元素总长度，超出了');
            return;
        }
        let count = pos;
        _this.timer = setInterval(function () {
            let result = count - 20;
            _this.setPos(_this.swiperBox, result);
            // _this.endLeftToRight(result, index);
            if (result < parseFloat('-' + _this.contentWidth * index)) {
                clearInterval(_this.timer);
                _this.setPos(_this.swiperBox, parseFloat('-' + _this.contentWidth * index));
                _this.swiperPos = parseFloat('-' + _this.contentWidth * index);
                _this.setPagination(index + 1);
            }
            count = result; // 每次赋个值
        }, 10);
    }

    quickRightToLeft(pos, index) {
        // 负数，往左移
        // console.log("前一个");
        let _this = this;
        if (pos > 0) {
            clearInterval(_this.timer)
            // console.log('大于0，超出了');
            return;
        }
        let count = pos;
        _this.timer = setInterval(function () {
            let result = count + 20;
            _this.setPos(_this.swiperBox, result);
            if (result > parseFloat('-' + _this.contentWidth * (index - 2))) {
                clearInterval(_this.timer);
                _this.setPos(_this.swiperBox, parseFloat('-' + _this.contentWidth * (index - 2)));
                _this.swiperPos = parseFloat('-' + _this.contentWidth * (index - 2));
                _this.setPagination(index - 1);
            }
            count = result; // 给count赋下一次的初始值
        }, 10);
    }

    returnLeftToRight(pos, index) {
        // 滑动差值是正数，还原的是往右移动的距离
        // console.log("左 -> 右");
        let _this = this;
        let count = pos;
        _this.timer = setInterval(function () {
            let result = count - 20;
            _this.setPos(_this.swiperBox, result);
            _this.endLeftToRight(result, index);
            count = result; // 每次赋个值
        }, 20);
    }

    returnRightToLeft(pos, index) {
        // 滑动差值是正数，还原的是往右移动的距离
        // console.log("右 -> 左");
        let _this = this;
        let count = pos;
        _this.timer = setInterval(function () {
            let result = count + 20;
            _this.setPos(_this.swiperBox, result);
            _this.endRightToLeft(result, index)
            count = result; // 每次赋个值
        }, 20);
    }

    moveLeftToRight(pos, index) {
        // 正数，往右移
        // console.log("下一个");
        let _this = this;
        if (pos < parseFloat('-' + (_this.totalWidth - _this.contentWidth))) {
            clearInterval(_this.timer)
            // console.log('大于所有元素总长度，超出了');
            return;
        }
        let count = pos;
        _this.timer = setInterval(function () {
            let result = count - 20;
            _this.setPos(_this.swiperBox, result);
            _this.endLeftToRight(result, index);
            count = result; // 每次赋个值
        }, 20);
    }

    moveRightToLeft(pos, index) {
        // 负数，往左移
        // console.log("前一个");
        let _this = this;
        if (pos > 0) {
            clearInterval(_this.timer)
            // console.log('大于0，超出了');
            return;
        }
        let count = pos;
        _this.timer = setInterval(function () {
            let result = count + 20;
            _this.setPos(_this.swiperBox, result);
            _this.endRightToLeft(result, index)
            count = result; // 给count赋下一次的初始值
        }, 20);
    }

    endLeftToRight(result, index){
        if (result < parseFloat('-' + this.contentWidth * (index - 1))) {
            clearInterval(this.timer);
            this.setPos(this.swiperBox, parseFloat('-' + this.contentWidth * (index - 1)));
            this.swiperPos = parseFloat('-' + this.contentWidth * (index - 1));
        }
    }
    endRightToLeft(result, index){
        if (result > parseFloat('-' + this.contentWidth * (index - 1))) {
            clearInterval(this.timer);
            this.setPos(this.swiperBox, parseFloat('-' + this.contentWidth * (index - 1)));
            this.swiperPos = parseFloat('-' + this.contentWidth * (index - 1));
        }
    }
}

export default Gallery;