<?php

function OnBeforeBasketAddHandler(&$arFields) {

    /* if(isset($_REQUEST["additives"]) && $_REQUEST["additives"]!=""){
      $arAdditives = explode(",",$_REQUEST["additives"]);
      if(!in_array($arFields["PRODUCT_ID"],$arAdditives)){
      //$arFields["PRODUCT_XML_ID"] .= "$".$_REQUEST["additives"];

      foreach($arFields["PROPS"] as $key=>$arProp){
      if($arProp["CODE"] == "PRODUCT.XML_ID"){
      if(count(explode("$",$arProp["VALUE"]))<2){
      $arFields["PROPS"][$key]["VALUE"] = $arProp["VALUE"]."$".$_REQUEST["additives"];
      }
      }
      }
      $arFields["NOTES"] = $_REQUEST["additives"];
      //$arFields["PROPS"][] = array("NAME"=>"Добавки","CODE"=>"ADDITIVES","VALUE"=>$arAdditives);
      }
      } */
    //print_arr($arFields);
    //exit();
}

function OnBasketAddHandler($ID, $arFields) {
    //print_arr($arFields);
    //exit();
    //print_arr($_REQUEST);
    /* $USER = new CUser;

      if(isset($_REQUEST["additives"]) && $_REQUEST["additives"]!=""){

      $arAdditives = explode(",",$_REQUEST["additives"]);
      if(!in_array($arFields["PRODUCT_ID"],$arAdditives)){
      //$discount = 0;
      //$curDiscount = CCatalogDiscount::GetByID(2);
      //if($curDiscount["ACTIVE"]=="Y"){
      //	$discount = 5;
      //}
      //$discount = 5;
      //$arAdditivesNew = array();
      foreach($arAdditives as $addID){
      $arAddIBlockFields = CIBlockElement::GetList(array(),array("IBLOCK_ID"=>2,"ID"=>$addID),false,false,array("ID","NAME"))->GetNext();
      $arPrice = CCatalogProduct::GetOptimalPrice($arAddIBlockFields["ID"],1,$USER->GetUserGroupArray(),"N",array(),"s1");
      $arAddFields = array(
      "PRODUCT_ID" => $addID,
      "PRODUCT_PRICE_ID" => 0,
      //"PRICE" => $arPrice["PRICE"]["PRICE"],
      "PRICE" => $arPrice["DISCOUNT_PRICE"],
      "CUSTOM_PRICE" => "Y",
      "MODULE" => "catalog",
      "CURRENCY" => "RUB",
      "QUANTITY" => 1,
      "LID" => "s1",
      "DELAY" => "N",
      "CAN_BUY" => "Y",
      "NAME" => $arAddIBlockFields["NAME"],
      "NOTES" => "additive",
      //"DISCOUNT_PRICE" => $arPrice["DISCOUNT_PRICE"],
      //"DISCOUNT_NAME" => $curDiscount["NAME"],
      //"DISCOUNT_VALUE"=>$discount
      );
      //write_log(print_r($arAddFields,1));
      $basketID = CSaleBasket::Add($arAddFields);
      //write_log(print_r($basketID,1));
      //$arAdditivesNew[$basketID] = $addID;
      }
      //$_SESSION["additives"]["item_".$ID][] = $arAdditivesNew;
      }
      } */
    //print_arr($_SESSION);
    //exit();
    //return true;
}

function OnBeforeBasketUpdateHandler($ID, $arFields) {
    //$xml_id = $arFields["PROPS"]["PRODUCT.XML_ID"]["VALUE"];
    //$arAdditivesIDs = explode(",",end(explode("$",$xml_id)));
    //print_arr($arFields);
    //exit();
    //return true;
}

function OnBasketUpdateHandler($ID, $arFields) {

    $sign = $_REQUEST["sign"];
    if ($sign != "") {
        $xml_id = $arFields["PROPS"]["PRODUCT.XML_ID"]["VALUE"];
        $arAdditivesIDs = explode(",", end(explode("$", $xml_id)));

        foreach ($arAdditivesIDs as $addID) {
            $arAddItem = CSaleBasket::GetList(array(), array("PRODUCT_ID" => $addID), false, false, array("ID", "QUANTITY"))->GetNext();
            if ($sign == "up") {
                $quantity = $arAddItem["QUANTITY"] + 1;
            }
            if ($sign == "down") {
                $quantity = $arAddItem["QUANTITY"] - 1;
            }


            CSaleBasket::Update($arAddItem["ID"], array("QUANTITY" => $quantity));
        }
    }
}

function OnBeforeBasketDeleteHandler($ID) {
    $arBasketItem = CSaleBasket::GetByID($ID);
    //print_arr($arBasketItem);

    $propXMLid = CSaleBasket::GetPropsList(array(), array("CODE" => "PRODUCT.XML_ID", "BASKET_ID" => $ID), false, false, array())->GetNext();
    $xml_id = $propXMLid["VALUE"];

    $arAdditivesIDs = array();
    if (strpos($xml_id, '$') !== false) {
        $arAdditivesIDs = explode(",", end(explode("$", $xml_id)));
    }

    foreach ($arAdditivesIDs as $addID) {

        $arAddItem = CSaleBasket::GetList(array(), array("PRODUCT_ID" => $addID), false, false, array("ID", "QUANTITY"))->GetNext();


        $quantity = $arAddItem["QUANTITY"] - $arBasketItem["QUANTITY"];
        if ($quantity > 0) {
            CSaleBasket::Update($arAddItem["ID"], array("QUANTITY" => $quantity));
        } else {
            //удаляем - добавка больше нигде не используется!
            CSaleBasket::Delete($arAddItem["ID"]);
        }


        //$arAdditivesNew[$basketID] = $addID;
    }
    //exit();
    //return false;
    //unset($_SESSION["additives"]["item_".$ID]);
}

if (isset($_GET["set_additives"])) {
    if (isset($_GET["section"]) && isset($_GET["add_section"])) {
        SetAllAdditives($_GET["section"], $_GET["add_section"]);
        echo "done";
        exit();
    }
}

function SetAllAdditives($SECTION_ID, $ADD_SECTION_ID, $IBLOCK_ID = 2, $ADD_IBLOCK_ID = 2) {
    CModule::IncludeModule("iblock");
    $arSort = array();
    $arFilter = array("IBLOCK_ID" => $ADD_IBLOCK_ID, "SECTION_ID" => $ADD_SECTION_ID,"INCLUDE_SUBSECTIONS"=>"Y");
    $arSelect = array("ID");

    $arAdditives = array();
    $query = CIBlockElement::GetList($arSort, $arFilter, false, false, $arSelect);
    while ($res = $query->GetNext()) {
        $arAdditives[$res["ID"]] = $res["ID"];
    }
    $arSort = array();
    $arFilter = array("IBLOCK_ID" => $ADD_IBLOCK_ID, "IBLOCK_SECTION_ID" => $SECTION_ID);
    $arSelect = array("ID", "PROPERTY_ADDITIVES");
    $arItems = array();
    
    $query = CIBlockElement::GetList($arSort, $arFilter, false, false, $arSelect);
    while ($res = $query->GetNext()) {
        $arItems[$res["ID"]]["ID"] = $res["ID"];
        $arItems[$res["ID"]]["ADDITIVES"][] = $res["PROPERTY_ADDITIVES_VALUE"];
    }
    foreach ($arItems as $id => $arItem) {
        CIBlockElement::SetPropertyValues($id, $IBLOCK_ID, array_merge($arItem["ADDITIVES"], $arAdditives), "ADDITIVES");
    }
}

function OnBeforeOrderAddHandler(&$arFields) {
    global $APPLICATION;

    //write_log(print_r($arFields,1));

    if ($arFields["ORDER_PROP"]["12"] == "Y") {
        if (empty($arFields["ORDER_PROP"]["7"])) {
            $APPLICATION->ThrowException("В указанное место доставка не осуществляется или место не указано");
            return false;
        }
        if (empty($arFields["ORDER_PROP"]["10"])) {
            $APPLICATION->ThrowException("В указанное место доставка не осуществляется или место не указано");
            return false;
        } else {
            switch ($arFields["ORDER_PROP"]["10"]) {
                case "Зона 1":
                    $price = 1500;
                    $zoneprice = 1500;
                    /*if (date("H") >= 10 && date("H") < 21) {
                        $zoneprice = 1000;
                    }
                    if (date("H") == 21) {
                        if (date("i") < 30) {
                            $zoneprice = 1000;
                        }
                    }*/
                    if ($arFields["PRICE"] < $zoneprice) {
                        $APPLICATION->ThrowException("Минимальная сумма доставки для данной зоны - 1500 рублей");
                        return false;
                    } else {
                        return true;
                    }
                    break;
                case "Зона 2":
                    if ($arFields["PRICE"] < 700) {
                        $APPLICATION->ThrowException("Минимальная сумма доставки для данной зоны - 700 рублей");
                        return false;
                    } else {
                        return true;
                    }
                    break;
                case "Зона 3":
                    if ($arFields["PRICE"] < 500) {
                        $APPLICATION->ThrowException("Минимальная сумма доставки для данной зоны - 500 рублей");
                        return false;
                    } else {
                        return true;
                    }
                    break;
                case "Зона 4":
                    if ($arFields["PRICE"] < 700) {
                        $APPLICATION->ThrowException("Минимальная сумма доставки для данной зоны - 700 рублей");
                        return false;
                    } else {
                        return true;
                    }
                    break;
                case "Зона 5":
                    if ($arFields["PRICE"] < 1000) {
                        $APPLICATION->ThrowException("Минимальная сумма доставки для данной зоны - 1000 рублей");
                        return false;
                    } else {
                        return true;
                    }
                    break;
                case "Зона 6":
                    if ($arFields["PRICE"] < 2000) {
                        $APPLICATION->ThrowException("Минимальная сумма доставки для данной зоны - 2000 рублей");
                        return false;
                    } else {
                        return true;
                    }
                    break;
                    case "Зона 6":
                    if ($arFields["PRICE"] < 2500) {
                        $APPLICATION->ThrowException("Минимальная сумма доставки для данной зоны - 2500 рублей");
                        return false;
                    } else {
                        return true;
                    }
                    break;
                case "Зона 8":
                    if ($arFields["PRICE"] < 1200) {
                        $APPLICATION->ThrowException("Минимальная сумма доставки для данной зоны - 1200 рублей");
                        return false;
                    } else {
                        if (date("H") > 22 || date("H") < 10 || (date("H") == 22 && date("i") >= 30)) {
                            $APPLICATION->ThrowException("В настоящее время доставка в эту зону не осуществляется");
                            return false;
                        }
                        return true;
                    }
                    break;
                default:
                    $APPLICATION->ThrowException("В указанное место доставка не осуществляется или место не указано");
                    return false;
                    break;
            }
        }
    }
}

function onOrderNewSendEmailHandler($orderId, &$eventName, &$arFields) {


    //Добавление информации о доставке в письмо
    $arFields["DELIVERY_INFO"] = '';
    if (($arOrder = CSaleOrder::GetByID($arFields["ORDER_ID"]))) {
        $delivery_id = $arOrder["DELIVERY_ID"];
    }

    $db_vals = CSaleOrderPropsValue::GetList(
                    array("SORT" => "ASC"),
                    array("ORDER_ID" => $orderId)
    );

    while ($prop = $db_vals->GetNext()) {
        if ($prop['CODE'] == 'FIO') {
            $arFields['USER_FIO'] = $prop['VALUE'];
        }

        if ($prop['CODE'] == 'EMAIL') {
            $arFields['USER_EMAIL'] = $prop['VALUE'];
        }

        if ($prop['CODE'] == 'PHONE') {
            $arFields['USER_PHONE'] = $prop['VALUE'];
        }
    }
}

AddEventHandler("sale", "onOrderNewSendEmail", "onOrderNewSendEmailHandler");
AddEventHandler("sale", "OnBasketAdd", "OnBasketAddHandler");
AddEventHandler("sale", "OnBasketUpdate", "OnBasketUpdateHandler");
AddEventHandler("sale", "OnBeforeBasketUpdate", "OnBeforeBasketUpdateHandler");
AddEventHandler("sale", "OnBeforeBasketAdd", "OnBeforeBasketAddHandler");
AddEventHandler("sale", "OnBeforeBasketDelete", "OnBeforeBasketDeleteHandler");

AddEventHandler("sale", "OnOrderSave", "OnOrderSaveHandler");

AddEventHandler("sale", "OnBeforeOrderAdd", "OnBeforeOrderAddHandler");

function CheckFilesToDelete() {
    $dir = $_SERVER["DOCUMENT_ROOT"] . "/rkeeper-delivery/";
    $arFiles = scandir($dir);
    $cur_time = time();
    foreach ($arFiles as $filename) {
        if ($filename != "." && $filename != "..") {

            $time = filemtime($dir . $filename);
            if (time() - $time > 90) {//прошло 8 минут
                unlink($dir . $filename);
            }
        }
    }

    return "CheckFilesToDelete();";
}

if (isset($_GET["test_delete"])) {
    CheckFilesToDelete();
}

function print_arr($array) {
    echo "<pre>";
    print_r($array);
    echo "</pre>";
}

function write_log($text) {
    $fp = fopen($_SERVER["DOCUMENT_ROOT"] . "/log.txt", "a");
    fwrite($fp, date("d.m.y H:i:s") . " " . $text . "\r\n");
    fclose($fp);
}

function FancyPhone($number, $minLength = 10) {
    $minLength = intval($minLength);
    if ($minLength <= 0 || strlen($number) < $minLength) {
        return false;
    }

    if (strlen($number) >= 10 && substr($number, 0, 2) == '+8') {
        $number = '00' . substr($number, 1);
    }

    $number = preg_replace("/[^0-9\#\*,;]/i", "", $number);
    if (strlen($number) >= 10) {
        if (substr($number, 0, 2) == '80' || substr($number, 0, 2) == '81' || substr($number, 0, 2) == '82') {
            
        } else if (substr($number, 0, 2) == '00') {
            $number = substr($number, 2);
        } else if (substr($number, 0, 3) == '011') {
            $number = substr($number, 3);
        } else if (substr($number, 0, 1) == '8') {
            $number = '7' . substr($number, 1);
        } else if (substr($number, 0, 1) == '0') {
            $number = substr($number, 1);
        } else if (substr($number, 0, 1) == '9') {
            $number = '7' . $number;
        }
    }
    $number = substr($number, 0, 1) . " (" . substr($number, 1, 3) . ") " . substr($number, 4, 3) . "-" . substr($number, 7, 2) . "-" . substr($number, 9, 2);

    return $number;
}

if (isset($_GET["timezone"])) {
    var_dump(date_default_timezone_get());
    exit();
}

if (isset($_GET["combineUsers"])) {
    CModule::IncludeModule("sale");
    $arUsers = array();
    $arFilter = array("ACTIVE" => "Y");
    $arParams = array("FIELDS" => array("ID", "EMAIL", "NAME", "LOGIN", "LAST_LOGIN"));
    $query = CUser::GetList(($by = array("email" => "asc", "last_login" => "asc")), ($order = "asc"), $arFilter, $arParams);
    while ($res = $query->GetNext()) {
        $arUsers[strtolower($res["EMAIL"])][$res["ID"]] = $res;
    }
    foreach ($arUsers as $email => $arUserIDs) {
        $mainUserID = reset(array_keys($arUserIDs));
        $arOrder = array("ID" => "DESC");
        $arFilter = array("USER_EMAIL" => $email);
        $arSelect = array("ID", "USER_EMAIL", "USER_ID", "USER_LOGIN", "PRICE");
        $query = CSaleOrder::GetList($arOrder, $arFilter, false, false, $arSelect);
        $orders_cnt = 0;
        while ($res = $query->GetNext()) {
            if ($res["USER_ID"] != $mainUserID) {
                CSaleOrder::Update($res["ID"], array("USER_ID" => $mainUserID));
            }
            $orders_cnt++;
        }
        $oUser = new CUser;
        foreach ($arUserIDs as $userid => $arUser) {
            if ($userid == $mainUserID) {
                $oUser->Update($userid, array("UF_ORDERS" => $orders_cnt));
            } else {
                $oUser->Update($userid, array("ACTIVE" => "N"));
            }
        }
    }
    exit();
}


if (isset($_GET["countUserOrders"])) {
    CModule::IncludeModule("sale");
    $arUsers = array();
    $arFilter = array("ACTIVE" => "Y");
    $arParams = array("FIELDS" => array("ID", "EMAIL", "NAME", "LOGIN", "LAST_LOGIN"));
    $query = CUser::GetList(($by = array("email" => "asc", "last_login" => "asc")), ($order = "asc"), $arFilter, $arParams);
    while ($res = $query->GetNext()) {
        $arUsers[strtolower($res["EMAIL"])][$res["ID"]] = $res;
    }
    $oUser = new CUser;
    foreach ($arUsers as $email => $arUserIDs) {
        $arOrder = array("ID" => "DESC");
        $arFilter = array("USER_EMAIL" => $email, "!CANCELED" => "Y");
        $arSelect = array("ID", "PRICE");
        $query = CSaleOrder::GetList($arOrder, $arFilter, false, false, $arSelect);
        $sum_cnt = 0;
        while ($res = $query->GetNext()) {

            $sum_cnt += $res["PRICE"];
        }
        
        foreach ($arUserIDs as $userid => $arUser) {

            $oUser->Update($userid, array("UF_SUM" => $sum_cnt));
        }
    }
    exit();
}


function onOrderSaveHandler($orderID,$fields,$orderFields,$isNew){
    if($fields["STATUS_ID"]=="A"){
        $oUser = new CUser;
        $arFilter = array("ID" => $fields["USER_ID"]);
    $arParams = array("SELECT" => array("UF_SUM","UF_ORDERS"));
    $arUser = CUser::GetList(($by = "id"), ($order = "asc"), $arFilter, $arParams)->GetNext();
    
        $oUser->Update($arUser["ID"], array("UF_ORDERS" => $arUser["UF_ORDERS"]+1));
        $oUser->Update($arUser["ID"], array("UF_SUM" => $arUser["UF_SUM"]+$fields["PRICE"]));
    }
}