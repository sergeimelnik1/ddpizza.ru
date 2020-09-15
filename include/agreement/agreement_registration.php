<?$APPLICATION->IncludeComponent(
    "bitrix:main.userconsent.request",
    ".default",
    array(
        "ID" => "1",
        "IS_CHECKED" => "Y",
        "AUTO_SAVE" => "Y",
        "IS_LOADED" => "N",
        "REPLACE" => array(
            "button_caption" => GetMessage("SF_SMALL_REGISTER"),
            "fields" => array(GetMessage("SF_SMALL_NAME"), GetMessage("SF_SMALL_LAST_NAME"), GetMessage("SF_SMALL_LOGIN"), GetMessage("SF_SMALL_BUY_GO")),
        ),
        "SHORT_LABEL" => "Y"
    ),
    false
);?>