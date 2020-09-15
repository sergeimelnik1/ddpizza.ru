<?php

use Citfact\Getfood\Image;

/**
 * Ресайзинг изображений
 */
Image::resizeBasket($arResult, [150, 150], [500, 500]);


$arAdditives = array();

foreach($arResult["ITEMS"]["AnDelCanBuy"] as $key=>$arItem){
	
	if($arItem["NOTES"]=="additive" && !isset($_GET["test"])){
		$arAdditives[$arItem["PRODUCT_ID"]] = $arItem;
		unset($arResult["ITEMS"]["AnDelCanBuy"][$key]);
	}
}
//print_arr($arAdditives);
foreach($arResult["ITEMS"]["AnDelCanBuy"] as $key=>$arItem){
	$xml_id = $arItem["PROPS_ALL"]["PRODUCT.XML_ID"]["VALUE"];
	$arAdditivesIDs = explode(",",end(explode("$",$xml_id)));
	foreach($arAdditivesIDs as $add_id){
		$arResult["ITEMS"]["AnDelCanBuy"][$key]["ADDITIVES"][$add_id] = $arAdditives[$add_id];
	}
}
$USER = new CUser;
$total = 0;
$total_full = 0;

foreach($arResult["ITEMS"]["AnDelCanBuy"] as $key=>$arItem){
	$total_item_full = 0;
	$price = $arItem["FULL_PRICE"];
	$total_item_full+=$price;
	
	foreach($arItem["ADDITIVES"] as $add_id=>$arAdditive){
		$arPrice = CCatalogProduct::GetOptimalPrice($arAdditive["PRODUCT_ID"],1,$USER->GetUserGroupArray(),"N",array(),"s1");
		$price += $arAdditive["FULL_PRICE"];
		$arItem["ADDITIVES"][$add_id]["PRICE"] = $arPrice["DISCOUNT_PRICE"];
		$total_full+=$arPrice["PRICE"]["PRICE"];
		$total_item_full+=$arPrice["PRICE"]["PRICE"];
		//if(isset($_GET["test"])){
			//print_arr($arAdditive);
		//}
	}
	$arResult["ITEMS"]["AnDelCanBuy"][$key]["FULL_PRICE"] = $price;
	$arResult["ITEMS"]["AnDelCanBuy"][$key]["FULL_PRICE_FORMATED"] = number_format($price,0,""," ").' '.'<span class="rub black">Р</span>';
	
	$arResult["ITEMS"]["AnDelCanBuy"][$key]["SUM"] = number_format($price*$arItem["QUANTITY"],0,""," ").' '.'<span class="rub black">Р</span>';
	
	$price = $arItem["PRICE"];
	
	foreach($arItem["ADDITIVES"] as $add_id=>$arAdditive){
		$price += $arAdditive["PRICE"];
	}
	$arResult["ITEMS"]["AnDelCanBuy"][$key]["PRICE"] = $price;
	$arResult["ITEMS"]["AnDelCanBuy"][$key]["PRICE_FORMATED"] = number_format($price,0,""," ").' '.'<span class="rub black">Р</span>';
	$arResult["ITEMS"]["AnDelCanBuy"][$key]["FULL_PRICE"] = $total_item_full;
	$arResult["ITEMS"]["AnDelCanBuy"][$key]["FULL_PRICE_FORMATED"] = number_format($total_item_full,0,""," ").' '.'<span class="rub black">Р</span>';
	$total+=$price*$arItem["QUANTITY"];
	$arResult["ITEMS"]["AnDelCanBuy"][$key]["SUM_VALUE"] = $price*$arItem["QUANTITY"];
	$arResult["ITEMS"]["AnDelCanBuy"][$key]["SUM"] = number_format($price*$arItem["QUANTITY"],0,""," ").' '.'<span class="rub black">Р</span>';
	$total_full+=$total_item_full*$arItem["QUANTITY"];
}
$arResult["allSum_wVAT_FORMATED"] = number_format($total,0,""," ").' '.'<span class="rub black">Р</span>';
$arResult["allSum_FORMATED"] = number_format($total,0,""," ").' '.'<span class="rub black">Р</span>';
$arResult["allSum_FORMATED"] = number_format($total,0,""," ").' '.'<span class="rub black">Р</span>';
$arResult["PRICE_WITHOUT_DISCOUNT"] = number_format($total_full,0,""," ").' '.'<span class="rub black">Р</span>';

//print_arr($arResult["ITEMS"]["AnDelCanBuy"]);