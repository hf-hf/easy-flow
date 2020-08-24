var data_E = {
    name: '流程E',
    nodeList: [
        {
            id: 'kafkaInput',
            name: 'kafkaInput',
            type: 'node',
            left: '26px',
            top: '161px',
            ico: 'el-icon-user-solid'
        },
        {
            id: 'inArea',
            name: '进区域校验',
            type: 'node',
            left: '340px',
            top: '161px',
            ico: 'el-icon-goods'
        },
        {
            id: 'httpRocketMqOut',
            name: 'httpRocketMqOut',
            type: 'httpRocketMqOut',
            left: '739px',
            top: '161px',
            ico: 'el-icon-present'
        }
    ],
    lineList: [{
        from: 'kafkaInput',
        to: 'inArea'
    }, {
        from: 'inArea',
        to: 'httpRocketMqOut'
    }]
}

export function getDataE() {
    return data_E
}
