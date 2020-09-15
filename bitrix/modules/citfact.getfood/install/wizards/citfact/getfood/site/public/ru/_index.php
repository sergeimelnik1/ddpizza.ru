<? require ($_SERVER["DOCUMENT_ROOT"]."/bitrix/header.php");
$APPLICATION->SetPageProperty("NOT_SHOW_NAV_CHAIN", "Y");
$APPLICATION->SetTitle("Интернет-магазин доставки");
?>

<div class="index-page-wrapper">

<div class="product-tabs">
    <ul class="nav nav-tabs" role="tablist">
        <li role="presentation" style="display: none">
            <a href="#new-products" aria-controls="new-products" role="tab">Новинки</a>
        </li>
        <li role="presentation" style="display: none">
            <a href="#hit-products" aria-controls="hit-products" role="tab">Хит</a>
        </li>
    </ul>
    <div class="tab-content">
        <div role="tabpanel" class="tab-pane" id="new-products">
            <?
            global $arrFilter1;
            $arrFilter1 = Array("PROPERTY_NEWPRODUCT_VALUE" => "да", "ACTIVE" => "Y", "ACTIVE_DATE" => "Y", "SECTION_GLOBAL_ACTIVE" => "Y");
            ?>
            <?
                $APPLICATION->IncludeComponent(
                    "bitrix:catalog.section",
                    "scrollbar2",
                    array(
                        "IBLOCK_TYPE" => "catalog",
                        "IBLOCK_ID" => "#CATALOG_IBLOCK_ID#",
                        "SECTION_ID" => "",
                        "SECTION_CODE" => "",
                        "SLIDER_ID" => 'new-products',
                        "SECTION_NAME" => "Наши новинки",
                        "SECTION_USER_FIELDS" => array(
                            0 => "",
                            1 => "",
                        ),
                        "ELEMENT_SORT_FIELD" => "sort",
                        "ELEMENT_SORT_ORDER" => "asc",
                        "ELEMENT_SORT_FIELD2" => "name",
                        "ELEMENT_SORT_ORDER2" => "asc",
                        "FILTER_NAME" => "arrFilter1",
                        "INCLUDE_SUBSECTIONS" => "Y",
                        "SHOW_ALL_WO_SECTION" => "Y",
                        "HIDE_NOT_AVAILABLE" => "Y",
                        "PAGE_ELEMENT_COUNT" => "20",
                        "LINE_ELEMENT_COUNT" => "3",
                        "PRODUCT_DISPLAY_MODE" => "Y",
                        "ADD_PICT_PROP" => "MORE_PHOTO",
                        "PROPERTY_CODE" => array(
                            1 => "ARTNUMBER",
                            2 => "PROTEINS",
                            3 => "FATS",
                            4 => "CARBOHYDRATES",
                            5 => "CALORIE",
                            6 => "CALORIES",
                            7 => "TASTE",
                            8 => "TYPES",
                            9 => "DOUGH"
                        ),
                        "OFFERS_FIELD_CODE" => array(
                            0 => "ID",
                            1 => "NAME",
                            2 => "PREVIEW_TEXT",
                            3 => "PREVIEW_PICTURE",
                            4 => "",
                        ),
                        "OFFERS_PROPERTY_CODE" => array(
                            0 => "WEIGHT",
                            1 => "DOUGH",
                            2 => "QUANT",
                            3 => "NACHINKA",
                            4 => "",
                        ),
                        "OFFERS_SORT_FIELD" => "sort",
                        "OFFERS_SORT_ORDER" => "asc",
                        "OFFERS_SORT_FIELD2" => "name",
                        "OFFERS_SORT_ORDER2" => "asc",
                        "OFFERS_LIMIT" => "0",
                        "SECTION_URL" => "#SITE_DIR#catalog/#SECTION_CODE#/",
                        "DETAIL_URL" => "#SITE_DIR#catalog/#SECTION_CODE#/#ELEMENT_CODE#/",
                        "SECTION_ID_VARIABLE" => "SECTION_ID",
                        "AJAX_MODE" => "N",
                        "AJAX_OPTION_JUMP" => "N",
                        "AJAX_OPTION_STYLE" => "N",
                        "AJAX_OPTION_HISTORY" => "N",
                        "CACHE_TYPE" => "A",
                        "CACHE_TIME" => "36000000",
                        "CACHE_GROUPS" => "Y",
                        "SET_META_KEYWORDS" => "N",
                        "META_KEYWORDS" => "-",
                        "SET_META_DESCRIPTION" => "N",
                        "META_DESCRIPTION" => "-",
                        "BROWSER_TITLE" => "-",
                        "ADD_SECTIONS_CHAIN" => "N",
                        "DISPLAY_COMPARE" => "Y",
                        "SET_TITLE" => "N",
                        "SET_STATUS_404" => "N",
                        "CACHE_FILTER" => "Y",
                        "PRICE_CODE" => array(
                            0 => "BASE",
                        ),
                        "USE_PRICE_COUNT" => "N",
                        "SHOW_PRICE_COUNT" => "1",
                        "PRICE_VAT_INCLUDE" => "Y",
                        "CONVERT_CURRENCY" => "Y",
                        "BASKET_URL" => "#SITE_DIR#personal/cart/",
                        "ACTION_VARIABLE" => "action",
                        "PRODUCT_ID_VARIABLE" => "id",
                        "USE_PRODUCT_QUANTITY" => "Y",
                        "PRODUCT_QUANTITY_VARIABLE" => "quantity",
                        "ADD_PROPERTIES_TO_BASKET" => "Y",
                        "PRODUCT_PROPS_VARIABLE" => "prop",
                        "PARTIAL_PRODUCT_PROPERTIES" => "Y",
                        "PRODUCT_PROPERTIES" => array(
                        ),
                        "OFFERS_CART_PROPERTIES" => array(
                            0 => "WEIGHT",
                            1 => "DOUGH",
                            2 => "QUANT",
                            3 => "NACHINKA",
                        ),
                        "PAGER_TEMPLATE" => ".default",
                        "DISPLAY_TOP_PAGER" => "N",
                        "DISPLAY_BOTTOM_PAGER" => "N",
                        "PAGER_TITLE" => "Товары",
                        "PAGER_SHOW_ALWAYS" => "N",
                        "PAGER_DESC_NUMBERING" => "N",
                        "PAGER_DESC_NUMBERING_CACHE_TIME" => "36000",
                        "PAGER_SHOW_ALL" => "N",
                        "AJAX_OPTION_ADDITIONAL" => "",
                        "MESS_BTN_BUY" => "Купить",
                        "MESS_BTN_ADD_TO_BASKET" => "Купить",
                        "MESS_BTN_SUBSCRIBE" => "Подписаться",
                        "MESS_BTN_DETAIL" => "Подробнее",
                        "MESS_NOT_AVAILABLE" => "Нет в наличии",
                        "LABEL_PROP" => "NEWPRODUCT",
                        "OFFER_ADD_PICT_PROP" => "MORE_PHOTO",
                        "OFFER_TREE_PROPS" => array(
                            0 => "WEIGHT",
                            1 => "DOUGH",
                            2 => "NACHINKA",
                            3 => "QUANT",
                        ),
                        "PRODUCT_SUBSCRIPTION" => "Y",
                        "SHOW_DISCOUNT_PERCENT" => "Y",
                        "DISCOUNT_PERCENT_POSITION" => "top-right",
                        "SHOW_OLD_PRICE" => "Y",
                        "SET_BROWSER_TITLE" => "N",
                        "CURRENCY_ID" => "RUB",
                        "TOP" => "Y",
                        "COMPARE_PATH" => "#SITE_DIR#catalog/compare/",
                        "NOT_LAZY_COUNTER" => "3",
                        "COMPONENT_TEMPLATE" => "scroll",
                        "BACKGROUND_IMAGE" => "-",
                        "SEF_MODE" => "N",
                        "SET_LAST_MODIFIED" => "N",
                        "USE_MAIN_ELEMENT_SECTION" => "N",
                        "PAGER_BASE_LINK_ENABLE" => "N",
                        "SHOW_404" => "N",
                        "MESSAGE_404" => "",
                        "DISABLE_INIT_JS_IN_COMPONENT" => "N",
                        "SHOW_CLOSE_POPUP" => "Y",
                    ),
                    false
                );
            ?>
        </div>
        <div role="tabpanel" class="tab-pane" id="hit-products">
            <?
            global $arrFilter2;
            $arrFilter2 = Array("PROPERTY_SALELEADER_VALUE" => "да", "ACTIVE" => "Y", "ACTIVE_DATE" => "Y", "SECTION_GLOBAL_ACTIVE" => "Y");
            ?>
            <?$APPLICATION->IncludeComponent(
                "bitrix:catalog.section",
                "scrollbar2",
                array(
                    "IBLOCK_TYPE" => "catalog",
                    "IBLOCK_ID" => "#CATALOG_IBLOCK_ID#",
                    "SECTION_ID" => "",
                    "SLIDER_ID" => 'hit-products',
                    "SECTION_CODE" => "",
                    "SECTION_NAME" => "Хиты продаж",
                    "SECTION_USER_FIELDS" => array(
                        0 => "",
                        1 => "",
                    ),
                    "ELEMENT_SORT_FIELD" => "sort",
                    "ELEMENT_SORT_ORDER" => "asc",
                    "ELEMENT_SORT_FIELD2" => "name",
                    "ELEMENT_SORT_ORDER2" => "asc",
                    "FILTER_NAME" => "arrFilter2",
                    "INCLUDE_SUBSECTIONS" => "Y",
                    "SHOW_ALL_WO_SECTION" => "Y",
                    "HIDE_NOT_AVAILABLE" => "Y",
                    "PAGE_ELEMENT_COUNT" => "20",
                    "LINE_ELEMENT_COUNT" => "3",
                    "PRODUCT_DISPLAY_MODE" => "Y",
                    "ADD_PICT_PROP" => "MORE_PHOTO",
	                "PROPERTY_CODE" => array(
		                1 => "ARTNUMBER",
		                2 => "PROTEINS",
		                3 => "FATS",
		                4 => "CARBOHYDRATES",
		                5 => "CALORIE",
		                6 => "CALORIES",
		                7 => "TASTE",
		                8 => "TYPES",
		                9 => "DOUGH"
	                ),
                    "OFFERS_FIELD_CODE" => array(
                        0 => "ID",
                        1 => "NAME",
                        2 => "PREVIEW_TEXT",
                        3 => "PREVIEW_PICTURE",
                        4 => "",
                    ),
                    "OFFERS_PROPERTY_CODE" => array(
                        0 => "WEIGHT",
                        1 => "DOUGH",
                        2 => "QUANT",
                        3 => "NACHINKA",
                        4 => "",
                    ),
                    "OFFERS_SORT_FIELD" => "sort",
                    "OFFERS_SORT_ORDER" => "asc",
                    "OFFERS_SORT_FIELD2" => "name",
                    "OFFERS_SORT_ORDER2" => "asc",
                    "OFFERS_LIMIT" => "0",
                    "SECTION_URL" => "#SITE_DIR#catalog/#SECTION_CODE#/",
                    "DETAIL_URL" => "#SITE_DIR#catalog/#SECTION_CODE#/#ELEMENT_CODE#/",
                    "SECTION_ID_VARIABLE" => "SECTION_ID",
                    "AJAX_MODE" => "N",
                    "AJAX_OPTION_JUMP" => "N",
                    "AJAX_OPTION_STYLE" => "N",
                    "AJAX_OPTION_HISTORY" => "N",
                    "CACHE_TYPE" => "A",
                    "CACHE_TIME" => "36000000",
                    "CACHE_GROUPS" => "Y",
                    "SET_META_KEYWORDS" => "N",
                    "META_KEYWORDS" => "-",
                    "SET_META_DESCRIPTION" => "N",
                    "META_DESCRIPTION" => "-",
                    "BROWSER_TITLE" => "-",
                    "ADD_SECTIONS_CHAIN" => "N",
                    "DISPLAY_COMPARE" => "Y",
                    "SET_TITLE" => "N",
                    "SET_STATUS_404" => "N",
                    "CACHE_FILTER" => "Y",
                    "PRICE_CODE" => array(
                        0 => "BASE",
                    ),
                    "USE_PRICE_COUNT" => "N",
                    "SHOW_PRICE_COUNT" => "1",
                    "PRICE_VAT_INCLUDE" => "Y",
                    "CONVERT_CURRENCY" => "Y",
                    "BASKET_URL" => "#SITE_DIR#personal/cart/",
                    "ACTION_VARIABLE" => "action",
                    "PRODUCT_ID_VARIABLE" => "id",
                    "USE_PRODUCT_QUANTITY" => "Y",
                    "PRODUCT_QUANTITY_VARIABLE" => "quantity",
                    "ADD_PROPERTIES_TO_BASKET" => "Y",
                    "PRODUCT_PROPS_VARIABLE" => "prop",
                    "PARTIAL_PRODUCT_PROPERTIES" => "Y",
                    "PRODUCT_PROPERTIES" => array(
                    ),
                    "OFFERS_CART_PROPERTIES" => array(
                        0 => "WEIGHT",
                        1 => "DOUGH",
                        2 => "QUANT",
                        3 => "NACHINKA",
                    ),
                    "PAGER_TEMPLATE" => ".default",
                    "DISPLAY_TOP_PAGER" => "N",
                    "DISPLAY_BOTTOM_PAGER" => "N",
                    "PAGER_TITLE" => "Товары",
                    "PAGER_SHOW_ALWAYS" => "N",
                    "PAGER_DESC_NUMBERING" => "N",
                    "PAGER_DESC_NUMBERING_CACHE_TIME" => "36000",
                    "PAGER_SHOW_ALL" => "N",
                    "AJAX_OPTION_ADDITIONAL" => "",
                    "MESS_BTN_BUY" => "Купить",
                    "MESS_BTN_ADD_TO_BASKET" => "Купить",
                    "MESS_BTN_SUBSCRIBE" => "Подписаться",
                    "MESS_BTN_DETAIL" => "Подробнее",
                    "MESS_NOT_AVAILABLE" => "Нет в наличии",
                    "LABEL_PROP" => "-",
                    "OFFER_ADD_PICT_PROP" => "MORE_PHOTO",
                    "OFFER_TREE_PROPS" => array(
                        0 => "WEIGHT",
                        1 => "DOUGH",
                        2 => "NACHINKA",
                        3 => "QUANT",
                    ),
                    "PRODUCT_SUBSCRIPTION" => "Y",
                    "SHOW_DISCOUNT_PERCENT" => "Y",
	                "DISCOUNT_PERCENT_POSITION" => "top-right",
                    "SHOW_OLD_PRICE" => "Y",
                    "SET_BROWSER_TITLE" => "N",
                    "CURRENCY_ID" => "RUB",
                    "TOP" => "Y",
                    "COMPARE_PATH" => "#SITE_DIR#catalog/compare/",
	                "SHOW_CLOSE_POPUP" => "Y",
                ),
                false
            );?>
        </div>
    </div>
</div>

    <?
    if(CGetfood::getOption("SMALL_BANNER1") == 'true'){
        $APPLICATION->IncludeComponent("bitrix:main.include", "", array("AREA_FILE_SHOW" => "file", "PATH" => SITE_DIR."include/banner1.php"), false);
    }
    ?>

	<?$APPLICATION->IncludeComponent(
		"bitrix:catalog.section.list",
		"home",
		array(
			"IBLOCK_TYPE" => "catalog",
			"IBLOCK_ID" => "#CATALOG_IBLOCK_ID#",
			"SECTION_ID" => "0",
			"SECTION_CODE" => "",
			"CACHE_TYPE" => "A",
			"CACHE_TIME" => "36000000",
			"CACHE_GROUPS" => "Y",
			"COUNT_ELEMENTS" => "N",
			"TOP_DEPTH" => "1",
			"SECTION_URL" => "#SECTION_CODE#/",
			"SHOW_PARENT_NAME" => "N",
			"HIDE_SECTION_NAME" => "N",
			"ADD_SECTIONS_CHAIN" => "Y",
			"COMPONENT_TEMPLATE" => "home",
			"SECTION_FIELDS" => array(
				0 => "",
				1 => "",
			),
			"SECTION_USER_FIELDS" => array(
				0 => "",
				1 => "",
			),
			"VIEW_MODE" => "LINE"
		),
		false
	);?>

    <?if(CGetfood::getOption("NEWS") == 'true'){?>
    <div class="news-block clearfix">
        <div class="container">
            <a href="/news/" class="news-block__all">Все новости</a>
            <h3 class="news-block__title"><span class="news-block__title-strong">Новости</span> компании</h3>
            <div class="row">
                <?$APPLICATION->IncludeComponent(
					"bitrix:news.list",
					"home",
					array(
						"IBLOCK_TYPE" => "news",
						"IBLOCK_ID" => "#NEWS_IBLOCK_ID#",
						"NEWS_COUNT" => "2",
						"USE_SEARCH" => "N",
						"USE_RSS" => "Y",
						"NUM_NEWS" => "2",
						"NUM_DAYS" => "180",
						"YANDEX" => "N",
						"USE_RATING" => "N",
						"USE_CATEGORIES" => "N",
						"USE_REVIEW" => "N",
						"USE_FILTER" => "N",
						"SORT_BY1" => "ACTIVE_FROM",
						"SORT_ORDER1" => "DESC",
						"SORT_BY2" => "SORT",
						"SORT_ORDER2" => "ASC",
						"CHECK_DATES" => "Y",
						"SEF_MODE" => "N",
						"SEF_FOLDER" => "",
						"AJAX_MODE" => "N",
						"AJAX_OPTION_SHADOW" => "Y",
						"AJAX_OPTION_JUMP" => "N",
						"AJAX_OPTION_STYLE" => "Y",
						"AJAX_OPTION_HISTORY" => "N",
						"CACHE_TYPE" => "A",
						"CACHE_TIME" => "36000000",
						"CACHE_FILTER" => "Y",
						"CACHE_GROUPS" => "Y",
						"DISPLAY_PANEL" => "Y",
						"SET_TITLE" => "N",
						"SET_STATUS_404" => "Y",
						"INCLUDE_IBLOCK_INTO_CHAIN" => "N",
						"ADD_SECTIONS_CHAIN" => "N",
						"USE_PERMISSIONS" => "N",
						"PREVIEW_TRUNCATE_LEN" => "",
						"LIST_ACTIVE_DATE_FORMAT" => "d.m.Y",
						"LIST_FIELD_CODE" => array(
							0 => "",
							1 => "",
						),
						"LIST_PROPERTY_CODE" => array(
							0 => "",
							1 => "",
						),
						"HIDE_LINK_WHEN_NO_DETAIL" => "N",
						"DISPLAY_NAME" => "Y",
						"META_KEYWORDS" => "-",
						"META_DESCRIPTION" => "-",
						"BROWSER_TITLE" => "-",
						"DETAIL_ACTIVE_DATE_FORMAT" => "d.m.Y",
						"DETAIL_FIELD_CODE" => array(
							0 => "",
							1 => "",
						),
						"DETAIL_PROPERTY_CODE" => array(
							0 => "",
							1 => "",
						),
						"DETAIL_DISPLAY_TOP_PAGER" => "N",
						"DETAIL_DISPLAY_BOTTOM_PAGER" => "Y",
						"DETAIL_PAGER_TITLE" => "Страница",
						"DETAIL_PAGER_TEMPLATE" => "",
						"DETAIL_PAGER_SHOW_ALL" => "Y",
						"DISPLAY_TOP_PAGER" => "N",
						"DISPLAY_BOTTOM_PAGER" => "N",
						"PAGER_SHOW_ALWAYS" => "N",
						"PAGER_TEMPLATE" => "",
						"PAGER_DESC_NUMBERING" => "N",
						"PAGER_DESC_NUMBERING_CACHE_TIME" => "36000000",
						"PAGER_SHOW_ALL" => "N",
						"DISPLAY_DATE" => "Y",
						"DISPLAY_PICTURE" => "Y",
						"DISPLAY_PREVIEW_TEXT" => "Y",
						"AJAX_OPTION_ADDITIONAL" => "",
						"COMPONENT_TEMPLATE" => "home",
						"FILTER_NAME" => "",
						"FIELD_CODE" => array(
							0 => "",
							1 => "",
						),
						"PROPERTY_CODE" => array(
							0 => "",
							1 => "",
						),
						"DETAIL_URL" => "",
						"ACTIVE_DATE_FORMAT" => "d.m.Y",
						"SET_BROWSER_TITLE" => "Y",
						"SET_META_KEYWORDS" => "Y",
						"SET_META_DESCRIPTION" => "Y",
						"SET_LAST_MODIFIED" => "N",
						"PARENT_SECTION" => "",
						"PARENT_SECTION_CODE" => "",
						"INCLUDE_SUBSECTIONS" => "Y",
						"PAGER_TITLE" => "Новости",
						"PAGER_BASE_LINK_ENABLE" => "N",
						"SHOW_404" => "N",
						"MESSAGE_404" => ""
					),
					false
				);?>
            </div>
        </div>
    </div>
    <?}?>
    

    <div class="product-tabs">
        <ul class="nav nav-tabs" role="tablist">
            <li role="presentation" class="active" style="display: none;">
                <a href="#discount-products2" aria-controls="discount-products2" role="tab">Акции</a>
            </li>
            <li role="presentation" style="display: none;">
                <a href="#recommended-products2" aria-controls="recommended-products2" role="tab">Рекомендуем</a>
            </li>
        </ul>
        <div class="tab-content">
            <div role="tabpanel" class="tab-pane" id="discount-products2">
                <?
                global $arrFilter2;
                $arrFilter2 = Array("PROPERTY_SPECIALOFFER_VALUE" => "да", "ACTIVE" => "Y", "ACTIVE_DATE" => "Y", "SECTION_GLOBAL_ACTIVE" => "Y");
                ?>
                <?$APPLICATION->IncludeComponent(
                    "bitrix:catalog.section",
                    "scrollbar2",
                    array(
                        "IBLOCK_TYPE" => "catalog",
                        "IBLOCK_ID" => "#CATALOG_IBLOCK_ID#",
                        "SECTION_ID" => "",
                        "SECTION_CODE" => "",
                        "SLIDER_ID" => "discount-products2",
                        "SECTION_NAME" => "Хиты продаж",
                        "SECTION_USER_FIELDS" => array(
                            0 => "",
                            1 => "",
                        ),
                        "ELEMENT_SORT_FIELD" => "sort",
                        "ELEMENT_SORT_ORDER" => "asc",
                        "ELEMENT_SORT_FIELD2" => "name",
                        "ELEMENT_SORT_ORDER2" => "asc",
                        "FILTER_NAME" => "arrFilter2",
                        "INCLUDE_SUBSECTIONS" => "Y",
                        "SHOW_ALL_WO_SECTION" => "Y",
                        "HIDE_NOT_AVAILABLE" => "Y",
                        "PAGE_ELEMENT_COUNT" => "20",
                        "LINE_ELEMENT_COUNT" => "3",
                        "PRODUCT_DISPLAY_MODE" => "Y",
                        "ADD_PICT_PROP" => "MORE_PHOTO",
	                    "PROPERTY_CODE" => array(
		                    1 => "ARTNUMBER",
		                    2 => "PROTEINS",
		                    3 => "FATS",
		                    4 => "CARBOHYDRATES",
		                    5 => "CALORIE",
		                    6 => "CALORIES",
		                    7 => "TASTE",
		                    8 => "TYPES",
		                    9 => "DOUGH"
	                    ),
                        "OFFERS_FIELD_CODE" => array(
                            0 => "ID",
                            1 => "NAME",
                            2 => "PREVIEW_TEXT",
                            3 => "PREVIEW_PICTURE",
                            4 => "",
                        ),
                        "OFFERS_PROPERTY_CODE" => array(
                            0 => "WEIGHT",
                            1 => "DOUGH",
                            2 => "QUANT",
                            3 => "NACHINKA",
                            4 => "",
                        ),
                        "OFFERS_SORT_FIELD" => "sort",
                        "OFFERS_SORT_ORDER" => "asc",
                        "OFFERS_SORT_FIELD2" => "name",
                        "OFFERS_SORT_ORDER2" => "asc",
                        "OFFERS_LIMIT" => "0",
                        "SECTION_URL" => "#SITE_DIR#catalog/#SECTION_CODE#/",
                        "DETAIL_URL" => "#SITE_DIR#catalog/#SECTION_CODE#/#ELEMENT_CODE#/",
                        "SECTION_ID_VARIABLE" => "SECTION_ID",
                        "AJAX_MODE" => "N",
                        "AJAX_OPTION_JUMP" => "N",
                        "AJAX_OPTION_STYLE" => "N",
                        "AJAX_OPTION_HISTORY" => "N",
                        "CACHE_TYPE" => "A",
                        "CACHE_TIME" => "36000000",
                        "CACHE_GROUPS" => "Y",
                        "SET_META_KEYWORDS" => "N",
                        "META_KEYWORDS" => "-",
                        "SET_META_DESCRIPTION" => "N",
                        "META_DESCRIPTION" => "-",
                        "BROWSER_TITLE" => "-",
                        "ADD_SECTIONS_CHAIN" => "N",
                        "DISPLAY_COMPARE" => "Y",
                        "SET_TITLE" => "N",
                        "SET_STATUS_404" => "N",
                        "CACHE_FILTER" => "Y",
                        "PRICE_CODE" => array(
                            0 => "BASE",
                        ),
                        "USE_PRICE_COUNT" => "N",
                        "SHOW_PRICE_COUNT" => "1",
                        "PRICE_VAT_INCLUDE" => "Y",
                        "CONVERT_CURRENCY" => "Y",
                        "BASKET_URL" => "#SITE_DIR#personal/cart/",
                        "ACTION_VARIABLE" => "action",
                        "PRODUCT_ID_VARIABLE" => "id",
                        "USE_PRODUCT_QUANTITY" => "Y",
                        "PRODUCT_QUANTITY_VARIABLE" => "quantity",
                        "ADD_PROPERTIES_TO_BASKET" => "Y",
                        "PRODUCT_PROPS_VARIABLE" => "prop",
                        "PARTIAL_PRODUCT_PROPERTIES" => "Y",
                        "PRODUCT_PROPERTIES" => array(
                        ),
                        "OFFERS_CART_PROPERTIES" => array(
                            0 => "WEIGHT",
                            1 => "DOUGH",
                            2 => "QUANT",
                            3 => "NACHINKA",
                        ),
                        "PAGER_TEMPLATE" => ".default",
                        "DISPLAY_TOP_PAGER" => "N",
                        "DISPLAY_BOTTOM_PAGER" => "N",
                        "PAGER_TITLE" => "Товары",
                        "PAGER_SHOW_ALWAYS" => "N",
                        "PAGER_DESC_NUMBERING" => "N",
                        "PAGER_DESC_NUMBERING_CACHE_TIME" => "36000",
                        "PAGER_SHOW_ALL" => "N",
                        "AJAX_OPTION_ADDITIONAL" => "",
                        "MESS_BTN_BUY" => "Купить",
                        "MESS_BTN_ADD_TO_BASKET" => "Купить",
                        "MESS_BTN_SUBSCRIBE" => "Подписаться",
                        "MESS_BTN_DETAIL" => "Подробнее",
                        "MESS_NOT_AVAILABLE" => "Нет в наличии",
                        "LABEL_PROP" => "-",
                        "OFFER_ADD_PICT_PROP" => "MORE_PHOTO",
                        "OFFER_TREE_PROPS" => array(
                            0 => "WEIGHT",
                            1 => "DOUGH",
                            2 => "NACHINKA",
                            3 => "QUANT",
                        ),
                        "PRODUCT_SUBSCRIPTION" => "Y",
                        "SHOW_DISCOUNT_PERCENT" => "Y",
	                    "DISCOUNT_PERCENT_POSITION" => "top-right",
                        "SHOW_OLD_PRICE" => "Y",
                        "SET_BROWSER_TITLE" => "N",
                        "CURRENCY_ID" => "RUB",
                        "COMPARE_PATH" => "#SITE_DIR#catalog/compare/",
	                    "SHOW_CLOSE_POPUP" => "Y",
                    ),
                    false
                );?>
            </div>
            <div role="tabpanel" class="tab-pane" id="recommended-products2">
                <?
                global $arrFilter2;
                $arrFilter2 = Array("PROPERTY_PRECOMMEND_VALUE" => "да", "ACTIVE" => "Y", "ACTIVE_DATE" => "Y", "SECTION_GLOBAL_ACTIVE" => "Y");
                ?>
                <?$APPLICATION->IncludeComponent(
                    "bitrix:catalog.section",
                    "scrollbar2",
                    array(
                        "IBLOCK_TYPE" => "catalog",
                        "IBLOCK_ID" => "#CATALOG_IBLOCK_ID#",
                        "SECTION_ID" => "",
                        "SECTION_CODE" => "",
                        "SLIDER_ID" => "recommended-products2",
                        "SECTION_NAME" => "Хиты продаж",
                        "SECTION_USER_FIELDS" => array(
                            0 => "",
                            1 => "",
                        ),
                        "ELEMENT_SORT_FIELD" => "sort",
                        "ELEMENT_SORT_ORDER" => "asc",
                        "ELEMENT_SORT_FIELD2" => "name",
                        "ELEMENT_SORT_ORDER2" => "asc",
                        "FILTER_NAME" => "arrFilter2",
                        "INCLUDE_SUBSECTIONS" => "Y",
                        "SHOW_ALL_WO_SECTION" => "Y",
                        "HIDE_NOT_AVAILABLE" => "Y",
                        "PAGE_ELEMENT_COUNT" => "20",
                        "LINE_ELEMENT_COUNT" => "3",
                        "PRODUCT_DISPLAY_MODE" => "Y",
                        "ADD_PICT_PROP" => "MORE_PHOTO",
	                    "PROPERTY_CODE" => array(
		                    1 => "ARTNUMBER",
		                    2 => "PROTEINS",
		                    3 => "FATS",
		                    4 => "CARBOHYDRATES",
		                    5 => "CALORIE",
		                    6 => "CALORIES",
		                    7 => "TASTE",
		                    8 => "TYPES",
		                    9 => "DOUGH"
	                    ),
                        "OFFERS_FIELD_CODE" => array(
                            0 => "ID",
                            1 => "NAME",
                            2 => "PREVIEW_TEXT",
                            3 => "PREVIEW_PICTURE",
                            4 => "",
                        ),
                        "OFFERS_PROPERTY_CODE" => array(
                            0 => "WEIGHT",
                            1 => "DOUGH",
                            2 => "QUANT",
                            3 => "NACHINKA",
                            4 => "",
                        ),
                        "OFFERS_SORT_FIELD" => "sort",
                        "OFFERS_SORT_ORDER" => "asc",
                        "OFFERS_SORT_FIELD2" => "name",
                        "OFFERS_SORT_ORDER2" => "asc",
                        "OFFERS_LIMIT" => "0",
                        "SECTION_URL" => "#SITE_DIR#catalog/#SECTION_CODE#/",
                        "DETAIL_URL" => "#SITE_DIR#catalog/#SECTION_CODE#/#ELEMENT_CODE#/",
                        "SECTION_ID_VARIABLE" => "SECTION_ID",
                        "AJAX_MODE" => "N",
                        "AJAX_OPTION_JUMP" => "N",
                        "AJAX_OPTION_STYLE" => "N",
                        "AJAX_OPTION_HISTORY" => "N",
                        "CACHE_TYPE" => "A",
                        "CACHE_TIME" => "36000000",
                        "CACHE_GROUPS" => "Y",
                        "SET_META_KEYWORDS" => "N",
                        "META_KEYWORDS" => "-",
                        "SET_META_DESCRIPTION" => "N",
                        "META_DESCRIPTION" => "-",
                        "BROWSER_TITLE" => "-",
                        "ADD_SECTIONS_CHAIN" => "N",
                        "DISPLAY_COMPARE" => "Y",
                        "SET_TITLE" => "N",
                        "SET_STATUS_404" => "N",
                        "CACHE_FILTER" => "Y",
                        "PRICE_CODE" => array(
                            0 => "BASE",
                        ),
                        "USE_PRICE_COUNT" => "N",
                        "SHOW_PRICE_COUNT" => "1",
                        "PRICE_VAT_INCLUDE" => "Y",
                        "CONVERT_CURRENCY" => "Y",
                        "BASKET_URL" => "#SITE_DIR#personal/cart/",
                        "ACTION_VARIABLE" => "action",
                        "PRODUCT_ID_VARIABLE" => "id",
                        "USE_PRODUCT_QUANTITY" => "Y",
                        "PRODUCT_QUANTITY_VARIABLE" => "quantity",
                        "ADD_PROPERTIES_TO_BASKET" => "Y",
                        "PRODUCT_PROPS_VARIABLE" => "prop",
                        "PARTIAL_PRODUCT_PROPERTIES" => "Y",
                        "PRODUCT_PROPERTIES" => array(
                        ),
                        "OFFERS_CART_PROPERTIES" => array(
                            0 => "WEIGHT",
                            1 => "DOUGH",
                            2 => "QUANT",
                            3 => "NACHINKA",
                        ),
                        "PAGER_TEMPLATE" => ".default",
                        "DISPLAY_TOP_PAGER" => "N",
                        "DISPLAY_BOTTOM_PAGER" => "N",
                        "PAGER_TITLE" => "Товары",
                        "PAGER_SHOW_ALWAYS" => "N",
                        "PAGER_DESC_NUMBERING" => "N",
                        "PAGER_DESC_NUMBERING_CACHE_TIME" => "36000",
                        "PAGER_SHOW_ALL" => "N",
                        "AJAX_OPTION_ADDITIONAL" => "",
                        "MESS_BTN_BUY" => "Купить",
                        "MESS_BTN_ADD_TO_BASKET" => "Купить",
                        "MESS_BTN_SUBSCRIBE" => "Подписаться",
                        "MESS_BTN_DETAIL" => "Подробнее",
                        "MESS_NOT_AVAILABLE" => "Нет в наличии",
                        "LABEL_PROP" => "-",
                        "OFFER_ADD_PICT_PROP" => "MORE_PHOTO",
                        "OFFER_TREE_PROPS" => array(
                            0 => "WEIGHT",
                            1 => "DOUGH",
                            2 => "NACHINKA",
                            3 => "QUANT",
                        ),
                        "PRODUCT_SUBSCRIPTION" => "Y",
                        "SHOW_DISCOUNT_PERCENT" => "Y",
	                    "DISCOUNT_PERCENT_POSITION" => "top-right",
                        "SHOW_OLD_PRICE" => "Y",
                        "SET_BROWSER_TITLE" => "N",
                        "CURRENCY_ID" => "RUB",
                        "COMPARE_PATH" => "#SITE_DIR#catalog/compare/",
	                    "SHOW_CLOSE_POPUP" => "Y",
                    ),
                    false
                );?>
            </div>
        </div>
    </div>

	
    <?if(CGetfood::getOption("SEO_TEXT") == 'true'){?>
        <div><?$APPLICATION->IncludeComponent("bitrix:main.include", "seo", array("AREA_FILE_SHOW" => "file", "PATH" => SITE_DIR."include/main_text.php"), false);?></div>    
    <?}?>

    <?
    if(CGetfood::getOption("SMALL_BANNER2") == 'true'){
        $APPLICATION->IncludeComponent("bitrix:main.include", "", array("AREA_FILE_SHOW" => "file", "PATH" => SITE_DIR."include/banner2.php"), false);
    }
    ?>
</div>

<? require ($_SERVER["DOCUMENT_ROOT"]."/bitrix/footer.php"); ?>