// Переменные значений позиции 
let time = "";
let battery = "";
let coin = "";
let longshort = ""; 
let leverage = "";
let position_size = "";
let entry_price = "";
let mark_price = "";
let value = "";
let margin = "";
let liq_price = "";
let take_profit = "";
let unr_pnl = "";
let unr_pnl_percent = "";
let unr_pnl_rounded = "";
let r_pnl = "";
let r_pnl_rounded = "";

// Цвета
let text_color_red = "#CD5C61";
let text_color_green = "#42A17F";

// Технические переменные 
let charactersAfterDot = 0; // количество цифр после точки 


// Постоянное получение актуальной цены монеты 
function getCoinPrice() {
    coin = document.myform.coin.value;
    console.log("-- попытка запроса к api --", coin);
    if (coin != "") {
        coin = document.myform.coin.value + "USDT";
        const url = "https://api.binance.com/api/v3/ticker/price?symbol=" + coin;
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.responseType = 'json';
        xhr.send();
        xhr.onload = () => {
            mark_price = parseFloat(xhr.response.price);
            //console.log(coin, ": ", mark_price);
        };
    };
}
setInterval(getCoinPrice, 2000); // каждые 2,5 секунды  



// получение данных из формы ввода 
function getInputData() {
    time = document.myform.time.value;
    battery = document.myform.battery.value;
    coin = document.myform.coin.value + "USDT";
    longshort = document.myform.longshort.value 
    leverage = parseFloat(document.myform.leverage.value);
    margin = parseFloat(document.myform.margin.value.replace(",", ""));
    liq_price = document.myform.liq_price.value;
    take_profit = document.myform.take_profit.value;
    
    entry_price = document.myform.entry_price.value;
    if (entry_price.toString().includes(".")) {
        charactersAfterDot = entry_price.toString().split( '.' ).pop().length; // кол-во цифр после точки 
    } else {
        charactersAfterDot = 2;
    }
    entry_price = parseFloat(entry_price.replace(",", ""));
};


// тестовоe калькулирование PNL 
function testCalculation() {
    getInputData(); // получение данных из формы
    
    // рассчет 
    value = margin * leverage;  
    position_size = value / entry_price;
    unr_pnl = (mark_price - entry_price) * position_size;
    unr_pnl_percent = (unr_pnl / margin) * 100;
    
    // визуал 
    unr_pnl = unr_pnl.toFixed(4);
    unr_pnl_percent = unr_pnl_percent.toFixed(2); 
    
    document.getElementById("unr_pnl_example").textContent = addComma(unr_pnl) + " USDT " + "(" + unr_pnl_percent + "%)";
}


// Создание и сохранение скриншота
window.onload = function() {
        
    // Кнопка нажата
    document.getElementById("get_ss_btn").onclick = function() {
        generateScreenshot();
        
        html2canvas(document.getElementById("screenshot")).then(function(canvas) {
            
            let file_name = "position_"+generateFileName() + ".png";
            
            const link = document.createElement('a');
            link.download = file_name;
            link.href = canvas.toDataURL("image/png");
            link.target = '_blank';
            link.click();
            link.delete;
        });
    };
}


function generateScreenshot () {
    getInputData(); // получение данных из формы
    
    // Вычисление значений по формулам 
    value = margin * leverage;  
    position_size = value / entry_price;
    unr_pnl = (mark_price - entry_price) * position_size;
    unr_pnl_percent = (unr_pnl / margin) * 100; 
    r_pnl = margin * 0.01;

    
    // Визуальное формирование вывода  
    entry_price = parseFloat(entry_price).toFixed(charactersAfterDot);
    mark_price = addComma(parseFloat(mark_price).toFixed(charactersAfterDot));
    
    entry_price = addComma(entry_price);
    value = addComma(value.toFixed(4));
    unr_pnl = unr_pnl.toFixed(4);
    position_size = position_size.toFixed(2);
    unr_pnl_percent = unr_pnl_percent.toFixed(2); 
    unr_pnl_rounded = parseFloat(unr_pnl).toFixed(2);
    r_pnl = parseFloat(r_pnl).toFixed(4) + " USDT";
    r_pnl_rounded = parseFloat(r_pnl).toFixed(2);
    margin = addComma(margin) + " USDT";
    

    // Отрисовка элементов в зависимости от Long / Short
    if (longshort == "Long") {
        document.getElementById("longshort").textContent = "Long";
        document.getElementById("longshort").style.backgroundColor = "#1A2C27";
        document.getElementById("longshort").style.color = "#20B26C";
        document.getElementById("position_size").style.color = text_color_green;
    } else if (longshort == "Short") {
        document.getElementById("longshort").textContent = "Short";
        document.getElementById("longshort").style.backgroundColor = "#331E22";
        document.getElementById("longshort").style.color = "#EF454A";
        document.getElementById("position_size").style.color = text_color_red;
    }
    
    
    //  отрисовка иконок верхнего правого угла экрана айфона 
    let icons_url = "";
    switch (battery) {
        case "10":
            icons_url = "url(../images/icons/gray/10.png)";
            break;
        case "50":
            icons_url = "url(../images/icons/gray/50.png)";
            break;
        case "90":
            icons_url = "url(../images/icons/gray/90.png)";
            break;
    }
    document.getElementById('iphone_icons').style.backgroundImage = icons_url;
    
    
    // отрисовка тейк профита
    console.log(take_profit);
    if (take_profit == "") {
         document.getElementById("tp").style.opacity = "0";
         document.getElementById("tp_plug").style.opacity = "100";
    } else if (take_profit != "") {
         document.getElementById("tp").style.opacity = "100";
         document.getElementById("tp_plug").style.opacity = "0";
    };
    
    document.getElementById("tp_value").style.color = text_color_green;
    
    
    
    // Настройка отображения PnL в зависимости от Long / Short и наличия минуса 
    if (longshort == "Long") {
        if (String(unr_pnl)[0] == "-") {
            document.getElementById("unr_pnl").style.color = text_color_red;
            document.getElementById("unr_pnl_rounded").style.color = text_color_red;
        } else if (String(unr_pnl)[0] != "-") {
            document.getElementById("unr_pnl").style.color = text_color_green;
            document.getElementById("unr_pnl_rounded").style.color = text_color_green;
        };
    } else if (longshort == "Short") {
        if (String(unr_pnl)[0] != "-") {
            unr_pnl = "-" + unr_pnl;
            unr_pnl_percent = "-" + unr_pnl_percent;
            unr_pnl_rounded = "-" + unr_pnl_rounded;
            document.getElementById("unr_pnl").style.color = text_color_red;
            document.getElementById("unr_pnl_rounded").style.color = text_color_red;
        } else if (String(unr_pnl)[0] == "-") {
            unr_pnl = unr_pnl.slice(1);
            unr_pnl_percent = unr_pnl_percent.slice(1);
            unr_pnl_rounded = unr_pnl_rounded.slice(1);
            document.getElementById("unr_pnl").style.color = text_color_green;
            document.getElementById("unr_pnl_rounded").style.color = text_color_green;
        };
    };
    

    // Отрисовка шапки позиции
    document.getElementById("iphone_time").textContent = time;
    document.getElementById("coin").textContent = coin;
    document.getElementById("leverage").textContent = "Cross " + leverage + ".00x";
    
    // Отрисовка тела позиции
    document.getElementById("position_size").textContent = position_size;
    document.getElementById("entry_price").textContent = entry_price;
    document.getElementById("mark_price").textContent = mark_price;
    document.getElementById("liq_price").textContent = liq_price;
    document.getElementById("value").textContent = value;
    document.getElementById("unr_pnl").textContent = addComma(unr_pnl) + " USDT " + "(" + unr_pnl_percent + "%)";
    document.getElementById("unr_pnl_rounded").textContent = "≈ " + unr_pnl_rounded + " USD";
    document.getElementById("r_pnl").textContent = r_pnl;
    document.getElementById("r_pnl_rounded").textContent = "≈ " + r_pnl_rounded + " USD";
    document.getElementById("margin").textContent = margin;
    document.getElementById("tp_value").textContent = take_profit;
    
        
    // замена фона скрина 
    let image_url = "url(../images/position/work.png)"; 
    document.getElementById('screenshot').style.backgroundImage = image_url;
    
}



