<?
if(!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED!==true)die();

$arServices = Array(
	"main" => Array(
		"NAME" => GetMessage("SERVICE_MAIN_SETTINGS"),
		"STAGES" => Array(
			"files.php", // Copy bitrix files
			"search.php", // Indexing files
			"template.php", // Install template
			"theme.php", // Install theme
			"menu.php", // Install menu
			"settings.php",
			"agreement.php",
		),
	),
	"iblock" => Array(
		"NAME" => GetMessage("SERVICE_IBLOCK_DEMO_DATA"),
		"STAGES" => Array(
			"types.php", //IBlock types
			"news.php",
			"references.php",//reference of colors
			"references2.php",
			"catalog.php",//catalog iblock import
			"catalog2.php",//offers iblock import
			"catalog3.php",
			"main_slider.php",
			"social_links.php",
			"feedback.php"
		),
	),
	"sale" => Array(
		"NAME" => GetMessage("SERVICE_SALE_DEMO_DATA"),
		"STAGES" => Array(
			"locations.php", "step1.php", "step2.php", "step3.php"
		),
	),
	"catalog" => Array(
		"NAME" => GetMessage("SERVICE_CATALOG_SETTINGS"),
		"STAGES" => Array(
			"index.php",
			"eshopapp.php",
		),
	),
	"forum" => Array(
		"NAME" => GetMessage("SERVICE_FORUM")
	)
);
?>