<?
require($_SERVER["DOCUMENT_ROOT"]."/bitrix/header.php");
$APPLICATION->SetTitle("CRM");
use Bitrix\Main\Loader; 

Loader::includeModule("iblock"); 
Loader::includeModule("sale");
$datefrom = date("d.m.Y",time())." 00:00:00";

if(isset($_GET["test"])){
	$datefrom = date("d.m.Y",time() - 86400)." 00:00:00";
}

if(isset($_GET["date"])){
    $datefrom = $_GET["date"]." 00:00:00";
}

?>
	 <?$APPLICATION->IncludeComponent(
	"averic:sale.personal.order",
	"",
	Array(
		"ACTIVE_DATE_FORMAT" => "H:i",
		"CACHE_GROUPS" => "Y",
		"CACHE_TIME" => "3600",
		"CACHE_TYPE" => "A",
		"COMPOSITE_FRAME_MODE" => "A",
		"COMPOSITE_FRAME_TYPE" => "AUTO",
		"CUSTOM_SELECT_PROPS" => array(""),
		"DETAIL_HIDE_USER_INFO" => array("0"),
		"DATE_FROM" => $datefrom,
		"HISTORIC_STATUSES" => array("F"),
		"NAV_TEMPLATE" => "",
		"ORDERS_PER_PAGE" => "200",
		"ORDER_DEFAULT_SORT" => "STATUS",
		"PATH_TO_BASKET" => "/personal/cart",
		"PATH_TO_CATALOG" => "/catalog/",
		"PATH_TO_PAYMENT" => "/personal/order/payment/",
		"PROP_1" => array(),
		"REFRESH_PRICES" => "N",
		"RESTRICT_CHANGE_PAYSYSTEM" => array("0"),
		"SAVE_IN_SESSION" => "N",
		"SEF_FOLDER" => "/crm/",
		"SEF_MODE" => "Y",
		"SEF_URL_TEMPLATES" => Array("cancel"=>"cancel/#ID#","detail"=>"detail/#ID#/","list"=>"index.php"),
		"SET_TITLE" => "Y",
		"STATUS_COLOR_A" => "gray",
		"STATUS_COLOR_DA" => "yellow",
		"STATUS_COLOR_F" => "green",
		"STATUS_COLOR_N" => "gray",
		"STATUS_COLOR_PSEUDO_CANCELLED" => "red"
	)
);?> <?



?><?require($_SERVER["DOCUMENT_ROOT"]."/bitrix/footer.php");?>