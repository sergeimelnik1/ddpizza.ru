<? if (!defined('B_PROLOG_INCLUDED') || B_PROLOG_INCLUDED !== true) die();

use Citfact\Getfood\Image;

if($arResult["ITEM"]["IBLOCK_SECTION_ID"]==27 || $arResult["ITEM"]["IBLOCK_SECTION_ID"]==4|| $arResult["ITEM"]["IBLOCK_SECTION_ID"]==1){
$arResult["ITEM"]["ADDITIVES"] = "1";
}

//$arAdditivesIDs = $arResult["ITEM"]["PROPERTIES"]["ADDITIVES"]["VALUE"];

/*if(!empty($arResult["ITEM"]["IBLOCK_SECTION_ID"]==27)){//только для пиццы
	$arSections = array();
	$arAdditives = array();
	$arOrder = array("IBLOCK_SECTION_ID"=>"ASC","SORT"=>"ASC");
	$arFilter = array("IBLOCK_ID"=>$arParams["IBLOCK_ID"],"SECTION_ID"=>16,"INCLUDE_SUBSECTIONS"=>"Y","ACTIVE"=>"Y");
	$arSelect = array("ID","IBLOCK_SECTION_ID","NAME","CATALOG_GROUP_1");
	$query = CIBlockElement::GetList($arOrder,$arFilter,false,false,$arSelect);
	$USER = new CUser;
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
	$arResult["ITEM"]["ADDITIVES"] = $arAdditives;
	$arResult["ITEM"]["ADDITIVES_SECTIONS"] = $arSections;
	
}*/

//Image::resizeCatalogItem($arResult, 720, 570);
/*$image = $arResult["ITEM"]["PREVIEW_PICTURE"]["SRC"];
if(empty($image)){
    $image = $arResult["ITEM"]["DETAIL_PICTURE"]["SRC"];
}
if(empty($image)){
$image = reset($arResult["ITEM"]["DISPLAY_PROPERTIES"]["MORE_PHOTO"]["DISPLAY_VALUE"])["SRC"];
}

$arResult["ITEM"]["PREVIEW_PICTURE"]["SRC"] = $image;*/