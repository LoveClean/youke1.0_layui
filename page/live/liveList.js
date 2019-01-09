layui.use(['form', 'layer', 'table', 'laydate', 'laytpl','util'], function () {
    var form = layui.form,
        layer = parent.layer === undefined ? layui.layer : top.layer,
        $ = layui.jquery,
        laytpl = layui.laytpl,
        laydate = layui.laydate,
        util = layui.util,
        table = layui.table;


    const status=["未开放","预告中","直播中","直播结束"];

    //加载直播员
    $.ajax({
        url: $.cookie("tempUrl") + "play/selectPlayerList.do?token=" + $.cookie("token"),
        type: "POST",
        success: function (d) {
            var players = d.data;
            var playerEl = $("#players");
            if (players !== null) {
                $.each(players, function (index, item) {
                   playerEl.append($("<option value="+item.id+">"+item.truename+"</option>"));
                });
                form.render('select');
            }
        }
    });

    //请选择开始日期
    laydate.render({
        elem: '.startDay',
        format: 'yyyy-MM-dd',
        trigger: 'click',
        max: 0,
        mark: {"0-1-1": "元旦"},
        done: function (value, date) {
            if (date.month === 1 && date.date === 1) { //点击每年12月15日，弹出提示语
                layer.msg('今天是元旦，新年快乐！');
            }
        }
    });
    //请选择截止日期
    laydate.render({
        elem: '.endDay',
        format: 'yyyy-MM-dd',
        trigger: 'click',
        max: 0,
        mark: {"0-1-1": "元旦"},
        done: function (value, date) {
            if (date.month === 1 && date.date === 1) { //点击每年12月15日，弹出提示语
                layer.msg('今天是元旦，新年快乐！');
            }
        }
    });
    //校验日期
    form.verify({
        startDay: function (value) {
            if (new Date(value) >= new Date($(".endDay").val())) {
                return "起始日期需小于截止日期！";
            }
        }
        // ,
        // endDay: function (value) {
        //     if (new Date(value) <= new Date($(".startDay").val())) {
        //         return "请选择截止日期！";
        //     }
        // }
    });


    layer.load();
    //列表渲染
    table.render({
        elem: '#dataList',
        url: $.cookie("tempUrl") + 'play/selectLists.do',
        method: 'post',
        where: {token: $.cookie("token")},
        request: {
            pageName: 'pageNum' //页码的参数名称，默认：page
            , limitName: 'pageSize' //每页数据量的参数名，默认：limit
        },
        response: {
            statusName: 'code' //数据状态的字段名称，默认：code
            , statusCode: 0 //成功的状态码，默认：0
            , msgName: 'httpStatus' //状态信息的字段名称，默认：msg
            , countName: 'totalElements' //数据总数的字段名称，默认：count
            , dataName: 'content' //数据列表的字段名称，默认：data
        },
        cellMinWidth: 95,
        page: true,
        loading: true,
        height: "full-125",
        limits: [5, 10, 15, 20, 25],
        limit: 10,
        id: "dataTable",
        cols: [[
            {field: 'id', title: '直播ID',minWidth: 100, align: "center", sort: true},
            {field: 'title', title: '直播标题', minWidth: 100, align: "center"},
            {field: 'begintime', title: '开始时间', minWidth: 120, align: "center" , templet:"<div>{{ layui.util.toDateString(d.begintime)}}</div>"},
            {field: 'endtime', title: '结束时间', minWidth: 120, align: "center" , templet:"<div>{{ layui.util.toDateString(d.endtime)}}</div>"},
            {field: 'playerName', title: '直播员', minWidth: 100, align: "center", templet: function (d) {
                    return d.playerVo.truename;
                }},
            {
                field: 'type', title: '直播状态', minWidth: 120, align: "center", templet: function (d) {
                    return getStatus(parseInt(d.status));
                }
            },
            {field: 'option' , title: '操作', minWidth: 160, templet: '#option', fixed: "right", align: "center"}
        ]],
        done: function () {
            layer.closeAll('loading');
        }
    });


    //搜索
    form.on("submit(search_btn)", function (data) {
        layer.load();
        table.reload("dataTable", {
            url: $.cookie("tempUrl") + 'play/selectPlayListByKeys.do',
            method: 'post',
            where: {
                token: $.cookie("token"),
                playerId: data.field.players,
                status: data.field.status,
                playTitle: data.field.playTitle,
                beginTime: data.field.startDay,
                endTime:data.field.endDay
            },
            done: function () {
                layer.closeAll('loading');
            }
        })
    });

    //点击flash按钮事件
    $(document).on("click", "#flash", function () {
        window.location.reload();
    });


    //点击新增按钮事件
    $(".addNews_btn").click(function () {
        var index = layui.layer.open({
            title: "发起直播",
            type: 2,
            area: ["600px", "400px"],
            content: "liveAdd.html",
            shade: 0.8,
            shadeClose: true,
            success: function (layero, index) {
                //var body = layui.layer.getChildFrame('body', index);
                setTimeout(function () {
                    layui.layer.tips('点击此处关闭', '.layui-layer-setwin .layui-layer-close', {
                        tips: 3
                    });
                }, 500)
            }
        })
    });

    //列表操作
    table.on('tool(dataList)', function (obj) {
        var layEvent = obj.event,
            data = obj.data;
        if (layEvent === 'edit') { //编辑
            edit(data);
        } else if (layEvent === 'del') { //删除
            layer.confirm('确定删除此直播记录？', {icon: 3, title: '提示信息'}, function (index) {
                $.ajax({
                    url: $.cookie("tempUrl") + "play/deletePlay.do",
                    type: "POST",
                    //contentType:"application/json;charset=UTF-8",
                    headers: {
                        "X-Access-Auth-Token":$.cookie("token")
                    },
                    data:({
                      "id":data.id
                    }),
                    success: function (result) {
                        if(result.httpStatus===200){
                            layer.msg("删除成功");
                            obj.del();
                            layer.close(index);
                        }
                    },
                    error: function () {
                        layer.msg('删除失败');
                    }
                });
            });
        } else if (layEvent === 'replay') {//回看
            if(data.replayaddress==="" || data.replayaddress===null){
                layer.msg("该视频没有回看地址");
            }else {
                sessionStorage.setItem("replayaddress",data.replayaddress)
                layui.layer.open({
                    type: 2,
                    title: false,
                    area: ["600px","500px"],
                    shade: 0.8,
                    shadeClose: true,
                    content: "../video/video.html",
                    success: function (layero, index) {
                        // var body = layer.getChildFrame('body', index);//得到子页面dom
                        // var iframeWin = window[layero.find('iframe')[0]['name']]; //得到iframe页的窗口对象，执行iframe页的方法：iframeWin.method();
                        // iframeWin.playLoad(data.replayaddress);
                        setTimeout(function () {
                            layui.layer.tips('点击此处关闭', '.layui-layer-setwin .layui-layer-close', {
                                tips: 3
                            });
                        }, 500)
                    }
                });
            }

        }
    });

    function edit(data) {
        sessionStorage.setItem("player",data.playerVo.id);
        sessionStorage.setItem("dateTime",util.toDateString(data.begintime)+" ~ "+util.toDateString(data.endtime));
        sessionStorage.setItem("picpath",data.picpath);
        var index = layui.layer.open({
            title: "编辑直播",
            type: 2,
            area: ["600px", "400px"],
            content: "liveUpt.html",
            shade: 0.8,
            shadeClose: true,
            success: function (layero, index) {
                var body = layui.layer.getChildFrame('body', index);
                body.find("#title").val(data.title).attr("data-id",data.id);
                body.find("#address").val(data.realaddress);
                body.find("#player").val(data.playerVo.account);
                setTimeout(function () {
                    layui.layer.tips('点击此处关闭', '.layui-layer-setwin .layui-layer-close', {
                        tips: 3
                    });
                }, 500)
            }
        })
    }

    function getStatus(key) {
        return status[key];
    }

});
