<?
if (strtolower($_SERVER["HTTP_X_REQUESTED_WITH"]) == "xmlhttprequest" && $_REQUEST["update_small_basket"] == "Y")
{
	require_once ($_SERVER["DOCUMENT_ROOT"]."/bitrix/modules/main/include/prolog_before.php");
}


$APPLICATION->IncludeComponent(
	"studiofact:sale.basket.basket.line",
	"",
	array(
		"PATH_TO_BASKET" => SITE_DIR."personal/cart/",
		"SHOW_PRODUCTS" => "Y",
		"POSITION_FIXED" => "N",
		"SHOW_PERSONAL_LINK" => "N",
		"SHOW_PRICE" => "Y",
		"SHOW_SUBSCRIBE" => "Y",
		"SHOW_SUMMARY" => "Y",
		"SHOW_TOTAL_PRICE" => "Y",
		"COMPONENT_TEMPLATE" => ".default",
		"PATH_TO_ORDER" => SITE_DIR."personal/order/make/",
		"SHOW_NUM_PRODUCTS" => "Y",
		"SHOW_EMPTY_VALUES" => "Y",
		"PATH_TO_PERSONAL" => SITE_DIR."personal/",
		"SHOW_AUTHOR" => "N",
		"PATH_TO_REGISTER" => SITE_DIR."login/",
		"PATH_TO_AUTHORIZE" => "",
		"PATH_TO_PROFILE" => SITE_DIR."personal/",
		"SHOW_DELAY" => "N",
		"SHOW_NOTAVAIL" => "N",
		"SHOW_IMAGE" => "Y",
		"POSITION_HORIZONTAL" => "right",
		"POSITION_VERTICAL" => "top",
		"HIDE_ON_BASKET_PAGES" => "N"
	),
	false,
	array()
);

if (strtolower($_SERVER["HTTP_X_REQUESTED_WITH"]) == "xmlhttprequest" && $_REQUEST["update_small_basket"] == "Y")
{
	require_once ($_SERVER["DOCUMENT_ROOT"]."/bitrix/modules/main/include/epilog_after.php");
}