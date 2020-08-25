<template>
    <div v-if="easyFlowVisible" style="height: calc(100vh);">
        <el-row>
            <!--顶部工具菜单-->
            <el-col :span="24">
                <div class="ef-tooltar">
                    <el-link type="primary" :underline="false">{{data.name}}</el-link>
                    <el-divider direction="vertical"></el-divider>
                    <el-button type="text" icon="el-icon-delete" size="large" @click="deleteElement" :disabled="!this.activeElement.type"></el-button>
                    <el-divider direction="vertical"></el-divider>
                    <el-button type="text" icon="el-icon-download" size="large" @click="downloadData"></el-button>
                    <el-divider direction="vertical"></el-divider>
                    <el-button type="text" icon="el-icon-check" size="large" @click="saveData"></el-button>
                    <el-divider direction="vertical"></el-divider>
                    <el-button type="text" icon="el-icon-zoom-in" size="large" @click="zoomAdd"></el-button>
                    <el-divider direction="vertical"></el-divider>
                    <el-button type="text" icon="el-icon-zoom-out" size="large" @click="zoomSub"></el-button>
                    <div style="float: right;margin-right: 5px">
                        <el-button type="info" plain round icon="el-icon-document" @click="dataInfo" size="mini">流程信息</el-button>
                        <el-button type="primary" plain round @click="addFlow" icon="el-icon-folder-add" size="mini">添加新流程</el-button>
                        <el-button type="primary" plain round @click="removeFlow" icon="el-icon-folder-remove" size="mini">删除流程</el-button>
                        <el-button type="primary" plain round @click="resetFlow" icon="el-icon-refresh" size="mini">重置流程</el-button>
                        <el-select v-model="currentSeleced" filterable placeholder="请选择" @change="loadData">
                            <el-option-group
                            v-for="group in flowList"
                            :key="group.clientId"
                            :label="group.clientId">
                                <el-option
                                v-for="item in group.list"
                                :key="item.id"
                                :label="item.name"
                                :value="item.id"
                                >
                                </el-option>
                            </el-option-group>
                        </el-select>
                        <!-- <el-button v-for="(item, index) in this.getFlowList()" :key="item.id" 
                            @click="loadData(item.id)" type="primary" plain round icon="el-icon-refresh" size="mini">
                           切换{{ item.name }}
                        </el-button> -->
                        <el-button type="info" plain round icon="el-icon-document" @click="openHelp" size="mini">帮助</el-button>
                    </div>
                </div>
            </el-col>
        </el-row>
        <div style="display: flex;height: calc(100% - 47px);">
            <div style="width: 230px;border-right: 1px solid #dce3e8;">
                <node-menu @addNode="addNode" ref="nodeMenu"></node-menu>
            </div>
            <div id="efContainer" ref="efContainer" class="container" v-flowDrag>
                <template v-for="node in data.nodeList">
                    <flow-node
                            :id="node.id"
                            :key="node.id"
                            :node="node"
                            :activeElement="activeElement"
                            @changeNodeSite="changeNodeSite"
                            @nodeRightMenu="nodeRightMenu"
                            @clickNode="clickNode"
                    >
                    </flow-node>
                </template>
                <!-- 给画布一个默认的宽度和高度 -->
                <div style="position:absolute;top: 2000px;left: 2000px;">&nbsp;</div>
            </div>
            <!-- 右侧表单 -->
            <div style="width: 300px;border-left: 1px solid #dce3e8;background-color: #FBFBFB" v-show="activeElement.type">
                <flow-node-form ref="nodeForm" @setLineLabel="setLineLabel" @repaintEverything="repaintEverything"></flow-node-form>
            </div>
        </div>
        <!-- 流程数据详情 -->
        <flow-info v-if="flowInfoVisible" ref="flowInfo" :data="data"></flow-info>
        <flow-help v-if="flowHelpVisible" ref="flowHelp"></flow-help>
    </div>

</template>

<script>
    import draggable from 'vuedraggable'
    // import { jsPlumb } from 'jsplumb'
    // 使用修改后的jsplumb
    import '@/common/js/jsplumb'
    import { easyFlowMixin } from '@/common/js/mixins'
    import flowNode from '@/components/ef/node'
    import nodeMenu from '@/components/ef/node_menu'
    import FlowInfo from '@/components/ef/info'
    import FlowHelp from '@/components/ef/help'
    import FlowNodeForm from './node_form'
    import lodash from 'lodash'
    import { getDataA } from '@/common/data/data_A'
    import { getDataB } from '@/common/data/data_B'
    import { getDataC } from '@/common/data/data_C'
    import { getDataD } from '@/common/data/data_D'
    import { getDataE } from '@/common/data/data_E'
    import { clone, merge, isEmpty } from 'lodash'
    // import flowList from '@/common/js/flowList'
    import { saveMixed, getData, deleteMixed } from '@/common/js/api/mixed'
    import { listProject } from '@/common/js/api/project'

    export default {
        data() {
            return {
                // jsPlumb 实例
                jsPlumb: null,
                // 控制画布销毁
                easyFlowVisible: true,
                // 控制流程数据显示与隐藏
                flowInfoVisible: false,
                // 是否加载完毕标志位
                loadEasyFlowFinish: false,
                flowHelpVisible: false,
                // 数据
                data: {},
                emplyElement: {
                    // 可选值 node 、line
                    type: undefined,
                    // 节点ID
                    nodeId: undefined,
                    // 连线ID
                    sourceId: undefined,
                    targetId: undefined
                },
                // 激活的元素、可能是节点、可能是连线
                activeElement: {
                    // 可选值 node 、line
                    type: undefined,
                    // 节点ID
                    nodeId: undefined,
                    // 连线ID
                    sourceId: undefined,
                    targetId: undefined
                },
                zoom: 0.5,
                currentSeleced: null,
                flowList: null,
            }
        },
        // 一些基础配置移动该文件中
        mixins: [easyFlowMixin],
        components: {
            draggable, flowNode, nodeMenu, FlowInfo, FlowNodeForm, FlowHelp
        },
        directives: {
            'flowDrag': {
                bind(el, binding, vnode, oldNode) {
                    if (!binding) {
                        return
                    }
                    el.onmousedown = (e) => {
                        if (e.button == 2) {
                            // 右键不管
                            return
                        }
                        //  鼠标按下，计算当前原始距离可视区的高度
                        let disX = e.clientX
                        let disY = e.clientY
                        el.style.cursor = 'move'

                        document.onmousemove = function (e) {
                            // 移动时禁止默认事件
                            e.preventDefault()
                            const left = e.clientX - disX
                            disX = e.clientX
                            el.scrollLeft += -left

                            const top = e.clientY - disY
                            disY = e.clientY
                            el.scrollTop += -top
                        }

                        document.onmouseup = function (e) {
                            el.style.cursor = 'auto'
                            document.onmousemove = null
                            document.onmouseup = null
                        }
                    }
                }
            }
        },
        mounted() {
            this.jsPlumb = jsPlumb.getInstance()
            this.getFlowList(true)
        },
        methods: {
            // 返回唯一标识
            getUUID() {
                return Math.random().toString(36).substr(3, 10)
            },
            jsPlumbInit() {
                this.jsPlumb.ready(() => {
                    // 导入默认配置
                    this.jsPlumb.importDefaults(this.jsplumbSetting)
                    // 会使整个jsPlumb立即重绘。
                    this.jsPlumb.setSuspendDrawing(false, true);
                    // 初始化节点
                    this.loadEasyFlow()
                    // 单点击了连接线, https://www.cnblogs.com/ysx215/p/7615677.html
                    this.jsPlumb.bind('click', (conn, originalEvent) => {
                        this.activeElement.type = 'line'
                        this.activeElement.sourceId = conn.sourceId
                        this.activeElement.targetId = conn.targetId
                        this.$refs.nodeForm.lineInit({
                            from: conn.sourceId,
                            to: conn.targetId,
                            label: conn.getLabel()
                        })
                    })
                    // 连线
                    this.jsPlumb.bind("connection", (evt) => {
                        let from = evt.source.id
                        let to = evt.target.id
                        if (this.loadEasyFlowFinish) {
                            this.data.lineList.push({from: from, to: to})
                        }
                    })

                    // 删除连线回调
                    this.jsPlumb.bind("connectionDetached", (evt) => {
                        this.deleteLine(evt.sourceId, evt.targetId)
                    })

                    // 改变线的连接节点
                    this.jsPlumb.bind("connectionMoved", (evt) => {
                        this.changeLine(evt.originalSourceId, evt.originalTargetId)
                    })

                    // 连线右击
                    this.jsPlumb.bind("contextmenu", (evt) => {
                        console.log('contextmenu', evt)
                    })

                    // 连线
                    this.jsPlumb.bind("beforeDrop", (evt) => {
                        let from = evt.sourceId
                        let to = evt.targetId
                        if (from === to) {
                            this.$message.error('节点不支持连接自己')
                            return false
                        }
                        if (this.hasLine(from, to)) {
                            this.$message.error('该关系已存在,不允许重复创建')
                            return false
                        }
                        if (this.hashOppositeLine(from, to)) {
                            this.$message.error('不支持两个节点之间连线回环');
                            return false
                        }
                        // 根据group判断是否允许连线
                        let errorMsg = this.isIllegalLine(from, to)
                        if (null != errorMsg) {
                            this.$message.error(errorMsg);
                            return false
                        }
                        this.$message.success('连接成功')
                        return true
                    })

                    // beforeDetach
                    this.jsPlumb.bind("beforeDetach", (evt) => {
                        console.log('beforeDetach', evt)
                    })
                    this.jsPlumb.setContainer(this.$refs.efContainer)
                })
            },
            // 加载流程图
            loadEasyFlow() {
                // 初始化节点
                for (var i = 0; i < this.data.nodeList.length; i++) {
                    let node = this.data.nodeList[i]
                    // 设置源点，可以拖出线连接其他节点
                    this.jsPlumb.makeSource(node.id, lodash.merge(this.jsplumbSourceOptions, {}))
                    // 设置目标点，其他源点拖出的线可以连接该节点
                    this.jsPlumb.makeTarget(node.id, this.jsplumbTargetOptions)
                    if (!node.viewOnly) {
                        this.jsPlumb.draggable(node.id, {
                            containment: 'parent',
                            grid: [20, 20],
                            stop: function (el) {
                                // 拖拽节点结束后的对调
                                console.log('拖拽结束: ', el)
                            }
                        })
                    }
                }
                // 初始化连线
                for (var i = 0; i < this.data.lineList.length; i++) {
                    let line = this.data.lineList[i]
                    var connParam = {
                        source: line.from,
                        target: line.to,
                        label: line.label ? line.label : '',
                        connector: line.connector ? line.connector : '',
                        anchors: line.anchors ? line.anchors : undefined,
                        paintStyle: line.paintStyle ? line.paintStyle : undefined,
                    }
                    this.jsPlumb.connect(connParam, this.jsplumbConnectOptions)
                }
                this.$nextTick(function () {
                    this.loadEasyFlowFinish = true
                })
            },
            // 设置连线条件
            setLineLabel(from, to, label) {
                var conn = this.jsPlumb.getConnections({
                    source: from,
                    target: to
                })[0]
                if (!label || label === '') {
                    conn.removeClass('flowLabel')
                    conn.addClass('emptyFlowLabel')
                } else {
                    conn.addClass('flowLabel')
                }
                conn.setLabel({
                    label: label,
                })
                this.data.lineList.forEach(function (line) {
                    if (line.from == from && line.to == to) {
                        line.label = label
                    }
                })

            },
            // 删除激活的元素
            deleteElement() {
                if (this.activeElement.type === 'line') {
                    this.$confirm('确定删除所点击的线吗?', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(() => {
                        var conn = this.jsPlumb.getConnections({
                            source: this.activeElement.sourceId,
                            target: this.activeElement.targetId
                        })[0]
                        this.jsPlumb.deleteConnection(conn)
                    }).catch(() => {
                    })
                } else {
                    //if (this.activeElement.type === 'node') {
                        this.deleteNode(this.activeElement.nodeId)
                    //}
                }
            },
            // 删除线
            deleteLine(from, to) {
                this.data.lineList = this.data.lineList.filter(function (line) {
                    if (line.from == from && line.to == to) {
                        return false
                    }
                    return true
                })
            },
            // 改变连线
            changeLine(oldFrom, oldTo) {
                this.deleteLine(oldFrom, oldTo)
            },
            // 改变节点的位置
            changeNodeSite(data) {
                for (var i = 0; i < this.data.nodeList.length; i++) {
                    let node = this.data.nodeList[i]
                    if (node.id === data.nodeId) {
                        node.left = data.left
                        node.top = data.top
                    }
                }
            },
            /**
             * 拖拽结束后添加新的节点
             * @param evt
             * @param nodeMenu 被添加的节点对象
             * @param mousePosition 鼠标拖拽结束的坐标
             */
            addNode(evt, nodeMenu, mousePosition) {
                if(this.data.nodeList === undefined){
                    this.$message.error("请先添加新流程")
                    return
                }
                var screenX = evt.originalEvent.clientX, screenY = evt.originalEvent.clientY
                let efContainer = this.$refs.efContainer
                var containerRect = efContainer.getBoundingClientRect()
                var left = screenX, top = screenY
                // 计算是否拖入到容器中
                if (left < containerRect.x || left > containerRect.width + containerRect.x || top < containerRect.y || containerRect.y > containerRect.y + containerRect.height) {
                    this.$message.error("请把节点拖入到画布中")
                    return
                }
                left = left - containerRect.x + efContainer.scrollLeft
                top = top - containerRect.y + efContainer.scrollTop
                // 居中
                left -= 85
                top -= 16
                var nodeId = this.getUUID()
                // 动态生成名字
                var origName = nodeMenu.name
                var nodeName = origName
                // 存在重复node，则递增后缀数
                // var index = 1
                // while (index < 10000) {
                //     var repeat = false
                //     for (var i = 0; i < this.data.nodeList.length; i++) {
                //         let node = this.data.nodeList[i]
                //         if (node.name === nodeName) {
                //             nodeName = origName + index
                //             repeat = true
                //         }
                //     }
                //     if (repeat) {
                //         index++
                //         continue
                //     }
                //     break
                // }
                var node = {
                    id: nodeId,
                    name: nodeName,
                    type: nodeMenu.type,
                    left: left + 'px',
                    top: top + 'px',
                    ico: nodeMenu.ico,
                    state: 'success',
                    group: nodeMenu.group
                }
                /**
                 * 这里可以进行业务判断、是否能够添加该节点
                 */
                this.data.nodeList.push(node)
                // 将编辑框修改为当前类型
                //this.$refs.nodeForm.nodeInit(this.data, node.id)
                // 将当前节点设为激活
                this.clickNode(node.id, node.type)
                this.$nextTick(function () {
                    this.jsPlumb.makeSource(nodeId, this.jsplumbSourceOptions)
                    this.jsPlumb.makeTarget(nodeId, this.jsplumbTargetOptions)
                    // 锚点匹配类型
                    // jsPlumb.addEndpoint(nodeId, {anchors: ['Right']})
                    this.jsPlumb.draggable(nodeId, {
                        containment: 'parent',
                        grid: [20, 20],
                        stop: function (el) {
                            // 拖拽节点结束后的对调
                            console.log('拖拽结束: ', el)
                        }
                    })
                })
            },
            /**
             * 删除节点
             * @param nodeId 被删除节点的ID
             */
            deleteNode(nodeId) {
                this.$confirm('确定要删除节点' + nodeId + '?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                    closeOnClickModal: false
                }).then(() => {
                    /**
                     * 这里需要进行业务判断，是否可以删除
                     */
                    this.data.nodeList = this.data.nodeList.filter(function (node) {
                        if (node.id === nodeId) {
                            // 伪删除，将节点隐藏，否则会导致位置错位
                            // node.show = false
                            return false
                        }
                        return true
                    })
                    console.log(this.data.nodeList)
                    // 若当前节点与激活节点相同，则将激活节点清空
                    if(this.activeElement.nodeId === nodeId){
                        this.activeElement = clone(this.emplyElement)
                    }
                    this.$nextTick(function () {
                        this.jsPlumb.removeAllEndpoints(nodeId);
                    })
                }).catch(() => {
                })
                return true
            },
            clickNode(nodeId, nodeType) {
                this.activeElement.type = nodeType
                this.activeElement.nodeId = nodeId
                this.$refs.nodeForm.nodeInit(this.data, nodeId)
            },
            // 是否具有该线
            hasLine(from, to) {
                for (var i = 0; i < this.data.lineList.length; i++) {
                    var line = this.data.lineList[i]
                    if (line.from === from && line.to === to) {
                        return true
                    }
                }
                return false
            },
            // 是否含有相反的线
            hashOppositeLine(from, to) {
                return this.hasLine(to, from)
            },
            isIllegalLine(from, to){
                let fromNode;
                let toNode;
                for (var i = 0; i < this.data.nodeList.length; i++) {
                    var node = this.data.nodeList[i]
                    if(node.id === from){
                        fromNode = node
                    }
                    if(node.id === to){
                        toNode = node
                    }
                    if(!isEmpty(fromNode) && !isEmpty(toNode)){
                        break
                    }
                }
                // 根据group判断是否能进行连线
                if (toNode.group === "start"){
                    return '开始节点不能被连接'
                }
                if (fromNode.group === "end"){
                    return '结束节点不能发起连接'
                }
                // 同一个节点，只允许有一个from或一个to，优先满足group的校验
                for (var i = 0; i < this.data.lineList.length; i++) {
                    var line = this.data.lineList[i]
                    if (line.from === from || line.to === to) {
                        return '同一个节点不能发起多个连接，或者被多个节点连接'
                    }
                }
                return null
            },
            hasFloatingNode(){
                let flag
                for (var i = 0; i < this.data.nodeList.length; i++) {
                    flag = true
                    var node = this.data.nodeList[i]
                    for (var j = 0; j < this.data.lineList.length; j++) {
                        var line = this.data.lineList[j]
                        if (line.from === node.id || line.to === node.id) {
                            flag = false
                            break
                        }
                    }
                    if(flag){
                        break
                    }
                }
                return flag
            },
            nodeRightMenu(nodeId, evt) {
                this.menu.show = true
                this.menu.curNodeId = nodeId
                this.menu.left = evt.x + 'px'
                this.menu.top = evt.y + 'px'
            },
            repaintEverything() {
                this.jsPlumb.repaint()
            },
            // 流程数据信息
            dataInfo() {
                this.flowInfoVisible = true
                this.$nextTick(function () {
                    this.$refs.flowInfo.init()
                })
            },
            // 加载流程图
            dataReload(data) {
                this.easyFlowVisible = false
                this.data.id = null
                this.data.nodeList = []
                this.data.lineList = []
                this.$nextTick(() => {
                    if(!isEmpty(data)){
                        data = lodash.cloneDeep(data)
                        this.data = data
                    }
                    this.easyFlowVisible = true
                    this.$nextTick(() => {
                        this.jsPlumb = jsPlumb.getInstance()
                        this.$nextTick(() => {
                            this.jsPlumbInit()
                        })
                    })
                })
            },
            async loadData(id){
                let response = await getData(id)
                if(response.success){
                    this.dataReload(response.data)
                    this.$message.success(response.data.name + "数据切换成功！")
                }
            },
            zoomAdd() {
                if (this.zoom >= 1) {
                    return
                }
                this.zoom = this.zoom + 0.1
                this.$refs.efContainer.style.transform = `scale(${this.zoom})`
                this.jsPlumb.setZoom(this.zoom)
            },
            zoomSub() {
                if (this.zoom <= 0) {
                    return
                }
                this.zoom = this.zoom - 0.1
                this.$refs.efContainer.style.transform = `scale(${this.zoom})`
                this.jsPlumb.setZoom(this.zoom)
            },
            // 下载数据
            downloadData() {
                this.$confirm('确定要下载该流程数据吗？', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                    closeOnClickModal: false
                }).then(() => {
                    var datastr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.data, null, '\t'));
                    var downloadAnchorNode = document.createElement('a')
                    downloadAnchorNode.setAttribute("href", datastr);
                    downloadAnchorNode.setAttribute("download", 'data.json')
                    downloadAnchorNode.click();
                    downloadAnchorNode.remove();
                    this.$message.success("正在下载中,请稍后...")
                }).catch(() => {
                })
            },
            saveData(){
                if(isEmpty(this.data.nodeList)){
                    this.$message.warning("当前流程数据为空，无法保存")
                    return
                }
                if(this.hasFloatingNode()){
                    this.$message.warning("存在悬浮未连线的节点，无法保存")
                    return
                }
                if(null != this.data.id){
                    this.$confirm('确定要保存当前流程？', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning',
                        closeOnClickModal: false
                    }).then(() => {
                        let data = JSON.stringify(this.data, null, '\t')
                        saveMixed(data)
                            .then(response => {
                                this.$message.success("保存成功！")
                            })
                            .catch(error => {
                                console.log(error)
                            })
                    }).catch((e) => {
                        console.log(e)
                    })
                } else {
                    this.$prompt('请输入clientId:eventType', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        inputPattern: /^\w{6,50}:{1}[1-9]\d{1,6}$/,
                        inputErrorMessage: '格式不正确，请输入clientId和eventType，以:分隔',
                        closeOnClickModal: false
                    }).then((value) => {
                        let inputValue = value.value.split(':')
                        this.data.clientId = inputValue[0]
                        this.data.id = Number(inputValue[1])
                        let data = JSON.stringify(this.data, null, '\t')
                        saveMixed(data)
                            .then(response => {
                                // 刷新
                                this.getFlowList(false, this.data.id)
                                this.$message.success("保存成功！")
                            })
                            .catch(error => {
                                console.log(error)
                            })
                    }).catch((e) => {
                        console.log(e)
                    })
                }
            },
            openHelp() {
                this.flowHelpVisible = true
                this.$nextTick(function () {
                    this.$refs.flowHelp.init()
                })
            },
            addFlow(){
                this.$prompt('请输入流程名称', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    inputPattern: /^[\u4e00-\u9fa5_a-zA-Z0-9]{3,10}$/,
                    inputErrorMessage: '流程名称格式不正确'
                }).then(({ value }) => {
                    this.data.name = value
                    // 若未保存，则提示没有保存是否放弃当前的修改
                    this.dataReload(null)
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '取消添加'
                    })
                });
            },
            removeFlow(){
                this.$confirm('确定要移除当前流程？', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                    closeOnClickModal: false
                }).then(() => {
                    deleteMixed(this.data.id)
                        .then(response => {
                            this.getFlowList(true)
                            this.$message.success("删除成功！")
                        })
                        .catch(error => {
                            console.log(error)
                        })
                }).catch((e) => {
                    console.log(e)
                })
            },
            getFlowList(init, id){
                listProject()
                    .then(response => {
                        let data = response.data
                        if(data.success){
                            this.flowList = data.data
                            if(this.flowList.length > 0){
                                if(init){
                                    // 选中第一个
                                    this.$nextTick(() => {
                                        this.currentSeleced = this.flowList[0].list[0].id
                                        this.loadData(this.currentSeleced)
                                    })
                                } else if(isEmpty(id)) {
                                    // 选中第一个
                                    this.$nextTick(() => {
                                        this.currentSeleced = id
                                    })
                                }
                            }
                        }
                    })
                    .catch(error => {
                        console.log(error)
                    })
                
                return null
            },
            resetFlow(){
                this.$confirm('确定要重置流程数据吗(未保存的数据会被丢弃)？', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                    closeOnClickModal: false
                }).then(() => {
                    this.loadData(this.currentSeleced)
                }).catch(() => {
                })
                
            }
        }
    }
</script>
