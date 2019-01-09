layui.config({
    base: "../../js/"
}).extend({
    "address": "address"
});
layui.use(['form', 'layer', 'table', 'laytpl', "address"], function () {
    var form = layui.form,
        layer = parent.layer === undefined ? layui.layer : top.layer,
        $ = layui.jquery,
        laytpl = layui.laytpl,
        table = layui.table,
        address = layui.address;

    //获取省信息
    address.provinces();

    //用户列表
    var tableIns = table.render({
        elem: '#userList',
        url: $.cookie("tempUrl") + 'building/get_building_list.do',
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
        limit: 10,
        id: "userListTable",
        cols: [[
            {field: 'id', title: '楼宇编号', width: 100, align: "center"},
            {field: 'name', title: '楼宇名称', minWidth: 120, align: "center"},
            {
                field: 'areaVo', title: '区域', minWidth: 120, align: 'center', templet: function (d) {
                    return d.areaVo.fullName;
                }
            },
            {field: 'address', title: '详细地址', minWidth: 170, align: "center"},
            {title: '操作', minWidth: 160, templet: '#userListBar', fixed: "right", align: "center"}
        ]]
    });

    //搜索
    form.on("submit(search_btn)", function (data) {
        table.reload("userListTable", {
            url: $.cookie("tempUrl") + 'building/get_building_areaId_name.do',
            method: 'post',
            where: {
                provinceId: data.field.province,
                cityId: data.field.city,
                areaId: data.field.area,
                buildingKey: $(".searchVal").val(),
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
                {field: 'id', title: '楼宇编号', width: 100, align: "center"},
                {field: 'name', title: '楼宇名称', minWidth: 120, align: "center"},
                {
                    field: 'areaVo', title: '区域', minWidth: 120, align: 'center', templet: function (d) {
                        return d.areaVo.fullName;
                    }
                },
                {field: 'address', title: '详细地址', minWidth: 170, align: "center"},
                {title: '操作', minWidth: 160, templet: '#userListBar', fixed: "right", align: "center"}
            ]]
        })
    });

    //点击flash按钮事件
    $(document).on("click", "#flash", function () {
        window.location.reload();
    });

    //点击新增按钮事件
    $(".addNews_btn").click(function () {
        var index = layui.layer.open({
            title: "楼宇(社区添加)",
            type: 2,
            area: ["600px", "300px"],
            content: "buildAdd.html",
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

    //编辑文章
    function buildUpd(edit) {
        sessionStorage.setItem("dataAddress",edit.areaid);
        var index = layui.layer.open({
            title: "编辑文章",
            type: 2,
            area: ["600px", "300px"],
            content: "buildUpd.html",
            success: function (layero, index) {
                var body = layui.layer.getChildFrame('body', index);
                if (edit) {
                    body.find(".buildName").attr("data-id", edit.id);  //传id
                    body.find(".buildName").val(edit.name);  //楼宇名称
                    body.find(".address").val(edit.address);  //详细地址
                    form.render();
                }
                setTimeout(function () {
                    layui.layer.tips('点击此处返回楼宇列表', '.layui-layer-setwin .layui-layer-close', {
                        tips: 3
                    });
                }, 500)
            }
        });
    }

    //列表操作
    table.on('tool(userList)', function (obj) {
        var layEvent = obj.event,
            data = obj.data;

        if (layEvent === 'edit') { //编辑
            buildUpd(data);
        } else if (layEvent === 'del') { //删除
            layer.confirm('确定删除此楼宇？', {icon: 3, title: '提示信息'}, function (index) {
                $.ajax({
                    url: $.cookie("tempUrl") + "building/delBuilding.do?token=" + $.cookie("token") + "&buildingId=" + data.id,
                    type: "POST",
                    success: function (result) {
                        layer.msg("删除成功");
                        obj.del();
                        layer.close(index);
                    }
                });
            });
        }
    });

});
