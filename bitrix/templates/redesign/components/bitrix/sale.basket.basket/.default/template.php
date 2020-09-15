<?
if (!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED !== true)
    die();
//$frame = $this->createFrame()->begin("");

$arUrls = Array(
    "delete" => $APPLICATION->GetCurPage() . "?" . $arParams["ACTION_VARIABLE"] . "=delete&id=#ID#",
    "delay" => $APPLICATION->GetCurPage() . "?" . $arParams["ACTION_VARIABLE"] . "=delay&id=#ID#",
    "add" => $APPLICATION->GetCurPage() . "?" . $arParams["ACTION_VARIABLE"] . "=add&id=#ID#",
);
$arBasketJSParams = array(
    'SALE_DELETE' => GetMessage("SALE_DELETE"),
    'SALE_DELAY' => GetMessage("SALE_DELAY"),
    'SALE_TYPE' => GetMessage("SALE_TYPE"),
    'TEMPLATE_FOLDER' => $templateFolder,
    'DELETE_URL' => $arUrls["delete"],
    'DELAY_URL' => $arUrls["delay"],
    'ADD_URL' => $arUrls["add"]
);
?>
<script type="text/javascript">
    var basketJSParams = <?= CUtil::PhpToJSObject($arBasketJSParams); ?>

    BX.message({
        'SALE_EMPTY_BASKET': '<p><font class="errortext"><?= GetMessage('SALE_EMPTY_BASKET') ?></font></p>'
    });
</script>
<?
if ($_REQUEST["UPDATE_BIG_BASKET_AJAX"] == "Y") {
    $APPLICATION->RestartBuffer();
} else {
    $APPLICATION->AddHeadScript($templateFolder . "/script.js");
    echo '<div id="update_big_basket_ajax">';
}
?>
<div class="container">
    <div class="row">
        <div class="col-xs-12">
            <div class="box margin padding">
                <script type="text/javascript">
                    function showBasketItemsList(id) {
                        if (typeof (id) == "undefined") {
                            var id = "basket_items_list";
                        }

                        BX.removeClass(BX("basket_toolbar_button"), "current");
                        BX.removeClass(BX("basket_toolbar_button_delayed"), "current");
                        BX.removeClass(BX("basket_toolbar_button_subscribed"), "current");
                        BX.removeClass(BX("basket_toolbar_button_not_available"), "current");

                        BX("normal_count").style.display = 'inline-block';
                        BX("delay_count").style.display = 'inline-block';
                        BX("subscribe_count").style.display = 'inline-block';
                        BX("not_available_count").style.display = 'inline-block';

                        BX.removeClass(BX("basket_items_list"), "current");
                        BX.removeClass(BX("basket_items_delayed"), "current");
                        BX.removeClass(BX("basket_items_subscribed"), "current");
                        BX.removeClass(BX("basket_toolbar_button_subscribed"), "current");

                        if (id == "basket_items_list") {
                            BX.addClass(BX("basket_toolbar_button"), "current");
                            BX("normal_count").style.display = 'none';
                            BX.addClass(BX("basket_items_list"), "current");
                        } else if (id == "basket_items_delayed") {
                            BX.addClass(BX("basket_toolbar_button_delayed"), "current");
                            BX("delay_count").style.display = 'none';
                            BX.addClass(BX("basket_items_delayed"), "current");
                        } else if (id == "basket_items_subscribed") {
                            BX.addClass(BX("basket_toolbar_button_subscribed"), "current");
                            BX("subscribe_count").style.display = 'none';
                            BX.addClass(BX("basket_items_subscribed"), "current");
                        } else if (id == "basket_items_not_available") {
                            BX.addClass(BX("basket_toolbar_button_not_available"), "current");
                            BX("not_available_count").style.display = 'none';
                            BX.addClass(BX("basket_items_not_available"), "current");
                        }
                    }
                </script>
                <? if (strlen($arResult["ERROR_MESSAGE"]) <= 0) { ?>
                    <div id="warning_message"><?
                        if (is_array($arResult["WARNING_MESSAGE"]) && !empty($arResult["WARNING_MESSAGE"])) {
                            foreach ($arResult["WARNING_MESSAGE"] as $v)
                                echo ShowError($v);
                        }
                        ?>
                    </div>
                    <?
                    $normalCount = count($arResult["ITEMS"]["AnDelCanBuy"]);
                    $normalHidden = ($normalCount == 0) ? "style=\"display:none\"" : "";

                    $delayCount = count($arResult["ITEMS"]["DelDelCanBuy"]);
                    $delayHidden = ($delayCount == 0) ? "style=\"display:none\"" : "";

                    $subscribeCount = count($arResult["ITEMS"]["ProdSubscribe"]);
                    $subscribeHidden = ($subscribeCount == 0) ? "style=\"display:none\"" : "";

                    $naCount = count($arResult["ITEMS"]["nAnCanBuy"]);
                    $naHidden = ($naCount == 0) ? "style=\"display:none\"" : "";
                    ?>
                    <form method="post" action="<?= POST_FORM_ACTION_URI ?>" name="basket_form" id="basket_form">
                        <div id="basket_form_container">
                            <div class="bx_ordercart">

                                <?
                                include($_SERVER["DOCUMENT_ROOT"] . $templateFolder . "/basket_items.php");
                                ?>
                            </div>
                        </div>
                        <input type="hidden" name="BasketOrder" value="BasketOrder" />
                        <!-- <input type="hidden" name="ajax_post" id="ajax_post" value="Y"> -->
                    </form>
                    <?
                } else {
                    ShowError($arResult["ERROR_MESSAGE"]);
                }
                ?>

            </div>
        </div>
    </div>
</div>
<?
if ($_REQUEST["UPDATE_BIG_BASKET_AJAX"] == "Y") {
    die();
} else {
    echo '</div>';
}

