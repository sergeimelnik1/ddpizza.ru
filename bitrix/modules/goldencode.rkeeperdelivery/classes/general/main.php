<?

namespace Goldencode;

use Bitrix\Main\Config\Option;
use \CIBlockElement;
use \CSaleOrder;
use \CSaleBasket;

require_once($_SERVER["DOCUMENT_ROOT"] . "/ajax/functions.php");

//
// Controllers for RKeeperTransactions Class
// --------------------------------------------------
class RKeeperDelivery {

    // Init variables
    private $server;
    private $user;
    private $pass;
    private $dbname;

    public function __construct($s, $u, $p, $db = "CRM") {
        $this->server = $s;
        $this->user = $u;
        $this->pass = $p;
        $this->dbname = $db;
    }

    public function DeliveryOrder($orderId, $arFields, $arOrder) {
//write_log(print_r($orderId,1));
//write_log(print_r($arFields,1));

        /* if($orderId == 2325){
          $arrOrder = CSaleOrder::GetByID($orderId);
          print_arr($arrOrder);
          print_arr($arOrder);
          exit();
          } */
		  //write_log(print_r($arOrder["ID"], 1));
		  //write_log(print_r($arOrder["STATUS_ID"], 1));
        if ($arOrder["STATUS_ID"] == "A" && !empty($arOrder["BASKET_ITEMS"])) {
			$already_approved = CIBlockElement::GetList(array(),array("IBLOCK_ID"=>8,"NAME"=>$arOrder["ID"]),array());
			if($already_approved==0){
            write_log(print_r($arOrder, 1));
            $IblockElement = new CIBlockElement();
            $moduleOpt = array(
                'iblock' => Option::get("goldencode.rkeeperdelivery", 'iblock'),
                'dir' => Option::get("goldencode.rkeeperdelivery", 'dir'),
                'dir2' => Option::get("goldencode.rkeeperdelivery", 'dir2'),
                'table' => Option::get("goldencode.rkeeperdelivery", 'table'),
                'waiter' => Option::get("goldencode.rkeeperdelivery", 'waiter'),
                'table2' => Option::get("goldencode.rkeeperdelivery", 'table2'),
                'waiter2' => Option::get("goldencode.rkeeperdelivery", 'waiter2'),
            );

            $orderText = "";

            if (empty($arOrder["ORDER_PROP"])) {
                $db_vals = CSaleOrderPropsValue::GetList(
                                array(),
                                array(
                                    "ORDER_ID" => $arOrder["ID"],
                                    "ORDER_PROPS_ID" => 15 //Ресторан
                                )
                );
                if ($arVals = $db_vals->Fetch()) {
                    $arOrder["ORDER_PROP"][15] = $arVals["VALUE"];
                }
            }

            switch ($arOrder["ORDER_PROP"][15]) {
                case '597'://Чесноково
                    $tables = explode(",", $moduleOpt['table2']);
                    break;
                default://Павловская Слобода
                    $tables = explode(",", $moduleOpt['table']);
                    break;
            }

            $arRealTables = array(
                "89" => "60",
                "90" => "61",
                "91" => "62",
                "92" => "63",
                "93" => "64",
                "94" => "65",
                "95" => "66",
                "96" => "67",
                "97" => "68",
                "69" => "69",
                "98" => "70",
                "99" => "71",
                "100" => "72",
                "101" => "73",
                "102" => "74",
                "103" => "75");

            $table = array_shift($tables);
            $tables[] = $table;
            $tables = implode(",", $tables);

            $realTable = $arRealTables[$table];

            AddOrderProperty(16, $realTable, $orderId);

            switch ($arOrder["ORDER_PROP"][15]) {
                case '597'://Чесноково
                    Option::set("goldencode.rkeeperdelivery", 'table2', $tables);
                    break;
                default://Павловская Слобода
                    Option::set("goldencode.rkeeperdelivery", 'table', $tables);
                    break;
            }

            switch ($arOrder["ORDER_PROP"][15]) {
                case '597'://Чесноково
                    $waiter = $moduleOpt['waiter2'];
                    break;
                default://Павловская Слобода
                    $waiter = $moduleOpt['waiter'];
                    break;
            }


            // ORDER INFO
            $orderText .= $table . ";"; //. "(" . $orderId . ");" . 
            $orderText .= date("d.m.Y h:i:s", strtotime($arOrder["DATE_INSERT"])) . ";1;" . $waiter . "\n";

            // ORDER ITEMS
            foreach ($arOrder["BASKET_ITEMS"] as $item) {
                /* $item["RKEEPER_ID"] = $IblockElement->GetList(
                  Array("SORT"=>"ASC"),
                  Array(
                  "ID" => $item["PRODUCT_ID"],
                  "IBLOCK_ID" => $moduleOpt["iblock"],
                  ),
                  false,
                  false,
                  Array(
                  "PROPERTY_RKEEPER_ID"
                  )
                  )->GetNext()["PROPERTY_RKEEPER_ID_VALUE"]; */
                $rkeeper_id = "";
                $arItem = CIBlockElement::GetByID($item["PRODUCT_ID"])->GetNext();
                if ($arItem["IBLOCK_ID"] != "") {
                    $arItem = CIBlockElement::GetList(array(), array("ID" => $arItem["ID"], "IBLOCK_ID" => $arItem["IBLOCK_ID"]), false, false, array("ID", "XML_ID", "PROPERTY_CODE"/* ,"IS_ADDITIVE" */))->GetNext();
                    $rkeeper_id = $arItem["PROPERTY_CODE_VALUE"];
                    if ($rkeeper_id == "") {
                        $rkeeper_id = $arItem["XML_ID"];
                    }
					if(intval($item["PRICE"])>0){
					$rkeeper_id = reset(explode("|",$rkeeper_id));
					}else{
$rkeeper_id = end(explode("|",$rkeeper_id));
					}
                    $product_type = "0";
                    /* if($arItem["IS_ADDITIVE_VALUE"]){
                      $product_type = "1";
                      } */
$arAdditives = array();
					if (!empty($item["PROPS"]["ADDITIVES"]["VALUE"])) {
                        $vals = explode(";", $item["PROPS"]["ADDITIVES"]["VALUE"]);
                        foreach ($vals as $val) {
                            if (!empty($val)) {
                                $arAdditive = explode(":", $val);
                                if (intval(trim($arAdditive[1])) > 0) {
                                    $arAdditives[trim($arAdditive[0])] = intval(trim($arAdditive[1]))*intval($item["QUANTITY"]);
                                }
                            }
                        }

                        $arAdditiveIDs = array();
$arAdditivePrices = array();
                        $elements = CIBlockElement::GetList(array(), array("PROPERTY_IS_ADDITIVE" => 1, "IBLOCK_ID" => 2, "=NAME" => array_keys($arAdditives)), false, false, array("ID", "NAME", "XML_ID", "PROPERTY_CODE","CATALOG_GROUP_1"));
                        while ($additive = $elements->GetNext()) {
                            if ($additive["PROPERTY_CODE_VALUE"] != "") {
$add_code = $additive["PROPERTY_CODE_VALUE"];
$add_code = reset(explode("|",$add_code));
                                $arAdditiveIDs[$add_code] = $arAdditives[$additive["NAME"]];
//write_log(print_r($additive, 1));
								if($additive["CATALOG_PRICE_1"]!=""){
$arAdditivePrices[$add_code] = $additive["CATALOG_PRICE_1"];
$item["PRICE"]-=$additive["CATALOG_PRICE_1"]*$arAdditives[$additive["NAME"]];
								}else{
$arAdditivePrices[$add_code] = 0;
}
                            }
                        }

}
                    $item["PRICE"] = intval($item["PRICE"]);
                    $item["QUANTITY"] = str_replace('.', ',', $item["QUANTITY"]);
                    $orderText .= $rkeeper_id . ";" . $item["PRICE"] . ",0000;" . $item["QUANTITY"] . ";" . $product_type . "\n";

                    if (!empty($item["PROPS"]["ADDITIVES"]["VALUE"])) {



                        foreach ($arAdditiveIDs as $code => $quantity) {
							$price = $arAdditivePrices[$code];
							$price = intval($price);
                            $orderText .= $code . ";".$price.",0000;" . $quantity . ",0000;0\n";
                        }
                    }
                }
            }

            // CONVERT ENCODING
            mb_convert_encoding($orderText, "Windows-1251");

            // CREATE DIR
            $directory = $_SERVER["DOCUMENT_ROOT"] . "/" . $moduleOpt['dir'];
            $directory = str_replace('//', '/', $directory);

            $directory2 = $_SERVER["DOCUMENT_ROOT"] . "/" . $moduleOpt['dir2'];
            $directory2 = str_replace('//', '/', $directory2);

            $directory_all = $_SERVER["DOCUMENT_ROOT"] . "/rkeeper-log";
            $directory_all = str_replace('//', '/', $directory_all);

            if (!file_exists($directory))
                mkdir($directory, 0777, true);

            if (!file_exists($directory2))
                mkdir($directory2, 0777, true);

            if (!file_exists($directory3))
                mkdir($directory_all, 0777, true);

            switch ($arOrder["ORDER_ID"][15]) {
                case '597'://Чесноково
                    $file = $directory2 . '/Order_New' . $table . '.csv';
                    break;
                default://Павловская Слобода
                    $file = $directory . '/Order_New' . $table . '.csv';
                    break;
            }

            $file_all = $directory_all . '/Order_New' . $table . '_' . date('dmY_His') . '.csv';

            // WRITE TO DIR
            //$file = $directory  .'/Order_New' . $orderId . '.csv';
            $file = str_replace('//', '/', $file);

            $file_all = str_replace('//', '/', $file_all);

            file_put_contents($file, $orderText);

            file_put_contents($file_all, $orderText);
	$el = new CIBlockElement;
	$el->Add(array("IBLOCK_ID"=>8,"NAME"=>$arOrder["ID"]));
            // LOG
            /* ob_start();

              var_dump($url);
              var_dump($orderText);
              var_dump($orderId);

              $result = ob_get_clean();

              file_put_contents($_SERVER["DOCUMENT_ROOT"].'/log.txt', $result); */
			}
        }
    }

}
