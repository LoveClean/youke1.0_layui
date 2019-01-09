layui.use(['form', 'layer', 'table'], function () {
    var form = layui.form,
        layer = parent.layer === undefined ? layui.layer : top.layer,
        $ = layui.jquery,
        table = layui.table;


    const MIN_DISPLAY_TIME = 2;
    var isMusic = false;

    //获取广告分组
    $.ajax({
        url: $.cookie("tempUrl") + "adgroup/get_group.do?token=" + $.cookie("token"),
        type: "POST",
        success: function (result) {
            $.each(result.data,
                function (index, item) {
                    $("#advertisingGroup").append($('<option value=' + item.id + '>' + item.name + '</option>'));
                });
            form.render();
        }
    });

    //素材列表
    var tableIns = table.render({
        elem: '#materialList',
        url: $.cookie("tempUrl") + '/material/get_list2.do',
        method: 'post',
        where: {token: $.cookie("token")},
        request: {
            pageName: 'pageNum' //页码的参数名称，默认：page
            , limitName: 'pageSize' //每页数据量的参数名，默认：limit
        },
        response: {
            statusName: 'code' //数据状态的字段名称，默认：code
            , statusCode: 0 //成功的状态码，默认：0
            , msgName: 'httpStatus' //状态信息的字段名称，默认：msg
            , countName: 'totalElements' //数据总数的字段名称，默认：count
            , dataName: 'content' //数据列表的字段名称，默认：data
        },
        cellMinWidth: 95,
        page: true,
        limits: [5, 10, 15, 20, 25],
        limit: 10,
        id: "dataTable",
        cols: [[
            {type: "checkbox", fixed: "left", width: 50},
            {field: 'id', title: 'ID', width: 100, align: "center"},
            {field: 'name', title: '文件名', minWidth: 150, width: 180, align: "center"},
            {field: 'type', title: '类型', width: 100, align: 'center'},
            {
                field: 'path', title: '地址', minWidth: 200, templet: function (d) {
                    return '<a data-info=' + d.type + ' data-info2=' + d.path + ' class="layui-btn layui-btn-xs material" style="margin-right: 10px">预览</a>' + '<span style="color: #c00">' + d.path + '</span>'
                }
            },
            {field: 'groupName', title: '分组名称', minWidth: 180, width: 230, align: "center"}
        ]]
    });
    $.ajax({
        url: $.cookie("tempUrl") + "/materialgroup/get_group.do?token=" + $.cookie("token"),
        type: "POST",
        success: function (result) {
            var data = result.data;
            for (var i = 0; i < data.length; i++) {
                var option = $("<option value='" + data[i].id + "'>" + data[i].name + "</option>");
                $("#materialGroup").append(option)
                form.render('select');
            }
        }
    });
    //素材列表搜索
    form.on("submit(search_btn)", function (data) {
        table.reload("dataTable", {
            url: $.cookie("tempUrl") + '/material/search2.do',
            method: 'post',
            where: {
                groupId: $("#materialGroup").val(),
                keyword: $("#materialName").val(),
                token: $.cookie("token")
            }
        })
    });
    //素材列表预览按钮
    $(document).on('click', '.material', function () {
        var data = $(this).attr("data-info2");
        var type = $(this).attr("data-info");
        var type2 = 0;
        var area = "";
        var redirect = "";
        if (type === "图片") {
            redirect = '<div style="display: flex;justify-content: center;width: 100%;height: 100%;align-items: center;">' +
                '<img class="layui-upload-img thumbImg" id="perivew" src="' + data + '"></div>'
            type2=1;
            area = ['600px','450px'];
        } else if (type === "视频") {
            redirect = '<div style="display: flex;justify-content: center;width: 100%;height: 100%;align-items: center;">' +
                '<video class="layui-upload-img thumbImg" src="' + data + '" controls="controls" id="perivew" width="600" height="400"></胜利ideo></div>';
            type2=1;
            area = ['650px','500px'];
        } else if (type==="直播"){
            redirect = "video.html"
            sessionStorage.setItem("url",data);
            type2=2;
            area = ['600px','600px'];
        } else {
            redirect = '<audio class="layui-upload-img thumbImg" controls="controls" id="perivew" src="' + data + '"></audio>';
            type2=1;
            area = 'auto';
        }
        var index = layui.layer.open({
            title: "预览",
            type: type2,
            offset: 'lt',
            area: area,
            resize: true,
            content: redirect,
            shade: 0.5,
            shadeClose: true,
            success: function (layero, index) {
                setTimeout(function () {
                    layui.layer.tips('点击此处关闭', '.layui-layer-setwin .layui-layer-close', {
                        tips: 3
                    });
                }, 500)
            }
        })
    })

    //点击设置广告素材
    $("#setAd").click(function (e) {
        e.preventDefault();
        var checkStatus = table.checkStatus('dataTable'),
            data = checkStatus.data;

        if (data.length > 0) {
            $("#temp").css("display","none");
            var materialWrap = $("#materialWrap");

            $.each(data,function (index,item) {
               if(item.type==='图片'){
                   materialWrap.append($(" <div class='materialItem img'>\n" +
                       "                    <ul>\n" +
                       "                        <li><span class='label'>类型：</span><span class='type'>"+item.type+"</span></li>\n" +
                       "                        <li><span class='label'>ID：</span><span class='materialId'>"+item.id+"</span></li>\n" +
                       "                        <li><span class='label'>名称：</span><span class='materialName'>"+item.name+"</span></li>\n" +
                       "                        <li><span class='label'>地址：</span><span class='materialPath'><a class='preview'>"+item.path+"</a></span></li>\n" +
                       "                        <li><span class='label'>参数：</span>【间隔<input class='loadStep' type='number' value='0' disabled style='width: 50px'>秒】 【显示<input class='displayTime' type='number' value="+MIN_DISPLAY_TIME+" style='width: 50px'>秒】【顺序<input class='orderIndex' type='number' value='1' style='width: 50px'>】</li>\n" +
                       "                        <li><span class='label'>音频：</span><span class='musicPath'></span><button class='layui-btn layui-btn-xs layui-btn-normal musicAddBtn'>选择</button></li>\n" +
                       "                    </ul>\n" +
                       "                    <div class='option'><button class='layui-btn  layui-btn-sm layui-btn-danger delBtn'>删除</button></div>\n" +
                       "                </div>"))
               }else {
                   materialWrap.append($(" <div class='materialItem video'>\n" +
                       "                    <ul>\n" +
                       "                        <li><span class='label'>类型：</span><span class='type'>"+item.type+"</span></li>\n" +
                       "                        <li><span class='label'>ID：</span><span class='materialId'>"+item.id+"</span></li>\n" +
                       "                        <li><span class='label'>名称：</span><span class='materialName'>"+item.name+"</span></li>\n" +
                       "                        <li><span class='label'>地址：</span><span class='materialPath'><a class='preview'>"+item.path+"</a></span></li>\n" +
                       "                        <li><span class='label'>参数：</span>【间隔<input class='loadStep' type='number' value="+MIN_DISPLAY_TIME+" disabled style='width: 50px'>秒】 【顺序<input class='orderIndex' type='number' value='1' style='width: 50px'>】</li>\n" +
                       "                    </ul>\n" +
                       "                    <div class='option'><button class='layui-btn layui-btn-sm layui-btn-danger delBtn'>删除</button></div>\n" +
                       "                </div>"))
               }
            });
        } else {
            layer.msg("请选择素材");
        }
    });

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

    //新增广告
    form.on("submit(addGroup)", function (data) {
        //弹出loading
        var index = top.layer.msg('数据提交中，请稍候', {icon: 16, time: false, shade: 0.8});
        $.ajax({
            url: $.cookie("tempUrl") + "ad/add_ad.do?token=" + $.cookie("token"),
            type: "POST",
            datatype: "application/json",
            contentType: "application/json;charset=utf-8",
            data: JSON.stringify({
                name: $(".adName").val(),
                groupid: $("#advertisingGroup").val()
            }),
            success: function (result) {
                if (result.httpStatus == 200) {
                    var tempAdId = result.data.ad.id;
                    var _list = materialData(tempAdId);
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                    $.ajax({
                        url: $.cookie("tempUrl") + "admaterial/batch_add_admaterial.do?token=" + $.cookie("token"),
                        type: "POST",
                        datatype: "application/json",
                        contentType: "application/json;charset=utf-8",
                        data: JSON.stringify(_list),
                        traditional: true,//这里设置为true
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
                        },
                        error: function (e) {
                            layer.alert("error，不能输入小数", {icon: 7, anim: 6});
                        }
                    });
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                } else {
                    layer.alert(result.exception, {icon: 7, anim: 6});
                }
            }
        });
        return false;
    });

    //点击预览广告按钮
    $("#adPreview").click(function (e) {
        e.preventDefault();
        var _list = materialDataPreview();
        sessionStorage.setItem("previewMaterial",JSON.stringify(_list));
        if(_list.length){
            var index = layui.layer.open({
                title: "预览广告",
                type: 2,
                area: ["820px", "530px"],
                //content: $('#content'),
                content: 'preview.html',
                shade: 0.8,
                shadeClose: true,
                success: function (layero, index) {
                    var body = layui.layer.getChildFrame('body', index);
                    setTimeout(function () {
                        layui.layer.tips('点击此处关闭', '.layui-layer-setwin .layui-layer-close', {
                            tips: 3
                        });
                    }, 500)
                }
            })
        }else {
            layer.msg("还没添加素材哦");
        }

    });
    
    function materialDataPreview() {
        var _list = [];
        var materials=$(".materialItem");
        $.each(materials,function (index,item) {
            var el = $(item);
            var obj = {
                "type": el.find(".type").text(),
                "materialPath": el.find(".materialPath").text(),
                "displayTime": parseInt(el.find(".displayTime").val()) >= MIN_DISPLAY_TIME ? parseInt(el.find(".displayTime").val()) : MIN_DISPLAY_TIME ,
                "loadStep": el.find(".loadStep").val(),
                "orderIndex": el.find(".orderIndex").val(),
                "musicPath": el.find(".musicPath").text()
            };
            _list.push(obj);
        });
        return _list;
    }

    function materialData(adId) {
        var _list = [];
        var materials=$(".materialItem");
        $.each(materials,function (index,item) {
            var el = $(item);
            var obj = {
                "adId": adId,
                "materialId": el.find(".materialId").text(),
                "displayTime": parseInt(el.find(".displayTime").val()) >= MIN_DISPLAY_TIME ? parseInt(el.find(".displayTime").val()) : MIN_DISPLAY_TIME  ,
                "loadStep": el.find(".loadStep").val(),
                "orderIndex": el.find(".orderIndex").val(),
                "musicPath": el.find(".musicPath").text()
            };
            _list.push(obj);
        });
        return _list;
    }

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