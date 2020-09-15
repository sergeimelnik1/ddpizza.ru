<?
if (!defined('B_PROLOG_INCLUDED') || B_PROLOG_INCLUDED !== true)
    die();

use \Bitrix\Main\Localization\Loc;
use Bitrix\Highloadblock as HL;

/**
 * @global CMain $APPLICATION
 * @var array $arParams
 * @var array $item
 * @var array $actualItem
 * @var array $minOffer
 * @var array $itemIds
 * @var array $price
 * @var array $measureRatio
 * @var bool $haveOffers
 * @var bool $showSubscribe
 * @var array $morePhoto
 * @var bool $showSlider
 * @var string $imgTitle
 * @var string $productTitle
 * @var string $buttonSizeClass
 * @var CatalogSectionComponent $component
 */
?>
<div class="productCard" data-id="<?= $item["ID"] ?>">
    <div class="stickers">
        <?
        if ($item['LABEL']) {
            ?>
            <div class="icon_box product-item-label-text <?= $labelPositionClass ?>" id="<?= $itemIds['STICKER_ID'] ?>">
                <?
                if (!empty($item['LABEL_ARRAY_VALUE'])) {
                    foreach ($item['LABEL_ARRAY_VALUE'] as $code => $value) {
                        ?>
                        <div class="<?= strtolower($code) . (!isset($item['LABEL_PROP_MOBILE'][$code]) ? ' hidden-xs' : '') ?>" title="<?= $value ?>"></div>
                        <?
                    }
                }
                ?>
            </div>
            <?
        }
        ?>
    </div>
    <div class="productImage">
<a data-fancybox="" href="#itemPopup_<?=$item['ID']?>" data-options='{touch : false}'>
        <img class="lazyLoadImage lzy_img" src="/include/pizza.svg" data-src="<?= $item['PREVIEW_PICTURE']['SRC'] ?>" />
		</a>
    </div>
    <div class="productInfo">
        <div class="productName">
<a data-fancybox="" href="#itemPopup_<?=$item['ID']?>" data-options='{touch : false}'>
            <?= $productTitle ?>
</a>
        </div>
        <div class="productDesc">
            <?= $item["PREVIEW_TEXT"] ?>
        </div>
		<?
		$priceFrame = $this->createFrame("price_frame_".$item["ID"])->begin();
		?>
        <div class="productActions">
            <div class="productPrice">
                <div class="bx_catalog_item_price" data-entity="price-block">
                    <div class="item_price">
                        <?
                        if ($arParams['SHOW_OLD_PRICE'] === 'Y') {
                            ?>
                            <div class="old_price" id="<?= $itemIds['PRICE_OLD'] ?>" <?= ($price['RATIO_PRICE'] >= $price['RATIO_BASE_PRICE'] ? 'style="display: none;"' : '') ?>>
                                <?= $price['PRINT_RATIO_BASE_PRICE'] ?>
                            </div>
                            <?
                        }
                        ?>
                        <div class="price_box__actual-price" id="<?= $itemIds['PRICE'] ?>">
                            <?
                            if (!empty($price)) {
                                if ($arParams['PRODUCT_DISPLAY_MODE'] === 'N' && $haveOffers) {
                                    echo Loc::getMessage(
                                            'CT_BCI_TPL_MESS_PRICE_SIMPLE_MODE',
                                            array(
                                                '#PRICE#' => $price['PRINT_RATIO_PRICE'],
                                                '#VALUE#' => $measureRatio,
                                                '#UNIT#' => $minOffer['ITEM_MEASURE']['TITLE']
                                            )
                                    );
                                } else {
                                    echo $price['PRINT_RATIO_PRICE'];
                                }
                            }
                            ?>
                        </div>
                    </div>
                </div>
            </div>
            <div class="productOffers">
                <div class="buy_box fr" data-entity="buttons-block">
                    <?
                    if (!$haveOffers) {
                        if ($actualItem['CAN_BUY']) {
                            ?>
                            <div id="<?= $itemIds['BASKET_ACTIONS'] ?>" class="basket_action_container">
                                <a class="buy buy_button_a show_basket_popup inline" id="<?= $itemIds['BUY_LINK'] ?>" href="javascript:void(0)" rel="nofollow"></a>
                            </div>
                            <?
                        }
                    } else {
                        if ($arParams['PRODUCT_DISPLAY_MODE'] === 'Y') {
                            ?>
                            <div class="product-item-button-container">


                                <div id="<?= $itemIds['BASKET_ACTIONS'] ?>" class="basket_action_container" style="display: <?= ($actualItem['CAN_BUY'] ? '' : 'none') ?>;">
                                    <a class="buy buy_button_a show_basket_popup inline" id="<?= $itemIds['BUY_LINK'] ?>" href="javascript:void(0)" rel="nofollow"></a>
                                </div>
                            </div>
                            <?
                        } else {
                            ?>
                            <div class="product-item-button-container">
                                <a class="btn btn-default <?= $buttonSizeClass ?>" href="<?= $item['DETAIL_PAGE_URL'] ?>">
                                    <?= $arParams['MESS_BTN_DETAIL'] ?>
                                </a>
                            </div>
                            <?
                        }
                    }
                    ?>
                </div>
                <div class="list-info-buttons">
                    <a data-fancybox href="#itemPopup_<?= $item["ID"] ?>" data-options='{touch : false}' class="list-offer-button" data-id="<?= $item["ID"] ?>">Выбрать<i class="arr icons_fa"></i></a>
                </div>
            </div>
        </div>
		<?$priceFrame->end();?>
    </div>
</div>


<div class="itemPopup" data-price="<?= $price["RATIO_PRICE"] ?>" data-baseprice="<?= $price["RATIO_PRICE"] ?>" id="itemPopup_<?= $item["ID"] ?>" data-id="<?= $item["ID"] ?>" style="display:none">
    <div class="itemImage">
        <img id="<?=$arResult['AREA_ID']?>_pict"  class="lazyLoadImage lzy_img" src="/include/pizza.svg" data-src="<?= $item["PREVIEW_PICTURE"]["SRC"] ?>" />
    </div>
    <div class="itemInfo">
        <div class="itemName"><?= $item["NAME"] ?></div>
        <div class="itemDesc">
            <?
            $desc = $item["DETAIL_TEXT"];
            if (empty($desc)) {
                $desc = $item["PREVIEW_TEXT"];
            }
            echo $desc;
            ?>
        </div>
    </div>
    <div class="itemOffers">
        <div class="additives hidden">
            Выбранные добавки: <span></span>
        </div>
        <div class="product-params<? if ((isset($actualItem['DISPLAY_PROPERTIES']) && !empty($actualItem['DISPLAY_PROPERTIES'])) || count($item['OFFERS']) > 0): ?> top-indent<? endif; ?>">

            <?
            if ($arParams['PRODUCT_DISPLAY_MODE'] === 'Y' && $haveOffers && !empty($item['OFFERS_PROP'])) {
                ?>
                <div class="bx_catalog_item_scu offers_item" id="<?= $itemIds['PROP_DIV'] ?>">
                    <?
                    foreach ($arParams['SKU_PROPS'] as $skuProperty) {
                        $propertyId = $skuProperty['ID'];
                        $skuProperty['NAME'] = htmlspecialcharsbx($skuProperty['NAME']);
                        if (!isset($item['SKU_TREE_VALUES'][$propertyId]))
                            continue;
                        ?>
                        <div class="offer_item" data-entity="sku-block">
                            <div class="<?= ($skuProperty['SHOW_MODE'] === 'PICT') ? 'bx_item_detail_scu' : 'bx_item_detail_size' ?>" data-entity="sku-line-block">
                                <div class="offer_name"><?= $skuProperty['NAME'] ?></div>
                                <div class="bx_scu_scroller_container">
                                    <div class="<?= ($skuProperty['SHOW_MODE'] === 'PICT') ? 'bx_scu' : 'bx_size' ?>">
                                        <ul class="product-item-scu-item-list">
                                            <?
                                            foreach ($skuProperty['VALUES'] as $value) {
                                                if (!isset($item['SKU_TREE_VALUES'][$propertyId][$value['ID']]))
                                                    continue;

                                                $value['NAME'] = htmlspecialcharsbx($value['NAME']);

                                                if ($skuProperty['SHOW_MODE'] === 'PICT') {
                                                    ?>
                                                    <li title="<?= $value['NAME'] ?>" data-treevalue="<?= $propertyId ?>_<?= $value['ID'] ?>" data-onevalue="<?= $value['ID'] ?>">
                                                        <i title="<?= $value['NAME'] ?>"></i>
                                                        <span class="cnt">
                                                            <span class="cnt_item" title="<?= $value['NAME'] ?>" style="background-image: url(<?= $value['PICT']['SRC'] ?>);"></span>
                                                        </span>
                                                    </li>
                                                    <?
                                                } else {
                                                    ?>
                                                    <li title="<?= $value['NAME'] ?>" data-treevalue="<?= $propertyId ?>_<?= $value['ID'] ?>" data-onevalue="<?= $value['ID'] ?>">
                                                        <a href="#!" class="cnt"><?= $value['NAME'] ?></a>
                                                    </li>
                                                    <?
                                                }
                                            }
                                            ?>
                                        </ul>
                                        <div style="clear: both;"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <?
                    }
                    ?>
                </div>
                <?
                foreach ($arParams['SKU_PROPS'] as $skuProperty) {
                    if (!isset($item['OFFERS_PROP'][$skuProperty['CODE']]))
                        continue;

                    $skuProps[] = array(
                        'ID' => $skuProperty['ID'],
                        'SHOW_MODE' => $skuProperty['SHOW_MODE'],
                        'VALUES' => $skuProperty['VALUES'],
                        'VALUES_COUNT' => $skuProperty['VALUES_COUNT']
                    );
                }

                unset($skuProperty, $value);

                if ($item['OFFERS_PROPS_DISPLAY']) {
                    foreach ($item['JS_OFFERS'] as $keyOffer => $jsOffer) {
                        $strProps = '';

                        if (!empty($jsOffer['DISPLAY_PROPERTIES'])) {
                            foreach ($jsOffer['DISPLAY_PROPERTIES'] as $displayProperty) {
                                $strProps .= '<p><span class="prop_name">' . $displayProperty['NAME'] . '</span><span class="prop_value">'
                                        . (is_array($displayProperty['VALUE']) ? implode(' / ', $displayProperty['VALUE']) : $displayProperty['VALUE'])
                                        . '</span></p>';
                            }
                        }

                        $item['JS_OFFERS'][$keyOffer]['DISPLAY_PROPERTIES'] = $strProps;
                    }
                    unset($jsOffer, $strProps);
                }
            }

            if (!$haveOffers) {
                if (!empty($item['DISPLAY_PROPERTIES'])) {
                    ?>
                    <div class="bx_catalog_item_articul item_props main_preview_props" data-entity="props-block">
                        <?
                        foreach ($item['DISPLAY_PROPERTIES'] as $code => $displayProperty) {
                            ?>
                            <p>
                                <span class="prop_name"><?= $displayProperty['NAME'] ?></span>
                                <span class="prop_value">
                                    <?= (is_array($displayProperty['DISPLAY_VALUE']) ? implode(' / ', $displayProperty['DISPLAY_VALUE']) : $displayProperty['DISPLAY_VALUE']) ?>
                                </span>
                            </p>
                            <?
                        }
                        ?>
                    </div>
                    <?
                }

                if ($arParams['ADD_PROPERTIES_TO_BASKET'] === 'Y' && !empty($item['PRODUCT_PROPERTIES'])) {
                    ?>
                    <div id="<?= $itemIds['BASKET_PROP_DIV'] ?>" style="display: none;">
                        <?
                        if (!empty($item['PRODUCT_PROPERTIES_FILL'])) {
                            foreach ($item['PRODUCT_PROPERTIES_FILL'] as $propID => $propInfo) {
                                ?>
                                <input type="hidden" name="<?= $arParams['PRODUCT_PROPS_VARIABLE'] ?>[<?= $propID ?>]"
                                       value="<?= htmlspecialcharsbx($propInfo['ID']) ?>">
                                       <?
                                       unset($item['PRODUCT_PROPERTIES'][$propID]);
                                   }
                               }

                               if (!empty($item['PRODUCT_PROPERTIES'])) {
                                   ?>
                            <table>
                                <?
                                foreach ($item['PRODUCT_PROPERTIES'] as $propID => $propInfo) {
                                    ?>
                                    <tr>
                                        <td class="prop-title"><?= $item['PROPERTIES'][$propID]['NAME'] ?></td>
                                        <td class="prop-value">
                                            <?
                                            if (
                                                    $item['PROPERTIES'][$propID]['PROPERTY_TYPE'] === 'L' && $item['PROPERTIES'][$propID]['LIST_TYPE'] === 'C'
                                            ) {
                                                foreach ($propInfo['VALUES'] as $valueID => $value) {
                                                    ?>
                                                    <label>
                                                        <? $checked = $valueID === $propInfo['SELECTED'] ? 'checked' : ''; ?>
                                                        <input type="radio" name="<?= $arParams['PRODUCT_PROPS_VARIABLE'] ?>[<?= $propID ?>]"
                                                               value="<?= $valueID ?>" <?= $checked ?>>
                                                               <?= $value ?>
                                                    </label>
                                                    <br />
                                                    <?
                                                }
                                            } else {
                                                ?>
                                                <select name="<?= $arParams['PRODUCT_PROPS_VARIABLE'] ?>[<?= $propID ?>]">
                                                    <?
                                                    foreach ($propInfo['VALUES'] as $valueID => $value) {
                                                        $selected = $valueID === $propInfo['SELECTED'] ? 'selected' : '';
                                                        ?>
                                                        <option value="<?= $valueID ?>" <?= $selected ?>>
                                                            <?= $value ?>
                                                        </option>
                                                        <?
                                                    }
                                                    ?>
                                                </select>
                                                <?
                                            }
                                            ?>
                                        </td>
                                    </tr>
                                    <?
                                }
                                ?>
                            </table>
                            <?
                        }
                        ?>
                    </div>
                    <?
                }
            } else {
                $showProductProps = !empty($item['DISPLAY_PROPERTIES']);
                $showOfferProps = $arParams['PRODUCT_DISPLAY_MODE'] === 'Y' && $item['OFFERS_PROPS_DISPLAY'];

                if ($showProductProps || $showOfferProps) {
                    ?>
                    <div class="bx_catalog_item_articul item_props main_preview_props" data-entity="props-block">
                        <?
                        if ($showProductProps) {
                            foreach ($item['DISPLAY_PROPERTIES'] as $code => $displayProperty) {
                                ?>
                                <p>
                                    <span class="prop_name"><?= $displayProperty['NAME'] ?></span>
                                    <span class="prop_value">
                                        <?= (is_array($displayProperty['DISPLAY_VALUE']) ? implode(' / ', $displayProperty['DISPLAY_VALUE']) : $displayProperty['DISPLAY_VALUE']) ?>
                                    </span>
                                </p>
                                <?
                            }
                        }

                        if ($showOfferProps) {
                            ?>
                            <div id="<?= $itemIds['DISPLAY_PROP_DIV'] ?>" style="display: none;"></div>
                            <?
                        }
                        ?>
                    </div>
                    <?
                }
            }
            ?>


        </div>
        <? if (!empty($item["ADDITIVES"])) { ?>
            <div class="additiveButtonOuter">
                <span class="btn btn-primary additiveBtn" data-id="<?= $item["ID"] ?>" onclick="addClick($(this))">
                    <?
                    $text = "Добавить в пиццу:";
                    if($item["IBLOCK_SECTION_ID"]==4){
                        $text = "Добавить к роллам:";
                    }
                    echo $text;
                    ?>
                </span>
            </div>
        <? } ?>
    </div>
    <form class="additiveForm" id="addForm_<?= $item["ID"] ?>" onsubmit="additiveFormSubmit(this,event)">

        <input type="hidden" name="product_id" class="hidden_product_id" value="<?= $item["ID"] ?>" />
        <input type="hidden" name="offer_id" class="hidden_offer_id" value="<?= reset($item["OFFERS"])["ID"] ?>" />
        
        <input type="hidden" name="price" class="hidden_price" value="<?=$price['RATIO_PRICE']?>" />
        
    </form>
    <div class="itemBottom">
        <div class="itemPrice">
            <div class="title">Стоимость:</div>
            <div class="value" id="<?= $itemIds['PRICE_POPUP'] ?>">
                <?
                if (!empty($price)) {
                    if ($arParams['PRODUCT_DISPLAY_MODE'] === 'N' && $haveOffers) {
                        echo Loc::getMessage(
                                'CT_BCI_TPL_MESS_PRICE_SIMPLE_MODE',
                                array(
                                    '#PRICE#' => $price['PRINT_RATIO_PRICE'],
                                    '#VALUE#' => $measureRatio,
                                    '#UNIT#' => $minOffer['ITEM_MEASURE']['TITLE']
                                )
                        );
                    } else {
                        echo $price['PRINT_RATIO_PRICE'];
                    }
                }
                ?>
            </div>
        </div>
        
        <a id="<?= $itemIds['BUY_LINK'] ?>" href="#!" rel="nofollow" class="itemAddToCartButton" onclick="$('#addForm_<?= $item["ID"] ?>').submit();<?if($price['PRICE']==0){?>document.location.reload();<?} ?>">
            <span>В корзину</span>
        </a>
    </div>
</div>
