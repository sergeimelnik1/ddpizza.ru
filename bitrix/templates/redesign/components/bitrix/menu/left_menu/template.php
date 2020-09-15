<? if (!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED !== true) die(); ?>
<? $this->setFrameMode(true); ?>
<?
if (count($arResult) < 1) {
    return;
}
?>
<ul>
    <?
    foreach ($arResult as $arItem):
        if ($arItem["PARAMS"]["PIC"] != "") {
            ?><li class="<?
            if ($arItem["SELECTED"]) {
                echo ' selected active';
            }
            ?>">
                <a href="<?= $arItem["LINK"]; ?>#items" class="<?
                if ($arItem["SELECTED"]) {
                    echo ' selected';
                }
                ?>"><span class="icons">
                        <img src="<?= $arItem["PARAMS"]["PIC"] ?>" />
                        <span class="hover" style="opacity:0">
                            <img  src="<?= $arItem["PARAMS"]["PIC_ACTIVE"] ?>" />
                        </span>
                    </span>
                    <span class="title"><?= html_entity_decode($arItem["TEXT"]); ?></span></a>
            </li>
            <?
        }
    endforeach;
    ?>

</ul>
<div id="items"></div>
