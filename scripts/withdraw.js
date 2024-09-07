// ПЕРЕМЕННЫЕ 
let current_withdrawal_section = "form"; // текущая выбранная секция вывода


// Получение данных из формы ввода 
function getInputData() {
    time = document.form.time.value;
    battery = document.form.battery.value;
    adress = document.form.adress.value;
    amount = document.form.amount.value;
    minimum = document.form.minimum.value;
    available = document.form.available.value;
    network_fee = document.form.network_fee.value;

    return [time, battery, adress, amount, minimum, available, network_fee];
};



// Округление чисел и добавление пробела в написании тысяч
function formatNumber(num) {
    // Преобразуем число в строку
    let numStr = Number(num).toFixed(2).toString();
    
    // Разделяем целую часть и дробную часть числа
    let [integerPart, decimalPart] = numStr.split('.');

    // Если дробной части нет, добавляем "00"
    if (!decimalPart) {
        decimalPart = '00';
    }

    // Добавляем пробел для более чем 4 цифр перед запятой
    if (integerPart.length > 3) {
        integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    }

    // Собираем и возвращаем итоговое значение
    return `${integerPart},${decimalPart}`;
}



// Перевод usdt в usd по определенным правилам вычитания и огругления
function usdtToUsd(num) {
    // Преобразуем число в строку и заменяем точку на запятую, если таковая есть
    let numStr = num.toString().replace('.', ',');

    // Функция для форматирования числа с пробелом перед последними тремя цифрами
    function formatWithSpace(numberStr) {
        let parts = numberStr.split(",");
        let integerPart = parts[0];
        if (integerPart.length >= 4) {
            let lastThreeDigits = integerPart.slice(-3);
            let rest = integerPart.slice(0, -3);
            integerPart = `${rest} ${lastThreeDigits}`;
        }
        return `${integerPart}${parts.length > 1 ? ',' + parts[1] : ''}`;
    }

    // Проверяем, есть ли запятая
    if (numStr.includes(",")) {
        let [beforeComma, afterComma] = numStr.split(",");

        // Если перед запятой одна цифра и она равна нулю
        if (beforeComma.length === 1 && beforeComma === "0") {
            if (afterComma.length > 0) {
                // Если после запятой есть цифры
                let afterCommaStr = afterComma.replace(/^0+/, ''); // Удаление ведущих нулей
                if (afterCommaStr.length > 0) {
                    let lastPart = afterCommaStr.slice(-1); // Последняя цифра
                    let restPart = afterCommaStr.slice(0, -1); // Остальная часть
                    let newLastPart = (parseInt(lastPart) - 1).toString(); // Уменьшение последней цифры на 1
                    
                    // Формируем строку с новой последней цифрой
                    let newAfterComma = restPart + newLastPart;
                    // Добавляем ведущие нули обратно
                    newAfterComma = newAfterComma.padStart(afterComma.length, '0');
                    return formatWithSpace(`${beforeComma},${newAfterComma}`);
                }
            }
        } else {
            // Если перед запятой одна или несколько цифр
            let twoDigits = afterComma.slice(0, 2); // Берем две первые цифры после запятой
            return formatWithSpace(`${beforeComma},${twoDigits}`);
        }
    } else {
        // Если после запятой нет цифр
        let result = (num - 0.01).toFixed(2).replace('.', ',');
        return formatWithSpace(result);
    }
}



// Смена выбранной секции вывода бинанс 
function changeWithdrawalSection() {
    current_withdrawal_section = document.form.withdrawal_section.value;
    sessionStorage.setItem("current_withdrawal_section", current_withdrawal_section);

    document.getElementById('form_bot_dashboard').classList.remove('current');
    document.getElementById('form_bot_settings').classList.remove('current');
    document.getElementById('bot_screen_dashboard').classList.remove('current');
    document.getElementById('bot_screen_settings').classList.remove('current');

    switch(current_withdrawal_section) {
        case "form":
            document.getElementById("form_bot_dashboard").classList.add('current');
            document.getElementById("bot_screen_dashboard").classList.add('current');
            document.getElementById('screenshot').style.backgroundImage = "url(../images/bot/dashboard-test.png)";
            break;
        case "details":
            document.getElementById("form_bot_settings").classList.add('current');
            document.getElementById("bot_screen_settings").classList.add('current');
            document.getElementById('screenshot').style.backgroundImage = "url(../images/bot/settings-test.png)";
            break;
    }
}



// Создание и сохранение скриншота
window.onload = function() {
    // Кнопка нажата
    document.getElementById("get_ss_btn").onclick = async function() {
        await generateScreenshot();
        
        // Конвертация html блока в png изображение
        html2canvas(document.getElementById("screenshot")).then(function(canvas) {
            let file_name = "withdraw_"+generateFileName() + ".png";
            const link = document.createElement('a');
            link.download = file_name;
            link.href = canvas.toDataURL("image/png");
            link.target = '_blank';
            link.click();
            link.delete;
        });
    };
}


// Формирование скриншота 
async function generateScreenshot () {
    // Получение данных из полей ввода 
    let [time, battery, adress, amount, minimum, available, network_fee] = getInputData(); 

    // Вычисление параметров
    let receive_amount = Number(amount) - Number(network_fee);
    minimum = `Withdrawal must be at least ${minimum} USDT.`
    let amount_in_usd = usdtToUsd(amount);
        
    // Отрисовка иконок верхнего правого угла айфона 
    let icons_url = "";
    switch (battery) {
        case "10":
            icons_url = "url(../images/icons/dark-blue/10.png)";
            break;
        case "50":
            icons_url = "url(../images/icons/dark-blue/50.png)";
            break;
        case "90":
            icons_url = "url(../images/icons/bldark-blueack/90.png)";
            break;
    }
    document.getElementById('iphone_icons').style.backgroundImage = icons_url;
        
    // Отрисовка времени айфона 
    document.getElementById("iphone_time").textContent = time;
        
    // Отрисовка тела скрина
    document.getElementById("adress").textContent = adress;
    document.getElementById("withdrawal_amount").textContent = amount;
    document.getElementById("withdrawal_amount_usd").textContent = `${amount_in_usd} USD`;
    document.getElementById("available").textContent = `${formatNumber(available)} USDT`;
    document.getElementById("minimum").textContent = minimum;
    document.getElementById("receive_amount").textContent = formatNumber(receive_amount);
    document.getElementById("network_fee").textContent = `${network_fee},00 USDT`;

    // замена фона скрина на "пустой"
    let image_url = "url(../images/binance/withdraw/work.png)"; 
    document.getElementById('screenshot').style.backgroundImage = image_url;
}