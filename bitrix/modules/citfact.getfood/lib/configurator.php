<?

namespace Citfact\Getfood;

use Bitrix\Main\Loader,
    Bitrix\Main\Config\Option,
    Bitrix\Main\Localization\Loc;

Loc::loadMessages(__FILE__);

class Configurator
{
    const moduleID="CGetfood";
    public $siteOption = array();
    public $params;

    const default_opt = array(
        "MAIN_COLOR" => "#ee5126",
        "HEADER_TYPE" => "1",
        "FONT_FAMILY" => "OpenSansRegular",
        "MAIN_SLIDER" => "0",
        "BREADCRUMB_SIZE" => "page-header-default",
        "BREADCRUMB_IMAGE" => "page-header-with-background-image",
        "UP_FORM" => "scroll-2",
        "UP_LOCATION" => "right",
        "UP_DISPLAY" => "true",
        "PROPERTY_DISPLAY" => "true",
        "DETAIL_TEXT_DISPLAY" => "true",
        "FEEDBACK_DISPLAY" => "true",
        "QUANTITY_DISPLAY" => "true",
        "COMMENTS_DISPLAY" => "true",
        "SUBSCRIBE_DISPLAY" => "true",
        //"NEWS_DISPLAY" => "true",
        //"BANNERS_DISPLAY" => "true",
        "YOU_VIEWS_DISPLAY" => "true",
        "FAST_VIEW_DISPLAY" => "true",
        "MAIN_BEST_SELLERS_DISPLAY" => "true",
        "MAIN_NEWPRODUCT_DISPLAY" => "true",
        "MAIN_MOST_WANTED_DISPLAY" => "true",
        "CATALOG_BEST_SELLERS_DISPLAY" => "true",
        "CATALOG_NEWPRODUCT_DISPLAY" => "true",
        "CATALOG_MOST_WANTED_DISPLAY" => "true",
        "MAP_TYPE" => "google",
        "IBLOCK_CATALOG_ID" => 25,
        "CALLBACK_IN_HEADER" => "true",
        "BLOCK_SUBS_IN_LEFT_SIDEBAR" => "true",
        "BLOCK_BANNERS_IN_LEFT_SIDEBAR" => "true",
        "BLOCK_SOCNETS_IN_FOOTER" => "true",
        "ADVANTAGES"=>"true",
        "SMALL_BANNER1"=>"true",
        "NEWS"=>"true",
        "SEO_TEXT"=>"true",
        "SMALL_BANNER2"=>"true",
        //detail
        "BLOCK_ABOUT"=>"true",
        "BLOCK_CHARACTERISTIC"=>"true",
        "BLOCK_AVAILABILITY"=>"true",
        "BLOCK_COMMENTS"=>"true",
        "NEAR_RESTORANS"=>"true",
        "RECOMENDS_TO_BUY"=>"true",
        "PERSONAL_RECOMEND"=>"true",
        "YOU_SEE"=>"true",
        //catalog
        "FILTER"=>"vertical",
        "TILE"=>"true",
        "LIST"=>"true",
        "LIST2"=>"true",
        "BANNERS"=>"true",
    );

    public function __construct(array $options = [])
    {
        $this->setPropertyArray();

        foreach (self::default_opt as $key => $opt)
        {
            $this->siteOption[$key] = $this->getOption($key, $opt);
        }
    }

    public static function modeDefinition()
    {
        $hostname = $_SERVER["HTTP_HOST"];
        if (preg_match("/(studiofact.ru|testfact.ru)/i", $hostname)) {
            $mode = 'demo';
        } else {
            $mode = "work";
        }
        return $mode;
    }

    public function setDefault()
    {
        foreach (self::default_opt as $key => $opt) {
            $this->setOption($key, $opt);
        }
    }

    public function getFirstElementURL()
    {
        \CModule::IncludeModule("iblock");
        $arFilter = array("IBLOCK_TYPE" => "catalog", "ACTIVE" => "Y");
        $arSelect = Array("ID", "DETAIL_PAGE_URL");
        $res = \CIBlockElement::GetList(Array(), $arFilter, false, false, $arSelect);
        if ($arres = $res->GetNextElement()) {
            $arFields = $arres->GetFields();
            return $arFields['DETAIL_PAGE_URL'];
        }
    }

    public function getFirstSectionURL()
    {
        \CModule::IncludeModule("iblock");
        $arFilter = array("IBLOCK_TYPE" => "catalog", "ACTIVE" => "Y");
        $arSelect = Array("ID", "DETAIL_PAGE_URL");
        $res = \CIBlockSection::GetList(Array(), $arFilter, false, false, $arSelect);
        if ($arres = $res->GetNextElement()) {
            $arFields = $arres->GetFields();
            return $arFields['SECTION_PAGE_URL'];
        }
    }

    public function getPropertyVariants($property_name)
    {
        $result = array();
        foreach ($this->params as $group => $param) {
            foreach ($param["PROPS"] as $property) {
                if ($property["PROPERTY_NAME"] == $property_name) {
                    foreach ($property["VALUES"] as $val) {
                        $result[$val["ID"]] = array(
                            "NAME" => $val["NAME"],
                            "VALUE" => $val["VALUE"],
                        );
                    }
                }
            }
        }
        return $result;
    }

    public function getOptions()
    {
        return $this->params;
    }

    public function getColorCss($rgb)
    {
        return str_replace(
            array("#color#", "#light_color#"),
            array($rgb, $this->getLithingColor($rgb)),
            @file_get_contents(__DIR__ . "/../css/css_template.css")
        );
    }

    public function makeColorCss($style)
    {
        file_put_contents(
            $_SERVER["DOCUMENT_ROOT"] . SITE_TEMPLATE_PATH . "/css/theme_colors.css",
            $this->getColorCss($style)
        );
    }

    public function rgbToHsl($r, $g, $b)
    {
        $r /= 255;
        $g /= 255;
        $b /= 255;
        $max = max($r, $g, $b);
        $min = min($r, $g, $b);
        $l = ($max + $min) / 2;
        $d = $max - $min;
        if ($d == 0) {
            $h = $s = 0;
        } else {
            $s = $d / (1 - abs(2 * $l - 1));
            switch ($max) {
                case $r:
                    $h = 60 * fmod((($g - $b) / $d), 6);
                    if ($b > $g) {
                        $h += 360;
                    }
                    break;
                case $g:
                    $h = 60 * (($b - $r) / $d + 2);
                    break;
                case $b:
                    $h = 60 * (($r - $g) / $d + 4);
                    break;
            }
        }
        return array(round($h, 2), round($s, 2), round($l, 2));
    }

    public function hslToRgb($h, $s, $l)
    {
        $c = (1 - abs(2 * $l - 1)) * $s;
        $x = $c * (1 - abs(fmod(($h / 60), 2) - 1));
        $m = $l - ($c / 2);
        if ($h < 60) {
            $r = $c;
            $g = $x;
            $b = 0;
        } else if ($h < 120) {
            $r = $x;
            $g = $c;
            $b = 0;
        } else if ($h < 180) {
            $r = 0;
            $g = $c;
            $b = $x;
        } else if ($h < 240) {
            $r = 0;
            $g = $x;
            $b = $c;
        } else if ($h < 300) {
            $r = $x;
            $g = 0;
            $b = $c;
        } else {
            $r = $c;
            $g = 0;
            $b = $x;
        }
        $r = ($r + $m) * 255;
        $g = ($g + $m) * 255;
        $b = ($b + $m) * 255;
        return array(floor($r), floor($g), floor($b));
    }

    private function getHSLarray($rgb)
    {
        if (strlen($rgb) != 7)
            return false;
        list($r, $g, $b) = sscanf($rgb, "#%02x%02x%02x");
        return $this->rgbToHsl($r, $g, $b);
    }

    private function getLithingColor($rgb, $percent = 0.15)
    {
        $hsl = $this->getHSLarray($rgb);
        $rgb = $this->hslToRgb($hsl[0], $hsl[1], floatval($hsl[2]) < 1 - $percent ? floatval($hsl[2]) + $percent : 1);
        foreach ($rgb as $k => $color)
            $rgb[$k] = dechex($color);
        return "#" . implode("", $rgb);
    }

    private function getInvertColor(){

    }

    public function setPropertyArray()
    {
        $this->params = array(
            "BASE" => array(
                "NAME" => Loc::getMessage("CONFIGURATOR_PROPERTY_GROUP_COMMON"),
                "PROPS" => array(
                    array(
                        "NAME" => Loc::getMessage("CONFIGURATOR_PROPERTY_NAME_COLOR"),
                        "PROPERTY_NAME" => "MAIN_COLOR",
                        "TYPE" => "color_radio",
                        "CODE" => "colors",
                        "PAGE_URL" => "",
                        "VALUES" => array(
                            array(
                                "ID" => "d",
                                "NAME" => "",
                                "VALUE" => "#ee5126",
                            ),
                            array(
                                "ID" => "0",
                                "NAME" => "",
                                "VALUE" => "#000000",
                            ),
                            array(
                                "ID" => "",
                                "NAME" => "",
                                "VALUE" => "#1961ac",
                            ),
                            array(
                                "ID" => "",
                                "NAME" => "",
                                "VALUE" => "#873eaa",
                            ),
                            array(
                                "ID" => "",
                                "NAME" => "",
                                "VALUE" => "#48311e",
                            ),
                            array(
                                "ID" => "",
                                "NAME" => "",
                                "VALUE" => "#6a5989",
                            ),
                            array(
                                "ID" => "",
                                "NAME" => "",
                                "VALUE" => "#26a5f0",
                            ),
                            array(
                                "ID" => "",
                                "NAME" => "",
                                "VALUE" => "#cf3367",
                            ),
                            array(
                                "ID" => "",
                                "NAME" => "",
                                "VALUE" => "#f1271c",
                            ),
                            array(
                                "ID" => "",
                                "NAME" => "",
                                "VALUE" => "#87a95d",
                            ),
                        ),
                    ),
                    /*
                    array(
                        "NAME" => "test_img_" . Loc::getMessage("CONFIGURATOR_PROPERTY_NAME_COLOR"),
                        "PROPERTY_NAME" => "TEST_MAIN_COLOR",
                        "TYPE" => "image_radio",
                        "CODE" => "test_image_radio",
                        "VALUES" => array(
                            array(
                                "ID" => "0",
                                "IMG" => "/upload/resize_cache/iblock/3f5/370_220_1/3f52cb3c8b4a2e4674c3d027c1e5d42d.jpg",
                                "NAME" => Loc::getMessage("CONFIGURATOR_PROPERTY_COLOR_VALUE_000000"),
                                "VALUE" => "image_radio",
                            ),
                            array(
                                "ID" => "0",
                                "IMG" => "/upload/resize_cache/iblock/3f5/370_220_1/3f52cb3c8b4a2e4674c3d027c1e5d42d.jpg",
                                "NAME" => Loc::getMessage("CONFIGURATOR_PROPERTY_COLOR_VALUE_000000"),
                                "VALUE" => "image_radio",
                            ),
                            array(
                                "ID" => "0",
                                "IMG" => "/upload/resize_cache/iblock/3f5/370_220_1/3f52cb3c8b4a2e4674c3d027c1e5d42d.jpg",
                                "NAME" => Loc::getMessage("CONFIGURATOR_PROPERTY_COLOR_VALUE_000000"),
                                "VALUE" => "image_radio",
                            )
                        ),
                    ),*/
                    array(
                        "NAME" => Loc::getMessage("CONFIGURATOR_PROPERTY_NAME_CALLBACK"),
                        "PROPERTY_NAME" => "CALLBACK_IN_HEADER",
                        "TYPE" => "checkbox",
                        "CODE" => "callback_in_header",
                        "PAGE_URL" => "",
                        "VALUES" => array(
                            array(
                                "ID" => "",
                                "NAME" => Loc::getMessage("CONFIGURATOR_PROPERTY_VALUE_YES"),
                                "VALUE" => "true",
                            ),
                        ),
                    ),
                    array(
                        "NAME" => Loc::getMessage("CONFIGURATOR_PROPERTY_NAME_SUBS"),
                        "PROPERTY_NAME" => "BLOCK_SUBS_IN_LEFT_SIDEBAR",
                        "TYPE" => "checkbox",
                        "CODE" => "block_subs_in_left_sidebar",
                        "PAGE_URL" => "",
                        "VALUES" => array(
                            array(
                                "ID" => "",
                                "NAME" => Loc::getMessage("CONFIGURATOR_PROPERTY_VALUE_YES"),
                                "VALUE" => "true",
                            ),
                        ),
                    ),
                    array(
                        "NAME" => Loc::getMessage("CONFIGURATOR_PROPERTY_NAME_BANNERS"),
                        "PROPERTY_NAME" => "BLOCK_BANNERS_IN_LEFT_SIDEBAR",
                        "TYPE" => "checkbox",
                        "CODE" => "block_banners_in_left_sidebar",
                        "PAGE_URL" => "",
                        "VALUES" => array(
                            array(
                                "ID" => "",
                                "NAME" => Loc::getMessage("CONFIGURATOR_PROPERTY_VALUE_YES"),
                                "VALUE" => "true",
                            ),
                        ),
                    ),
                    array(
                        "NAME" => Loc::getMessage("CONFIGURATOR_PROPERTY_NAME_SOCNETS"),
                        "PROPERTY_NAME" => "BLOCK_SOCNETS_IN_FOOTER",
                        "TYPE" => "checkbox",
                        "CODE" => "block_socnets_in_footer",
                        "PAGE_URL" => "",
                        "VALUES" => array(
                            array(
                                "ID" => "",
                                "NAME" => Loc::getMessage("CONFIGURATOR_PROPERTY_VALUE_YES"),
                                "VALUE" => "true",
                            ),
                        ),
                    ),
                    array(
                        "NAME" => Loc::getMessage("CONFIGURATOR_PROPERTY_UP_DISPLAY"),
                        "PROPERTY_NAME" => "UP_DISPLAY",
                        "TYPE" => "checkbox",
                        "CODE" => "up_display",
                        "PAGE_URL" => "",
                        "VALUES" => array(
                            array(
                                "ID" => "",
                                "NAME" => Loc::getMessage("CONFIGURATOR_PROPERTY_VALUE_YES"),
                                "VALUE" => "true",
                            ),
                        ),
                    ),
                    array(
                        "NAME" => Loc::getMessage("CONFIGURATOR_PROPERTY_UP_FORM"),
                        "PROPERTY_NAME" => "UP_FORM",
                        "TYPE" => "radio",
                        "CODE" => "up_form",
                        "PAGE_URL" => "",
                        "VALUES" => array(
                            array(
                                "ID" => "",
                                "NAME" => Loc::getMessage("CONFIGURATOR_PROPERTY_UP_FORM_ROUND"),
                                "VALUE" => "scroll-1",
                            ),
                            array(
                                "ID" => "",
                                "NAME" => Loc::getMessage("CONFIGURATOR_PROPERTY_UP_FORM_SQUARE"),
                                "VALUE" => "scroll-2",
                            ),
                        ),
                    ),
                    array(
                        "NAME" => Loc::getMessage("CONFIGURATOR_PROPERTY_UP_LOCATION"),
                        "PROPERTY_NAME" => "UP_LOCATION",
                        "TYPE" => "radio",
                        "CODE" => "up_location",
                        "PAGE_URL" => "",
                        "VALUES" => array(
                            array(
                                "ID" => "",
                                "NAME" => Loc::getMessage("CONFIGURATOR_PROPERTY_UP_LOCATION_LEFT"),
                                "VALUE" => "left",
                            ),
                            array(
                                "ID" => "",
                                "NAME" => Loc::getMessage("CONFIGURATOR_PROPERTY_UP_LOCATION_RIGHT"),
                                "VALUE" => "right",
                            ),
                        ),
                    ),
                ),
            ),
            "MAIN" => array(
                "NAME" => Loc::getMessage("CONFIGURATOR_PROPERTY_GROUP_MAIN"),
                "PROPS" => array(
                    /*array(
                        "NAME" => Loc::getMessage("CONFIGURATOR_PROPERTY_NAME_MAIN_SLIDER"),
                        "PROPERTY_NAME" => "MAIN_SLIDER",
                        "TYPE" => "radio",
                        "CODE" => "main_slider",
                        "PAGE_URL" => "/",
                        "VALUES" => array(
                            array(
                                "ID" => "0",
                                "NAME" => "0",
                                "VALUE" => "0",
                            ),
                            array(
                                "ID" => "1",
                                "NAME" => "1",
                                "VALUE" => "1",
                            ),
                            array(
                                "ID" => "2",
                                "NAME" => "2",
                                "VALUE" => "2",
                            ),
                            array(
                                "ID" => "3",
                                "NAME" => "3",
                                "VALUE" => "3",
                            ),
                            array(
                                "ID" => "4",
                                "NAME" => "4",
                                "VALUE" => "4",
                            ),
                            array(
                                "ID" => "5",
                                "NAME" => "5",
                                "VALUE" => "5",
                            ),
                            array(
                                "ID" => "6",
                                "NAME" => "6",
                                "VALUE" => "6",
                            ),

                        )
                    ),*/
                    array(
                        "NAME" => Loc::getMessage("CONFIGURATOR_PROPERTY_NAME_ADVANTAGES"),
                        "PROPERTY_NAME" => "ADVANTAGES",
                        "TYPE" => "checkbox",
                        "CODE" => "advantages",
                        "PAGE_URL" => "/",
                        "VALUES" => array(
                            array(
                                "ID" => "",
                                "NAME" => Loc::getMessage("CONFIGURATOR_PROPERTY_NAME_SMALL_BANNER1"),
                                "VALUE" => "true",
                            ),
                        ),
                    ),
                    array(
                        "NAME" => Loc::getMessage("CONFIGURATOR_PROPERTY_NAME_SMALL_BANNER1"),
                        "PROPERTY_NAME" => "SMALL_BANNER1",
                        "TYPE" => "checkbox",
                        "CODE" => "small_banner1",
                        "PAGE_URL" => "/",
                        "VALUES" => array(
                            array(
                                "ID" => "",
                                "NAME" => Loc::getMessage("CONFIGURATOR_PROPERTY_VALUE_YES"),
                                "VALUE" => "true",
                            ),
                        ),
                    ),
                    array(
                        "NAME" => Loc::getMessage("CONFIGURATOR_PROPERTY_NAME_MAIN_NEWS_DISPLAY"),
                        "PROPERTY_NAME" => "NEWS",
                        "TYPE" => "checkbox",
                        "CODE" => "news",
                        "PAGE_URL" => "/",
                        "VALUES" => array(
                            array(
                                "ID" => "",
                                "NAME" => Loc::getMessage("CONFIGURATOR_PROPERTY_VALUE_YES"),
                                "VALUE" => "true",
                            ),
                        ),
                    ),
                    array(
                        "NAME" => Loc::getMessage("CONFIGURATOR_PROPERTY_NAME_SEO_TEXT"),
                        "PROPERTY_NAME" => "SEO_TEXT",
                        "TYPE" => "checkbox",
                        "CODE" => "seo_text",
                        "PAGE_URL" => "/",
                        "VALUES" => array(
                            array(
                                "ID" => "",
                                "NAME" => Loc::getMessage("CONFIGURATOR_PROPERTY_VALUE_YES"),
                                "VALUE" => "true",
                            ),
                        ),
                    ),
                    array(
                        "NAME" => Loc::getMessage("CONFIGURATOR_PROPERTY_NAME_SMALL_BANNER2"),
                        "PROPERTY_NAME" => "SMALL_BANNER2",
                        "TYPE" => "checkbox",
                        "CODE" => "small_banner2",
                        "PAGE_URL" => "/",
                        "VALUES" => array(
                            array(
                                "ID" => "",
                                "NAME" => Loc::getMessage("CONFIGURATOR_PROPERTY_VALUE_YES"),
                                "VALUE" => "true",
                            ),
                        ),
                    ),
                ),
            ),
            /*"HEADER" => array(
                "NAME" => Loc::getMessage("CONFIGURATOR_PROPERTY_GROUP_HEADER"),
                "PROPS" => array(
                    array(
                        "NAME" => Loc::getMessage("CONFIGURATOR_PROPERTY_NAME_HEADER_TYPE"),
                        "PROPERTY_NAME" => "HEADER_TYPE",
                        "TYPE" => "radio",
                        "CODE" => "header",
                        "PAGE_URL" => "/",
                        "VALUES" => array(
                            array(
                                "ID" => "",
                                "NAME" => Loc::getMessage("CONFIGURATOR_PROPERTY_HEADER_TYPE_VALUE_1"),
                                "VALUE" => "1",
                            ),
                            array(
                                "ID" => "",
                                "NAME" => Loc::getMessage("CONFIGURATOR_PROPERTY_HEADER_TYPE_VALUE_2"),
                                "VALUE" => "2",
                            ),
                            array(
                                "ID" => "",
                                "NAME" => Loc::getMessage("CONFIGURATOR_PROPERTY_HEADER_TYPE_VALUE_3"),
                                "VALUE" => "3",
                            ),
                        ),
                    ),
                )
            ),*/
            "CATALOG" => array(
                "NAME" => Loc::getMessage("CONFIGURATOR_PROPERTY_GROUP_CATALOG"),
                "PROPS" => array(
                    //---------------------------------------------------------
                    /*array(// ÏÎËÎÆÅÍÈÅ ÔÈËÜÒÐÀ
                        "NAME" => Loc::getMessage("CONFIGURATOR_PROPERTY_CATALOG_FILTER"),
                        "PROPERTY_NAME" => "FILTER",
                        "TYPE" => "radio",
                        "CODE" => "filter",
                        "PAGE_URL" => $this->getFirstSectionURL(),
                        "VALUES" => array(
                            array(
                                "ID" => "",
                                "NAME" => Loc::getMessage("CONFIGURATOR_PROPERTY_VALUE_HORIZONTAL"),
                                "VALUE" => "horizontal",
                            ),
                            array(
                                "ID" => "",
                                "NAME" => Loc::getMessage("CONFIGURATOR_PROPERTY_VALUE_VERTICAL"),
                                "VALUE" => "vertical",
                            )
                        ),
                    ),*/
                    array(//ÎÒÎÁÐÀÆÅÍÈß ÏËÈÒÊÀ
                        "NAME" => Loc::getMessage("CONFIGURATOR_PROPERTY_CATALOG_TILE"),
                        "PROPERTY_NAME" => "TILE",
                        "TYPE" => "checkbox",
                        "CODE" => "tile",
                        "PAGE_URL" => $this->getFirstSectionURL(),
                        "VALUES" => array(
                            array(
                                "ID" => "",
                                "NAME" => Loc::getMessage("CONFIGURATOR_PROPERTY_VALUE_YES"),
                                "VALUE" => "true",
                            )
                        ),
                    ),
                    array(//ÎÒÎÁÐÀÆÅÍÈß ÑÏÈÑÎÊ
                        "NAME" => Loc::getMessage("CONFIGURATOR_PROPERTY_CATALOG_LIST"),
                        "PROPERTY_NAME" => "LIST",
                        "TYPE" => "checkbox",
                        "CODE" => "list",
                        "PAGE_URL" => $this->getFirstSectionURL(),
                        "VALUES" => array(
                            array(
                                "ID" => "",
                                "NAME" => Loc::getMessage("CONFIGURATOR_PROPERTY_VALUE_YES"),
                                "VALUE" => "true",
                            )
                        ),
                    ),
                    array(//ÎÒÎÁÐÀÆÅÍÈß ÅÙÅ ÑÏÈÑÎÊ
                        "NAME" => Loc::getMessage("CONFIGURATOR_PROPERTY_CATALOG_LIST2"),
                        "PROPERTY_NAME" => "LIST2",
                        "TYPE" => "checkbox",
                        "CODE" => "list2",
                        "PAGE_URL" => $this->getFirstSectionURL(),
                        "VALUES" => array(
                            array(
                                "ID" => "",
                                "NAME" => Loc::getMessage("CONFIGURATOR_PROPERTY_VALUE_YES"),
                                "VALUE" => "true",
                            )
                        ),
                    ),
                    array(// ÁÀÍÍÅÐÛ  - ïåðåíåñòè íàâåðõ ñòðàíèöû (íàä òîâàðàìè)
                        "NAME" => Loc::getMessage("CONFIGURATOR_PROPERTY_CATALOG_BANNERS"),
                        "PROPERTY_NAME" => "BANNERS",
                        "TYPE" => "checkbox",
                        "CODE" => "banners",
                        "PAGE_URL" => $this->getFirstSectionURL(),
                        "VALUES" => array(
                            array(
                                "ID" => "",
                                "NAME" => Loc::getMessage("CONFIGURATOR_PROPERTY_VALUE_YES"),
                                "VALUE" => "true",
                            )
                        ),
                    )
                    //----------------------------------------------------------------------------
                )
            ),
            "DETAIL" => array(
                "NAME" => Loc::getMessage("CONFIGURATOR_PROPERTY_GROUP_DETAIL"),
                "PROPS" => array(
                    //--------------------------------------------
                    array(
                        "NAME" => Loc::getMessage("CONFIGURATOR_PROPERTY_DETAIL_BLOCK_ABOUT"),
                        "PROPERTY_NAME" => "BLOCK_ABOUT",
                        "TYPE" => "checkbox",
                        "CODE" => "block_about",
                        "PAGE_URL" => $this->getFirstElementURL(),
                        "VALUES" => array(
                            array(
                                "ID" => "",
                                "NAME" => Loc::getMessage("CONFIGURATOR_PROPERTY_VALUE_YES"),
                                "VALUE" => "true",
                            ),
                        ),
                    ),
                    array(
                        "NAME" => Loc::getMessage("CONFIGURATOR_PROPERTY_DETAIL_BLOCK_CHARACTERISTIC"),
                        "PROPERTY_NAME" => "BLOCK_CHARACTERISTIC",
                        "TYPE" => "checkbox",
                        "CODE" => "block_characteristic",
                        "PAGE_URL" => $this->getFirstElementURL(),
                        "VALUES" => array(
                            array(
                                "ID" => "",
                                "NAME" => Loc::getMessage("CONFIGURATOR_PROPERTY_VALUE_YES"),
                                "VALUE" => "true",
                            ),
                        ),
                    ),
                    array(
                        "NAME" => Loc::getMessage("CONFIGURATOR_PROPERTY_DETAIL_BLOCK_COMMENTS"),
                        "PROPERTY_NAME" => "BLOCK_COMMENTS",
                        "TYPE" => "checkbox",
                        "CODE" => "block_comments",
                        "PAGE_URL" => $this->getFirstElementURL(),
                        "VALUES" => array(
                            array(
                                "ID" => "",
                                "NAME" => Loc::getMessage("CONFIGURATOR_PROPERTY_VALUE_YES"),
                                "VALUE" => "true",
                            ),
                        ),
                    ),
                    array(
                        "NAME" => Loc::getMessage("CONFIGURATOR_PROPERTY_DETAIL_NEAR_RESTORANS"),
                        "PROPERTY_NAME" => "NEAR_RESTORANS",
                        "TYPE" => "checkbox",
                        "CODE" => "near_restorans",
                        "PAGE_URL" => $this->getFirstElementURL(),
                        "VALUES" => array(
                            array(
                                "ID" => "",
                                "NAME" => Loc::getMessage("CONFIGURATOR_PROPERTY_VALUE_YES"),
                                "VALUE" => "true",
                            ),
                        ),
                    ),
                    array(
                        "NAME" => Loc::getMessage("CONFIGURATOR_PROPERTY_DETAIL_RECOMENDS_TO_BUY"),
                        "PROPERTY_NAME" => "RECOMENDS_TO_BUY",
                        "TYPE" => "checkbox",
                        "CODE" => "recomends_to_buy",
                        "PAGE_URL" => $this->getFirstElementURL(),
                        "VALUES" => array(
                            array(
                                "ID" => "",
                                "NAME" => Loc::getMessage("CONFIGURATOR_PROPERTY_VALUE_YES"),
                                "VALUE" => "true",
                            ),
                        ),
                    ),
                    array(
                        "NAME" => Loc::getMessage("CONFIGURATOR_PROPERTY_DETAIL_PERSONAL_RECOMEND"),
                        "PROPERTY_NAME" => "PERSONAL_RECOMEND",
                        "TYPE" => "checkbox",
                        "CODE" => "personal_recomend",
                        "PAGE_URL" => $this->getFirstElementURL(),
                        "VALUES" => array(
                            array(
                                "ID" => "",
                                "NAME" => Loc::getMessage("CONFIGURATOR_PROPERTY_VALUE_YES"),
                                "VALUE" => "true",
                            ),
                        ),
                    ),
                    array(
                        "NAME" => Loc::getMessage("CONFIGURATOR_PROPERTY_DETAIL_YOU_SEE"),
                        "PROPERTY_NAME" => "YOU_SEE",
                        "TYPE" => "checkbox",
                        "CODE" => "you_see",
                        "PAGE_URL" => $this->getFirstElementURL(),
                        "VALUES" => array(
                            array(
                                "ID" => "",
                                "NAME" => Loc::getMessage("CONFIGURATOR_PROPERTY_VALUE_YES"),
                                "VALUE" => "true",
                            ),
                        ),
                    )
                    //-------------------------------------------------
                )
            ),
            "CONTACTS" => array(
                "NAME" => Loc::getMessage("CONFIGURATOR_PROPERTY_GROUP_CONTACTS"),
                "PROPS" => array(
                    array(
                        "NAME" => Loc::getMessage("CONFIGURATOR_PROPERTY_MAP_DISPLAY"),
                        "PROPERTY_NAME" => "MAP_TYPE",
                        "TYPE" => "radio",
                        "CODE" => "map_type",
                        "PAGE_URL" => '/about/contacts/',
                        "VALUES" => array(
                            array(
                                "ID" => "",
                                "NAME" => Loc::getMessage("CONFIGURATOR_PROPERTY_MAP_GOOGLE"),
                                "VALUE" => "google",
                            ),
                            array(
                                "ID" => "",
                                "NAME" => Loc::getMessage("CONFIGURATOR_PROPERTY_MAP_YANDEX"),
                                "VALUE" => "yandex",
                            ),
                        ),
                    ),
                )
            ),
        );
    }

    public static function setOption($opt, $val)
    {
        if (self::modeDefinition() == "demo") {
            $_SESSION['SITE_PARAMS'][$opt] = $val;
        } else {
            \Bitrix\Main\Config\Option::set(self::moduleID, $opt, $val, SITE_ID);
        }
    }

    public static function getOption($opt)
    {
        if (self::modeDefinition() == "demo") {
            if (!empty($_SESSION['SITE_PARAMS'][$opt]) & isset($_SESSION['SITE_PARAMS'][$opt])) {
                return $_SESSION['SITE_PARAMS'][$opt];
            } else {
                return self::default_opt[$opt];
            }
        } else {
            return \Bitrix\Main\Config\Option::get(self::moduleID, $opt, self::default_opt[$opt], SITE_ID);
        }
    }

    public function getCurrentOptions()
    {
        $currentOptions = array();
        foreach($this->params as $props_group){
            foreach($props_group["PROPS"] as $prop){
                $currentOptions[$prop["PROPERTY_NAME"]] = $this::getOption($prop["PROPERTY_NAME"]);
            }
        }
        return $currentOptions;
    }

}

