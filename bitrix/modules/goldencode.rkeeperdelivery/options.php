<?php

use Bitrix\Main\Application;
use Bitrix\Main\Config\Option;
use Bitrix\Main\Localization\Loc;
use Bitrix\Main\Text\BinaryString;



defined('ADMIN_MODULE_NAME') or define('ADMIN_MODULE_NAME', 'goldencode.rkeeperdelivery');

if (!$USER->isAdmin()) {
	$APPLICATION->authForm('Nope');
}

$app = Application::getInstance();
$context = $app->getContext();
$request = $context->getRequest();

Loc::loadMessages($context->getServer()->getDocumentRoot()."/bitrix/modules/main/options.php");
Loc::loadMessages(__FILE__);


// MODULE OPTIONS
// ================================
$Options = array(
	'iblock' => array(
		'type' => 'text',
		'label' => Loc::getMessage('GC_IBLOCK_LABEL')
	),
	'dir' => array(
		'type' => 'text',
		'label' => Loc::getMessage('GC_DIR_LABEL')
	),
	'dir2' => array(
		'type' => 'text',
		'label' => Loc::getMessage('GC_DIR_LABEL_2')
	),
	'table' => array(
		'type' => "text",
		'label' => Loc::getMessage('GC_TABLE_LABEL')
	),
	'table2' => array(
		'type' => "text",
		'label' => Loc::getMessage('GC_TABLE_LABEL_2')
	),
	'waiter' => array(
		'type' => "text",
		'label' => Loc::getMessage('GC_WAITER_LABEL')
	),
	'waiter2' => array(
		'type' => "text",
		'label' => Loc::getMessage('GC_WAITER_LABEL_2')
	)
);



$tabControl = new CAdminTabControl("tabControl", array(
	array(
		"DIV" => "edit1",
		"TAB" => Loc::getMessage("MAIN_TAB_SET"),
		"TITLE" => Loc::getMessage("MAIN_TAB_TITLE_SET"),
	),
));

if ((!empty($save) || !empty($restore)) && $request->isPost() && check_bitrix_sessid()) {
	if (!empty($restore)) {

		// Restore defaults
		Option::delete(ADMIN_MODULE_NAME);
		CAdminMessage::showMessage(array(
			"MESSAGE" => Loc::getMessage("REFERENCES_OPTIONS_RESTORED"),
			"TYPE" => "OK",
		));
	} else {
		$err = true;

		// Save options
		foreach ($Options as $id=>$opt) {
			if ($val = $request->getPost($id)) {
				$err = false;
				Option::set(ADMIN_MODULE_NAME, $id, $val);
			}
		}

		if ($err) {
			CAdminMessage::showMessage(Loc::getMessage("REFERENCES_INVALID_VALUE"));
		} else {
			CAdminMessage::showMessage(array(
				"MESSAGE" => Loc::getMessage("REFERENCES_OPTIONS_SAVED"),
				"TYPE" => "OK",
			));
		}
	}
}

$tabControl->begin();
?>

<form method="post" action="<?=sprintf('%s?mid=%s&lang=%s', $request->getRequestedPage(), urlencode($mid), LANGUAGE_ID)?>">
	<?php
	echo bitrix_sessid_post();
	$tabControl->beginNextTab();
	?>

	<? foreach ($Options as $opt_name=>$opt) { ?>
	<tr>
		<td width="40%">
			<label for="<?=$opt_name?>"><?=$opt["label"]?>:</label>
		<td width="60%">
			<input
				type="<?=$opt["type"]?>"
				name="<?=$opt_name?>"
				id="<?=$opt_name?>"
				value="<?=BinaryString::htmlEncode(Option::get(ADMIN_MODULE_NAME, $opt_name));?>"
				/>
		</td>
	</tr>
	<? } ?>

	<?php
	$tabControl->buttons();
	?>
	<input
		type="submit"
		name="save"
		value="<?=Loc::getMessage("MAIN_SAVE") ?>"
		title="<?=Loc::getMessage("MAIN_OPT_SAVE_TITLE") ?>"
		class="adm-btn-save"
	/>

	<input
		type="submit"
		name="restore"
		title="<?=Loc::getMessage("MAIN_HINT_RESTORE_DEFAULTS") ?>"
		onclick="return confirm('<?= AddSlashes(GetMessage("MAIN_HINT_RESTORE_DEFAULTS_WARNING")) ?>')"
		value="<?=Loc::getMessage("MAIN_RESTORE_DEFAULTS") ?>"
	/>
	<?php
	$tabControl->end();
	?>
</form>
