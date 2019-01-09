
layui.use(['form', 'layer', 'laydate', 'table', 'laytpl'], function () {
    var form = layui.form,
        layer = parent.layer === undefined ? layui.layer : top.layer,
        $ = layui.jquery,
        laydate = layui.laydate,
        laytpl = layui.laytpl,
        table = layui.table;

    //import {returnLogin} from "../../js/public";

    $(".truename").attr("value", $.cookie("truename"));

    //添加验证规则
    form.verify({
        newPwd: function (value, item) {
            if (value.length < 7) {
                return "密码长度不能小于7位";
            }
        },
        confirmPwd: function (value, item) {
            if (!new RegExp($("#newPwd").val()).test(value)) {
                return "两次输入密码不一致，请重新输入！";
            }
        }
    });

    //修改密码
    form.on("submit(changePwd)", function (data) {
        var index = layer.msg('提交中，请稍候', {icon: 16, time: false, shade: 0.8});
        setTimeout(function () {
            $.ajax({
                url: $.cookie("tempUrl") + "manager/reset_password.do?token=" + $.cookie("token"),
                type: "POST",
                datatype: "application/json",
                contentType: "application/json;charset=utf-8",
                data: JSON.stringify({
                    passwordNew: $("#newPwd").val(),
                    passwordOld: $("#oldPwd").val()
                }),
                success: function (result) {
                    if (result.httpStatus == 200) {
                        layer.msg(result.data + ',请重新登陆......');
                        $.ajax({
                            url: $.cookie("tempUrl") + "manager/logout?token=" + $.cookie("token") ,
                            type: "GET",
                            success: function (result) {
                                if(result.code===0){
                                    top.layer.close(index);
                                    layer.closeAll("iframe");
                                    //跳转至登陆界面
                                    $.cookie('truename', "", {path: '/'});
                                    $.cookie('token', "", {path: '/'});
                                    top.location.replace("/media_ops_layui/login.html");
                                    //returnLogin();
                                }
                            }
                        });
                    } else {
                        layer.alert(result.exception, {icon: 7, anim: 6});
                    }
                }
            });
        }, 1000);
        return false; //阻止表单跳转。如果需要表单跳转，去掉这段即可。
    });

    //控制表格编辑时文本的位置【跟随渲染时的位置】
    $("body").on("click", ".layui-table-body.layui-table-main tbody tr td", function () {
        $(this).find(".layui-table-edit").addClass("layui-" + $(this).attr("align"));
    });

});