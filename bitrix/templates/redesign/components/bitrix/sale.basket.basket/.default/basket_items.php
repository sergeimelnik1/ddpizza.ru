<? if (!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED !== true) die(); ?>
<?

use Bitrix\Sale\DiscountCouponsManager;

$bDelayColumn = false;
$bDeleteColumn = false;
$bWeightColumn = false;
$bPropsColumn = false;
$bPriceType = false;

foreach ($arResult["GRID"]["HEADERS"] as $id => $arHeader):
    $arHeaders[] = $arHeader["id"];
    if (in_array($arHeader["id"], array("TYPE"))) {
        $bPriceType = true;
        continue;
    } elseif ($arHeader["id"] == "PROPS") {
        $bPropsColumn = true;
        continue;
    } elseif ($arHeader["id"] == "DELAY") {
        $bDelayColumn = true;
        continue;
    } elseif ($arHeader["id"] == "DELETE") {
        $bDeleteColumn = true;
        continue;
    } elseif ($arHeader["id"] == "WEIGHT") {
        $bWeightColumn = true;
    }
endforeach;
?>
<div id="basket_items_list" class="current row">
    <div class="basket_items_block col-xs-12 col-md-9">
        <?
        if ($normalCount > 0) {
            $idPokupka = array();
            foreach ($arResult["ITEMS"]["AnDelCanBuy"] as $key => $arItem) {
                $idPokupka[]['ID'] = $arItem['PRODUCT_ID'];
                $idPokupka[]['URL'] = $arItem['DETAIL_PAGE_URL'];
                ?>
                <div class="basketItem">
                    <div class="basketItemImage">
                        <img src="<?= $arResult['GRID']['ROWS'][$arItem['ID']]['PICTURE_SRC'] ?>"/>
                    </div>
                    <div class="basketItemInfo">
                        <div class="basketItemName">
                            <?= $arItem["NAME"]; ?>
                        </div>
                        <div class="basketItemDesc">
                            <div class="basketItemDescText">
                                <?= $arItem["PREVIEW_TEXT"] ?>
                            </div>
                            <?
                            $t = false;
                            foreach ($arItem["PROPS"] as $val) {
                                if (is_array($arItem["SKU_DATA"])) {
                                    $bSkip = false;
                                    foreach ($arItem["SKU_DATA"] as $propId => $arProp) {
                                        if ($arProp["CODE"] == $val["CODE"]) {
                                            $bSkip = true;
                                            break;
                                        }
                                    }
                                    if ($bSkip)
                                        continue;
                                }
                                if (!$t) {
                                    echo '<div class="itemNameProps">';
                                }
                                $t = true;
                                echo "<b>" . $val["NAME"] . ":</b>&nbsp;<span>" . $val["VALUE"] . "</span><br/>";
                            }
                            ?>
                            <?
                            if ($t) {
                                echo "</div>";
                            }
                            ?>

                            <?
                            if (is_array($arItem["SKU_DATA"]) && !empty($arItem["SKU_DATA"])) {
                                ?>
                                <div class="text_sku_props">
                                    <div class="itemNameProps"><?
                                        foreach ($arItem["PROPS"] as $val):
                                            echo "<b>" . $val["NAME"] . ":</b>&nbsp;<span>" . $val["VALUE"] . "</span><br/>";
                                        endforeach;
                                        ?></div>
                                    <a href="javascript: void(0);" class="javascript show_basket_sku_props"><?= GetMessage("SF_CHANGE_SKU"); ?></a>
                                </div>
                                <div class="hidden_sku_props" style="display: none;">
                                    <?
                                    foreach ($arItem["SKU_DATA"] as $propId => $arProp):

                                        // if property contains images or values
                                        $isImgProperty = false;
                                        if (array_key_exists('VALUES', $arProp) && is_array($arProp["VALUES"]) && !empty($arProp["VALUES"])) {
                                            foreach ($arProp["VALUES"] as $id => $arVal) {
                                                if (isset($arVal["PICT"]) && !empty($arVal["PICT"]) && is_array($arVal["PICT"]) && isset($arVal["PICT"]['SRC']) && !empty($arVal["PICT"]['SRC'])) {
                                                    $isImgProperty = true;
                                                    break;
                                                }
                                            }
                                        }
                                        $countValues = count($arProp["VALUES"]);
                                        $full = ($countValues > 5) ? "full" : "";
                                        if ($isImgProperty): // iblock element relation property
                                            ?>
                                            <div class="bx_item_detail_scu_small_noadaptive <?= $full ?>">
                                                <span class="bx_item_section_name_gray">
                                                    <?= $arProp["NAME"] ?>:
                                                </span>
                                                <div class="bx_scu_scroller_container">

                                                    <div class="bx_scu">
                                                        <ul id="prop_<?= $arProp["CODE"] ?>_<?= $arItem["ID"] ?>" class="sku_prop_list">
                                                            <?
                                                            foreach ($arProp["VALUES"] as $valueId => $arSkuValue) {
                                                                $selected = "";
                                                                foreach ($arItem["PROPS"] as $arItemProp):
                                                                    if ($arItemProp["CODE"] == $arItem["SKU_DATA"][$propId]["CODE"]) {
                                                                        if ($arItemProp["VALUE"] == $arSkuValue["NAME"] || $arItemProp["VALUE"] == $arSkuValue["XML_ID"])
                                                                            $selected = "bx_active";
                                                                    }
                                                                endforeach;
                                                                ?>
                                                                <li
                                                                    class="sku_prop <?= $selected ?>"
                                                                    data-value-id="<?= $arSkuValue["XML_ID"] ?>"
                                                                    data-element="<?= $arItem["ID"] ?>"
                                                                    data-property="<?= $arProp["CODE"] ?>"
                                                                    >
                                                                    <a href="javascript:void(0);" class="cnt">
                                                                        <img src="<?= $arSkuValue["PICT"]["SRC"] ?>">
                                                                    </a>
                                                                </li>
                                                                <?
                                                            }
                                                            ?>
                                                        </ul>
                                                    </div>

                                                    <div class="bx_slide_left" onclick="leftScroll('<?= $arProp["CODE"] ?>', <?= $arItem["ID"] ?>, <?= $countValues ?>);"></div>
                                                    <div class="bx_slide_right" onclick="rightScroll('<?= $arProp["CODE"] ?>', <?= $arItem["ID"] ?>, <?= $countValues ?>);"></div>
                                                </div>

                                            </div>
                                            <?
                                        else:
                                            ?>

                                            <div class="bx_item_detail_size_small_noadaptive <?= $full ?>">

                                                <span class="bx_item_section_name_gray">
                                                    <?= $arProp["NAME"] ?>:
                                                </span>

                                                <div class="bx_size_scroller_container">
                                                    <div class="bx_size">
                                                        <ul id="prop_<?= $arProp["CODE"] ?>_<?= $arItem["ID"] ?>"
                                                            class="sku_prop_list"
                                                            >
                                                                <?
                                                                foreach ($arProp["VALUES"] as $valueId => $arSkuValue):

                                                                    $selected = "";
                                                                    foreach ($arItem["PROPS"] as $arItemProp):
                                                                        if ($arItemProp["CODE"] == $arItem["SKU_DATA"][$propId]["CODE"]) {
                                                                            if ($arItemProp["VALUE"] == $arSkuValue["NAME"])
                                                                                $selected = "bx_active";
                                                                        }
                                                                    endforeach;
                                                                    ?>
                                                                <li style="width:10%;"
                                                                    class="sku_prop <?= $selected ?>"
                                                                    data-value-id="<?= $arSkuValue["NAME"] ?>"
                                                                    data-element="<?= $arItem["ID"] ?>"
                                                                    data-property="<?= $arProp["CODE"] ?>"
                                                                    >
                                                                    <a href="javascript:void(0);"><?= $arSkuValue["NAME"] ?></a>
                                                                </li>
                                                                <?
                                                            endforeach;
                                                            ?>
                                                        </ul>
                                                    </div>
                                                    <div class="bx_slide_left" onclick="leftScroll('<?= $arProp["CODE"] ?>', <?= $arItem["ID"] ?>, <?= $countValues ?>);"></div>
                                                    <div class="bx_slide_right" onclick="rightScroll('<?= $arProp["CODE"] ?>', <?= $arItem["ID"] ?>, <?= $countValues ?>);"></div>
                                                </div>

                                            </div>

                                        <?
                                        endif;
                                    endforeach;
                                    ?>
                                </div>
                                <?
                            }
                            ?>
                            <? if (count($arItem["ADDITIVES"]) > 0) { ?>
                                <div class="additives">
                                    <?
                                    $add_cnt = 0;
                                    foreach ($arItem["ADDITIVES"] as $add_id => $arAdditive) {
                                        $add_cnt++;
                                        echo $arAdditive["NAME"];
                                        if ($add_cnt < count($arItem["ADDITIVES"])) {
                                            echo ", ";
                                        }
                                    }
                                    ?>
                                </div>
                                <?
                            }
                            ?>
                        </div>
                        <? if ($arItem["PRICE"] > 0) { ?>
                            <div class="basketItemQuantity">
                                <div class="itQuant_container">
                                    <span class="quantityText">Количество:</span>
                                    <?
                                    $ratio = isset($arItem["MEASURE_RATIO"]) ? $arItem["MEASURE_RATIO"] : 1;
                                    $max = isset($arItem["AVAILABLE_QUANTITY"]) ? "max=\"" . $arItem["AVAILABLE_QUANTITY"] . "\"" : "";
                                    $useFloatQuantity = ($arParams["QUANTITY_FLOAT"] == "Y") ? true : false;
                                    $useFloatQuantityJS = ($useFloatQuantity ? "true" : "false");
                                    ?>
                                    <a href="javascript:void(0);" class="minus" onclick="setQuantity(<?= $arItem["ID"] ?>, <?= $ratio ?>, 'down', <?= $useFloatQuantityJS ?>);">-</a>
                                    <input
                                        type="text"
                                        size="3"
                                        id="QUANTITY_INPUT_<?= $arItem["ID"] ?>"
                                        name="QUANTITY_INPUT_<?= $arItem["ID"] ?>"
                                        size="2"
                                        maxlength="18"
                                        min="1"
                                        readonly
                                        <?= $max ?>
                                        step="<?= $ratio ?>"
                                        value="<?= $arItem["QUANTITY"] ?>"
                                        onchange="updateQuantity('QUANTITY_INPUT_<?= $arItem["ID"] ?>', '<?= $arItem["ID"] ?>', <?= $ratio ?>, <?= $useFloatQuantityJS ?>)"
                                        >
                                    <a href="javascript:void(0);" class="plus" onclick="setQuantity(<?= $arItem["ID"] ?>, <?= $ratio ?>, 'up', <?= $useFloatQuantityJS ?>);">+</a>
                                    <input type="text" value="<?= $arItem["QUANTITY"] ?>" name="QUANTITY_<?= $arItem["ID"] ?>" id="QUANTITY_<?= $arItem["ID"] ?>"<?= (isset($arItem["AVAILABLE_QUANTITY"]) ? " data-max=\"" . $arItem["AVAILABLE_QUANTITY"] . "\"" : ""); ?> class="hidden" />
                                </div>
                            </div>
                        <? } ?>
                        <div class="basketItemPrice">
                            <? /* if ($arItem["DISCOUNT_PRICE"] > 0) { ?><div class="basket_old_price"><?= str_replace(GetMessage("STUDIOFACT_RUB"), "<span class=\"rub black\">" . GetMessage("STUDIOFACT_R") . "</span>", $arItem["FULL_PRICE_FORMATED"]); ?></div><? } */ ?>
                            <div class="basket_price">
                                <? if ($arItem["PRICE"] > 0) { ?>
                                    <?= str_replace(GetMessage("STUDIOFACT_RUB"), "<span class=\"rub black\">" . GetMessage("STUDIOFACT_R") . "</span>", $arItem["PRICE_FORMATED"]); ?>
                                <? } else { ?>Бесплатно<? } ?>
                            </div>
                        </div>

                        <div class="basketItemRemove">
                            <a href="<?= str_replace("#ID#", $arItem["ID"], $arUrls["delete"]) ?>"><img src="<?= SITE_TEMPLATE_PATH ?>/images/remove_item.png" /></a>
                        </div>
                    </div>
                </div>
            <? } ?>


            <? if ($arParams['USE_GIFTS'] === 'Y') {
                ?>
                <div class="giftBlock">
                    <?
                    CBitrixComponent::includeComponentClass('bitrix:sale.products.gift.basket');

                    $giftParameters = array(
                        'SHOW_PRICE_COUNT' => 1,
                        'PRODUCT_SUBSCRIPTION' => 'N',
                        'PRODUCT_ID_VARIABLE' => 'id',
                        'USE_PRODUCT_QUANTITY' => 'N',
                        'ACTION_VARIABLE' => 'actionGift',
                        'ADD_PROPERTIES_TO_BASKET' => 'Y',
                        'PARTIAL_PRODUCT_PROPERTIES' => 'Y',
                        'BASKET_URL' => $APPLICATION->GetCurPage(),
                        'APPLIED_DISCOUNT_LIST' => $arResult['APPLIED_DISCOUNT_LIST'],
                        'FULL_DISCOUNT_LIST' => $arResult['FULL_DISCOUNT_LIST'],
                        'TEMPLATE_THEME' => $arParams['TEMPLATE_THEME'],
                        'PRICE_VAT_INCLUDE' => $arParams['PRICE_VAT_SHOW_VALUE'],
                        'CACHE_GROUPS' => $arParams['CACHE_GROUPS'],
                        'BLOCK_TITLE' => $arParams['GIFTS_BLOCK_TITLE'],
                        'HIDE_BLOCK_TITLE' => $arParams['GIFTS_HIDE_BLOCK_TITLE'],
                        'TEXT_LABEL_GIFT' => $arParams['GIFTS_TEXT_LABEL_GIFT'],
                        'DETAIL_URL' => isset($arParams['GIFTS_DETAIL_URL']) ? $arParams['GIFTS_DETAIL_URL'] : null,
                        'PRODUCT_QUANTITY_VARIABLE' => $arParams['GIFTS_PRODUCT_QUANTITY_VARIABLE'],
                        'PRODUCT_PROPS_VARIABLE' => $arParams['GIFTS_PRODUCT_PROPS_VARIABLE'],
                        'SHOW_OLD_PRICE' => $arParams['GIFTS_SHOW_OLD_PRICE'],
                        'SHOW_DISCOUNT_PERCENT' => $arParams['GIFTS_SHOW_DISCOUNT_PERCENT'],
                        'DISCOUNT_PERCENT_POSITION' => $arParams['DISCOUNT_PERCENT_POSITION'],
                        'MESS_BTN_BUY' => $arParams['GIFTS_MESS_BTN_BUY'],
                        'MESS_BTN_DETAIL' => $arParams['GIFTS_MESS_BTN_DETAIL'],
                        'CONVERT_CURRENCY' => $arParams['GIFTS_CONVERT_CURRENCY'],
                        'HIDE_NOT_AVAILABLE' => $arParams['GIFTS_HIDE_NOT_AVAILABLE'],
                        'PRODUCT_ROW_VARIANTS' => '',
                        'PAGE_ELEMENT_COUNT' => 0,
                        'DEFERRED_PRODUCT_ROW_VARIANTS' => \Bitrix\Main\Web\Json::encode(
                                SaleProductsGiftBasketComponent::predictRowVariants(
                                        $arParams['GIFTS_PAGE_ELEMENT_COUNT'],
                                        $arParams['GIFTS_PAGE_ELEMENT_COUNT']
                                )
                        ),
                        'DEFERRED_PAGE_ELEMENT_COUNT' => $arParams['GIFTS_PAGE_ELEMENT_COUNT'],
                        'ADD_TO_BASKET_ACTION' => 'BUY',
                        'PRODUCT_DISPLAY_MODE' => 'Y',
                        'PRODUCT_BLOCKS_ORDER' => isset($arParams['GIFTS_PRODUCT_BLOCKS_ORDER']) ? $arParams['GIFTS_PRODUCT_BLOCKS_ORDER'] : '',
                        'SHOW_SLIDER' => isset($arParams['GIFTS_SHOW_SLIDER']) ? $arParams['GIFTS_SHOW_SLIDER'] : '',
                        'SLIDER_INTERVAL' => isset($arParams['GIFTS_SLIDER_INTERVAL']) ? $arParams['GIFTS_SLIDER_INTERVAL'] : '',
                        'SLIDER_PROGRESS' => isset($arParams['GIFTS_SLIDER_PROGRESS']) ? $arParams['GIFTS_SLIDER_PROGRESS'] : '',
                        'LABEL_PROP_POSITION' => $arParams['LABEL_PROP_POSITION'],
                        'USE_ENHANCED_ECOMMERCE' => $arParams['USE_ENHANCED_ECOMMERCE'],
                        'DATA_LAYER_NAME' => $arParams['DATA_LAYER_NAME'],
                        'BRAND_PROPERTY' => $arParams['BRAND_PROPERTY']
                    );

                    $APPLICATION->IncludeComponent(
                            'bitrix:sale.products.gift.basket',
                            '.default',
                            $giftParameters,
                            $component
                    );
                    ?>
                </div>

            <? } ?>
        </div>

        <input type="hidden" id="column_headers" value="<?= CUtil::JSEscape(implode($arHeaders, ",")) ?>" />
        <input type="hidden" id="offers_props" value="<?= CUtil::JSEscape(implode($arParams["OFFERS_PROPS"], ",")) ?>" />
        <input type="hidden" id="action_var" value="<?= CUtil::JSEscape($arParams["ACTION_VARIABLE"]) ?>" />
        <input type="hidden" id="quantity_float" value="<?= $arParams["QUANTITY_FLOAT"] ?>" />
        <input type="hidden" id="count_discount_4_all_quantity" value="<?= ($arParams["COUNT_DISCOUNT_4_ALL_QUANTITY"] == "Y") ? "Y" : "N" ?>" />
        <input type="hidden" id="price_vat_show_value" value="<?= ($arParams["PRICE_VAT_SHOW_VALUE"] == "Y") ? "Y" : "N" ?>" />
        <input type="hidden" id="hide_coupon" value="<?= ($arParams["HIDE_COUPON"] == "Y") ? "Y" : "N" ?>" />
        <input type="hidden" id="coupon_approved" value="N" />
        <input type="hidden" id="use_prepayment" value="<?= ($arParams["USE_PREPAYMENT"] == "Y") ? "Y" : "N" ?>" />
        <div class="bx_ordercart_order_pay col-xs-12 col-md-3">
            <div class="cartSummary">


                <?
                $summ = str_replace(" ", "&nbsp;", $arResult["allSum_FORMATED"]);
                if (count($arResult["ITEMS"]["AnDelCanBuy"]) > 0) {
                    $word = "товаров";
                    $strNum = strval(count($arResult["ITEMS"]["AnDelCanBuy"]));

                    $last_digit = substr($strNum, -1, 1);
                    switch ($last_digit) {
                        case "1":
                            $word = "товар";
                            break;
                        case "2":
                        case "3":
                        case "4":
                            $word = "товара";
                            break;
                    }
                    ?>
                    <span class="cart_quantity">
                        <span class="quant inline">
                            <span><?= count($arResult["ITEMS"]["AnDelCanBuy"]); ?></span> <?= $word ?>
                        </span> в корзине<br /> на сумму:

                        <span class="summ inline">
                            <?= str_replace(GetMessage("STUDIOFACT_RUB"), "<span class=\"rub black\">" . GetMessage("STUDIOFACT_R") . "</span>", $summ); ?>
                        </span>
                    </span>
                <? } ?>
                <div class="bx_ordercart_order_pay_center">
                    <? if ($arParams["USE_PREPAYMENT"] == "Y" && strlen($arResult["PREPAY_BUTTON"]) > 0): ?>
                        <?= $arResult["PREPAY_BUTTON"] ?>
                        <span><?= GetMessage("SALE_OR") ?></span>
                    <? endif; ?>
                    <? /* <a href="javascript:void(0)" onclick="checkOut();" class="checkout btn btn-primary">
                      <?= GetMessage("SALE_ORDER") ?>
                      </a> */ ?>
                    <a href="/personal/order/make/" class="checkout btn btn-primary">
                        <?= GetMessage("SALE_ORDER") ?>
                    </a>
                </div>
            </div>

            <?
            if ($arParams["HIDE_COUPON"] != "Y") {
                ?>
                <div id="coupons_block">
                    <div class="bx_ordercart_coupon">
                        <span>Промокод</span>
                        <input type="text" id="coupon" name="COUPON" value="" onchange="enterCoupon();" class="form-control" />
                        <a class="btn btn-primary" href="javascript:void(0)" onclick="enterCoupon();" title="Применить">Применить</a>
                    </div>
                    <?
                    if (!empty($arResult['COUPON_LIST'])) {
                        foreach ($arResult['COUPON_LIST'] as $oneCoupon) {
                            $couponClass = 'disabled';
                            switch ($oneCoupon['STATUS']) {
                                case DiscountCouponsManager::STATUS_NOT_FOUND:
                                case DiscountCouponsManager::STATUS_FREEZE:
                                    $couponClass = 'bad';
                                    break;
                                case DiscountCouponsManager::STATUS_APPLYED:
                                    $couponClass = 'good';
                                    break;
                            }
                            ?><div class="bx_ordercart_coupon"><input disabled readonly type="text" name="OLD_COUPON[]" value="<?= htmlspecialcharsbx($oneCoupon['COUPON']); ?>" class="<? echo $couponClass; ?>"><span class="<? echo $couponClass; ?>" data-coupon="<? echo htmlspecialcharsbx($oneCoupon['COUPON']); ?>"></span><div class="bx_ordercart_coupon_notes"><?
                            if (isset($oneCoupon['CHECK_CODE_TEXT'])) {
                                echo (is_array($oneCoupon['CHECK_CODE_TEXT']) ? implode('<br>', $oneCoupon['CHECK_CODE_TEXT']) : $oneCoupon['CHECK_CODE_TEXT']);
                            }
                            ?></div></div><?
                        }
                        unset($couponClass, $oneCoupon);
                    }
                    ?>
                </div>
                <?
            }
            ?>
        </div>


        <div id="ajaxload" style="display:none">
            <span class="logo"><img src="/logo.svg" alt=""></span>
        </div>

    </div>
    <?
} else {
    echo "<br />" . GetMessage("SALE_NO_ITEMS");
}
?>
</div>
</div>