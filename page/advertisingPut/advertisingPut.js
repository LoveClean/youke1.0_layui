layui.config({
    base: "../../js/"
}).extend({
    "address": "address"
});
layui.use(['form', 'layer', 'table', 'laydate', 'laytpl', "address", 'util'], function () {
    var form = layui.form,
        layer = parent.layer === undefined ? layui.layer : top.layer,
        $ = layui.jquery,
        laytpl = layui.laytpl,
        laydate = layui.laydate,
        table = layui.table;
    address = layui.address;
    util = layui.util;

    //获取省信息
    address.provinces();

    //获取设备分组
    $.ajax({
        url: $.cookie("tempUrl") + "devicegroup/get_group.do?token=" + $.cookie("token"),
        type: "POST",
        success: function (result) {
            $.each(result.data,
                function (index, item) {
                    $("#equipment").append($('<option value=' + item.id + '>' + item.name + '</option>'));
                });
            form.render();
        }
    });

    //根据地区加载楼宇
    form.on('select(area)', function (data) {
        $("#buildFlag").removeAttr("disabled");
        var buildEl = $("#build");
        buildEl.empty();
        buildEl.append($("<option value=''>请选择楼宇</option>"));
        form.render('select');
        if (data.value === "") {
            $("#buildFlag").attr("disabled", true);
            buildEl.attr("disabled", "");
            form.render('select');
        } else {
            $.ajax({
                url: $.cookie("tempUrl") + "building/get_building_areaId.do?token=" + $.cookie("token"),
                type: "POST",
                //dataType: "application/json",
                contentType: "application/json;charset=utf-8",
                data: data.value,
                success: function (d) {
                    var builds = d.data;
                    if (builds !== null) {
                        $.each(builds, function (index, item) {
                            buildEl.append($("<option value=" + item.id + ">" + item.name + "</option>"))
                        });
                        buildEl.removeAttr("disabled");
                        form.render('select'); //更新 lay-filter="test2" 所在容器内的全部 select 状态
                    }
                },
                error: function () {
                    console.log("请求ERROR");
                }
            })
        }
    });


    form.on('select(type)', function (data) {
        // console.log(data.elem); //得到select原始DOM对象
        // console.log(data.value); //得到被选中的值
        // console.log(data.othis); //得到美化后的DOM对象
        if (data.value === "1") {
            $("#equipmentNav").css("display", "none");
            $("#buildNav").css("display","inline-block");
        } else if(data.value === "0") {
            $("#buildNav").css("display", "none");
            $("#equipmentNav").css("display","inline-block");
        } else {
            $("#equipmentNav").css("display", "none");
            $("#buildNav").css("display", "none");
        }
    });

    //列表
    var tableIns = table.render({
        elem: '#dataList',
        url: $.cookie("tempUrl") + 'addelivery/list_delivery.do',
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
        id: "dataList",
        cols: [[
            {type:'checkbox' ,fixed:'left', width:50},
            {field: 'adid', title: '节目编号', width: 100, align: "center"},
            {field: 'adName', title: '广告名称', minWidth: 120, align: "center"},
            {field: 'cityName', title: '投放城市', minWidth: 120, align: "center"},
            {field: 'areaName', title: '投放区域', minWidth: 120, align: "center"},
            {field: 'buildingOrGroupName', title: '楼宇 / 设备分组', minWidth: 120, align: "center"},
            {
                field: 'begintime', title: '开始时间', minWidth: 120, align: 'center', templet: function (d) {
                    return util.toDateString(d.begintime)
                }
            },
            {
                field: 'endtime', title: '结束时间', minWidth: 120, align: 'center', templet: function (d) {
                    return util.toDateString(d.endtime)
                }
            },
            {title: '操作', minWidth: 100, templet: '#userListBar', fixed: "right", align: "center"}
        ]]
    });

    //搜索
    form.on("submit(search_btn)", function (data) {
        var groupId,areaId,deliveryType=$("#type").val();
        if (deliveryType === "0") {
            groupId = $("#equipment").val()
        } else if (deliveryType === "1") {
            groupId = $("#build").val()
        } else {
            groupId = "";
        }
        if(data.field.area===""){
            if(data.field.city===""){
                areaId=data.field.province;
            }else {
                areaId=data.field.city;
            }
        }else {
            areaId=data.field.area;
        }
        table.reload("dataList", {
            url: $.cookie("tempUrl") + 'addelivery/search_delivery2.do',
            method: 'post',
            where: {
                areaId: areaId,
                deliveryType: deliveryType,
                groupId: groupId,
                token: $.cookie("token")
            }
        })
    });

    //点击flash按钮事件
    $(document).on("click", "#flash", function () {
        window.location.reload();
    });

    // 按楼宇投放
    $("#putBuild_btn").click(function () {
        var index = layui.layer.open({
            title: "按楼宇投放",
            type: 2,
            area: ["700px", "500px"],
            content: "advertisingPutAdd.html",
            shade: 0.8,
            shadeClose: true,
            success: function (layero, index) {

            }
        })
    });

    // 按设备分组投放
    $("#putGroup_btn").click(function () {
        var index = layui.layer.open({
            title: "按设备分组投放",
            type: 2,
            area: ["700px", "500px"],
            content: "advertisingPutAddTwo.html",
            shade: 0.8,
            shadeClose: true,
            success: function (layero, index) {

            }
        })
    });

    //批量删除
    $("#delAll_btn").click(function () {
        let delList= table.checkStatus('dataList'); //dataList 即为基础参数 id 对应的值
        if(delList.data.length){
            console.log(delList.data) //获取选中行的数据
            console.log(delList.isAll ) //表格是否全选
            let advertisingIds="";
            $.each(delList.data,function (index,item) {
                advertisingIds+=item.id+',';
            });
            console.log(advertisingIds);
            layer.confirm('确定进行批量删除？', {icon: 3, title: '提示信息'}, function (index) {
                $.ajax({
                    url: $.cookie("tempUrl") + "addelivery/batch_delete.do?token=" + $.cookie("token")+"&ids="+advertisingIds.substring(0,advertisingIds.length-1),
                    type: "POST",
                    success: function (result) {
                        layer.msg("删除成功");
                        window.location.href = "advertisingPut.html";
                    }
                });
                tableIns.reload();
                layer.close(index);
            });
        }
    });

    //列表操作
    table.on('tool(dataList)', function (obj) {
        let layEvent = obj.event,
            data = obj.data;

        if (layEvent === 'edit') { //编辑
            edit(data);
        } else if (layEvent === 'del') { //删除
            layer.confirm('确定删除此广告投放？', {icon: 3, title: '提示信息'}, function (index) {
                $.ajax({
                    url: $.cookie("tempUrl") + "addelivery/delete.do?token=" + $.cookie("token") + "&id=" + data.id,
                    type: "POST",
                    success: function (result) {
                        if(result.httpStatus===200){
                            layer.msg("删除成功");
                            obj.del();
                            layer.close(index);
                        }
                    },
                    error: function () {
                        layer.msg('删除失败');
                        layer.close(index);
                    }
                });
            });
        }
    });

    function edit(data) {
        sessionStorage.setItem("areaId",data.areaid);
        sessionStorage.setItem("dateTime",util.toDateString(data.begintime)+" ~ "+util.toDateString(data.endtime));
        if(data.delivertype===1){
            sessionStorage.setItem("buildingId",data.buildingOrGroupId);
            var index = layui.layer.open({
                title: "修改楼宇投放",
                type: 2,
                area: ["600px", "400px"],
                content: "advertisingPutUpt.html",
                shade: 0.8,
                shadeClose: true,
                success: function (layero, index) {
                    var body = layui.layer.getChildFrame('body', index);
                    body.find("#build").attr("data-id",data.id)
                    setTimeout(function () {
                        layui.layer.tips('点击此处关闭', '.layui-layer-setwin .layui-layer-close', {
                            tips: 3
                        });
                    }, 500)
                }
            })
        }else {
            sessionStorage.setItem("groupId",data.buildingOrGroupId);
            var index = layui.layer.open({
                title: "修改设备分组投放",
                type: 2,
                area: ["600px", "400px"],
                content: "advertisingPutUptTwo.html",
                shade: 0.8,
                shadeClose: true,
                success: function (layero, index) {
                    var body = layui.layer.getChildFrame('body', index);
                    body.find("#group").attr("data-id",data.id)
                    setTimeout(function () {
                        layui.layer.tips('点击此处关闭', '.layui-layer-setwin .layui-layer-close', {
                            tips: 3
                        });
                    }, 500)
                }
            })
        }
    }


});