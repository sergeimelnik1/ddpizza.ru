<?
if(!$USER->IsAdmin()) return;
IncludeModuleLangFile($_SERVER['DOCUMENT_ROOT'] . "/bitrix/modules/angerro.yadelivery/lang/ru/options.php");
?>
    <script src="https://api-maps.yandex.ru/2.1/?load=package.full&lang=ru_RU" type="text/javascript"></script>
    <!--<script type="text/javascript" src="http://code.jquery.com/jquery-latest.min.js"></script>-->
    <script src="/bitrix/js/angerro/angerro.yadelivery/jquery-latest.min.js" type="text/javascript"></script>
    <!--<script src="/bitrix/js/angerro/angerro.yadelivery/jquery.json.js" type="text/javascript"></script>-->
    <script src="/bitrix/js/angerro/angerro.yadelivery/admin_draw_areas.js" type="text/javascript"></script>
    <script src="/bitrix/js/angerro/angerro.yadelivery/admin_show_map.js" type="text/javascript"></script>
	<script src="/bitrix/js/angerro/angerro.yadelivery/admin_edit_areas.js" type="text/javascript"></script>
	

	<link href="/bitrix/components/angerro/angerro.yadelivery/classes/content_admin_tabs/angerro.yadelivery.admin.css" type="text/css" rel="stylesheet" />
<?
$aTabs = array(
    array("DIV" => "edit1", "TAB" => GetMessage("TAB_1_TITLE"), "TITLE"=>GetMessage("TAB_1_DESCRIPTION")),
    array("DIV" => "edit2", "TAB" => GetMessage("TAB_2_TITLE"), "TITLE"=>GetMessage("TAB_2_DESCRIPTION")),
	array("DIV" => "edit3", "TAB" => GetMessage("TAB_3_TITLE"), "TITLE"=>GetMessage("TAB_3_DESCRIPTION"))
);
$tabControl = new CAdminTabControl("tabControl", $aTabs);
$tabControl->Begin();
/*
 * FIRST TAB - view maps
 */
$tabControl->BeginNextTab();
require_once($_SERVER['DOCUMENT_ROOT'] . "/bitrix/components/angerro/angerro.yadelivery/classes/content_admin_tabs/tab1.php");

/*
 * SECOND TAB - create map with zones delivery
 */
$tabControl->BeginNextTab();
require_once($_SERVER['DOCUMENT_ROOT'] . "/bitrix/components/angerro/angerro.yadelivery/classes/content_admin_tabs/tab2.php");

/*
 * THIRT TAB - edit and delete map with zones delivery
 */
$tabControl->BeginNextTab();
require_once($_SERVER['DOCUMENT_ROOT'] . "/bitrix/components/angerro/angerro.yadelivery/classes/content_admin_tabs/tab3.php");
?>
	
<?$tabControl->Buttons();?>
<input type="button" name="Update" title="<?=GetMessage('RELOAD_PAGE')?>" value="<?=GetMessage('RELOAD_PAGE')?>" onclick='location.reload();'>

<?
$tabControl->End();
?>