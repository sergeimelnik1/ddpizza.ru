<?php
require_once($_SERVER["DOCUMENT_ROOT"] . "/ajax/functions.php");

$result = array();
if($USER->IsAuthorized() && (in_array("10",$USER->GetUserGroupArray()) || $USER->IsAdmin())){
	
	if(!empty($_POST["order_id"])){
		if(!empty($_POST["status"])){
			//$res = CSaleOrder::StatusOrder($_POST["order_id"],$_POST["status"]);
			$orderId = $_POST["order_id"];
			$arFields =  CSaleOrder::GetByID($orderId);
			$arFields["STATUS_ID"] = $_POST["status"];
			$date = ParseDateTime($arFields["DATE_STATUS"],"YYYY-MM-DD HH:MI:SS");
			$arFields["DATE_STATUS"] = $date["DD"].".".$date["MM"].".".$date["YYYY"]." ".$date["HH"].":".$date["MI"].":".$date["SS"];
			$date = ParseDateTime($arFields["DATE_INSERT"],"YYYY-MM-DD HH:MI:SS");
			$arFields["DATE_INSERT"] = $date["DD"].".".$date["MM"].".".$date["YYYY"]." ".$date["HH"].":".$date["MI"].":".$date["SS"];
			$date = ParseDateTime($arFields["DATE_UPDATE"],"YYYY-MM-DD HH:MI:SS");
			$arFields["DATE_UPDATE"] = $date["DD"].".".$date["MM"].".".$date["YYYY"]." ".$date["HH"].":".$date["MI"].":".$date["SS"];
			if($arFields["DATE_LOCK"]!=""){
				$date = ParseDateTime($arFields["DATE_LOCK"],"YYYY-MM-DD HH:MI:SS");
				$arFields["DATE_LOCK"] = $date["DD"].".".$date["MM"].".".$date["YYYY"]." ".$date["HH"].":".$date["MI"].":".$date["SS"];
			}
			
			$arOrder = $arFields;
			
			$query = CSaleOrderPropsValue::GetOrderProps($orderId);
			$arOrderProps = array();
			while($prop = $query->GetNext()){
				$arOrderProps[$prop["ORDER_PROPS_ID"]] = $prop["VALUE"];
				if($prop["ORDER_PROPS_ID"]==1){
					$arOrder["PAYER_NAME"] = $prop["VALUE"];
					$arOrder["PROFILE_NAME"] = $prop["VALUE"];
				}
				if($prop["ORDER_PROPS_ID"]==2){
					$arOrder["USER_EMAIL"] = $prop["VALUE"];
				}
			}
			$arOrder["ORDER_PROP"] = $arOrderProps;
			
			$arBasketItems = array();

			$dbBasketItems = CSaleBasket::GetList(
				 array(
							"NAME" => "ASC",
							"ID" => "ASC"
						 ),
				 array(
							//"FUSER_ID" => CSaleBasket::GetBasketUserID(),
							"LID" => SITE_ID,
							"ORDER_ID" => $orderId
						 ));
						 
						
			while ($arItems = $dbBasketItems->Fetch()){
				$arBasketItems[] = $arItems;
			}
			foreach($arBasketItems as $key=>$arBasketItem){
				$arBasketProps = array();
				$db_res = CSaleBasket::GetPropsList(
					array(
							"SORT" => "ASC",
							"NAME" => "ASC"
						),
					array("BASKET_ID" => $arBasketItem["ID"])
				);
				while ($ar_res = $db_res->Fetch())
				{
				   $arBasketProps[$ar_res["CODE"]] = $ar_res;
				}
				$arBasketItems[$key]["PROPS"]=$arBasketProps;
			}
			
			$arOrder["BASKET_ITEMS"] = $arBasketItems;
$arErrors = array();
			$res = CSaleOrder::DoSaveOrder($arOrder,$arFields,$orderId,$arErrors);
			//$res = CSaleOrder::Update($_POST["order_id"],$arOrderFields);
			if($res != false){
				$result["error"] = false;
				$result["text"] = "Статус заказа №".$res." успешно изменен";
			}else{
				$result["error"] = true;
				$result["text"] = "Ошибка смены статуса заказа";
			}
		}
		if(!empty($_POST["cancel"])){
			$res = CSaleOrder::CancelOrder($_POST["order_id"],"Y");
			if($res != false){
				$result["error"] = false;
				$result["text"] = "Заказ №".$_POST["order_id"]." отменен";
			}else{
				$result["error"] = true;
				$result["text"] = "Ошибка отмены заказа";
			}
		}
		
		if(!empty($_POST["manager"])){
			
			$res = AddOrderProperty(13,$_POST["manager"],$_POST["order_id"]);//13 - id свойства Менеджер
			if($res != false){
				$result["error"] = false;
				$result["text"] = "Заказу №".$_POST["order_id"]." успешно присвоен менеджер";
			}else{
				$result["error"] = true;
				$result["text"] = "Ошибка!";
			}
		}
		if(!empty($_POST["cooker"])){
			
			$res = AddOrderProperty(14,$_POST["cooker"],$_POST["order_id"]);//14 - id свойства Повар
			if($res != false){
				$result["error"] = false;
				$result["text"] = "Заказу №".$_POST["order_id"]." успешно назначен повар";
			}else{
				$result["error"] = true;
				$result["text"] = "Ошибка!";
			}
		}
		if(!empty($_POST["restaurant"])){
			
			$res = AddOrderProperty(15,$_POST["restaurant"],$_POST["order_id"]);//15 - id свойства Ресторан
			if($res != false){
				$result["error"] = false;
				$result["text"] = "Заказ №".$_POST["order_id"]." успешно привязан к ресторану";
			}else{
				$result["error"] = true;
				$result["text"] = "Ошибка!";
			}
		}
		if(!empty($_POST["delete"]) && !empty($_POST["basket_item"])){
			$res = DeleteBasketItem($_POST["basket_item"],$_POST["order_id"]);		
			if($res != false){
				$result["error"] = false;
				$result["text"] = "Элемент удален";
				$result["sum"] = $res;
			}else{
				$result["error"] = true;
				$result["text"] = "Ошибка!";
			}
		}
		if(!empty($_POST["update"]) && !empty($_POST["basket_item"]) && !empty($_POST["quantity"])){
			$res = UpdateBasketItem($_POST["basket_item"],$_POST["quantity"],$_POST["order_id"]);		
			if($res != false){
				$result["error"] = false;
				$result["text"] = "Элемент обновлен";
				$result["sum"] = $res;
			}else{
				$result["error"] = true;
				$result["text"] = "Ошибка!";
			}
		}
		if(!empty($_POST["add"]) && !empty($_POST["item_id"]) && !empty($_POST["quantity"])){
			$res = AddBasketItem($_POST["item_id"],$_POST["quantity"],$_POST["order_id"]);		
			if($res != false){
				$result["error"] = false;
				$result["text"] = "Элемент добавлен";
				$result["sum"] = $res;
			}else{
				$result["error"] = true;
				$result["text"] = "Ошибка!";
			}
		}
		if(!empty($_POST["client"])){
			$res = AddOrderProperty(1,$_POST["client"],$_POST["order_id"]);
			if($res != false){
				$result["error"] = false;
				$result["text"] = "Данные сохранены";
			}else{
				$result["error"] = true;
				$result["text"] = "Ошибка!";
			}
		}
		if(!empty($_POST["is_delivery"])){
			$res = AddOrderProperty(12,$_POST["is_delivery"],$_POST["order_id"]);
			if($res != false){
				$result["error"] = false;
				$result["text"] = "Данные сохранены";
			}else{
				$result["error"] = true;
				$result["text"] = "Ошибка!";
			}
		}
		if(!empty($_POST["zone"])){
			$res = AddOrderProperty(10,$_POST["zone"],$_POST["order_id"]);
			if($res != false){
				$result["error"] = false;
				$result["text"] = "Данные сохранены";
			}else{
				$result["error"] = true;
				$result["text"] = "Ошибка!";
			}
		}
		if(!empty($_POST["address"])){
			$res = AddOrderProperty(7,$_POST["address"],$_POST["order_id"]);
			if($res != false){
				$result["error"] = false;
				$result["text"] = "Данные сохранены";
				$res = AddOrderProperty(11,"",$_POST["order_id"]);//пустое значение в квартиру и т.п., все в полном адресе будет
			}else{
				$result["error"] = true;
				$result["text"] = "Ошибка!";
			}
		}
		if(!empty($_POST["phone"])){
			$res = AddOrderProperty(3,$_POST["phone"],$_POST["order_id"]);
			if($res != false){
				$result["error"] = false;
				$result["text"] = "Данные сохранены";
			}else{
				$result["error"] = true;
				$result["text"] = "Ошибка!";
			}
		}
		if(!empty($_POST["full_text"])){
			$res = AddOrderProperty(8,$_POST["full_text"],$_POST["order_id"]);
			if($res != false){
				$result["error"] = false;
				$result["text"] = "Данные сохранены";
			}else{
				$result["error"] = true;
				$result["text"] = "Ошибка!";
			}
		}
	}
	
}else{
	$result["error"] = true;
	$result["text"] = "Недостаточно прав!";
}

die(json_encode($result));




?>