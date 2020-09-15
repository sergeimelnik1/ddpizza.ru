<?
require ($_SERVER["DOCUMENT_ROOT"] . "/bitrix/header.php");
$APPLICATION->SetPageProperty("description", "Мы – сеть кафе для всей семьи. Быстрая бесплатная доставка домой и в офис от 30 минут.");
$APPLICATION->SetPageProperty("NOT_SHOW_NAV_CHAIN", "Y");
$APPLICATION->SetTitle("Кафе “Дядя Пицца” на Новой Риге");
CModule::IncludeModule("CGetfood");
?><?
if (!isset($_GET["old"])) {
    
} else {
    ?>
    <div class="index-page-wrapper">


        <div class="bx_catalog_section_box">
            <div class="bx_catalog_text">
                <?
                $APPLICATION->IncludeComponent(
                        "bitrix:catalog.section.lis",
                        "mainpage",
                        array(
                            "IBLOCK_TYPE" => "catalog",
                            "IBLOCK_ID" => "2",
                            "AJAX_MODE" => "N",
                            "CACHE_TYPE" => "A",
                            "CACHE_TIME" => "36000",
                            "CACHE_FILTER" => "N",
                            "CACHE_GROUPS" => "Y",
                            "COUNT_ELEMENTS" => "N",
                            "TOP_DEPTH" => 1,
                            //"SECTION_URL" => $arResult["FOLDER"].$arResult["URL_TEMPATES"]["section"],
                            "VIEW_MODE" => "TEXT",
                            "SECTION_FIELDS" => array("UF_DONT_SHOW", "PICTURE"),
                            "SHOW_PARENT_NAME" => "N",
                            "HIDE_SECTION_NAME" => "N",
                            "ADD_SECTIONS_CHAIN" => 'N'
                        ),
                        $component,
                        array("HIDE_ICONS" => "Y")
                );
                ?>

            </div>
            <? if (CGetfood::getOption("SEO_TEXT") == 'true') { ?>
                <div><? $APPLICATION->IncludeComponent("bitrix:main.includ", "seo", array("AREA_FILE_SHOW" => "file", "PATH" => SITE_DIR . "include/main_text.php"), false); ?></div>    
            <? } ?>

            <?
            if (CGetfood::getOption("SMALL_BANNER2") == 'true') {
                $APPLICATION->IncludeComponent("bitrix:main.include", "", array("AREA_FILESHOW" => "file", "PATH" => SITE_DIR . "include/banner2.php"), false);
            }
            ?>
        </div>
    </div>
<? } ?>

<? require ($_SERVER["DOCUMENT_ROOT"] . "/bitrix/footer.php"); ?>