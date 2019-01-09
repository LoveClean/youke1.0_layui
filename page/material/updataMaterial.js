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

    var url = "";
    var url2 = "";
    var path = sessionStorage.getItem("path");
    var newType = sessionStorage.getItem("type");
    var groupId = sessionStorage.getItem("groupId");
    $(function() {
        if (newType === "图片") {
            $("#pu").attr("checked", "checked");
            url = "file/uploadImage";
        }else if (newType === "音频"){
            $("#mu").attr("checked", "checked");
            url = "file/uploadAudio";
        } else {
            $("#mo").attr("checked", "checked");
            url = "file/uploadAudio";
        }
        url2 = url;
        form.render();
    })
    var type = "图片"
    form.on('radio(test)', function (data) {
        console.log(data.value); //被点击的radio的value值
        var val = data.value;
        type = val;
        if (val === "图片") {
            url = "file/uploadImage";
        } else {
            url = "file/uploadAudio";
        }
        url2 = url;
    });

    form.verify({
        pathJudge: function(value, item){ //value：表单的值、item：表单的DOM对象
            if(item.innerText === ""){
                return '必须上传文件';
            }
        }
    });

    upload.render({
        elem: '#test1'
        , url: $.cookie("tempUrl") + url2 + '?token=' + $.cookie("token")
        , before: function (obj) { //obj参数包含的信息，跟 choose回调完全一致，可参见上文。
            layer.load(); //上传loading
        }
        , done: function (res, index, upload) {
            layer.closeAll('loading'); //关闭loading
            //假设code=0代表上传成功
            if (res.code === 0) {
                $("#demoText").text("素材地址：" + res.data);
                path = res.data;
            } else {
                layer.msg(res.exception);
            }
        }
        , error: function (index, upload) {
            layer.closeAll('loading'); //关闭loading
        }
    });


    $.ajax({
        url: $.cookie("tempUrl") + "/materialgroup/get_group.do?token=" + $.cookie("token"),
        type: "POST",
        success: function (result) {
            var data = result.data;
            for (var i = 0; i < data.length; i++) {
                if (data[i].id === parseInt(groupId)) {
                    var option = $("<option value='" + data[i].id + "' selected>" + data[i].name + "</option>");
                }else {
                    var option = $("<option value='" + data[i].id + "'>" + data[i].name + "</option>");
                }
                $("#materialGroup").append(option)
                form.render('select');
            }
        }
    });
    form.on('submit(upMaterial)', function(data) {
        var groupid = $("#materialGroup").val();
        var name = $("#materialName").val();
        $.ajax({
            url: $.cookie("tempUrl") + "/material/update.do?token=" + $.cookie("token"),
            type: "POST",
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            data: JSON.stringify({
                groupid: groupid,
                name: name,
                path: path,
                type: type,
                id: sessionStorage.getItem("materialId")
            }),
            success: function (result) {
                if (result.code === 0) {
                    layer.msg("素材更新成功");
                    setTimeout(function () {
                        layer.closeAll("iframe");
                        //刷新父页面
                        parent.location.reload();
                    }, 500);
                } else {
                    layer.msg(result.exception, {icon: 7, anim: 6});
                }
            }
        })
        return false;
    })
})