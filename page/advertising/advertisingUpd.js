layui.use(['form', 'layer'], function () {
    var form = layui.form,
        layer = parent.layer === undefined ? layui.layer : top.layer,
        $ = layui.jquery;

    const MIN_DISPLAY_TIME = 2;
    var isMusic = false;
    var advertisingId=sessionStorage.getItem("advertisingId");

    //获取广告分组
    $.ajax({
        url: $.cookie("tempUrl") + "adgroup/get_group.do?token=" + $.cookie("token"),
        type: "POST",
        success: function (result) {
            $.each(result.data,
                function (index, item) {
                    if ($(".adName").attr("data-groupid") == item.id) {
                        $("#advertisingGroup").append($('<option value=' + item.id + ' selected>' + item.name + '</option>'));
                    } else {
                        $("#advertisingGroup").append($('<option value=' + item.id + '>' + item.name + '</option>'));
                    }
                });
            form.render();
        }
    });
    //渲染素材
    $.ajax({
        url: $.cookie("tempUrl") + "admaterial/get_list_adId.do?token=" + $.cookie("token") + "&adId=" + advertisingId + "&pageNum=1&PageSize=99",
        type: "POST",
        success: function (result) {
            var data = result.content;
            if (data.length > 0) {

                var materialWrap = $("#materialWrap");
                $.each(data,function (index,item) {
                    if(item.materialType==='图片'){
                        materialWrap.append($(" <div class='materialItem img'>\n" +
                            "                    <ul>\n" +
                            "                        <li><span class='label'>类型：</span><span class='type'>"+item.materialType+"</span></li>\n" +
                            "                        <li><span class='label'>ID：</span><span class='materialId' data-id="+item.id+">"+item.materialId+"</span></li>\n" +
                            "                        <li><span class='label'>名称：</span><span class='materialName'>"+item.materialName+"</span></li>\n" +
                            "                        <li><span class='label'>地址：</span><span class='materialPath'><a class='preview'>"+item.materialPath+"</a></span></li>\n" +
                            "                        <li><span class='label'>参数：</span>【间隔<input class='loadStep' type='number' disabled style='width: 50px'>秒】 【显示<input class='displayTime' type='number' value="+item.displayTime+" style='width: 50px'>秒】【顺序<input class='orderIndex' type='number' value="+item.orderIndex+" style='width: 50px'>】</li>\n" +
                            "                        <li><span class='label'>音频：</span><span class='musicPath'><a class='preview'>"+item.musicPath+"</a></span><button class='layui-btn layui-btn-xs layui-btn-normal musicAddBtn'>选择</button></li>\n" +
                            "                    </ul>\n" +
                            "                    <div class='option'><button class='layui-btn  layui-btn-sm layui-btn-danger delBtn'>删除</button></div>\n" +
                            "                </div>"))
                    }else {
                        materialWrap.append($(" <div class='materialItem video'>\n" +
                            "                    <ul>\n" +
                            "                        <li><span class='label'>类型：</span><span class='type'>"+item.materialType+"</span></li>\n" +
                            "                        <li><span class='label'>ID：</span><span class='materialId'  data-id="+item.id+">"+item.materialId+"</span></li>\n" +
                            "                        <li><span class='label'>名称：</span><span class='materialName'>"+item.materialName+"</span></li>\n" +
                            "                        <li><span class='label'>地址：</span><span class='materialPath'><a class='preview'>"+item.materialPath+"</a></span></li>\n" +
                            "                        <li><span class='label'>参数：</span>【间隔<input class='loadStep' type='number' disabled style='width: 50px'>秒】 【顺序<input class='orderIndex' type='number' value="+item.orderIndex+"  style='width: 50px'>】</li>\n" +
                            "                    </ul>\n" +
                            "                    <div class='option'><button class='layui-btn layui-btn-sm layui-btn-danger delBtn'>删除</button></div>\n" +
                            "                </div>"))
                    }
                });
            }
        }
    });

    // {
    //     "adData": [
    //     {
    //         "adId": 0,
    //         "displayTime": 0,
    //         "id": 0,
    //         "loadStep": 0,
    //         "materialId": 0,
    //         "musicPath": "string",
    //         "orderIndex": 0
    //     }
    // ],
    //     "groupid": 0,
    //     "id": 0,
    //     "name": "string"
    // }

    //提交更新
    form.on("submit(addGroup)", function (data) {
        //弹出loading
        var index = top.layer.msg('数据提交中，请稍候', {icon: 16, time: false, shade: 0.8});
        var _list2=materialData(advertisingId);
        $.ajax({
            url: $.cookie("tempUrl") + "ad/update_ad.do?token=" + $.cookie("token"),
            type: "post",
            datatype: "json",
            contentType: "application/json;charset=utf-8",
            data: JSON.stringify({
                adData: _list2,
                groupid: $("#advertisingGroup").val(),
                id: advertisingId,
                name: $(".adName").val(),
            }),
            async: false,
            timeout: 50000,
            success: function (result) {
                if (result.httpStatus == 200) {
                    top.layer.close(index);
                    top.layer.msg("设置成功！");
                    layer.closeAll("iframe");
                    //刷新父页面
                    parent.location.reload();
                } else {
                    layer.alert(result.exception, {icon: 7, anim: 6});
                }
            }
            ,
            error: function (result) {
               layer.alert("error，不能输入小数", {icon: 7, anim: 6});
            }
        });
    });


    function materialData(adId) {
        var _list = [];
        var materials=$(".materialItem");
        $.each(materials,function (index,item) {
            var el = $(item);
            var obj = {
                "adId": adId,
                "id": el.find(".materialId").attr("data-id"),
                "materialId": el.find(".materialId").text(),
                "displayTime": parseInt(el.find(".displayTime").val()) >= MIN_DISPLAY_TIME ? parseInt(el.find(".displayTime").val()) : MIN_DISPLAY_TIME  ,
                "loadStep": el.find(".loadStep").val(),
                "orderIndex": el.find(".orderIndex").val(),
                "musicPath": el.find(".musicPath").text()
            };
            _list.push(obj);
        });
        return _list;
        //     "adData": [
        //     {
        //         "adId": 0,
        //         "displayTime": 0,
        //         "id": 0,
        //         "loadStep": 0,
        //         "materialId": 0,
        //         "musicPath": "string",
        //         "orderIndex": 0
        //     }
    }

    $("#materialWrap").on("click",".delBtn",function (e) {
        $(e.target).parent().parent().remove();
    });

    $("#materialWrap").on("click",".musicAddBtn",function (e) {
        e.preventDefault();
        var el=$(e.target);
        var musicPath =  el.parent().find(".musicPath");
        var index = layui.layer.open({
            title: "选择音频素材",
            type: 1,
            area: '350px',
            content: $('#musicAdd'),
            shadeClose:true,
            success: function (layero, index) {
                $(".layui-layer-content").css("overflow","inherit");
                if (!isMusic){
                    $.ajax({
                        url: $.cookie("tempUrl") + "material/search.do?token=" + $.cookie("token")+"&type=音频",
                        type: "POST",
                        success: function (result) {
                            $.each(result.content,
                                function (index, item) {
                                    $("#music").append($('<option value=' + item.path + '>' + item.name + '</option>'));
                                });
                            form.render();
                            isMusic=!isMusic;
                        }
                    });
                }
                $("#music").val(musicPath.text());
                form.render();
            },
            btn: ['确认'],
            yes: function(){
                musicPath.html($("<a class='preview'></a>").append($("#music").val()));
                layui.layer.close(index);
            }
        })
    });

    //素材车素材预览
    $("#materialWrap").on("click",".preview",function (e) {
        var photoReg = /\.jpg$|\.jpeg$|\.gif$/i;
        var videoReg = /\.avi$|\.mkv$|\.mp4$|\.mov$|\.flv$/i;
        var musicReg = /\.mp3$|\.wma$|\.flac$|\.aac$|\.wav$/i;
        var directReg = /\.m3u8$/i;

        var data = $(e.target).text();
        var type = 0;
        var area = "";
        var redirect = "";
        if (photoReg.test(data.substring(data.lastIndexOf(".")))) {
            redirect = '<div style="display: flex;justify-content: center;width: 100%;height: 100%;align-items: center;">' +
                '<img class="layui-upload-img thumbImg" id="perivew" src="' + data + '"></div>'
            type=1;
            area = ['800px','600px'];
        } else if (videoReg.test(data.substring(data.lastIndexOf(".")))) {
            redirect = '<div style="display: flex;justify-content: center;width: 100%;height: 100%;align-items: center;">' +
                '<video class="layui-upload-img thumbImg" src="' + data + '" controls="controls" id="perivew" width="600" height="400"></video></div>';
            type=1;
            area = ['650px','500px'];
        } else if (directReg.test(data.substring(data.lastIndexOf(".")))){
            redirect = "video.html"
            sessionStorage.setItem("url",data);
            type=2;
            area = ['600px','600px'];
        } else if (musicReg.test(data.substring(data.lastIndexOf(".")))) {
            redirect = '<audio class="layui-upload-img thumbImg" controls="controls" id="perivew" src="' + data + '"></audio>';
            type=1;
            area = 'auto';
        }

        var index = layui.layer.open({
            title: '素材预览',
            type: type,
            shade: 0.5,
            shadeClose: true,
            offset: 'lt',
            area: area,
            content: redirect,
            success: function (layero, index) {
                var body = layui.layer.getChildFrame('body', index);
                setTimeout(function () {
                    layui.layer.tips('点击此处关闭', '.layui-layer-setwin .layui-layer-close', {
                        tips: 3
                    });
                }, 500)
            }
        });
    });
});