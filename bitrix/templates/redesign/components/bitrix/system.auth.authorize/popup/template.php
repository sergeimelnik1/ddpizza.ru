<div class="loginForm">
    <div class="loginFormTitle">
        Вход на сайт
    </div>
    <div class="loginFormDesc">
        <?
        if (isset($_POST["USER_LOGIN"])) {
            ShowMessage($arParams["~AUTH_RESULT"]);
        } else {
            if (empty($arResult['ERROR_MESSAGE'])) {
                ?>
                Войдите, чтобы использовать по максимуму
                <?
            } else {
                ShowMessage($arResult['ERROR_MESSAGE']);
            }
        }
        ?>
    </div>
    <form class="loginForm" name="form_auth" method="post" target="_top" action="<?= $arResult["AUTH_URL"] ?>">
        <input type="hidden" name="AUTH_FORM" value="Y" />
        <input type="hidden" name="TYPE" value="AUTH" />
        <input type="hidden" name="Login" value="<?= GetMessage("AUTH_AUTHORIZE") ?>" />

        <? if (strlen($arResult["BACKURL"]) > 0): ?>
            <input type="hidden" name="backurl" value="<?= $arResult["BACKURL"] ?>" />
        <? endif ?>
        <? foreach ($arResult["POST"] as $key => $value): ?>
            <input type="hidden" name="<?= $key ?>" value="<?= $value ?>" />
        <? endforeach ?>
        <div class="form-group">
            <input type="text" name="USER_LOGIN" placeholder="Email" class="form-control" value="<?= $arResult["LAST_LOGIN"] ?>"/>
        </div>
        <div class="form-group">
            <input type="password" name="USER_PASSWORD" placeholder="Пароль" class="form-control" />
        </div>
        <? if ($arResult["CAPTCHA_CODE"]): ?>
            <input type="hidden" name="captcha_sid" value="<? echo $arResult["CAPTCHA_CODE"] ?>" />
            <img src="/bitrix/tools/captcha.php?captcha_sid=<? echo $arResult["CAPTCHA_CODE"] ?>" width="180" height="40" alt="CAPTCHA" />
            <input class="bx-auth-input" type="text" name="captcha_word" maxlength="50" value="" size="15" />
        <? endif; ?>
        <button class="btn btn-primary" type="submit">Войти</button>
    </form>
    <div class="registerLink">
        Или <a href="/auth/?register=yes">зарегистрирурйтесь</a>
    </div>
</div>
