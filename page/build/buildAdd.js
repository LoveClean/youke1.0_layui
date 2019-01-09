layui.config({
    base: "../../js/"
}).extend({
    "address": "address"
});
layui.use(['form', 'layer', "address"], function () {
    var form = layui.form,
        layer = parent.layer === undefined ? layui.layer : top.layer,
        $ = layui.jquery,
        address = layui.address;

    //获取省信息
    address.provinces();

    form.on("submit(addUser)", function (data) {
        //弹出loading
        var index = top.layer.msg('数据提交中，请稍候', {icon: 16, time: false, shade: 0.8});
        $.ajax({
            url: $.cookie("tempUrl") + "building/addBuilding.do?token=" + $.cookie("token"),
            type: "POST",
            datatype: "application/json",
            contentType: "application/json;charset=utf-8",
            data: JSON.stringify({
                address: $(".address").val(),
                areaid: data.field.area,
                name: $(".userName").val()
            }),
            success: function (result) {
                top.layer.close(index);
                if (result.httpStatus == 200) {
                        top.layer.msg("楼宇添加成功！");
                        layer.closeAll("iframe");
                        //刷新父页面
                        parent.location.reload();

                } else {
                    layer.alert(result.exception, {icon: 7, anim: 6});
                }
            }
        });
        return false;
    });
});