<?
if(!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED!==true)
	die();

if (!defined("WIZARD_TEMPLATE_ID"))
	return;

$bitrixTemplateDir = $_SERVER["DOCUMENT_ROOT"].BX_PERSONAL_ROOT."/templates/studiofact_getfood";

COption::SetOptionString("main", "sf_template_color", substr($wizard->GetVar("templateID"), 8), false, WIZARD_SITE_ID);

CopyDirFiles(
	$_SERVER["DOCUMENT_ROOT"].WizardServices::GetTemplatesPath(WIZARD_RELATIVE_PATH."/site")."/studiofact_getfood",
	$bitrixTemplateDir,
	$rewrite = true,
	$recursive = true, 
	$delete_after_copy = false,
	$exclude = "themes"
);

$rmFiles = array(
    $bitrixTemplateDir . "/components/bitrix/sale.order.ajax/new_order/scripts/google_maps.map.js",
    $bitrixTemplateDir . "/components/bitrix/sale.order.ajax/new_order/scripts/google_maps.min.js",
    $bitrixTemplateDir . "/components/bitrix/sale.order.ajax/new_order/order_ajax.map.js",
    $bitrixTemplateDir . "/components/bitrix/sale.order.ajax/new_order/order_ajax.min.js",
);

foreach ($rmFiles as $file){
    if(file_exists($file)){
        @unlink($file);
    }
}

//Attach template to default site
$obSite = CSite::GetList($by = "def", $order = "desc", Array("LID" => WIZARD_SITE_ID));
if ($arSite = $obSite->Fetch())
{
	$arTemplates = Array();
	$found = false;
	$foundEmpty = false;
	$obTemplate = CSite::GetTemplateList($arSite["LID"]);
	while($arTemplate = $obTemplate->Fetch())
	{
		if(!$found && strlen(trim($arTemplate["CONDITION"]))<=0)
		{
			$arTemplate["TEMPLATE"] = "studiofact_getfood";
			$found = true;
		}
		if($arTemplate["TEMPLATE"] == "empty")
		{
			$foundEmpty = true;
			continue;
		}
		$arTemplates[]= $arTemplate;
	}

	if (!$found)
		$arTemplates[]= Array("CONDITION" => "", "SORT" => 150, "TEMPLATE" => "studiofact_getfood");

	$arFields = Array(
		"TEMPLATE" => $arTemplates,
		"NAME" => $arSite["NAME"],
	);

	$obSite = new CSite();
	$obSite->Update($arSite["LID"], $arFields);
}

$wizrdTemplateId = $wizard->GetVar("wizTemplateID");
COption::SetOptionString("main", "wizard_template_id", "studiofact_getfood", false, WIZARD_SITE_ID);
?>
