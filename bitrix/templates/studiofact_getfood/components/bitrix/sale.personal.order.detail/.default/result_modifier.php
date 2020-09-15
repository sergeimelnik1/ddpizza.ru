<?
$arAdditives = array();
foreach($arResult["BASKET"] as $key=>$item){
	//print_arr(CSaleBasket::GetByID($item["ID"]));
	$el = CIBlockElement::GetByID($item["PRODUCT_ID"])->GetNext();
	$el = CIBlockElement::GetList(array(),array("IBLOCK_ID"=>$el["IBLOCK_ID"],"ID"=>$el["ID"]),false,false,array("PROPERTY_MORE_PHOTO"))->GetNext();
	$res = CFile::ResizeImageGet($el["PROPERTY_MORE_PHOTO_VALUE"],array("width"=>150,"height"=>150));
	$arResult["BASKET"][$key]["PICTURE"]["SRC"] = $res["src"];
	if($item["NOTES"]=="additive"){
		$arAdditives[$item["PRODUCT_ID"]] = $item;
		unset($arResult["BASKET"][$key]);
	}else{
		$propXMLid = CSaleBasket::GetPropsList(array(),array("CODE"=>"PRODUCT.XML_ID","BASKET_ID"=>$item["ID"]),false,false,array())->GetNext();
			$xml_id = $propXMLid["VALUE"];
			$arAdditivesIDs = explode(",",end(explode("$",$xml_id)));
			$arResult["BASKET"][$key]["ADDITIVES"] = $arAdditivesIDs;
	}
	
}
$arResult["ADDITIVES"] = $arAdditives;

?>