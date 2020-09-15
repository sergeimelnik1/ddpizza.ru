<?
if (!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED !== true)
    die();
IncludeTemplateLangFile(__FILE__);
?><? if ($_REQUEST["open_popup"] != "Y") { ?></main>

    <footer class="dark">
        <div class="container">
            <div class="row">
                <div class="col-12 col-md-5">
                    <div class="footer_menu">
                        <div class="menu_header">Категории</div>
                        <?
                        $APPLICATION->IncludeComponent("bitrix:menu", "simple", array(
                            "ROOT_MENU_TYPE" => "left",
                            "MENU_CACHE_TYPE" => "A",
                            "MENU_CACHE_TIME" => "36000000",
                            "MENU_CACHE_USE_GROUPS" => "Y",
                            "MENU_THEME" => "site",
                            "CACHE_SELECTED_ITEMS" => "N",
                            "MENU_CACHE_GET_VARS" => array(
                            ),
                            "MAX_LEVEL" => "1",
                            "CHILD_MENU_TYPE" => "left",
                            "USE_EXT" => "Y",
                            "DELAY" => "N",
                            "ALLOW_MULTI_SELECT" => "N",
                                ),
                                false
                        );
                        ?>
                    </div>
                </div>
                <div class="col-12 col-md-4">
                    <div class="footer_menu">
                        <div class="menu_header">Компания</div>
                        <?
                        $APPLICATION->IncludeComponent("bitrix:menu", "simple", array(
                            "ROOT_MENU_TYPE" => "top",
                            "MENU_CACHE_TYPE" => "A",
                            "MENU_CACHE_TIME" => "36000000",
                            "MENU_CACHE_USE_GROUPS" => "Y",
                            "MENU_THEME" => "site",
                            "CACHE_SELECTED_ITEMS" => "N",
                            "MENU_CACHE_GET_VARS" => array(
                            ),
                            "MAX_LEVEL" => "1",
                            "CHILD_MENU_TYPE" => "left",
                            "USE_EXT" => "Y",
                            "DELAY" => "N",
                            "ALLOW_MULTI_SELECT" => "N",
                                ),
                                false
                        );
                        ?>
                    </div>
                </div>
                <div class="col-xs-12 col-md-3">
                    <div class="footer_menu">
                        <div class="menu_header">Контакты</div>
                        <div class="footer_phones">
                            <a href="tel:+79255359848">+7 (925) 535 98 48</a>
                            <a href="tel:+79254160620">+7 (925) 416 06 20</a>
                        </div>
                        <div class="footer_socials">
                            <? $APPLICATION->IncludeComponent("bitrix:main.include", "", array("AREA_FILE_SHOW" => "file", "PATH" => SITE_DIR . "include/footer_socials.php"), false); ?>
                        </div>
                        <div class="footerPaymentIcons">
                            <img src="<?= SITE_TEMPLATE_PATH ?>/images/mastercard.svg">
                            <img src="<?= SITE_TEMPLATE_PATH ?>/images/mastercard-2.svg">
                            <img src="<?= SITE_TEMPLATE_PATH ?>/images/national-payment-system-mir.svg">
                            <img src="<?= SITE_TEMPLATE_PATH ?>/images/visa.svg">                            
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="footer_line"></div>
        <div class="footer_copyright text-center">
            <div class="col-12">
                &copy; 2016-<?= date("Y") ?> Дядя Пицца. Доставка еды на дом и в офис. <br /><a href="/policy/">Политика конфиденциальности</a>
            </div>
        </div>
    </footer>








    <div style="display: none;">
        <? $APPLICATION->IncludeComponent("bitrix:main.include", "", array("AREA_FILE_SHOW" => "file", "PATH" => SITE_DIR . "include/feedback_form.php"), false); ?>
    </div>


    <? $APPLICATION->IncludeComponent("bitrix:main.include", "", array("AREA_FILE_SHOW" => "file", "PATH" => SITE_DIR . "include/metrics.php"), false); ?>
<? } else { ?>
    <script type="text/javascript">
        $(document).ready(function () {
            $("#bx-composite-banner").remove();
        });
    </script>
<? } ?>
<div id="sfp_add_to_basket_head" style="display: none;">
    <?= GetMessage("SFP_ADD_TO_BASKET_HEAD"); ?>
</div>
<div id="sfp_show_offers_head" style="display: none;">
    <?= GetMessage("SFP_SHOW_OFFERS_HEAD"); ?>
</div>
<div class="success_fast_order" style="display: none;">
    <?= GetMessage("SUCCESS_FAST_ORDER"); ?>
</div>
<div style="display:none" id="oneClickModal">
    <div class="order_by_click">
        <div class="popup_head">
            <?= GetMessage("SF_SMALL_BUY_ONE_CLICK"); ?>
        </div>
        <div class="feedback_form_prop_line">
            <label for="SMALL_BASKET_ORDER_PHONE"><?= GetMessage("SF_SMALL_BUY_LABEL"); ?></label>
            <input type="tel" class="" name="SMALL_BASKET_ORDER_PHONE" id="SMALL_BASKET_ORDER_PHONE" value="" placeholder="">
        </div>
        <div class="user-agree-checkbox">
            <? $APPLICATION->IncludeComponent("bitrix:main.include", "", array("AREA_FILE_SHOW" => "file", "PATH" => SITE_DIR . "include/agreement/agreement_one_click.php"), false); ?>
        </div>
        <a href="javascript: void(0);" class="button small_basket_hover_buy_go inline" id="small_basket_hover_buy_go">
            <?= GetMessage("SF_SMALL_BUY_GO"); ?>
        </a>
    </div>
</div>
<div style="display:none" id="buyOneProductModal">
    <div class="order_by_click">
        <div class="popup_head"><?= GetMessage("SF_SMALL_BUY_ONE_CLICK"); ?></div>
        <div class="feedback_form_prop_line">
            <label for="SMALL_BASKET_ORDER_PHONE"><?= GetMessage("SF_SMALL_BUY_LABEL"); ?></label>
            <input type="tel" class="" name="SMALL_BASKET_ORDER_PHONE" id="SMALL_BASKET_ORDER_PHONE" value="" placeholder="">
        </div>
        <div class="user-agree-checkbox">
            <? $APPLICATION->IncludeComponent("bitrix:main.include", "", array("AREA_FILE_SHOW" => "file", "PATH" => SITE_DIR . "include/agreement/agreement_one_click_modal.php"), false); ?>
        </div>
        <a href="javascript: void(0);" class="button buy_one_click_product inline" id="buy_one_click_product">
            <?= GetMessage("SF_SMALL_BUY_GO"); ?>
        </a>
    </div>
</div>
<div style="display:none">
    <div id="login" class="loginPopup">
        <?
        $APPLICATION->IncludeComponent(
                "bitrix:system.auth.authorize",
                "popup",
                Array(
                    "AJAX_MODE" => "Y",
                    "COMPOSITE_FRAME_MODE" => "A",
                    "COMPOSITE_FRAME_TYPE" => "AUTO",
                    "FORGOT_PASSWORD_URL" => "",
                    "PROFILE_URL" => "",
                    "REGISTER_URL" => "",
                    "SHOW_ERRORS" => "N"
                )
        );
        ?>

    </div>
    <svg xmlns="http://www.w3.org/2000/svg" version="1.1">
    <defs>
    <filter id="blur">
        <feGaussianBlur stdDeviation="5" />
    </filter>
    </defs>
    </svg>
</div>

<!-- Yandex.Metrika counter -->
<script type="text/javascript" >
    (function (m, e, t, r, i, k, a) {
        m[i] = m[i] || function () {
            (m[i].a = m[i].a || []).push(arguments)
        };
        m[i].l = 1 * new Date();
        k = e.createElement(t), a = e.getElementsByTagName(t)[0], k.async = 1, k.src = r, a.parentNode.insertBefore(k, a)
    })
            (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

    ym(50687449, "init", {
        clickmap: true,
        trackLinks: true,
        accurateTrackBounce: true,
        webvisor: true
    });
</script>
<noscript><div><img src="https://mc.yandex.ru/watch/50687449" style="position:absolute; left:-9999px;" alt="" /></div></noscript>
<!-- /Yandex.Metrika counter -->

<? /* $hour = date("H");
  $minute = date("i");
  $day = date("w");

  if($hour>=22 || $hour < 13){?>
  <div class="nyNotice">
  Поздравляем Вас с Новым годом и уведомляем, что приём заказов 1 января мы начинаем с 13:00.
  </div>
  <? } */ ?>
<?
$hour = date("H");
$minute = date("i");
$day = date("w");
if ((($hour>22 || ($hour == 22 && $minute > 29) || ($day < 6 && $hour < 10) || (($day == 5 || $day == 6) && $hour < 11)) && !$USER->IsAdmin()) || isset($_GET["weareclosed"])) {
    $open = "10:00";
    if ($day == 5 || $day == 6) {
        $open = "11:00";
    }
    ?>
    <script>
        weareclosed = true;
        $.cookie('weareclosed', "1", {expires: 3600, path: '/'});

    </script>

    <script>
        $(window).load(function () {
            $('[data-fancybox="weareclosed"]').fancybox({
                beforeClose: function () {

                    $.cookie('closedClosed', "1", {expires: 3600, path: '/'});
                }
            });
    <?
    if ($_COOKIE["closedClosed"] != "1") {
        ?>
                $(".weareclosed").click();
    <? } ?>
        });
    </script>
    <a href="#weareclosed" data-fancybox="weareclosed" class="weareclosed"></a>
    <div style="display: none">
        <div id="weareclosed">
            К сожалению, доставка не работает в это время суток.<br /> Сегодня мы принимаем заказы с <?= $open ?> до 22:30<br />
            <br />
            <button class="btn btn-primary" onclick="$.cookie('closedClosed', '1', {expires: 3600, path: '/'});$.fancybox.close()">Понятно</button>
        </div>
    </div>
    <?
}else{
	?>
	<script>
        weareclosed = false;
        $.removeCookie('weareclosed', { path: '/'});

    </script>
	<?
}
?>
</body>
</html>
<?
$title = $APPLICATION->GetTitle();
$title = strip_tags(html_entity_decode($title));
$APPLICATION->SetTitle($title);
$title = $APPLICATION->GetProperty("title");
$title = strip_tags(html_entity_decode($title));
$APPLICATION->SetPageProperty("title", $title);
?>