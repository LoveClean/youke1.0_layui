layui.use(['form', 'layer', 'table', 'laydate', 'laytpl'], function () {
    var form = layui.form,
        layer = parent.layer === undefined ? layui.layer : top.layer,
        $ = layui.jquery,
        laytpl = layui.laytpl,
        laydate = layui.laydate,
        table = layui.table;


    const MIN_DISPLAY_TIME = 2;
    //点击flash按钮事件
    $(document).on("click", "#flash", function () {
        window.location.reload();
    });

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

    //请选择开始日期
    laydate.render({
        elem: '.startDay',
        format: 'yyyy-MM-dd',
        trigger: 'click',
        max: 0,
        mark: {"0-1-1": "元旦"},
        done: function (value, date) {
            if (date.month === 1 && date.date === 1) { //点击每年12月15日，弹出提示语
                layer.msg('今天是元旦，新年快乐！');
            }
        }
    });
    //请选择截止日期
    laydate.render({
        elem: '.endDay',
        format: 'yyyy-MM-dd',
        trigger: 'click',
        max: 0,
        mark: {"0-1-1": "元旦"},
        done: function (value, date) {
            if (date.month === 1 && date.date === 1) { //点击每年12月15日，弹出提示语
                layer.msg('今天是元旦，新年快乐！');
            }
        }
    });
    //校验日期
    form.verify({
        startDay: function (value) {
            if (new Date(value) >= new Date($(".endDay").val())) {
                return "起始日期需小于截止日期！";
            }
        }
        // ,
        // endDay: function (value) {
        //     if (new Date(value) <= new Date($(".startDay").val())) {
        //         return "请选择截止日期！";
        //     }
        // }
    });

    //列表
    var tableIns = table.render({
        elem: '#userList',
        url: $.cookie("tempUrl") + 'ad/get_list.do',
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
        height: "full-125",
        limits: [5, 10, 15, 20, 25],
        limit: 10,
        id: "userListTable",
        cols: [[
            {field: 'id', title: '广告编号', width: 100, align: "center"},
            {field: 'name', title: '广告名称', minWidth: 120, align: "center"},
            {
                field: 'adMaterialVos', title: '广告素材', minWidth: 120, align: 'center', templet: function (d) {
                    var material = "";
                    var length = d.adMaterialVos.length;
                    $(d.adMaterialVos).each(function (index, element) {
                        var fileDir = element.materialPath;
                        material += " <a style='color: #01AAED' data-name='"+element.materialName+"' class='material' data-url='"+fileDir+"'>" + element.materialName + "</a>";
                        var spanT = "<span> — </span>"
                        index+1 === length ? material : material += spanT;
                    });

                    return material;
                }
            },
            {field: 'groupName', title: '分组名称', minWidth: 170, align: "center"},
            {title: '操作', minWidth: 100, templet: '#userListBar', fixed: "right", align: "center"}
        ]]
    });

    //点击material按钮事件
    $(document).on("click", ".material", function () {
        var photoReg = /\.jpg$|\.jpeg$|\.gif$/i;
        var videoReg = /\.avi$|\.mkv$|\.mp4$|\.mov$|\.flv$/i;
        var musicReg = /\.mp3$|\.wma$|\.flac$|\.aac$|\.wav$/i;
        var directReg = /\.m3u8$/i;

        var data = $(this).attr("data-url");
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
            title: $(this).attr("data-name"),
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


    //搜索
    form.on("submit(search_btn)", function (data) {
        var endDay = $(".endDay").val();
        if (endDay == null || endDay == "") {
            endDay = "2099-12-12"
        }
        var groupId = $("#advertisingGroup").val();
        if (groupId == null || groupId == "") {
            groupId = 0
        }
        table.reload("userListTable", {
            url: $.cookie("tempUrl") + 'ad/search_list.do',
            method: 'post',
            where: {
                beginTime: $(".startDay").val(),
                endTime: endDay,
                keyword: $(".searchVal").val(),
                groupId: groupId,
                token: $.cookie("token")
            },
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
            height: "full-125",
            limits: [5, 10, 15, 20, 25],
            limit: 10,
            id: "userListTable",
            cols: [[
                {field: 'id', title: '广告编号', width: 100, align: "center"},
                {field: 'name', title: '广告名称', minWidth: 120, align: "center"},
                {
                    field: 'adMaterialVos', title: '广告素材', minWidth: 120, align: 'center', templet: function (d) {
                        var material = "";
                        $(d.adMaterialVos).each(function (index, element) {
                            material += " <a style='color: #01AAED' class='material' data-name='" + element.materialName + "' data-url='" + element.materialPath + "'>" + element.materialName + "</a> ";
                        });

                        return material;
                    }
                },
                {field: 'groupName', title: '分组名称', minWidth: 170, align: "center"},
                {title: '操作', minWidth: 100, templet: '#userListBar', fixed: "right", align: "center"}
            ]]
        })
    });

    //点击新增按钮事件
    $(".addNews_btn").click(function () {
        var index = layui.layer.open({
            title: "制作新广告",
            type: 2,
            // area: ["600px", "500px"],
            // offset: ['30px', '270px'],
            content: "advertisingAdd.html",
            success: function (layero, index) {
                var body = layui.layer.getChildFrame('body', index);
                setTimeout(function () {
                    layui.layer.tips('点击此处返回列表', '.layui-layer-setwin .layui-layer-close', {
                        tips: 3
                    });
                }, 500)
            }
        });
        layui.layer.full(index);
        window.sessionStorage.setItem("index", index);
        //改变窗口大小时，重置弹窗的宽高，防止超出可视区域（如F12调出debug的操作）
        $(window).on("resize", function () {
            layui.layer.full(window.sessionStorage.getItem("index"));
        })
    });

    //编辑按钮
    function adUpd(edit) {
        sessionStorage.setItem("advertisingId",edit.id);
        var index = layui.layer.open({
            title: "编辑广告分组",
            type: 2,
            content: "advertisingUpd.html",
            success: function (layero, index) {
                var body = layui.layer.getChildFrame('body', index);
                if (edit) {
                    body.find(".adName").attr("data-id", edit.id);  //传id
                    body.find(".adName").val(edit.name);  //标题
                    body.find(".adName").attr("data-groupid", edit.groupid);  //广告分组
                    form.render();
                }
                setTimeout(function () {
                    layui.layer.tips('点击此处返回广告列表', '.layui-layer-setwin .layui-layer-close', {
                        tips: 3
                    });
                }, 500)
            }
        });
        layui.layer.full(index);
        window.sessionStorage.setItem("index", index);
        //改变窗口大小时，重置弹窗的宽高，防止超出可视区域（如F12调出debug的操作）
        $(window).on("resize", function () {
            layui.layer.full(window.sessionStorage.getItem("index"));
        });
    }

    //列表操作
    table.on('tool(userList)', function (obj) {
        var layEvent = obj.event,
            data = obj.data;

        if (layEvent === 'edit') { //编辑
            adUpd(data)
        } else if (layEvent === 'del') { //删除
            layer.confirm('确定删除此广告？', {icon: 3, title: '提示信息'}, function (index) {
                $.ajax({
                    url: $.cookie("tempUrl") + "ad/del_ad.do?token=" + $.cookie("token") + "&adId=" + data.id,
                    type: "POST",
                    success: function (result) {
                        layer.msg("删除成功");
                        obj.del();
                    }
                });
                layer.close(index);
            });
        } else if (layEvent === 'preview'){ //预览
            var _list = materialDataPreview(data);
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
        }
    });

    // content: [{id: 208, name: "测试12222", groupid: 1, groupName: "广告分组测试", editStatus: 1,…},…]
    // 0: {id: 208, name: "测试12222", groupid: 1, groupName: "广告分组测试", editStatus: 1,…}
    // adMaterialVos: [{id: 394, adId: 208, materialId: 325, materialName: "qqqqqq", materialType: "图片",…},…]
    // 0: {id: 394, adId: 208, materialId: 325, materialName: "qqqqqq", materialType: "图片",…}
    // adId: 208
    // displayTime: 2
    // id: 394
    // loadStep: 0
    // materialId: 325
    // materialName: "qqqqqq"
    // materialPath: "http://test45.bj.bcebos.com/201805181567e59b72.JPG"
    // materialType: "图片"
    // musicPath: "http://test45.bj.bcebos.com/201805181515151b83.mp3"
    // orderIndex: 1

    function materialDataPreview(data) {
        var _list = [];
        var materials=data.adMaterialVos;
        $.each(materials,function (index,item) {
            var obj = {
                "type": item.materialType,
                "materialPath": item.materialPath,
                "displayTime": parseInt(item.displayTime) >= MIN_DISPLAY_TIME ? parseInt(item.displayTime) : MIN_DISPLAY_TIME ,
                "loadStep": item.loadStep,
                "orderIndex": item.orderIndex,
                "musicPath": item.musicPath
            };
            _list.push(obj);
        });
        return _list;
    }
});
