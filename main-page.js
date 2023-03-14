let guideElemId = 0;
let responce;
let searchRoutes;
let routeTemplate = document.querySelector('#route-template');
let searchGuides;
let itElemId = 0;
let guideTemplate = document.querySelector('#guide-template');


// List guide.language(active)
function createItemLang(guide) {
    var itemLang = document.createElement('option');
    let textOption = document.createTextNode(guide.language);
    itemLang.appendChild(textOption);
    return itemLang;
}

function renderLangSelect(guides) {
    let languageSelect = document.querySelector('#language-select');
    for (let i = 0; i < guides.length; i++) {
        languageSelect.append(createItemLang(guides[i]));
    }
}
//

//make new request(applic), 
function saveResponse(response) {
    responce = response;
    return responce;
}
//usages API(https://isdayoff.ru)  https://habr.com/ru/post/405519/
//checked weekend accessory
async function checkDate(date) {
    let excursionDate = document.querySelector('#excursion-date');
    let url = new URL(excursionDate.dataset.url);
    url.pathname = '/' + date;
    let repsonseFromServer = await fetch(url);
    let response = repsonseFromServer.json();
    return response;
}
//сounting func
async function calculateTotalPrice() {
    let totalPrice;
    let modalWindow = document.querySelector('.modal');
    let guideElement = document.getElementById(guideElemId);
    let itemPrice = guideElement.querySelector('.item-col-price-per-hour');
    let pricePerHourGuide = itemPrice.innerHTML.slice(-50, -4);
    let itemDuration = modalWindow.querySelector('#excursion-duration');
    let hours = itemDuration.value.slice(0, 1);
    let excursionDate = modalWindow.querySelector('#excursion-date').value;
    responce = await checkDate(excursionDate);
    let option2 = document.querySelector('#option-surdo-translator');
    let isThisDayOff = 1;

    if (responce == 1) {
        isThisDayOff = 1.5;
    }

    let excursionTime = modalWindow.querySelector('#excursion-time').value;
    let isItTime = 0;
    if (excursionTime >= '09:00' && excursionTime < '12:00') {
        isItTime = 400;
    } else
        if (excursionTime >= '20:00' && excursionTime < '23:00') {
            isItTime = 1000;
        }

    let countPeople = modalWindow.querySelector('#count-people').value;
    let numberOfVisitors = 0;
    if (countPeople >= 5 && countPeople <= 10) {
        numberOfVisitors = 1000;
        document.getElementById("option-surdo-translator").disabled = false;
    }
    else if (countPeople > 10 && countPeople <= 20) {
        numberOfVisitors = 1500;
        document.getElementById("option-surdo-translator").disabled = true;
        document.getElementById("option-surdo-translator").checked = false
    }
    else
        document.getElementById("option-surdo-translator").disabled = false;

    totalPrice = Math.round(pricePerHourGuide * hours * isThisDayOff + isItTime + numberOfVisitors);

    let option1 = document.querySelector('#option-quick-arrival');
    let increase1 = 0;
    if (option1.checked) {
        increase1 = (pricePerHourGuide * hours * isThisDayOff
            + isItTime + numberOfVisitors) * 0.3;
    }


    let increase2 = 0;
    if (option2.checked) {
        if (countPeople >= 5 && countPeople <= 10)
            increase2 = (pricePerHourGuide * hours * isThisDayOff + isItTime + numberOfVisitors) * 0.25;
        else
            increase2 = (pricePerHourGuide * hours * isThisDayOff + isItTime + numberOfVisitors) * 0.15;


    }

    let itemTotalPrice = modalWindow.querySelector('.total-price');
    let spanTotalPrice = itemTotalPrice.querySelector('span');
    spanTotalPrice.innerHTML = totalPrice + ' руб.';
    if (increase1 != 0 || increase2 != 0) {
        totalPrice = Math.round(totalPrice + increase1 + increase2);
        spanTotalPrice.innerHTML = totalPrice + ' руб.';
    }

}

//recalc handler(work after click in checkbox)
function optionFirstHandler(event) {
    let option = event.target.querySelector('#option-quick-arrival');
    calculateTotalPrice();
}

function optionSecondHandler(event) {
    let option = event.target.querySelector('#option-surdo-translator');
    calculateTotalPrice();
}
//alert
function showSuccessAlertHandler(event) {
    document.querySelector('.list-guide').style.display = 'none';
    let alertSuccess = document.querySelector('#alert-success');
    alertSuccess.style.display = 'block';
    alertSuccess.scrollIntoView();
}

function showErrorAlertHandler(event) {
    document.querySelector('.list-guide').style.display = 'none';
    let alertDanger = document.querySelector('#alert-danger-error');
    alertDanger.style.display = 'block';
    alertDanger.scrollIntoView();
}

//create modal window with pre data
function newOrderModal(guideElement) {
    let modalWindow = document.querySelector('.modal');
    let spanGuideName = modalWindow.querySelector('.guide-name');
    let itemSpanGuide = guideElement.querySelector('.item-col-name');
    spanGuideName.innerHTML = itemSpanGuide.innerHTML;
    console.log(spanGuideName);
    let routeElement = document.querySelector('.list-guide-h2');
    let spanRouteName = modalWindow.querySelector('.route-name');
    let itemSpanRoute = routeElement.querySelector('.name-route');
    spanRouteName.innerHTML = itemSpanRoute.innerHTML;


    calculateTotalPrice();
}

//

//Guides: handler, create, render and download
function changeGuideBtnHandler(event) {
    let itemElement = event.target.closest('.col');

    //disable btn(second clicks in one button)
    if (guideElemId == itemElement.id) {
        guideElemId = 0;
    } else
        //change btm(second clicks in another button)
        if (guideElemId != 0) {
            guideElemId = itemElement.id;
            newOrderModal(itemElement);
        } else {
            guideElemId = itemElement.id;
            newOrderModal(itemElement);
        }
}
//
//create guide list with pre requested data
function createGuideListItemElement(guide) {
    let itemElement = guideTemplate.content.firstElementChild.cloneNode(true);
    itemElement.id = 'guide' + guide.id;
    let name = itemElement.querySelector('.item-col-name');
    name.innerHTML = guide.name;
    let language = itemElement.querySelector('.item-col-language');
    language.innerHTML = guide.language;
    let experience = itemElement.querySelector('.item-col-experience');
    experience.innerHTML = guide.workExperience;
    let pricePerHour = itemElement.querySelector('.item-col-price-per-hour');
    pricePerHour.innerHTML = guide.pricePerHour + ' руб.';
    let changeBtnGuide = itemElement.querySelector('#change-btn-guide');
    changeBtnGuide.addEventListener('click', changeGuideBtnHandler);
    return itemElement;
}

function renderGuides(guides) {
    let itemBodyGuide = document.querySelector('.guide-elements');
    let bodyGuide = itemBodyGuide.querySelector('.row');
    bodyGuide.innerHTML = '';
    for (let i = 0; i < guides.length; i++) {
        bodyGuide.append(createGuideListItemElement(guides[i]));
    }
}
//http requests(guides)
function downloadGuides(route_id) {
    let guidesTable = document.querySelector('.guide-elements');
    let url = new URL(guidesTable.dataset.url);
    url.pathname = '/api/routes/' + route_id + '/guides';
    url.search = 'api_key=a68bcda9-3829-4cc9-9d9d-dbc122c68906';
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.responseType = 'json';
    xhr.onload = function () {
        searchGuides = this.response;
        renderGuides(this.response);
        renderLangSelect(this.response);
    };
    xhr.send();
}

// Create, render and handler routes 
function changeRouteBtnHandler(event) {
    let itemElement = event.target.closest('.card-route');
    document.querySelector('.list-guide').style.display = 'block';
    let span = document.querySelector('.name-route');
    if (itElemId == itemElement.id) {
        document.querySelector('.list-guide').style.display = 'none';
        itElemId = 0;
    } else
        if (itElemId != 0) {
            itElemId = itemElement.id;
            document.querySelector('.list-guide').style.display = 'block';
            document.querySelector('.list-guide').scrollIntoView();
            let name = itemElement.querySelector('.item-col-name');
            span.innerHTML = '«' + name.innerHTML + '»';
        } else {
            itElemId = itemElement.id;
            document.querySelector('.list-guide').scrollIntoView();
            let name = itemElement.querySelector('.item-col-name');
            span.innerHTML = '«' + name.innerHTML + '»';
        }
    downloadGuides(itemElement.id.slice(5));
}

function createRouteListItemElement(route) {
    let itemElement = routeTemplate.content.firstElementChild.cloneNode(true);
    itemElement.id = 'route' + route.id;
    let name = itemElement.querySelector('.item-col-name');
    name.innerHTML = route.name;
    let desc = itemElement.querySelector('.item-col-desc');
    desc.innerHTML = route.description;
    let mainObject = itemElement.querySelector('.item-col-mainobjects');
    mainObject.innerHTML = route.mainObject;
    let changeBtnRoute = itemElement.querySelector('#change-btn-route');
    changeBtnRoute.addEventListener('click', changeRouteBtnHandler);
    return itemElement;
}

function renderRoutes(routes, page) {
    let bodyRoute = document.querySelector('.route-elements');
    bodyRoute.innerHTML = '';
    let notesOnPage = 5;
    let start = (page - 1) * notesOnPage;
    let end = Math.min(routes.length, start + notesOnPage);
    for (let i = start; i < end; i++) {
        bodyRoute.append(createRouteListItemElement(routes[i]));
    }
}
//
// List mainObject(active)
function createItemObject(route) {
    var itemObject = document.createElement('option');
    let textOption = document.createTextNode(route.mainObject);
    itemObject.appendChild(textOption);
    return itemObject;
}

function renderObjectSelect(routes) {
    let objectSelect = document.querySelector('#object-select');

    for (let i = 0; i < routes.length; i++) {
        objectSelect.append(createItemObject(routes[i]));
    }
}
//
//pagination handler(usages render)
function paginationItemHandler(event) {
    renderRoutes(searchRoutes, event.target.innerText);
}

function createPaginationItem(routes) {
    let countOfItems = Math.ceil(routes.length / 5);
    let items = [];
    let ulPages = document.querySelector('.pagination-routes');
    ulPages.innerHTML = '';
    for (let i = 1; i <= countOfItems; i++) {
        let pageItem = document.createElement('li');
        pageItem.classList.add('page-item');
        let aHrefPage = document.createElement('a');
        aHrefPage.classList.add('page-link');
        aHrefPage.innerHTML = i;
        pageItem.append(aHrefPage);
        ulPages.appendChild(pageItem);
        items.push(pageItem);
        pageItem.onclick = paginationItemHandler;
    }
    return items;
}
// http requests(routes)
function downloadRoutes() {
    let routesTable = document.querySelector('.route-elements');
    let url = new URL(routesTable.dataset.url);
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.responseType = 'json';
    xhr.onload = function () {
        searchRoutes = this.response;
        renderRoutes(this.response, 1);
        renderObjectSelect(this.response);
        createPaginationItem(this.response);
    };
    xhr.send();
}

//http requests(post to API) and response(alert)
async function postOrder(event) {
    let sendOrderBtn = document.querySelector('#send-order');
    let url = new URL(sendOrderBtn.dataset.url);

    let modalWindow = document.querySelector('.modal');
    let formInputs = modalWindow.querySelector('form').elements;
    let guide_id = document.getElementById(guideElemId).id.slice(5);
    let route_id = document.getElementById(itElemId).id.slice(5);
    let date = formInputs['excursion-date'].value;
    let time = formInputs['excursion-time'].value;
    let duration = formInputs['excursion-duration'].value.slice(0, 1);
    let persons = formInputs['count-people'].value;
    let optionFirst = formInputs['option-quick-arrival'].checked ? 1 : 0;
    let optionSecond = formInputs['option-surdo-translator'].checked ? 1 : 0;
    let itemPrice = modalWindow.querySelector('.total-price');
    let itemPriceSpan = itemPrice.querySelector('span');
    let price = itemPriceSpan.innerHTML.slice(-50, -4);

    let formData = new FormData();
    formData.append('guide_id', guide_id);
    formData.append('route_id', route_id);
    formData.append('date', date);
    formData.append('time', time);
    formData.append('duration', duration);
    formData.append('persons', persons);
    formData.append('optionFirst', optionFirst);
    formData.append('optionSecond', optionSecond);
    formData.append('price', price);

    let responce = await fetch(url, { method: 'POST', body: formData });

    if (responce.ok) {
        showSuccessAlertHandler();
    } else
        if (responce.status == '422') {
            showErrorAlertHandler();
        }

    modalWindow.querySelector('form').reset();



}
//

//search routes(handler)
function searchRouteHandler(event) {
    let name = document.querySelector('#searchOfName');
    let object = document.querySelector('#object-select');
    let routes = searchRoutes;
    console.log(routes);

    if (object.value != 'Не выбрано') {
        routes = routes.filter(
            route => route.mainObject.includes(object.value));
    }

    if (name.value != '') {
        routes = routes.filter(route => route.name.includes(name.value));
    }

    renderRoutes(routes, 1);
}
//

//search guides(handler)
function searchGuideHandler(event) {
    let from = document.querySelector('.from');
    let to = document.querySelector('.to');
    let language = document.querySelector('#language-select');
    let guides = searchGuides;

    if (language.value != 'Не выбрано') {
        guides = guides.filter(
            guide => guide.language.includes(language.value));
    }

    if (from.value != '') {
        guides = guides.filter(guide => guide.workExperience >= from.value);
    }
    if (to.value != '')
        guides = guides.filter(guide => guide.workExperience <= to.value);

    renderGuides(guides);
}
//

//onload func
window.onload = function () {
    downloadRoutes();
    document.querySelector('.from').onchange = searchGuideHandler;
    document.querySelector('.to').onchange = searchGuideHandler;
    document.querySelector('#language-select').onchange = searchGuideHandler;
    document.querySelector('#searchOfName').oninput = searchRouteHandler;
    document.querySelector('#object-select').onchange = searchRouteHandler;
    let optionQuickArrival = document.querySelector('#option-quick-arrival');
    optionQuickArrival.onclick = optionFirstHandler;
    document.querySelector('#option-surdo-translator').onclick = optionSecondHandler;
    let form = document.querySelector('.modal').querySelector('form');
    form.onchange = calculateTotalPrice;

    document.querySelector('#send-order').onclick = postOrder;
};
//