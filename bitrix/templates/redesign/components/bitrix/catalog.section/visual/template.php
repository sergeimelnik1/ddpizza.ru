<? if (!defined('B_PROLOG_INCLUDED') || B_PROLOG_INCLUDED !== true) die();

use \Bitrix\Main\Localization\Loc;

/**
 * @global CMain $APPLICATION
 * @var array $arParams
 * @var array $arResult
 * @var CatalogSectionComponent $component
 * @var CBitrixComponentTemplate $this
 * @var string $templateName
 * @var string $componentPath
 */

$this->setFrameMode(true);
//$this->addExternalCss('/bitrix/css/main/bootstrap.css');
?>
<div class="">

<?
if (!empty($arResult['NAV_RESULT']))
{
	$navParams =  array(
		'NavPageCount' => $arResult['NAV_RESULT']->NavPageCount,
		'NavPageNomer' => $arResult['NAV_RESULT']->NavPageNomer,
		'NavNum' => $arResult['NAV_RESULT']->NavNum
	);
}
else
{
	$navParams = array(
		'NavPageCount' => 1,
		'NavPageNomer' => 1,
		'NavNum' => $this->randString()
	);
}

$showTopPager = false;
$showBottomPager = false;
$showLazyLoad = false;

if ($arParams['PAGE_ELEMENT_COUNT'] > 0 && $navParams['NavPageCount'] > 1)
{
	$showTopPager = $arParams['DISPLAY_TOP_PAGER'];
	$showBottomPager = $arParams['DISPLAY_BOTTOM_PAGER'];
	$showLazyLoad = $arParams['LAZY_LOAD'] === 'Y' && $navParams['NavPageNomer'] != $navParams['NavPageCount'];
}

$templateLibrary = array('popup', 'ajax', 'fx');
$currencyList = '';

if (!empty($arResult['CURRENCIES']))
{
	$templateLibrary[] = 'currency';
	$currencyList = CUtil::PhpToJSObject($arResult['CURRENCIES'], false, true, true);
}

$templateData = array(
	'TEMPLATE_THEME' => $arParams['TEMPLATE_THEME'],
	'TEMPLATE_LIBRARY' => $templateLibrary,
	'CURRENCIES' => $currencyList
);
unset($currencyList, $templateLibrary);

$elementEdit = CIBlock::GetArrayByID($arParams['IBLOCK_ID'], 'ELEMENT_EDIT');
$elementDelete = CIBlock::GetArrayByID($arParams['IBLOCK_ID'], 'ELEMENT_DELETE');
$elementDeleteParams = array('CONFIRM' => GetMessage('CT_BCS_TPL_ELEMENT_DELETE_CONFIRM'));

$positionClassMap = array(
	'left' => 'product-item-label-left',
	'center' => 'product-item-label-center',
	'right' => 'product-item-label-right',
	'bottom' => 'product-item-label-bottom',
	'middle' => 'product-item-label-middle',
	'top' => 'product-item-label-top'
);

$discountPositionClass = '';
if ($arParams['SHOW_DISCOUNT_PERCENT'] === 'Y' && !empty($arParams['DISCOUNT_PERCENT_POSITION']))
{
	foreach (explode('-', $arParams['DISCOUNT_PERCENT_POSITION']) as $pos)
	{
		$discountPositionClass .= isset($positionClassMap[$pos]) ? ' '.$positionClassMap[$pos] : '';
	}
}

$labelPositionClass = '';
if (!empty($arParams['LABEL_PROP_POSITION']))
{
	foreach (explode('-', $arParams['LABEL_PROP_POSITION']) as $pos)
	{
		$labelPositionClass .= isset($positionClassMap[$pos]) ? ' '.$positionClassMap[$pos] : '';
	}
}

$arParams['~MESS_BTN_BUY'] = $arParams['~MESS_BTN_BUY'] ?: Loc::getMessage('CT_BCS_TPL_MESS_BTN_BUY');
$arParams['~MESS_BTN_DETAIL'] = $arParams['~MESS_BTN_DETAIL'] ?: Loc::getMessage('CT_BCS_TPL_MESS_BTN_DETAIL');
$arParams['~MESS_BTN_COMPARE'] = $arParams['~MESS_BTN_COMPARE'] ?: Loc::getMessage('CT_BCS_TPL_MESS_BTN_COMPARE');
$arParams['~MESS_BTN_SUBSCRIBE'] = $arParams['~MESS_BTN_SUBSCRIBE'] ?: Loc::getMessage('CT_BCS_TPL_MESS_BTN_SUBSCRIBE');
$arParams['~MESS_BTN_ADD_TO_BASKET'] = $arParams['~MESS_BTN_ADD_TO_BASKET'] ?: Loc::getMessage('CT_BCS_TPL_MESS_BTN_ADD_TO_BASKET');
$arParams['~MESS_NOT_AVAILABLE'] = $arParams['~MESS_NOT_AVAILABLE'] ?: Loc::getMessage('CT_BCS_TPL_MESS_PRODUCT_NOT_AVAILABLE');
$arParams['~MESS_SHOW_MAX_QUANTITY'] = $arParams['~MESS_SHOW_MAX_QUANTITY'] ?: Loc::getMessage('CT_BCS_CATALOG_SHOW_MAX_QUANTITY');
$arParams['~MESS_RELATIVE_QUANTITY_MANY'] = $arParams['~MESS_RELATIVE_QUANTITY_MANY'] ?: Loc::getMessage('CT_BCS_CATALOG_RELATIVE_QUANTITY_MANY');
$arParams['~MESS_RELATIVE_QUANTITY_FEW'] = $arParams['~MESS_RELATIVE_QUANTITY_FEW'] ?: Loc::getMessage('CT_BCS_CATALOG_RELATIVE_QUANTITY_FEW');

$generalParams = array(
	'SHOW_DISCOUNT_PERCENT' => $arParams['SHOW_DISCOUNT_PERCENT'],
	'PRODUCT_DISPLAY_MODE' => $arParams['PRODUCT_DISPLAY_MODE'],
	'SHOW_MAX_QUANTITY' => $arParams['SHOW_MAX_QUANTITY'],
	'RELATIVE_QUANTITY_FACTOR' => $arParams['RELATIVE_QUANTITY_FACTOR'],
	'MESS_SHOW_MAX_QUANTITY' => $arParams['~MESS_SHOW_MAX_QUANTITY'],
	'MESS_RELATIVE_QUANTITY_MANY' => $arParams['~MESS_RELATIVE_QUANTITY_MANY'],
	'MESS_RELATIVE_QUANTITY_FEW' => $arParams['~MESS_RELATIVE_QUANTITY_FEW'],
	'SHOW_OLD_PRICE' => $arParams['SHOW_OLD_PRICE'],
	'USE_PRODUCT_QUANTITY' => $arParams['USE_PRODUCT_QUANTITY'],
	'PRODUCT_QUANTITY_VARIABLE' => $arParams['PRODUCT_QUANTITY_VARIABLE'],
	'ADD_TO_BASKET_ACTION' => $arParams['ADD_TO_BASKET_ACTION'],
	'ADD_PROPERTIES_TO_BASKET' => $arParams['ADD_PROPERTIES_TO_BASKET'],
	'PRODUCT_PROPS_VARIABLE' => $arParams['PRODUCT_PROPS_VARIABLE'],
	'SHOW_CLOSE_POPUP' => $arParams['SHOW_CLOSE_POPUP'],
	'DISPLAY_COMPARE' => $arParams['DISPLAY_COMPARE'],
	'COMPARE_PATH' => $arParams['COMPARE_PATH'],
	'COMPARE_NAME' => $arParams['COMPARE_NAME'],
	'PRODUCT_SUBSCRIPTION' => $arParams['PRODUCT_SUBSCRIPTION'],
	'PRODUCT_BLOCKS_ORDER' => $arParams['PRODUCT_BLOCKS_ORDER'],
	'LABEL_POSITION_CLASS' => $labelPositionClass,
	'DISCOUNT_POSITION_CLASS' => $discountPositionClass,
	'SLIDER_INTERVAL' => $arParams['SLIDER_INTERVAL'],
	'SLIDER_PROGRESS' => $arParams['SLIDER_PROGRESS'],
	'~BASKET_URL' => $arParams['~BASKET_URL'],
	'~ADD_URL_TEMPLATE' => $arResult['~ADD_URL_TEMPLATE'],
	'~BUY_URL_TEMPLATE' => $arResult['~BUY_URL_TEMPLATE'],
	'~COMPARE_URL_TEMPLATE' => $arResult['~COMPARE_URL_TEMPLATE'],
	'~COMPARE_DELETE_URL_TEMPLATE' => $arResult['~COMPARE_DELETE_URL_TEMPLATE'],
	'TEMPLATE_THEME' => $arParams['TEMPLATE_THEME'],
	'USE_ENHANCED_ECOMMERCE' => $arParams['USE_ENHANCED_ECOMMERCE'],
	'DATA_LAYER_NAME' => $arParams['DATA_LAYER_NAME'],
	'BRAND_PROPERTY' => $arParams['BRAND_PROPERTY'],
	'MESS_BTN_BUY' => $arParams['~MESS_BTN_BUY'],
	'MESS_BTN_DETAIL' => $arParams['~MESS_BTN_DETAIL'],
	'MESS_BTN_COMPARE' => $arParams['~MESS_BTN_COMPARE'],
	'MESS_BTN_SUBSCRIBE' => $arParams['~MESS_BTN_SUBSCRIBE'],
	'MESS_BTN_ADD_TO_BASKET' => $arParams['~MESS_BTN_ADD_TO_BASKET'],
	'MESS_NOT_AVAILABLE' => $arParams['~MESS_NOT_AVAILABLE']
);

$obName = 'ob'.preg_replace('/[^a-zA-Z0-9_]/', 'x', $this->GetEditAreaId($navParams['NavNum']));
$containerName = 'container-'.$navParams['NavNum'];

if ($showTopPager)
{
	?>
	<div data-pagination-num="<?=$navParams['NavNum']?>">
		<!-- pagination-container -->
		<?=$arResult['NAV_STRING']?>
		<!-- pagination-container -->
	</div>
	<?
}
?>

<div class="catalog_section container">
	<div class="row catalog_ajax_wrapper" data-entity="<?=$containerName?>">

	<!--RestartBuffer-->
		<?
		if (!empty($arResult['ITEMS']) && !empty($arResult['ITEM_ROWS']))
		{
			$arSections = array();
			$arElementSections = array();
			
			$query = CIBlockSection::GetList(array(),array("IBLOCK_ID"=>$arParams["IBLOCK_ID"]),false,array("ID","NAME","CODE"));
			while($res = $query->GetNext()){
				$arSections[$res["ID"]] = array("NAME"=>$res["NAME"],"CODE"=>$res["CODE"]);
			}
			
			
			$areaIds = array();
			
			foreach ($arResult['ITEMS'] as $item)
			{
				$arElementSections[$item["IBLOCK_SECTION_ID"]] = $item["IBLOCK_SECTION_ID"];
				$uniqueId = $item['ID'].'_'.md5($this->randString().$component->getAction());
				$areaIds[$item['ID']] = $this->GetEditAreaId($uniqueId);
				$this->AddEditAction($uniqueId, $item['EDIT_LINK'], $elementEdit);
				$this->AddDeleteAction($uniqueId, $item['DELETE_LINK'], $elementDelete, $elementDeleteParams);
			}
			$section = 0;
			if(isset($_REQUEST["LAST_SECTION"])){
				$section = $_REQUEST["LAST_SECTION"];
			}
			?>
			<!-- items-container -->
			<?
			//if(isset($_GET["test"])){
						
						//$generalParams["USE_PRODUCT_QUANTITY"] = true;
					//}
			foreach ($arResult['ITEM_ROWS'] as $rowData)
			{
				
				$rowItems = array_splice($arResult['ITEMS'], 0, $rowData['COUNT']);
				foreach ($rowItems as $item)
				{
					if($item["IBLOCK_SECTION_ID"]!=$section && count($arElementSections)>1){
						?></div><div class="section row   catalog_ajax_wrapper"><div class="section_title col-xs-12" data-id="<?=$item["IBLOCK_SECTION_ID"]?>" id="<?=$arSections[$item["IBLOCK_SECTION_ID"]]["CODE"]?>"><?=$arSections[$item["IBLOCK_SECTION_ID"]]["NAME"]?></div><?
						$section = $item["IBLOCK_SECTION_ID"];
					}
					$APPLICATION->IncludeComponent(
						'bitrix:catalog.item',
						'redesign',
						array(
							'RESULT' => array(
								'ITEM' => $item,
								'AREA_ID' => $areaIds[$item['ID']],
								'TYPE' => $rowData['TYPE'],
								'BIG_LABEL' => 'N',
								'BIG_DISCOUNT_PERCENT' => 'N',
								'BIG_BUTTONS' => 'N',
								'SCALABLE' => 'N'
							),
							'PARAMS' => $generalParams
								+ array('SKU_PROPS' => $arResult['SKU_PROPS'][$item['IBLOCK_ID']])
						),
						$component,
						array('HIDE_ICONS' => 'Y')
					);
				}
			}
			unset($generalParams, $rowItems);
			?>
			<!-- items-container -->
			<?
		}
		else
		{
			if (!isset($arParams['IS_SECTION']) || $arParams['IS_SECTION'] != 'Y') // ���� ������ �� ��������� � ������� ��������
			{
				// load css for bigData/deferred load
				$APPLICATION->IncludeComponent(
					'bitrix:catalog.item',
					'redesign',
					array(),
					$component,
					array('HIDE_ICONS' => 'Y')
				);
			}
			else
			{
				global ${$arParams['FILTER_NAME']};

				if (isset(${$arParams['FILTER_NAME']}) && !empty(${$arParams['FILTER_NAME']}))
				{
					?><div class="catalog-section__message"><?=GetMessage('CT_BCS_CATALOG_FILTER_EMPTY_MESSAGE')?></div><?
				}
				else
				{
					?><div class="catalog-section__message"><?=GetMessage('CT_BCS_CATALOG_EMPTY_MESSAGE')?></div><?
				}
			}
		}
		?>
		
<?php
$paramName = 'PAGEN_'.$arResult['NAV_RESULT']->NavNum;
$paramValue = $arResult['NAV_RESULT']->NavPageNomer;
$pageCount = $arResult['NAV_RESULT']->NavPageCount;
 
if ($paramValue < $pageCount) {
    $paramValue = (int) $paramValue + 1;
    $url = htmlspecialcharsbx(
        $APPLICATION->GetCurPageParam(
           sprintf('%s=%s', $paramName, $paramValue), 
            array($paramName, 'AJAX_PAGE',)
        )
    );
    echo sprintf('<div class="ajax-pager-wrap text-center">
                      <a class="ajax-pager-link" data-wrapper-class="catalog_ajax_wrapper" href="%s&AJAX_PAGE=Y"></a>
                  </div>',
        $url);
}
?>
<script>
var imageObserver = new IntersectionObserver((entries, imgObserver) => {
									                entries.forEach((entry) => {
									                    if (entry.isIntersecting) {
									                        var lazyImage = entry.target;
															lazyImage.src = lazyImage.dataset.src;
									                        lazyImage.classList.remove('lzy_img');
									                        imgObserver.unobserve(lazyImage);
									                    }
									                })
									            });
									            var arr = document.querySelectorAll('.lazyLoadImage')
									            arr.forEach((v) => {
									                imageObserver.observe(v);
									            })
</script>
<!--RestartBuffer-->
	</div>
</div>
<?

if (0 && $showBottomPager)
{
	?>
	<div data-pagination-num="<?=$navParams['NavNum']?>">
		<!-- pagination-container -->
		<?=$arResult['NAV_STRING']?>
		<!-- pagination-container -->
	</div>
	<?
}
?>

<?
if ($arParams['HIDE_SECTION_DESCRIPTION'] !== 'Y')
{
	$this->SetViewTarget('section_description');


	if (strlen($arResult["DESCRIPTION"]) > 0)
	{
		?><div class="box margin padding welcome-text"><?= $arResult["DESCRIPTION"]; ?></div><?
	}
	$this->EndViewTarget();
}

$signer = new \Bitrix\Main\Security\Sign\Signer;
$signedTemplate = $signer->sign($templateName, 'catalog.section');
$signedParams = $signer->sign(base64_encode(serialize($arResult['ORIGINAL_PARAMETERS'])), 'catalog.section');
?>
<script>
	BX.message({
		BTN_MESSAGE_BASKET_REDIRECT: '<?=GetMessageJS('CT_BCS_CATALOG_BTN_MESSAGE_BASKET_REDIRECT')?>',
		BASKET_URL: '<?=$arParams['BASKET_URL']?>',
		ADD_TO_BASKET_OK: '<?=GetMessageJS('ADD_TO_BASKET_OK')?>',
		TITLE_ERROR: '<?=GetMessageJS('CT_BCS_CATALOG_TITLE_ERROR')?>',
		TITLE_BASKET_PROPS: '<?=GetMessageJS('CT_BCS_CATALOG_TITLE_BASKET_PROPS')?>',
		TITLE_SUCCESSFUL: '<?=GetMessageJS('ADD_TO_BASKET_OK')?>',
		BASKET_UNKNOWN_ERROR: '<?=GetMessageJS('CT_BCS_CATALOG_BASKET_UNKNOWN_ERROR')?>',
		BTN_MESSAGE_SEND_PROPS: '<?=GetMessageJS('CT_BCS_CATALOG_BTN_MESSAGE_SEND_PROPS')?>',
		BTN_MESSAGE_CLOSE: '<?=GetMessageJS('CT_BCS_CATALOG_BTN_MESSAGE_CLOSE')?>',
		BTN_MESSAGE_CLOSE_POPUP: '<?=GetMessageJS('CT_BCS_CATALOG_BTN_MESSAGE_CLOSE_POPUP')?>',
		COMPARE_MESSAGE_OK: '<?=GetMessageJS('CT_BCS_CATALOG_MESS_COMPARE_OK')?>',
		COMPARE_UNKNOWN_ERROR: '<?=GetMessageJS('CT_BCS_CATALOG_MESS_COMPARE_UNKNOWN_ERROR')?>',
		COMPARE_TITLE: '<?=GetMessageJS('CT_BCS_CATALOG_MESS_COMPARE_TITLE')?>',
		PRICE_TOTAL_PREFIX: '<?=GetMessageJS('CT_BCS_CATALOG_PRICE_TOTAL_PREFIX')?>',
		RELATIVE_QUANTITY_MANY: '<?=CUtil::JSEscape($arParams['MESS_RELATIVE_QUANTITY_MANY'])?>',
		RELATIVE_QUANTITY_FEW: '<?=CUtil::JSEscape($arParams['MESS_RELATIVE_QUANTITY_FEW'])?>',
		BTN_MESSAGE_COMPARE_REDIRECT: '<?=GetMessageJS('CT_BCS_CATALOG_BTN_MESSAGE_COMPARE_REDIRECT')?>',
		BTN_MESSAGE_LAZY_LOAD: '<?=$arParams['MESS_BTN_LAZY_LOAD']?>',
		BTN_MESSAGE_LAZY_LOAD_WAITER: '<?=GetMessageJS('CT_BCS_CATALOG_BTN_MESSAGE_LAZY_LOAD_WAITER')?>',
		SITE_ID: '<?=SITE_ID?>'
	});
	var <?=$obName?> = new JCCatalogSectionComponent({
		siteId: '<?=CUtil::JSEscape(SITE_ID)?>',
		componentPath: '<?=CUtil::JSEscape($componentPath)?>',
		navParams: <?=CUtil::PhpToJSObject($navParams)?>,
		deferredLoad: false, // enable it for deferred load
		initiallyShowHeader: '<?=!empty($arResult['ITEM_ROWS'])?>',
		bigData: <?=CUtil::PhpToJSObject($arResult['BIG_DATA'])?>,
		lazyLoad: !!'<?=$showLazyLoad?>',
		loadOnScroll: !!'<?=($arParams['LOAD_ON_SCROLL'] === 'Y')?>',
		template: '<?=CUtil::JSEscape($signedTemplate)?>',
		ajaxId: '<?=CUtil::JSEscape($arParams['AJAX_ID'])?>',
		parameters: '<?=CUtil::JSEscape($signedParams)?>',
		container: '<?=$containerName?>'
	});
</script>


<div class="hidden additivesFields">
    <? if (!empty($arResult["ADDITIVES"])) { ?>
            <div class="itemAdditives hidden">
                <div class="itemAdditivesDesc">
                    Добавьте больше начинки <a href="#!" onclick="$(this).closest('.itemPopup').find('.additiveBtn').click();">Вернуться</a>
                </div>


                <? foreach ($arResult["ADDITIVES_SECTIONS"] as $arSect) { ?>
                    <div class="additivesSection">
                        <div class="additivesSectionTitle"><?= $arSect["NAME"] ?></div>
                        <div class="additivesSectionItems" >

                            <? foreach ($arResult["ADDITIVES"][$arSect["ID"]] as $arAdd) {
                                ?>
                                <div class="additivesSectionItem">
                                    <div class="additivesSectionItemName">
                                        <?= $arAdd["NAME"] ?>
                                    </div>
                                    <div class="additivesSectionItemQuantity">
                                        <span class="addMinus" onclick="addMinus($(this))">-</span>
                                        <input type="text" readonly name="ITEM_ADDITIVES[<?= $arAdd["ID"] ?>]" value="0" class="addInput" data-price="<?= intval($arAdd["PRICE"]) ?>" />
                                        <span class="addPlus" onclick="addPlus($(this))">+</span>
                                    </div>
                                    <div class="additivesSectionItemPrice">
                                        <span><?= intval($arAdd["PRICE"]) ?> руб</span>
                                    </div>
                                </div>
                            <? } ?>
                        </div>
                    </div>
                <? } ?>

            </div>
        <? } ?>
</div>