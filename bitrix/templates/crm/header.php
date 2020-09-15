<? if (!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED !== true) die();
$curPage = $APPLICATION->GetCurPage(true);
use Bitrix\Main\Page\Asset;

?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="<?=LANGUAGE_ID;?>" lang="<?=LANGUAGE_ID;?>">
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=<?=LANG_CHARSET;?>">
		<meta http-equiv="X-UA-Compatible" content="IE=edge, chrome=1">
		<meta name="viewport" content="width = device-width, initial-scale = 1.0, maximum-scale = 1.0, user-scalable = no, target-densitydpi = device-dpi">
		<meta http-equiv="cleartype" content="on">
<meta name="format-detection" content="telephone=no">
		<link rel="shortcut icon" type="image/x-icon" href="<?=SITE_DIR;?>favicon.ico">
		<title><?$APPLICATION->ShowTitle();?></title>
        <?
		$APPLICATION->ShowHead();

        Asset::getInstance()->addJs(SITE_TEMPLATE_PATH."/js/jquery-3.3.1.min.js");
        Asset::getInstance()->addJs(SITE_TEMPLATE_PATH."/js/bootstrap.min.js");
        Asset::getInstance()->addJs(SITE_TEMPLATE_PATH."/js/bootstrap.bundle.min.js");
        Asset::getInstance()->addJs(SITE_TEMPLATE_PATH."/js/script.js");
		
		Asset::getInstance()->addCss(SITE_TEMPLATE_PATH."/css/bootstrap-reboot.min.css"); 
		Asset::getInstance()->addCss(SITE_TEMPLATE_PATH."/css/bootstrap-grid.min.css"); 
		Asset::getInstance()->addCss(SITE_TEMPLATE_PATH."/css/bootstrap.min.css");
		?>
        

    </head>
	<body>
	<?/*<div id="panel">
	<?$APPLICATION->ShowPanel();?>
	</div>*/?>
	<div class="container site_inner">