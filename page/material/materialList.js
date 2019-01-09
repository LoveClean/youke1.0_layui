layui.config({
    base: "../../js/"
}).extend({
    "address": "address"
})
layui.use(['form', 'layer', 'table', 'laytpl', "address"], function () {
    var form = layui.form,
        layer = parent.layer === undefined ? layui.layer : top.layer,
        $ = layui.jquery,
        laytpl = layui.laytpl,
        table = layui.table;
    address = layui.address;


    //素材列表
    var tableIns = table.render({
        elem: '#materialList',
        url: $.cookie("tempUrl") + '/material/get_list.do',
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
        height: "full-125",
        limits: [5, 10, 15, 20, 25],
        limit: 15,
        id: "userListTable",
        cols: [[
            {field: 'id', title: 'ID', width: 100, align: "center"},
            {field: 'name', title: '文件名', minWidth: 150, width: 180, align: "center"},
            {field: 'type', title: '类型', width: 120, align: 'center'},
            {
                field: 'path', title: '地址', minWidth: 200, templet: function (d) {
                    return '<a data-info=' + d.type + ' data-info2=' + d.path + ' class="layui-btn layui-btn-xs material" style="margin-right: 10px">预览</a>' + '<span style="color: #c00">' + d.path + '</span>'
                }
            },
            {field: 'groupName', title: '分组名称', minWidth: 180, width: 230, align: "center"},
            {
                title: '操作', minWidth: 100, width: 150, fixed: "right", align: "center", templet: function (d) {
                    if (d.editStatus === 1) {
                        return '<a class="layui-btn layui-btn-xs layui-btn-warm chooes layui-btn-disabled" data-info="' + d.editStatus + '" lay-event="edit">编辑</a>' +
                            '<a class="layui-btn layui-btn-xs layui-btn-danger" lay-event="del">删除</a>'
                    } else {
                        return '<a class="layui-btn layui-btn-xs layui-btn-warm chooes" data-info="' + d.editStatus + '" lay-event="edit">编辑</a>' +
                            '<a class="layui-btn layui-btn-xs layui-btn-danger" lay-event="del">删除</a>'
                    }
                }
            },
        ]],
        done: function () {
            layer.closeAll('loading');
        }
    });
    $.ajax({
        url: $.cookie("tempUrl") + "/materialgroup/get_group.do?token=" + $.cookie("token"),
        type: "POST",
        success: function (result) {
            var data = result.data;
            for (var i = 0; i < data.length; i++) {
                var option = $("<option value='" + data[i].id + "'>" + data[i].name + "</option>");
                $("#materialGroup").append(option)
                form.render('select');
            }
        }
    });
    layer.load()
    //列表操作
    table.on('tool(materialList)', function (obj) {
        var layEvent = obj.event,
            data = obj.data;
        if (layEvent === 'edit' && data.editStatus === 0) {
            updataMaterial(data);
        }
        else if (layEvent === 'del') { //删除
            layer.confirm('确定删除此素材？', {icon: 3, title: '提示信息'}, function (index) {
                $.ajax({
                    url: $.cookie("tempUrl") + "material/delete.do?token=" + $.cookie("token"),
                    type: "POST",
                    data: {
                        id: data.id
                    },
                    success: function (result) {
                        if (result.code === 0) {
                            layer.msg("素材删除成功");
                            obj.del();
                        } else {
                            layer.msg(result.exception, {icon: 7, anim: 6});
                        }
                    }
                });
                layer.close(index);
            });
        }
    });
    //搜索
    form.on("submit(search_btn)", function (data) {
        layer.load();
        table.reload("userListTable", {
            url: $.cookie("tempUrl") + '/material/search.do',
            method: 'post',
            where: {
                groupId: $("#materialGroup").val(),
                keyword: $("#materialName").val(),
                token: $.cookie("token")
            },
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
            height: "full-125",
            limits: [5, 10, 15, 20, 25],
            limit: 10,
            id: "userListTable",
            cols: [[
                {field: 'id', title: 'ID', width: 100, align: "center"},
                {field: 'name', title: '文件名', minWidth: 150, width: 180, align: "center"},
                {field: 'type', title: '类型', width: 120, align: 'center'},
                {
                    field: 'path', title: '地址', minWidth: 200, templet: function (d) {
                        return '<a data-info=' + d.type + ' data-info2=' + d.path + ' class="layui-btn layui-btn-xs material" style="margin-right: 10px">预览</a>' + '<span style="color: #c00">' + d.path + '</span>'
                    }
                },
                {field: 'groupName', title: '分组名称', minWidth: 180, width: 230, align: "center"},
                {
                    title: '操作', minWidth: 100, width: 150, fixed: "right", align: "center", templet: function (d) {
                        if (d.editStatus === 1) {
                            return '<a class="layui-btn layui-btn-xs layui-btn-warm chooes layui-btn-disabled" data-info="' + d.editStatus + '" lay-event="edit">编辑</a>' +
                                '<a class="layui-btn layui-btn-xs layui-btn-danger" lay-event="del">删除</a>'
                        } else {
                            return '<a class="layui-btn layui-btn-xs layui-btn-warm chooes" data-info="' + d.editStatus + '" lay-event="edit">编辑</a>' +
                                '<a class="layui-btn layui-btn-xs layui-btn-danger" lay-event="del">删除</a>'
                        }
                    }
                },
            ]],
            done: function () {
                layer.closeAll('loading');
            }
        })
    });

    function updataMaterial(data) {
        var index = layui.layer.open({
            title: "素材更新",
            type: 2,
            area: ["600px", "430px"],
            content: "updataMaterial.html",
            success: function (layero, index) {
                var body = layui.layer.getChildFrame('body', index);
                if (data) {
                    // alert(data.groupId+data.groupName)
                    sessionStorage.setItem("materialId", data.id); //传id
                    sessionStorage.setItem("type", data.type); //传id
                    sessionStorage.setItem("groupId", data.groupId);
                    sessionStorage.setItem("path", data.path);
                    body.find("#materialName").val(data.name);
                    //body.find("#materialGroup option[value='']").val(data.groupId).text(data.groupName)
                    // body.find(".mType input[ value=" + (data.type) + "]").attr("checked", "checked");
                    // body.find(".mType").val() (data.type)=   .attr("checked",true);
                    body.find("#demoText").text("素材地址：" + data.path);
                    form.render('radio');
                }
                setTimeout(function () {
                    layui.layer.tips('点击此处关闭', '.layui-layer-setwin .layui-layer-close', {
                        tips: 3
                    });
                }, 500)
            }
        })
    }


    $(document).on('click', '.material', function () {
        var data = $(this).attr("data-info2");
        var type = $(this).attr("data-info");
        var type2 = 0;
        var area = "";
        var redirect = "";
        if (type === "图片") {
            redirect = '<div style="display: flex;justify-content: center;width:100%;height:100%;align-items: center;">' +
                '<img class="layui-upload-img" style="max-height: 100%" id="perivew" src="' + data + '"></div>'
            type2=1;
            area = ['800px','600px'];
        } else if (type === "视频") {
            redirect = '<div style="display: flex;justify-content: center;width: 100%;height: 100%;align-items: center;">' +
                '<video class="layui-upload-img thumbImg" src="' + data + '" controls="controls" id="perivew" width="600" height="400"></胜利ideo></div>';
            type2=1;
            area = ['650px','500px'];
        } else if (type==="直播"){
            redirect = "video.html"
            sessionStorage.setItem("url",data);
            type2=2;
            area = ['600px','600px'];
        } else {
            redirect = '<audio class="layui-upload-img thumbImg" controls="controls" id="perivew" src="' + data + '"></audio>';
            type2=1;
            area = 'auto';
        }
        var index = layui.layer.open({
            title: "预览",
            type: type2,
            offset: 'lt',
            area: area,
            resize: true,
            content: redirect,
            shade: 0.5,
            shadeClose: true,
            success: function (layero, index) {
                setTimeout(function () {
                    layui.layer.tips('点击此处关闭', '.layui-layer-setwin .layui-layer-close', {
                        tips: 3
                    });
                }, 500)
            }
        })
    })


//点击flash按钮事件
    $(document).on("click", "#flash", function () {
        window.location.reload();
    });

//点击新增按钮事件
    $(".addNews_btn").click(function () {
        var index = layui.layer.open({
            title: "素材添加",
            type: 2,
            area: ["600px", "430px"],
            content: "addMaterial.html",
            success: function (layero, index) {
                var body = layui.layer.getChildFrame('body', index);
                setTimeout(function () {
                    layui.layer.tips('点击此处关闭', '.layui-layer-setwin .layui-layer-close', {
                        tips: 3
                    });
                }, 500)
            }
        })
    });
})



