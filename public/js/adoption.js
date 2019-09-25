const urlParams = new URLSearchParams(window.location.search);
let kind = urlParams.get('kind');
let paging = parseInt(urlParams.get('paging'));
if (paging == null) paging = 0;
let sex = urlParams.get('sex');
let region = urlParams.get('region');
let order = urlParams.get('order');
let age = urlParams.get('age');

let userId = Number.parseInt(window.localStorage.getItem('user-id'));
let token = window.localStorage.getItem('auth');

function searchActive(kind, sex, region, order, age) {
    if (kind && kind !== 'all') {
        app.get(`.kind label.${kind}`).classList.add('active');
    }
    if (sex) app.get(`.sex label.${sex}`).classList.add('active');
    if (region) {
        region = region.split(',');
        region.forEach(function (element) {
            app.get(`.county label._${element}`).classList.add('active');
        });
    }
    if (!order) app.get('.order label.asc').classList.add('active');
    else if (order === 'desc') app.get('.order label.desc').classList.add('active');
    if (age) {
        age = age.split(',');
        if (age.length === 2) age.forEach(function (ele) {
            app.get(`.age label.${ele}`).classList.add('active');
        });
        else app.get(`.age label.${age}`).classList.add('active');
    }
}
searchActive(kind, sex, region, order, age);
function queryString(sex, region, order, age, paging) {
    let url = '';
    if (sex) url = `sex=${sex}&`;
    if (region) url = url.concat(`region=${region}&`);
    if (order === 'desc') url = url.concat(`order=${order}&`);
    if (age) url = url.concat(`age=${age}&`);
    url = url.concat(`paging=${paging}`);
    // if (region && sex) url = `sex=${sex}&region=${region}&`;
    // else if (region) url = `region=${region}&`;
    // else if (sex) url = `sex=${sex}&`;
    // if (order === 'desc') url = url.concat(`order=${order}&`);
    // url = url.concat(`paging=${paging}`);
    return url;

}

app.ajax('GET', `api/adoption/${kind}`, queryString(sex, region, order, age, paging), {}, function (req) {
    let data = JSON.parse(req.responseText).data;
    const pet_list = app.get('.pet-list');
    for (let i = 0; i < data.length; i++) {
        let pet_img;
        let title;
        let item = app.createElement('div', { atrs: { className: 'item' } }, pet_list);
        let img_wrap = app.createElement('div', { atrs: { className: 'img-wrap' } }, item);
        if (data[i].image[0].length == 0) pet_img = app.createElement('img', { atrs: { className: 'pet-img', src: './imgs/pet-null.jpg' } }, img_wrap);
        else {
            if (data[i].db === 3) pet_img = app.createElement('img', { atrs: { className: `pet-img petId_${data[i].id}`, src: `./pet-img/${data[i].image[0]}` } }, img_wrap);
            else pet_img = app.createElement('img', { atrs: { className: 'pet-img', src: data[i].image[0] } }, img_wrap);
        }
        pet_img.addEventListener('click', function () {
            app.get('.pet-details').style.display = 'block';
            app.loadPetDetails(data[i].id);
        });
        let text_wrap = app.createElement('div', { atrs: { className: 'text-wrap' } }, item);
        if (data[i].title.length == 0) {
            let stayDay = app.dateConversion(data[i].opendate);
            title = app.createElement('h2', { atrs: { className: 'title', innerHTML: `在收容所待 ${stayDay} 天，可以帶我回家嗎？` } }, text_wrap);
        }
        else title = app.createElement('h2', { atrs: { className: 'title', innerHTML: data[i].title } }, text_wrap);
        let profile = app.createElement('div', { atrs: { className: 'profile' } }, text_wrap);
        let county = app.createElement('div', { atrs: { className: 'county' } }, profile);
        app.createElement('h4', { atrs: { innerHTML: '地區' } }, county);
        app.createElement('span', { atrs: { innerHTML: app.countryTable(data[i].county) } }, county);
        let age = app.createElement('div', { atrs: { className: 'age' } }, profile);
        app.createElement('h4', { atrs: { innerHTML: '年齡' } }, age);
        app.createElement('span', { atrs: { innerHTML: app.ageTable(data[i].age, data[i].kind) } }, age);
        let name = app.createElement('div', { atrs: { className: 'name' } }, profile);
        app.createElement('h4', { atrs: { innerHTML: '姓名' } }, name);
        if (data[i].petName) {
            // if (data[i].petName.length >= 11)
            // app.createElement('span', { atrs: { innerHTML: data[i].petName.substring(11, -1) } }, name);
            app.createElement('span', { atrs: { innerHTML: data[i].petName } }, name);
        }
        let sex = app.createElement('div', { atrs: { className: 'sex' } }, profile);
        app.createElement('h4', { atrs: { innerHTML: '性別' } }, sex);
        app.createElement('span', { atrs: { innerHTML: app.sexTable(data[i].sex) } }, sex);
        let color = app.createElement('div', { atrs: { className: 'color' } }, profile);
        app.createElement('h4', { atrs: { innerHTML: '顏色' } }, color);
        app.createElement('span', { atrs: { innerHTML: data[i].color } }, color);
        // btn-setting
        let btnWrap = app.createElement('div', { atrs: { className: 'btn-wrap' } }, profile);
        if (data[i].db === 3) {
            let wantAdoption = app.createElement('button', { atrs: { className: `wantAdoption petId_${data[i].id} receiver_${data[i].user_id} receiverName_${data[i].contactName}`, innerHTML: '我要認養' } }, btnWrap);
            wantAdoption.addEventListener('click', adoptionMessage);
        }
        let attentionBtn = app.createElement('button', { atrs: { className: `attention petId_${data[i].id}`, innerHTML: '加入關注' } }, btnWrap);
        attentionBtn.addEventListener('click', addAttention);
        app.createElement('div', { atrs: { className: 'line' } }, pet_list);
        // app.createElement('button', { arts: { innerHTML: '認養我', type: 'submit' } }, pet_list);
    }
});

// app.ajax('GET', `api/adoption/count?kind=${kind}`, {}, function (req) {
app.ajax('GET', 'api/adoption/count', `kind=${kind}&${queryString(sex, region, order, age, paging)}`, {}, function (req) {
    let lastPage = JSON.parse(req.responseText).lastPage;
    const pagination = app.get('.pagination');
    app.createElement('a', { atrs: { href: `/adoption?kind=${kind}&${queryString(sex, region, order, age, 0)}`, innerHTML: '«第一頁' } }, pagination);
    app.createElement('a', { atrs: { href: `/adoption?kind=${kind}&${queryString(sex, region, order, age, paging > 0 ? paging - 1 : 0)}`, innerHTML: '«上一頁' } }, pagination);
    let paging_list = app.createElement('div', { atrs: { className: 'paging-list' } }, pagination);
    for (let i = Math.floor(paging / 10) * 10; i < Math.floor(paging / 10) * 10 + 10 && i <= lastPage; i++) {
        if (i === paging) app.createElement('a', { atrs: { className: 'active', href: `/adoption?kind=${kind}&${queryString(sex, region, order, age, i)}`, innerHTML: i + 1 } }, paging_list);
        else app.createElement('a', { atrs: { href: `/adoption?kind=${kind}&${queryString(sex, region, order, age, i)}`, innerHTML: i + 1 } }, paging_list);
    }
    app.createElement('a', { atrs: { href: `/adoption?kind=${kind}&${queryString(sex, region, order, age, paging < lastPage ? paging + 1 : lastPage)}`, innerHTML: '下一頁›' } }, pagination);
    app.createElement('a', { atrs: { href: `/adoption?kind=${kind}&${queryString(sex, region, order, age, lastPage)}`, innerHTML: '最後一頁»' } }, pagination);
});

function adoptionMessage() {
    let userId = Number.parseInt(window.localStorage.getItem('user-id'));
    if (!userId) {
        if (confirm('「我要認養」功能需要會員/註冊登入才能使用喔！')) {
            app.get('.login-page').style.display = 'block';
        }
        else;// do nothing
    }
    else if (userId) {
        let classNames = this.className.split(' ');
        let receiverId = Number.parseInt(classNames[2].replace('receiver_', ''));
        if (receiverId === userId) window.alert('不能傳訊息給自己喔！');
        else {
            let petId = Number.parseInt(classNames[1].replace('petId_', ''));
            let contactName = classNames[3].replace('receiverName_', '');
            let sendMegWrap = app.get('.sendMeg-wrap');
            app.get('.mask').style.display = 'block';
            // close setting
            // closeSetting('.sendMeg-wrap .close-msg', '.sendMeg-wrap');
            sendMegWrap.style.display = 'flex';
            let imgPath = app.get(`.${classNames[1]}`).src;
            app.get('.sendMeg-wrap .img-wrap .pet-img').src = `${imgPath}`;
            app.get('.sendMeg-wrap .msg-wrap .contactName').innerHTML = `傳訊息給 ${contactName}：`;
            // let msgSend = app.createElement('button',);
            let msgSend = app.get('button.msg-send');
            msgSend.setAttribute('class', `msg-send petId_${petId} receiverId_${receiverId} receiverName_${contactName}`);
            app.get('button.msg-send').addEventListener('click', sendMessage);

            document.addEventListener('keyup', function () {
                if (event.keyCode === 27) {
                    // Cancel the default action, if needed
                    event.preventDefault();
                    // Trigger the button element with a click
                    app.get('input.close-msg').click();
                }
            });
        }
    }

}
function sendMessage() {
    let classNames = this.className.split(' ');
    let petId = Number.parseInt(classNames[1].replace('petId_', ''));
    let receiverId = Number.parseInt(classNames[2].replace('receiverId_', ''));
    let receiverName = classNames[3].replace('receiverName_', '');
    let message = app.get('.sendMeg-wrap .msg-wrap textarea').value;
    let senderId = Number.parseInt(window.localStorage.getItem('user-id'));
    let senderName = window.localStorage.getItem('name');
    app.ajax('POST', 'api/user/sendMessage', { senderId, receiverId, petId, message, senderName, receiverName, createTime: new Date().getTime() }, {}, function (req) {
        if (req.status === 500) app.get('.sendMeg-wrap .error-msg').innerHTML = '伺服器錯誤，請稍後再試';
        else {
            // console.log(senderId, receiverId, petId, message, new Date());
            app.get('.sendMeg-wrap input.close-msg').click(); // 關閉視窗避免使用者重新傳遞訊息
        }
    });
}

function closeMessage() {
    app.get('.mask').style.display = 'none';
    app.get('.sendMeg-wrap').style.display = 'none';
    app.get('button.msg-send').removeEventListener('click', sendMessage);
    app.get('.sendMeg-wrap .msg-wrap textarea').value = '';
}
function addAttention() {
    let userId = Number.parseInt(window.localStorage.getItem('user-id'));
    if (!userId) {
        if (confirm('「加入關注」功能需要會員/註冊登入才能使用喔！')) {
            app.get('.login-page').style.display = 'block';
        }
        else;// do nothing
    }
    else {
        let classNames = this.className.split(' ');
        let petId = classNames[1].replace('petId_', '');
        let userId = window.localStorage.getItem('user-id');
        if (classNames.length >= 3) // 因為有 active
        {
            app.ajax('POST', 'api/user/deleteAttention', { petId, userId }, {}, function (req) {
                if (req.status === 200) {
                    app.get(`button.attention.petId_${petId}`).innerHTML = '加入關注';
                    app.get(`button.attention.petId_${petId}`).classList.remove('active');
                }
            });
        }
        else {
            app.ajax('POST', 'api/user/addAttention', { petId, userId }, {}, function (req) {
                if (req.status === 200) {
                    app.get(`button.attention.petId_${petId}`).innerHTML = '取消關注';
                    app.get(`button.attention.petId_${petId}`).classList.add('active');
                }
            });
        }
    }
}
// for 加入關注功能，為了要讓已登入的使用者，再加入關注時，重整仍可看到已加入關注的按鈕為灰色
function initAttentionBtn() {
    if (userId && token) {
        app.ajax('GET', 'api/user/getAttentionList', '', { Authorization: `Bearer ${token}` }, function (req) {
            let data = JSON.parse(req.responseText).data;
            data.forEach(function (ele) {
                app.get(`button.attention.petId_${ele.pet_id}`).classList.add('active');
                app.get(`button.attention.petId_${ele.pet_id}`).innerHTML = '取消關注';
            })
        });
    }
}
initAttentionBtn();