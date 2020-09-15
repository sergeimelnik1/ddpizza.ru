<?//setCoolie('VISITED', 3600*24*7);
if(!$_COOKIE['VISITED']){
    setcookie('VISITED', 3600*24*30, time() + 3600*24*30, '/');
    $_COOKIE['VISITED'] = true;?>
    <script>
        if(window.getClientWidth() > 1024){
            $(document).ready(function () {
                setTimeout(function () {
                    $(".tutorial").click();
                }, 1500)
            });
        }
    </script>
<?}else{

}?>

<?/*$APPLICATION->IncludeComponent("citfact:form", "", Array(
    "ID" => "3",
    "ALIAS_FIELDS" => array("UF_NAME" => "NameAlias", "UF_PHONE" => "CodeAlias", "UF_EMAIL" => "CodeAlias"),
    "EVENT_NAME" => "FEEDBACK",
    "EVENT_TEMPLATE" => "",
    "EVENT_TYPE" => "",
    "BUILDER" => "",
    "STORAGE" => "",
    "VALIDATOR" => "",
    "AJAX" => "N",
    "USE_CAPTCHA" => "Y",
    "USE_CSRF" => "Y",
    "REDIRECT_PATH" => "",
    "DISPLAY_FIELDS" => array("NAME", "UF_NAME"),
    "ATTACH_FIELDS" => array("UF_FILE", "DETAIL_PICTURE"),
    "TYPE" => "CUSTOM",
    "CACHE_TYPE" => "Y",
    "CACHE_TIME" => "3600",
    "CACHE_GROUPS" => "Y"
    ),
    false
);*/?>
<?$APPLICATION->IncludeComponent("bitrix:news.list", "our_solutions", Array(
    "ACTIVE_DATE_FORMAT" => "d.m.Y",	// Формат показа даты
    "ADD_SECTIONS_CHAIN" => "Y",	// Включать раздел в цепочку навигации
    "AJAX_MODE" => "N",	// Включить режим AJAX
    "AJAX_OPTION_ADDITIONAL" => "",	// Дополнительный идентификатор
    "AJAX_OPTION_HISTORY" => "N",	// Включить эмуляцию навигации браузера
    "AJAX_OPTION_JUMP" => "N",	// Включить прокрутку к началу компонента
    "AJAX_OPTION_STYLE" => "Y",	// Включить подгрузку стилей
    "CACHE_FILTER" => "N",	// Кешировать при установленном фильтре
    "CACHE_GROUPS" => "Y",	// Учитывать права доступа
    "CACHE_TIME" => "36000000",	// Время кеширования (сек.)
    "CACHE_TYPE" => "A",	// Тип кеширования
    "CHECK_DATES" => "Y",	// Показывать только активные на данный момент элементы
    "DETAIL_URL" => "",	// URL страницы детального просмотра (по умолчанию - из настроек инфоблока)
    "DISPLAY_BOTTOM_PAGER" => "Y",	// Выводить под списком
    "DISPLAY_DATE" => "Y",	// Выводить дату элемента
    "DISPLAY_NAME" => "Y",	// Выводить название элемента
    "DISPLAY_PICTURE" => "Y",	// Выводить изображение для анонса
    "DISPLAY_PREVIEW_TEXT" => "Y",	// Выводить текст анонса
    "DISPLAY_TOP_PAGER" => "N",	// Выводить над списком
    "FIELD_CODE" => array(	// Поля
        0 => "",
        1 => "",
    ),
    "FILTER_NAME" => "",	// Фильтр
    "HIDE_LINK_WHEN_NO_DETAIL" => "N",	// Скрывать ссылку, если нет детального описания
    "IBLOCK_ID" => "13",	// Код информационного блока
    "IBLOCK_TYPE" => "services",	// Тип информационного блока (используется только для проверки)
    "INCLUDE_IBLOCK_INTO_CHAIN" => "N",	// Включать инфоблок в цепочку навигации
    "INCLUDE_SUBSECTIONS" => "Y",	// Показывать элементы подразделов раздела
    "MESSAGE_404" => "",	// Сообщение для показа (по умолчанию из компонента)
    "NEWS_COUNT" => "20",	// Количество новостей на странице
    "PAGER_BASE_LINK_ENABLE" => "N",	// Включить обработку ссылок
    "PAGER_DESC_NUMBERING" => "N",	// Использовать обратную навигацию
    "PAGER_DESC_NUMBERING_CACHE_TIME" => "36000",	// Время кеширования страниц для обратной навигации
    "PAGER_SHOW_ALL" => "N",	// Показывать ссылку "Все"
    "PAGER_SHOW_ALWAYS" => "N",	// Выводить всегда
    "PAGER_TEMPLATE" => ".default",	// Шаблон постраничной навигации
    "PAGER_TITLE" => "Новости",	// Название категорий
    "PARENT_SECTION" => "",	// ID раздела
    "PARENT_SECTION_CODE" => "",	// Код раздела
    "PREVIEW_TRUNCATE_LEN" => "",	// Максимальная длина анонса для вывода (только для типа текст)
    "PROPERTY_CODE" => array(	// Свойства
        0 => "SOL_LINK",
        1 => "",
    ),
    "SET_BROWSER_TITLE" => "Y",	// Устанавливать заголовок окна браузера
    "SET_LAST_MODIFIED" => "N",	// Устанавливать в заголовках ответа время модификации страницы
    "SET_META_DESCRIPTION" => "Y",	// Устанавливать описание страницы
    "SET_META_KEYWORDS" => "Y",	// Устанавливать ключевые слова страницы
    "SET_STATUS_404" => "N",	// Устанавливать статус 404
    "SET_TITLE" => "N",	// Устанавливать заголовок страницы
    "SHOW_404" => "N",	// Показ специальной страницы
    "SORT_BY1" => "ACTIVE_FROM",	// Поле для первой сортировки новостей
    "SORT_BY2" => "SORT",	// Поле для второй сортировки новостей
    "SORT_ORDER1" => "DESC",	// Направление для первой сортировки новостей
    "SORT_ORDER2" => "ASC",	// Направление для второй сортировки новостей
),
    false
);?>
<div id="tutorial-sliders" class="owl-carousel" style="display:none;">
    <div class="slide"><img src="/bitrix/templates/studiofact_getfood/images/1.jpg" alt=""></div>
    <div class="slide"><img src="/bitrix/templates/studiofact_getfood/images/2.jpg" alt=""></div>
    <div class="slide"><img src="/bitrix/templates/studiofact_getfood/images/3.jpg" alt=""></div>
    <div class="slide"><img src="/bitrix/templates/studiofact_getfood/images/4.jpg" alt=""></div>
    <div class="slide"><img src="/bitrix/templates/studiofact_getfood/images/5.jpg" alt=""></div>
    <div class="slide"><img src="/bitrix/templates/studiofact_getfood/images/6.jpg" alt=""></div>
    <div class="slide"><img src="/bitrix/templates/studiofact_getfood/images/7.jpg" alt=""></div>
    <div class="slide"><img src="/bitrix/templates/studiofact_getfood/images/8.jpg" alt=""></div>
    <div class="slide"><img src="/bitrix/templates/studiofact_getfood/images/9.jpg" alt=""></div>
    <div class="slide"><img src="/bitrix/templates/studiofact_getfood/images/10.jpg" alt=""></div>
</div>
<script>
    $(document).on('onComplete.fb', function() {
//        $('[data-fancybox-close]').remove();
        $("#tutorial-sliders").owlCarousel({
            items: 1,
            dots: true,
            mouseDrag: true,
            autoPlay: false,
            autoplayHoverPause: true,
            nav: true,
            navSpeed: 500,
            loop: true,
            autoWidth: false,
            autoHeight: true,
        });
//        $("#tutorial-sliders").append('<button data-fancybox-close="" class="fancybox-close-small">&#215;</button>');
        $("#tutorial-sliders").parent().parent().addClass('not_vertical_move');
    });
</script>