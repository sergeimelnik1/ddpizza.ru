<?$APPLICATION->IncludeComponent(
    "bitrix:subscribe.form",
    "left_sidebar",
    array(
        "COMPONENT_TEMPLATE" => "left_sidebar",
        "USE_PERSONALIZATION" => "Y",
        "SHOW_HIDDEN" => "N",
        "USER_CONSENT" => "Y",
        "USER_CONSENT_ID" => "1",
        "USER_CONSENT_IS_CHECKED" => "Y",
        "USER_CONSENT_IS_LOADED" => "N",
        "PAGE" => "/personal/subscribe/subscr_edit.php",
        "CACHE_TYPE" => "A",
        "CACHE_TIME" => "3600"
    ),
    false
);?>