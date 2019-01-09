layui.use(['form', 'layer', 'table'], function () {
    var table = layui.table;
    var form = layui.form,
        layer = parent.layer === undefined ? layui.layer : top.layer,
        $ = layui.jquery

    //系统日志
    table.render({
        elem: '#logs',
        url: $.cookie("tempUrl") + '/manager/records',
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
        limit: 15,
        limits: [10, 15, 20, 25],
        id: "systemLog",
        cols: [[
            {field: 'id', title: 'ID', minWidth: 150, align: "left"},
            {field: 'account', title: '工号', minWidth: 100, width:120, align:"left"},
            {field: 'remoteIP', title: '请求IP', minWidth: 210, width:210, align:"left"},
            {field: 'requesturl', title: '操作详情', align: 'left', minWidth: 130},
            {field: 'createtime', title: '操作时间', minWidth: 70, align: "left"}
        ]]
    });

    form.verify({
        judge: function(value, item){ //value：表单的值、item：表单的DOM对象
            if($("#adminId").val() === "" && $("#email").val() === ""){
                return '工号和邮箱必须填其中一个';
            }
        }
    });

    //搜索
    form.on("submit(search_btn)", function (data) {
        table.reload("systemLog", {
            url: $.cookie("tempUrl") + '/manager/search_syslog.do',
            method: 'post',
            where: {
                account:$("#adminId").val(),
                email:$("#email").val(),
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
            limit: 15,
            id: "systemLog",
            cols: [[
                {field: 'id', title: 'ID', minWidth: 150, align: "left"},
                {field: 'account', title: '工号', minWidth: 100, width: 120, align: "left"},
                {field: 'remoteIP', title: '请求IP', minWidth: 210, width: 210, align: "left"},
                {field: 'requesturl', title: '操作详情', align: 'left', minWidth: 130},
                {field: 'createtime', title: '操作时间', minWidth: 70, align: "left"}
            ]]
        })
    });

    //点击flash按钮事件
    $(document).on("click", "#flash", function () {
        window.location.reload();
    });


})
