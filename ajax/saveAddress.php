<?

require($_SERVER["DOCUMENT_ROOT"] . "/bitrix/modules/main/include/prolog_before.php");
$text = "";
$error = false;
if (!empty($_POST)) {
    if (!empty($_POST["deliveryCoords"])) {
        setCookie("deliveryCoords", $_POST["deliveryCoords"], time() + 86400 * 30, "/");

        if (!empty($_POST["deliveryAddress"])) {
            setCookie("deliveryAddress", $_POST["deliveryAddress"], time() + 86400 * 30, "/");
            if (!empty($_POST["deliveryPrice"])) {
                setCookie("deliveryPrice", $_POST["deliveryPrice"], time() + 86400 * 30, "/");
            } else {
                $text = "Извините, мы пока сюда не доставляем.";
                $error = true;
            }
        } else {
            $text = "Извините, мы пока сюда не доставляем.";
            $error = true;
        }
    } else {
        $text = "Извините, мы пока сюда не доставляем.";
        $error = true;
    }
} else {
    $text = "Ошибка передачи данных!";
    $error = true;
}
if (!$error) {
    $text = "Адрес сохранен!";
}
die(json_encode(array("error" => $error, "text" => $text)));
