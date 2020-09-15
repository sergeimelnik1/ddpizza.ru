<?
IncludeModuleLangFile(__FILE__);
class CGetfood
{
	function MaxMinFunc(&$arFields) {
		if (intVal($arFields["ID"]) > 0) {
			$ib_info = CCatalog::GetByID($arFields["IBLOCK_ID"]);
			$iblock_id = 2;
			$catalog_group_id = CCatalogGroup::GetBaseGroup();
			$min_code = "MINIMUM_PRICE";
			$max_code = "MAXIMUM_PRICE";
			CModule::IncludeModule("catalog");
			$sku = CCatalogSKU::GetInfoByProductIBlock($ib_info["IBLOCK_ID"]);
			$max_price = 0;
			$min_price = 1000000000;

			if ($arFields["IBLOCK_ID"] == $ib_info["IBLOCK_ID"] || $arFields["IBLOCK_ID"] == $sku["IBLOCK_ID"]) {
				if ($arFields["IBLOCK_ID"] == $ib_info["IBLOCK_ID"]) {
					$element_id = $arFields["ID"];
				} else if ($arFields["IBLOCK_ID"] == $sku["IBLOCK_ID"]) {
					$ar_get = CCatalogSku::GetProductInfo($arFields["ID"], $sku["IBLOCK_ID"]);
					$element_id = $ar_get["ID"];
				}
				$db_get = CPrice::GetList(Array(), Array("PRODUCT_ID" => $element_id, "CATALOG_GROUP_ID" => $catalog_group_id), false, false, Array());
				if ($ar_get = $db_get->Fetch()) {
					$min_price = $max_price = floatVal($ar_get["PRICE"]);
				}
				if (intVal($sku["IBLOCK_ID"]) > 0) {
					$db_get = CIBlockElement::GetList(Array(), Array("PROPERTY_".$sku["SKU_PROPERTY_ID"] => $element_id, "IBLOCK_ID" => $sku["IBLOCK_ID"], "ACTIVE" => "Y", "ACTIVE_DATE" => "Y"), false, false, Array("ID"));
					while ($ar_get = $db_get->GetNext()) {
						$db_get2 = CPrice::GetList(Array(), Array("PRODUCT_ID" => $ar_get["ID"], "CATALOG_GROUP_ID" => $catalog_group_id), false, false, Array());
						if ($ar_get2 = $db_get2->Fetch()) {
							if (floatVal($ar_get2["PRICE"]) > $max_price) {
								$max_price = floatVal($ar_get2["PRICE"]);
							}
							if (floatVal($ar_get2["PRICE"]) < $min_price) {
								$min_price = floatVal($ar_get2["PRICE"]);
							}
						}
					}
				}
				CIBlockElement::SetPropertyValuesEx($element_id, $ib_info["IBLOCK_ID"], array($min_code => ($min_price == 1000000000) ? "" : $min_price));
				CIBlockElement::SetPropertyValuesEx($element_id, $ib_info["IBLOCK_ID"], array($max_code => $max_price));
			}
		}
	}

	function ShowPanel()
	{
		if ($GLOBALS["USER"]->IsAdmin() && COption::GetOptionString("main", "wizard_solution", "", SITE_ID) == "getfood")
		{
			$GLOBALS["APPLICATION"]->SetAdditionalCSS("/bitrix/wizards/bitrix/eshop/css/panel.css"); 

			$arMenu = Array(
				Array(		
					"ACTION" => "jsUtils.Redirect([], '".CUtil::JSEscape("/bitrix/admin/wizard_install.php?lang=".LANGUAGE_ID."&wizardSiteID=".SITE_ID."&wizardName=citfact:getfood&".bitrix_sessid_get())."')",
					"ICON" => "bx-popup-item-wizard-icon",
					"TITLE" => GetMessage("STOM_BUTTON_TITLE_W1"),
					"TEXT" => GetMessage("STOM_BUTTON_NAME_W1"),
				)
			);

			$GLOBALS["APPLICATION"]->AddPanelButton(array(
				"HREF" => "/bitrix/admin/wizard_install.php?lang=".LANGUAGE_ID."&wizardName=citfact:getfood&wizardSiteID=".SITE_ID."&".bitrix_sessid_get(),
				"ID" => "getfood_wizard",
				"ICON" => "bx-panel-site-wizard-icon",
				"MAIN_SORT" => 2500,
				"TYPE" => "BIG",
				"SORT" => 10,	
				"ALT" => GetMessage("SCOM_BUTTON_DESCRIPTION"),
				"TEXT" => GetMessage("SCOM_BUTTON_NAME"),
				"MENU" => $arMenu,
			));
		}
	}

    public static function getOption($option){
        return \Citfact\Getfood\Configurator::getOption($option);
    }
}

Bitrix\Main\EventManager::getInstance()->addEventHandler('iblock', 'OnAfterIBlockElementAdd', array('CGetfood', 'MinMaxPriceUpdate'));
Bitrix\Main\EventManager::getInstance()->addEventHandler('iblock', 'OnAfterIBlockElementUpdate', array('CGetfood', 'MinMaxPriceUpdate'));

class CModuleOptions
{
	public $arCurOptionValues = array();

	private $module_id = '';
	private $arTabs = array();
	private $arGroups = array();
	private $arOptions = array();
	private $need_access_tab = false;

	public function CModuleOptions($module_id, $arTabs, $arGroups, $arOptions, $need_access_tab = false)
	{
		$this->module_id = $module_id;
		$this->arTabs = $arTabs;
		$this->arGroups = $arGroups;
		$this->arOptions = $arOptions;
		$this->need_access_tab = $need_access_tab;

		if($need_access_tab)
			$this->arTabs[] = array(
				'DIV' => 'edit_access_tab',
				'TAB' => 'Права доступа',
				'ICON' => '',
				'TITLE' => 'Настройка прав доступа'
			);

		if($_REQUEST['update'] == 'Y' && check_bitrix_sessid()){
			$this->SaveOptions();
			if($this->need_access_tab)
			{
				$this->SaveGroupRight();
			}
		}


		$this->GetCurOptionValues();
	}

	private function SaveOptions()
	{
		foreach($this->arOptions as $opt => $arOptParams)
		{
			if($arOptParams['TYPE'] != 'CUSTOM')
			{
				$val = $_REQUEST[$opt];

				if($arOptParams['TYPE'] == 'CHECKBOX' && $val != 'Y')
					$val = 'N';
				elseif(is_array($val))
					$val = serialize($val);

				COption::SetOptionString($this->module_id, $opt, $val);
			}
		}
	}

	private function SaveGroupRight()
	{
		CMain::DelGroupRight($this->module_id);
		$GROUP = $_REQUEST['GROUPS'];
		$RIGHT = $_REQUEST['RIGHTS'];

		foreach($GROUP as $k => $v) {
			if($k == 0) {
				COption::SetOptionString($this->module_id, 'GROUP_DEFAULT_RIGHT', $RIGHT[0], 'Right for groups by default');
			}
			else {
				CMain::SetGroupRight($this->module_id, $GROUP[$k], $RIGHT[$k]);
			}
		}


	}

	private function GetCurOptionValues()
	{
		foreach($this->arOptions as $opt => $arOptParams)
		{
			if($arOptParams['TYPE'] != 'CUSTOM')
			{
				$this->arCurOptionValues[$opt] = COption::GetOptionString($this->module_id, $opt, $arOptParams['DEFAULT']);
				if(in_array($arOptParams['TYPE'], array('MSELECT')))
					$this->arCurOptionValues[$opt] = unserialize($this->arCurOptionValues[$opt]);
			}
		}
	}

	public function ShowHTML()
	{
		global $APPLICATION;

		$arP = array();

		foreach($this->arGroups as $group_id => $group_params)
			$arP[$group_params['TAB']][$group_id] = array();

		if(is_array($this->arOptions))
		{
			foreach($this->arOptions as $option => $arOptParams)
			{
				$val = $this->arCurOptionValues[$option];

				if($arOptParams['SORT'] < 0 || !isset($arOptParams['SORT']))
					$arOptParams['SORT'] = 0;

				$label = (isset($arOptParams['TITLE']) && $arOptParams['TITLE'] != '') ? $arOptParams['TITLE'] : '';
				$opt = htmlspecialchars($option);

				switch($arOptParams['TYPE'])
				{
					case 'CHECKBOX':
						$input = '<input type="checkbox" name="'.$opt.'" id="'.$opt.'" value="Y"'.($val == 'Y' ? ' checked' : '').' '.($arOptParams['REFRESH'] == 'Y' ? 'onclick="document.forms[\''.$this->module_id.'\'].submit();"' : '').' />';
						break;
					case 'TEXT':
						if(!isset($arOptParams['COLS']))
							$arOptParams['COLS'] = 25;
						if(!isset($arOptParams['ROWS']))
							$arOptParams['ROWS'] = 5;
						$input = '<textarea rows="'.$type[1].'" cols="'.$arOptParams['COLS'].'" rows="'.$arOptParams['ROWS'].'" name="'.$opt.'">'.htmlspecialchars($val).'</textarea>';
						if($arOptParams['REFRESH'] == 'Y')
							$input .= '<input type="submit" name="refresh" value="OK" />';
						break;
					case 'SELECT':
						$input = SelectBoxFromArray($opt, $arOptParams['VALUES'], $val, '', '', ($arOptParams['REFRESH'] == 'Y' ? true : false), ($arOptParams['REFRESH'] == 'Y' ? $this->module_id : ''));
						if($arOptParams['REFRESH'] == 'Y')
							$input .= '<input type="submit" name="refresh" value="OK" />';
						break;
					case 'MSELECT':
						$input = SelectBoxMFromArray($opt.'[]', $arOptParams['VALUES'], $val);
						if($arOptParams['REFRESH'] == 'Y')
							$input .= '<input type="submit" name="refresh" value="OK" />';
						break;
					case 'COLORPICKER':
						if(!isset($arOptParams['FIELD_SIZE']))
							$arOptParams['FIELD_SIZE'] = 25;
						ob_start();
						echo     '<input id="__CP_PARAM_'.$opt.'" name="'.$opt.'" size="'.$arOptParams['FIELD_SIZE'].'" value="'.htmlspecialchars($val).'" type="text" style="float: left;" '.($arOptParams['FIELD_READONLY'] == 'Y' ? 'readonly' : '').' />
                                <script>
                                    function onSelect_'.$opt.'(color, objColorPicker)
                                    {
                                        var oInput = BX("__CP_PARAM_'.$opt.'");
                                        oInput.value = color;
                                    }
                                </script>';
						$APPLICATION->IncludeComponent('bitrix:main.colorpicker', '', Array(
							'SHOW_BUTTON' => 'Y',
							'ID' => $opt,
							'NAME' => 'Выбор цвета',
							'ONSELECT' => 'onSelect_'.$opt
						), false
						);
						$input = ob_get_clean();
						if($arOptParams['REFRESH'] == 'Y')
							$input .= '<input type="submit" name="refresh" value="OK" />';
						break;
					case 'FILE':
						if(!isset($arOptParams['FIELD_SIZE']))
							$arOptParams['FIELD_SIZE'] = 25;
						if(!isset($arOptParams['BUTTON_TEXT']))
							$arOptParams['BUTTON_TEXT'] = '...';
						CAdminFileDialog::ShowScript(Array(
							'event' => 'BX_FD_'.$opt,
							'arResultDest' => Array('FUNCTION_NAME' => 'BX_FD_ONRESULT_'.$opt),
							'arPath' => Array(),
							'select' => 'F',
							'operation' => 'O',
							'showUploadTab' => true,
							'showAddToMenuTab' => false,
							'fileFilter' => '',
							'allowAllFiles' => true,
							'SaveConfig' => true
						));
						$input =     '<input id="__FD_PARAM_'.$opt.'" name="'.$opt.'" size="'.$arOptParams['FIELD_SIZE'].'" value="'.htmlspecialchars($val).'" type="text" style="float: left;" '.($arOptParams['FIELD_READONLY'] == 'Y' ? 'readonly' : '').' />
                                    <input value="'.$arOptParams['BUTTON_TEXT'].'" type="button" onclick="window.BX_FD_'.$opt.'();" />
                                    <script>
                                        setTimeout(function(){
                                            if (BX("bx_fd_input_'.strtolower($opt).'"))
                                                BX("bx_fd_input_'.strtolower($opt).'").onclick = window.BX_FD_'.$opt.';
                                        }, 200);
                                        window.BX_FD_ONRESULT_'.$opt.' = function(filename, filepath)
                                        {
                                            var oInput = BX("__FD_PARAM_'.$opt.'");
                                            if (typeof filename == "object")
                                                oInput.value = filename.src;
                                            else
                                                oInput.value = (filepath + "/" + filename).replace(/\/\//ig, \'/\');
                                        }
                                    </script>';
						if($arOptParams['REFRESH'] == 'Y')
							$input .= '<input type="submit" name="refresh" value="OK" />';
						break;
					case 'CUSTOM':
						$input = $arOptParams['VALUE'];
						break;
					default:
						if(!isset($arOptParams['SIZE']))
							$arOptParams['SIZE'] = 25;
						if(!isset($arOptParams['MAXLENGTH']))
							$arOptParams['MAXLENGTH'] = 255;
						$input = '<input type="'.($arOptParams['TYPE'] == 'INT' ? 'number' : 'text').'" size="'.$arOptParams['SIZE'].'" maxlength="'.$arOptParams['MAXLENGTH'].'" value="'.htmlspecialchars($val).'" name="'.htmlspecialchars($option).'" />';
						if($arOptParams['REFRESH'] == 'Y')
							$input .= '<input type="submit" name="refresh" value="OK" />';
						break;
				}

				if(isset($arOptParams['NOTES']) && $arOptParams['NOTES'] != '')
					$input .=     '<div class="notes">
                                    <table cellspacing="0" cellpadding="0" border="0" class="notes">
                                        <tbody>
                                            <tr class="top">
                                                <td class="left"><div class="empty"></div></td>
                                                <td><div class="empty"></div></td>
                                                <td class="right"><div class="empty"></div></td>
                                            </tr>
                                            <tr>
                                                <td class="left"><div class="empty"></div></td>
                                                <td class="content">
                                                    '.$arOptParams['NOTES'].'
                                                </td>
                                                <td class="right"><div class="empty"></div></td>
                                            </tr>
                                            <tr class="bottom">
                                                <td class="left"><div class="empty"></div></td>
                                                <td><div class="empty"></div></td>
                                                <td class="right"><div class="empty"></div></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>';

				$arP[$this->arGroups[$arOptParams['GROUP']]['TAB']][$arOptParams['GROUP']]['OPTIONS'][] = $label != '' ? '<tr><td valign="top" width="40%">'.$label.'</td><td valign="top" nowrap>'.$input.'</td></tr>' : '<tr><td valign="top" colspan="2" align="center">'.$input.'</td></tr>';
				$arP[$this->arGroups[$arOptParams['GROUP']]['TAB']][$arOptParams['GROUP']]['OPTIONS_SORT'][] = $arOptParams['SORT'];
			}

			$tabControl = new CAdminTabControl('tabControl', $this->arTabs);
			$tabControl->Begin();
			echo '<form name="'.$this->module_id.'" method="POST" action="'.$APPLICATION->GetCurPage().'?mid='.$this->module_id.'&lang='.LANGUAGE_ID.'" enctype="multipart/form-data">'.bitrix_sessid_post();

			foreach($arP as $tab => $groups)
			{
				$tabControl->BeginNextTab();

				foreach($groups as $group_id => $group)
				{
					if(sizeof($group['OPTIONS_SORT']) > 0)
					{
						echo '<tr class="heading"><td colspan="2">'.$this->arGroups[$group_id]['TITLE'].'</td></tr>';

						array_multisort($group['OPTIONS_SORT'], $group['OPTIONS']);
						foreach($group['OPTIONS'] as $opt)
							echo $opt;
					}
				}
			}

			if($this->need_access_tab)
			{
				$tabControl->BeginNextTab();
				$module_id = $this->module_id;
				require_once($_SERVER["DOCUMENT_ROOT"]."/bitrix/modules/main/admin/group_rights.php");
			}

			$tabControl->Buttons();

			echo     '<input type="hidden" name="update" value="Y" />
                    <input type="submit" name="save" value="Сохранить" />
                    <input type="reset" name="reset" value="Отменить" />
                    </form>';

			$tabControl->End();
		}
	}
}
