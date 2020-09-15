<?php
require($_SERVER["DOCUMENT_ROOT"] . "/bitrix/modules/main/include/prolog_before.php");

global $USER;
CModule::IncludeModule("sale");
CModule::IncludeModule("iblock");

function AddOrderProperty($prop_id, $value, $order) {
  if (!strlen($prop_id)) {
    return false;
  }
  if (CModule::IncludeModule('sale')) {
    if ($arOrderProps = CSaleOrderProps::GetByID($prop_id)) {
      $db_vals = CSaleOrderPropsValue::GetList(array(), array('ORDER_ID' => $order, 'ORDER_PROPS_ID' => $arOrderProps['ID']));
      if ($arVals = $db_vals -> Fetch()) {
        return CSaleOrderPropsValue::Update($arVals['ID'], array(
          'NAME' => $arVals['NAME'],
          'CODE' => $arVals['CODE'],
          'ORDER_PROPS_ID' => $arVals['ORDER_PROPS_ID'],
          'ORDER_ID' => $arVals['ORDER_ID'],
          'VALUE' => $value,
        ));
      } else {
        return CSaleOrderPropsValue::Add(array(
          'NAME' => $arOrderProps['NAME'],
          'CODE' => $arOrderProps['CODE'],
          'ORDER_PROPS_ID' => $arOrderProps['ID'],
          'ORDER_ID' => $order,
          'VALUE' => $value,
        ));
      }
    }
  }
}


function DeleteBasketItem($itemID,$orderID){
	$res = CSaleBasket::Delete($itemID);
	if($res!=false){
		$contents = array();
		$dbBasketItems = CSaleBasket::GetList(
			array(
				"NAME" => "ASC",
				"ID" => "ASC"
			),
			array(
				"LID" => SITE_ID,
				"ORDER_ID" => $orderID,
			)
		);
		while ($arItems = $dbBasketItems->Fetch()){
			$contents[] = $arItems;
		}
		$sum = 0;
		foreach($contents as $basket_item){
			if($basket_item['DISCOUNT_PRICE']>0){
				$sum += $basket_item['DISCOUNT_PRICE']*$basket_item['QUANTITY'];
			}else{
				$sum += $basket_item['PRICE']*$basket_item['QUANTITY'];
			}
		}
		$arFields = array(
			"PRICE" => $sum,
		);
		CSaleOrder::Update($orderID, $arFields);
		$res = $sum;
	}
	return $res;
	
}

function UpdateBasketItem($itemID,$quantity,$orderID){
	$arFieldsUpdate = array("QUANTITY"=>$quantity,"ORDER_ID"=>$orderID);
	$res = CSaleBasket::Update($itemID,$arFieldsUpdate);
	if($res!=false){
		$contents = array();
		$dbBasketItems = CSaleBasket::GetList(
			array(
				"NAME" => "ASC",
				"ID" => "ASC"
			),
			array(
				"LID" => SITE_ID,
				"ORDER_ID" => $orderID,
			)
		);
		while ($arItems = $dbBasketItems->Fetch()){
			$contents[] = $arItems;
		}
		$sum = 0;
		foreach($contents as $basket_item){
			if($basket_item['DISCOUNT_PRICE']>0){
				$sum += $basket_item['DISCOUNT_PRICE']*$basket_item['QUANTITY'];
			}else{
				$sum += $basket_item['PRICE']*$basket_item['QUANTITY'];
			}
		}
		$arFields = array(
			"PRICE" => $sum,
		);
		CSaleOrder::Update($orderID, $arFields);
		$res = $sum;
	}
	return $res;
	
}

function AddBasketItem($productID,$quantity,$orderID){
	$product = CIBlockElement::GetByID($productID)->GetNext();
	$price = CCatalogProduct::GetOptimalPrice($productID);
	$arFieldsAdd = array(
		"PRODUCT_ID"=>$productID,
		"LID" => "s1",
		"PRICE"=>$price["RESULT_PRICE"]["DISCOUNT_PRICE"],
		"CURRENCY"=>"RUB",
		"NAME"=>$product["NAME"],
		"QUANTITY"=>$quantity,
		"ORDER_ID"=>$orderID,
		"PRODUCT_XML_ID"=>"#".$productID
	);
	$res = CSaleBasket::Add($arFieldsAdd);
	if($res!=false){
		$contents = array();
		$dbBasketItems = CSaleBasket::GetList(
			array(
				"NAME" => "ASC",
				"ID" => "ASC"
			),
			array(
				"LID" => SITE_ID,
				"ORDER_ID" => $orderID,
			)
		);
		while ($arItems = $dbBasketItems->Fetch()){
			$contents[] = $arItems;
		}
		$sum = 0;
		foreach($contents as $basket_item){
			if($basket_item['DISCOUNT_PRICE']>0){
				$sum += $basket_item['DISCOUNT_PRICE']*$basket_item['QUANTITY'];
			}else{
				$sum += $basket_item['PRICE']*$basket_item['QUANTITY'];
			}
		}
		$arFields = array(
			"PRICE" => $sum,
		);
		CSaleOrder::Update($orderID, $arFields);
		$res = $sum;
	}
	return $res;
	
}

?>