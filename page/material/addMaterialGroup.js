layui.config({
    base: "../../js/"
}).extend({
    "address": "address"
})
layui.use(['form', 'layer', 'table', 'laytpl','upload', "address"], function () {
    var form = layui.form,
        layer = parent.layer === undefined ? layui.layer : top.layer,
        $ = layui.jquery,
        laytpl = layui.laytpl,
        table = layui.table;
    upload = layui.upload;
    address = layui.address;

    $("#addGroup").click(function () {
        $.ajax({
            url: $.cookie("tempUrl") + "/materialgroup/add_group.do?token=" + $.cookie("token"),
            type: "POST",
            datatype: "json",
            contentType: "application/json;charset=utf-8",
            data: JSON.stringify({
                groupName: $("#materialGroupName").val(),
                parentId: 0
            }),
            success: function (result) {
                if (result.code === 0) {
                    layer.msg("组添加成功");
                    setTimeout(function () {
                        layer.closeAll("iframe");
                        //刷新父页面
                        parent.location.reload();
                    }, 500);
                } else {
                    layer.msg(result.exception, {icon: 7, anim: 6});
                }
            }
        });
        return false;
    })
})