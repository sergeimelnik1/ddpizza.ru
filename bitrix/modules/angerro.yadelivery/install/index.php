<?
require_once($_SERVER['DOCUMENT_ROOT'] . "/bitrix/modules/angerro.yadelivery/install/components/angerro/angerro.yadelivery/classes/main.php");
IncludeModuleLangFile($_SERVER['DOCUMENT_ROOT'] . "/bitrix/modules/angerro.yadelivery/lang/ru/install/index.php");

Class angerro_yadelivery extends CModule
{
    var $MODULE_ID = "angerro.yadelivery";
    var $MODULE_VERSION;
    var $MODULE_VERSION_DATE;
    var $MODULE_NAME;
    var $MODULE_DESCRIPTION;
    var $MODULE_CSS;
    var $DB;
//        var $MODULE_GROUP_RIGHTS = "Y";

    function angerro_yadelivery()
    {
        $this->DB = new angerro_yadelivery_db();
        
        $arModuleVersion = array();

        $path = str_replace("\\", "/", __FILE__);
        $path = substr($path, 0, strlen($path) - strlen("/index.php"));
        include($path."/version.php");

        if (is_array($arModuleVersion) && array_key_exists("VERSION", $arModuleVersion))
        {
            $this->MODULE_VERSION = $arModuleVersion["VERSION"];
            $this->MODULE_VERSION_DATE = $arModuleVersion["VERSION_DATE"];
        }
        else
        {
            $this->MODULE_VERSION = "1.0.0";
            $this->MODULE_VERSION_DATE = "2016-06-27 11:00:00";
        }

        $this->MODULE_NAME = GetMessage('MODULE_NAME');
        $this->MODULE_DESCRIPTION = GetMessage('MODULE_NAME');

        $this->PARTNER_NAME = "angerro";
        $this->PARTNER_URI = "http://web-finder.ru";
    }
    function InstallFiles($arParams = array())
    {
        CopyDirFiles($_SERVER["DOCUMENT_ROOT"]."/bitrix/modules/angerro.yadelivery/install/components",
            $_SERVER["DOCUMENT_ROOT"]."/bitrix/components", true, true);
        CopyDirFiles($_SERVER["DOCUMENT_ROOT"]."/bitrix/modules/angerro.yadelivery/install/js",
            $_SERVER["DOCUMENT_ROOT"]."/bitrix/js", true, true);
        return true;
    }

    function UnInstallFiles()
    {
        DeleteDirFilesEx("/bitrix/components/angerro/angerro.yadelivery");
        DeleteDirFilesEx("/bitrix/js/angerro/angerro.yadelivery");
        return true;
    }

    function DoInstall()
    {
        global $DOCUMENT_ROOT, $APPLICATION;
        $this->InstallFiles();
        RegisterModule("angerro.yadelivery");

        //создаём таблицу angerro_yadelivery
        $this->DB->install_main_table();
        //добавляем демо данные
        $this->DB->add_demo_data();

        //показываем уведомление об успешной установке
        $APPLICATION->IncludeAdminFile(GetMessage('INSTALL_MODULE_TEXT'), $DOCUMENT_ROOT."/bitrix/modules/angerro.yadelivery/install/step.php");
    }

    function DoUninstall()
    {
        global $DOCUMENT_ROOT, $APPLICATION;
        $this->UnInstallFiles();
        UnRegisterModule("angerro.yadelivery");

        //убиваем таблицу angerro_yadelivery
        $this->DB->unistall_main_table();

        //показываем уведомление об успешной деинсталяции
        $APPLICATION->IncludeAdminFile(GetMessage('UNISTALL_MODULE_TEXT'), $DOCUMENT_ROOT."/bitrix/modules/angerro.yadelivery/install/unstep.php");
    }
}
?>