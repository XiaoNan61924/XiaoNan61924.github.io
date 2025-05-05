// 导航栏隐藏下拉显示
document.addEventListener('DOMContentLoaded', function() {
    var navbar = document.querySelector('.navbar');
    // 页面加载时默认隐藏导航栏
    navbar.classList.add('navbar-hide');
    navbar.classList.remove('navbar-show');
    window.addEventListener('scroll', function() {
        var st = window.pageYOffset || document.documentElement.scrollTop;
        if (st <= 0) {
            // 在顶部时隐藏
            navbar.classList.remove('navbar-show');
            navbar.classList.add('navbar-hide');
        } else {
            // 只要不是顶部就显示
            navbar.classList.remove('navbar-hide');
            navbar.classList.add('navbar-show');
        }
    });
});

// 下拉过渡动画
window.addEventListener('scroll', function() {
    if(window.scrollY > 10) {
        document.body.classList.add('scrolled');
    } else {
        document.body.classList.remove('scrolled');
    }
});
document.addEventListener('DOMContentLoaded', function() {
    var aboutAvatar = document.querySelector('.about-avatar');
    if (aboutAvatar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 10) {
                aboutAvatar.classList.add('show');
            } else {
                aboutAvatar.classList.remove('show');
            }
        });
    }
});
