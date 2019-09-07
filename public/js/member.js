// Load member.pug 時，去拿 user 的資料
app.ajax('GET', 'api/user/profile', '', { 'Authorization': `Bearer ${window.localStorage.getItem('auth')}` }, function (req) {
    // token 無效或過期，要重新登入
    if (req.status !== 200) {
        console.log(`error happen: error code is ${req.status}`);
        window.localStorage.removeItem('auth');
        window.location.href = './'; // 否則 .html 會一直重新導向，測試完要拿掉
    }
    let user = JSON.parse(req.responseText).user;
    console.log(user);


    if (user.picture) {
        app.get('.left-profile img').src = user.picture;
    }
    if (user.name) {
        app.get('.left-name').innerHTML = user.name;
        app.get('.personal-info input.name').placeholder = user.name;
    }
    if (user.phone) {
        app.get('.personal-info input.phone').placeholder = user.phone;
    }
    if (user.picture) {
        if (user.provider === 'native') app.get('.left-profile img').src = `./user-pic/${user.picture}`;
        else app.get('.left-profile img').src = user.picture;
    }
    app.get('.login-info p').innerHTML = user.email;
    app.get('.login-info #user-id').innerHTML = user.id;
});
// logout setting
logout();
function logout() {
    console.log(app.get('.logout'));
    app.get('.logout').addEventListener('click', function () {
        window.localStorage.removeItem('auth');
        window.localStorage.removeItem('picture');
        if (window.localStorage.getItem('provider') === 'facebook') {
            FB.api('/me/permissions', 'delete', function (res) {
            });
        }
        // window.location.href = 'adoption?kind=all&paging=0';
    });
}

function updateProfile() {
    let inputName = app.get('.personal-info input.name').value;
    let inputPhone = app.get('.personal-info input.phone').value;
    let uploadImg = app.get('.upload-img').files[0];
    let id = app.get('#user-id').innerHTML;
    if (inputName || inputPhone || uploadImg) {
        let formData = new FormData();
        if (uploadImg) {
            var newfile = new File([uploadImg], id + ".jpg", { type: "image/jpeg" });
            formData.append('upload-img', newfile);
        }
        if (inputName) formData.append('inputName', inputName);
        if (inputPhone) formData.append('inputPhone', inputPhone);
        formData.append('userId', id);
        app.ajaxFormData('api/user/update', formData, function (req) {
            if (req.status === 500) console.log(`error happen: error code is ${req.status}`);
            else location.reload('member');
        });
    }


}