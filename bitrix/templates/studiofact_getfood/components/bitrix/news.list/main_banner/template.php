<? if (!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED !== true) die(); ?>
<? $this->setFrameMode(true); ?>
<? if (count($arResult["ITEMS"]) < 1) { return; }
CModule::IncludeModule("currency"); CModule::IncludeModule("sale"); ?>
<div class="owl-carousel main_banner_big hidden">
	<? foreach ($arResult["ITEMS"] as $arItem) {
		$pic = CFile::ResizeImageGet($arItem["PREVIEW_PICTURE"]["ID"],array("width"=>1920,"height"=>365),BX_RESIZE_IMAGE_EXACT,false,false,false,70);
		?><div class="items" style="width: 100%">
				<div class="img" style="background-image: url('<?=$pic["src"];?>')"></div>
				<div class="container">
				<?
				if($arItem["PROPERTIES"]["SHOW_NAME"]["VALUE"]==1){
				?>
					<div class="name"><?=$arItem["~NAME"];?></div>
				<? }?>
					<? if (strlen($arItem["DISPLAY_PROPERTIES"]["PRICE"]["VALUE"]) > 0) {
						?><div class="price_banner"<? if (strlen($arItem["DISPLAY_PROPERTIES"]["LINK"]["VALUE"]) > 0) { echo ' style="right: 150px;"'; } ?>><?=str_replace(GetMessage("STUDIOFACT_RUB"), '<span class="rub">'.GetMessage("STUDIOFACT_R").'</span>', SaleFormatCurrency($arItem["DISPLAY_PROPERTIES"]["PRICE"]["VALUE"], CCurrency::GetBaseCurrency()));?></div><?
					} ?>
					<?
				if($arItem["PROPERTIES"]["SHOW_BUTTON"]["VALUE"]==1){
				?>
					<? if (strlen($arItem["DISPLAY_PROPERTIES"]["LINK"]["VALUE"]) > 0) {
						?><a href="<?=$arItem["DISPLAY_PROPERTIES"]["LINK"]["VALUE"];?>" class="more"><?=$arItem["DISPLAY_PROPERTIES"]["LINK"]["NAME"];?></a><?
					} ?>
				<? } ?>
				</div>
		</div><?
	} ?>
</div>
<script type="text/javascript">
	$(document).ready(function() {
		$(".owl-carousel.main_banner_big").owlCarousel({
			items: 1,
			autoHeight: true,
			dots: false,
			mouseDrag: true,
			nav: true,
            autoplay: true,
            autoplayTimeout: 5000,
            autoplayHoverPause: true,
			navSpeed: 500,
            autoplaySpeed: 1500,
            loop: true,
		});
	});
</script>