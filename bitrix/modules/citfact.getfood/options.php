<?
$module_id = 'citfact.getfood';

require_once($_SERVER['DOCUMENT_ROOT'].'/bitrix/modules/'.$module_id.'/include.php');
IncludeModuleLangFile($_SERVER['DOCUMENT_ROOT'].'/bitrix/modules/'.$module_id.'/options.php');

$showRightsTab = true;

$arTabs = array(
	array(
		'DIV' => 'edit1',
		'TAB' => 'Настройки',
		'ICON' => '',
		'TITLE' => 'Настройки'
	)
);

$arGroups = array(
	'MAIN' => array('TITLE' => 'Имя группы', 'TAB' => 0)
);

$arOptions = array(
	'SITE_NAME' => array(
		'GROUP' => 'MAIN',
		'TITLE' => 'Название сайта',
		'TYPE' => 'STRING',
		'DEFAULT' => '',
		'SORT' => '0',
		'NOTES' => 'Используется в микроразметке'
	)
);

/*
Конструктор класса CModuleOptions
$module_id - ID модуля
$arTabs - массив вкладок с параметрами
$arGroups - массив групп параметров
$arOptions - собственно сам массив, содержащий параметры
$showRightsTab - определяет надо ли показывать вкладку с настройками прав доступа к модулю ( true / false )
*/

$opt = new CModuleOptions($module_id, $arTabs, $arGroups, $arOptions, $showRightsTab);
$opt->ShowHTML();