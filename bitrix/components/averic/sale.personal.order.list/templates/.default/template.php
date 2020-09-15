<?
if (!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED !== true)
    die();

use Bitrix\Main,
    Bitrix\Main\Localization\Loc,
    Bitrix\Main\Page\Asset;

//Asset::getInstance()->addJs("/bitrix/components/bitrix/sale.order.payment.change/templates/bootstrap_v4/script.js");
//Asset::getInstance()->addCss("/bitrix/components/bitrix/sale.order.payment.change/templates/bootstrap_v4/style.css");
CJSCore::Init(array('clipboard', 'fx'));

Loc::loadMessages(__FILE__);

if (!empty($arResult['ERRORS']['FATAL'])) {
    foreach ($arResult['ERRORS']['FATAL'] as $code => $error) {
        if ($code !== $component::E_NOT_AUTHORIZED)
            ShowError($error);
    }
    $component = $this->__component;
    if ($arParams['AUTH_FORM_IN_TEMPLATE'] && isset($arResult['ERRORS']['FATAL'][$component::E_NOT_AUTHORIZED])) {
        ?>
        <div class="row">
            <div class="col-md-8 offset-md-2 col-lg-6 offset-lg-3">
                <div class="alert alert-danger"><?= $arResult['ERRORS']['FATAL'][$component::E_NOT_AUTHORIZED] ?></div>
            </div>
            <? $authListGetParams = array(); ?>
            <div class="col-md-8 offset-md-2 col-lg-6 offset-lg-3" id="catalog-subscriber-auth-form" style="<?= $authStyle ?>">
                <? $APPLICATION->AuthForm('', false, false, 'N', false); ?>
            </div>
        </div>
        <?
    }
} else {
    if (!empty($arResult['ERRORS']['NONFATAL'])) {
        foreach ($arResult['ERRORS']['NONFATAL'] as $error) {
            ShowError($error);
        }
    }
    if (!count($arResult['ORDERS'])) {
        if (0 && $_REQUEST["filter_history"] == 'Y') {
            if ($_REQUEST["show_canceled"] == 'Y') {
                ?>
                <h3><?= Loc::getMessage('SPOL_TPL_EMPTY_CANCELED_ORDER') ?></h3>
                <?
            } else {
                ?>
                <h3><?= Loc::getMessage('SPOL_TPL_EMPTY_HISTORY_ORDER_LIST') ?></h3>
                <?
            }
        } else {
            ?>
            <h3><?= Loc::getMessage('SPOL_TPL_EMPTY_ORDER_LIST') ?></h3>
            <?
        }
    }
    /* ?>
      <div class="row ">
      <div class="col-12">
      <?
      $nothing = !isset($_REQUEST["filter_history"]) && !isset($_REQUEST["show_all"]);
      $clearFromLink = array("filter_history","filter_status","show_all", "show_canceled");

      if ($nothing || $_REQUEST["filter_history"] == 'N')
      {
      ?>
      <a class="mr-4" href="<?=$APPLICATION->GetCurPageParam("filter_history=Y", $clearFromLink, false)?>"><?echo Loc::getMessage("SPOL_TPL_VIEW_ORDERS_HISTORY")?></a>
      <?
      }
      if ($_REQUEST["filter_history"] == 'Y')
      {
      ?>
      <a class="mr-4" href="<?=$APPLICATION->GetCurPageParam("", $clearFromLink, false)?>"><?echo Loc::getMessage("SPOL_TPL_CUR_ORDERS")?></a>
      <?
      if ($_REQUEST["show_canceled"] == 'Y')
      {
      ?>
      <a class="mr-4" href="<?=$APPLICATION->GetCurPageParam("filter_history=Y", $clearFromLink, false)?>"><?echo Loc::getMessage("SPOL_TPL_VIEW_ORDERS_HISTORY")?></a>
      <?
      }
      else
      {
      ?>
      <a class="mr-4" href="<?=$APPLICATION->GetCurPageParam("filter_history=Y&show_canceled=Y", $clearFromLink, false)?>"><?echo Loc::getMessage("SPOL_TPL_VIEW_ORDERS_CANCELED")?></a>
      <?
      }
      }
      ?>
      </div>
      </div>
      <? */


    if ($_REQUEST["filter_history"] !== 'Y') {
        $paymentChangeData = array();
        $orderHeaderStatus = null;



        $arManagers = array();
        $arCookers = array();
        $arRestaurants = array();
        $arSelect = array("ID", "NAME", "LAST_NAME");
        $arFilter = array("GROUPS_ID" => array("9"), "ACTIVE" => "Y"); //Повары
        $query = CUser::GetList(($by = "name"), ($order = "asc"), $arFilter, array("FIELDS" => $arSelect));
        while ($res = $query->GetNext()) {
            $arCookers[$res["ID"]] = $res;
        }
        $arFilter = array("GROUPS_ID" => array("10"), "ACTIVE" => "Y"); //Менеджеры
        $query = CUser::GetList(($by = "name"), ($order = "asc"), $arFilter, array("FIELDS" => $arSelect));
        while ($res = $query->GetNext()) {
            $arManagers[$res["ID"]] = $res;
        }

        $arSelect = array("ID", "NAME");
        $arFilter = array("IBLOCK_ID" => "7", "ACTIVE" => "Y"); //Рестораны
        $query = CIBlockElement::GetList(array("SORT" => "ASC"), $arFilter, false, false, $arSelect);
        while ($res = $query->GetNext()) {
            $arRestaurants[$res["ID"]] = $res;
        }
        $orders_cnt = array(
            "A" => 0,
            "DS" => 0,
            "DA" => 0,
            "F" => 0,
            "N" => 0,
        );
        foreach ($arResult['ORDERS'] as $key => $order) {
            if($order["PAYMENT"][0]["PAY_SYSTEM_ID"]==7 && $order["ORDER"]["PAYED"]!="Y"){
                continue;
            }
            $orders_cnt[$order['ORDER']['STATUS_ID']] += 1;
        }
        ?>
        <div class="filterOrders">
            <div class="container">
                <div class="d-flex align-items-center justify-content-around">
                    <a href="?status=N" class="btn btn-info" data-val="N">Ожидает обработки<span><?= $orders_cnt["N"] ?></span></a>
                    <a href="?status=A" class="btn btn-warning" data-val="A">Принят<span><?= $orders_cnt["A"] ?></span></a>
                    <? /* <a href="?status=DA" class="btn btn-primary" data-val="DA">Готовится<span><?=$orders_cnt["DA"]?></span></a>
                      <a href="?status=DS" class="btn btn-danger" data-val="DS">Отправлен<span><?=$orders_cnt["DS"]?></span></a>
                      <a href="?status=F" class="btn btn-success" data-val="F">Доставлен<span><?=$orders_cnt["F"]?></span></a> */ ?>
                </div>
            </div>
        </div>

        <script>
        <?
        $last = 0;
        foreach ($arResult['ORDERS'] as $order) {
			
            if($order["PAYMENT"][0]["PAY_SYSTEM_ID"]==7 && $order["ORDER"]["PAYED"]!="Y"){
                continue;
            }
            if ($order['ORDER']['STATUS_ID'] == "N") {
                $last = $order['ORDER']["ID"];
                break;
            }
        }
        ?>
            var current_last_order = '<?= $last ?>';
        </script>
        <div class="ordersList">
            <?
            foreach ($arResult['ORDERS'] as $key => $order) {
				/*if($order["PAYMENT"][0]["PAY_SYSTEM_ID"]==7 && $order["ORDER"]["PAYED"]!="Y"){
                continue;
            }*/
                /* if ($orderHeaderStatus !== $order['ORDER']['STATUS_ID'] && $arResult['SORT_TYPE'] == 'STATUS')
                  {
                  $orderHeaderStatus = $order['ORDER']['STATUS_ID'];

                  ?>
                  <div class="row ">
                  <div class="col-12">
                  <h2><?= Loc::getMessage('SPOL_TPL_ORDER_IN_STATUSES') ?> &laquo;<?=htmlspecialcharsbx($arResult['INFO']['STATUS'][$orderHeaderStatus]['NAME'])?>&raquo;</h2>
                  </div>
                  </div>
                  <?
                  } */
                $arOrderProps = array();
                $query = CSaleOrderPropsValue::GetOrderProps($order["ORDER"]["ID"]);
                $cur_manager = 0;
                $cur_cooker = 0;
                $cur_restaurant = 0;
                while ($res = $query->GetNext()) {
                    $arOrderProps[$res["ORDER_PROPS_ID"]] = $res;
                    if ($res["ORDER_PROPS_ID"] == 13 && $res["VALUE"] != "") {
                        $cur_manager = $res["VALUE"]; //Менеджер
                    }
                    if ($res["ORDER_PROPS_ID"] == 14 && $res["VALUE"] != "") {
                        $cur_cooker = $res["VALUE"]; //Повар
                    }
                    if ($res["ORDER_PROPS_ID"] == 15 && $res["VALUE"] != "") {
                        $cur_restaurant = $res["VALUE"]; //Повар
                    }
                }
                $arOrderBaskets = array();
                $baskets = CSaleBasket::GetList(array(), array("ORDER_ID" => $order["ORDER"]["ID"]), false, false, array("ID"));
                while ($basket = $baskets->GetNext()) {
                    $arOrderBaskets[$order["ORDER"]["ID"]][$basket["ID"]] = $basket;
                }
                $arBasketProps = array();
                foreach ($arOrderBaskets as $order_id => $arBaskets) {
                    foreach ($arBaskets as $basket_id => $arBasket) {

                        $basket_props = CSaleBasket::GetPropsList(array(), array("CODE" => "ADDITIVES", "BASKET_ID" => $arBasket["ID"]), false, false, array("*"));
                        while ($basket_prop = $basket_props->GetNext()) {
                            $arBasketProps[$basket_id] = $basket_prop;
                        }
                    }
                }


                $hideOrder = false;
                if (!isset($_REQUEST["status"])) {
                    if ($order['ORDER']['STATUS_ID'] != "N" && $order['ORDER']['STATUS_ID'] != "V") {//новые и просмотренные
                        $hideOrder = true;
                    }
                } else {
                    if ($order['ORDER']['STATUS_ID'] != $_REQUEST["status"]) {
                        $hideOrder = true;
                    }
                    if ($_REQUEST["status"] == "N" && $order['ORDER']['STATUS_ID'] == "V") {//новые и просмотренные показывать вместе
                        $hideOrder = false;
                    }
                }
                //print_arr($arOrderProps);
                
                ?>
                <div class="row orderRow <? if ($order["ORDER"]["STATUS_ID"] == "N" ) { if($order["PAYMENT"][0]["PAY_SYSTEM_ID"]==7 && $order["ORDER"]["PAYED"]!="Y"){?> notPayedOrder <?}else{ ?> newOrder <? }} ?><? if ($hideOrder) { ?> d-none <? } ?>" data-id="<?= $order["ORDER"]["ID"] ?>" data-status-id="<?= $order['ORDER']['STATUS_ID'] ?>">

                    <div class="col-12 col-md-6 col-lg-7 topLeft">
                        <div class="infoRow row">
                            <span class="orderNum col-6">Заказ <strong>№<?= $order['ORDER']['ACCOUNT_NUMBER'] ?></strong> / <strong class="orderTime"><?= $order["ORDER"]["DATE_INSERT_FORMATED"] ?></strong></span>
                            <span class="orderSum col-6"><strong><?= $order['ORDER']['FORMATED_PRICE'] ?></strong></span>
                            <? if ($arOrderProps[12]['VALUE'] == "Y") { ?>
                                <span class="orderZone col-12">Зона: <strong><?= $arOrderProps[10]['VALUE'] ?></strong></span>
                                <span class="orderAddress col-12 d-flex"><span>Адрес:</span> <strong><?= $arOrderProps[7]['VALUE'] ?> <?= $arOrderProps[11]['VALUE'] ?></strong></span>
                            <? } else { ?>
                                <span class="orderAddress col-12">Самовывоз</span>	
                            <? } ?>
                        </div>
                    </div>
                    <div class="col-12 col-md-6 col-lg-5">
                        <div class="buttonsRow row">
                            <? if ($order["ORDER"]["STATUS_ID"] == "N") { ?>
                                <button class="btn btn-primary view" onclick="$(this).closest('.orderRow').find('.topLeft').click();">Просмотреть</button>
                            <? } ?>
                            <? if ($order["ORDER"]["STATUS_ID"] != "A") { ?>
                                <div class="col-6">
                                    <button class="btn btn-warning" data-val="A">Принять</button>
                                </div>
                            <? } else { ?>
                                <div class="col-6">
                                    <button class="btn btn-primary" data-id="<?= $order['ORDER']['ID'] ?>" >Печать заказа</button>
                                </div>
                            <? } ?>
                            <? /* <div class="col-6">
                              <button class="btn btn-danger" data-val="DS">Отправлен</button>
                              </div>
                              <div class="col-6">
                              <button class="btn btn-primary" data-val="DA">Готовится</button>
                              </div>
                              <div class="col-6">
                              <button class="btn btn-success" data-val="F">Доставлен</button>
                              </div> */ ?>
                            <?
                            if (isset($_GET["test"])) {
                                ?>
                                <div class="col-12">
                                    <button class="btn btn-default" onclick="window.print()">Печать заказа</button>
                                </div>
                                <?
                            }
                            ?>
                        </div>
                    </div>

                    <div class="col-12">
                        <div class="innerInfoRow row <? if (isset($_REQUEST["open"])) { ?>d-block<? } ?>">
                            <div class="col-12 clientInfo">
                                <div class="row">
                                    <form class="orderClient col-12">
                                        <span>Клиент:</span> <div class="value"><strong><?= $arOrderProps[1]['VALUE'] ?></strong></div>
                                        <div class="input d-none"><input type="text" name="client" value="<?= $arOrderProps[1]['VALUE'] ?>"  /></div>
                                        <button class="btn btn-sm changeValue">Изменить</button>
                                        <button class="btn btn-sm btn-success saveValue d-none">Сохранить</button>
                                        <button class="btn btn-sm btn-info cancelValue d-none">Отменить</button>
                                        <input type="hidden" name="order_id" value="<?= $order["ORDER"]["ID"] ?>" />
                                    </form>
                                    <form class=" col-12">
                                        <span>Номер стола:</span><div class="value"> <strong><?= $arOrderProps[16]['VALUE'] ?></strong></div>

                                    </form>
                                    <form class="orderNeed col-12">
                                        <span>Доставка:</span><div class="value"> <strong><?= ($arOrderProps[12]['VALUE'] == "Y") ? "Да" : "Нет" ?></strong></div>
                                        <div class="input d-none"><select name="is_delivery"><option <?= ($arOrderProps[12]['VALUE'] == "Y") ? "selected" : "" ?> value="Y">Да</option><option <?= ($arOrderProps[12]['VALUE'] == "Y") ? "" : "selected" ?> value="N">Нет</option></select></div>
                                        <button class="btn btn-sm changeValue">Изменить</button>
                                        <button class="btn btn-sm btn-success saveValue d-none">Сохранить</button>
                                        <button class="btn btn-sm btn-info cancelValue d-none">Отменить</button>
                                        <input type="hidden" name="order_id" value="<?= $order["ORDER"]["ID"] ?>" />
                                    </form>
                                    <? if ($arOrderProps[12]['VALUE'] == "Y") { ?>
                                        <form class="orderZone col-12"><span>Зона:</span> <div class="value"><strong><?= $arOrderProps[10]['VALUE'] ?></strong></div>
                                            <div class="input d-none"><input type="text" name="zone" value="<?= $arOrderProps[10]['VALUE'] ?>"  /></div>
                                            <button class="btn btn-sm changeValue">Изменить</button>
                                            <button class="btn btn-sm btn-success saveValue d-none">Сохранить</button>
                                            <button class="btn btn-sm btn-info cancelValue d-none">Отменить</button>
                                            <input type="hidden" name="order_id" value="<?= $order["ORDER"]["ID"] ?>" />
                                        </form>
                                        <form class="orderAddress col-12 d-flex">
                                            <span>Адрес:</span><div class="value"> <strong><?= $arOrderProps[7]['VALUE'] ?> <?= $arOrderProps[11]['VALUE'] ?></strong></div>
                                            <div class="input d-none"><input type="text" name="address" value="<?= $arOrderProps[7]['VALUE'] ?> <?= $arOrderProps[11]['VALUE'] ?>"  /></div>
                                            <button class="btn btn-sm changeValue">Изменить</button>
                                            <button class="btn btn-sm btn-success saveValue d-none">Сохранить</button>
                                            <button class="btn btn-sm btn-info cancelValue d-none">Отменить</button>
                                            <input type="hidden" name="order_id" value="<?= $order["ORDER"]["ID"] ?>" />
                                        </form>	
                                    <? } ?>

                                    <form class="orderPhone col-12">
                                        <?
                                        $phone = FancyPhone($arOrderProps[3]['VALUE']);
                                        ?>
                                        <span>Телефон:</span><div class="value"> <strong><a href="tel:+<?= $arOrderProps[3]['VALUE'] ?>" target="_blank">+<?= $phone ?></a></strong></div>
                                        <div class="input d-none"><input type="text" name="phone" value="<?= $arOrderProps[3]['VALUE'] ?>"  /></div>
                                        <button class="btn btn-sm changeValue">Изменить</button>
                                        <button class="btn btn-sm btn-success saveValue d-none">Сохранить</button>
                                        <button class="btn btn-sm btn-info cancelValue d-none">Отменить</button>
                                        <input type="hidden" name="order_id" value="<?= $order["ORDER"]["ID"] ?>" />
                                    </form>
                                    <form class="orderPhone col-12">

                                        <span>Способ оплаты:</span><div class="value"><strong><?= $order["PAYMENT"][0]["PAY_SYSTEM_NAME"] ?><?if($order["ORDER"]["PAYED"]=="Y"){?>, ОПЛАЧЕНО<?}else{ if($order["PAYMENT"][0]["PAY_SYSTEM_ID"]==7){?>, НЕ ОПЛАЧЕНО<?}}?></strong></div>

                                    </form>
                                    <?
                                    if ($arOrderProps[9]['VALUE'] != "") {
                                        ?>
                                        <form class="orderPhone col-12">

                                            <span>Cдача с суммы:</span><div class="value"><strong><?= $arOrderProps[9]['VALUE'] ?></strong></div>

                                        </form>
                                    <? } ?>
                                </div>
                            </div>
                            <div class="col-12 orderInfo d-flex flex-column">
                                <?
                                //print_arr($order);

                                foreach ($order["BASKET_ITEMS"] as $itemID => $arBasketItem) {
                                    //if(isset($_GET["test"])){
                                    //print_arr($arBasketItem);
                                    //}
                                    $prodIDs = explode("#", $arBasketItem["PRODUCT_XML_ID"]);
                                    foreach ($prodIDs as $arrkey => $arrval) {
                                        if (empty($arrval)) {
                                            unset($prodIDs[$arrkey]);
                                        }
                                    }
$offer = CIBlockElement::GetList(array(), array("IBLOCK_ID" => 3, "ID" => $arBasketItem["PRODUCT_ID"]), false, false, array("ID", "NAME", "PROPERTY_TYPE", "PROPERTY_DIAMETR", "PROPERTY_SIZE", "PROPERTY_VOLUME"))->GetNext();
                                    if (!empty($offer["ID"])) {//есть ТП
                                    // if (count($prodIDs) > 1) {//есть ТП
                                        //$offer = CIBlockElement::GetList(array(), array("IBLOCK_ID" => 3, "XML_ID" => end($prodIDs)), false, false, array("ID", "NAME", "PROPERTY_TYPE", "PROPERTY_DIAMETR", "PROPERTY_VOLUME"))->GetNext();
                                        
                                        
                                        
                                        

                                        $offer_text = $offer["NAME"];
                                        if ($offer["PROPERTY_TYPE_VALUE"] != "") {
                                            $offer_text .= ", " . $offer["PROPERTY_TYPE_VALUE"];
                                        }
                                        if ($offer["PROPERTY_DIAMETR_VALUE"] != "") {
                                            $offer_text .= ", " . $offer["PROPERTY_DIAMETR_VALUE"];
                                        }
										if ($offer["PROPERTY_SIZE_VALUE"] != "") {
                                            $offer_text .= ", " . $offer["PROPERTY_SIZE_VALUE"];
                                        }
                                        if ($offer["PROPERTY_VOLUME_VALUE"] != "") {
                                            $offer_text .= ", " . $offer["PROPERTY_VOLUME_VALUE"];
                                        }
                                    } else {
                                        $offer_text = $arBasketItem["NAME"];
                                    }
                                    ?>
                                    <div class="orderItem d-flex align-items-center mb-2" data-id="<?= $itemID ?>">
                                        <div class="orderItemName"><?= $offer_text ?>
                                            <?php
                                            if (!empty($arBasketProps[$itemID])) {
                                                ?>
                                                <br />
                                                <small class="additives"><?= $arBasketProps[$itemID]["VALUE"] ?></small>
                                                <?
                                            }
                                            ?>
                                        </div>
                                        <div class="orderItemAmount d-flex"><button data-add="-1" class="btn btn-sm btn-info">-</button><input class="form-control" type="number" min="1"  value="<?= $arBasketItem["QUANTITY"] ?>" /> <button class="btn btn-sm btn-info" data-add="1">+</button></div>
                                        <div class="orderItemUpdate"><button class="btn btn-sm btn-default " data-id="<?= $itemID ?>" data-order-id="<?= $order["ORDER"]["ID"] ?>">Обновить</button></div>

                                        <div class="orderItemPrice"><?= round($arBasketItem["PRICE"]) ?> руб</div>
                                        <div class="orderItemDelete" ><button class="btn btn-danger" data-id="<?= $itemID ?>" data-order-id="<?= $order["ORDER"]["ID"] ?>">X</button></div>
                                    </div>
                                    <?
                                }
                                ?>
                                <div class="orderItem d-flex">
                                    <div class="orderItemName"><strong>Итого</strong></div>
                                    <div class="orderItemAmount"></div>
                                    <div class="orderItemPrice"><strong><?= $order["ORDER"]["FORMATED_PRICE"] ?></strong></div>
                                </div>
                            </div>
                            <form class="col-12 addItem">
                                <div class="inputDiv">
                                    <input type="text" class="addName" name="name" value="" placeholder="Введите название" />
                                    <div class="variants">
                                    </div>
                                </div>
                                <div class="inputDiv">Укажите количество <input type="number" min="1" name="quantity" value="1" /></div>
                                <div class="selectedItem"></div><button class="btn btn-success addItemButton btm-sm">Добавить</button>
                                <input type="hidden" class="hiddenItem" name="item_id" value="" />
                                <input type="hidden" name="add" value="1" />
                                <input type="hidden" name="order_id" value="<?= $order["ORDER"]["ID"] ?>" />
                            </form>


                            <form class="orderFull col-12">
                                <div class="value"><?= nl2br($arOrderProps[8]['VALUE']) ?></div>
                                <div class="input d-none"><textarea type="text" name="full_text" ><?= $arOrderProps[8]['VALUE'] ?></textarea></div>
                                <button class="btn btn-sm changeValue">Изменить</button>
                                <button class="btn btn-sm btn-success saveValue d-none">Сохранить</button>
                                <button class="btn btn-sm btn-info cancelValue d-none">Отменить</button>
                                <input type="hidden" name="order_id" value="<?= $order["ORDER"]["ID"] ?>" />
                            </form>

                            <?
                            //print_arr($order["ORDER"]);
                            ?>
                            <? /*
                              <div class="col-12 timeInfo">
                              <div class="row">
                              <div class="col-12 col-sm-6">

                              Время приема заказа: <strong><?=$order["ORDER"]["DATE_INSERT_FORMATED"]?></strong>
                              </div>
                              <div class="col-12 col-sm-6">
                              Крайнее время доставки: <strong><?=date("H:i",$order["ORDER"]["DATE_INSERT"]->getTimestamp()+3600)?></strong>
                              </div>

                              </div>
                              </div> */ ?>
                            <? if ($order["ORDER"]["USER_DESCRIPTION"] != "") { ?>
                                <div class="col-12 comment">
                                    <p><strong>Комментарий пользователя:</strong></p>
                                    <?= $order["ORDER"]["USER_DESCRIPTION"] ?>
                                </div>
                            <? } ?>
                            <div class="col-12 restaurantInfo staffForm">
                                Ресторан:
                                <form class="d-flex">
                                    <select id="restaurantChooser" name="restaurant" class="form-control">
                                        <option value="0">Не назначен</option>
                                        <?
                                        foreach ($arRestaurants as $arRestaurant) {
                                            ?>
                                            <option value="<?= $arRestaurant["ID"] ?>" <? if ($cur_restaurant == $arRestaurant["ID"]) { ?> selected<? } ?>><?= $arRestaurant["NAME"] ?></option>
                                            <?
                                        }
                                        ?>
                                    </select>
                                    <button class="btn btn-warning">Изменить</button>
                                    <input type="hidden" name="order_id" value="<?= $order["ORDER"]["ID"] ?>" />
                                </form>

                            </div>
                            <? /* <div class="col-12 managerInfo staffForm">
                              Менеджер:
                              <form class="d-flex">

                              <select id="managerChooser" name="manager" class="form-control">
                              <option value="0">Не назначен</option>
                              <?
                              foreach($arManagers as $arManager){
                              ?>
                              <option value="<?=$arManager["ID"]?>" <?if($cur_manager == $arManager["ID"]){?> selected<?}?>><?=$arManager["NAME"]?> <?=$arManager["LAST_NAME"]?></option>
                              <?
                              }
                              ?>
                              </select>
                              <button class="btn btn-warning">Изменить</button>
                              <input type="hidden" name="order_id" value="<?=$order["ORDER"]["ID"]?>" />
                              </form>

                              </div> */ ?>
                            <? /*
                              <div class="col-12 cookerInfo">
                              Повар:
                              <form class="d-flex">
                              <select id="cookerChooser" name="cooker" class="form-control">
                              <option value="0">Не назначен</option>
                              <?
                              foreach($arCookers as $arCooker){
                              ?>
                              <option value="<?=$arCooker["ID"]?>" <?if($cur_cooker == $arCooker["ID"]){?> selected<?}?>><?=$arCooker["NAME"]?> <?=$arCooker["LAST_NAME"]?></option>
                              <?
                              }
                              ?>
                              </select>
                              <button class="btn btn-warning">Изменить</button>
                              <input type="hidden" name="order_id" value="<?=$order["ORDER"]["ID"]?>" />
                              </form>

                              </div>
                             */ ?>
                            <form class="col-12 staffForm">
                                <button class="btn btn-danger cancelOrder">Отменить заказ</button>
                                <input type="hidden" name="order_id" value="<?= $order["ORDER"]["ID"] ?>" />
                                <input type="hidden" name="cancel" value="1" />
                            </form>
                        </div>
                    </div>
                </div>


                <?
            }
            ?>
        </div>
        <?
    } else {
        $orderHeaderStatus = null;

        if ($_REQUEST["show_canceled"] === 'Y' && count($arResult['ORDERS'])) {
            ?>
            <div class="row ">
                <div class="col">
                    <h2><?= Loc::getMessage('SPOL_TPL_ORDERS_CANCELED_HEADER') ?></h2>
                </div>
            </div>
            <?
        }

        foreach ($arResult['ORDERS'] as $key => $order) {
            if ($orderHeaderStatus !== $order['ORDER']['STATUS_ID'] && $_REQUEST["show_canceled"] !== 'Y') {
                $orderHeaderStatus = $order['ORDER']['STATUS_ID'];
                ?>
                <h1 class="sale-order-title">
                    <?= Loc::getMessage('SPOL_TPL_ORDER_IN_STATUSES') ?> &laquo;<?= htmlspecialcharsbx($arResult['INFO']['STATUS'][$orderHeaderStatus]['NAME']) ?>&raquo;
                </h1>
                <?
            }
            ?>
            <div class="row sale-order-list-accomplished-title-container">
                <h3 class="g-font-size-20 col-12 col-sm">
                    <?= Loc::getMessage('SPOL_TPL_ORDER') ?>
                    <?= Loc::getMessage('SPOL_TPL_NUMBER_SIGN') ?>
                    <?= htmlspecialcharsbx($order['ORDER']['ACCOUNT_NUMBER']) ?>
                    <?= Loc::getMessage('SPOL_TPL_FROM_DATE') ?>
                    <span class="text-nowrap"><?= $order['ORDER']['DATE_INSERT'] ?>,</span>
                    <?= count($order['BASKET_ITEMS']); ?>
                    <?
                    $count = substr(count($order['BASKET_ITEMS']), -1);
                    if ($count == '1') {
                        echo Loc::getMessage('SPOL_TPL_GOOD');
                    } elseif ($count >= '2' || $count <= '4') {
                        echo Loc::getMessage('SPOL_TPL_TWO_GOODS');
                    } else {
                        echo Loc::getMessage('SPOL_TPL_GOODS');
                    }
                    ?>
                    <?= Loc::getMessage('SPOL_TPL_SUMOF') ?>
                    <span class="text-nowrap"><?= $order['ORDER']['FORMATED_PRICE'] ?></span>
                </h3>
                <div class="col-sm-auto">
                    <?
                    if ($_REQUEST["show_canceled"] !== 'Y') {
                        ?>
                        <span class="sale-order-list-accomplished-date">
                            <?= Loc::getMessage('SPOL_TPL_ORDER_FINISHED') ?>
                        </span>
                        <?
                    } else {
                        ?>
                        <span class="sale-order-list-accomplished-date canceled-order">
                            <?= Loc::getMessage('SPOL_TPL_ORDER_CANCELED') ?>
                        </span>
                        <?
                    }
                    ?>
                    <span class="sale-order-list-accomplished-date"><?= $order['ORDER']['DATE_STATUS_FORMATED'] ?></span>
                </div>
            </div>
            <div class="row mb-5">
                <div class="col pt-3 sale-order-list-inner-container">
                    <div class="row pb-3 sale-order-list-inner-row">
                        <div class="col-auto col-auto sale-order-list-about-container">
                            <a class="g-font-size-15 sale-order-list-about-link" href="<?= htmlspecialcharsbx($order["ORDER"]["URL_TO_DETAIL"]) ?>"><?= Loc::getMessage('SPOL_TPL_MORE_ON_ORDER') ?></a>
                        </div>
                        <div class="col"></div>
                        <div class="col-auto sale-order-list-repeat-container">
                            <a class="g-font-size-15 sale-order-list-cancel-link" href="<?= htmlspecialcharsbx($order["ORDER"]["URL_TO_COPY"]) ?>"><?= Loc::getMessage('SPOL_TPL_REPEAT_ORDER') ?></a>
                        </div>
                    </div>
                </div>
            </div>
            <?
        }
    }

    echo $arResult["NAV_STRING"];

    if ($_REQUEST["filter_history"] !== 'Y') {
        $javascriptParams = array(
            "url" => CUtil::JSEscape($this->__component->GetPath() . '/ajax.php'),
            "templateFolder" => CUtil::JSEscape($templateFolder),
            "templateName" => $this->__component->GetTemplateName(),
            "paymentList" => $paymentChangeData
        );
        $javascriptParams = CUtil::PhpToJSObject($javascriptParams);
        ?>
        <script>
            BX.Sale.PersonalOrderComponent.PersonalOrderList.init(<?= $javascriptParams ?>);
        </script>
        <?
    }
}
?>
