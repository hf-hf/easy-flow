const menuList = [
    {
        id: '1',
        type: 'start',
        name: '开始节点',
        ico: 'el-icon-video-play',
        open: true,
        children: [
            {
                id: '11',
                type: 'timer',
                name: 'kafkaIn',
                ico: 'el-icon-time',
                // 自定义覆盖样式
                style: {}
            }
        ]
    },
    {
        id: '2',
        type: 'function',
        name: '功能节点',
        ico: 'el-icon-video-play',
        open: true,
        children: [
            {
                id: '11',
                type: 'node',
                name: '进区域',
                ico: 'el-icon-time',
                // 自定义覆盖样式
                style: {}
            },
            {
                id: '12',
                type: 'node',
                name: '出区域',
                ico: 'el-icon-time',
                // 自定义覆盖样式
                style: {}
            },
            {
                id: '13',
                type: 'node',
                name: '断电拆除',
                ico: 'el-icon-time',
                // 自定义覆盖样式
                style: {}
            },
            {
                id: '14',
                type: 'node',
                name: '时间区间',
                ico: 'el-icon-time',
                // 自定义覆盖样式
                style: {}
            }
        ]
    },
    {
        id: '3',
        type: 'end',
        name: '结束节点',
        ico: 'el-icon-video-pause',
        open: true,
        children: [
            {
                id: '31',
                type: 'end',
                name: 'kafkaOut',
                ico: 'el-icon-caret-right',
                // 自定义覆盖样式
                style: {}
            }, {
                id: '33',
                type: 'httpRocketMqOut',
                name: 'httpRocketMqOut',
                ico: 'el-icon-arrow-right',
                // 自定义覆盖样式
                style: {}
            }, {
                id: '34',
                type: 'tcpRocketMqOut',
                name: 'tcpRocketMqOut',
                ico: 'el-icon-arrow-right',
                // 自定义覆盖样式
                style: {}
            }
        ]
    }
]

export default menuList