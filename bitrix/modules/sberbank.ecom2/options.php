<?php
	use Bitrix\Main;
	use Bitrix\Main\Loader;
	use Bitrix\Main\Config\Option;
	use Bitrix\Main\Localization\Loc;
	use Bitrix\Sale;

	require __DIR__ . '/config.php';

	$moduleID = $SBERBANK_CONFIG['MODULE_ID'];

	Loader::includeModule('sale');
	Loader::includeModule('currency');
	Loader::includeModule($moduleID);

	$request = \Bitrix\Main\Application::getInstance()->getContext()->getRequest();

	IncludeModuleLangFile($_SERVER["DOCUMENT_ROOT"].BX_ROOT."/modules/main/options.php");
	IncludeModuleLangFile(__FILE__);
?>

<?	
	if ($REQUEST_METHOD == 'POST' && strlen($Update . $Apply) > 0 && check_bitrix_sessid()) {
	    COption::SetOptionString($moduleID, "RESULT_ORDER_STATUS", $_POST['RESULT_ORDER_STATUS']);
	    COption::SetOptionString($moduleID, "OPTION_EMAIL", $_POST['OPTION_EMAIL']);
	    COption::SetOptionString($moduleID, "OPTION_PHONE", $_POST['OPTION_PHONE']);
	}


	$current_settings = array(
		'BANK_NAME' => COption::GetOptionString($moduleID, 'BANK_NAME'),
		'MODULE_ID' => COption::GetOptionString($moduleID, 'MODULE_ID'),
		'SBERBANK_PROD_URL' => COption::GetOptionString($moduleID, 'SBERBANK_PROD_URL'),
		'SBERBANK_TEST_URL' => COption::GetOptionString($moduleID, 'SBERBANK_TEST_URL'),
		'MODULE_VERSION' => COption::GetOptionString($moduleID, 'MODULE_VERSION'),
		'ISO' => unserialize(COption::GetOptionString($moduleID, 'ISO')),
		'RESULT_ORDER_STATUS' => COption::GetOptionString($moduleID, 'RESULT_ORDER_STATUS'),
		'OPTION_EMAIL' => COption::GetOptionString($moduleID, 'OPTION_EMAIL'),
		'OPTION_PHONE' => COption::GetOptionString($moduleID, 'OPTION_PHONE'),
	);

?>


<?
	$tabControl = new CAdminTabControl("tabControl",  array(
		array("DIV" => "edit1", "TAB" => Loc::getMessage('SBERBANK_PAYMENT_TAB_NAME'), "ICON" => "blog_settings", "TITLE" => Loc::getMessage('SBERBANK_PAYMENT_TAB_TITLE')),
	));
	$tabControl->Begin();
?>


<form method="POST" action="<?echo $APPLICATION->GetCurPage()?>?mid=<?=htmlspecialcharsbx($mid)?>&lang=<?=LANGUAGE_ID?>">
	<?= bitrix_sessid_post() ?>
	<? $tabControl->BeginNextTab(); ?>
	

		<!-- MODULE BASE INFO -->

		<tr class="heading">
	        <td colspan="2"><?= Loc::getMessage('SBERBANK_PAYMENT_STRING_MODULE_INFO')?>:</td>
	    </tr>
	    <tr>
	        <td width="50%"><?= Loc::getMessage('SBERBANK_PAYMENT_STRING_MODULE_VERSION')?>:</td>
	        <td width="50%"><span><?=$current_settings['MODULE_VERSION']?></span></td>
	    </tr>


		<!-- ORDER STATUS -->

		<tr class="heading">
	        <td colspan="2"><?= Loc::getMessage('SBERBANK_PAYMENT_STRING_PAYMENT_STATUS')?>:</td>
	    </tr>
		<tr>

	        <td width="100%" colspan="2" style="text-align: center;">
	            <select name="RESULT_ORDER_STATUS">
	                <?
						$statuses = array();
						$dbStatus = CSaleStatus::GetList(Array("SORT" => "ASC"), Array("LID" => LANGUAGE_ID), false, false, Array("ID", "NAME", "SORT"));
						while ($arStatus = $dbStatus->GetNext()) {
						    $statuses[$arStatus["ID"]] = "[" . $arStatus["ID"] . "] " . $arStatus["NAME"];
						}
		                foreach ($statuses as $key => $name) {
		                    ?>
		                    <option value="<?= $key ?>"<?= $key == $current_settings['RESULT_ORDER_STATUS'] ? ' selected' : '' ?>><?= htmlspecialcharsex($name) ?></option><?
		                }
	                ?>
	            </select>
	        </td>
	    </tr>

		<tr class="heading">
	        <td colspan="2"><?= Loc::getMessage('SBERBANK_PAYMENT_CUSTOM_OPTIONS')?>:</td>
	    </tr>

		<tr>
			<td colspan="2">
				<div class="adm-info-message" style="margin-bottom: 5px; max-width: 500px; margin-left: auto; margin-right: auto; display: block; margin-top: 0;">
					<?= Loc::getMessage('SBERBANK_PAYMENT_CUSTOM_OPTIONS_DESCRIPTION');?>
				</div>
			</td>
		</tr>

		
		<tr class="extra-settings active">
	        <td width="50%" class="adm-detail-content-cell-l">
	        	<?= Loc::getMessage('SBERBANK_PAYMENT_OPTION_PHONE')?>
	        </td>
	        <td width="50%" class="sberbank-input-top adm-detail-content-cell-r">
	        	<input type="text" name="OPTION_PHONE" value="<?=$current_settings['OPTION_PHONE']?>">
	        </td>
	    </tr>
	    <tr class="extra-settings active">
	        <td width="50%" class="adm-detail-content-cell-l">
	        	<?= Loc::getMessage('SBERBANK_PAYMENT_OPTION_EMAIL')?>
	        </td>
	        <td width="50%" class="sberbank-input-top adm-detail-content-cell-r">
	        	<input type="text" name="OPTION_EMAIL" value="<?=$current_settings['OPTION_EMAIL']?>">

	        </td>
	    </tr>

	    <!-- TEST SERVER PHP,CURL,TLS -->

	    <? if ($_REQUEST['server_info'] == '1') { ?>
		    <tr class="heading">
		        <td colspan="2"><?= Loc::getMessage('SBERBANK_PAYMENT_STRING_SERVER_INFO')?>:</td>
		    </tr>
			<?
					$server_info = array();
					$server_info[] = array("PHP version:", phpversion() );
				    if (function_exists('curl_version')) {
				        $curl = curl_version();
				        $server_info[] = array("cURL version:", $curl["version"] );
				        $ch = curl_init('https://www.howsmyssl.com/a/check');
				        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
				        $data = curl_exec($ch);
				        curl_close($ch);
				        $json = json_decode($data);
				        $server_info[] = array("TLS version: ", $json->tls_version );
				    } else {
				    	$server_info[] = array("cURL", 'Not installed!!!' );
				    }
				    $server_info[] = array("OpenSSL version text: ", OPENSSL_VERSION_TEXT );
				    $server_info[] = array("OpenSSL version number: ", OPENSSL_VERSION_NUMBER );
				
			?>
			<? foreach ($server_info as $key => $item) { ?>
			    <tr>
			        <td width="50%"><?=$item[0]?></td>
			        <td width="50%"><?=$item[1]?></td>
			    </tr>
			<? } ?>
		<? } ?>


	<? $tabControl->BeginNextTab(); ?>
    <? $tabControl->Buttons(); ?>
		<input type="submit" name="Update" value="<?= GetMessage("MAIN_SAVE") ?>" title="<?= GetMessage("MAIN_OPT_SAVE_TITLE") ?>" class="adm-btn-save">
		<input type="submit" name="Apply" value="<?= GetMessage("MAIN_OPT_APPLY") ?>" title="<?= GetMessage("MAIN_OPT_APPLY_TITLE") ?>">
		<? if (strlen($_REQUEST["back_url_settings"]) > 0): ?>
	        <input type="button" name="Cancel" value="<?= GetMessage("MAIN_OPT_CANCEL") ?>"
	               title="<?= GetMessage("MAIN_OPT_CANCEL_TITLE") ?>"
	               onclick="window.location='<? echo htmlspecialcharsbx(CUtil::addslashes($_REQUEST["back_url_settings"])) ?>'">
	        <input type="hidden" name="back_url_settings" value="<?= htmlspecialcharsbx($_REQUEST["back_url_settings"]) ?>">
	    <? endif ?>

	    <input type="button" id="check_server_info" value="<?= GetMessage("SBERBANK_PAYMENT_CHECK_SERVER_INFO") ?>">
	    <script>
	    	 BX.ready(function () {
	            var oButtonCheck = document.getElementById('check_server_info');
	            if (oButtonCheck) {
	                oButtonCheck.onclick = function () {
	                	window.location = '<?echo $APPLICATION->GetCurPage()?>?mid=<?=htmlspecialcharsbx($mid)?>&lang=<?=LANGUAGE_ID?><?echo "&server_info=1"?>';
	                    return false;
	                }
	            }
	        });
	    </script>
    <? $tabControl->End(); ?>
</form>