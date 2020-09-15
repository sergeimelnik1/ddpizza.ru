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
    <div class="bx_catalog_item_price" data-entity="price-block">

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

    <div class="productOffers" data-entity="buttons-block">

        <div class="list-info-buttons" id="<?= $itemIds['BASKET_ACTIONS'] ?>">
            <a id="<?= $itemIds['BUY_LINK'] ?>" href="#!" rel="nofollow" class="buyLink" >
                <span>Добавить к заказу</span>
            </a>
        </div>
    </div>
</div>



