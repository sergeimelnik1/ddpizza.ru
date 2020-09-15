<?
namespace Citfact\Getfood\Htmlhelper;

use \Bitrix\Main\Loader,
    \Bitrix\Main\Config\Option,
    \Bitrix\Main\Localization\Loc,
    \Bitrix\Main\Page\Asset,
    Citfact\Getfood\Configurator;

Loc::loadMessages(__FILE__);

class CCitfactCss
{
    public static function setThemeColor(){
        $config = new Configurator();
        if($config::modeDefinition() == "demo") {
            echo "<style>" . $config->getColorCss($config::getOption("MAIN_COLOR")) . "</style>";
        } else {
            if(file_exists($_SERVER["DOCUMENT_ROOT"] . SITE_TEMPLATE_PATH."/css/theme_colors.css")) {
                Asset::getInstance()->addCss(SITE_TEMPLATE_PATH."/css/theme_colors.css");
            }
        }
    }

    public static function showCss(){
        Asset::getInstance()->addCss(SITE_TEMPLATE_PATH."/css/bootstrap.css");
        Asset::getInstance()->addCss(SITE_TEMPLATE_PATH."/css/owl.carousel2.min.css");
        Asset::getInstance()->addCss(SITE_TEMPLATE_PATH."/css/jquery.fancybox3.min.css");
        Asset::getInstance()->addCss(SITE_TEMPLATE_PATH."/js/jquery.scrollbar/jquery.scrollbar.css");
        Asset::getInstance()->addCss(SITE_TEMPLATE_PATH."/css/tutorial.css");
        Asset::getInstance()->addCss(SITE_TEMPLATE_PATH."/css/jquery.jscrollpane.css");
        Asset::getInstance()->addCss(SITE_TEMPLATE_PATH."/build/main.css");
        Asset::getInstance()->addCss(SITE_TEMPLATE_PATH."/css/color-style.css");

        /*Asset::getInstance()->addCss(SITE_TEMPLATE_PATH."/css/main.css");*/
        /*Asset::getInstance()->addCss(SITE_TEMPLATE_PATH."/css/color_blue.css");*/
        Asset::getInstance()->addCss(SITE_TEMPLATE_PATH."/css/spectrum.css");
        Asset::getInstance()->addCss(SITE_TEMPLATE_PATH."/css/jquery.jscrollpane.css");
        Asset::getInstance()->addCss(SITE_TEMPLATE_PATH."/css/fonts_roboto.css");
        Asset::getInstance()->addCss(SITE_TEMPLATE_PATH."/css/fonts_righteous.css");
    }
}