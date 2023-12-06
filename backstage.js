//訂單列表
const orderPageTable=document.querySelector(".orderPage-table");
//刪除全部訂單
const discardAllBtn=document.querySelector(".discardAllBtn");
//圖表
const productChart=document.querySelector(".productChart");
//自己的API path名
const apiPath="patrickpie";
//自己的API key
const apiKey="3m8TEvWaYobR4oG9CTcfM3SDakH2";

//渲染訂單列表
function renderOrderList(data){
    let orderData=data.orders;
    let str="";
    let trStr="";
    let orderProducts=[];

    // 當前無訂單的顯示
    if(orderData.length==0){
        str=`
        <thead>
            <tr>
                <th>訂單編號</th>
                <th>聯絡人</th>
                <th>聯絡地址</th>
                <th>電子郵件</th>
                <th>訂單品項</th>
                <th>總金額</th>
                <th>訂單日期</th>
                <th>訂單狀態</th>
                <th>操作</th>
            </tr>
        </thead>
        <tr>
            <td>目前無訂單</td>
        </tr>`;
        productChart.innerHTML=`<p>訂單產生時將會顯示圖表</p>`;

    }else{
        // 有訂單的顯示
        chartFunc(orderData);
        orderData.forEach(function(item){

            orderProducts=item.products;
            let orderProductsStr="";

            //每筆訂單裡的商品都要跑一遍
            orderProducts.forEach(function(pro){
                orderProductsStr+=
                `<p>${pro.title}($${pro.price})*${pro.quantity}</p>`
            })

            //訂單商品跑完後再渲染訂單
            let orderStatus="";
            if(item.paid){
                orderStatus="已處理";
            }else{
                orderStatus="未處理";
            }
            trStr+=`
            <tr>
                <td>${item.id}</td>
                <td>
                    <p>${item.user.name}</p>
                    <p>${item.user.tel}</p>
                </td>
                <td>${item.user.address}</td>
                <td>${item.user.email}</td>
                <td>
                    ${orderProductsStr}
                </td>
                <td>
                    ${item.total}
                </td>
                <td>${transferDate(item.createdAt)}</td>
                <td class="orderStatus">
                    <a href="#" class="orderStatusBtn" data-orderId="${item.id}">${orderStatus}</a>
                </td>
                <td>
                <input type="button" class="delSingleOrder-Btn" value="刪除" data-orderId="${item.id}">
                </td>
            </tr>`;

            //將訂單接回整個列表
            str=`
            <thead>
                <tr>
                    <th>訂單編號</th>
                    <th>聯絡人</th>
                    <th>聯絡地址</th>
                    <th>電子郵件</th>
                    <th>訂單品項</th>
                    <th>總金額</th>
                    <th>訂單日期</th>
                    <th>訂單狀態</th>
                    <th>操作</th>
                </tr>
            </thead>${trStr}`;
        })
    }
    

    

    orderPageTable.innerHTML=str;

}

//時間戳轉換一般認讀格式
function transferDate(timestamp) {

    let date = new Date(timestamp*1000);
    let year = date.getFullYear();
    let month = date.getMonth()+1; // 月份是從 0 開始的，所以要加 1
    let day = date.getDate();
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();

    return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
  };
  
// 取得目前訂單列表
function apiGetOrderList(){
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${apiPath}/orders`,{
        headers:{
            'Authorization':apiKey
        }
    })
    .then(function(res){
        renderOrderList(res.data);
    })
    .catch(function(err){
        console.log(err);
    })
}

// 修改訂單狀態
function apiEditOrderState(orderId,state){
    axios.put(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${apiPath}/orders`,{
        "data": {
          "id": orderId,
          "paid": state
        }  //在paid填入 true/false
      },{
        headers:{
            'Authorization':apiKey
        }
        })
    .then(function(res){
        renderOrderList(res.data);
    })
    .catch(function(err){
        console.log(err);
    })
}

// 刪除全部訂單
function apiDeleteOrderAll(){
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${apiPath}/orders`,{
        headers:{
            'Authorization':apiKey
        }
    })
    .then(function(res){
        renderOrderList(res.data);
        alert("訂單列表已清空");
    })
    .catch(function(err){
        console.log(err);
    })
}

// 刪除指定訂單
function apiDeleteOrder(orderId){
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${apiPath}/orders/${orderId}`,{
        headers:{
            'Authorization':apiKey
        }
    })
    .then(function(res){
        renderOrderList(res.data);
    })
    .catch(function(err){
        console.log(err);
    })
}

//產生圖表 （orderData為訂單陣列）
function chartFunc(orderData){
    let total={};

    //遍歷訂單
    orderData.forEach(function(order){
        //遍歷商品
        order.products.forEach(function(item){
            if(total[item.title]==undefined){
                total[item.title]=item.quantity;
            }else{
                total[item.title]+=item.quantity;
            }
        })
    })
    
    const productAry=Object.keys(total);
    let sortData=[];

    productAry.forEach(function(item){
        let obj={};
        obj.product=item;
        obj.quantity=total[item];
        sortData.push(obj);
    })

    //全部銷售商品將數量進行排序
    sortData.sort(function(a,b){
        return b.quantity - a.quantity ;
    })

    //將陣列包物件轉換成陣列包陣列
    let newData=[];
    sortData.forEach(function(item){
        let ary=[];
        ary.push(item.product);
        ary.push(item.quantity);
        newData.push(ary);
    })

    //再將第四筆之後的數值統計
    let elseQuatity=0;
    let chartData=[];

    if(newData.length>3){
        for(let i = 3; i < newData.length; i++){
            //取數量
            elseQuatity+=newData[i][1];
        }
        chartData[0]=newData[0];
        chartData[1]=newData[1];
        chartData[2]=newData[2];
        chartData[3]=["其他",elseQuatity];
    }else{
        chartData=newData;
    }

    
    console.log(chartData);

    
    let chart = c3.generate({

        bindto: '#chart', // HTML 元素綁定
        data: {
            type: "pie",
            columns: chartData,
            colors:{
                pattern: ['#E68619', '#26BFC7', '#5151D3', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5']
            }
        },
    });

}

// 初始訂單列表畫面
apiGetOrderList();

//已處理未處理監聽
orderPageTable.addEventListener("click",function(e){
    e.preventDefault();
    if(e.target.getAttribute("class")!=="orderStatusBtn"){
        return;
    }

    let orderId=e.target.getAttribute("data-orderId");

    if(e.target.text=="未處理"){
        apiEditOrderState(orderId,true);
    }else{
        apiEditOrderState(orderId,false);
    }
})

//刪除按鈕監聽
orderPageTable.addEventListener("click",function(e){
    e.preventDefault();
    if(e.target.getAttribute("class")!=="delSingleOrder-Btn"){
        return;
    }

    let orderId=e.target.getAttribute("data-orderId");
    apiDeleteOrder(orderId);
})

//刪除全部監聽
discardAllBtn.addEventListener("click",function(e){
    e.preventDefault();

    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${apiPath}/orders`,{
        headers:{
            'Authorization':apiKey
        }
    })
    .then(function(res){
        if(res.data.orders.length==0){
            alert("已無訂單可操作")
        }else{
            apiDeleteOrderAll();
        }
    })
    .catch(function(err){
        console.log(err);
    })
})