<?require($_SERVER["DOCUMENT_ROOT"]."/bitrix/header.php");
$APPLICATION->SetTitle("Контакты");
$config = new \Citfact\Getfood\Configurator();
?><div class="bx_page">
	<p>
		 
		<?
		if (CGetfood::getOption("MAP_TYPE")== 'yandex'){
			$APPLICATION->IncludeComponent(
				"bitrix:map.yandex.view", 
				".default", 
				array(
					"COMPONENT_TEMPLATE" => ".default",
					"COMPOSITE_FRAME_MODE" => "A",
					"COMPOSITE_FRAME_TYPE" => "AUTO",
					"CONTROLS" => array(
						0 => "ZOOM",
						1 => "MINIMAP",
						2 => "TYPECONTROL",
						3 => "SCALELINE",
					),
					"INIT_MAP_TYPE" => "MAP",
					"MAP_DATA" => "a:4:{s:10:\"yandex_lat\";d:55.754638;s:10:\"yandex_lon\";d:37.621633;s:12:\"yandex_scale\";i:17;s:10:\"PLACEMARKS\";a:1:{i:0;a:3:{s:3:\"LON\";d:37.621633;s:3:\"LAT\";d:55.754638;s:4:\"TEXT\";s:12:\"Мы тут!\";}}}",
					"MAP_HEIGHT" => "500",
					"MAP_ID" => "",
					"MAP_WIDTH" => "auto",
					"OPTIONS" => array(
						0 => "ENABLE_SCROLL_ZOOM",
						1 => "ENABLE_DBLCLICK_ZOOM",
						2 => "ENABLE_DRAGGING",
					)
				),
			false
			);
		}else{
			$APPLICATION->IncludeComponent(
				"bitrix:map.google.view", 
				".default", 
				array(
					"API_KEY" => "AIzaSyCBhi3RY8c2SfTsUsacDs_Wi23lKlvb9RY",
					"COMPONENT_TEMPLATE" => "map",
					"CONTROLS" => array(0=>"SMALL_ZOOM_CONTROL",1=>"TYPECONTROL",2=>"SCALELINE",),
					"INIT_MAP_TYPE" => "ROADMAP",
					"MAP_DATA" => "a:4:{s:10:\"google_lat\";d:55.754638;s:10:\"google_lon\";d:37.621633;s:12:\"google_scale\";i:17;s:10:\"PLACEMARKS\";a:1:{i:0;a:3:{s:3:\"LON\";d:37.621633;s:3:\"LAT\";d:55.754638;s:4:\"TEXT\";s:12:\"Мы тут!\";}}}",
					"MAP_HEIGHT" => "450",
					"MAP_ID" => "gm_1",
					"MAP_WIDTH" => "100%",
					"OPTIONS" => array(0=>"ENABLE_DBLCLICK_ZOOM",1=>"ENABLE_DRAGGING",)
				),
				false
			);
		}
		?>
	</p><p>
		<br>
		<small><a href="https://www.google.ru/maps/place/%D0%9A%D1%80%D0%B0%D1%81%D0%BD%D0%B0%D1%8F+%D0%BF%D0%BB.,+3,+1,+%D0%9C%D0%BE%D1%81%D0%BA%D0%B2%D0%B0,+101000/@55.7546025,37.6194108,17z/data=!3m1!4b1!4m5!3m4!1s0x46b54a5a1c716c07:0x39afe1961a6087a!8m2!3d55.7546025!4d37.6215995?hl=ru" target="_blank">Просмотреть увеличенную карту</a></small>
	</p>
	<div class="row">
		<div class="col-md-6">
			<h2>Задать вопрос:</h2>
			 <?$APPLICATION->IncludeComponent(
	"bitrix:main.feedback",
	"",
	Array(
		"EMAIL_TO" => "sale@foodhouse.ru",
		"EVENT_MESSAGE_ID" => array(0=>"7"),
		"OK_TEXT" => "Спасибо, ваше сообщение принято.",
		"REQUIRED_FIELDS" => array(),
		"USE_CAPTCHA" => "Y"
	)
);?>
		</div>
		<div class="col-md-6">
			<h2>Наш адрес:</h2>
			<p>
				101000, г. Москва, ул. Красная площадь, д. 3, офис 1
			</p>
			<h2>Телефоны:</h2>
			<p>
                <span itemprop="telephone"><a href="tel:+74951234567">#SALE_PHONE#</a></span> (отдел продаж)<br>
                <span itemprop="telephone"><a href="tel:+74950000000">+ 7 495 000 0000</a></span> (отдел поддержки)
			</p>
		</div>
	</div>
</div><?require($_SERVER["DOCUMENT_ROOT"]."/bitrix/footer.php")?>