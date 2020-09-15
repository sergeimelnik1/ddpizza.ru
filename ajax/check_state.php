<?php
require($_SERVER["DOCUMENT_ROOT"] . "/bitrix/modules/main/include/prolog_before.php");

global $USER;
CModule::IncludeModule("sale");

$result = array();
if($USER->IsAuthorized() && (in_array("10",$USER->GetUserGroupArray()) || $USER->IsAdmin())){
	
		$result["text"] = intval(CSaleOrder::GetList(array("ID"=>"DESC"),array("CANCELED"=>"N","STATUS_ID"=>"N","!PAY_SYSTEM_ID"=>7,"DATE_FROM"=>date("d.m.Y")),false,array("nTopCount"=>1),array("ID"))->GetNext()["ID"]);
		$result["text"] += intval(CSaleOrder::GetList(array("ID"=>"DESC"),array("CANCELED"=>"N","STATUS_ID"=>"N","PAY_SYSTEM_ID"=>7,"PAYED"=>"Y","DATE_FROM"=>date("d.m.Y")),false,array("nTopCount"=>1),array("ID"))->GetNext()["ID"]);

}else{
	$result["error"] = true;
	$result["text"] = "Недостаточно прав!";
}

die(json_encode($result));




?>