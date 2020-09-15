<? if (!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED !== true) die();
if (empty($arResult["CATEGORIES"]))
	return;
$j = 0;
include (dirname(__FILE__)."/lang/".LANGUAGE_ID."/ajax.php"); ?>
<div class="bx_searche">
<?foreach($arResult["CATEGORIES"] as $category_id => $arCategory):?>
	<?foreach($arCategory["ITEMS"] as $i => $arItem):?>
		<?$j++?>
		<?//echo $arCategory["TITLE"]?>
		<?if($category_id === "all"):?>
			<div class="bx_item_block" style="min-height:0">
				<div class="bx_img_element"></div>
				<div class="bx_item_element"><hr></div>
			</div>
			<div class="bx_item_block all_result">
				<div class="bx_img_element"></div>
				<div class="bx_item_element">
					<span class="all_result_title"><a href="<?echo $arItem["URL"]?>"><?echo $arItem["NAME"]?></a></span>
				</div>
				<div style="clear:both;"></div>
			</div>
		<?elseif(isset($arResult["ELEMENTS"][$arItem["ITEM_ID"]])):
			$arElement = $arResult["ELEMENTS"][$arItem["ITEM_ID"]];?>
			<div class="bx_item_block">
				<?if (!empty($arElement["PICTURE"])) { ?>
					<div class="bx_img_element">
						<div class="bx_image" style="background-image: url('<?echo $arElement["PICTURE"]?>')"></div>
					</div>
				<? } else { ?>
					<div class="bx_img_element">
						<div class="bx_image bx_image--empty"></div>
					</div>
				<? } ?>
				<div class="bx_item_element">
					<a href="<?echo $arItem["URL"]?>"><?echo $arItem["NAME"]?></a>
					<?
					foreach($arElement["PRICES"] as $code=>$arPrice)
					{
						if ($arPrice["MIN_PRICE"] != "Y")
							continue;

						if($arPrice["CAN_ACCESS"])
						{
							if($arPrice["DISCOUNT_VALUE"] < $arPrice["VALUE"]):?>
								<div class="bx_price">
									<span class="price"><?=str_replace($MESS["STUDIOFACT_RUB"], '<span class="rub">'.$MESS["STUDIOFACT_R"].'</span>', $arPrice["PRINT_DISCOUNT_VALUE"]);?></span>
									<span class="old_price"><?=str_replace($MESS["STUDIOFACT_RUB"], '<span class="rub">'.$MESS["STUDIOFACT_R"].'</span>', $arPrice["PRINT_VALUE"]);?></span>
								</div>
							<?else:?>
								<span class="price"><?=str_replace($MESS["STUDIOFACT_RUB"], '<span class="rub">'.$MESS["STUDIOFACT_R"].'</span>', $arPrice["PRINT_VALUE"]);?></span>
							<?endif;
						}
						if ($arPrice["MIN_PRICE"] == "Y")
							break;
					}
					?>
				</div>
				<div style="clear:both;"></div>
			</div>
		<?else:?>
			<div class="bx_item_block others_result">
				<div class="bx_img_element">
					<?if($j != 6){?><div class="bx_image" style="background-image: url('<?echo $arElement["PICTURE"]["src"]?>')"></div><?}?>
				</div>
				<div class="bx_item_element">
					<a href="<?echo $arItem["URL"]?>"><?echo $arItem["NAME"]?></a>
				</div>
				<div style="clear:both;"></div>
			</div>
		<?endif;?>
	<?endforeach;?>
<?endforeach;?>
</div>