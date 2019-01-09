layui.use(['form', 'layer'], function () {
    var form=layui.form,
        layer = layui.layer;


    var adminType=sessionStorage.getItem("adminType");
    $("#type").val(adminType);
    form.render();
    //提交
    form.on("submit(submit)", function (data) {
        var field=data.field;
        //弹出loading
        var index = top.layer.msg('数据提交中，请稍候', {icon: 16, time: false, shade: 0.8});
        $.ajax({
            url: $.cookie("tempUrl") + "manager/update_others_infor.do?token=" + $.cookie("token"),
            type: "POST",
            datatype: "application/json",
            contentType: "application/json;charset=utf-8",
            data: JSON.stringify({
                "email": field.email,
                "id": field.id,
                "phone": field.phone,
                "trueName": field.trueName,
                "type": field.type
            }),
            success: function (result) {
                top.layer.close(index);
                if (result.httpStatus == 200) {
                    top.layer.msg("管理员修改成功！");
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