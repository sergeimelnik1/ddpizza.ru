<? if (!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED !== true) die(); ?>
<?
use Bitrix\Sale\DiscountCouponsManager;

$bDelayColumn  = false;
$bDeleteColumn = false;
$bWeightColumn = false;
$bPropsColumn  = false;
$bPriceType    = false;

foreach ($arResult["GRID"]["HEADERS"] as $id => $arHeader):
	$arHeaders[] = $arHeader["id"];
	if (in_array($arHeader["id"], array("TYPE"))) {
		$bPriceType = true;
		continue;
	} elseif ($arHeader["id"] == "PROPS") {
		$bPropsColumn = true;
		continue;
	} elseif ($arHeader["id"] == "DELAY") {
		$bDelayColumn = true;
		continue;
	} elseif ($arHeader["id"] == "DELETE") {
		$bDeleteColumn = true;
		continue;
	} elseif ($arHeader["id"] == "WEIGHT") {
		$bWeightColumn = true;
	}
endforeach; ?>
<div id="basket_items_list" class="current">
	<div class="basket_items_block">
		<? if ($normalCount > 0) { ?>
			<table class="basket_items_table radius5">
				<thead>
					<tr>
						<td class="itemName" colspan="2"><?//=GetMessage("SALE_NAME");?></td>
						<td class="itemDiscount"><?=GetMessage("SALE_DISCOUNT");?></td>
						<td class="itemPrice"><?=GetMessage("SALE_PRICE");?></td>
						<td class="itemQuant"><?=GetMessage("SALE_QUANTITY");?></td>
						<td class="itemPrice"><?=GetMessage("SALE_SUM");?></td>
						<td class="itemAction"></td>
					</tr>
				</thead>
				<tbody>
					<?
					$idPokupka=array();
					foreach ($arResult["ITEMS"]["AnDelCanBuy"] as $key => $arItem) {
							$idPokupka[]['ID']=$arItem['PRODUCT_ID'];
							$idPokupka[]['URL']=$arItem['DETAIL_PAGE_URL'];
						?>
						<tr class="good_box">
							<td class="itemImage">
								<? if (strlen($arItem["DETAIL_PAGE_URL"]) > 0) { ?><a href="<?=$arItem["DETAIL_PAGE_URL"];?>" title="<?=$arItem["NAME"];?>"><? } ?>
								<img src="<?=$arResult['GRID']['ROWS'][$arItem['ID']]['PICTURE_SRC']?>" title="<?=$arItem["NAME"];?>" />
								<? if (strlen($arItem["DETAIL_PAGE_URL"]) > 0) { ?></a><? } ?>
							</td>
							<td class="itemName">
								<? if (strlen($arItem["DETAIL_PAGE_URL"]) > 0) { ?><a href="<?=$arItem["DETAIL_PAGE_URL"];?>" title="<?=$arItem["NAME"];?>"><? } ?>
								<?=$arItem["NAME"];?>
								<? if (strlen($arItem["DETAIL_PAGE_URL"]) > 0) { ?></a><? } ?>
									<? $t = false; foreach ($arItem["PROPS"] as $val):
										if (is_array($arItem["SKU_DATA"])) {
											$bSkip = false;
											foreach ($arItem["SKU_DATA"] as $propId => $arProp) {
												if ($arProp["CODE"] == $val["CODE"]) {
													$bSkip = true;
													break;
												}
											}
											if ($bSkip)
												continue;
										}
										if (!$t) { echo '<div class="itemNameProps">'; }
										$t = true;
										echo "<b>".$val["NAME"].":</b>&nbsp;<span>".$val["VALUE"]."</span><br/>";
									endforeach; ?>
								<? if ($t) { ?></div><? } ?>

									<?
									if (is_array($arItem["SKU_DATA"]) && !empty($arItem["SKU_DATA"])):
										?>
										<div class="text_sku_props">
											<div class="itemNameProps"><? foreach ($arItem["PROPS"] as $val):
												echo "<b>".$val["NAME"].":</b>&nbsp;<span>".$val["VALUE"]."</span><br/>";
											endforeach; ?></div>
											<a href="javascript: void(0);" class="javascript show_basket_sku_props"><?=GetMessage("SF_CHANGE_SKU");?></a>
										</div>
										<div class="hidden_sku_props" style="display: none;">
										<?
										foreach ($arItem["SKU_DATA"] as $propId => $arProp):

											// if property contains images or values
											$isImgProperty = false;
											if (array_key_exists('VALUES', $arProp) && is_array($arProp["VALUES"]) && !empty($arProp["VALUES"]))
											{
												foreach ($arProp["VALUES"] as $id => $arVal)
												{
													if (isset($arVal["PICT"]) && !empty($arVal["PICT"]) && is_array($arVal["PICT"])
														&& isset($arVal["PICT"]['SRC']) && !empty($arVal["PICT"]['SRC']))
													{
														$isImgProperty = true;
														break;
													}
												}
											}
											$countValues = count($arProp["VALUES"]);
											$full = ($countValues > 5) ? "full" : "";

											if ($isImgProperty): // iblock element relation property
											?>
												<div class="bx_item_detail_scu_small_noadaptive <?=$full?>">

													<span class="bx_item_section_name_gray">
														<?=$arProp["NAME"]?>:
													</span>

													<div class="bx_scu_scroller_container">

														<div class="bx_scu">
															<ul id="prop_<?=$arProp["CODE"]?>_<?=$arItem["ID"]?>" class="sku_prop_list">
																<?
																foreach ($arProp["VALUES"] as $valueId => $arSkuValue):

																	$selected = "";
																	foreach ($arItem["PROPS"] as $arItemProp):
																		if ($arItemProp["CODE"] == $arItem["SKU_DATA"][$propId]["CODE"])
																		{
																			if ($arItemProp["VALUE"] == $arSkuValue["NAME"] || $arItemProp["VALUE"] == $arSkuValue["XML_ID"])
																				$selected = "bx_active";
																		}
																	endforeach;
																?>
																	<li
																		class="sku_prop <?=$selected?>"
																		data-value-id="<?=$arSkuValue["XML_ID"]?>"
																		data-element="<?=$arItem["ID"]?>"
																		data-property="<?=$arProp["CODE"]?>"
																		>
																		<a href="javascript:void(0);" class="cnt">
																			<!--<span class="cnt_item" style="background-image:url(<?=$arSkuValue["PICT"]["SRC"]?>)"></span>-->
																			<img src="<?=$arSkuValue["PICT"]["SRC"]?>">
																		</a>
																	</li>
																<?
																endforeach;
																?>
															</ul>
														</div>

														<div class="bx_slide_left" onclick="leftScroll('<?=$arProp["CODE"]?>', <?=$arItem["ID"]?>, <?=$countValues?>);"></div>
														<div class="bx_slide_right" onclick="rightScroll('<?=$arProp["CODE"]?>', <?=$arItem["ID"]?>, <?=$countValues?>);"></div>
													</div>

												</div>
											<?
											else:
											?>

												<div class="bx_item_detail_size_small_noadaptive <?=$full?>">

													<span class="bx_item_section_name_gray">
														<?=$arProp["NAME"]?>:
													</span>

													<div class="bx_size_scroller_container">
														<div class="bx_size">
															<ul id="prop_<?=$arProp["CODE"]?>_<?=$arItem["ID"]?>"
																class="sku_prop_list"
																>
																<?
																foreach ($arProp["VALUES"] as $valueId => $arSkuValue):

																	$selected = "";
																	foreach ($arItem["PROPS"] as $arItemProp):
																		if ($arItemProp["CODE"] == $arItem["SKU_DATA"][$propId]["CODE"])
																		{
																			if ($arItemProp["VALUE"] == $arSkuValue["NAME"])
																				$selected = "bx_active";
																		}
																	endforeach;
																?>
																	<li style="width:10%;"
																		class="sku_prop <?=$selected?>"
																		data-value-id="<?=$arSkuValue["NAME"]?>"
																		data-element="<?=$arItem["ID"]?>"
																		data-property="<?=$arProp["CODE"]?>"
																		>
																		<a href="javascript:void(0);"><?=$arSkuValue["NAME"]?></a>
																	</li>
																<?
																endforeach;
																?>
															</ul>
														</div>
														<div class="bx_slide_left" onclick="leftScroll('<?=$arProp["CODE"]?>', <?=$arItem["ID"]?>, <?=$countValues?>);"></div>
														<div class="bx_slide_right" onclick="rightScroll('<?=$arProp["CODE"]?>', <?=$arItem["ID"]?>, <?=$countValues?>);"></div>
													</div>

												</div>

											<?
											endif;
										endforeach;
										?>
										</div>
										<?
									endif;
									?>
									<?
									if(count($arItem["ADDITIVES"])>0){?>
									<div class="additives">
									<?
										$add_cnt = 0;
										foreach($arItem["ADDITIVES"] as $add_id=>$arAdditive){
											$add_cnt++;
											echo $arAdditive["NAME"];
											if($add_cnt<count($arItem["ADDITIVES"])){
												echo ", ";
											}
										}?>
										</div>
										<?
									}
									?>
							</td>
							<td class="itemDiscount"><? if ($arItem["DISCOUNT_PRICE_PERCENT"] > 0) { echo $arItem["DISCOUNT_PRICE_PERCENT_FORMATED"]; } ?></td>
							<td class="itemPrice">
								<? if ($arItem["DISCOUNT_PRICE"] > 0) { ?><div class="basket_old_price"><?=str_replace(GetMessage("STUDIOFACT_RUB"), "<span class=\"rub black\">".GetMessage("STUDIOFACT_R")."</span>", $arItem["FULL_PRICE_FORMATED"]);?></div><? } ?>
								<div class="basket_price"><?=str_replace(GetMessage("STUDIOFACT_RUB"), "<span class=\"rub black\">".GetMessage("STUDIOFACT_R")."</span>", $arItem["PRICE_FORMATED"]);?></div>
							</td>
							<td class="itemQuant">
								<div class="itQuant_container">
									<?
									$ratio = isset($arItem["MEASURE_RATIO"]) ? $arItem["MEASURE_RATIO"] : 1;
									$max = isset($arItem["AVAILABLE_QUANTITY"]) ? "max=\"".$arItem["AVAILABLE_QUANTITY"]."\"" : "";
									$useFloatQuantity = ($arParams["QUANTITY_FLOAT"] == "Y") ? true : false;
									$useFloatQuantityJS = ($useFloatQuantity ? "true" : "false");
									?>
									<a href="javascript:void(0);" class="minus" onclick="setQuantity(<?=$arItem["ID"]?>, <?=$ratio ?>, 'down', <?=$useFloatQuantityJS?>);">-</a>
									<input
										type="text"
										size="3"
										id="QUANTITY_INPUT_<?=$arItem["ID"]?>"
										name="QUANTITY_<?=$arItem["ID"]?>"
										size="2"
										maxlength="18"
										min="1"
										readonly
										<?=$max?>
										step="<?=$ratio?>"
										value="<?=$arItem["QUANTITY"]?>"
										onchange="updateQuantity('QUANTITY_INPUT_<?=$arItem["ID"]?>', '<?=$arItem["ID"]?>', <?=$ratio?>, <?=$useFloatQuantityJS?>)"
									>
									<a href="javascript:void(0);" class="plus" onclick="setQuantity(<?=$arItem["ID"]?>, <?=$ratio ?>, 'up', <?=$useFloatQuantityJS?>);">+</a>
								</div>
								<?/*<div class="item_quantity buy_button_a" data-ratio="<?=$arItem["MEASURE_RATIO"]?>">
									<a class="minus" href="javascript: void(0);">-</a><input type="text" value="<?=$arItem["QUANTITY"]?>" name="QUANTITY_<?=$arItem["ID"]?>" id="QUANTITY_<?=$arItem["ID"]?>"<?=(isset($arItem["AVAILABLE_QUANTITY"]) ? " data-max=\"".$arItem["AVAILABLE_QUANTITY"]."\"" : "");?> /><a class="plus" href="javascript: void(0);">+</a>
								</div>*/?>
							</td>
							<td class="itemPrice">
								<div class="basket_price"><?=str_replace(GetMessage("STUDIOFACT_RUB"), "<span class=\"rub black\">".GetMessage("STUDIOFACT_R")."</span>", $arItem["SUM"]);?></div>
							</td>
							<td class="itemAction">
								<? if ($bDeleteColumn): ?>
									<a href="<?=str_replace("#ID#", $arItem["ID"], $arUrls["delete"])?>"><?=GetMessage("SALE_DELETE")?></a>
								<? endif;
								if ($bDelayColumn): ?>
									<a href="<?=str_replace("#ID#", $arItem["ID"], $arUrls["delay"])?>"><?=GetMessage("SALE_DELAY")?></a>
								<? endif; ?>
							</td>
						</tr>
					<? } ?>
				</tbody>
			</table>
			<div class="basket_items_blocks radius5">
				<? foreach ($arResult["ITEMS"]["AnDelCanBuy"] as $key => $arItem) { ?>
					<div class="basket_items_blocks_item">
						<div class="itemName">
							<? if (strlen($arItem["DETAIL_PAGE_URL"]) > 0) { ?><a href="<?=$arItem["DETAIL_PAGE_URL"];?>" title="<?=$arItem["NAME"];?>"><? } ?>
							<?=$arItem["NAME"];?>
							<? if (strlen($arItem["DETAIL_PAGE_URL"]) > 0) { ?></a><? } ?>
						</div>
						<div class="itemImage">
							<? if (strlen($arItem["DETAIL_PAGE_URL"]) > 0) { ?><a href="<?=$arItem["DETAIL_PAGE_URL"];?>" title="<?=$arItem["NAME"];?>"><? } ?>
							<img src="<?=$arResult['GRID']['ROWS'][$arItem['ID']]['BIG_PICTURE_SRC'];?>" title="<?=$arItem["NAME"];?>" />
							<? if (strlen($arItem["DETAIL_PAGE_URL"]) > 0) { ?></a><? } ?>
						</div>
							<? $t = false; foreach ($arItem["PROPS"] as $val):
								if (is_array($arItem["SKU_DATA"])) {
									$bSkip = false;
									foreach ($arItem["SKU_DATA"] as $propId => $arProp) {
										if ($arProp["CODE"] == $val["CODE"]) {
											$bSkip = true;
											break;
										}
									}
									if ($bSkip)
										continue;
								}
								if (!$t) { echo '<div class="itemNameProps">'; }
								$t = true;
								echo "<b>".$val["NAME"].":</b>&nbsp;<span>".$val["VALUE"]."</span><br/>";
							endforeach; ?>
						<? if ($t) { ?></div><? } ?>


									<?
									if (is_array($arItem["SKU_DATA"]) && !empty($arItem["SKU_DATA"])):
										?><div class="text_sku_props">
											<div class="itemNameProps"><? foreach ($arItem["PROPS"] as $val):
												echo "<b>".$val["NAME"].":</b>&nbsp;<span>".$val["VALUE"]."</span><br/>";
											endforeach; ?></div>
											<a href="javascript: void(0);" class="javascript show_basket_sku_props"><?=GetMessage("SF_CHANGE_SKU");?></a><br /><br />
										</div>
										<div class="hidden_sku_props" style="display: none;"><?
										foreach ($arItem["SKU_DATA"] as $propId => $arProp):

											// if property contains images or values
											$isImgProperty = false;
											if (array_key_exists('VALUES', $arProp) && is_array($arProp["VALUES"]) && !empty($arProp["VALUES"]))
											{
												foreach ($arProp["VALUES"] as $id => $arVal)
												{
													if (isset($arVal["PICT"]) && !empty($arVal["PICT"]) && is_array($arVal["PICT"])
														&& isset($arVal["PICT"]['SRC']) && !empty($arVal["PICT"]['SRC']))
													{
														$isImgProperty = true;
														break;
													}
												}
											}
											$countValues = count($arProp["VALUES"]);
											$full = ($countValues > 5) ? "full" : "";

											if ($isImgProperty): // iblock element relation property
											?>
												<div class="bx_item_detail_scu_small_noadaptive <?=$full?>">

													<span class="bx_item_section_name_gray">
														<?=$arProp["NAME"]?>:
													</span>

													<div class="bx_scu_scroller_container">

														<div class="bx_scu">
															<ul id="prop_<?=$arProp["CODE"]?>_<?=$arItem["ID"]?>"
																class="sku_prop_list"
																>
																<?
																foreach ($arProp["VALUES"] as $valueId => $arSkuValue):

																	$selected = "";
																	foreach ($arItem["PROPS"] as $arItemProp):
																		if ($arItemProp["CODE"] == $arItem["SKU_DATA"][$propId]["CODE"])
																		{
																			if ($arItemProp["VALUE"] == $arSkuValue["NAME"] || $arItemProp["VALUE"] == $arSkuValue["XML_ID"])
																				$selected = "bx_active";
																		}
																	endforeach;
																?>
																	<li
																		class="sku_prop <?=$selected?>"
																		data-value-id="<?=$arSkuValue["XML_ID"]?>"
																		data-element="<?=$arItem["ID"]?>"
																		data-property="<?=$arProp["CODE"]?>"
																		>
																		<a href="javascript:void(0);">
																			<img src="<?=$arSkuValue['PICT']['SRC']?>"/>
																		</a>
																	</li>
																<?
																endforeach;
																?>
															</ul>
														</div>

														<div class="bx_slide_left" onclick="leftScroll('<?=$arProp["CODE"]?>', <?=$arItem["ID"]?>, <?=$countValues?>);"></div>
														<div class="bx_slide_right" onclick="rightScroll('<?=$arProp["CODE"]?>', <?=$arItem["ID"]?>, <?=$countValues?>);"></div>
													</div>

												</div>
											<?
											else:
											?>
												<div class="bx_item_detail_size_small_noadaptive <?=$full?>">

													<span class="bx_item_section_name_gray">
														<?=$arProp["NAME"]?>:
													</span>

													<div class="bx_size_scroller_container">
														<div class="bx_size">
															<ul id="prop_<?=$arProp["CODE"]?>_<?=$arItem["ID"]?>"
																class="sku_prop_list"
																>
																<?
																foreach ($arProp["VALUES"] as $valueId => $arSkuValue):

																	$selected = "";
																	foreach ($arItem["PROPS"] as $arItemProp):
																		if ($arItemProp["CODE"] == $arItem["SKU_DATA"][$propId]["CODE"])
																		{
																			if ($arItemProp["VALUE"] == $arSkuValue["NAME"])
																				$selected = "bx_active";
																		}
																	endforeach;
																?>
																	<li style="width:10%;"
																		class="sku_prop <?=$selected?>"
																		data-value-id="<?=$arSkuValue["NAME"]?>"
																		data-element="<?=$arItem["ID"]?>"
																		data-property="<?=$arProp["CODE"]?>"
																		>
																		<a href="javascript:void(0);"><?=$arSkuValue["NAME"]?></a>
																	</li>
																<?
																endforeach;
																?>
															</ul>
														</div>
														<div class="bx_slide_left" onclick="leftScroll('<?=$arProp["CODE"]?>', <?=$arItem["ID"]?>, <?=$countValues?>);"></div>
														<div class="bx_slide_right" onclick="rightScroll('<?=$arProp["CODE"]?>', <?=$arItem["ID"]?>, <?=$countValues?>);"></div>
													</div>

												</div>
											<?
											endif;
										endforeach;
										?></div><?
									endif;
									?>

						<? if ($arItem["DISCOUNT_PRICE_PERCENT"] > 0) {
							echo '<div class="itemDiscount"><b>'.GetMessage("SALE_DISCOUNT").':</b> '.$arItem["DISCOUNT_PRICE_PERCENT_FORMATED"].'</div>';
						} ?>
						<div class="itemPrice">
							<b><?=GetMessage("SALE_PRICE");?>: </b>
							<div class="basket_price"><?=str_replace(GetMessage("STUDIOFACT_RUB"), "<span class=\"rub black\">".GetMessage("STUDIOFACT_R")."</span>", $arItem["PRICE_FORMATED"]);?></div>
							<? if ($arItem["DISCOUNT_PRICE"] > 0) { ?><div class="basket_old_price"><?=str_replace(GetMessage("STUDIOFACT_RUB"), "<span class=\"rub black\">".GetMessage("STUDIOFACT_R")."</span>", $arItem["FULL_PRICE_FORMATED"]);?></div><? } ?>
						</div>
						<div class="itemQuant">

							<div class="item_quantity">
								<a href="javascript:void(0);" class="minus" onclick="setQuantity(<?=$arItem["ID"]?>, <?=$ratio ?>, 'down', <?=$useFloatQuantityJS?>);">-</a>
								<input type="text" value="<?=$arItem["QUANTITY"]?>" name="QUANTITY_<?=$arItem["ID"]?>" id="QUANTITY_<?=$arItem["ID"]?>"<?=(isset($arItem["AVAILABLE_QUANTITY"]) ? " data-max=\"".$arItem["AVAILABLE_QUANTITY"]."\"" : "");?> />
								<a href="javascript:void(0);" class="plus" onclick="setQuantity(<?=$arItem["ID"]?>, <?=$ratio ?>, 'up', <?=$useFloatQuantityJS?>);">+</a>
							</div>
						</div>
						<div class="itemPrice">
							<b><?=GetMessage("SALE_SUM");?>:&nbsp;&nbsp;</b>
							<div class="basket_price"><?=str_replace(GetMessage("STUDIOFACT_RUB"), "<span class=\"rub black\">".GetMessage("STUDIOFACT_R")."</span>", $arItem["SUM"]);?></div>
						</div>
						<div class="itemAction">
							<? if ($bDeleteColumn): ?>
								<a href="<?=str_replace("#ID#", $arItem["ID"], $arUrls["delete"])?>"><?=GetMessage("SALE_DELETE")?></a>
							<? endif;
							if ($bDelayColumn): ?>
								<a href="<?=str_replace("#ID#", $arItem["ID"], $arUrls["delay"])?>"><?=GetMessage("SALE_DELAY")?></a>
							<? endif; ?>
						</div>
						<br />
					</div>
				<? } ?>
			</div>

			<input type="hidden" id="column_headers" value="<?=CUtil::JSEscape(implode($arHeaders, ","))?>" />
			<input type="hidden" id="offers_props" value="<?=CUtil::JSEscape(implode($arParams["OFFERS_PROPS"], ","))?>" />
			<input type="hidden" id="action_var" value="<?=CUtil::JSEscape($arParams["ACTION_VARIABLE"])?>" />
			<input type="hidden" id="quantity_float" value="<?=$arParams["QUANTITY_FLOAT"]?>" />
			<input type="hidden" id="count_discount_4_all_quantity" value="<?=($arParams["COUNT_DISCOUNT_4_ALL_QUANTITY"] == "Y") ? "Y" : "N"?>" />
			<input type="hidden" id="price_vat_show_value" value="<?=($arParams["PRICE_VAT_SHOW_VALUE"] == "Y") ? "Y" : "N"?>" />
			<input type="hidden" id="hide_coupon" value="<?=($arParams["HIDE_COUPON"] == "Y") ? "Y" : "N"?>" />
			<input type="hidden" id="coupon_approved" value="N" />
			<input type="hidden" id="use_prepayment" value="<?=($arParams["USE_PREPAYMENT"] == "Y") ? "Y" : "N"?>" />
			<div class="bx_ordercart_order_pay">
				<div class="basket_bottom_wrapper">
					<div class="bx_ordercart_order_pay_left" id="coupons_block">
						<?
						if ($arParams["HIDE_COUPON"] != "Y")
						{
							?>
							<div class="bx_ordercart_coupon">
							    <input type="text" id="coupon" name="COUPON" value="" placeholder="<?=GetMessage("STB_COUPON_PROMT")?>">&nbsp;<a class="button" href="javascript:void(0)" onclick="enterCoupon();" title="<?=GetMessage('SALE_COUPON_APPLY_TITLE'); ?>"><?=GetMessage('SALE_COUPON_APPLY'); ?></a>
							</div><?
							if (!empty($arResult['COUPON_LIST']))
							{
								$indexForLastBadCoupon = count($arResult['COUPON_LIST']) - 1;/* find last bad coupon */
                                while(($indexForLastBadCoupon >= 0) and !( ($arResult['COUPON_LIST'][$indexForLastBadCoupon]['STATUS']== DiscountCouponsManager::STATUS_FREEZE) or ($arResult['COUPON_LIST'][$indexForLastBadCoupon]['STATUS']== DiscountCouponsManager::STATUS_NOT_FOUND))) {$indexForLastBadCoupon = $indexForLastBadCoupon - 1;}

							    foreach ($arResult['COUPON_LIST'] as $index => $oneCoupon)
								{
								    $couponClass = 'disabled';
									switch ($oneCoupon['STATUS'])
									{
										case DiscountCouponsManager::STATUS_NOT_FOUND:
										case DiscountCouponsManager::STATUS_FREEZE:
											$couponClass = 'bad';
											break;
										case DiscountCouponsManager::STATUS_APPLYED:
											$couponClass = 'good';
											break;
									}

									if( ($couponClass == 'bad') and ($index < $indexForLastBadCoupon) ){continue;}/*its need for showing last bad coupon*/
									?>
									<div class="bx_ordercart_coupon">
										<input disabled readonly type="text" name="OLD_COUPON[]" value="<?=htmlspecialcharsbx($oneCoupon['COUPON']);?>" class="<? echo $couponClass; ?>">
										<span class="<? echo $couponClass; ?>" data-coupon="<? echo htmlspecialcharsbx($oneCoupon['COUPON']); ?>"></span>
										<div class="bx_ordercart_coupon_notes">
											<?
											if (isset($oneCoupon['CHECK_CODE_TEXT']))
											{
												echo (is_array($oneCoupon['CHECK_CODE_TEXT']) ? implode('<br>', $oneCoupon['CHECK_CODE_TEXT']) : $oneCoupon['CHECK_CODE_TEXT']);
											}
											?>
										</div>
									</div><?
								}
								unset($couponClass, $oneCoupon);
							}
						}
						?>
					</div>

					<div class="bx_ordercart_order_pay_right">
						<table class="bx_ordercart_order_sum">
							<?if ($bWeightColumn):?>
								<tr>
									<td class="custom_t1"><?=GetMessage("SALE_TOTAL_WEIGHT")?></td>
									<td class="custom_t2" id="allWeight_FORMATED"><?=round($arResult["allWeight_FORMATED"])?></td>
								</tr>
							<?endif;?>
							<?if ($arParams["PRICE_VAT_SHOW_VALUE"] == "Y"):?>
								<tr>
									<td class="custom_t1"><?echo GetMessage('SALE_VAT_EXCLUDED')?></td>
									<td class="custom_t2" id="allSum_wVAT_FORMATED"><?=str_replace(GetMessage("STUDIOFACT_RUB"), "<span class=\"rub black\">".GetMessage("STUDIOFACT_R")."</span>", $arResult["allSum_wVAT_FORMATED"]);?></td>
								</tr>
								<tr>
									<td class="custom_t1"><?echo GetMessage('SALE_VAT_INCLUDED')?></td>
									<td class="custom_t2" id="allVATSum_FORMATED"><?=str_replace(GetMessage("STUDIOFACT_RUB"), "<span class=\"rub black\">".GetMessage("STUDIOFACT_R")."</span>", $arResult["allVATSum_FORMATED"]);?></td>
								</tr>
							<?endif;?>
								<tr>
									<td class="fwb custom_t1"><?=GetMessage("SALE_TOTAL")?></td>
									<td class="fwb custom_t2" id="allSum_FORMATED"><?=str_replace(GetMessage("STUDIOFACT_RUB"), "<span class=\"rub black\">".GetMessage("STUDIOFACT_R")."</span>", str_replace(" ", "&nbsp;", $arResult["allSum_FORMATED"]));?></td>
								</tr>
								<tr>
									<td class="custom_t1"></td>
									<td class="custom_t2" style="text-decoration: line-through; color:#CCC;" id="PRICE_WITHOUT_DISCOUNT">
										<?if (floatval($arResult["DISCOUNT_PRICE_ALL"]) > 0):?>
											<?=str_replace(GetMessage("STUDIOFACT_RUB"), "<span class=\"rub black\" style=\"border-color: #CCC;text-decoration: line-through;\">".GetMessage("STUDIOFACT_R")."</span>", $arResult["PRICE_WITHOUT_DISCOUNT"]);?>
										<?endif;?>
									</td>
								</tr>
						</table>
						<div style="clear:both;"></div>
					</div>
				</div>

				<div class="bx_ordercart_order_pay_center">

					<?if ($arParams["USE_PREPAYMENT"] == "Y" && strlen($arResult["PREPAY_BUTTON"]) > 0):?>
						<?=$arResult["PREPAY_BUTTON"]?>
						<span><?=GetMessage("SALE_OR")?></span>
					<?endif;?>

					<?/*<a href="javascript:void(0);" class="btn_buy_one_click button" data-fancybox="" data-src="#oneClickModal"><?=GetMessage('BUY_ONE_CLICK')?></a>*/?>
					<a href="javascript:void(0)" onclick="checkOut();" class="checkout button"><?=GetMessage("SALE_ORDER")?></a>
				</div>
			</div>
		<? } else {
			echo "<br />".GetMessage("SALE_NO_ITEMS");
		} ?>
	</div>
</div>