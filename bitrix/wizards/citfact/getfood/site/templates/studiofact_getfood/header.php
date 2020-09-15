<? if (!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED !== true) die();
IncludeTemplateLangFile(__FILE__);
CUtil::InitJSCore();
CJSCore::Init(array("fx", "currency"));
$curPage = $APPLICATION->GetCurPage(true);
use Bitrix\Main\Page\Asset;
global $ccModule;
$ccModule = (\Bitrix\Main\Loader::includeModule("citfact.getfood"));
$config = new \Citfact\Getfood\Configurator();
?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="<?=LANGUAGE_ID;?>" lang="<?=LANGUAGE_ID;?>">
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=<?=LANG_CHARSET;?>">
		<meta http-equiv="X-UA-Compatible" content="IE=edge, chrome=1">
		<meta name="viewport" content="width = device-width, initial-scale = 1.0, maximum-scale = 1.0, user-scalable = no, target-densitydpi = device-dpi">
		<meta name="format-detection" content="telephone=no">
		<meta http-equiv="cleartype" content="on">
		<link rel="shortcut icon" type="image/x-icon" href="<?=SITE_DIR;?>favicon.ico">
		<!-- saved from url=(0014)about:internet -->
		<title><?$APPLICATION->ShowTitle();?></title>
        <?Citfact\Getfood\Htmlhelper\CCitfactCss::showCss()?>
        <?
		$APPLICATION->ShowMeta("robots", false, true);
		$APPLICATION->ShowMeta("keywords", false, true);
		$APPLICATION->ShowMeta("description", false, true);
		$APPLICATION->ShowCSS(true, true);
		$APPLICATION->ShowHeadStrings();
		$APPLICATION->ShowHeadScripts();

        Asset::getInstance()->addJs(SITE_TEMPLATE_PATH."/js/jquery-1.8.2.min.js");
        Asset::getInstance()->addJs(SITE_TEMPLATE_PATH."/js/modernizr.js");
        Asset::getInstance()->addJs(SITE_TEMPLATE_PATH."/js/jquery.easing.1.3.js");
        Asset::getInstance()->addJs(SITE_TEMPLATE_PATH."/js/bootstrap.min.js");
        Asset::getInstance()->addJs(SITE_TEMPLATE_PATH."/js/owl.carousel2.min.js");
        Asset::getInstance()->addJs(SITE_TEMPLATE_PATH."/js/fancybox/jquery.fancybox3.min.js");
        Asset::getInstance()->addJs(SITE_TEMPLATE_PATH."/js/jquery.scrollbar/jquery.scrollbar.min.js");
        Asset::getInstance()->addJs(SITE_TEMPLATE_PATH.'/js/jquery.jscrollpane.js');
        Asset::getInstance()->addJs(SITE_TEMPLATE_PATH.'/js/jquery.mousewheel.js');
        Asset::getInstance()->addJs(SITE_TEMPLATE_PATH."/js/jquery.flexslider-min.js");
        Asset::getInstance()->addJs(SITE_TEMPLATE_PATH."/js/jquery.mask.min.js");
        Asset::getInstance()->addJs(SITE_TEMPLATE_PATH."/js/jquery.cookie.js");
        Asset::getInstance()->addJs(SITE_TEMPLATE_PATH."/js/jquery.lazyload.js");
        Asset::getInstance()->addJs(SITE_TEMPLATE_PATH."/js/script.js");
        Asset::getInstance()->addJs(SITE_TEMPLATE_PATH."/js/jquery.tabslideout.v1.2.js");
        Asset::getInstance()->addJs(SITE_TEMPLATE_PATH."/js/tabs.js");
        Asset::getInstance()->addJs(SITE_TEMPLATE_PATH."/js/spectrum.js");
        ?>
		<? $color = COption::GetOptionString("main", "sf_template_color", "orange"); ?>
		<!--[if lt IE 9]>
			<script type='text/javascript' src="<?=SITE_TEMPLATE_PATH;?>/js/html5.js"></script>
			<script type='text/javascript' src="<?=SITE_TEMPLATE_PATH;?>/js/css3-mediaqueries.js"></script>
		<![endif]-->
		<?$APPLICATION->SetAdditionalCSS(SITE_TEMPLATE_PATH."/fonts/awesome.css");?>
		<? $sf_solution = COption::GetOptionString("main", "sf_solution", "");
		if (strlen($sf_solution) > 0) {
			$APPLICATION->SetAdditionalCSS(SITE_TEMPLATE_PATH."/css/".$sf_solution.".css");

		} ?>
        <?Citfact\Getfood\Htmlhelper\CCitfactCss::setThemeColor()?>
    </head>

	<?
    if(!function_exists('bclass')){
        function bclass() {
	    	global $APPLICATION;
			$page = $APPLICATION->GetCurPage();
			switch ($page) {
				case SITE_DIR . 'index.php' :
				case SITE_DIR :
					return ' home';
				case SITE_DIR . 'personal/order/make/' :
				case SITE_DIR . 'personal/order/make/index.php' :
				case SITE_DIR . 'personal/cart/' :
				case SITE_DIR . 'personal/cart/index.php' :
					return ' cart';
				default : 
					return ' not-home';
			}
	    }
    }
	?>


	<body  class="<?echo bclass();?> Font<?=($ccModule ? CGetfood::getOption("FONT_FAMILY") : '')?>" itemscope itemtype="http://schema.org/LocalBusiness">
		<span itemprop="name" style="display: none"><?=COption::GetOptionString('citfact.getfood', 'SITE_NAME')?></span>
        <? if(file_exists(__DIR__ . "/options.php")) require_once __DIR__ . "/options.php"; ?>
		<? if ($_REQUEST["open_popup"] != "Y") { ?>
		<div id="panel"><?$APPLICATION->ShowPanel();?></div>
        <?$APPLICATION->IncludeComponent("studiofact:configurator", "", array());?>
        <?$APPLICATION->IncludeFile(SITE_DIR."include/svg.php")?>
<?php
$catalog_view_mode = $APPLICATION->get_cookie("catalog_view_mode");
?>
		<div class="wrapper section--grid-3" data-grid-size="3" id="main_wrapper">
			<header id="header">
				<div class="header_menu header--overflow">
					<div class="container">
						<div class="fl header-menu">
							<?$APPLICATION->IncludeComponent(
								"bitrix:menu",
								"top_menu",
								array(
									"ROOT_MENU_TYPE" => "top",
									"MENU_CACHE_TYPE" => "Y",
									"MENU_CACHE_TIME" => "36000000",
									"MENU_CACHE_USE_GROUPS" => "Y",
									"MENU_CACHE_GET_VARS" => array(),
									"MAX_LEVEL" => "2",
									"CHILD_MENU_TYPE" => "top_submenu",
									"USE_EXT" => "N",
									"ALLOW_MULTI_SELECT" => "N"
								)
							);?>
						</div>
						<div class="fr user_auth">
							<?$APPLICATION->IncludeComponent("studiofact:auth", "", Array());?>
						</div>
						<div class="clear"></div>
					</div>
				</div>
				<div class="header">
                    <? $demo = COption::GetOptionString("citfact","demo"); if($demo){ ?><a class="tutorial" href="javascript:;" data-fancybox-callback data-fancybox data-src="#tutorial-sliders">?</a><? } ?>
					<div class="container">
						<div class="fl">
							<span class="inline mobile mobile_menu">
								<span class="mobile_menu__stick"></span>
								<span class="mobile_menu__stick"></span>
								<span class="mobile_menu__stick"></span>
							</span>
							<a href="<?=SITE_DIR;?>" class="logo inline" title="<?=GetMessage("STUDIOFACT_MAIN");?>"><?$APPLICATION->IncludeComponent("bitrix:main.include", "", array("AREA_FILE_SHOW" => "file", "PATH" => SITE_DIR."include/header_logo.php"), false);?></a>
							<div class="phone inline">
                                <?$APPLICATION->IncludeComponent(
                                    "bitrix:main.include",
                                    "header_phone",
                                    Array(
                                        "AREA_FILE_SHOW" => "file",
                                        "PATH" => SITE_DIR."include/header_phone.php",
                                    ), false
                                );?>
								<?/*=GetMessage("STUDIOFACT_FEEDBACK1");*/?> 
								<?if(CGetfood::getOption("CALLBACK_IN_HEADER")== 'true'){?>
									<a href="javascript:;" data-fancybox data-src="#feedback_form" class="header__callback open_feedback javascript"><?=GetMessage("STUDIOFACT_FEEDBACK2");?></a>
								<?}?>
							</div>
						</div>
						<div class="fr">
							<div class="search_box fl">
								<?$APPLICATION->IncludeComponent(
	"studiofact:search.title", 
	"visual", 
	array(
		"NUM_CATEGORIES" => "1",
		"TOP_COUNT" => "5",
		"CHECK_DATES" => "N",
		"SHOW_OTHERS" => "N",
		"PAGE" => SITE_DIR."catalog/",
		"CATEGORY_0_TITLE" => GetMessage("SEARCH_GOODS"),
		"CATEGORY_0" => array(
			0 => "iblock_catalog",
			1 => "iblock_offers",
		),
		"CATEGORY_0_iblock_catalog" => array(
			0 => "all",
		),
		"CATEGORY_OTHERS_TITLE" => GetMessage("SEARCH_OTHER"),
		"SHOW_INPUT" => "Y",
		"INPUT_ID" => "title-search-input",
		"CONTAINER_ID" => "search",
		"PRICE_CODE" => array(
			0 => "BASE",
		),
		"SHOW_PREVIEW" => "Y",
		"PREVIEW_WIDTH" => "75",
		"PREVIEW_HEIGHT" => "75",
		"CONVERT_CURRENCY" => "Y",
		"COMPONENT_TEMPLATE" => "visual",
		"ORDER" => "date",
		"USE_LANGUAGE_GUESS" => "Y",
		"PRICE_VAT_INCLUDE" => "Y",
		"PREVIEW_TRUNCATE_LEN" => "",
		"CURRENCY_ID" => "RUB",
		"CATEGORY_0_iblock_offers" => array(
			0 => "all",
		),
		"CATEGORY_1_TITLE" => ""
	),
	false
);?>
							</div>
							<div id="small_basket_box" class="fr" data-path="<?=SITE_DIR."include/buy_one_click.php";?>">
								<?$APPLICATION->IncludeComponent("bitrix:main.include", "", array("AREA_FILE_SHOW" => "file", "PATH" => SITE_DIR."include/small_basket.php"), false);?>
							</div>
						</div>
						<div class="clear"></div>
					</div>
					<div class="small_phone_box">
						<div class="container">
							<div class="fl">
								<?$APPLICATION->IncludeComponent("bitrix:main.include", "header_phone", array("AREA_FILE_SHOW" => "file", "PATH" => SITE_DIR."include/header_phone.php"), false);?>
							</div>
							<div class="fr"><?/*=GetMessage("STUDIOFACT_FEEDBACK1");
*/?> <a href="javascript:;" data-fancybox data-src="#feedback_form" class="header__callback open_feedback javascript"><?=GetMessage("STUDIOFACT_FEEDBACK2");
?></a></div>
							<div class="clear"></div>
						</div>
					</div>
				</div>
			</header>
			<? if ($APPLICATION->GetCurPage(true) == SITE_DIR."index.php" && ERROR_404 != "Y") { ?>
				<?$APPLICATION->IncludeComponent("bitrix:main.include", "", array("AREA_FILE_SHOW" => "file", "PATH" => SITE_DIR."include/main_banner_big.php"), false);?>
			<? } ?>
			<div class="main">


				<?
				if(CGetfood::getOption("ADVANTAGES") == 'true' ){
					$APPLICATION->IncludeComponent("bitrix:main.include", "", array("AREA_FILE_SHOW" => "file", "PATH" => SITE_DIR."include/services.php"), false);
				}
				?>
				<div class="container main_container">
					<div class="mobile_menu_bg"></div>
					<div class="mobile mobile_menu_list_wrapper">
						<div id="mobile_menu_list" class="radius5">
							<div class="mobile_menu_list_header">
								<span class="mobile mobile_menu mobile_menu--close">
									<span class="mobile_menu__stick"></span>
									<span class="mobile_menu__stick"></span>
									<span class="mobile_menu__stick"></span>
								</span>
								<span class="mobile_menu_list_header__text"><?=GetMessage("STUDIOFACT_MENU");?></span>
							</div>
							<?$APPLICATION->IncludeComponent("bitrix:menu", "left_menu", array(
									"ROOT_MENU_TYPE" => "left",
									"MENU_CACHE_TYPE" => "A",
									"MENU_CACHE_TIME" => "36000000",
									"MENU_CACHE_USE_GROUPS" => "Y",
									"MENU_THEME" => "site",
									"CACHE_SELECTED_ITEMS" => "N",
									"MENU_CACHE_GET_VARS" => array(
									),
									"MAX_LEVEL" => "2",
									"CHILD_MENU_TYPE" => "left",
									"USE_EXT" => "Y",
									"DELAY" => "N",
									"ALLOW_MULTI_SELECT" => "N",
								),
								false
							);?>
							<div class="header menu_search_container">
								<div class="search_box">
									<?$APPLICATION->IncludeComponent("bitrix:search.title", "visual", array(
										"NUM_CATEGORIES" => "1",
										"TOP_COUNT" => "1",
										"CHECK_DATES" => "N",
										"SHOW_OTHERS" => "N",
										"PAGE" => SITE_DIR."catalog/",
										"CATEGORY_0_TITLE" => GetMessage("SEARCH_GOODS") ,
										"CATEGORY_0" => array(
											0 => "iblock_catalog",
										),
										"CATEGORY_0_iblock_catalog" => array(
											0 => "all",
										),
										"CATEGORY_OTHERS_TITLE" => GetMessage("SEARCH_OTHER"),
										"SHOW_INPUT" => "Y",
										"INPUT_ID" => "title-search-input-mobile",
										"CONTAINER_ID" => "search-mobile",
										"PRICE_CODE" => array(
											0 => "BASE",
										),
										"SHOW_PREVIEW" => "Y",
										"PREVIEW_WIDTH" => "75",
										"PREVIEW_HEIGHT" => "75",
										"CONVERT_CURRENCY" => "Y"
									),
										false
									);?>
								</div>
							</div>
							<div class="mobile_dop_menu_list">
								<hr />
								<?$APPLICATION->IncludeComponent('bitrix:menu', "left_menu", array(
										"ROOT_MENU_TYPE" => "top",
										"MENU_CACHE_TYPE" => "Y",
										"MENU_CACHE_TIME" => "36000000",
										"MENU_CACHE_USE_GROUPS" => "Y",
										"MENU_CACHE_GET_VARS" => array(),
										"MAX_LEVEL" => "1",
										"USE_EXT" => "N",
										"ALLOW_MULTI_SELECT" => "N"
									)
								);?>
								<hr />
								<div class="user_auth"><?$APPLICATION->IncludeComponent("studiofact:auth", "", Array());?></div>
								<?//$APPLICATION->IncludeComponent("bitrix:main.include", "", array("AREA_FILE_SHOW" => "file", "PATH" => SITE_DIR."include/dop_left_menu.php"), false);?>
							</div>
						</div>
					</div>

					<div class="content">
						<div id="main_block_page">
							<?$APPLICATION->IncludeComponent("bitrix:breadcrumb", "", array(
									"START_FROM" => "0",
									"PATH" => "",
									"SITE_ID" => "-"
								),
								false,
								Array('HIDE_ICONS' => 'Y')
							);?>
							<? if ($APPLICATION->GetCurPage(true) != SITE_DIR."index.php" && ERROR_404 != "Y") { ?>
								<h1><?=$APPLICATION->ShowTitle(false);?></h1>
							<? } ?>
		<? } ?>