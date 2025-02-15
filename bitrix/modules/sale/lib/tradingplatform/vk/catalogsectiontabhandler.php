<?php

namespace Bitrix\Sale\TradingPlatform\Vk;

use Bitrix\Main\Localization\Loc;
use Bitrix\Main\SystemException;
use Bitrix\Sale\TradingPlatform\TabHandler;
use Bitrix\Main\Text\HtmlFilter;

Loc::loadMessages(__FILE__);


/**
 * Class CatalogSectionTabHandler
 * Work with iblock section / catalog category edit page.
 * @package Bitrix\Sale\TradingPlatform\Vk
 */
class CatalogSectionTabHandler extends TabHandler
{
	protected static $vkCategoriesVariations = array();
	protected static $vkRequiredVariations = array();
	protected $section = array();

	/**
	 * CatalogSectionTabHandler constructor.
	 */
	public function __construct()
	{
		$this->name = Loc::getMessage("SALE_VK_NAME");
		$this->description = Loc::getMessage("SALE_VK_DESCRIPTION");
	}

	/**
	 * Save POST data
	 *
	 * @param $arArgs
	 * @return bool
	 */
	public function action($arArgs)
	{
		$sectionId = $arArgs["ID"];
		$vk = Vk::getInstance();
		$exportProfiles = $vk->getExportProfilesList();

		foreach ($exportProfiles as $export)
		{
			$dataToMapping = array();
			$dataToDelete = array();

			$sectionsList = new SectionsList($export["ID"]);
//			in moment of changes setting we must drop cached sections and mapped sections
			$sectionsList->clearCaches();
			$sectionsList->setCurrSectionSettings($_POST['VK_EXPORT'][$export["ID"]]);

//			formatted or remove current section
			$preparedSection = $sectionsList->prepareSectionToSave($sectionId);
			$dataToMapping += $preparedSection['TO_SAVE'] ? $preparedSection['TO_SAVE'] : array();
			$dataToDelete += $preparedSection['TO_DELETE'] ? $preparedSection['TO_DELETE'] : array();

//			save or remove childs
			$preparedChilds = $sectionsList->prepareChildsToSave($sectionId);
			$dataToMapping += $preparedChilds['TO_SAVE'] ? $preparedChilds['TO_SAVE'] : array();
			$dataToDelete += $preparedChilds['TO_DELETE'] ? $preparedChilds['TO_DELETE'] : array();

			if (!empty($dataToMapping))
			{
				Map::updateSectionsMapping($dataToMapping, $export["ID"], 'ONLY_INTERNAL');
			}

			if (!empty($dataToDelete))
			{
				Map::removeSectionsMapping($dataToDelete, $export["ID"], 'ONLY_INTERNAL');
			}
		}
		
		return true;
	}
	
	
	/**
	 * Check POST values
	 *
	 * @param $arArgs
	 * @return bool
	 * @throws SystemException
	 */
	public function check($arArgs)
	{
		$vk = Vk::getInstance();
		$exports = $vk->getExportProfilesList();
		$errors = array();
		
		foreach ($exports as $export)
		{
			$currErrors = array();
//			all VK-errors can be only if export ENABLE
			if (isset($_POST['VK_EXPORT'][$export["ID"]]["ENABLE"]) && $_POST['VK_EXPORT'][$export["ID"]]["ENABLE"])
			{
//				wrong section
				if (isset($_POST['VK_EXPORT'][$export["ID"]]["TO_ALBUM"]) && $_POST['VK_EXPORT'][$export["ID"]]["TO_ALBUM"] < 0)
				{
					$currErrors[] = Loc::getMessage("SALE_VK_EXPORT_SETTINGS__ERROR_WRONG_ALBUM");
					unset($_POST['VK_EXPORT'][$export["ID"]]["TO_ALBUM"]);
				}

//				section is selected, but alias is empty
				if (
					isset($_POST['VK_EXPORT'][$export["ID"]]["TO_ALBUM"]) && $_POST['VK_EXPORT'][$export["ID"]]["TO_ALBUM"] > 0 &&
					$_POST['VK_EXPORT'][$export["ID"]]["TO_ALBUM"] == $_POST['VK_EXPORT'][$export["ID"]]["TO_ALBUM_CURRENT"] &&
					strlen($_POST['VK_EXPORT'][$export["ID"]]["TO_ALBUM_ALIAS"]) < 2
				)
				{
					$currErrors[] = Loc::getMessage("SALE_VK_EXPORT_SETTINGS__ERROR_EMPTY_ALIAS");
					unset($_POST['VK_EXPORT'][$export["ID"]]["TO_ALBUM_ALIAS"]);
				}
				
				if (isset($_POST['VK_EXPORT'][$export["ID"]]["VK_CATEGORY"]) && $_POST['VK_EXPORT'][$export["ID"]]["VK_CATEGORY"] == 0)
				{
					$currErrors[] = Loc::getMessage("SALE_VK_EXPORT_SETTINGS__ERROR_WRONG_VK_CATEGORY");
					unset($_POST['VK_EXPORT'][$export["ID"]]["VK_CATEGORY"]);
				}
			}
			
			if (!empty($currErrors))
				$errors[] =
					Loc::getMessage("SALE_VK_EXPORT_PROFILE") .
					'"' . HtmlFilter::encode($export['DESC']) . '": <br>' .
					implode('<br>', $currErrors);
		}
		
		if (!empty($errors))
			throw new SystemException(implode('<br><br>', $errors));
		
		return true;
	}
	
	
	/**
	 * Format HTML for showing. Return HTML string.
	 *
	 * @param $divName
	 * @param $arArgs
	 * @param $bVarsFromForm
	 * @return string
	 */
	public function showTabSection($divName, $arArgs, $bVarsFromForm)
	{
//		ONLY RUSSIAN!!!
//		todo: translate to other language
		if (defined('LANG') && LANG != 'ru')
		{
			$resultHtml = '<tr><td colspan="2">';
			$resultHtml .= BeginNote();
			$resultHtml .= '<p>' . Loc::getMessage("SALE_VK_ONLY_RUSSIAN") . '</p>';
			$resultHtml .= '<p>' . Loc::getMessage("SALE_VK_ONLY_RUSSIAN_2") . '</p>';
			$resultHtml .= '<img src="/bitrix/images/sale/vk/vk_only_russian.png" alt="">';
			$resultHtml .= EndNote();
			$resultHtml .= '</td></tr>';
			
			return $resultHtml;
		}
		
		$resultHtml = "";
		
		$iblockId = $arArgs["IBLOCK"]["ID"];
		$sectionId = $arArgs["ID"];

//		test current section activity (if new - we have not ID and cant set settings)
		if ($sectionId <= 0)
			return '<tr><td colspan="2">' . Loc::getMessage("SALE_VK_NEED_SAVE_SECTION") . '</td></tr>';

//		if we not have exports profiles - we cant sdave settings
		$vk = Vk::getInstance();
		$exports = $vk->getExportProfilesList();
		if (empty($exports))
			return
				'<tr><td colspan="2">' .
				Loc::getMessage("SALE_VK_NEED_EXPORT_PROFILE", array('#A1' => '/bitrix/admin/sale_vk_export_list.php')) .
				'</td></tr>';


//		----------- PRINT ------------
//		------------------------------
		$resultHtml .= '<tr><td colspan="2">';
		$resultHtml .= '
				<table class="internal" id="table_EXPORT_PROFILES"
				style="border-left: none !important; border-right: none !important;">';
		
		$resultHtml .= '
			<tr
				id="tr_HEADING"
				class="heading"
				mode="flat"
				prop_sort="-1"
				prop_id="0"
				left_margin="-1"
					>
				<td align="left" class="internal-left">' . Loc::getMessage("SALE_VK_EXPORT_SETTINGS__EXPORT_ID") . '</td>
				<td>' . Loc::getMessage("SALE_VK_EXPORT_SETTINGS__INHERIT") . '</td>
				<td>' . Loc::getMessage("SALE_VK_EXPORT_SETTINGS__ENABLE") . '</td>
				<td align="left">' .
			Loc::getMessage("SALE_VK_EXPORT_SETTINGS__TO_ALBUM") .
			ShowJSHint(Loc::getMessage("SALE_VK_EXPORT_SETTINGS__TO_ALBUM_HELP"), array('return'=>true)) . '
				</td>
				<td align="left">' . Loc::getMessage("SALE_VK_EXPORT_SETTINGS__TO_ALBUM_ALIAS") . '</td>
				<td>' .
			Loc::getMessage("SALE_VK_EXPORT_SETTINGS__INCLUDE_CHILDS") .
			ShowJSHint(Loc::getMessage("SALE_VK_EXPORT_SETTINGS__INCLUDE_CHILDS_HELP"), array('return'=>true)) . '
				</td>
				<td align="left" class="internal-right">' .
			Loc::getMessage("SALE_VK_CATEGORY_SELECTOR") .
			ShowJSHint(Loc::getMessage("SALE_VK_CATEGORY_SELECTOR_HELP"), array('return'=>true)) . '
				</td>
			</tr>';
		
		foreach ($exports as $export)
		{
			$sectionsList = new SectionsList($export['ID']);
			$currSettings = $sectionsList->prepareSectionToShow($sectionId);
//			load values from post, if page will be reload (e.g. if error)
			$currSettings = $this->compareSettingsWithPost($currSettings, $export["ID"]);
			$currSettings = $sectionsList->prepareSettingsVisibility($currSettings, $sectionId);

			$resultHtml .= '<tr id="tr_EXPORT__' . $export["ID"] . '" mode="both" left_margin="124" >';

//			EXPORT settings - profile
			$resultHtml .= '
			<td class="internal-left">
				<span>' . HtmlFilter::encode($export["DESC"]) . '</span>
				<input 
					class="vk_export__profile_id" 
					type="hidden" 
					name="VK_EXPORT[' . $export["ID"] . '][ID]" 
					value ="' . $export["ID"] . '" />
			</td>';

//			INHERIT from parent
			$resultHtml .= '
			<td align="center">
				<input ' . $currSettings["INHERIT"] . $currSettings['INHERIT__DISPLAY'] . '
					id="vk_export_inherit_' . $export["ID"] . '"
					type="checkbox" 
					name="VK_EXPORT[' . $export["ID"] . '][INHERIT]" 
					value="1">
			</td>';

//			ENDABLE export
			$resultHtml .= '
			<td align="center">
				<input ' . $currSettings["ENABLE"] . $currSettings["ENABLE__DISPLAY"] . '
					id="vk_export_enable_' . $export["ID"] . '" 
					type="checkbox" 
					name="VK_EXPORT[' . $export["ID"] . '][ENABLE]" 
					value="1">
				<input type="hidden" name="VK_EXPORT[' . $export["ID"] . '][IBLOCK]" value="' . $iblockId . '">
				<input type="hidden" id="vk_export_enable_parent_' . $export["ID"] . '"  value="' . $currSettings["ENABLE__PARENT"] . '">
			</td>';

//			TO ALBUM
			$sectionsSelector = $sectionsList->getSectionsSelector($currSettings["TO_ALBUM"]);
			$resultHtml .= '
			<td>
				<input 
					type="hidden" 
					id="vk_export_to_album_current_' . $export["ID"] . '" 
					name="VK_EXPORT[' . $export["ID"] . '][TO_ALBUM_CURRENT]" 
					value="' . $sectionId . '">
				<input type="hidden" id="vk_export_to_album_parent_' . $export["ID"] . '"  value="' . $currSettings["TO_ALBUM__PARENT"] . '">

				<select ' . $currSettings["TO_ALBUM__DISPLAY"] . '
					id="vk_export_to_album_' . $export["ID"] . '" 
					class="vk_sale_export_category_to_album" 
					name="VK_EXPORT[' . $export["ID"] . '][TO_ALBUM]">' .
				$sectionsSelector . '
				</select>
			</td>';

//			album ALIAS
			$resultHtml .= '
			<td>
				<input ' . $currSettings["TO_ALBUM_ALIAS__DISPLAY"] . ' 
					id="vk_export_to_album_alias_' . $export["ID"] . '" 
					type="text" 
					name="VK_EXPORT[' . $export["ID"] . '][TO_ALBUM_ALIAS]" 
					size="25" maxlength="255" 
					value="' . $currSettings["TO_ALBUM_ALIAS"] . '"
				>
				<input type="hidden" id="vk_export_to_album_alias_parent_' . $export["ID"] . '" value="' . $currSettings["TO_ALBUM_ALIAS__PARENT"] . '">

			</td>';

//			include CHILDS
			$resultHtml .= '
			<td align="center">
				<input ' . $currSettings["INCLUDE_CHILDS__DISPLAY"] . $currSettings["INCLUDE_CHILDS"] . ' 
					id="vk_export_include_childs_' . $export["ID"] . '" 
					type="checkbox" 
					name="VK_EXPORT[' . $export["ID"] . '][INCLUDE_CHILDS]" 
					value="1"
				>
				<input type="hidden" id="vk_export_include_childs_parent_' . $export["ID"] . '" value="' . $currSettings["INCLUDE_CHILDS__PARENT"] . '">

			</td>';

//			categories SELECTOR
			$categoriesVk = new VkCategories($export["ID"]);
			$vkCategorySelector = $categoriesVk->getVkCategorySelector($currSettings["VK_CATEGORY"], Loc::getMessage('SALE_VK_CATEGORY_SELECTOR_DEFAULT'));
			$resultHtml .= '
			<td class="internal - right">
				<select ' . $currSettings["VK_CATEGORY__DISPLAY"] . '
					id="vk_export_vk_category_' . $export["ID"] . '" 
					name="VK_EXPORT[' . $export["ID"] . '][VK_CATEGORY]">' .
				$vkCategorySelector . '
				</select>
				<input type="hidden" id="vk_export_vk_category_parent_' . $export["ID"] . '"  value="' . $currSettings["VK_CATEGORY__PARENT"] . '">
			</td>';
			
			$resultHtml .= '</tr>';
		}    //end foreach
		
		$resultHtml .= '</table>';
		$resultHtml .= BeginNote() . Loc::getMessage("SALE_VK_CATEGORY_INTRO") . EndNote();
		$resultHtml .= '</td></tr>';


//		SCRIPTS for beauty
		$resultHtml .= "
			<script type=\"text/javascript\">
				BX.ready(function(){
				
					var exportIds = BX.findChild(BX('table_EXPORT_PROFILES'), {class: 'vk_export__profile_id'}, true, true);
					exportIds.forEach(function(element){
						var exportId = element.getAttribute('value');
					
						var items = new Array();
						items.vkExportInherit = BX('vk_export_inherit_' + exportId);
						items.vkExportEnable = BX('vk_export_enable_' + exportId);
						items.vkExportEnableParent = BX('vk_export_enable_parent_' + exportId);
						items.vkExportToAlbumCurrent = BX('vk_export_to_album_current_' + exportId);
						items.vkExportToAlbum = BX('vk_export_to_album_' + exportId);
						items.vkExportToAlbumParent = BX('vk_export_to_album_parent_' + exportId);
						items.vkExportToAlbumAlias = BX('vk_export_to_album_alias_' + exportId);
						items.vkExportToAlbumAliasParent = BX('vk_export_to_album_alias_parent_' + exportId);
						items.vkExportIncludeChilds = BX('vk_export_include_childs_' + exportId);
						items.vkExportIncludeChildsParent = BX('vk_export_include_childs_parent_' + exportId);
						items.vkExportVkCategory = BX('vk_export_vk_category_' + exportId);
						items.vkExportVkCategoryParent = BX('vk_export_vk_category_parent_' + exportId);
					
						/* if inherit - hide all, if not - show other */
						BX.bind(items.vkExportInherit, 'change', function(){
							checkSettingsVisible(items);
						});
						
						/* if disable - hide all, if enable - check visible */
						BX.bind(items.vkExportEnable, 'change', function(){
							checkSettingsVisible(items);
						});
						
						/* if export to current album - show alias field */
						/* if change album to add - we can adding childs products to this album */
						BX.bind(items.vkExportToAlbum, 'change', function(){
							checkSettingsVisibleAlbums(items);
						});
					});
					
					function checkSettingsVisible(items) {
						if(items.vkExportInherit.checked) {
							BX.adjust(items.vkExportEnable, {props: {disabled: true}});
							hideSettings(items);
							setParentValues(items);
						} 
						else {
							BX.adjust(items.vkExportEnable, {props: {disabled: false}});
							if(!items.vkExportEnable.checked) {
								hideSettings(items);
							} else {
								BX.adjust(items.vkExportToAlbum, {props: {disabled: false}});
								BX.adjust(items.vkExportVkCategory, {props: {disabled: false}});
								checkSettingsVisibleAlbums(items);
							}
							
						}
					}
					
					function setParentValues(items) {
						//checkboxes
						BX.adjust(items.vkExportEnable, {props: {checked: items.vkExportEnableParent.value}});
						BX.adjust(items.vkExportIncludeChilds, {props: {checked: items.vkExportIncludeChildsParent.value}});
						//values fields
						items.vkExportToAlbum.value = items.vkExportToAlbumParent.value;
						items.vkExportToAlbumAlias.value = items.vkExportToAlbumAliasParent.value;
						items.vkExportVkCategory.value = items.vkExportVkCategoryParent.value;
					}
					
					function hideSettings(items) {
						BX.adjust(items.vkExportToAlbum, {props: {disabled: true}});
						BX.adjust(items.vkExportToAlbumAlias, {props: {disabled: true}});
						BX.adjust(items.vkExportIncludeChilds, {props: {disabled: true}});
						BX.adjust(items.vkExportVkCategory, {props: {disabled: true}});
					}
					
					function checkSettingsVisibleAlbums(items) {
						/* only if change NOT main album */
						var toAlbumAliasVisible = 
							(items.vkExportToAlbum.value == items.vkExportToAlbumCurrent.value && items.vkExportToAlbum.value > 0) ? 
								false : true;
						BX.adjust(items.vkExportToAlbumAlias, {props: {disabled: toAlbumAliasVisible}});
						BX.adjust(items.vkExportIncludeChilds, {props: {disabled: (items.vkExportToAlbum.value > 0 ? false : true)}});
					}
				});
			</script>
		";

		return $resultHtml;
	}


	/**
	 * Load values from post if page was be refreshed
	 *
	 * @param $settings array of settings
	 * @param $exportId
	 * @return mixed
	 */
	private function compareSettingsWithPost($settings, $exportId)
	{
//		not need check  INHERIT and ENABLE. Patamushta not need
		if ($_POST['VK_EXPORT'][$exportId]["TO_ALBUM"])
			$settings["TO_ALBUM"] = $_POST['VK_EXPORT'][$exportId]["TO_ALBUM"];

		if ($_POST['VK_EXPORT'][$exportId]["TO_ALBUM_ALIAS"])
			$settings["TO_ALBUM_ALIAS"] = $_POST['VK_EXPORT'][$exportId]["TO_ALBUM_ALIAS"];

		if ($_POST['VK_EXPORT'][$exportId]["VK_CATEGORY"])
			$settings["VK_CATEGORY"] = $_POST['VK_EXPORT'][$exportId]["VK_CATEGORY"];

		$settings["INCLUDE_CHILDS"] = $_POST['VK_EXPORT'][$exportId]["INCLUDE_CHILDS"] ? true : $settings["INCLUDE_CHILDS"];

		return $settings;
	}
}