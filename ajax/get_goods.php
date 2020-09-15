<?php
require($_SERVER["DOCUMENT_ROOT"] . "/bitrix/modules/main/include/prolog_before.php");

global $USER;
CModule::IncludeModule("iblock");


$result = array();
if($USER->IsAuthorized() && (in_array("10",$USER->GetUserGroupArray()) || $USER->IsAdmin())){
	
	if(!empty($_REQUEST["name"])){
		$arSort = array(
			"SORT" => "ASC",
			"NAME" => "ASC"
		);
		$arFilter = array(
			"IBLOCK_ID" => 2,
			"NAME" => $_REQUEST["name"]."%"
		);
		$arNavParams = array(
			"nTopCount" => 10
		);
		$arSelect = array(
			"ID",
			"NAME"
		);
		$arResult = array();
		$query = CIBlockElement::GetList($arSort,$arFilter,false,$arNavParams,$arSelect);
		while($res = $query->GetNext()){
			$arResult[$res["ID"]] = $res;
			
		}
		$arFilter = array(
			"IBLOCK_ID" => 3,
			"NAME" => $_REQUEST["name"]."%"
		);
		$arSelect = array(
			"ID",
			"NAME",
			"PROPERTY_TYPE",
			"PROPERTY_DIAMETR",
			"PROPERTY_VOLUME",
			"PROPERTY_CML2_LINK"
		);
		$query = CIBlockElement::GetList($arSort,$arFilter,false,$arNavParams,$arSelect);
		while($res = $query->GetNext()){
			
			$name = $res["NAME"];
			if($res["PROPERTY_TYPE_VALUE"]!=""){
				$name .= ", ".$res["PROPERTY_TYPE_VALUE"];
			}
			if($res["PROPERTY_DIAMETR_VALUE"]!=""){
				$name .= ", ".$res["PROPERTY_DIAMETR_VALUE"];
			}
			if($res["PROPERTY_VOLUME_VALUE"]!=""){
				$name .= ", ".$res["PROPERTY_VOLUME_VALUE"];
			}
			$res["NAME"] = $name;
			$arResult[$res["PROPERTY_CML2_LINK_VALUE"]]["SKU"][] = $res;
			
		}
		$result["result"] = $arResult;
		
	}
	
}else{
	$result["error"] = true;
	$result["text"] = "Недостаточно прав!";
}

die(json_encode($result));




?>