var form, $, areaData;
layui.config({
    base: "../../js/"
})
layui.use(['form', 'layer', 'upload', 'laydate'], function () {
    form = layui.form;
    $ = layui.jquery;
    var layer = parent.layer === undefined ? layui.layer : top.layer,
        upload = layui.upload,
        laydate = layui.laydate,
        address = layui.address;

    $(".truename").attr("value", $.cookie("truename"));
    $(function () {
        $.ajax({
            url: $.cookie("tempUrl") + "manager/get_user_info.do?token=" + $.cookie("token"),
            type: "GET",
            success: function (result) {
                $(".account").attr("value", result.data.account);
                $(".email").attr("value", result.data.email);
                // $(".userPhone").attr("value", "");
                $(".userPhone").attr("value", result.data.phone);
                if (result.data.type == 0) {
                    $("#role").attr("value", "普通管理员");
                } else {
                    $("#role").attr("value", "直播员");
                }
            }
        });
    })

    //提交个人资料
    form.on("submit(changeUser)", function (data) {
        var index = layer.msg('提交中，请稍候', {icon: 16, time: false, shade: 0.8});

        $.ajax({
            url: $.cookie("tempUrl") + "manager/update_information.do?token=" + $.cookie("token"),
            type: "POST",
            datatype: "application/json",
            contentType: "application/json;charset=utf-8",
            data: JSON.stringify({
                email: $(".email").val(),
                id: "",
                newPwd: "",
                oldPwd: "",
                phone: $(".userPhone").val(),
                trueName: $(".truename").val()
            }),
            success: function (result) {
                if (result.httpStatus == 200) {
                    layer.msg("更新成功,请重新登陆...");
                    setTimeout(function () {
                        top.layer.close(index);
                        layer.closeAll("iframe");
                        //跳转至登陆界面
                        $.cookie('truename', "", {path: '/'});
                        $.cookie('token', "", {path: '/'});
                        parent.location.href = "../../login.html";
                    }, 1000);
                } else {
                    layer.alert(result.exception, {icon: 7, anim: 6});
                }
            }
        });
        return false; //阻止表单跳转。如果需要表单跳转，去掉这段即可。
    })
})