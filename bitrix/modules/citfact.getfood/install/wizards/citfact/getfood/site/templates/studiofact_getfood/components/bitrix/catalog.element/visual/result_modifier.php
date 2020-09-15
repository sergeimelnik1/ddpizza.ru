<? if (!defined('B_PROLOG_INCLUDED') || B_PROLOG_INCLUDED !== true) die();

use Citfact\Getfood\Image;

/**
 * @var CBitrixComponentTemplate $this
 * @var CatalogElementComponent $component
 */

$component = $this->getComponent();
$arParams = $component->applyTemplateModifications();

// ID ��������� ��������� �����������
if (!isset($arResult['OFFERS_IBLOCK'])) {
	$arSKU = CCatalogSku::GetInfoByProductIBlock($arParams['IBLOCK_ID']);
	$arResult['OFFERS_IBLOCK'] = $arSKU['IBLOCK_ID'];
}


/**
 * ��������� �����������
 */

Image::resizeCatalogElement($arResult, 960, 960);


/**
 * ������ �������
 */

if ($arResult['SECTION']['DETAIL_PICTURE']) // ������� ������
{
	$arResult['SECTION_DETAIL_PICTURE'] = CFile::GetPath($arResult['SECTION']['DETAIL_PICTURE']);
}
else // ������� �������
{
	// ID ��������
	$arSectionIds = [];
	foreach ($arResult['SECTION']['PATH'] as $arSection)
	{
		$arSectionIds[] = $arSection['ID'];
	}

	// ���������� �������� �������
	$arSectionIds = array_diff($arSectionIds, [$arResult['SECTION']['ID']]);

	$dbSection = CIBlockSection::GetList(
		[
			'ID' => 'DESC'
		],
		[
			'IBLOCK_ID' => $arParams['IBLOCK_ID'],
			'ID' => $arSectionIds
		],
		false,
		['DETAIL_PICTURE']
	);

	while ($rsSection = $dbSection->Fetch())
	{
		if ($rsSection['DETAIL_PICTURE'])
		{
			$arResult['SECTION_DETAIL_PICTURE'] = CFile::GetPath($rsSection['DETAIL_PICTURE']);
			break;
		}
	}
}