<? require($_SERVER["DOCUMENT_ROOT"]."/bitrix/header.php");
$APPLICATION->SetTitle("Заказы"); ?>
<div class="box padding margin myorders">
	<?$APPLICATION->IncludeComponent("bitrix:sale.personal.order", "", array(
		"SEF_MODE" => "Y",
		"SEF_FOLDER" => "#SITE_DIR#personal/order/",
		"ORDERS_PER_PAGE" => "10",
		"PATH_TO_PAYMENT" => "/personal/order/payment/",
		"PATH_TO_BASKET" => "/personal/cart/",
		"SET_TITLE" => "Y",
		"SAVE_IN_SESSION" => "N",
		"NAV_TEMPLATE" => ".default",
		"SEF_URL_TEMPLATES" => array(
			"list" => "index.php",
			"detail" => "detail/#ID#/",
			"cancel" => "cancel/#ID#/",
		),
		"SHOW_ACCOUNT_NUMBER" => "Y"
		),
		false
	);?>
</div>
<? require($_SERVER["DOCUMENT_ROOT"]."/bitrix/footer.php"); ?>