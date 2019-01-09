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

    //素材组列表
    var tableIns = table.render({
        elem: '#materialGroupList',
        url: $.cookie("tempUrl") + '/materialgroup/get_group.do',
        method: 'post',
        where: {token: $.cookie("token"),
            groupId:"",sortField:"",sortRule:""},
        response: {
            statusName: 'code' //数据状态的字段名称，默认：code
            , statusCode: 0 //成功的状态码，默认：0
            , msgName: 'httpStatus' //状态信息的字段名称，默认：msg
            , countName: 'totalElements' //数据总数的字段名称，默认：count
            , dataName: 'data' //数据列表的字段名称，默认：data
        },
        cellMinWidth: 95,
        page: false,
        height: "full-125",
        limits: [5, 10, 15, 20, 25],
        limit: 15,
        id: "materialGroupListTabel",
        cols: [[
            {field: 'id', title: 'ID', width: 120, align: "center"},
            {field: 'name', title: '分组名称', minWidth: 180,  align: "center"},
            {
                title: '操作', minWidth: 150, width: 200, fixed: "right", align: "center", templet: "#userListBar"
            },
        ]]
    });
    //列表操作
    table.on('tool(materialGroupList)', function (obj) {
        var layEvent = obj.event,
            data = obj.data;
        if (layEvent === 'edit') {
            updataMaterialGroup(data);
        }
        else if (layEvent === 'del') { //删除
            layer.confirm('确定删除此素材分组？', {icon: 3, title: '提示信息'}, function (index) {
                $.ajax({
                    url: $.cookie("tempUrl") + "/materialgroup/del.do?token=" + $.cookie("token"),
                    type: "POST",
                    data:{
                        id: data.id
                    },
                    success: function (result) {
                        if (result.code === 0) {
                            layer.msg("素材组删除成功");
                            setTimeout(function () {
                                layer.closeAll("iframe");
                                //刷新父页面
                                window.location.href = "materialGroup.html"
                            }, 500);
                        } else {
                            layer.msg(result.exception, {icon: 7, anim: 6});
                        }
                    }
                });
                tableIns.reload();
                layer.close(index);
            });
        }
    });

    function updataMaterialGroup(data) {
        var index = layui.layer.open({
            title: "素材分组更新",
            type: 2,
            area: ["450px", "230px"],
            content: "updataMaterialGroup.html",
            success: function (layero, index) {
                var body = layui.layer.getChildFrame('body', index);
                if (data) {
                    sessionStorage.setItem("materialGroupId", data.id); //传id
                    body.find("#materialGroupName").val(data.name);
                }
                setTimeout(function () {
                    layui.layer.tips('点击此处关闭', '.layui-layer-setwin .layui-layer-close', {
                        tips: 3
                    });
                }, 500)
            }
        })
    }
    //搜索
    form.on("submit(search_btn)", function (data) {
        table.reload("materialGroupListTabel", {
            url: $.cookie("tempUrl") + '/materialgroup/search.do',
            method: 'post',
            where: {
                groupName: $("#groupName").val(),
                token: $.cookie("token")
            },
            response: {
                statusName: 'code' //数据状态的字段名称，默认：code
                , statusCode: 0 //成功的状态码，默认：0
                , msgName: 'httpStatus' //状态信息的字段名称，默认：msg
                , countName: 'totalElements' //数据总数的字段名称，默认：count
                , dataName: 'data' //数据列表的字段名称，默认：data
            }
        })
    });
    //点击flash按钮事件
    $(document).on("click", "#flash", function () {
        window.location.reload();
    });
    //点击新增按钮事件
    $(".addMaterialGroup_btn").click(function () {
        var index = layui.layer.open({
            title: "素材分组添加",
            type: 2,
            area: ["600px", "250px"],
            content: "addMaterialGroup.html",
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