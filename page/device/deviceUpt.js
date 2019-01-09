layui.config({
    base: "../../js/"
}).extend({
    "address": "address"
})
layui.use(['form', 'layer', "address"], function () {
    var form = layui.form,
    layer = parent.layer === undefined ? layui.layer : top.layer,
        $ = layui.jquery;
    address = layui.address;

    var buildEl = $("#build");

    //session取值
    var areaid=sessionStorage.getItem("areaId");
    var buildingid=sessionStorage.getItem("buildingId");
    address.init(areaid.slice(0,2),areaid.slice(0,4),areaid);//初始化地址
    loadBuildsInit(areaid,buildingid); //初始化楼宇

    //监听地区切换，加载楼宇
    form.on('select(area)', function (data) {
        loadBuilds(data.value);
    });
    function loadBuilds(areaid){
        buildEl.empty();
        form.render('select');
        if (areaid === "") {
            buildEl.attr("disabled", "");
        } else {
            $.ajax({
                url: $.cookie("tempUrl") + "building/get_building_areaId.do?token=" + $.cookie("token"),
                type: "POST",
                contentType: "application/json;charset=utf-8",
                data: areaid,
                success: function (d) {
                    var builds = d.data;
                    if (builds !== null) {
                        $.each(builds, function (index, item) {
                            buildEl.append($("<option value=" + item.id + ">" + item.name + "</option>"))
                        });
                        buildEl.removeAttr("disabled");
                    }
                    form.render('select');
                }
            })
        }
    }

    //加载楼宇并初始化
    function loadBuildsInit(areaid,buildingid){
        buildEl.empty();
        form.render('select');
        if (areaid === "") {
            buildEl.attr("disabled", "");
        } else {
            $.ajax({
                url: $.cookie("tempUrl") + "building/get_building_areaId.do?token=" + $.cookie("token"),
                type: "POST",
                contentType: "application/json;charset=utf-8",
                data: areaid,
                success: function (d) {
                    var builds = d.data;
                    if (builds !== null) {
                        $.each(builds, function (index, item) {
                            buildEl.append($("<option value=" + item.id + ">" + item.name + "</option>"))
                        });
                        buildEl.removeAttr("disabled");
                        buildEl.val(buildingid);
                    }
                    form.render('select');
                }
            })
        }
    }

    //提交
    form.on("submit(submit)", function (data) {
        //弹出loading
        var index = top.layer.msg('数据提交中，请稍候', {icon: 16, time: false, shade: 0.8});
        $.ajax({
            url: $.cookie("tempUrl") + "device/update.do?token=" + $.cookie("token"),
            type: "POST",
            datatype: "application/json",
            contentType: "application/json;charset=utf-8",
            data: JSON.stringify({
                "id":$("#code").attr("data-id"),
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
                        top.layer.msg("设备修改成功！");
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