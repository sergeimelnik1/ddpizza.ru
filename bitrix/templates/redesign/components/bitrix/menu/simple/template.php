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
        ?><li class="<?
        if ($arItem["SELECTED"]) {
            echo ' selected active';
        }
        ?>">
            <a href="<?= $arItem["LINK"]; ?>" class="<?
            if ($arItem["SELECTED"]) {
                echo ' selected';
            }
            ?>"><?= html_entity_decode($arItem["TEXT"]); ?></a>
        </li>
    <? endforeach; ?>

</ul>
