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

    var dataAddress = sessionStorage.getItem("dataAddress");
    //获取省信息
    address.init(dataAddress.slice(0, 2), dataAddress.slice(0, 4), dataAddress);//初始化地址

    form.on("submit(addUser)", function (data) {
        //弹出loading
        var index = top.layer.msg('数据提交中，请稍候', {icon: 16, time: false, shade: 0.8});
        $.ajax({
            url: $.cookie("tempUrl") + "building/uptBuilding.do?token=" + $.cookie("token"),
            type: "POST",
            datatype: "application/json",
            contentType: "application/json;charset=utf-8",
            data: JSON.stringify({
                id: $(".buildName").attr("data-id"),
                address: $(".address").val(),
                areaid: data.field.area,
                name: $(".buildName").val()
            }),
            success: function (result) {
                top.layer.close(index);
                if (result.httpStatus == 200) {
                        top.layer.msg("楼宇更新成功！");
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