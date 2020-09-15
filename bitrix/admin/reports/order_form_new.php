<?if (!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED !== true) die();?>
<!DOCTYPE html>
<html>

<head>
<meta http-equiv=Content-Type content="text/html; charset=<?=LANG_CHARSET?>">
<title langs="ru">Заказ для печати</title>
<style>
<!--
.header{font-size:17px; font-family:Tahoma;padding-left:8px;}
.sub_header{font-size:13px; font-family:Tahoma;padding-left:8px;}
.date{font-style:italic; font-family:Tahoma;padding-left:8px;}
.number{font-size:24px;font-family:Tahoma;font-style:italic;padding-left:8px;}
.user{font-size:12px;font-family:Tahoma;font-weight:bold;padding-left:8px;}
.summa{font-size:12px;font-family:Tahoma;font-weight:bold;padding-left:15px;}

table.blank {
	border-collapse: collapse;
	width:100%;
}
table.blank td {
	border:0.5pt solid windowtext;
	padding: 10px;
}
-->
</style>
<link href="/bitrix/templates/studiofact_getfood/css/bootstrap.css" type="text/css" rel="stylesheet" />
</head>

<body bgcolor=white lang=RU style='tab-interval:35.4pt'>
<?

//$orderID = $_GET["ORDER_ID"];
//$arOrder = CSaleOrder::GetByID($orderID);
//print_arr($arOrderProps);
$paysystemID = $arOrder["PAY_SYSTEM_ID"];
$arPayment = CSalePaySystem::GetByID($paysystemID,1);
$page = IntVal($page);
if ($page<=0) $page = 1;
?>
<div class="container">
	<div class="row">
		<div class="col-xs-12 col-sm-6 orderInfo">
			<?
			if (count($arBasketIDs)>0)
			{
				$arCurFormat = CCurrencyLang::GetCurrencyFormat($arOrder["CURRENCY"]);
				$currency = preg_replace('/(^|[^&])#/', '${1}', $arCurFormat['FORMAT_STRING']);
				?>
				<table class="blank">
					<?
					$priceTotal = 0;
					$bUseVat = false;
					$arBasketOrder = array();
					for ($i = 0, $countBasketIds = count($arBasketIDs); $i < $countBasketIds; $i++)
					{
						$arBasketTmp = CSaleBasket::GetByID($arBasketIDs[$i]);

						if (floatval($arBasketTmp["VAT_RATE"]) > 0 )
							$bUseVat = true;

						$priceTotal += $arBasketTmp["PRICE"]*$arBasketTmp["QUANTITY"];

						$arBasketTmp["PROPS"] = array();
						if (isset($_GET["PROPS_ENABLE"]) && $_GET["PROPS_ENABLE"] == "Y")
						{
							$dbBasketProps = CSaleBasket::GetPropsList(
									array("SORT" => "ASC", "NAME" => "ASC"),
									array("BASKET_ID" => $arBasketTmp["ID"]),
									false,
									false,
									array("ID", "BASKET_ID", "NAME", "VALUE", "CODE", "SORT")
								);
							while ($arBasketProps = $dbBasketProps->GetNext())
								$arBasketTmp["PROPS"][$arBasketProps["ID"]] = $arBasketProps;
						}

						$arBasketOrder[] = $arBasketTmp;
					}

					//разбрасываем скидку на заказ по товарам
					if (floatval($arOrder["DISCOUNT_VALUE"]) > 0)
					{
						$arBasketOrder = GetUniformDestribution($arBasketOrder, $arOrder["DISCOUNT_VALUE"], $priceTotal);
					}

					//налоги
					$arTaxList = array();
					$db_tax_list = CSaleOrderTax::GetList(array("APPLY_ORDER"=>"ASC"), Array("ORDER_ID"=>$ORDER_ID));
					$iNds = -1;
					$i = 0;
					while ($ar_tax_list = $db_tax_list->Fetch())
					{
						$arTaxList[$i] = $ar_tax_list;
						// определяем, какой из налогов - НДС
						// НДС должен иметь код NDS, либо необходимо перенести этот шаблон
						// в каталог пользовательских шаблонов и исправить
						if ($arTaxList[$i]["CODE"] == "NDS")
							$iNds = $i;
						$i++;
					}


					$i = 0;
					$total_sum = 0;
					foreach ($arBasketOrder as $arBasket):
						$nds_val = 0;
						$taxRate = 0;

						if (floatval($arQuantities[$i]) <= 0)
							$arQuantities[$i] = DoubleVal($arBasket["QUANTITY"]);

						$b_AMOUNT = DoubleVal($arBasket["PRICE"]);

						//определяем начальную цену
						$item_price = $b_AMOUNT;

						if(DoubleVal($arBasket["VAT_RATE"]) > 0)
						{
							$nds_val = ($b_AMOUNT - DoubleVal($b_AMOUNT/(1+$arBasket["VAT_RATE"])));
							$item_price = $b_AMOUNT - $nds_val;
							$taxRate = $arBasket["VAT_RATE"]*100;
						}
						elseif(!$bUseVat)
						{
							$basket_tax = CSaleOrderTax::CountTaxes($b_AMOUNT*$arQuantities[$i], $arTaxList, $arOrder["CURRENCY"]);
							for ($mi = 0, $countTaxList = count($arTaxList); $mi < $countTaxList; $mi++)
							{
								if ($arTaxList[$mi]["IS_IN_PRICE"] == "Y")
								{
									$item_price -= $arTaxList[$mi]["TAX_VAL"];
								}
								$nds_val += DoubleVal($arTaxList[$mi]["TAX_VAL"]);
								$taxRate += ($arTaxList[$mi]["VALUE"]);
							}
						}
					/*?>
					<tr>
						<td ><?echo Bitrix\Sale\BasketItem::formatQuantity($arQuantities[$i]) ?> x </td>
						<td>
							<?echo htmlspecialcharsbx($arBasket["NAME"]);?>
							<?
							if (is_array($arBasket["PROPS"]) && $_GET["PROPS_ENABLE"] == "Y")
									{
										foreach($arBasket["PROPS"] as $vv)
										{
											if(strlen($vv["VALUE"]) > 0 && $vv["CODE"] != "CATALOG.XML_ID" && $vv["CODE"] != "PRODUCT.XML_ID")
												echo "<div style=\"font-size:8pt\">".$vv["NAME"].": ".$vv["VALUE"]."</div>";
										}
									}
							?>
						</td>
						
						<td align="right" nowrap><?=CCurrencyLang::CurrencyFormat($arBasket["PRICE"]*$arQuantities[$i], $arOrder["CURRENCY"], false);?></td>
					</tr>
					<?*/

					$total_sum += $arBasket["PRICE"]*$arQuantities[$i];
					$total_nds += $nds_val*$arQuantities[$i];

					$i++;
					endforeach;
					?>
					
					<tr>
						<td colspan="3">
							<?=str_replace("<br />","</td></tr><tr><td colspan=\"3\">",nl2br($arOrderProps[8]))?>
							&nbsp;
						</td>
					</tr>

					<tr>
						<td align="right" colspan="2">
							Итого:
						</td>
						<td align="right" nowrap>
							<?=CCurrencyLang::CurrencyFormat($total_sum, $arOrder["CURRENCY"], false);?>
						</td>
					</tr>
				</table>
				<?
			}
			?>
		</div>
		<div class="col-xs-12 col-sm-6 userInfo">
			<table  class="blank">
				<tr>
					<td>Имя</td>
					<td><?=$arOrderProps["FIO"]?></td>
				</tr>
				<tr>
					<td>Телефон</td>
					<td><?=$arOrderProps["PHONE"]?></td>
				</tr>
				<tr>
					<td>Самовывоз</td>
					<? if($arOrderProps["IS_DELIVERY"]=="Y"){?>
						<td>Нет</td>
					<?}else{?>
						<td>Да</td>
					<?}?>
				</tr>
					
				<? if($arOrderProps["ADDRESS"]!=""){?>
				<tr>
					<td>Адрес</td>
					<td><?=$arOrderProps["ADDRESS"]?><br/><?=$arOrderProps["ACC_ADDRESS"]?></td>
				</tr>
				<? } ?>
				<? if($arOrderProps["USER_DESCRIPTION"]!=""){?>
				<tr>
					<td>Комментарий</td>
					<td><?=$arOrderProps["USER_DESCRIPTION"]?></td>
				</tr>
				<? } ?>
				<tr>
					<td>E-mail</td>
					<td><?=$arOrderProps["EMAIL"]?></td>
				</tr>
				<tr>
					<td>Оплата</td>
					<td><?=$arPayment["NAME"]?></td>
				</tr>
				<? if($arOrderProps[9]!=""){?>
				<tr>
					<td>Сдача с</td>
					<td><?=$arOrderProps[9]?></td>
				</tr>
				<? } ?>
			</table>
		</div>
	</div>
</div>


</body>
</html>