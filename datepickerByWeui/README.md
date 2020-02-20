# datepicker

- 根据Weui的datepicker组件扩展的
- 展示传入start到end的时间picker，start日期最近（如2020.2.2），end日期最远（如2018.10.1）
- start/end可以为时间戳也可以为yyyy-mm-dd格式的日期

# 使用方法
```
weui.picker(createLastDateItem(start, end), {
    container: '.scroll-picker',
    defaultValue: [],
    id: 'single' + Math.floor(Math.random() * 100000),
    pickerTitle: 'title',
    onConfirm: (data) => {
        // ...
    },
    onClose: () => {
        // ...
    }
})
```