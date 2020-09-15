<?
if (!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED !== true)
    die();
IncludeTemplateLangFile(__FILE__);
CUtil::InitJSCore();
CJSCore::Init(array("fx", "currency"));
$curPage = $APPLICATION->GetCurPage(true);

use Bitrix\Main\Page\Asset;

global $ccModule;
$ccModule = (\Bitrix\Main\Loader::includeModule("citfact.getfood"));
$config = new \Citfact\Getfood\Configurator();
CModule::IncludeModule("catalog");
?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="<?= LANGUAGE_ID; ?>" lang="<?= LANGUAGE_ID; ?>">
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=<?= LANG_CHARSET; ?>" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge, chrome=1" />
        <meta name="viewport" content="width = device-width, initial-scale = 1.0, maximum-scale = 1.0, user-scalable = no, target-densitydpi = device-dpi" />
        <meta name="format-detection" content="telephone=no" />
        <meta http-equiv="cleartype" content="on" />
        <link rel="shortcut icon" type="image/x-icon" href="<?= SITE_DIR; ?>favicon.ico" />
        <!-- saved from url=(0014)about:internet -->
        <title><? $APPLICATION->ShowTitle(); ?></title>
        <? Citfact\Getfood\Htmlhelper\CCitfactCss::showCss() ?>
        <?
        $APPLICATION->ShowMeta("robots", false, true);
        $APPLICATION->ShowMeta("keywords", false, true);
        $APPLICATION->ShowMeta("description", false, true);
        $APPLICATION->ShowCSS(true, true);
        $APPLICATION->ShowHeadStrings();
        $APPLICATION->ShowHeadScripts();



        Asset::getInstance()->addJs(SITE_TEMPLATE_PATH . "/js/jquery-1.12.4.min.js");
        Asset::getInstance()->addJs(SITE_TEMPLATE_PATH . "/js/modernizr.js");
        Asset::getInstance()->addJs(SITE_TEMPLATE_PATH . "/js/jquery.easing.1.3.js");
        Asset::getInstance()->addJs(SITE_TEMPLATE_PATH . "/js/bootstrap.min.js");
        Asset::getInstance()->addJs(SITE_TEMPLATE_PATH . "/js/owl.carousel2.min.js");
        Asset::getInstance()->addJs(SITE_TEMPLATE_PATH . "/js/fancybox/jquery.fancybox3.min.js");
        Asset::getInstance()->addJs(SITE_TEMPLATE_PATH . "/js/jquery.scrollbar/jquery.scrollbar.min.js");
        Asset::getInstance()->addJs(SITE_TEMPLATE_PATH . '/js/jquery.jscrollpane.js');
        Asset::getInstance()->addJs(SITE_TEMPLATE_PATH . '/js/jquery.mousewheel.js');
        Asset::getInstance()->addJs(SITE_TEMPLATE_PATH . "/js/jquery.flexslider-min.js");
        Asset::getInstance()->addJs(SITE_TEMPLATE_PATH . "/js/jquery.mask.min.js");
        Asset::getInstance()->addJs(SITE_TEMPLATE_PATH . "/js/jquery.cookie.js");
        Asset::getInstance()->addJs(SITE_TEMPLATE_PATH . "/js/jquery.lazyload.js");
        Asset::getInstance()->addJs(SITE_TEMPLATE_PATH . "/js/script.js");
        Asset::getInstance()->addJs(SITE_TEMPLATE_PATH . "/js/jquery.tabslideout.v1.2.js");
        Asset::getInstance()->addJs(SITE_TEMPLATE_PATH . "/js/tabs.js");
        Asset::getInstance()->addJs(SITE_TEMPLATE_PATH . "/js/spectrum.js");




        Asset::getInstance()->addCss(SITE_TEMPLATE_PATH . "/fonts/awesome.css");
        Asset::getInstance()->addCss(SITE_TEMPLATE_PATH . "/fonts/stylesheet.css");
        Asset::getInstance()->addCss(SITE_TEMPLATE_PATH . "/css/awesome.css");
        ?>
        <? //$color = COption::GetOptionString("main", "sf_template_color", "orange"); ?>
        <!--[if lt IE 9]>
                <script type='text/javascript' src="<?= SITE_TEMPLATE_PATH; ?>/js/html5.js"></script>
                <script type='text/javascript' src="<?= SITE_TEMPLATE_PATH; ?>/js/css3-mediaqueries.js"></script>
        <![endif]-->
        <? $APPLICATION->SetAdditionalCSS(SITE_TEMPLATE_PATH . "/fonts/awesome.css"); ?>

        <? Citfact\Getfood\Htmlhelper\CCitfactCss::setThemeColor("orange") ?>
        <meta name="yandex-verification" content="58aa1b22fce31fb4" />
    </head>

    <?
    if (!function_exists('bclass')) {

        function bclass() {
            global $APPLICATION;
            $page = $APPLICATION->GetCurPage();
            switch ($page) {
                case SITE_DIR . 'index.php' :
                case SITE_DIR :
                    return ' home';
                case SITE_DIR . 'personal/order/make/' :
                case SITE_DIR . 'personal/order/make/index.php' :
                case SITE_DIR . 'personal/cart/' :
                case SITE_DIR . 'personal/cart/index.php' :
                    return ' cart';
                default :
                    return ' not-home';
            }
        }

    }
    ?>


    <body  class="<? echo bclass(); ?> Font<?= ($ccModule ? CGetfood::getOption("FONT_FAMILY") : '') ?>" itemscope itemtype="http://schema.org/LocalBusiness">
        <?
        if ((0 && !isset($_GET["nolockdown"])) || isset($_GET["lockdown"])) {
            $APPLICATION->IncludeFile("/lockdown.php");
        }
        ?>
        <? if (!isset($_GET["load"])) { ?>
            <div id="preloader">
                <span class="logo"><img src="/logo.svg" alt=""></span>
            </div>
        <? } ?>
        <?
        if (file_exists(__DIR__ . "/options.php"))
            require_once __DIR__ . "/options.php";
        ?>

        <? if ($_REQUEST["open_popup"] != "Y") { ?>
            <div id="panel"><? $APPLICATION->ShowPanel(); ?></div>
            <? //$APPLICATION->IncludeComponent("studiofact:configurator", "", array()); ?>
            <? //$APPLICATION->IncludeFile(SITE_DIR . "include/svg.php") ?>
            <?php
            $catalog_view_mode = $APPLICATION->get_cookie("catalog_view_mode");
            ?>
            <header>
                <div class="header_top">
                    <div class="container">
                        <div class="row">
                            <? /*
                              <div class="header_city col-xs-12 col-md-2">
                              <div class="mark"></div><div class="cityName">Москва</div>
                              </div> */ ?>
                            <div class="header_menu col-xs-3 col-md-8">
                                <div class="burger hidden-sm hidden-md hidden-lg">
                                    <div class="x"></div>
                                    <div class="y"></div>
                                    <div class="z"></div>
                                </div>
                                <nav class="topMenuSmall">
                                    <?
                                    $APPLICATION->IncludeComponent(
                                            "bitrix:menu",
                                            "top_menu",
                                            array(
                                                "ROOT_MENU_TYPE" => "top",
                                                "MENU_CACHE_TYPE" => "Y",
                                                "MENU_CACHE_TIME" => "36000000",
                                                "MENU_CACHE_USE_GROUPS" => "Y",
                                                "MENU_CACHE_GET_VARS" => array(),
                                                "MAX_LEVEL" => "2",
                                                "CHILD_MENU_TYPE" => "top_submenu",
                                                "USE_EXT" => "N",
                                                "ALLOW_MULTI_SELECT" => "N"
                                            )
                                    );
                                    ?>
                                </nav>
                            </div>
                            <div class="header_login col-xs-9 col-md-4">
                                <div class="login_icon"></div>
                                <div class="login_links">
                                    <? //$APPLICATION->IncludeComponent("studiofact:auth", "", Array());  ?>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="header_bottom dark">
                    <div class="container">
                        <div class="row">


                            <div class="logo col-xs-3 col-md-2">
                                <a href="<?= SITE_DIR; ?>" class="logo inline" title="<?= GetMessage("STUDIOFACT_MAIN"); ?>">
                                    <? $APPLICATION->IncludeComponent("bitrix:main.include", "", array("AREA_FILE_SHOW" => "file", "PATH" => SITE_DIR . "include/header_logo.php"), false); ?>
                                </a>
                            </div>
                            <div class="header_phones col-xs-9 col-md-7">
                                <div class="row">
                                    <div class="phone col-xs-12 col-sm-6">
                                        <a href="tel:+79255359848">+7 (925) 535 98 48</a>
                                        <span class="address">с. Павловская Слобода, ул. Ленина, д.2</span>
                                    </div>
                                    <div class="phone col-xs-12 col-sm-6">
                                        <a href="tel:+79254160620">+7 (925) 416 06 20</a>
                                        <span class="address">д. Чесноково, КП "Резиденция Бенилюкс"</span>
                                    </div>
                                </div>
                            </div>
                            <div class="header_cart col-xs-12 col-md-3">
                                <div id="small_basket_box" data-path="<?= SITE_DIR . "include/buy_one_click.php"; ?>">
                                    <? $APPLICATION->IncludeComponent("bitrix:main.include", "", array("AREA_FILE_SHOW" => "file", "PATH" => SITE_DIR . "include/small_basket_redesign.php"), false); ?>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            <main>

                <? if ($APPLICATION->GetCurPage(true) == SITE_DIR . "index.php" && ERROR_404 != "Y") { ?>
                    <?
                    $APPLICATION->IncludeComponent("bitrix:news.list", "main_banner", array(
                        "IBLOCK_TYPE" => "services",
                        "IBLOCK_ID" => "4",
                        "NEWS_COUNT" => "15",
                        "SORT_BY1" => "SORT",
                        "SORT_ORDER1" => "ASC",
                        "SORT_BY2" => "NAME",
                        "SORT_ORDER2" => "ASC",
                        "FILTER_NAME" => "",
                        "FIELD_CODE" => array(
                            0 => "ID",
                            1 => "NAME",
                            2 => "SORT",
                            3 => "PREVIEW_TEXT",
                            4 => "PREVIEW_PICTURE",
                            5 => "DETAIL_PICTURE",
                        ),
                        "PROPERTY_CODE" => array(
                            0 => "PRICE",
                            1 => "LINK",
                            2 => "",
                        ),
                        "CHECK_DATES" => "Y",
                        "DETAIL_URL" => "",
                        "AJAX_MODE" => "N",
                        "AJAX_OPTION_JUMP" => "N",
                        "AJAX_OPTION_STYLE" => "Y",
                        "AJAX_OPTION_HISTORY" => "N",
                        "CACHE_TYPE" => "A",
                        "CACHE_TIME" => "36000000",
                        "CACHE_FILTER" => "N",
                        "CACHE_GROUPS" => "Y",
                        "PREVIEW_TRUNCATE_LEN" => "",
                        "ACTIVE_DATE_FORMAT" => "d.m.Y",
                        "SET_STATUS_404" => "N",
                        "SET_TITLE" => "N",
                        "INCLUDE_IBLOCK_INTO_CHAIN" => "N",
                        "ADD_SECTIONS_CHAIN" => "N",
                        "HIDE_LINK_WHEN_NO_DETAIL" => "N",
                        "PARENT_SECTION" => "",
                        "PARENT_SECTION_CODE" => "",
                        "INCLUDE_SUBSECTIONS" => "Y",
                        "PAGER_TEMPLATE" => ".default",
                        "DISPLAY_TOP_PAGER" => "N",
                        "DISPLAY_BOTTOM_PAGER" => "N",
                        "PAGER_TITLE" => "Новости",
                        "PAGER_SHOW_ALWAYS" => "N",
                        "PAGER_DESC_NUMBERING" => "N",
                        "PAGER_DESC_NUMBERING_CACHE_TIME" => "36000",
                        "PAGER_SHOW_ALL" => "N",
                        "DISPLAY_DATE" => "Y",
                        "DISPLAY_NAME" => "Y",
                        "DISPLAY_PICTURE" => "Y",
                        "DISPLAY_PREVIEW_TEXT" => "Y",
                        "AJAX_OPTION_ADDITIONAL" => ""
                            ),
                            false
                    );
                    ?>
                <? } ?>
                <?
                if (!CSite::InDir("/personal/cart/") && !CSite::InDir("/personal/order/")) {

                    Asset::getInstance()->addJs("https://api-maps.yandex.ru/2.1/?lang=ru_RU&amp;apikey=e487e4a8-9e77-4b11-b8e2-6d9cfc4db957");

                    Asset::getInstance()->addJs(SITE_TEMPLATE_PATH . "/js/address.js");
                    ?>
                    <div class="container">
                        <div class="deliverySelectionBox">
                            <div class="row">
                                <div class="col-xs-12 col-sm-4">
                                    <div class="deliverySelectorBlock">
                                        <div class="blockTitle">Введите адрес доставки</div>
                                        <div class="deliveryOptions">
                                            <?
                                            $class = "current";
                                            if ($_COOKIE["deliveryOption"] == "0") {
                                                $class = "";
                                            }
                                            ?>
                                            <div class="deliveryOption <?= $class ?>" data-delivery="1">Доставка</div>
                                            <?
                                            $class = "";
                                            if ($_COOKIE["deliveryOption"] == "0") {
                                                $class = "current";
                                            }
                                            ?>
                                            <div class="deliveryOption <?= $class ?>" data-delivery="0">С собой</div>
                                            <?
                                            $class = "";
                                            if ($_COOKIE["deliveryOption"] == "0") {
                                                $class = "right";
                                            }
                                            ?>
                                            <div class="deliveryOptionSlider <?= $class ?>"></div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-xs-12 col-sm-8 ">
                                    <div class="deliveryAddressBlock">
                                        <div class="blockTitle">
                                            <span>
                                                <img src="<?= SITE_TEMPLATE_PATH ?>/images/clock.svg" /> От 30 минут
                                            </span>
                                            <span>
                                                <?
                                                $text = "От 500 руб";
                                                if ($_COOKIE["deliveryPrice"] != "") {
                                                    $text = $_COOKIE["deliveryPrice"] . " руб";
                                                }
                                                if ($_COOKIE["deliveryOption"] == "0") {
                                                    $text = "Бесплатно";
                                                }
                                                ?>
                                                <img src="<?= SITE_TEMPLATE_PATH ?>/images/ruble.svg" /> <span class="deliveryPriceBlock"><?= $text ?></span>
                                            </span>
                                        </div>
                                        <div class="deliveryForm">
                                            <form id="deliveryForm" method="post">
                                                <input type="hidden" name="deliveryCoords" id="deliveryCoords" value="<?= $_COOKIE["deliveryCoords"] ?>"/> 
                                                <input type="hidden" name="deliveryPrice" id="deliveryPrice" value="<?= $_COOKIE["deliveryPrice"] ?>"/>


                                                <div class="deliveryAddress">
                                                    <input type="text" name="deliveryAddress" id="deliveryAddress" value="<?
                                                    if ($_COOKIE["deliveryOption"] == "1") {
                                                        echo $_COOKIE["deliveryAddress"];
                                                    }
                                                    ?>" placeholder="Куда привезти?"/>
                                                    <div id="deliveryNotice" style="display:none"></div>
                                                    <div id="deliveryMessage" style="display:none;"></div>
                                                </div>
                                                <div class="deliveryConfirm"><button class="btn btn-primary" type="submit">Подтвердить</button></div>
                                            </form>
                                            <div id="hidden_map" class="hidden"></div>
                                            <script>
        <?
        $zoneprice = 1500;
        if (date("H") >= 10 && date("H") < 21) {
            $zoneprice = 1000;
        }
        if (date("H") == 21) {
            if (date("i") < 30) {
                $zoneprice = 1000;
            }
        }
        ?>
                                                var zone1price = <?= $zoneprice ?>;
                                            </script>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="menuMenu">

                        <?
                        $APPLICATION->IncludeComponent("bitrix:menu", "left_menu", array(
                            "ROOT_MENU_TYPE" => "left",
                            "MENU_CACHE_TYPE" => "A",
                            "MENU_CACHE_TIME" => "36000000",
                            "MENU_CACHE_USE_GROUPS" => "Y",
                            "MENU_THEME" => "site",
                            "CACHE_SELECTED_ITEMS" => "N",
                            "MENU_CACHE_GET_VARS" => array(
                            ),
                            "MAX_LEVEL" => "2",
                            "CHILD_MENU_TYPE" => "left",
                            "USE_EXT" => "Y",
                            "DELAY" => "N",
                            "ALLOW_MULTI_SELECT" => "N",
                                ),
                                false
                        );
                        ?>
                    </div>
                <? } ?>

                <? if ($APPLICATION->GetCurPage(true) != SITE_DIR . "index.php" && ERROR_404 != "Y") { ?>
                    <?
                    /* $APPLICATION->IncludeComponent("bitrix:breadcrumb", "", array(
                      "START_FROM" => "0",
                      "PATH" => "",
                      "SITE_ID" => "-"
                      ),
                      false,
                      Array('HIDE_ICONS' => 'Y')
                      ); */
                    ?>
                    <div class="container">
                        <div class="pageTitle"><h1><?= $APPLICATION->ShowTitle(false); ?></h1></div>
                    </div>

                <? } ?>
<? } ?>