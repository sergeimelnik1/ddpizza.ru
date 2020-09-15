<?
if (!defined('B_PROLOG_INCLUDED') || B_PROLOG_INCLUDED !== true)
    die();
/**
 * @global array $arParams
 * @global CUser $USER
 * @global CMain $APPLICATION
 * @global string $cartId
 */
$compositeStub = (isset($arResult['COMPOSITE_STUB']) && $arResult['COMPOSITE_STUB'] == 'Y');
$summ = 0;
foreach ($arResult['CATEGORIES']['READY'] as $one_item) {
    $summ += $one_item['PRICE'] * $one_item['QUANTITY'];
};
$summ = $arResult["TOTAL_PRICE"];
?>
<a id="small_basket" class="fr" href="<?= $arParams["PATH_TO_BASKET"]; ?>">


    <?
    if ($arResult["NUM_PRODUCTS"] > 0) {
        $word = "товаров";
        $strNum = strval($arResult["NUM_PRODUCTS"]);
        
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
                <span><?= $arResult["NUM_PRODUCTS"]; ?></span> <?= $word ?>
            </span> в корзине<br /> на сумму
            <? if ($summ >= 0) { ?>
                <span class="summ inline">
                    <?= str_replace(GetMessage("STUDIOFACT_RUB"), "<span class=\"rub black\">" . GetMessage("STUDIOFACT_R") . "</span>", $summ); ?>
                </span>
            <? } else { ?>
                <span class="summ inline"></span>
            <? } ?>
        </span>
    <? } else { ?>
        <span class="cart_empty">Корзина пуста</span>
    <? } ?>
</a>

