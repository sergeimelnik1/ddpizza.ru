<? if (!defined('B_PROLOG_INCLUDED') || B_PROLOG_INCLUDED !== true) die();

/**
 * @var CBitrixComponentTemplate $this
 * @var CatalogSectionComponent $component
 */

$component = $this->getComponent();
$arParams = $component->applyTemplateModifications();

if($arResult["ID"]==27 || $arResult["ID"]==4 || $arResult["ID"]==1){
	$arSections = array();
	$arAdditives = array();
	$arOrder = array("SORT"=>"ASC","IBLOCK_SECTION_ID"=>"ASC");
        $sectID = 28;
        if($arResult["ID"]==4){
            $sectID = 23;
        }
	$arFilter = array("IBLOCK_ID"=>$arParams["IBLOCK_ID"],"SECTION_ID"=>$sectID,"INCLUDE_SUBSECTIONS"=>"Y","ACTIVE"=>"Y");
	$arSelect = array("ID","IBLOCK_SECTION_ID","NAME","CATALOG_GROUP_1");
	$query = CIBlockElement::GetList($arOrder,$arFilter,false,false,$arSelect);
	$USER = new CUser;
	while($res = $query->GetNext()){
		$arPrice = CCatalogProduct::GetOptimalPrice($res["ID"],1,$USER->GetUserGroupArray());
		$res["PRICE"] = $arPrice["DISCOUNT_PRICE"];
		$arAdditives[$res["IBLOCK_SECTION_ID"]][] = $res;
	}
	
	$arOrder = array("SORT"=>"ASC");
	$arFilter = array("IBLOCK_ID"=>$arParams["IBLOCK_ID"],"ID"=>array_keys($arAdditives));
	$arSelect = array("ID","NAME");
	$query = CIBlockSection::GetList($arOrder,$arFilter,false,$arSelect);
	while($res = $query->GetNext()){
		$arSections[$res["ID"]] = $res;
	}
	$arResult["ADDITIVES"] = $arAdditives;
	$arResult["ADDITIVES_SECTIONS"] = $arSections;
	
}