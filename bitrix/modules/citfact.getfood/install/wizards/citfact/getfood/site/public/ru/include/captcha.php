<?php
// Подключаем класс битрикса для работы с captcha
require($_SERVER["DOCUMENT_ROOT"]."/bitrix/modules/main/include/prolog_before.php");
include_once($_SERVER["DOCUMENT_ROOT"]."/bitrix/modules/main/classes/general/captcha.php");

// Создаем экземпляр класса
$cpt = new CCaptcha();

// Удаляем текущую каптчу
$cpt->Delete($_REQUEST['captcha_sid']);

// Генерируем и выводим код новой каптчи
echo htmlspecialchars($APPLICATION->CaptchaGetCode());