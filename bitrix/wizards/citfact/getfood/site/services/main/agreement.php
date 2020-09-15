<?
if(!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED!==true)
    die();

CModule::IncludeModule('main');

use Bitrix\Main\UserConsent\Agreement;
use Bitrix\Main\UserConsent\Intl;
use Bitrix\Main\UserConsent\Internals\FieldTable;

function debug_log($val){
//    file_put_contents($_SERVER["DOCUMENT_ROOT"] . '/setup_log.txt', print_r($val, true) . "\n", FILE_APPEND);
};

debug_log("1. class_exists(\\Bitrix\\Main\\UserConsent\\Agreement)");
debug_log(class_exists('\Bitrix\Main\UserConsent\Agreement'));
if(class_exists('\Bitrix\Main\UserConsent\Agreement')){

    $typeNames = \Bitrix\Main\UserConsent\Agreement::getActiveList();
    $agr_name = 'citfact_' . WIZARD_SITE_ID;
    $agr_id = array_search($agr_name, $typeNames);

    debug_log("2. agr_id");
    debug_log($agr_id);
    if($agr_id === false){
        $agr = new \Bitrix\Main\UserConsent\Agreement(false);
        $data = array(
            'NAME' => $agr_name,
            'TYPE' => 'S',
            'LANGUAGE_ID' => 'ru',
            'FIELDS' => array('COMPANY_NAME' => GetMessage("AGREEMENT_COMPANY_NAME"), 'COMPANY_ADDRESS' => GetMessage("AGREEMENT_COMPANY_ADDR"), 'EMAIL' => 'magazin@mail.ru'),
        );
        $agr->mergeData($data);
        $agr->save();
        $typeNames = \Bitrix\Main\UserConsent\Agreement::getActiveList();
        $agr_id = array_search($agr_name, $typeNames);
        debug_log("2. agr_id");
        debug_log($agr_id);
    }
    if($agr_id){
        if(!file_exists(WIZARD_SITE_PATH . '/include/agreement')){
            CopyDirFiles(
                WIZARD_ABSOLUTE_PATH . "/site/public/" . LANGUAGE_ID . "/include/agreement",
                WIZARD_SITE_PATH . "/include/agreement",
                $rewrite = false,
                $recursive = true,
                $delete_after_copy = false
            );
        }
        $bitrixTemplateDir = $_SERVER["DOCUMENT_ROOT"].BX_PERSONAL_ROOT."/templates/studiofact_getfood";
        CWizardUtil::ReplaceMacrosRecursive(WIZARD_SITE_PATH."/personal/", Array("USER_CONSENT_ID" => $agr_id));
        CWizardUtil::ReplaceMacrosRecursive(WIZARD_SITE_PATH."/include/", Array("USER_CONSENT_ID" => $agr_id));
        CWizardUtil::ReplaceMacrosRecursive($bitrixTemplateDir, Array("USER_CONSENT_ID" => $agr_id));
    }
}
