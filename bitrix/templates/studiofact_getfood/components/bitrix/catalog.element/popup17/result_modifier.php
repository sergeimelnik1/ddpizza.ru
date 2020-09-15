<? if (!defined('B_PROLOG_INCLUDED') || B_PROLOG_INCLUDED !== true) die();

use Citfact\Getfood\Image;

/**
 * @var CBitrixComponentTemplate $this
 * @var CatalogElementComponent $component
 */

$component = $this->getComponent();
$arParams = $component->applyTemplateModifications();


/**
 * Ресайзинг изображений
 */

Image::resizeCatalogElement($arResult, 960, 960);


/**
 * С этим товаром рекомендуем
 */
if (isset($arResult['DISPLAY_PROPERTIES']['RECOMMEND']['LINK_ELEMENT_VALUE']) && !empty($arResult['DISPLAY_PROPERTIES']['RECOMMEND']['LINK_ELEMENT_VALUE']))
{
	$arLinks = [];
	foreach ($arResult['DISPLAY_PROPERTIES']['RECOMMEND']['LINK_ELEMENT_VALUE'] as $arLink)
	{
		$arLinks[] = "<a href='{$arLink['DETAIL_PAGE_URL']}' target='_parent'>{$arLink['NAME']}</a>";
	}

	$arResult['DISPLAY_PROPERTIES']['RECOMMEND']['DISPLAY_VALUE'] = implode(' / ', $arLinks);
}

$arAdditivesIDs = $arResult["PROPERTIES"]["ADDITIVES"]["VALUE"];

if(!empty($arAdditivesIDs)){
	$USER = new CUser;
	$arSections = array();
	$arAdditives = array();
	$arOrder = array("IBLOCK_SECTION_ID"=>"ASC","SORT"=>"ASC");
	$arFilter = array("IBLOCK_ID"=>$arParams["IBLOCK_ID"],"ID"=>$arAdditivesIDs);
	$arSelect = array("ID","IBLOCK_SECTION_ID","NAME","CATALOG_GROUP_1");
	$query = CIBlockElement::GetList($arOrder,$arFilter,false,false,$arSelect);
	while($res = $query->GetNext()){
		$arPrice = CCatalogProduct::GetOptimalPrice($res["ID"],1,$USER->GetUserGroupArray());
		$res["PRICE"] = $arPrice["DISCOUNT_PRICE"];
		$arAdditives[$res["IBLOCK_SECTION_ID"]][] = $res;
	}
	
	$arOrder = array();
	$arFilter = array("IBLOCK_ID"=>$arParams["IBLOCK_ID"],"ID"=>array_keys($arAdditives));
	$arSelect = array("ID","NAME");
	$query = CIBlockSection::GetList($arOrder,$arFilter,false,$arSelect);
	while($res = $query->GetNext()){
		$arSections[$res["ID"]] = $res;
	}
	$arResult["ADDITIVES"] = $arAdditives;
	$arResult["ADDITIVES_SECTIONS"] = $arSections;
	//echo "<pre>";
	//print_r($arAdditives);
	//echo "</pre>";
}