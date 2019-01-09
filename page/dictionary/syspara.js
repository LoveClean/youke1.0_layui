layui.use(['table', 'layer' , 'form'], function () {
    var table = layui.table,
        layer = layui.layer,
        form = layui.form;

    //执行渲染
    layer.load();
    table.render({
        elem: '#dataList', //指定原始表格元素选择器（推荐id选择器）
        url: $.cookie("tempUrl") + 'syspara/get_list.do',
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
            {field: 'id', title: '参数ID', minWidth: 100, align: "center", sort: true},
            {field: 'name', title: '参数名', minWidth: 100, align: "center"},
            {field: 'value', title: '参数值', minWidth: 100, align: "center"},
            {field: 'note', title: '参数详情', minWidth: 100, align: "center"},
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
        if (layEvent === 'edit') {
            var index = layui.layer.open({
                title: "编辑系统参数",
                type: 1,
                area:'350px',
                content: $('#update'),
                shadeClose:true,
                success: function (layero, index) {
                    $("#paraName").val(data.name).attr("data-id",data.id);
                    $("#paraValue").val(data.value);
                    $("#paraDetail").val(data.note);
                }
            })
        }
        else if (layEvent === 'delete') { //删除

        }
    });

    form.on("submit(submit)", function () {
        //弹出loading
        var index = top.layer.msg('数据提交中，请稍候', {icon: 16, time: false, shade: 0.8});
        $.ajax({
            url: $.cookie("tempUrl") + "syspara/update.do?token=" + $.cookie("token"),
            type: "POST",
            contentType: "application/json;charset=utf-8",
            data:JSON.stringify({
                "id": $("#paraName").attr("data-id"),
                "name": $("#paraName").val(),
                "note": $("#paraDetail").val(),
                "value": $("#paraValue").val()
            }),
            success: function (result) {
                if (result.code === 0) {
                    top.layer.close(index);
                    top.layer.msg("修改参数成功！");
                    layer.closeAll("iframe");
                    location.reload();
                } else {
                    layer.alert(result.exception, {icon: 7, anim: 6});
                }
            }
        });
        return false;
    });
})