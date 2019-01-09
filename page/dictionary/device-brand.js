layui.use(['table','layer','form'], function () {
    var table = layui.table,
        layer = layui.layer,
        form = layui.form;

    //执行渲染
    layer.load();
    table.render({
        elem: '#dataList', //指定原始表格元素选择器（推荐id选择器）
        url: $.cookie("tempUrl") + 'devicebrand/get_list.do',
        method: 'get',
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
            {field: 'brand', title: '设备品牌', minWidth: 100, align: "center"},
            {title: '操作', minWidth: 100, templet: '#option', fixed: "right", align: "center"}
        ]],
        done: function () {
            layer.closeAll('loading');
        }
        //,…… //更多参数参考右侧目录：基本参数选项
    });


    //点击新增按钮事件
    $(".addNews_btn").click(function () {
        var index = layui.layer.open({
            title: "新增设备品牌",
            type: 1,
            area:'350px',
            content: $('#add'),
            shadeClose:true,
            success: function (layero, index) {
                $("#brand-add").val("");
            }
        })
    });

    form.on("submit(submit)", function (data) {
        //弹出loading
        var index = top.layer.msg('数据提交中，请稍候', {icon: 16, time: false, shade: 0.8});
        $.ajax({
            url: $.cookie("tempUrl") + "devicebrand/add_brand.do?token=" + $.cookie("token"),
            type: "POST",
            data:{
                "brand":$("#brand-add").val()
            },
            success: function (result) {
                if (result.code == 0) {
                        top.layer.close(index);
                        top.layer.msg("添加品牌成功！");
                        layer.closeAll("iframe");
                        //刷新父页面
                        location.reload();
                } else {
                    layer.alert(result.exception, {icon: 7, anim: 6});
                }
            }
        });
        return false;
    });


    table.on('tool(table)', function (obj) {
        var layEvent = obj.event,
            data = obj.data,
            tr = obj.tr;

        if (layEvent === 'edit') { //编辑

        } else if (layEvent === 'delete') { //删除
            layer.confirm('确定删除这条数据吗？', {icon: 3, title: '提示信息'}, function (index) {
                $.ajax({
                    url: $.cookie("tempUrl") + "devicebrand/del_brand.do?token=" + $.cookie("token"),
                    type: "POST",
                    //dataType: "application/json",
                    //contentType: "application/json;charset=utf-8",
                    data: {
                        "brand": data.brand
                    },
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
                // layer.close(index);
            });
        }
    });
})
