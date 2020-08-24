const menuList = [
    {
        id: '1',
        type: 'group',
        name: '开始节点',
        ico: 'el-icon-video-play',
        open: true,
        children: [
            {
                id: '11',
                type: 'timer',
                name: '数据接入',
                ico: 'el-icon-time',
                // 自定义覆盖样式
                style: {}
            }, {
                id: '12',
                type: 'task',
                name: '接口调用',
                ico: 'el-icon-odometer',
                // 自定义覆盖样式
                style: {}
            }
        ]
    },
    {
        id: '2',
        type: 'group',
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
            }
        ]
    },
    {
        id: '3',
        type: 'group',
        name: '结束节点',
        ico: 'el-icon-video-pause',
        open: true,
        children: [
            {
                id: '31',
                type: 'end',
                name: '流程结束',
                ico: 'el-icon-caret-right',
                // 自定义覆盖样式
                style: {}
            }, {
                id: '32',
                type: 'over',
                name: '数据清理',
                ico: 'el-icon-shopping-cart-full',
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