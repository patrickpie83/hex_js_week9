// 產品列表
const productWrap=document.querySelector(".productWrap");
const productSelect=document.querySelector(".productSelect");
//購物車列表
const shoppingCartTable=document.querySelector(".shoppingCart-table");
//訂單資訊
const customerName=document.querySelector("#customerName");
const customerPhone=document.querySelector("#customerPhone");
const customerEmail=document.querySelector("#customerEmail");
const customerAddress=document.querySelector("#customerAddress");
const tradeWay=document.querySelector("#tradeWay");
const sendOrderBtn=document.querySelector(".sendOrderBtn");
const orderInfoForm=document.querySelector(".orderInfo-form");
//自己的API path名
const apiPath="patrickpie";
const _url=`https://livejs-api.hexschool.io/api/livejs/v1/customer/${apiPath}`;

let data=[];
let cartData={};

// 渲染商品列表
function renderProduct(data){
    let str="";
    data.forEach(function(item){
        str+=`<li class="productCard">
        <h4 class="productType">新品</h4>
        <img src="${item.images}" alt="">
        <a href="#" class="addCardBtn" data-btn="addCart" data-id="${item.id}">加入購物車</a>
        <h3>${item.title}</h3>
        <del class="originPrice">NT$${item.origin_price}</del>
        <p class="nowPrice">NT$${item.price}</p>
    </li>`
    })
    productWrap.innerHTML=str;
;}

//取得產品列表
function apiGetProductsList(){
    axios.get(`${_url}/products`)
    .then(function(res){
        data=res.data.products;
        renderProduct(data);
    })
    .catch(function(err){
        console.log(err);
    })
}

//渲染購物車列表
function renderCart(data){
    // data為物件
    //carts為陣列
    let carts=data.carts;

    if(carts.length==0){
        shoppingCartTable.innerHTML=`<p style="color: #301E5F;">購物車目前是空的</p>`;
    }else{
        //表格內會變動的區塊
        let trStr="";

        carts.forEach(function(item){
            let subTotal=item.product.price*item.quantity;
            trStr+=`
            <tr>            
                <td>
                    <div class="cardItem-title">
                        <img src="${item.product.images}" alt="">
                        <p>${item.product.title}</p>
                    </div>
                </td>
                <td>NT$${item.product.price}</td>
                <td>
                    <input class="cartItemQuantity" type="number" min="1" value="${item.quantity}" data-cartId="${item.id}">
                </td>
                <td>NT$${subTotal}</td>
                <td class="discardBtn">
                    <a href="#" class="material-icons" data-cartId="${item.id}">
                        clear
                    </a>
                </td>
            </tr>`
        })

        // 整個表格內容
        let str=`<tr>
            <th width="40%">品項</th>
            <th width="15%">單價</th>
            <th width="15%">數量</th>
            <th width="15%">金額</th>
            <th width="15%"></th>
            </tr>
            ${trStr}
            <tr>
                <td>
                    <a href="#" class="discardAllBtn">刪除所有品項</a>
                </td>
                <td></td>
                <td></td>
                <td>
                    <p>總金額</p>
                </td>
                <td>NT$${data.finalTotal}</td>
            </tr>`

        shoppingCartTable.innerHTML=str;
            }
    
}

// 取得購物車內容
function apiGetCart(){
    axios.get(`${_url}/carts`)
    .then(function(res){
        cartData=res.data;
        renderCart(cartData);
    })
    .catch(function(err){
        console.log(err);
    })
}

// 加入購物車
// 加入資料後會自動計算pirce(折扣售價) 跟origin_price(原價)
function apiAddCart(id){
    
    //先判斷目前購物車已有商品
    axios.get(`${_url}/carts`)
    .then(function(res){

        let cartAlready=res.data.carts;
        let cartAlreadyQuantity=0;

        //若購物車已有此件要加入的商品id，則抓其當前數量
        cartAlready.forEach(function(item){
            if(item.product.id==id){
                cartAlreadyQuantity=item.quantity;
            }
        })

        //再把要加入購物車的商品id與1個數量加進去
        axios.post(`${_url}/carts`,{
            "data": {                               //格式不可變更
                "productId": id, //填入productId ， quantity 
                "quantity": cartAlreadyQuantity+1
              }
        })
        .then(function(res){
            apiGetCart();
        })
        .catch(function(err){
            console.log(err);
        })


    })
    .catch(function(err){
        console.log(err);
    })

}

// 修改購物車數量
function apiEditCart(id,num){

    axios.patch(`${_url}/carts`,{
        "data": {                               //格式不可變更
            "id": id,       //會覆蓋原數量 //非productId ，此為購物車中的id，故不可寫入 非購物車中的品項
            "quantity": num
          }
    })
    .then(function(res){
        renderCart(res.data);
    })
    .catch(function(err){
        console.log(err);
    })
}

// 清空購物車
function apiDeleteCartAll(){
    axios.delete(`${_url}/carts`)
    .then(function(res){
        renderCart(res.data);
    })
    .catch(function(err){
        console.log(err);
    })
}

// 刪除購物車指定品項
function apiDeleteCartProduct(cartId){
    //填入要刪除的購物車id
    axios.delete(`${_url}/carts/${cartId}`)
    .then(function(res){
        renderCart(res.data);
    })
    .catch(function(err){
        console.log(err);
    })
}

// 送出訂單
// 寫入user資訊時，會自動將商品資訊、狀態、訂單id等一起產生(會回傳)
// 且購物車會清空
function apiSendOrder(name,tel,email,address,payment){

    axios.get(`${_url}/carts`)
    .then(function(res){
        let carts=res.data.carts;
        if(carts.length==0){
            alert("尚未挑選商品，無法送出訂單！")
        }else{
            axios.post(`${_url}/orders`,{
                "data": {                        //以下欄位皆為必填，注意型別問題 
                    "user": {
                    "name": name,
                    "tel": tel,
                    "email": email,
                    "address": address,
                    "payment": payment
                    }
                }
            })
            .then(function(res){
                orderInfoForm.reset();
                alert("訂單已送出");
                apiGetCart();
            })
            .catch(function(err){
                console.log(err);
            })
        }
    })
    .catch(function(err){
        console.log(err);
    })
    
}



// 初始商品列表
apiGetProductsList();

// 初始購物車列表
apiGetCart();


//篩選功能監聽
productSelect.addEventListener("change",function(e){
    let filterData=[];
    if(e.target.value=="全部"){
        renderProduct(data);
    }else{
        data.forEach(function(item){
            if(item.category==e.target.value){
                filterData.push(item);
            }
        })
        renderProduct(filterData);
    };
})

// 加入購物車監聽
productWrap.addEventListener("click",function(e){
    e.preventDefault();
    if(e.target.getAttribute("data-btn") !== "addCart" ){
        return;
    }
    apiAddCart(e.target.getAttribute("data-id"));
})

//購物車數量修改監聽
////****發問：這邊寫監聽事件click在整個購物車，但數量調整的input若用鍵盤輸入該如何監聽？ */
shoppingCartTable.addEventListener("click",function(e){
    e.preventDefault();
    if(e.target.getAttribute("class") !== "cartItemQuantity" ){
        return;
    }else{
        //帶上購物車id與數量參數
        let editCartId=e.target.getAttribute("data-cartId");
        let editCartQuantity=Number(e.target.value);
        apiEditCart(editCartId,editCartQuantity)
    }
})

//刪除指定品項監聽
shoppingCartTable.addEventListener("click",function(e){
    e.preventDefault();
    if(e.target.getAttribute("class")!=="material-icons"){
        return;
    }else{
        apiDeleteCartProduct(e.target.getAttribute("data-cartId"));
    }
})

//清空購物車監聽
shoppingCartTable.addEventListener("click",function(e){
    e.preventDefault();
    if(e.target.getAttribute("class") !== "discardAllBtn"){
        return;
    }else{
        alert("將清空購物車");
        apiDeleteCartAll();
    }
})

//訂單送出監聽
sendOrderBtn.addEventListener("click",function(e){
    e.preventDefault();
    let nameValue = customerName.value;
    let telValue = customerPhone.value;
    let emailValue = customerEmail.value;
    let addressValue = customerAddress.value;
    let paymentValue = tradeWay.value;

    if(nameValue == false || telValue == false || emailValue == false || addressValue == false ){
        alert("請填寫完整預訂資料");
    }else{
        apiSendOrder(nameValue,telValue,emailValue,addressValue,paymentValue);
    }


})