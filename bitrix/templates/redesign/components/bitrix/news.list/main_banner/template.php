<? if (!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED !== true) die(); ?>
<? $this->setFrameMode(true); ?>
<?
if (count($arResult["ITEMS"]) < 1) {
    return;
}
?>
<div class="owl-carousel mainpageSlider">
    <?
    foreach ($arResult["ITEMS"] as $arItem) {
        $pic = CFile::ResizeImageGet($arItem["PREVIEW_PICTURE"]["ID"], array("width" => 1920, "height" => 984), BX_RESIZE_IMAGE_EXACT, false, false, false, 70);
		$pic2= $arItem["DETAIL_PICTURE"]["SRC"];
        ?><div class="mainpageSliderItem">
            <img src="<?= $pic["src"]; ?>" class=" hidden-xs"/>
			<img src="<?= $pic2; ?>" class="hidden-lg hidden-md hidden-sm visible-xs" style="    width: 100% !important" />
            <div class="sliderInfo">
                <div class="container">

                    <div class="name"><?= $arItem["~NAME"]; ?></div>
                    <? if ($arItem["~PREVIEW_TEXT"] != "") { ?>
                        <div class="desc"><?= $arItem["~PREVIEW_TEXT"]; ?></div>
                    <? } ?>
                </div>
            </div>
        </div><? }
                ?>
</div>
