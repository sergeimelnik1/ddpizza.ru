$(document).ready(function() {
    var tabBtnAttr = 'data-tab-btn';
    var tabBodyAttr = 'data-tab-body';
    var tabBtns = document.querySelectorAll(`[${tabBtnAttr}]`);
    var switchBtn = $('[data-switch]');
    var switchBody = $('[data-switcher]');

    for (var i = 0; i < tabBtns.length; i++) {
        tabBtns[i].addEventListener('click', tabClick);
    }

    function tabClick(event) {
        event.preventDefault();
        var currentTab = this;
        var currentTabName = currentTab.getAttribute(tabBtnAttr);
        var currentBody = document.querySelector(`[${tabBodyAttr}="${currentTabName}"]`);

        for (var e = 0; e < currentTab.parentElement.children.length; e++) {
            currentTab.parentElement.children[e].classList.remove('active');
        }
        for (var e = 0; e < currentBody.parentElement.children.length; e++) {
            currentBody.parentElement.children[e].classList.remove('active');
        }

        currentTab.classList.add('active');
        currentBody.classList.add('active');
    }

    $(switchBtn).click(function() {
        $(switchBody).toggleClass("active");
    })
});
