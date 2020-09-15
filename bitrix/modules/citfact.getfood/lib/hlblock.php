<?php

namespace Citfact\Getfood;

use Bitrix\Main\Loader;
use Bitrix\Highloadblock as HL;

/**
 * Работа с highloadblock
 */
class HLBlock
{
	/**
	 * Возвращает все поля таблицы
	 * @param $tableName
	 * @return array|null
	 */
	public static function getAllRows($tableName)
	{
		Loader::includeModule('highloadblock');

		$highBlock = HL\HighloadBlockTable::getList([
			'filter' => [
				'TABLE_NAME' => $tableName
			]
		])->fetch();

		if (isset($highBlock['ID']) && !empty($highBlock['ID']))
		{
			$entity = HL\HighloadBlockTable::compileEntity($highBlock);
			$entityDataClass = $entity->getDataClass();
			$entityList = $entityDataClass::getList();

			$arEntityItemResult = [];
			while ($arEntityItem = $entityList->Fetch())
			{
				if (!empty($arEntityItem['UF_FILE']))
				{
					$property['PICTURE_INCLUDED'] = true;
					$arEntityItem['~UF_FILE'] = $arEntityItem['UF_FILE'];
					$arEntityItem['PICTURE'] = \CFile::GetPath($arEntityItem['~UF_FILE']);
				}

				$arEntityItemResult[$arEntityItem['UF_XML_ID']] = $arEntityItem;
			}

			return $arEntityItemResult;
		}

		return null;
	}
}