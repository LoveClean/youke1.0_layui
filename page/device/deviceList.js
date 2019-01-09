layui.config({
    base: "../../js/"
}).extend({
    "address": "address"
})
layui.use(['form', 'layer', 'table', "address"], function () {
    var form = layui.form,
        layer = parent.layer === undefined ? layui.layer : top.layer,
        $ = layui.jquery,
        laytpl = layui.laytpl,
        laydate = layui.laydate,
        table = layui.table;
    address = layui.address;

    //下拉框数据
    var groups;//分组
    var groupsEl="";
    var specs;//规格
    var specsEl="";
    var types;//类型
    var typesEl="";
    var brands;//品牌
    var brandsEl="";
    var isload = false;


    function pageInit(){
        //获取省信息
        address.provinces();
        //获取设备分组信息
        getGroup();
        getSpec();
        getBrand();
    }
    //设备类型map
    var typeMap = new Map();
    $.ajax({
        url: $.cookie("tempUrl") + "devicetype/get_list.do?token=" + $.cookie("token"),
        type: "GET",
        //dataType: "application/json",
        success: function (d) {
            types = d.data;
            if (types !== null) {
                $.each(types, function (index, item) {
                    typeMap.set(item.id,item.name);
                    typesEl+="<option value=" + item.id + ">" + item.name + "</option>"
                });
            }
        }
    });


    //根据地区加载楼宇
    form.on('select(area)', function (data) {
        var buildEl = $("#build");
        buildEl.empty();
        buildEl.append($("<option value=''>请选择楼宇</option>"));
        form.render('select');
        if (data.value === "") {
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
                    alert("请求ERROR");
                }
            })
        }
    });

    //loding
    layer.load();
    //列表渲染
    table.render({
        elem: '#dataList',
        url: $.cookie("tempUrl") + 'device/get_list.do',
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
        loading: true,
        height: "full-125",
        limits: [5, 10, 15, 20, 25],
        limit: 10,
        id: "dataTable",
        cols: [[
            {field: 'id', title: 'ID', width: 75, align: "center", sort: true},
            {field: 'code', title: '设备编号', minWidth: 100, align: "center"},
            {field: 'mac', title: 'MAC地址', minWidth: 120, align: "center"},
            {
                field: 'type', title: '类型', minWidth: 120, align: "center", templet: function (d) {
                    return typeMap.get(parseInt(d.type));
                }
            },
            {field: 'spec', title: '尺寸', width: 75, align: "center"},
            {field: 'groupName', title: '设备分组', minWidth: 100, align: "center"},
            {field: 'areaFullName', title: '地区', minWidth: 170, align: 'center'},
            {field: 'buildingName', title: '楼宇(社区)', minWidth: 170, align: "center"},
            {field: 'address', title: '详细地址', minWidth: 170, align: "center"},
            {field: 'option' , title: '操作', minWidth: 180, templet: '#option', fixed: "right", align: "center"}
        ]],
        done: function () {
            layer.closeAll('loading');
            pageInit();
        }
    });

    //搜索
    form.on("submit(search_btn)", function (data) {
        layer.load();
        table.reload("dataTable", {
            url: $.cookie("tempUrl") + 'device/search.do',
            method: 'post',
            where: {
                cityId: data.field.city,
                areaId: data.field.area,
                buildingId: data.field.build === "" ? 0 : data.field.build,
                groupId: data.field.deviceGroup === "" ? 0 : data.field.deviceGroup,
                token: $.cookie("token")
            },
            done: function () {
                layer.closeAll('loading');
            }
        })
    });

    //点击flash按钮事件
    $(document).on("click", "#flash", function () {
        window.location.reload();
    });


    //点击新增按钮事件
    $(".addNews_btn").click(function () {
        var index = layui.layer.open({
            title: "新增设备",
            type: 2,
            area: ["700px", "400px"],
            content: "deviceAdd.html",
            shade: 0.8,
            shadeClose: true,
            success: function (layero, index) {
                if(!isload){
                    if (brands !== null) {
                        $.each(brands, function (index, item) {
                            brandsEl+="<option value=" + item.brand + ">" + item.brand + "</option>"
                        });
                    }
                    if (specs !== null) {
                        $.each(specs, function (index, item) {
                            specsEl+="<option value=" + item.spec + ">" + item.spec + "</option>"
                        });
                    }
                    isload=true;
                }
                var body = layui.layer.getChildFrame('body', index);
                body.find("#group").append($(groupsEl));
                body.find("#type").append($(typesEl));
                body.find("#spec").append($(specsEl));
                body.find("#brand").append($(brandsEl));
                form.render("select");
                setTimeout(function () {
                    layui.layer.tips('点击此处关闭', '.layui-layer-setwin .layui-layer-close', {
                        tips: 3
                    });
                }, 500)
            }
        })
    });

    //点击编辑按钮
    function edit(data){
        sessionStorage.setItem("areaId",data.areaid);
        sessionStorage.setItem("buildingId",data.buildingid);
        var index = layui.layer.open({
            title: "编辑设备",
            type: 2,
            area: ["700px", "400px"],
            content: "deviceUpt.html",
            shade: 0.8,
            shadeClose: true,
            success: function (layero, index) {
                if(!isload){
                    if (brands !== null) {
                        $.each(brands, function (index, item) {
                            brandsEl+="<option value=" + item.brand + ">" + item.brand + "</option>"
                        });
                    }
                    if (specs !== null) {
                        $.each(specs, function (index, item) {
                            specsEl+="<option value=" + item.spec + ">" + item.spec + "</option>"
                        });
                    }
                    isload=true;
                }

                var body = layui.layer.getChildFrame('body', index);
                body.find("#code").val(data.code).attr("data-id",data.id);
                body.find("#mac").val(data.mac);
                body.find("#group").append($(groupsEl)).val(data.groupid);
                body.find("#type").append($(typesEl)).val(data.type);;
                body.find("#spec").append($(specsEl)).val(data.spec);;
                body.find("#brand").append($(brandsEl)).val(data.brand);;
                form.render("select");
                setTimeout(function () {
                    layui.layer.tips('点击此处关闭', '.layui-layer-setwin .layui-layer-close', {
                        tips: 3
                    });
                }, 500)
            }
        })
    }



    //列表操作
    table.on('tool(dataList)', function (obj) {
        var layEvent = obj.event,
            data = obj.data;
        if (layEvent === 'edit') { //编辑
            edit(data);
        } else if (layEvent === 'del') { //删除
            layer.confirm('确定删除此设备？', {icon: 3, title: '提示信息'}, function (index) {
                $.ajax({
                    url: $.cookie("tempUrl") + "device/delete.do?token=" + $.cookie("token")+"&id="+data.id,
                    type: "POST",
                    success: function (result) {
                        if(result.httpStatus===200){
                            layer.msg("删除成功");
                            obj.del();
                            layer.close(index);
                        }
                    },
                    error: function () {
                        console.log('删除失败');
                    }
                });
            });
        } else if (layEvent === 'unbound') {
            layer.confirm('确定将该设备解绑？', {icon: 3, title: '提示信息'}, function (index) {
                $.ajax({
                    url: $.cookie("tempUrl") + "device/unbound.do?token=" + $.cookie("token")+"&id="+data.id,
                    type: "POST",
                    success: function (result) {
                        if(result.httpStatus===200){
                            layer.msg("解绑成功");
                            obj.update({
                                mac:"",
                            });
                            obj.tr.find("button:eq(2)").addClass("layui-btn-disabled").attr("lay-event","");
                            layer.close(index);
                        }
                    },
                    error: function () {
                        layer.msg('解绑失败');
                    }
                });
            });
        }
    });

    function getSpec() {
        $.ajax({
            url: $.cookie("tempUrl") + "devicespec/get_list.do?token=" + $.cookie("token"),
            type: "GET",
            success: function (d) {
                specs = d.data;
                console.log("1111");
            }
        });
    }

    function getBrand() {
        $.ajax({
            url: $.cookie("tempUrl") + "devicebrand/get_list.do?token=" + $.cookie("token"),
            type: "GET",
            success: function (d) {
                brands = d.data;
                console.log("2222");
            }
        });
    }

    function getGroup() {
        $.ajax({
            url: $.cookie("tempUrl") + "devicegroup/get_group.do?token=" + $.cookie("token"),
            type: "POST",
            data: "",
            success: function (d) {
                groups = d.data;
                if (groups !== null) {
                    $.each(groups, function (index, item) {
                        groupsEl+="<option value=" + item.id + ">" + item.name + "</option>"
                    });
                    $("#deviceGroup").append($(groupsEl));
                    form.render('select'); //更新 lay-filter="test2" 所在容器内的全部 select 状态
                }
            },
            error: function () {
                alert("请求ERROR");
            }
        })
    }


});
