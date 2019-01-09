layui.use(['form', 'layer', 'table', 'laytpl'], function () {
    var form = layui.form,
        layer = parent.layer === undefined ? layui.layer : top.layer,
        $ = layui.jquery,
        laytpl = layui.laytpl,
        table = layui.table;

    //执行渲染
    layer.load();
    table.render({
        elem: '#dataList', //指定原始表格元素选择器（推荐id选择器）
        id: 'dataTable',
        url: $.cookie("tempUrl") + 'devicegroup/get_group.do',
        method: 'POST',
        where: {token: $.cookie("token")},
        response: {
            statusName: 'code', //数据状态的字段名称，默认：code
            statusCode: 0,//成功的状态码，默认：0
            msgName: 'httpStatus', //状态信息的字段名称，默认：msg
            dataName: 'data'
        },
        cellMinWidth: 95,
        page: false,
        height: "full-125",
        // limits: [5, 10, 15, 20, 25],
        // limit: 10,
        cols: [[
            {field: 'id', title: 'ID', minWidth: 100, align: "center"},
            {field: 'name', title: '分组名称', minWidth: 100, align: "center"},
            {title: '操作', minWidth: 100, templet: '#option', fixed: "right", align: "center"}
        ]],
        done: function () {
            layer.closeAll('loading');
        }
        //,…… //更多参数参考右侧目录：基本参数选项
    });

    table.on('tool(table)', function (obj) {
        var layEvent = obj.event,
            data = obj.data,
            tr = obj.tr;
        if (layEvent === 'edit') { //编辑
            var index = layui.layer.open({
                title: "修改设备分组",
                type: 1,
                area:'350px',
                content: $('#update'),
                btn: ['确认', '重置'],
                yes: function (index, layero) {
                    //按钮【按钮一】的回调
                    if($("#groupName-upt").val()!==""){
                        $.ajax({
                            url: $.cookie("tempUrl") + "devicegroup/set_group.do?token=" + $.cookie("token"),
                            type: "POST",
                            datatype: "json",
                            contentType: "application/json;charset=utf-8",
                            data:JSON.stringify({
                                "groupName": $("#groupName-upt").val(),
                                "groupId": data.id,
                            }),
                            success: function (result) {
                                if (result.code === 0) {
                                    layer.msg("修改成功");
                                    layer.close(index);
                                    obj.update({
                                        name:$("#groupName-upt").val()
                                    });
                                    $("#groupName-upt").val("");
                                }else{
                                    layer.msg(result.exception);
                                }
                            },
                            error: function () {
                                layer.msg('添加失败');
                            }
                        });
                    }else {
                        layer.msg("分组名称不能为空");
                    }
                }
                , btn2: function (index, layero) {
                    //按钮2的回调
                    $("#groupName-upt").val("");
                    return false //开启该代码可禁止点击该按钮关闭
                },
                success: function (layero, index) {
                    $("#groupName-upt").val(data.name);
                },
                shadeClose:true
            })
        } else if (layEvent === 'del') { //删除
            layer.confirm('确定删除这条数据吗？', {icon: 3, title: '提示信息'}, function (index) {
                $.ajax({
                    url: $.cookie("tempUrl") + "devicegroup/del.do?token=" + $.cookie("token") + "&id=" + data.id,
                    type: "POST",
                    success: function (result) {
                        if (result.httpStatus === 200) {
                            layer.msg("删除成功");
                            obj.del();
                            layer.close(index);
                        }
                    },
                    error: function () {
                        layer.msg('删除失败');
                    }
                });
                // layer.close(index);
            });
        }
    });

    //搜索
    form.on("submit(search_btn)", function (data) {
        table.reload("dataTable", {
            url: $.cookie("tempUrl") + 'devicegroup/search.do',
            method: 'post',
            where: {
                groupName: $("#groupName").val(),
                token: $.cookie("token")
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
            title: "新增设备分组",
            type: 1,
            area:'350px',
            content: $('#add'),
            shadeClose:true,
            btn: ['确认', '重置'],
            yes: function (index, layero) {
                //按钮【按钮一】的回调
                if($("#groupName-add").val()!==""){
                    $.ajax({
                        url: $.cookie("tempUrl") + "devicegroup/add_group.do?token=" + $.cookie("token"),
                        type: "POST",
                        datatype: "json",
                        contentType: "application/json;charset=utf-8",
                        data:JSON.stringify({
                            "groupName": $("#groupName-add").val(),
                            "parentId": 0
                        }),
                        success: function (result) {
                            if (result.code === 0) {
                                layer.msg("添加成功");
                                layer.close(index);
                                location.reload();
                            }else{
                                layer.msg(result.exception);
                            }
                        },
                        error: function () {
                            layer.msg('添加失败');
                        }
                    });
                }else {
                    layer.msg("分组名称不能为空");
                }
            }
            , btn2: function (index, layero) {
                $("#groupName-add").val("");
                return false //开启该代码可禁止点击该按钮关闭
            },
            success: function (layero, index) {
                $("#groupName-add").val("");
            }
        })
    });
})