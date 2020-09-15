<?
require($_SERVER["DOCUMENT_ROOT"] . "/bitrix/header.php");
$APPLICATION->SetTitle("Заказы");
?>
<?
$hour = date("H");
$minute = date("i");
$day = date("N");
if ((($hour > 22 || ($hour == 22 && $minute > 29) || ($day < 6 && $hour < 10) || (($day == 6 || $day == 7) && $hour < 11)) && !$USER->IsAdmin()) || isset($_GET["weareclosed"])) {
    //if($hour>=22 || $hour < 13){
    $open = "10:00";
    //$open = "13:00";
    if ($day == 6 || $day == 7) {
        $open = "11:00";
    }
    ?>
    <div class="container">
        <h2>К сожалению, доставка не работает в это время суток. Сегодня мы принимаем заказы с <?= $open ?> до 22:30.</h2>
    </div>
    <?
} else {
    $apiKey = 'e487e4a8-9e77-4b11-b8e2-6d9cfc4db957';
    ?>
    <script src="https://api-maps.yandex.ru/2.1/?load=package.standard,package.route&amp;lang=ru-RU&amp;apikey=<?= $apiKey ?>" data-skip-moving="true" type="text/javascript"></script>
    <?
    $APPLICATION->IncludeComponent(
            "studiofact:sale.order.ajax",
            "new_order",
            array(
                "PAY_FROM_ACCOUNT" => "N",
                "COUNT_DELIVERY_TAX" => "N",
                "COUNT_DISCOUNT_4_ALL_QUANTITY" => "N",
                "ONLY_FULL_PAY_FROM_ACCOUNT" => "N",
                "ALLOW_AUTO_REGISTER" => "Y",
                "SEND_NEW_USER_NOTIFY" => "Y",
                "DELIVERY_NO_AJAX" => "N",
                "TEMPLATE_LOCATION" => "popup",
                "PROP_1" => "",
                "PATH_TO_BASKET" => "/personal/cart/",
                "PATH_TO_PERSONAL" => "/personal/order/",
                "PATH_TO_PAYMENT" => "/personal/order/payment/",
                "PATH_TO_ORDER" => "/personal/order/make/",
                "SET_TITLE" => "Y",
                "DELIVERY2PAY_SYSTEM" => "",
                "SHOW_ACCOUNT_NUMBER" => "Y",
                "COMPONENT_TEMPLATE" => "new_order",
                "DELIVERY_NO_SESSION" => "Y",
                "DELIVERY_TO_PAYSYSTEM" => "d2p",
                "USE_PREPAYMENT" => "N",
                "COMPATIBLE_MODE" => "Y",
                "BASKET_IMAGES_SCALING" => "adaptive",
                "ALLOW_NEW_PROFILE" => "N",
                "SHOW_PAYMENT_SERVICES_NAMES" => "N",
                "SHOW_STORES_IMAGES" => "N",
                "PATH_TO_AUTH" => "/auth/",
                "DISABLE_BASKET_REDIRECT" => "N",
                "PRODUCT_COLUMNS_VISIBLE" => array(
                    0 => "PREVIEW_PICTURE",
                    1 => "PROPS",
                ),
                "ADDITIONAL_PICT_PROP_2" => "MORE_PHOTO",
                "ADDITIONAL_PICT_PROP_3" => "MORE_PHOTO",
                "ALLOW_APPEND_ORDER" => "Y",
                "SHOW_NOT_CALCULATED_DELIVERIES" => "L",
                "SPOT_LOCATION_BY_GEOIP" => "Y",
                "SHOW_VAT_PRICE" => "Y",
                "USE_PRELOAD" => "Y",
                "ALLOW_USER_PROFILES" => "N",
                "TEMPLATE_THEME" => "site",
                "SHOW_ORDER_BUTTON" => "final_step",
                "SHOW_TOTAL_ORDER_BUTTON" => "N",
                "SHOW_PAY_SYSTEM_LIST_NAMES" => "Y",
                "SHOW_PAY_SYSTEM_INFO_NAME" => "Y",
                "SHOW_DELIVERY_LIST_NAMES" => "N",
                "SHOW_DELIVERY_INFO_NAME" => "N",
                "SHOW_DELIVERY_PARENT_NAMES" => "N",
                "SKIP_USELESS_BLOCK" => "Y",
                "BASKET_POSITION" => "before",
                "SHOW_BASKET_HEADERS" => "N",
                "DELIVERY_FADE_EXTRA_SERVICES" => "N",
                "SHOW_COUPONS_BASKET" => "N",
                "SHOW_COUPONS_DELIVERY" => "N",
                "SHOW_COUPONS_PAY_SYSTEM" => "N",
                "SHOW_NEAREST_PICKUP" => "N",
                "DELIVERIES_PER_PAGE" => "9",
                "PAY_SYSTEMS_PER_PAGE" => "9",
                "PICKUPS_PER_PAGE" => "5",
                "SHOW_PICKUP_MAP" => "N",
                "SHOW_MAP_IN_PROPS" => "N",
                "PICKUP_MAP_TYPE" => "yandex",
                "PROPS_FADE_LIST_1" => array(
                ),
                "USER_CONSENT" => "Y",
                "USER_CONSENT_ID" => "1",
                "USER_CONSENT_IS_CHECKED" => "Y",
                "USER_CONSENT_IS_LOADED" => "N",
                "ACTION_VARIABLE" => "action",
                "SERVICES_IMAGES_SCALING" => "adaptive",
                "PRODUCT_COLUMNS_HIDDEN" => array(
                ),
                "USE_YM_GOALS" => "Y",
                "USE_ENHANCED_ECOMMERCE" => "N",
                "USE_CUSTOM_MAIN_MESSAGES" => "Y",
                "USE_CUSTOM_ADDITIONAL_MESSAGES" => "Y",
                "USE_CUSTOM_ERROR_MESSAGES" => "N",
                "PROPS_FADE_LIST_2" => "",
                "USE_PHONE_NORMALIZATION" => "Y",
                "YM_GOALS_COUNTER" => "50687449",
                "YM_GOALS_INITIALIZE" => "BX-order-init",
                "YM_GOALS_EDIT_REGION" => "BX-region-edit",
                "YM_GOALS_EDIT_DELIVERY" => "BX-delivery-edit",
                "YM_GOALS_EDIT_PICKUP" => "BX-pickUp-edit",
                "YM_GOALS_EDIT_PAY_SYSTEM" => "BX-paySystem-edit",
                "YM_GOALS_EDIT_PROPERTIES" => "BX-properties-edit",
                "YM_GOALS_EDIT_BASKET" => "BX-basket-edit",
                "YM_GOALS_NEXT_REGION" => "BX-region-next",
                "YM_GOALS_NEXT_DELIVERY" => "BX-delivery-next",
                "YM_GOALS_NEXT_PICKUP" => "BX-pickUp-next",
                "YM_GOALS_NEXT_PAY_SYSTEM" => "BX-paySystem-next",
                "YM_GOALS_NEXT_PROPERTIES" => "BX-properties-next",
                "YM_GOALS_NEXT_BASKET" => "BX-basket-next",
                "YM_GOALS_SAVE_ORDER" => "BX-order-save",
                "MESS_AUTH_BLOCK_NAME" => "Авторизация",
                "MESS_REG_BLOCK_NAME" => "Регистрация",
                "MESS_BASKET_BLOCK_NAME" => "Товары в заказе",
                "MESS_REGION_BLOCK_NAME" => "Регион доставки",
                "MESS_PAYMENT_BLOCK_NAME" => "Оплата",
                "MESS_DELIVERY_BLOCK_NAME" => "Доставка",
                "MESS_BUYER_BLOCK_NAME" => "Покупатель",
                "MESS_BACK" => "Назад",
                "MESS_FURTHER" => "Далее",
                "MESS_EDIT" => "изменить",
                "MESS_ORDER" => "Оформить заказ",
                "MESS_PRICE" => "Стоимость",
                "MESS_PERIOD" => "Срок доставки",
                "MESS_NAV_BACK" => "Назад",
                "MESS_NAV_FORWARD" => "Вперед",
                "MESS_PRICE_FREE" => "бесплатно",
                "MESS_ECONOMY" => "Экономия",
                "MESS_REGISTRATION_REFERENCE" => "Если вы впервые на сайте, и хотите, чтобы мы вас помнили и все ваши заказы сохранялись, заполните регистрационную форму.",
                "MESS_AUTH_REFERENCE_1" => "Символом \"звездочка\" (*) отмечены обязательные для заполнения поля.",
                "MESS_AUTH_REFERENCE_2" => "После регистрации вы получите информационное письмо.",
                "MESS_AUTH_REFERENCE_3" => "Личные сведения, полученные в распоряжение интернет-магазина при регистрации или каким-либо иным образом, не будут без разрешения пользователей передаваться третьим организациям и лицам за исключением ситуаций, когда этого требует закон или судебное решение.",
                "MESS_ADDITIONAL_PROPS" => "Дополнительные свойства",
                "MESS_USE_COUPON" => "Применить купон",
                "MESS_COUPON" => "Купон",
                "MESS_PERSON_TYPE" => "Тип плательщика",
                "MESS_SELECT_PROFILE" => "Выберите профиль",
                "MESS_REGION_REFERENCE" => "Выберите свой город в списке. Если вы не нашли свой город, выберите \"другое местоположение\", а город впишите в поле \"Город\"",
                "MESS_PICKUP_LIST" => "Пункты самовывоза:",
                "MESS_NEAREST_PICKUP_LIST" => "Ближайшие пункты:",
                "MESS_SELECT_PICKUP" => "Выбрать",
                "MESS_INNER_PS_BALANCE" => "На вашем пользовательском счете:",
                "MESS_ORDER_DESC" => "Комментарии к заказу:"
            ),
            false
    );
    ?>
<? } ?>
<? require($_SERVER["DOCUMENT_ROOT"] . "/bitrix/footer.php"); ?>