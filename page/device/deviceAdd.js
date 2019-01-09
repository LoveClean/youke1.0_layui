layui.config({
    base: "../../js/"
}).extend({
    "address": "address"
})
layui.use(['form', 'layer', "address"], function () {
    var form = layui.form
    layer = parent.layer === undefined ? layui.layer : top.layer,
        $ = layui.jquery;
    address = layui.address;

    //获取省信息
    address.provinces();
    //address.init("33","3302","330203");
    var buildEl = $("#build");

    //根据地区加载楼宇
    form.on('select(area)', function (data) {
        buildEl.empty();
        form.render('select');
        if (data.value === "") {
            buildEl.attr("disabled", "");
        } else {
            $.ajax({
                url: $.cookie("tempUrl") + "building/get_building_areaId.do?token=" + $.cookie("token"),
                type: "POST",
                contentType: "application/json;charset=utf-8",
                data: data.value,
                success: function (d) {
                    var builds = d.data;
                    if (builds !== null) {
                        $.each(builds, function (index, item) {
                            buildEl.append($("<option value=" + item.id + ">" + item.name + "</option>"))
                        });
                        buildEl.removeAttr("disabled");
                    } else {

                    }
                    form.render('select');
                },
                error: function () {
                    alert("请求ERROR");
                }
            })
        }
    });

    //提交
    form.on("submit(submit)", function (data) {
        //弹出loading
        var index = top.layer.msg('数据提交中，请稍候', {icon: 16, time: false, shade: 0.8});
        $.ajax({
            url: $.cookie("tempUrl") + "device/add.do?token=" + $.cookie("token"),
            type: "POST",
            datatype: "application/json",
            contentType: "application/json;charset=utf-8",
            data: JSON.stringify({
                "address": $("#mac").val(),//这个接口有问题，对应的是mac地址
                "areaId": $("#area").val(),
                "brand": $("#brand").val(),
                "buildingId": $("#build").val(),
                "code": $("#code").val(),
                "groupid": $("#group").val(),
                "spec": $("#spec").val(),
                "type": $("#type").val()
            }),
            success: function (result) {
                if (result.httpStatus == 200) {
                        top.layer.close(index);
                        top.layer.msg("设备添加成功！");
                        layer.closeAll("iframe");
                        //刷新父页面
                        parent.location.reload();
                } else {
                    layer.alert(result.exception, {icon: 7, anim: 6});
                }
            }
        });
        return false;
    })
})