<?php

namespace Citfact\Getfood;

class Iblock
{
	/**
	 * Возвращает Id раздела
	 * @param $id
	 * @param int $iblock_id
	 * @return int
	 */
	public static function getSectionIdByElementId($id, $iblock_id = 0)
	{
		$arFilter = ['ID' => $id];
		if ($iblock_id)
		{
			$arFilter['IBLOCK_ID'] = $iblock_id;
		}

		$arElement = \CIBlockElement::GetList(
			[],
			$arFilter,
			false,
			false,
			['IBLOCK_SECTION_ID']
		)->Fetch();

		return !empty($arElement['IBLOCK_SECTION_ID']) ? $arElement['IBLOCK_SECTION_ID'] : 0;
	}
}
