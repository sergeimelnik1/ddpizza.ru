<?$APPLICATION->IncludeComponent(
    "bitrix:main.userconsent.request",
    ".default",
    array(
        "ID" => "1",
        "IS_CHECKED" => "Y",
        "AUTO_SAVE" => "Y",
        "IS_LOADED" => "N",
        "SUBMIT_EVENT_NAME" => "buy-one-click-product",
        "REPLACE" => array(
            "button_caption" => GetMessage("SF_SMALL_BUY_GO"),
            "fields" => array(GetMessage("SF_SMALL_BUY_GO")),
        ),
        "SHORT_LABEL" => "Y"
    ),
    false
);?>