<? if (!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED !== true) die();
IncludeTemplateLangFile(__FILE__); ?>
		<? if ($_REQUEST["open_popup"] != "Y") { ?>
						</div>
					</div>

					<div class="left_side_container<?echo bclass();?>">
						<div class="sidebar-filter"></div>
							<!--sidebar-menu--right-->
							<!--sidebar-menu--down-->
						<div id="left_side" class="sidebar-menu sidebar-menu--down">
                        	<?$APPLICATION->IncludeComponent(
	"bitrix:menu", 
	"left_menu", 
	array(
		"ROOT_MENU_TYPE" => "left",
		"MENU_CACHE_TYPE" => "A",
		"MENU_CACHE_TIME" => "36000000",
		"MENU_CACHE_USE_GROUPS" => "Y",
		"MENU_THEME" => "site",
		"CACHE_SELECTED_ITEMS" => "Y",
		"MENU_CACHE_GET_VARS" => array(
		),
		"MAX_LEVEL" => "4",
		"CHILD_MENU_TYPE" => "left",
		"USE_EXT" => "Y",
		"DELAY" => "N",
		"ALLOW_MULTI_SELECT" => "N",
		"COMPONENT_TEMPLATE" => "left_menu"
	),
	false
);?>
						</div>
						<?if(CGetfood::getOption("BLOCK_BANNERS_IN_LEFT_SIDEBAR")== 'true'){?>
							<div id="left_sideApp" class="radius5">
								<?$APPLICATION->IncludeComponent("bitrix:main.include", "", array("AREA_FILE_SHOW" => "file", "PATH" => SITE_DIR."include/dop_left_menu.php"), false);?>
							</div>
						<?}?>
						<?if(CGetfood::getOption("BLOCK_SUBS_IN_LEFT_SIDEBAR")== 'true'){?>
							<div id="left_sideSubscribe" class="radius5">
								<?$APPLICATION->IncludeComponent("bitrix:main.include", "", array("AREA_FILE_SHOW" => "file", "PATH" => SITE_DIR."include/agreement/agreement_left_subscribe.php"), false);?>
							</div>
						<?}?>
					</div>

					<div style="clear:both"></div>
					<footer>
						<div class="box padding">
							<div class="row">
								<div class="col-lg-6 col-md-6 col-sm-6 footer-left-col">
									<?$APPLICATION->IncludeComponent("bitrix:main.include", "", array("AREA_FILE_SHOW" => "file", "PATH" => SITE_DIR."include/footer_text.php"), false);?>
								</div>
								<div class="col-lg-6 col-md-6 col-sm-6 footer-right-col">
									<?$APPLICATION->IncludeComponent("bitrix:main.include", "", array("AREA_FILE_SHOW" => "file", "PATH" => SITE_DIR."include/footer_text2.php"), false);?>
								</div>
							</div>
							<div class="row">
								<div class="col-lg-6 col-md-6 col-sm-6 footer-socials-col">
									<?if(CGetfood::getOption("BLOCK_SOCNETS_IN_FOOTER")== 'true'){?>
										<div class="socials">
											<?=GetMessage("STUDIOFACT_SOCIALS");?><br />
											<?$APPLICATION->IncludeComponent("bitrix:main.include", "", array("AREA_FILE_SHOW" => "file", "PATH" => SITE_DIR."include/footer_socials.php"), false);?>
										</div>
									<?}?>
								</div>
								<div class="col-lg-6 col-md-6 col-sm-6">
									<div id="bx-composite-banner" class="bitrix-btn"></div>

<!--									<a class="bitrix-btn" href="#"></a>-->
								</div>
							</div>
						</div>
						<?//$APPLICATION->IncludeComponent("bitrix:main.include", "", array("AREA_FILE_SHOW" => "file", "PATH" => SITE_DIR."include/logic_box.php"), false);?>





                    </footer>
					<script type="text/javascript">
						$(function() {
							$(window).scroll(function() {
								if($(this).scrollTop() != 0) {
									$('.scroll-to-top').fadeIn();
								} else {
									$('.scroll-to-top').fadeOut();
								}
							});
							$('#topNubex').click(function() {
								$('body,html').animate({scrollTop:0},700);
							});
						});
					</script>
					<?if (CGetfood::getOption("UP_DISPLAY")== 'true'){ ?>
        				<a class="scroll-to-top" id="<?=($ccModule ? CGetfood::getOption("UP_FORM") : 'scroll-2')?>-<?=($ccModule ? CGetfood::getOption("UP_LOCATION") : 'right')?>" href="#"></a>
        			<?}?>
            </div>



            </div>
		</div>
		<? $APPLICATION->IncludeComponent("bitrix:main.include", "", array("AREA_FILE_SHOW" => "file", "PATH" => SITE_DIR."include/feedback_form.php"), false); ?>

        <? $APPLICATION->IncludeComponent("bitrix:main.include", "", array("AREA_FILE_SHOW" => "file", "PATH" => SITE_DIR."include/metrics.php"), false); ?>
		<? } else { ?>
			<script type="text/javascript">$(document).ready(function () { $("#bx-composite-banner").remove(); });
</script>
		<? } ?>
		<div id="sfp_add_to_basket_head" style="display: none;"><?=GetMessage("SFP_ADD_TO_BASKET_HEAD");
?></div>
		<div id="sfp_show_offers_head" style="display: none;"><?=GetMessage("SFP_SHOW_OFFERS_HEAD");
?></div>
        <div class="success_fast_order" style="display: none;"><?=GetMessage("SUCCESS_FAST_ORDER");?></div>
		<div style="display:none" id="oneClickModal">
			<div class="order_by_click">
				<div class="popup_head"><?=GetMessage("SF_SMALL_BUY_ONE_CLICK");?></div>
				<div class="feedback_form_prop_line">
					<label for="SMALL_BASKET_ORDER_PHONE"><?=GetMessage("SF_SMALL_BUY_LABEL");?></label>
					<input type="tel" class="" name="SMALL_BASKET_ORDER_PHONE" id="SMALL_BASKET_ORDER_PHONE" value="" placeholder="">
				</div>
				<div class="user-agree-checkbox">
                    <?$APPLICATION->IncludeComponent("bitrix:main.include", "", array("AREA_FILE_SHOW" => "file", "PATH" => SITE_DIR."include/agreement/agreement_one_click.php"), false);?>
				</div>
			    <a href="javascript: void(0);" class="button small_basket_hover_buy_go inline" id="small_basket_hover_buy_go">
                    <?=GetMessage("SF_SMALL_BUY_GO");?>
                </a>
		    </div>
		</div>
		<div style="display:none" id="buyOneProductModal">
			<div class="order_by_click">
				<div class="popup_head"><?=GetMessage("SF_SMALL_BUY_ONE_CLICK");?></div>
				<div class="feedback_form_prop_line">
					<label for="SMALL_BASKET_ORDER_PHONE"><?=GetMessage("SF_SMALL_BUY_LABEL");?></label>
					<input type="tel" class="" name="SMALL_BASKET_ORDER_PHONE" id="SMALL_BASKET_ORDER_PHONE" value="" placeholder="">
				</div>
				<div class="user-agree-checkbox">
                    <?$APPLICATION->IncludeComponent("bitrix:main.include", "", array("AREA_FILE_SHOW" => "file", "PATH" => SITE_DIR."include/agreement/agreement_one_click_modal.php"), false);?>
				</div>
				<a href="javascript: void(0);" class="button buy_one_click_product inline" id="buy_one_click_product">
					<?=GetMessage("SF_SMALL_BUY_GO");?>
				</a>
			</div>
		</div>
	</body>
</html>
