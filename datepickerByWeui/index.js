// 判断日期是否相同
function checkSomeDate(start, end) {
    let d1 = getYMDHM(start).date;
    let d2 = getYMDHM(end).date;
    return d1 == d2;
}
// 计算日期长度
function calculateDateRange(start, end) {
    let range = getYMDHM(start).timestamp - getYMDHM(end).timestamp;
    let result = Math.floor(range / 86400000);
    if (result == 0) {
        result = checkSomeDate(start, end) ? 0 : 1;
    }
    return result
}
// 小于10补0
function supplyZero(time) {
    return `${time < 10 ? '0' : ''}${time}`;
}
// iOS系统要把日期中的-转换为/
function iOSDate(date) {
    return date.replace(/-/g, '/');
}
// 转为日期格式 yyyy-mm-dd
function changeToDate(timestamp, ext = 'zh') {
    let currentYear = new Date().getFullYear();
    let date = timestamp ? new Date(timestamp) : new Date();
    let result = `${currentYear != date.getFullYear() ? (date.getFullYear() + '年') : ''}${date.getMonth() + 1}月${date.getDate()}日`;
    ext != 'zh' && (result = `${currentYear != date.getFullYear() ? (date.getFullYear() + ext) : ''}${date.getMonth() + 1}${ext}${date.getDate()}`);

    return result;
}
// 获取日期
function getYMDHM(timestamp, ext = '-') { // timestamp：时间戳或者yyyy-dd-mm (hh:mm:ss)格式日期
    let time = timestamp ? timestamp : new Date().getTime();
    time = typeof time == 'number' ? time : iOSDate(time.toString());
    return {
        ymd_zh: changeToDate(time),
        ymd_full: `${new Date(time).getFullYear()}${ext}${supplyZero(new Date(time).getMonth() + 1)}${ext}${supplyZero(new Date(time).getDate())}`,
        year: new Date(time).getFullYear(),
        month: new Date(time).getMonth() + 1,
        date: new Date(time).getDate(),
        hour: new Date(time).getHours(),
        minute: new Date(time).getMinutes(),
        timestamp: new Date(time).getTime()
    }
}
// 计算日期之间的时间
function createLastDateItem(start, end) { // start：开始时间， end：回推的结束时间
    const items = function (i, tips, child = []) {
        return {
            value: i,
            label: `${i}${tips}`,
            children: child
        }
    }
    const minutes = function (ts) {
        let curminute = getYMDHM(ts).minute;
        let minutemiddle = [];
        let minutefirst = [];
        let minutelast = [];
        for (let i = 0; i < 60; i++) {
            if (i < curminute + 1) {
                minutelast.push(items(i, '分'))
            } else {
                i == curminute + 1 && minutefirst.push(items(i - 1, '分'));
                minutefirst.push(items(i, '分'))
            }
            minutemiddle.push(items(i, '分'))
        }
        return {
            near: minutefirst,
            middle: minutemiddle,
            far: minutelast
        };
    }
    const hours = function (ts) {
        let hour = getYMDHM(ts).hour;
        let hourFirst = [];
        let hourMiddle = [];
        let hourLast = [];
        let minute = minutes(ts);
        for (let i = 0; i < 24; i++) {
            if (i < hour + 1) {
                hourFirst.push(items(i, '时', i == hour ? minute.far : minute.middle))
                if (i == hour && minute.near.length > 0) {
                    hourLast.push(items(i, '时', minute.near));
                }
            } else {
                hourLast.push(items(i, '时', minute.middle))
            }
            hourMiddle.push(items(i, '时', minute.middle));
        }
        return {
            near: hourFirst,
            middle: hourMiddle,
            far: hourLast
        };
    }
    const minuteInCurHours = function (ts, tips) { // tips，1：只有一个‘小时’选项，2：有多个‘小时’选项
        let minute = getYMDHM(ts).minute;
        let curminute = getYMDHM().minute;
        let result = [];
        if (tips == 1 && minute == curminute) { // 只有一个‘小时’选项且‘分’相同
            result.push(items(minute, '分'))
        } else { // 其他情况
            let cur = minute > curminute ? curminute : minute;
            let start = tips == 2 ? 0 : cur; // 多个‘小时’选项中，‘分’选项起始为0；只有一个‘小时’选项中，判断开始分钟数最大值和当前分钟数最大值的大小
            let len = tips == 2 ? cur : curminute; // 多个‘小时’选项，长度为0到传入时间戳的‘分’；只有一个‘小时’选项中，长度为‘分’差值
            for (let i = start; i <= len; i++) {
                result.push(items(i, '分'));
            }
        }
        return result;
    }
    const hourInOneDay = function (ts) {
        let hour = getYMDHM(ts).hour;
        let curhour = getYMDHM().hour;
        let minute = minutes(ts);
        let result = [];
        if (hour == curhour) { // 只有1个‘小时’选项
            result.push(items(curhour, '时', minuteInCurHours(ts, 1)))
        } else { // 有多个‘小时’选项
            for (let i = hour; i <= curhour; i++) {
                if (i == hour) {
                    result.push(items(i, '时', minute.near))
                } else if (i == curhour) {
                    result.push(items(i, '时', minuteInCurHours(ts, 2)))
                } else {
                    result.push(items(i, '时', minute.middle))
                }
            }
        }
        return result;
    }
    const date = function (ts, tips) {
        let result;
        if (tips == 'far') {
            result = {value: ts.ymd_full, label: `${ts.ymd_zh}`, children: hours(ts.timestamp).far};
        } else if (tips == 'near') {
            result = {value: ts.ymd_full, label: `${ts.ymd_zh}`, children: hours(ts.timestamp).near};
        } else {
            result = {value: ts.ymd_full, label: `${ts.ymd_zh}`, children: hours(ts.timestamp).middle};
        }
        return result;
    }
    // near：最近的日期，far：最远的日期
    let len = calculateDateRange(start, end);
    let array = [];
    if (len == 1) {
        array.push(date(getYMDHM(end), 'far'));
        array.push(date(getYMDHM(start), 'near'));
    } else if (len > 0) {
        for (let i = len; i >= 0; i--) {
            array.push(date(getYMDHM(start - (86400000 * i)), i == len ? 'far' : i == 0 ? 'near' : null));
        }
    } else if (len == 0) {
        array.push({value: getYMDHM(start).ymd_full, label: `${getYMDHM(start).ymd_zh}`, children: hourInOneDay(end)})
    }
    return array;
}

export default createLastDateItem