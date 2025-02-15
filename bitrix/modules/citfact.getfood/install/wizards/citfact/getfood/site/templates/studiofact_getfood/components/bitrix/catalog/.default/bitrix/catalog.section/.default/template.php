<? if (!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED !== true) die();
$this->setFrameMode(true);
if (count($arResult["ITEMS"]) > 0) {
	if ($arParams["DISPLAY_TOP_PAGER"]) {
		echo $arResult["NAV_STRING"];
	} ?>
	<div class=""><div class="catalog_section">
		<div class="section clearfix"><?
			$strElementEdit = CIBlock::GetArrayByID($arParams["IBLOCK_ID"], "ELEMENT_EDIT");
			$strElementDelete = CIBlock::GetArrayByID($arParams["IBLOCK_ID"], "ELEMENT_DELETE");
			$arElementDeleteParams = array("CONFIRM" => GetMessage("CT_BCS_TPL_ELEMENT_DELETE_CONFIRM"));
			foreach ($arResult["ITEMS"] as $arItem) {//var_dump($arItem);
				$this->AddEditAction($arItem["ID"], $arItem["EDIT_LINK"], $strElementEdit);
				$this->AddDeleteAction($arItem["ID"], $arItem["DELETE_LINK"], $strElementDelete, $arElementDeleteParams);
				$strMainID = $this->GetEditAreaId($arItem["ID"]);
				$can_buy = 0;
				if ($arItem["CAN_BUY"] == "1" && count($arItem["OFFERS"]) < 1) { $can_buy = 1; }
				if (count($arItem["OFFERS"]) > 0) {
					foreach ($arItem["OFFERS"] as $arOffer) {
						if ($arOffer["CAN_BUY"] == "1") { $can_buy = 1; }
					}
				}
				?><div class="item_element good_box" id="<?=$strMainID;?>" data-id="<?=$arItem["ID"];?>">
				<?/* �������� ����������
				<div style="position:absolute; top:0; left: 0; z-index: 40; background: white;">
					������������: <?=$arItem["SHOW_COUNTER"];?><br/>
					���� ����������: <?=$arItem["DATE_CREATE"];?><br/>
					����: <?=$arItem["PROPERTIES"]["MINIMUM_PRICE"]["VALUE"];?><br/>
				</div>
				*/?>
					<div style="display: none;" itemscope itemtype="http://schema.org/Product">
						<meta itemprop="name" content="<?=$arItem["NAME"];?>" />
						<meta itemprop="description" content="<?=$arItem["PREVIEW_TEXT"];?>" />
						<meta itemprop="url" content="<?=$arItem["DETAIL_PAGE_URL"];?>" />
						<img itemprop="image" src="<?=$arItem["PREVIEW_PICTURE"]["SRC"];?>" />
					</div>
					<div class="hover_box box<? if ($can_buy != "1") { echo ' disabled'; } ?>">
						<div class="img_box">
							<a
								href="<?=$arItem["DETAIL_PAGE_URL"];?>"
								title="<?=$arItem["NAME"];?>"
								class="image"
								<? if (strlen($arItem["PREVIEW_PICTURE"]["SRC"]) > 0) { ?>
									style="background-image: url('<?=$arItem["PREVIEW_PICTURE"]["SRC"];?>');"
								<? } ?>
							></a>
							<? if (count($arItem["OFFERS"]) > 0) {
								foreach ($arItem["OFFERS"] as $arOffer) {
									if (strlen($arOffer["PREVIEW_PICTURE"]["SRC"]) > 0) { ?>
										<a
											href="<?=$arItem["DETAIL_PAGE_URL"];?>"
											title="<?=$arItem["NAME"];?>"
											class="image main_preview_image_<?=$arOffer["ID"];?> offers_hide"
											<? if (strlen($arOffer["PREVIEW_PICTURE"]["SRC"]) > 0) { ?>
												style="background-image: url('<?=$arOffer["PREVIEW_PICTURE"]["SRC"];?>'); display: none;"
											<? } ?>
										></a>
									<? }
								}
							} ?>
							<div class="hover_over">
								<a href="javascript:;" data-width="810" data-fancybox="group" data-src="<?=$arItem["DETAIL_PAGE_URL"];?>?open_popup=Y" class="open_fancybox" rel="gallery">
									<?=GetMessage("STUDIOFACT_FAST_VIEW");?>
								</a>
								<a href="<?=$arItem["DETAIL_PAGE_URL"];?>" title="<?=$arItem["NAME"];?>" class="image main_preview_image offers_hide"></a>

							</div>
						</div>
						<a href="<?=$arItem["DETAIL_PAGE_URL"];?>" title="<?=$arItem["NAME"];?>" class="name"><?=$arItem["NAME"];?></a>
						<div class="icon_box"><?
							if (strlen($arItem["DISPLAY_PROPERTIES"]["NEWPRODUCT"]["VALUE"]) > 0) { echo '<div class="'.mb_strtolower($arItem["DISPLAY_PROPERTIES"]["NEWPRODUCT"]["CODE"]).'" title="'.$arItem["DISPLAY_PROPERTIES"]["NEWPRODUCT"]["NAME"].'"></div>'; }
							if (strlen($arItem["DISPLAY_PROPERTIES"]["SALELEADER"]["VALUE"]) > 0) { echo '<div class="'.mb_strtolower($arItem["DISPLAY_PROPERTIES"]["SALELEADER"]["CODE"]).'" title="'.$arItem["DISPLAY_PROPERTIES"]["SALELEADER"]["NAME"].'"></div>'; }
							if (strlen($arItem["DISPLAY_PROPERTIES"]["SPECIALOFFER"]["VALUE"]) > 0) { echo '<div class="'.mb_strtolower($arItem["DISPLAY_PROPERTIES"]["SPECIALOFFER"]["CODE"]).'" title="'.$arItem["DISPLAY_PROPERTIES"]["SPECIALOFFER"]["NAME"].'"></div>'; }
							if (strlen($arItem["DISPLAY_PROPERTIES"]["PRECOMMEND"]["VALUE"]) > 0) { echo '<div class="'.mb_strtolower($arItem["DISPLAY_PROPERTIES"]["PRECOMMEND"]["CODE"]).'" title="'.$arItem["DISPLAY_PROPERTIES"]["PRECOMMEND"]["NAME"].'"></div>'; }
							?></div>

						<!--price-->
						<div class="price_box main_preview_price offers_hide">
							<div class="fl">
								<? if ($arItem["MIN_PRICE"]["DISCOUNT_DIFF"] > 0) { ?><div class="old_price"><?=str_replace(GetMessage("STUDIOFACT_RUB"), '<span class="rub">'.GetMessage("STUDIOFACT_R").'</span>', $arItem["MIN_PRICE"]["PRINT_VALUE"]);?></div><? } ?>
								<div class="price_box__actual-price t2">
                                    <?=$arItem["MIN_PRICE"]["VALUE"]?>
                                    <span class="rub"><?=GetMessage("STUDIOFACT_R");?></span>
								</div>
							</div>
							<div class="price_box__controls">
							<? if ($arParams["USE_PRODUCT_QUANTITY"] == 1 && $can_buy == 1) {?>
								<div class="item_quantity inline">
									<a data-inc-value="<?=$arResult["CATALOG_MEASURE_RATIO"] ?: 1;?>" href="javascript: void(0);" class="minus">-</a>
									<input type="text" name="<?=$arParams["PRODUCT_QUANTITY_VARIABLE"];?>" value="<?=$arItem["CATALOG_MEASURE_RATIO"]?>" />
									<a data-inc-value="<?=$arResult["CATALOG_MEASURE_RATIO"] ?: 1;?>" href="javascript: void(0);" class="plus">+</a>
								</div><?
							} ?>
							<? if ($can_buy == "1") { ?>
								<div class="buy_box fr">
									<a
										href="<?=$arItem["ADD_URL"];?>"
										class="buy buy_button_a <? if (count($arItem["OFFERS"]) > 0) { echo 'show_offers_basket_popup'; } else { echo 'show_basket_popup'; } ?> inline"
										data-name="<?=$arItem["NAME"];?>"
										data-img="<?=$arItem["PREVIEW_PICTURE"]["SRC"];?>"
										data-id="<?=$arItem["ID"];?>"
										data-ratio="<?=$arItem["CATALOG_MEASURE_RATIO"];?>"
										data-basket="<?=$arParams["BASKET_URL"];?>"
										data-price="<?=str_replace(GetMessage("STUDIOFACT_RUB"), '', $arItem["CATALOG_PRICE_1"]);?>"
										data-gotobasket="<?=GetMessage("SF_GO_TO_BASKET_BUTTON");?>"
										data-gotoback="<?=GetMessage("SF_GO_TO_BACK_BUTTON");?>"
									>
										<span class="buy_popup">
											<span></span>
											<?=('' != $arParams['MESS_BTN_BUY'] ? $arParams['MESS_BTN_BUY'] : GetMessage('CT_BCE_CATALOG_BUY'));?>
										</span>
									</a>
								</div>
							<? } else {
								?><div class="buy_box fr price_box__not-avilable"><?if (strlen($arParams["MESS_NOT_AVAILABLE"]) > 0) { echo $arParams["MESS_NOT_AVAILABLE"]; } else { echo GetMessage("CT_BCE_CATALOG_NOT_AVAILABLE"); } ?></div><?
							} ?>
							</div>
							<div class="clear"></div>
						</div>
						<div class="scrollbar_offers_items">
							<? if (count($arItem["OFFERS"]) > 0) {
								?><div class="offers_item" id="skuId<?=$arItem["ID"];?>">
									<?
									foreach ($arResult["SKU_PROPS"] as $arSku) {
										if (count($arSku["VALUES"]) > 0 && count($arItem["SKU_THERE_ARE"][$arSku["ID"]]) > 0) {
											echo '<div class="offer_item" data-prop-id="'.$arSku["ID"].'"><div class="offer_name">'.$arSku["NAME"].':</div>';
												foreach ($arSku["VALUES"] as $value) {
													if ($value["ID"] > 0 && in_array($value["ID"], $arItem["SKU_THERE_ARE"][$arSku["ID"]])) { ?>
														<span
															class="offer_sku <?if (!empty($arSku["USER_TYPE_SETTINGS"])) echo 'color'?>"
															data-prop-id="<?=$arSku["ID"];?>"
															data-prop-code="<?=$arSku["CODE"];?>"
															data-prop-value-id="<?=$value["ID"];?>"
															data-tree='<?=json_encode($arItem["SKU_TREE"]);?>'
														>
															<?=(strlen($value["PICT"]["SRC"]) > 0 ? '<img src="'.$value["PICT"]["SRC"].'" title="'.$value["NAME"].'" alt="'.$value["NAME"].'" />' : $value["NAME"]);?>
														</span>
													<? }
												}
											echo '</div>';
										}
									}
									echo '<div class="offers_item_id" style="display: none;">';
										foreach ($arItem["SKU_MASSIVE"] as $id => $value) {
											?><div class="<?=$id;?>" data-id="<?=$value;?>"></div><?
										}
									echo '</div>';
									?>
								</div><?
							} ?>
							<div class="price_box main_preview_price_<?=$arItem["ID"]?> offers_hide">
								<div class="pr">
									<span class="price"><? if (count($arItem["OFFERS"]) > 0) { echo GetMessage("SF_ISSET_OFFERS"); } ?><?=str_replace(GetMessage("STUDIOFACT_RUB"), '<span class="rub">'.GetMessage("STUDIOFACT_R").'</span>', $arItem["RATIO_PRICE"]["PRINT_DISCOUNT_VALUE"]);?></span>
									<? if ($arItem["RATIO_PRICE"]["DISCOUNT_DIFF"] > 0) { ?><span class="old_price"><?=str_replace(GetMessage("STUDIOFACT_RUB"), '<span class="rub">'.GetMessage("STUDIOFACT_R").'</span>', $arItem["RATIO_PRICE"]["PRINT_VALUE"]);?></span><? } ?>
								</div>
								<? if ($arItem["CAN_BUY"]) { ?>
									<div class="nav_buttons">
										<a
											href="<?=$arItem["ADD_URL"];?>"
											target="_parent"
											class="button show_basket_popup inline buy_button_a"
											data-name="<?=$arItem["NAME"];?>"
											data-img="<?=$arItem["PREVIEW_PICTURE"]["SRC"];?>"
											data-id="<?=$arItem["ID"];?>"
											data-ratio="<?=$arItem["CATALOG_MEASURE_RATIO"];?>"
											data-basket="<?=$arParams["BASKET_URL"];?>"
											data-price="<?=str_replace(GetMessage("STUDIOFACT_RUB"), '', $arItem["CATALOG_PRICE_1"]);?>"
											data-gotobasket="<?=GetMessage("SF_GO_TO_BASKET_BUTTON");?>"
											data-gotoback="<?=GetMessage("SF_GO_TO_BACK_BUTTON");?>"
										>
											<?=('' != $arParams['MESS_BTN_BUY'] ? $arParams['MESS_BTN_BUY'] : GetMessage('CT_BCE_CATALOG_BUY'));?></a>
										<a href="javascript: void(0);" class="button_white"><?=GetMessage("SF_GO_TO_BACK_BUTTON");?>
										</a>
									</div>
								<? } else {
									?><div class="nav_buttons"><?if (strlen($arParams["MESS_NOT_AVAILABLE"]) > 0) { echo $arParams["MESS_NOT_AVAILABLE"]; } else { echo GetMessage("CT_BCE_CATALOG_NOT_AVAILABLE"); } ?><a href="javascript: void(0);" class="button_white"><?=GetMessage("SF_GO_TO_BACK_BUTTON");?></a></div><?
								} ?>
							</div>
							<? if (count($arItem["OFFERS"]) > 0) {
								foreach ($arItem["OFFERS"] as $arOffer) { ?>
									<div class="price_box main_preview_price_<?=$arOffer["ID"];?> offers_hide" style="display: none;">
									<div class="pr">
										<span class="price"><?=str_replace(GetMessage("STUDIOFACT_RUB"), '<span class="rub">'.GetMessage("STUDIOFACT_R").'</span>', $arOffer["RATIO_PRICE"]["PRINT_DISCOUNT_VALUE"]);?></span>
										<? if ($arOffer["RATIO_PRICE"]["DISCOUNT_DIFF"] > 0) { ?><span class="old_price"><?=str_replace(GetMessage("STUDIOFACT_RUB"), '<span class="rub">'.GetMessage("STUDIOFACT_R").'</span>', $arOffer["RATIO_PRICE"]["PRINT_VALUE"]);?></span><? } ?>
									</div>
									<? if ($arOffer["CAN_BUY"]) { ?>
										<div class="nav_buttons">
											<a
												href="<?=$arOffer["ADD_URL"];?>"
												target="_parent"
												class="button show_basket_popup inline buy_button_a"
												data-name="<?=$arOffer["NAME"];?>"
												data-img="<?=(strlen($arOffer["PREVIEW_PICTURE"]["SRC"]) > 0 ? $arOffer["PREVIEW_PICTURE"]["SRC"] : $arItem["PREVIEW_PICTURE"]["SRC"]);?>"
												data-id="<?=$arOffer["ID"];?>"
												data-ratio="<?=$arOffer["CATALOG_MEASURE_RATIO"];?>"
												data-basket="<?=$arParams["BASKET_URL"];?>"
												data-price="<?=str_replace(GetMessage("STUDIOFACT_RUB"), '', $arOffer["CATALOG_PRICE_1"]);?>"
												data-gotobasket="<?=GetMessage("SF_GO_TO_BASKET_BUTTON");?>"
												data-gotoback="<?=GetMessage("SF_GO_TO_BACK_BUTTON");?>"
											>
												<?=('' != $arParams['MESS_BTN_BUY'] ? $arParams['MESS_BTN_BUY'] : GetMessage('CT_BCE_CATALOG_BUY'));?>
											</a>
											<a href="javascript: void(0);" class="button_white"><?=GetMessage("SF_GO_TO_BACK_BUTTON");?></a>
										</div>
									<? } else {
										?><div class="nav_buttons"><?if (strlen($arParams["MESS_NOT_AVAILABLE"]) > 0) { echo $arParams["MESS_NOT_AVAILABLE"]; } else { echo GetMessage("CT_BCE_CATALOG_NOT_AVAILABLE"); } ?><a href="javascript: void(0);" class="button_white"><?=GetMessage("SF_GO_TO_BACK_BUTTON");?></a></div><?
									} ?>
									</div>
								<? }
							} ?>
						</div>
						<? if (count($arItem["OFFERS"]) > 0) {
							foreach ($arItem["OFFERS"] as $arOffer) { ?>
								<div class="good_box price_box main_preview_price_<?=$arOffer["ID"];?> offers_hide" style="display: none;">
									<div class="fl">
										<? if ($arOffer["RATIO_PRICE"]["DISCOUNT_DIFF"] > 0) { ?><div class="old_price"><?=str_replace(GetMessage("STUDIOFACT_RUB"), '<span class="rub">'.GetMessage("STUDIOFACT_R").'</span>', $arOffer["RATIO_PRICE"]["PRINT_VALUE"]);?></div><? } ?>
										<div class="price_box__actual-price t1">
											<?=str_replace(GetMessage("STUDIOFACT_RUB"), '<span class="rub">'.GetMessage("STUDIOFACT_R").'</span>', $arOffer["RATIO_PRICE"]["PRINT_DISCOUNT_VALUE"]*$arItem["CATALOG_MEASURE_RATIO"]);?>
										</div>
									</div>

									<div class="price_box__controls">
										<? if ($arParams["USE_PRODUCT_QUANTITY"] == 1 && $can_buy == 1) {
											?><div class="item_quantity inline">
											<a href="javascript: void(0);" class="minus">-</a><input type="text" name="<?=$arParams["PRODUCT_QUANTITY_VARIABLE"];?>" value="<?=$arItem["CATALOG_MEASURE_RATIO"]?>" /><a href="javascript: void(0);" class="plus">+</a>
											</div><?
										} ?>
										<? if ($arOffer["CAN_BUY"]) { ?>
											<div class="buy_box fr">
												<a
													href="<?=$arOffer["ADD_URL"];?>"
													class="buy show_basket_popup inline buy_button_a"
													data-name="<?=$arOffer["NAME"];?>"
													data-img="<?=(strlen($arOffer["PREVIEW_PICTURE"]["SRC"]) > 0 ? $arOffer["PREVIEW_PICTURE"]["SRC"] : $arItem["PREVIEW_PICTURE"]["SRC"]);?>"
													data-id="<?=$arOffer["ID"];?>"
													data-ratio="<?=$arOffer["CATALOG_MEASURE_RATIO"];?>"
													data-basket="<?=$arParams["BASKET_URL"];?>"
													data-price="<?=str_replace(GetMessage("STUDIOFACT_RUB"), '', $arOffer["CATALOG_PRICE_1"]);?>"
													data-gotobasket="<?=GetMessage("SF_GO_TO_BASKET_BUTTON");?>"
													data-gotoback="<?=GetMessage("SF_GO_TO_BACK_BUTTON");?>"
												>
													<span class="buy_popup">
														<span></span>
														<?=('' != $arParams['MESS_BTN_BUY'] ? $arParams['MESS_BTN_BUY'] : GetMessage('CT_BCE_CATALOG_BUY'));?>
													</span>
												</a>
											</div>
										<? } else {
											?><div class="buy_box fr price_box__not-avilable"><?if (strlen($arParams["MESS_NOT_AVAILABLE"]) > 0) { echo $arParams["MESS_NOT_AVAILABLE"]; } else { echo GetMessage("CT_BCE_CATALOG_NOT_AVAILABLE"); } ?></div><?
										} ?>
									</div>

									<div class="clear"></div>
								</div>
							<? }
						} ?>
						<!--price-->

						<? $unset_props = Array("NEWPRODUCT", "SALELEADER", "SPECIALOFFER", "PRECOMMEND", $arParams["ADD_PICT_PROP"], $arParams["OFFER_ADD_PICT_PROP"], "RECOMMEND", "MINIMUM_PRICE", "MAXIMUM_PRICE");
						if (count($unset_props) > 0) {
							foreach ($arItem["DISPLAY_PROPERTIES"] as $key => $value) {
								if (in_array($key, $unset_props)) { unset($arItem["DISPLAY_PROPERTIES"][$key]); }
							}
							if (count($arItem["OFFERS"]) > 0) {
								foreach ($arItem["OFFERS"] as $key0 => $arOffer) {
									foreach ($arOffer["DISPLAY_PROPERTIES"] as $key => $value) {
										if (in_array($key, $unset_props)) { unset($arItem["OFFERS"][$key0]["DISPLAY_PROPERTIES"][$key]); }
									}
								}
							}
						} ?>

						<div class="list-info-buttons">
							<?php if (count($arItem["DISPLAY_PROPERTIES"]) > 0) {?><button class="list-props-button"><?= GetMessage("SF_CHARACTS")?></button><?php } ?>
							<?php if (count($arItem["OFFERS"]) > 0) { ?><button class="list-offer-button"><?= GetMessage("SF_SKU_SELECT")?></button><?php } ?>
						</div>

						<? if (count($arItem["OFFERS"]) > 0 || count($arItem["DISPLAY_PROPERTIES"]) > 0 || $arParams["USE_PRODUCT_QUANTITY"] == 1) { ?><div class="hidden_hover_element"><? } ?>
							<? if (count($arItem["OFFERS"]) > 0) {
								?><div class="offers_item" id="skuId<?=$arItem["ID"];?>" itemprop="sku">
									<?
									foreach ($arResult["SKU_PROPS"] as $arSku) {
										$i = 0;
										if (count($arSku["VALUES"]) > 0 && count($arItem["SKU_THERE_ARE"][$arSku["ID"]]) > 0) {
											echo '<div class="offer_item" data-prop-id="'.$arSku["ID"].'"><div class="offer_name">'.$arSku["NAME"].'</div>';
												foreach ($arSku["VALUES"] as $value) {
													if ($value["ID"] > 0 && in_array($value["ID"], $arItem["SKU_THERE_ARE"][$arSku["ID"]])) {
														?><span class="offer_sku<?=(!$i)?' active':''?> <?if (!empty($arSku["USER_TYPE_SETTINGS"])) echo ' color'?>" data-prop-id="<?=$arSku["ID"];?>" data-prop-code="<?=$arSku["CODE"];?>" data-prop-value-id="<?=$value["ID"];?>" data-tree='<?=json_encode($arItem["SKU_TREE"]);?>'><?=(strlen($value["PICT"]["SRC"]) > 0 ? '<img src="'.$value["PICT"]["SRC"].'" title="'.$value["NAME"].'" alt="'.$value["NAME"].'" />' : $value["NAME"]);?></span><? $i++;
													}
												}
											echo '</div>';
										}
									}
									echo '<div class="offers_item_id" style="display: block;">';
										foreach ($arItem["SKU_MASSIVE"] as $id => $value) {
											?><div class="<?=$id;?>" data-id="<?=$value;?>"></div><?
										}
									echo '</div>';
									?>
								</div><?
							} ?>
							<? if (count($arItem["DISPLAY_PROPERTIES"]) > 0) {
								?><div class="item_props main_preview_props offers_hide" style="display: block;">
									<? foreach ($arItem["DISPLAY_PROPERTIES"] as $key => $value) {
										?><p><span class="prop_name"><?=$value["NAME"];?></span><span class="prop_value"><?=(is_array($value["DISPLAY_VALUE"]) ? implode(' / ', $value["DISPLAY_VALUE"]) : $value["DISPLAY_VALUE"]);?></span></p><?
									} ?>
								</div><?
							} ?>
							<? if (count($arItem["OFFERS"]) > 0) {
								foreach ($arItem["OFFERS"] as $arOffer) {
									if (count($arOffer["DISPLAY_PROPERTIES"]) > 0) {
										?><div class="item_props main_preview_props_<?=$arOffer["ID"];?> offers_hide" style="display: block;">
											<? foreach ($arOffer["DISPLAY_PROPERTIES"] as $key => $value) {
												?><p><span class="prop_name"><?=$value["NAME"];?></span><span class="prop_value"><?=(is_array($value["DISPLAY_VALUE"]) ? implode(' / ', $value["DISPLAY_VALUE"]) : $value["DISPLAY_VALUE"]);?></span></p><?
											} ?>
										</div><?
									}
								}
							} ?>
						<? if (count($arItem["OFFERS"]) > 0 || count($arItem["DISPLAY_PROPERTIES"]) > 0 || $arParams["USE_PRODUCT_QUANTITY"] == 1) { ?></div><? } ?>


					</div>
				</div><?
			}
		?></div>
	</div></div>
<? } else { ?>
	<div class="catalog_no_items"><?=GetMessage("SF_CATALOG_NO_ITEMS");?></div>
	<script type="text/javascript">
		//$(".smart_filter").remove();
	</script>
<? } ?>
<? if ($arParams["DISPLAY_BOTTOM_PAGER"]) {
	echo $arResult["NAV_STRING"];
} ?>
<? if (strlen($arResult["DETAIL_PICTURE"]["SRC"]) > 0) {
	?><div class="box hd"><img src="<?=$arResult["DETAIL_PICTURE"]["SRC"];?>" title="<?=$arResult["DETAIL_PICTURE"]["TITLE"];?>" alt="<?=$arResult["DETAIL_PICTURE"]["ALT"];?>"></div><?
} ?>
<? if (strlen($arResult["DESCRIPTION"]) > 0) {
	?><div class="box margin padding welcome-text"><?=$arResult["DESCRIPTION"];?></div><?
} ?>