<?php

use Bitrix\Main\Localization\Loc;
use Bitrix\Main\ModuleManager;
use Bitrix\Main\IO\Directory;

Loc::loadMessages(__FILE__);

class goldencode_rkeeperdelivery extends CModule
{
	var $MODULE_ID = 'goldencode.rkeeperdelivery';
	var $MODULE_NAME;
	var $MODULE_DESCRIPTION;
	var $FILES_FOLDER;

	public function __construct()
	{
		$arModuleVersion = array();

		include __DIR__ . '/version.php';

		if (is_array($arModuleVersion) && array_key_exists('VERSION', $arModuleVersion))
		{
			$this->MODULE_VERSION = $arModuleVersion['VERSION'];
			$this->MODULE_VERSION_DATE = $arModuleVersion['VERSION_DATE'];
		}

		$this->MODULE_ID = 'goldencode.rkeeperdelivery';
		$this->MODULE_NAME = Loc::getMessage('GC_RKEEPER_DELIVERY_MODULE_NAME');
		$this->MODULE_DESCRIPTION = Loc::getMessage('GC_RKEEPER_DELIVERY_MODULE_DESCRIPTION');
		$this->MODULE_GROUP_RIGHTS = 'N';
		$this->PARTNER_NAME = Loc::getMessage('GC_RKEEPER_DELIVERY_MODULE_PARTNER_NAME');
		$this->PARTNER_URI = 'http://zolotoykod.ru';
		$this->FILES_FOLDER = __DIR__."/files";
	}

	public function DoInstall()
	{
		ModuleManager::registerModule($this->MODULE_ID);

		// Enable old events
		COption::SetOptionString("sale", "expiration_processing_events", 'Y');
		\Bitrix\Main\Config\Option::set("main", "~sale_converted_15", 'N');

		// Register event handler
		RegisterModuleDependences("sale", "OnOrderSave", $this->MODULE_ID, "Goldencode\\RKeeperDelivery", "DeliveryOrder");

		//$this->InstallFiles();
		//$this->createUserField();
	}

	public function DoUninstall()
	{
		//$this->UnInstallFiles();
		//$this->deleteUserField();
		UnRegisterModuleDependences("sale", "OnOrderSave", $this->MODULE_ID, "Goldencode\\RKeeperDelivery", "DeliveryOrder");
		ModuleManager::unregisterModule($this->MODULE_ID);
	}

	public function createUserField () {
		$oUserTypeEntity = new CUserTypeEntity();

		$aUserFields = array(
			'ENTITY_ID' => 'USER',
			'FIELD_NAME' => 'UF_GC_RKEEPER_DELIVERY_CARD',
			'USER_TYPE_ID' => 'string',
			'XML_ID' => 'XML_ID_USER_CARD',
			'SORT' => 100,
			'MULTIPLE' => 'N',
			'MANDATORY' => 'N',
			'SHOW_FILTER' => 'N',
			'SHOW_IN_LIST' => '',
			'EDIT_IN_LIST' => '',
			'IS_SEARCHABLE' => 'N',
			'SETTINGS' => array(
				'DEFAULT_VALUE' => '',
				'SIZE' => '20',
				'ROWS' => '1',
				'MIN_LENGTH' => '0',
				'MAX_LENGTH' => '0',
				'REGEXP' => '',
			),
			'EDIT_FORM_LABEL' => array(
				'ru' => 'Номер карты',
				'en' => 'Card number',
			),
			'LIST_COLUMN_LABEL' => array(
				'ru' => 'Номер карты',
				'en' => 'Card number',
			),
			'LIST_FILTER_LABEL' => array(
				'ru' => 'Номер карты',
				'en' => 'Card number',
			),
			'ERROR_MESSAGE' => array(
				'ru' => 'Ошибка при заполнении пользовательского свойства',
				'en' => 'An error in completing the user field',
			),
			'HELP_MESSAGE' => array(
				'ru' => '',
				'en' => '',
			),
		);

		$iUserFieldId = $oUserTypeEntity->Add( $aUserFields );
	}

	public function deleteUserField () {
		$oUserTypeEntity    = new CUserTypeEntity();
		$UF_GC_RKEEPER_DELIVERY_CARD = $oUserTypeEntity->GetList(array(), array('ENTITY_ID' => 'USER', 'FIELD_NAME' => 'UF_GC_RKEEPER_DELIVERY_CARD'));
		while($arRes = $UF_GC_RKEEPER_DELIVERY_CARD->Fetch()) {
			$oUserTypeEntity->Delete($arRes["ID"]);
		}
	}

	public function copyFiles ($from) {
		if ($from == "." || $from == "..")
			return false;

		if ($from == "components")
			$to = $_SERVER['DOCUMENT_ROOT'].'/bitrix/components';
		else
			$to = $_SERVER['DOCUMENT_ROOT'].'/'.$from;

		$from = $this->FILES_FOLDER . '/' . $from;

		if (is_dir($from) && $dir = opendir($from)) {
			while (false !== $item = readdir($dir)) {
				if ($item == '..' || $item == '.')
					continue;

				CopyDirFiles($from.'/'.$item, $to.'/'.$item, $ReWrite = true, $Recursive = true);
			}
			closedir($dir);
		}

		return true;
	}

	public function removeFiles ($from) {
		if ($from == "." || $from == "..")
			return false;

		$remove = array();
		if ($from == "components") {
			$partners = scandir($this->FILES_FOLDER . '/components');

			foreach ($partners as $partner) {
				if ($partner !== "." && $partner !== "..") {
					$components = scandir($this->FILES_FOLDER . '/components/'.$partner);

					foreach ($components as $component)
						if ($component !== "." && $component !== "..")
							$remove[] = $_SERVER['DOCUMENT_ROOT'].'/bitrix/components/'.$partner.'/'.$component;
				}
			}
		} else {
			$remove[] = $_SERVER['DOCUMENT_ROOT'].'/'.$from;
		}

		foreach ($remove as $folder) {
			$dir = new Directory($folder);
			$dir->delete();
		}

		return true;
	}

	function InstallFiles($arParams = array())
	{
		$files = scandir($this->FILES_FOLDER);

		foreach ($files as $dir) {
			$this->copyFiles($dir);
		}

		return true;
	}

	function UnInstallFiles()
	{
		$files = scandir($this->FILES_FOLDER);

		foreach ($files as $dir) {
			$this->removeFiles($dir);
		}

		return true;
	}
}
