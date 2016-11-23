// $(function () {
//    $("body").css ("padding-top", $("#top-nav").height () + "px");
// });
$(function () {
    Cookies.remove('username');
    Cookies.remove('realname');
    Cookies.remove('password');
    Cookies.remove('email');
    Cookies.remove('typed-signup-msg');
    $('#btn-signup').on('click', function (event) {
        event.preventDefault();
        Cookies.set('username', $('#input-username').val());
        Cookies.set('realname', $('#input-realname').val());
        Cookies.set('password', $('#input-password').val());
        Cookies.set('email', $('#input-email').val());
        Cookies.set('typed-signup-msg', true);
        window.location = 'signup.html';
    });
});
