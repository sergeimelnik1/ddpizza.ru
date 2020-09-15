<?

require($_SERVER["DOCUMENT_ROOT"] . "/bitrix/modules/main/include/prolog_before.php");

use Bitrix\Main\Application;
use Bitrix\Main\Loader;
use Bitrix\Sale;

Loader::includeModule("iblock");
Loader::includeModule("catalog");
Loader::includeModule("sale");


$request = Application::getInstance()->getContext()->getRequest();

$arItemAdditives = $request->getPost("ITEM_ADDITIVES");
$productID = $request->getPost("offer_id");
if (!$productID) {
    $productID = $request->getPost("product_id");
}


$customPrice = $request->getPost("price");

$basket = Sale\Basket::loadItemsForFUser(Sale\Fuser::getId(), Bitrix\Main\Context::getCurrent()->getSite());

$props = array();
if (!empty($arItemAdditives)) {
    $text = "";
    $arToLoad = array();
    foreach ($arItemAdditives as $id => $quantity) {
        if ($quantity > 0) {
            $arToLoad[] = $id;
        }
    }
    $arAdditives = array();
    if (!empty($arToLoad)) {
        $arOrder = array("IBLOCK_SECTION_ID" => "ASC", "SORT" => "ASC");
        $arFilter = array("IBLOCK_ID" => $arParams["IBLOCK_ID"], "ID" => $arToLoad);
        $arSelect = array("ID", "NAME", "CATALOG_GROUP_1");
        $query = CIBlockElement::GetList($arOrder, $arFilter, false, false, $arSelect);
        $USER = new CUser;
        while ($res = $query->GetNext()) {
            $arPrice = CCatalogProduct::GetOptimalPrice($res["ID"], 1, $USER->GetUserGroupArray());
            $res["PRICE"] = $arPrice["DISCOUNT_PRICE"];
            $arAdditives[$res["ID"]] = $res;
        }
    }
    foreach ($arAdditives as $id => $arAdditive) {
        $text .= $arAdditive["NAME"] . ": " . $arItemAdditives[$id] . " шт; ";
    }
    if (!empty($text)) {
        $props = ['NAME' => 'Добавки', 'CODE' => 'ADDITIVES', 'VALUE' => $text];
    }
}

/*
  $fields = [
  'PRODUCT_ID' => $productID, // ID товара, обязательно
  'QUANTITY' => 1, // количество, обязательно
  "PRICE" => '',
  'PROPS' => $props
  ];
  $r = Bitrix\Catalog\Product\Basket::addProduct($fields);
  if (!$r->isSuccess()) {
  var_dump($r->getErrorMessages());
  } */
$quantity = 1;
if ($item = $basket->getExistsItem('catalog', $productID)) {
    $item->setField('QUANTITY', $item->getQuantity() + $quantity);
} else {
    $item = $basket->createItem('catalog', $productID);

    $el = CIBlockElement::GetByID($productID)->GetNext();
    $arFields = array(
        'QUANTITY' => $quantity,
        "NAME" => $el["NAME"],
        'CURRENCY' => Bitrix\Currency\CurrencyManager::getBaseCurrency(),
        'LID' => Bitrix\Main\Context::getCurrent()->getSite(),
        'PRICE' => $customPrice,
        'CUSTOM_PRICE' => 'Y'
    );

    if (!empty($props)) {
        $collection = $item->getPropertyCollection();
        $prop = $collection->createItem();
        $prop->setFields($props);
    }
    $item->setFields($arFields);
}
echo $basket->save();
