<?$APPLICATION->IncludeComponent(
    "bitrix:main.userconsent.request",
    ".default",
    array(
        "ID" => "#USER_CONSENT_ID#",
        "IS_CHECKED" => "Y",
        "AUTO_SAVE" => "Y",
        "IS_LOADED" => "N",
        "SUBMIT_EVENT_NAME" => "buy-one-click",
        "REPLACE" => array(
            "button_caption" => GetMessage("SF_SMALL_BUY_GO"),
            "fields" => array(GetMessage("SF_SMALL_PHONE")),
        ),
        "SHORT_LABEL" => "Y"
    ),
    false
);?>