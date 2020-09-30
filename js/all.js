//顯示資料用
function renderDay(){
    //判斷日期
    let date = new Date();
    let day = date.getDay();//取得星期(幾)
    let chineseDay = judeDayChinese(day); //丟到下面的function去變換成國字的數字，執行完後才會執行下一行的程式碼喔!
    //顯示日期到網頁
    let thisDay = date.getFullYear()+'-'+('0'+(date.getMonth()+1))+'-'+date.getDate();//抓出西元年月日
    //console.log(thisDay);
    document.querySelector('.jsDate span').textContent = chineseDay;//替換span內的文字
    document.querySelector('h3').textContent = thisDay;
    //判斷基數天OR偶數天，並顯示可以購買身分證符合資格的民眾
    if(day == 1|| day == 3|| day== 5){
        document.querySelector('.odd').style.display='block';
    }else if(day == 2|| day == 4|| day== 6){
        document.querySelector('.even').style.display='block';
    }else{
        document.querySelector('.sunDay').style.display='block';
    }
}
//工具類 函式 輸入東西>輸出內容
//數字轉換成國字
function judeDayChinese(day){
    if(day==2){
        return "二"
    }else if(day==0){
        return "日"
    }else if(day==1){
        return "一"
    }else if(day==3){
        return "三"
    }else if(day==4){
        return "四"
    }else if(day==5){
        return "五"
    }else if(day==6){
        return "六"
    }
}
function init(){
    renderDay();
    getData();
}
init();
let data;//撈回來的值賦予在data變數上
function getData(){
    let xhr=new XMLHttpRequest();    //開啟一個網路請求
    xhr.open('get','https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json',true); //我準備要跟某某伺服器，要藥局剩餘口罩資料
    xhr.send();    //執行要資料的動作
    xhr.onload = function(){ //當資料回傳後，下面語法就會自動觸發
        data=JSON.parse(xhr.responseText).features //資料回傳後是string格式要轉成物件陣列JSON格式
        let markers = L.markerClusterGroup().addTo(map); //在最底層上新增另一個"群組"圖層，將所有marker做個群組化
        for(let i =0;i<data.length;i++){       //獲取JSON資料中geometry物件的座標
            markers.addLayer(L.marker([data[i].geometry.coordinates[1],data[i].geometry.coordinates[0]], { icon: blueIcon}) //先抓精度再抓緯度
            .bindPopup(data[i].properties.name));   //針對這個marker加上 HTML內容進去
            //.closePopup();<-----預設要把它關閉 
        }
        map.addLayer(markers);
        renderList(data);
    }
}
function renderList(data){
    let ary = data;
    let opt = [];
    let str='';
    for(let i=0;i<ary.length;i++){
        opt.push(ary[i].properties.address.substr(0,3));
    }
    document.querySelector('.list').innerHTML=str;
    let result = opt.filter(function(element,index,array){
        return array.indexOf(element) === index;
    });
    //撈出的值，新增option標籤至HTML選單
    for(let i=0;i<result.length;i++){
        result.splice(23,1);  //刪除簡寫的選項
        result.splice(21,1); //、、
        let str = document.createElement('option');
        str.textContent = result[i];
        document.querySelector('.area').appendChild(str);
    }
}
//表單切換
let area = document.getElementById('areaId');
area.addEventListener('change',updateList,false);
function updateList(e){
    document.querySelector('.block').innerHTML="";
    let block = [];
    let ary = data;
    let select = e.target.value;
    for(let i=0;i<ary.length;i++){
        if(select === ary[i].properties.county){
                block.push(ary[i].properties.town);
            }
            var reBlock = block.filter(function(element,index,array){
                return array.indexOf(element) === index;
            });
        }
        for(let k=0;k<reBlock.length;k++){
            let index=reBlock.indexOf("");
            if(index>-1){
                reBlock.splice(index,1);
            }
            let btr = document.createElement('option');
        btr.textContent = reBlock[k];
        document.querySelector('.block').append(btr);
        }
}
let blockIm = document.getElementById("blockId");
blockIm.addEventListener('change',information,false);
function information(e){
    let str='';
    const ary = data;
    const sel = e.target.value;
    for(let i=0;i<ary.length;i++){
        if(sel === ary[i].properties.town){//這邊參考同學的寫法將座標的值用data-帶進眼睛icon的屬性內↓
            str+=
            `<li class="card">
                <i class="far fa-eye eyeinf" data-lat = "${data[i].geometry.coordinates[1]}" data-Lng = "${data[i].geometry.coordinates[0]}" data-name = "${data[i].properties.name}"></i>
                <h3>${ary[i].properties.name}</h3>
                <p>${ary[i].properties.address}</p>
                <p>${ary[i].properties.phone}</p>
                <span>${ary[i].properties.note}</span>
            <div class="allMask">
                <span class="adultMask">
                    成人口罩:${ary[i].properties.mask_adult}
                </span>
                <span class="childMask">
                    兒童口罩:${ary[i].properties.mask_child}
                </span>
            </div>
            </li>`
            }
    }
    document.querySelector('.list').innerHTML=str;
    let Zoom = document.querySelectorAll('.eyeinf');
    let maskList = document.querySelectorAll('.card');
    blockIm.addEventListener('change',gotoCounty,false);
    zoomIn(Zoom,maskList);  //"同學寫法"將組出來的HTML標籤中的Zoom和maskList帶到zoomIn這個function內
}
//定位至選定之鄉鎮
function gotoCounty(e){
    const setZoom = e.target.value;
    let targetLatLng = [];
    for(let i =0;i<data.length;i++){
        let townTarget = data[i].properties.town;
        let countyTarget = data[i].properties.county;
        let lat = data[i].geometry.coordinates[1];
        let lng = data[i].geometry.coordinates[0];
    if(townTarget == setZoom && countyTarget){
        targetLatLng =[lat,lng];
        }
    }
    map.setView(targetLatLng,16); 
}
function zoomIn(Zoom,maskList){
    for(let i = 0;i<maskList.length;i++){  //選定區域後出現的部分清單，用陣列去讀他全部的長度
        Zoom[i].addEventListener('click',function(e){
            let lat = e.target.dataset.lat;
            let lng = e.target.dataset.lng;
            let pharmacyName = e.target.dataset.name;
            let moveTo = [lat,lng];
            map.setView(moveTo,20);
            L.marker(moveTo)
            .addTo(map)
            .bindPopup(pharmacyName)
            .openPopup();
        },false);
    }
}
let map = L.map('map').fitWorld();
map.locate({
    setView: true,
    maxZoom: 20
});
map.on('locationfound', function (e) {
    let radius = e.accuracy / 2;
    L.marker(e.latlng,{icon:redIcon}).addTo(map).bindPopup("你的位置").openPopup();
    L.circle(e.latlng, radius).addTo(map);
});
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { //要用誰的圖資  這邊是使用Osm的圖資
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',//右下角的一些版權相關的文字
    id: 'mapbox/streets-v11',
}).addTo(map); //加入到上方map的變數的圖層內
const blueIcon = new L.Icon({
    iconUrl:'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    showUrl:'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1,-34],
    shadowSize: [41,41]
});
const redIcon = new L.Icon({
    iconUrl:'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    showUrl:'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1,-34],
    shadowSize: [41,41]
});