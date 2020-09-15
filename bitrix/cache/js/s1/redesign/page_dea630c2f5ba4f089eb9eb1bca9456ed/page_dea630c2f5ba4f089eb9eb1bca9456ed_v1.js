
; /* Start:"a:4:{s:4:"full";s:86:"/bitrix/templates/redesign/components/bitrix/catalog/.default/script.js?15796356262075";s:6:"source";s:71:"/bitrix/templates/redesign/components/bitrix/catalog/.default/script.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/
/**
 * Купить в 1 клик
 */
BX.ready(function () {
	var submitBtn = BX('buy_one_click_product');
	BX.bind(submitBtn, 'click', function () {
		BX.onCustomEvent('buy-one-click-product', []);
	});

	if (!BX.UserConsent) {
		return;
	}

	var control = BX.UserConsent.load(BX('buyOneProductModal'));
	if (!control) {
		return;
	}

	BX.addCustomEvent(
		control,
		BX.UserConsent.events.save,
		function (data) {
			console.log('js event:', 'save', data);

			var phone = $("#SMALL_BASKET_ORDER_PHONE").val().replace(/[^0-9]/g, ''),
				product_id, quantity, getParams,
				path;

			if (phone.length != 11) {
				$("#SMALL_BASKET_ORDER_PHONE").addClass("red_border");
				setTimeout(function() { $("#SMALL_BASKET_ORDER_PHONE").removeClass("red_border") }, 1000);
			} else {
				// закрытие предыдущей модалки
				$.fancybox.close();

				product_id = $('.bx_item_detail').attr('data-product-id');
				quantity = $('.product-quantity-wrapper .item_quantity input').val();
				getParams = "update_small_basket=Y&SMALL_BASKET_FAST_ORDER=Y&product_id=" + product_id + "&quantity=" + quantity + "&SMALL_BASKET_ORDER_PHONE=" + $("#SMALL_BASKET_ORDER_PHONE").val();

				// если в текущем документе нет малой корзины, значить кликнули внутри модалки быстрый просмотр
				path = $("#small_basket_box").attr("data-path");
				if (!path) {
					path = parent.$("#small_basket_box").attr("data-path");
				}

				$.ajax({
					data: getParams,
					url: path,
					async: true,
					cache: false,
					success: function (response) {
						// вывод сообщения
						var html = '<div class="success_fast_order">' + response + '</div>';
						$.fancybox.open(html, {
							autoSize : false,
							autoResize : true,
							autoCenter : true,
							openEffect : "fade",
							closeEffect : "fade",
							width: "auto",
							height: "auto",
							helpers: {
								overlay: {
									locked: false
								}
							}
						});
					}
				});
			}
		}
	);
});
/* End */
;
; /* Start:"a:4:{s:4:"full";s:93:"/bitrix/templates/redesign/components/bitrix/catalog.element/visual/script.js?157963564787265";s:6:"source";s:77:"/bitrix/templates/redesign/components/bitrix/catalog.element/visual/script.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/
var total = 0;
(function(window){
	'use strict';
	if (window.JCCatalogElement)
		return;

	var BasketButton = function(params)
	{
		BasketButton.superclass.constructor.apply(this, arguments);
		this.buttonNode = BX.create('SPAN', {
			props: {className: 'btn btn-default btn-buy', id: this.id},
			style: typeof params.style === 'object' ? params.style : {},
			text: params.text,
			events: this.contextEvents
		});

		if (BX.browser.IsIE())
		{
			this.buttonNode.setAttribute('hideFocus', 'hidefocus');
		}
	};
	BX.extend(BasketButton, BX.PopupWindowButton);

	window.JCCatalogElement = function(arParams)
	{
		this.productType = 0;

		this.config = {
			useCatalog: true,
			showQuantity: true,
			showPrice: true,
			showAbsent: true,
			showOldPrice: false,
			showPercent: false,
			showSkuProps: false,
			showOfferGroup: false,
			useCompare: false,
			useStickers: false,
			useSubscribe: false,
			usePopup: false,
			useMagnifier: false,
			usePriceRanges: false,
			basketAction: ['BUY'],
			showClosePopup: false,
			templateTheme: '',
			showSlider: false,
			sliderInterval: 5000,
			useEnhancedEcommerce: false,
			dataLayerName: 'dataLayer',
			brandProperty: false,
			alt: '',
			title: '',
			magnifierZoomPercent: 200
		};

		this.checkQuantity = false;
		this.maxQuantity = 0;
		this.minQuantity = 0;
		this.stepQuantity = 1;
		this.isDblQuantity = false;
		this.canBuy = true;
		this.isGift = false;
		this.canSubscription = true;
		this.currentIsSet = false;
		this.updateViewedCount = false;

		this.currentPriceMode = '';
		this.currentPrices = [];
		this.currentPriceSelected = 0;
		this.currentQuantityRanges = [];
		this.currentQuantityRangeSelected = 0;

		this.precision = 6;
		this.precisionFactor = Math.pow(10, this.precision);

		this.visual = {};
		this.basketMode = '';
		this.product = {
			checkQuantity: false,
			maxQuantity: 0,
			stepQuantity: 1,
			startQuantity: 1,
			isDblQuantity: false,
			canBuy: true,
			canSubscription: true,
			name: '',
			pict: {},
			id: 0,
			addUrl: '',
			buyUrl: '',
			slider: {},
			sliderCount: 0,
			useSlider: false,
			sliderPict: []
		};
		this.mess = {};

		this.basketData = {
			useProps: false,
			emptyProps: false,
			quantity: 'quantity',
			props: 'prop',
			basketUrl: '',
			sku_props: '',
			sku_props_var: 'basket_props',
			add_url: '',
			buy_url: ''
		};
		this.compareData = {
			compareUrl: '',
			compareDeleteUrl: '',
			comparePath: ''
		};

		this.defaultPict = {
			preview: null,
			detail: null
		};

		this.offers = [];
		this.offerNum = 0;
		this.treeProps = [];
		this.selectedValues = {};

		this.mouseTimer = null;
		this.isTouchDevice = BX.hasClass(document.documentElement, 'bx-touch');
		this.touch = null;
		this.slider = {
			interval: null,
			progress: null,
			paused: null,
			controls: []
		};

		this.obProduct = null;
		this.obQuantity = null;
		this.obQuantityUp = null;
		this.obQuantityDown = null;
		this.obPrice = {
			price: null,
			full: null,
			discount: null,
			percent: null,
			total: null
		};
		this.obTree = null;
		this.obPriceRanges = null;
		this.obBuyBtn = null;
		this.obAddToBasketBtn = null;
		this.obBasketActions = null;
		this.obNotAvail = null;
		this.obSubscribe = null;
		this.obSkuProps = null;
		this.obMainSkuProps = null;
		this.obBigSlider = null;
		this.obMeasure = null;
		this.obQuantityLimit = {
			all: null,
			value: null
		};
		this.obCompare = null;
		this.obTabsPanel = null;

		this.node = {};
		// top panel small card
		this.smallCardNodes = {};

		this.magnify = {
			enabled: false,
			obBigImg: null,
			obBigSlider: null,
			height: 0,
			width: 0,
			timer: 0
		};
		this.currentImg = {
			id: 0,
			src: '',
			width: 0,
			height: 0
		};
		this.viewedCounter = {
			path: '/bitrix/components/bitrix/catalog.element/ajax.php',
			params: {
				AJAX: 'Y',
				SITE_ID: '',
				PRODUCT_ID: 0,
				PARENT_ID: 0
			}
		};

		this.obPopupWin = null;
		this.basketUrl = '';
		this.basketParams = {};

		this.errorCode = 0;

		if (typeof arParams === 'object')
		{
			this.params = arParams;
			this.initConfig();

			if (this.params.MESS)
			{
				this.mess = this.params.MESS;
			}

			switch (this.productType)
			{
				case 0: // no catalog
				case 1: // product
				case 2: // set
					this.initProductData();
					break;
				case 3: // sku
					this.initOffersData();
					break;
				default:
					this.errorCode = -1;
			}

			this.initBasketData();
			this.initCompareData();
		}

		if (this.errorCode === 0)
		{
			BX.ready(BX.delegate(this.init, this));
		}

		this.params = {};

		BX.addCustomEvent('onSaleProductIsGift', BX.delegate(this.onSaleProductIsGift, this));
		BX.addCustomEvent('onSaleProductIsNotGift', BX.delegate(this.onSaleProductIsNotGift, this));
	};

	window.JCCatalogElement.prototype = {
		getEntity: function(parent, entity, additionalFilter)
		{
			if (!parent || !entity)
				return null;

			additionalFilter = additionalFilter || '';

			return parent.querySelector(additionalFilter + '[data-entity="' + entity + '"]');
		},

		getEntities: function(parent, entity, additionalFilter)
		{
			if (!parent || !entity)
				return {length: 0};

			additionalFilter = additionalFilter || '';

			return parent.querySelectorAll(additionalFilter + '[data-entity="' + entity + '"]');
		},

		onSaleProductIsGift: function(productId, offerId)
		{
			if (offerId && this.offers && this.offers[this.offerNum].ID == offerId)
			{
				this.setGift();
			}
		},

		onSaleProductIsNotGift: function(productId, offerId)
		{
			if (offerId && this.offers && this.offers[this.offerNum].ID == offerId)
			{
				this.restoreSticker();
				this.isGift = false;
				this.setPrice();
			}
		},

		reloadGiftInfo: function()
		{
			if (this.productType === 3)
			{
				this.checkQuantity = true;
				this.maxQuantity = 1;

				this.setPrice();
				this.redrawSticker({text: BX.message('PRODUCT_GIFT_LABEL')});
			}
		},

		setGift: function()
		{
			if (this.productType === 3)
			{
				// sku
				this.isGift = true;
			}

			if (this.productType === 1 || this.productType === 2)
			{
				// simple
				this.isGift = true;
			}

			if (this.productType === 0)
			{
				this.isGift = false;
			}

			this.reloadGiftInfo();
		},

		setOffer: function(offerNum)
		{
			this.offerNum = parseInt(offerNum);
			this.setCurrent();
		},

		init: function()
		{
			var i = 0,
				j = 0,
				treeItems = null;

			this.obProduct = BX(this.visual.ID);
			if (!this.obProduct)
			{
				this.errorCode = -1;
			}

			this.obBigSlider = BX(this.visual.BIG_SLIDER_ID);
			this.node.imageContainer = this.getEntity(this.obProduct, 'images-container');
			this.node.imageSliderBlock = this.getEntity(this.obProduct, 'images-slider-block');
			this.node.sliderProgressBar = this.getEntity(this.obProduct, 'slider-progress-bar');
			this.node.sliderControlLeft = this.getEntity(this.obBigSlider, 'slider-control-left');
			this.node.sliderControlRight = this.getEntity(this.obBigSlider, 'slider-control-right');

			if (!this.obBigSlider || !this.node.imageContainer || !this.node.imageContainer)
			{
				this.errorCode = -2;
			}

			if (this.config.showPrice)
			{
				this.obPrice.price = BX(this.visual.PRICE_ID);
				if (!this.obPrice.price && this.config.useCatalog)
				{
					this.errorCode = -16;
				}
				else
				{
					this.obPrice.total = BX(this.visual.PRICE_TOTAL);

					if (this.config.showOldPrice)
					{
						this.obPrice.full = BX(this.visual.OLD_PRICE_ID);
						this.obPrice.discount = BX(this.visual.DISCOUNT_PRICE_ID);

						if (!this.obPrice.full || !this.obPrice.discount)
						{
							this.config.showOldPrice = false;
						}
					}

					if (this.config.showPercent)
					{
						this.obPrice.percent = BX(this.visual.DISCOUNT_PERCENT_ID);
						if (!this.obPrice.percent)
						{
							this.config.showPercent = false;
						}
					}
				}

				this.obBasketActions = BX(this.visual.BASKET_ACTIONS_ID);
				if (this.obBasketActions)
				{
					if (BX.util.in_array('BUY', this.config.basketAction))
					{
						this.obBuyBtn = BX(this.visual.BUY_LINK);
					}

					if (BX.util.in_array('ADD', this.config.basketAction))
					{
						this.obAddToBasketBtn = BX(this.visual.ADD_BASKET_LINK);
					}
				}
				this.obNotAvail = BX(this.visual.NOT_AVAILABLE_MESS);
			}

			if (this.config.showQuantity)
			{
				this.obQuantity = BX(this.visual.QUANTITY_ID);
				this.node.quantity = this.getEntity(this.obProduct, 'quantity-block');
				if (this.visual.QUANTITY_UP_ID)
				{
					this.obQuantityUp = BX(this.visual.QUANTITY_UP_ID);
				}

				if (this.visual.QUANTITY_DOWN_ID)
				{
					this.obQuantityDown = BX(this.visual.QUANTITY_DOWN_ID);
				}
			}

			if (this.productType === 3)
			{
				if (this.visual.TREE_ID)
				{
					this.obTree = BX(this.visual.TREE_ID);
					if (!this.obTree)
					{
						this.errorCode = -256;
					}
				}

				if (this.visual.QUANTITY_MEASURE)
				{
					this.obMeasure = BX(this.visual.QUANTITY_MEASURE);
				}

				if (this.visual.QUANTITY_LIMIT && this.config.showMaxQuantity !== 'N')
				{
					this.obQuantityLimit.all = BX(this.visual.QUANTITY_LIMIT);
					if (this.obQuantityLimit.all)
					{
						this.obQuantityLimit.value = this.getEntity(this.obQuantityLimit.all, 'quantity-limit-value');
						if (!this.obQuantityLimit.value)
						{
							this.obQuantityLimit.all = null;
						}
					}
				}

				if (this.config.usePriceRanges)
				{
					this.obPriceRanges = this.getEntity(this.obProduct, 'price-ranges-block');
				}
			}

			if (this.config.showSkuProps)
			{
				this.obSkuProps = BX(this.visual.DISPLAY_PROP_DIV);
				this.obMainSkuProps = BX(this.visual.DISPLAY_MAIN_PROP_DIV);
			}

			if (this.config.useCompare)
			{
				this.obCompare = BX(this.visual.COMPARE_LINK);
			}

			if (this.config.useSubscribe)
			{
				this.obSubscribe = BX(this.visual.SUBSCRIBE_LINK);
			}

			this.obTabs = BX(this.visual.TABS_ID);
			this.obTabContainers = BX(this.visual.TAB_CONTAINERS_ID);
			this.obTabsPanel = BX(this.visual.TABS_PANEL_ID);

			this.smallCardNodes.panel = BX(this.visual.SMALL_CARD_PANEL_ID);
			if (this.smallCardNodes.panel)
			{
				this.smallCardNodes.picture = this.getEntity(this.smallCardNodes.panel, 'panel-picture');
				this.smallCardNodes.title = this.getEntity(this.smallCardNodes.panel, 'panel-title');
				this.smallCardNodes.price = this.getEntity(this.smallCardNodes.panel, 'panel-price');
				this.smallCardNodes.sku = this.getEntity(this.smallCardNodes.panel, 'panel-sku-container');
				this.smallCardNodes.oldPrice = this.getEntity(this.smallCardNodes.panel, 'panel-old-price');
				this.smallCardNodes.buyButton = this.getEntity(this.smallCardNodes.panel, 'panel-buy-button');
				this.smallCardNodes.addButton = this.getEntity(this.smallCardNodes.panel, 'panel-add-button');
				this.smallCardNodes.notAvailableButton = this.getEntity(this.smallCardNodes.panel, 'panel-not-available-button');
				this.smallCardNodes.aligner = this.getEntity(this.obProduct, 'main-button-container');
			}

			this.initPopup();
			this.initTabs();

			if (this.smallCardNodes.panel)
			{
				this.smallCardNodes.picture && BX.bind(this.smallCardNodes.picture.parentNode, 'click', BX.proxy(this.scrollToProduct, this));
				this.smallCardNodes.title && BX.bind(this.smallCardNodes.title, 'click', BX.proxy(this.scrollToProduct, this));
				this.smallCardNodes.sku && BX.bind(this.smallCardNodes.sku, 'click', BX.proxy(this.scrollToProduct, this));
			}

			if (this.obTabsPanel || this.smallCardNodes.panel)
			{
				this.checkTopPanels();
				BX.bind(window, 'scroll', BX.proxy(this.checkTopPanels, this));
			}
			if (this.errorCode === 0)
			{
				// product slider events
				if (this.config.showSlider && !this.isTouchDevice)
				{
					BX.bind(this.obBigSlider, 'mouseenter', BX.proxy(this.stopSlider, this));
					BX.bind(this.obBigSlider, 'mouseleave', BX.proxy(this.cycleSlider, this));
				}

				if (this.isTouchDevice)
				{
					BX.bind(this.node.imageContainer, 'touchstart', BX.proxy(this.touchStartEvent, this));
					BX.bind(this.node.imageContainer, 'touchend', BX.proxy(this.touchEndEvent, this));
					BX.bind(this.node.imageContainer, 'touchcancel', BX.proxy(this.touchEndEvent, this));
				}

				BX.bind(this.node.sliderControlLeft, 'click', BX.proxy(this.slidePrev, this));
				BX.bind(this.node.sliderControlRight, 'click', BX.proxy(this.slideNext, this));

				if (this.config.showQuantity)
				{
					if (this.obQuantityUp)
					{
						BX.bind(this.obQuantityUp, 'click', BX.delegate(this.quantityUp, this));
					}

					if (this.obQuantityDown)
					{
						BX.bind(this.obQuantityDown, 'click', BX.delegate(this.quantityDown, this));
					}

					if (this.obQuantity)
					{
						BX.bind(this.obQuantity, 'change', BX.delegate(this.quantityChange, this));
					}
				}
				switch (this.productType)
				{
					case 0: // no catalog
					case 1: // product
					case 2: // set
						if (this.product.useSlider)
						{
							this.product.slider = {
								ID: this.visual.SLIDER_CONT_ID,
								CONT: BX(this.visual.SLIDER_CONT_ID),
								COUNT: this.product.sliderCount
							};
							this.product.slider.ITEMS = this.getEntities(this.product.slider.CONT, 'slider-control');
							for (j = 0; j < this.product.slider.ITEMS.length; j++)
							{
								BX.bind(this.product.slider.ITEMS[j], 'mouseenter', BX.delegate(this.onSliderControlHover, this));
								BX.bind(this.product.slider.ITEMS[j], 'mouseleave', BX.delegate(this.onSliderControlLeave, this));
								BX.bind(this.product.slider.ITEMS[j], 'click', BX.delegate(this.selectSliderImg, this));
							}

							this.setCurrentImg(this.product.sliderPict[0], true, true);
							this.checkSliderControls(this.product.sliderCount);

							if (this.product.slider.ITEMS.length > 1)
							{
								this.initSlider();
							}
						}

						this.checkQuantityControls();
						this.fixFontCheck();
						this.setAnalyticsDataLayer('showDetail');
						break;
					case 3: // sku
						treeItems = this.obTree.querySelectorAll('li');
						for (i = 0; i < treeItems.length; i++)
						{
							BX.bind(treeItems[i], 'click', BX.delegate(this.selectOfferProp, this));
						}

						for (i = 0; i < this.offers.length; i++)
						{
							this.offers[i].SLIDER_COUNT = parseInt(this.offers[i].SLIDER_COUNT, 10) || 0;

							if (this.offers[i].SLIDER_COUNT === 0)
							{
								this.slider.controls[i] = {
									ID: '',
									COUNT: this.offers[i].SLIDER_COUNT,
									ITEMS: []
								};
							}
							else
							{
								for (j = 0; j < this.offers[i].SLIDER.length; j++)
								{
									this.offers[i].SLIDER[j].WIDTH = parseInt(this.offers[i].SLIDER[j].WIDTH, 10);
									this.offers[i].SLIDER[j].HEIGHT = parseInt(this.offers[i].SLIDER[j].HEIGHT, 10);
								}

								this.slider.controls[i] = {
									ID: this.visual.SLIDER_CONT_OF_ID + this.offers[i].ID,
									OFFER_ID: this.offers[i].ID,
									CONT: BX(this.visual.SLIDER_CONT_OF_ID + this.offers[i].ID),
									COUNT: this.offers[i].SLIDER_COUNT
								};

								this.slider.controls[i].ITEMS = this.getEntities(this.slider.controls[i].CONT, 'slider-control');
								for (j = 0; j < this.slider.controls[i].ITEMS.length; j++)
								{
									BX.bind(this.slider.controls[i].ITEMS[j], 'mouseenter', BX.delegate(this.onSliderControlHover, this));
									BX.bind(this.slider.controls[i].ITEMS[j], 'mouseleave', BX.delegate(this.onSliderControlLeave, this));
									BX.bind(this.slider.controls[i].ITEMS[j], 'click', BX.delegate(this.selectSliderImg, this));
								}
							}
						}

						this.setCurrent();
						break;
				}

				this.obBuyBtn && BX.bind(this.obBuyBtn, 'click', BX.proxy(this.buyBasket, this));
				this.smallCardNodes.buyButton && BX.bind(this.smallCardNodes.buyButton, 'click', BX.proxy(this.buyBasket, this));

				this.obAddToBasketBtn && BX.bind(this.obAddToBasketBtn, 'click', BX.proxy(this.add2Basket, this));
				this.smallCardNodes.addButton && BX.bind(this.smallCardNodes.addButton, 'click', BX.proxy(this.add2Basket, this));

				if (this.obCompare)
				{
					BX.bind(this.obCompare, 'click', BX.proxy(this.compare, this));
					BX.addCustomEvent('onCatalogDeleteCompare', BX.proxy(this.checkDeletedCompare, this));
				}
			}
		},

		initConfig: function()
		{
			if (this.params.PRODUCT_TYPE)
			{
				this.productType = parseInt(this.params.PRODUCT_TYPE, 10);
			}

			if (this.params.CONFIG.USE_CATALOG !== 'undefined' && BX.type.isBoolean(this.params.CONFIG.USE_CATALOG))
			{
				this.config.useCatalog = this.params.CONFIG.USE_CATALOG;
			}

			this.config.showQuantity = this.params.CONFIG.SHOW_QUANTITY;
			this.config.showPrice = this.params.CONFIG.SHOW_PRICE;
			this.config.showPercent = this.params.CONFIG.SHOW_DISCOUNT_PERCENT;
			this.config.showOldPrice = this.params.CONFIG.SHOW_OLD_PRICE;
			this.config.showSkuProps = this.params.CONFIG.SHOW_SKU_PROPS;
			this.config.showOfferGroup = this.params.CONFIG.OFFER_GROUP;
			this.config.useCompare = this.params.CONFIG.DISPLAY_COMPARE;
			this.config.useStickers = this.params.CONFIG.USE_STICKERS;
			this.config.useSubscribe = this.params.CONFIG.USE_SUBSCRIBE;
			this.config.showMaxQuantity = this.params.CONFIG.SHOW_MAX_QUANTITY;
			this.config.relativeQuantityFactor = parseInt(this.params.CONFIG.RELATIVE_QUANTITY_FACTOR);
			this.config.usePriceRanges = this.params.CONFIG.USE_PRICE_COUNT;

			if (this.params.CONFIG.MAIN_PICTURE_MODE)
			{
				this.config.usePopup = BX.util.in_array('POPUP', this.params.CONFIG.MAIN_PICTURE_MODE);
				this.config.useMagnifier = BX.util.in_array('MAGNIFIER', this.params.CONFIG.MAIN_PICTURE_MODE);
			}

			if (this.params.CONFIG.ADD_TO_BASKET_ACTION)
			{
				this.config.basketAction = this.params.CONFIG.ADD_TO_BASKET_ACTION;
			}

			this.config.showClosePopup = this.params.CONFIG.SHOW_CLOSE_POPUP;
			this.config.templateTheme = this.params.CONFIG.TEMPLATE_THEME || '';
			this.config.showSlider = this.params.CONFIG.SHOW_SLIDER === 'Y';

			if (this.config.showSlider && !this.isTouchDevice)
			{
				this.config.sliderInterval = parseInt(this.params.CONFIG.SLIDER_INTERVAL) || 5000;
			}
			else
			{
				this.config.sliderInterval = false;
			}

			this.config.useEnhancedEcommerce = this.params.CONFIG.USE_ENHANCED_ECOMMERCE === 'Y';
			this.config.dataLayerName = this.params.CONFIG.DATA_LAYER_NAME;
			this.config.brandProperty = this.params.CONFIG.BRAND_PROPERTY;

			this.config.alt = this.params.CONFIG.ALT || '';
			this.config.title = this.params.CONFIG.TITLE || '';

			this.config.magnifierZoomPercent = parseInt(this.params.CONFIG.MAGNIFIER_ZOOM_PERCENT) || 200;

			if (!this.params.VISUAL || typeof this.params.VISUAL !== 'object' || !this.params.VISUAL.ID)
			{
				this.errorCode = -1;
				return;
			}

			this.visual = this.params.VISUAL;
		},

		initProductData: function()
		{
			var j = 0;

			if (this.params.PRODUCT && typeof this.params.PRODUCT === 'object')
			{
				if (this.config.showQuantity)
				{
					this.product.checkQuantity = this.params.PRODUCT.CHECK_QUANTITY;
					this.product.isDblQuantity = this.params.PRODUCT.QUANTITY_FLOAT;

					if (this.config.showPrice)
					{
						this.currentPriceMode = this.params.PRODUCT.ITEM_PRICE_MODE;
						this.currentPrices = this.params.PRODUCT.ITEM_PRICES;
						this.currentPriceSelected = this.params.PRODUCT.ITEM_PRICE_SELECTED;
						this.currentQuantityRanges = this.params.PRODUCT.ITEM_QUANTITY_RANGES;
						this.currentQuantityRangeSelected = this.params.PRODUCT.ITEM_QUANTITY_RANGE_SELECTED;
					}

					if (this.product.checkQuantity)
					{
						this.product.maxQuantity = this.product.isDblQuantity
							? parseFloat(this.params.PRODUCT.MAX_QUANTITY)
							: parseInt(this.params.PRODUCT.MAX_QUANTITY, 10);
					}

					this.product.stepQuantity = this.product.isDblQuantity
						? parseFloat(this.params.PRODUCT.STEP_QUANTITY)
						: parseInt(this.params.PRODUCT.STEP_QUANTITY, 10);
					this.checkQuantity = this.product.checkQuantity;
					this.isDblQuantity = this.product.isDblQuantity;
					this.stepQuantity = this.product.stepQuantity;
					this.maxQuantity = this.product.maxQuantity;
					this.minQuantity = this.currentPriceMode === 'Q' ? parseFloat(this.currentPrices[this.currentPriceSelected].MIN_QUANTITY) : this.stepQuantity;

					if (this.isDblQuantity)
					{
						this.stepQuantity = Math.round(this.stepQuantity * this.precisionFactor) / this.precisionFactor;
					}
				}

				this.product.canBuy = this.params.PRODUCT.CAN_BUY;
				this.canSubscription = this.product.canSubscription = this.params.PRODUCT.SUBSCRIPTION;

				this.product.name = this.params.PRODUCT.NAME;
				this.product.pict = this.params.PRODUCT.PICT;
				this.product.id = this.params.PRODUCT.ID;
				this.product.category = this.params.PRODUCT.CATEGORY;

				if (this.params.PRODUCT.ADD_URL)
				{
					this.product.addUrl = this.params.PRODUCT.ADD_URL;
				}

				if (this.params.PRODUCT.BUY_URL)
				{
					this.product.buyUrl = this.params.PRODUCT.BUY_URL;
				}

				if (this.params.PRODUCT.SLIDER_COUNT)
				{
					this.product.sliderCount = parseInt(this.params.PRODUCT.SLIDER_COUNT, 10) || 0;

					if (this.product.sliderCount > 0 && this.params.PRODUCT.SLIDER.length)
					{
						for (j = 0; j < this.params.PRODUCT.SLIDER.length; j++)
						{
							this.product.useSlider = true;
							this.params.PRODUCT.SLIDER[j].WIDTH = parseInt(this.params.PRODUCT.SLIDER[j].WIDTH, 10);
							this.params.PRODUCT.SLIDER[j].HEIGHT = parseInt(this.params.PRODUCT.SLIDER[j].HEIGHT, 10);
						}

						this.product.sliderPict = this.params.PRODUCT.SLIDER;
						this.setCurrentImg(this.product.sliderPict[0], false);
					}
				}

				this.currentIsSet = true;
			}
			else
			{
				this.errorCode = -1;
			}
		},

		initOffersData: function()
		{
			if (this.params.OFFERS && BX.type.isArray(this.params.OFFERS))
			{
				this.offers = this.params.OFFERS;
				this.offerNum = 0;

				if (this.params.OFFER_SELECTED)
				{
					this.offerNum = parseInt(this.params.OFFER_SELECTED, 10) || 0;
				}

				if (this.params.TREE_PROPS)
				{
					this.treeProps = this.params.TREE_PROPS;
				}

				if (this.params.DEFAULT_PICTURE)
				{
					this.defaultPict.preview = this.params.DEFAULT_PICTURE.PREVIEW_PICTURE;
					this.defaultPict.detail = this.params.DEFAULT_PICTURE.DETAIL_PICTURE;
				}

				if (this.params.PRODUCT && typeof this.params.PRODUCT === 'object')
				{
					this.product.id = parseInt(this.params.PRODUCT.ID, 10);
					this.product.name = this.params.PRODUCT.NAME;
					this.product.category = this.params.PRODUCT.CATEGORY;
				}
			}
			else
			{
				this.errorCode = -1;
			}
		},

		initBasketData: function()
		{
			if (this.params.BASKET && typeof this.params.BASKET === 'object')
			{
				if (this.productType === 1 || this.productType === 2)
				{
					this.basketData.useProps = this.params.BASKET.ADD_PROPS;
					this.basketData.emptyProps = this.params.BASKET.EMPTY_PROPS;
				}

				if (this.params.BASKET.QUANTITY)
				{
					this.basketData.quantity = this.params.BASKET.QUANTITY;
				}

				if (this.params.BASKET.PROPS)
				{
					this.basketData.props = this.params.BASKET.PROPS;
				}

				if (this.params.BASKET.BASKET_URL)
				{
					this.basketData.basketUrl = this.params.BASKET.BASKET_URL;
				}

				if (this.productType === 3)
				{
					if (this.params.BASKET.SKU_PROPS)
					{
						this.basketData.sku_props = this.params.BASKET.SKU_PROPS;
					}
				}

				if (this.params.BASKET.ADD_URL_TEMPLATE)
				{
					this.basketData.add_url = this.params.BASKET.ADD_URL_TEMPLATE;
				}

				if (this.params.BASKET.BUY_URL_TEMPLATE)
				{
					this.basketData.buy_url = this.params.BASKET.BUY_URL_TEMPLATE;
				}

				if (this.basketData.add_url === '' && this.basketData.buy_url === '')
				{
					this.errorCode = -1024;
				}
			}
		},

		initCompareData: function()
		{
			if (this.config.useCompare)
			{
				if (this.params.COMPARE && typeof this.params.COMPARE === 'object')
				{
					if (this.params.COMPARE.COMPARE_PATH)
					{
						this.compareData.comparePath = this.params.COMPARE.COMPARE_PATH;
					}

					if (this.params.COMPARE.COMPARE_URL_TEMPLATE)
					{
						this.compareData.compareUrl = this.params.COMPARE.COMPARE_URL_TEMPLATE;
					}
					else
					{
						this.config.useCompare = false;
					}

					if (this.params.COMPARE.COMPARE_DELETE_URL_TEMPLATE)
					{
						this.compareData.compareDeleteUrl = this.params.COMPARE.COMPARE_DELETE_URL_TEMPLATE;
					}
					else
					{
						this.config.useCompare = false;
					}
				}
				else
				{
					this.config.useCompare = false;
				}
			}
		},

		initSlider: function()
		{
			if (this.node.sliderProgressBar)
			{
				if (this.slider.progress)
				{
					this.resetProgress();
				}
				else
				{
					this.slider.progress = new BX.easing({
						transition: BX.easing.transitions.linear,
						step: BX.delegate(function(state){
							this.node.sliderProgressBar.style.width = state.width / 10 + '%';
						}, this)
					});
				}
			}

			this.cycleSlider();
		},

		setAnalyticsDataLayer: function(action)
		{
			if (!this.config.useEnhancedEcommerce || !this.config.dataLayerName)
				return;

			var item = {},
				info = {},
				variants = [],
				i, k, j, propId, skuId, propValues;

			switch (this.productType)
			{
				case 0: //no catalog
				case 1: //product
				case 2: //set
					item = {
						'id': this.product.id,
						'name': this.product.name,
						'price': this.currentPrices[this.currentPriceSelected] && this.currentPrices[this.currentPriceSelected].PRICE,
						'category': this.product.category,
						'brand': BX.type.isArray(this.config.brandProperty) ? this.config.brandProperty.join('/') : this.config.brandProperty
					};
					break;
				case 3: //sku
					for (i in this.offers[this.offerNum].TREE)
					{
						if (this.offers[this.offerNum].TREE.hasOwnProperty(i))
						{
							propId = i.substring(5);
							skuId = this.offers[this.offerNum].TREE[i];

							for (k in this.treeProps)
							{
								if (this.treeProps.hasOwnProperty(k) && this.treeProps[k].ID == propId)
								{
									for (j in this.treeProps[k].VALUES)
									{
										propValues = this.treeProps[k].VALUES[j];
										if (propValues.ID == skuId)
										{
											variants.push(propValues.NAME);
											break;
										}
									}

								}
							}
						}
					}

					item = {
						'id': this.offers[this.offerNum].ID,
						'name': this.offers[this.offerNum].NAME,
						'price': this.currentPrices[this.currentPriceSelected] && this.currentPrices[this.currentPriceSelected].PRICE,
						'category': this.product.category,
						'brand': BX.type.isArray(this.config.brandProperty) ? this.config.brandProperty.join('/') : this.config.brandProperty,
						'variant': variants.join('/')
					};
					break;
			}

			switch (action)
			{
				case 'showDetail':
					info = {
						'event': 'showDetail',
						'ecommerce': {
							'currencyCode': this.currentPrices[this.currentPriceSelected] && this.currentPrices[this.currentPriceSelected].CURRENCY || '',
							'detail': {
								'products': [{
									'name': item.name || '',
									'id': item.id || '',
									'price': item.price || 0,
									'brand': item.brand || '',
									'category': item.category || '',
									'variant': item.variant || ''
								}]
							}
						}
					};
					break;
				case 'addToCart':
					info = {
						'event': 'addToCart',
						'ecommerce': {
							'currencyCode': this.currentPrices[this.currentPriceSelected] && this.currentPrices[this.currentPriceSelected].CURRENCY || '',
							'add': {
								'products': [{
									'name': item.name || '',
									'id': item.id || '',
									'price': item.price || 0,
									'brand': item.brand || '',
									'category': item.category || '',
									'variant': item.variant || '',
									'quantity': this.config.showQuantity && this.obQuantity ? this.obQuantity.value : 1
								}]
							}
						}
					};
					break;
			}

			window[this.config.dataLayerName] = window[this.config.dataLayerName] || [];
			window[this.config.dataLayerName].push(info);
		},

		initTabs: function()
		{
			var tabs = this.getEntities(this.obTabs, 'tab'),
				panelTabs = this.getEntities(this.obTabsPanel, 'tab');

			var	tabValue, targetTab, haveActive = false;

			if (tabs.length !== panelTabs.length)
				return;

			for (var i in tabs)
			{
				if (tabs.hasOwnProperty(i) && BX.type.isDomNode(tabs[i]))
				{
					tabValue = tabs[i].getAttribute('data-value');
					if (tabValue)
					{
						targetTab = this.obTabContainers.querySelector('[data-value="' + tabValue + '"]');
						if (BX.type.isDomNode(targetTab))
						{
							BX.bind(tabs[i], 'click', BX.proxy(this.changeTab, this));
							BX.bind(panelTabs[i], 'click', BX.proxy(this.changeTab, this));

							if (!haveActive)
							{
								BX.addClass(tabs[i], 'active');
								BX.addClass(panelTabs[i], 'active');
								BX.show(targetTab);
								haveActive = true;
							}
							else
							{
								BX.removeClass(tabs[i], 'active');
								BX.removeClass(panelTabs[i], 'active');
								BX.hide(targetTab);
							}
						}
					}
				}
			}
		},

		checkTouch: function(event)
		{
			if (!event || !event.changedTouches)
				return false;

			return event.changedTouches[0].identifier === this.touch.identifier;
		},

		touchStartEvent: function(event)
		{
			if (event.touches.length != 1)
				return;

			this.touch = event.changedTouches[0];
		},

		touchEndEvent: function(event)
		{
			if (!this.checkTouch(event))
				return;

			var deltaX = this.touch.pageX - event.changedTouches[0].pageX,
				deltaY = this.touch.pageY - event.changedTouches[0].pageY;

			if (Math.abs(deltaX) >= Math.abs(deltaY) + 10)
			{
				if (deltaX > 0)
				{
					this.slideNext();
				}

				if (deltaX < 0)
				{
					this.slidePrev();
				}
			}
		},

		cycleSlider: function(event)
		{
			event || (this.slider.paused = false);

			this.slider.interval && clearInterval(this.slider.interval);

			if (this.config.sliderInterval && !this.slider.paused)
			{
				if (this.slider.progress)
				{
					this.slider.progress.stop();

					var width = parseInt(this.node.sliderProgressBar.style.width);

					this.slider.progress.options.duration = this.config.sliderInterval * (100 - width) / 100;
					this.slider.progress.options.start = {width: width * 10};
					this.slider.progress.options.finish = {width: 1000};
					this.slider.progress.options.complete = BX.delegate(function(){
						this.slider.interval = true;
						this.slideNext();
					}, this);
					this.slider.progress.animate();
				}
				else
				{
					this.slider.interval = setInterval(BX.proxy(this.slideNext, this), this.config.sliderInterval);
				}
			}
		},

		stopSlider: function(event)
		{
			event || (this.slider.paused = true);

			this.slider.interval && (this.slider.interval = clearInterval(this.slider.interval));

			if (this.slider.progress)
			{
				this.slider.progress.stop();

				var width = parseInt(this.node.sliderProgressBar.style.width);

				this.slider.progress.options.duration = this.config.sliderInterval * width / 200;
				this.slider.progress.options.start = {width: width * 10};
				this.slider.progress.options.finish = {width: 0};
				this.slider.progress.options.complete = null;
				this.slider.progress.animate();
			}
		},

		resetProgress: function()
		{
			this.slider.progress && this.slider.progress.stop();
			this.node.sliderProgressBar.style.width = 0;
		},

		slideNext: function()
		{
			return this.slide('next');
		},

		slidePrev: function()
		{
			return this.slide('prev');
		},

		slide: function(type)
		{
			if (!this.product.slider || !this.product.slider.CONT)
				return;

			var active = this.getEntity(this.product.slider.CONT, 'slider-control', '.active'),
				next = this.getItemForDirection(type, active);

			BX.removeClass(active, 'active');
			this.selectSliderImg(next);

			this.slider.interval && this.cycleSlider();
		},

		getItemForDirection: function(direction, active)
		{
			var activeIndex = this.getItemIndex(active),
				delta = direction === 'prev' ? -1 : 1,
				itemIndex = (activeIndex + delta) % this.product.slider.COUNT;

			return this.eq(this.product.slider.ITEMS, itemIndex);
		},

		getItemIndex: function(item)
		{
			return BX.util.array_values(this.product.slider.ITEMS).indexOf(item);
		},

		eq: function(obj, i)
		{
			var len = obj.length,
				j = +i + (i < 0 ? len : 0);

			return j >= 0 && j < len ? obj[j] : {};
		},

		scrollToProduct: function()
		{
			var scrollTop = BX.GetWindowScrollPos().scrollTop,
				containerTop = BX.pos(this.obProduct).top - 30;

			if (scrollTop > containerTop)
			{
				new BX.easing({
					duration: 500,
					start: {scroll: scrollTop},
					finish: {scroll: containerTop},
					transition: BX.easing.makeEaseOut(BX.easing.transitions.quint),
					step: BX.delegate(function(state){
						window.scrollTo(0, state.scroll);
					}, this)
				}).animate();
			}
		},

		checkTopPanels: function()
		{
			var scrollTop = BX.GetWindowScrollPos().scrollTop,
				targetPos;

			if (this.smallCardNodes.panel)
			{
				targetPos = BX.pos(this.smallCardNodes.aligner).bottom - 50;

				if (scrollTop > targetPos)
				{
					BX.addClass(this.smallCardNodes.panel, 'active');
				}
				else if (BX.hasClass(this.smallCardNodes.panel, 'active'))
				{
					BX.removeClass(this.smallCardNodes.panel, 'active');
				}
			}

			if (this.obTabsPanel)
			{
				targetPos = BX.pos(this.obTabs).top;

				if (scrollTop + 73 > targetPos)
				{
					BX.addClass(this.obTabsPanel, 'active');
				}
				else if (BX.hasClass(this.obTabsPanel, 'active'))
				{
					BX.removeClass(this.obTabsPanel, 'active');
				}
			}
		},

		changeTab: function(event)
		{
			BX.PreventDefault(event);

			var targetTabValue = BX.proxy_context && BX.proxy_context.getAttribute('data-value'),
				containers, tabs, panelTabs;

			if (!BX.hasClass(BX.proxy_context, 'active') && targetTabValue)
			{
				containers = this.getEntities(this.obTabContainers, 'tab-container');
				for (var i in containers)
				{
					if (containers.hasOwnProperty(i) && BX.type.isDomNode(containers[i]))
					{
						if (containers[i].getAttribute('data-value') === targetTabValue)
						{
							BX.show(containers[i]);
						}
						else
						{
							BX.hide(containers[i]);
						}
					}
				}

				tabs = this.getEntities(this.obTabs, 'tab');
				panelTabs = this.getEntities(this.obTabsPanel, 'tab');

				for (i in tabs)
				{
					if (tabs.hasOwnProperty(i) && BX.type.isDomNode(tabs[i]))
					{
						if (tabs[i].getAttribute('data-value') === targetTabValue)
						{
							BX.addClass(tabs[i], 'active');
							BX.addClass(panelTabs[i], 'active');
						}
						else
						{
							BX.removeClass(tabs[i], 'active');
							BX.removeClass(panelTabs[i], 'active');
						}
					}
				}
			}

			var scrollTop = BX.GetWindowScrollPos().scrollTop,
				containerTop = BX.pos(this.obTabContainers).top;

			if (scrollTop + 150 > containerTop)
			{
				new BX.easing({
					duration: 500,
					start: {scroll: scrollTop},
					finish: {scroll: containerTop - 150},
					transition: BX.easing.makeEaseOut(BX.easing.transitions.quint),
					step: BX.delegate(function(state){
						window.scrollTo(0, state.scroll);
					}, this)
				}).animate();
			}
		},

		initPopup: function()
		{
			if (this.config.usePopup)
			{
				this.node.imageContainer.style.cursor = 'zoom-in';
				BX.bind(this.node.imageContainer, 'click', BX.delegate(this.toggleMainPictPopup, this));
				BX.bind(document, 'keyup', BX.proxy(this.closeByEscape, this));
				BX.bind(
					this.getEntity(this.obBigSlider, 'close-popup'),
					'click',
					BX.proxy(this.hideMainPictPopup, this)
				);
			}
		},

		checkSliderControls: function(count)
		{
			var display = count > 1 ? '' : 'none';

			this.node.sliderControlLeft && (this.node.sliderControlLeft.style.display = display);
			this.node.sliderControlRight && (this.node.sliderControlRight.style.display = display);
		},

		setCurrentImg: function(img, showImage, showPanelImage)
		{
			var images, l;

			this.currentImg.id = img.ID;
			this.currentImg.src = img.SRC;
			this.currentImg.width = img.WIDTH;
			this.currentImg.height = img.HEIGHT;

			if (showImage && this.node.imageContainer)
			{
				images = this.getEntities(this.node.imageContainer, 'image');
				l = images.length;
				while (l--)
				{
					if (images[l].getAttribute('data-id') == img.ID)
					{
						if (!BX.hasClass(images[l], 'active'))
						{
							this.node.sliderProgressBar && this.resetProgress();
						}

						BX.addClass(images[l], 'active');
					}
					else if (BX.hasClass(images[l], 'active'))
					{
						BX.removeClass(images[l], 'active');
					}
				}
			}

			if (showPanelImage && this.smallCardNodes.picture)
			{
				this.smallCardNodes.picture.setAttribute('src', this.currentImg.src);
			}

			if (this.config.useMagnifier && !this.isTouchDevice)
			{
				this.setMagnifierParams();

				if (showImage)
				{
					this.disableMagnifier(true);
				}
			}
		},

		setMagnifierParams: function()
		{
			var images = this.getEntities(this.node.imageContainer, 'image'),
				l = images.length,
				current;

			while (l--)
			{
				// disable image title show
				current = images[l].querySelector('img');
				current.setAttribute('data-title', current.getAttribute('title') || '');
				current.removeAttribute('title');

				if (images[l].getAttribute('data-id') == this.currentImg.id)
				{
					BX.unbind(this.currentImg.node, 'mouseover', BX.proxy(this.enableMagnifier, this));

					this.currentImg.node = current;
					this.currentImg.node.style.backgroundImage = 'url(' + this.currentImg.src + ')';
					this.currentImg.node.style.backgroundSize = '100% auto';

					BX.bind(this.currentImg.node, 'mouseover', BX.proxy(this.enableMagnifier, this));
				}
			}
		},

		enableMagnifier: function()
		{
			BX.bind(document, 'mousemove', BX.proxy(this.moveMagnifierArea, this));
		},

		disableMagnifier: function(animateSize)
		{
			if (!this.magnify.enabled)
				return;

			clearTimeout(this.magnify.timer);
			BX.removeClass(this.obBigSlider, 'magnified');
			this.magnify.enabled = false;

			this.currentImg.node.style.backgroundSize = '100% auto';
			if (animateSize)
			{
				// set initial size for css animation
				this.currentImg.node.style.height = this.magnify.height + 'px';
				this.currentImg.node.style.width = this.magnify.width + 'px';

				this.magnify.timer = setTimeout(
					BX.delegate(function(){
						this.currentImg.node.src = this.currentImg.src;
						this.currentImg.node.style.height = '';
						this.currentImg.node.style.width = '';
					}, this),
					250
				);
			}
			else
			{
				this.currentImg.node.src = this.currentImg.src;
				this.currentImg.node.style.height = '';
				this.currentImg.node.style.width = '';
			}

			BX.unbind(document, 'mousemove', BX.proxy(this.moveMagnifierArea, this));
		},

		moveMagnifierArea: function(e)
		{
			var posBigImg = BX.pos(this.currentImg.node),
				currentPos = this.inRect(e, posBigImg);

			if (this.inBound(posBigImg, currentPos))
			{
				var posPercentX = (currentPos.X / this.currentImg.node.width) * 100,
					posPercentY = (currentPos.Y / this.currentImg.node.height) * 100,
					resolution, sliderWidth, w, h, zoomPercent;

				this.currentImg.node.style.backgroundPosition = posPercentX + '% ' + posPercentY + '%';

				if (!this.magnify.enabled)
				{
					clearTimeout(this.magnify.timer);
					BX.addClass(this.obBigSlider, 'magnified');

					// set initial size for css animation
					this.currentImg.node.style.height = (this.magnify.height = this.currentImg.node.clientHeight) + 'px';
					this.currentImg.node.style.width = (this.magnify.width = this.currentImg.node.offsetWidth) + 'px';

					resolution = this.currentImg.width / this.currentImg.height;
					sliderWidth = this.obBigSlider.offsetWidth;

					if (sliderWidth > this.currentImg.width && !BX.hasClass(this.obBigSlider, 'popup'))
					{
						w = sliderWidth;
						h = w / resolution;
						zoomPercent = 100;
					}
					else
					{
						w = this.currentImg.width;
						h = this.currentImg.height;
						zoomPercent = this.config.magnifierZoomPercent > 100 ? this.config.magnifierZoomPercent : 100;
					}

					// base64 transparent pixel
					this.currentImg.node.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQI12P4zwAAAgEBAKrChTYAAAAASUVORK5CYII=';
					this.currentImg.node.style.backgroundSize = zoomPercent + '% auto';

					// set target size
					this.magnify.timer = setTimeout(BX.delegate(function(){
							this.currentImg.node.style.height = h + 'px';
							this.currentImg.node.style.width = w + 'px';
						}, this),
						10
					);
				}

				this.magnify.enabled = true;
			}
			else
			{
				this.disableMagnifier(true);
			}
		},

		inBound: function(rect, point)
		{
			return (
				(point.Y >= 0 && rect.height >= point.Y)
				&& (point.X >= 0 && rect.width >= point.X)
			);
		},

		inRect: function(e, rect)
		{
			var wndSize = BX.GetWindowSize(),
				currentPos = {
					X: 0,
					Y: 0,
					globalX: 0,
					globalY: 0
				};

			currentPos.globalX = e.clientX + wndSize.scrollLeft;

			if (e.offsetX && e.offsetX < 0)
			{
				currentPos.globalX -= e.offsetX;
			}

			currentPos.X = currentPos.globalX - rect.left;
			currentPos.globalY = e.clientY + wndSize.scrollTop;

			if (e.offsetY && e.offsetY < 0)
			{
				currentPos.globalY -= e.offsetY;
			}

			currentPos.Y = currentPos.globalY - rect.top;

			return currentPos;
		},

		setProductMainPict: function(intPict)
		{
			var indexPict = -1,
				i = 0,
				j = 0,
				value = '';

			if (this.product.sliderCount)
			{
				for (j = 0; j < this.product.sliderPict.length; j++)
				{
					if (intPict === this.product.sliderPict[j].ID)
					{
						indexPict = j;
						break;
					}
				}

				if (indexPict > -1)
				{
					if (this.product.sliderPict[indexPict])
					{
						this.setCurrentImg(this.product.sliderPict[indexPict], true);
					}

					for (i = 0; i < this.product.slider.ITEMS.length; i++)
					{
						value = this.product.slider.ITEMS[i].getAttribute('data-value');

						if (value === intPict)
						{
							BX.addClass(this.product.slider.ITEMS[i], 'active');
						}
						else if (BX.hasClass(this.product.slider.ITEMS[i], 'active'))
						{
							BX.removeClass(this.product.slider.ITEMS[i], 'active');
						}
					}
				}
			}
		},

		onSliderControlHover: function()
		{
			var target = BX.proxy_context;

			this.mouseTimer = setTimeout(
				BX.delegate(function(){
					this.selectSliderImg(target);
				}, this),
				200
			);
		},

		onSliderControlLeave: function()
		{
			clearTimeout(this.mouseTimer);
			this.mouseTimer = null;
		},

		selectSliderImg: function(target)
		{
			var strValue = '',
				arItem = [];

			target = BX.type.isDomNode(target) ? target : BX.proxy_context;

			if (target && target.hasAttribute('data-value'))
			{
				strValue = target.getAttribute('data-value');

				if (strValue.indexOf('_') !== -1)
				{
					arItem = strValue.split('_');
					this.setMainPict(arItem[0], arItem[1]);
				}
				else
				{
					this.setProductMainPict(strValue);
				}
			}
		},

		setMainPict: function(intSlider, intPict, changePanelPict)
		{
			var index = -1,
				indexPict = -1,
				i,
				j,
				value = '',
				strValue = '';

			for (i = 0; i < this.offers.length; i++)
			{
				if (intSlider === this.offers[i].ID)
				{
					index = i;
					break;
				}
			}

			if (index > -1)
			{
				if (this.offers[index].SLIDER_COUNT > 0)
				{
					for (j = 0; j < this.offers[index].SLIDER.length; j++)
					{
						if (intPict === this.offers[index].SLIDER[j].ID)
						{
							indexPict = j;
							break;
						}
					}

					if (indexPict > -1)
					{
						if (this.offers[index].SLIDER[indexPict])
						{
							this.setCurrentImg(this.offers[index].SLIDER[indexPict], true, changePanelPict);
						}

						strValue = intSlider + '_' + intPict;

						for (i = 0; i < this.product.slider.ITEMS.length; i++)
						{
							value = this.product.slider.ITEMS[i].getAttribute('data-value');

							if (value === strValue)
							{
								BX.addClass(this.product.slider.ITEMS[i], 'active');
							}
							else if (BX.hasClass(this.product.slider.ITEMS[i], 'active'))
							{
								BX.removeClass(this.product.slider.ITEMS[i], 'active');
							}
						}
					}
				}
			}
		},

		setMainPictFromItem: function(index)
		{
			if (this.node.imageContainer)
			{
				var boolSet = false,
					obNewPict = {};

				if (this.offers[index])
				{
					if (this.offers[index].DETAIL_PICTURE)
					{
						obNewPict = this.offers[index].DETAIL_PICTURE;
						boolSet = true;
					}
					else if (this.offers[index].PREVIEW_PICTURE)
					{
						obNewPict = this.offers[index].PREVIEW_PICTURE;
						boolSet = true;
					}
				}

				if (!boolSet)
				{
					if (this.defaultPict.detail)
					{
						obNewPict = this.defaultPict.detail;
						boolSet = true;
					}
					else if (this.defaultPict.preview)
					{
						obNewPict = this.defaultPict.preview;
						boolSet = true;
					}
				}

				if (boolSet)
				{
					this.setCurrentImg(obNewPict, true, true);
				}
			}
		},

		toggleMainPictPopup: function()
		{
			if (BX.hasClass(this.obBigSlider, 'popup'))
			{
				this.hideMainPictPopup();
			}
			else
			{
				this.showMainPictPopup();
			}
		},

		showMainPictPopup: function()
		{
			this.config.useMagnifier && this.disableMagnifier(false);
			BX.addClass(this.obBigSlider, 'popup');
			this.node.imageContainer.style.cursor = '';
			// remove double scroll bar
			document.body.style.overflow = 'hidden';
		},

		hideMainPictPopup: function()
		{
			this.config.useMagnifier && this.disableMagnifier(false);
			BX.removeClass(this.obBigSlider, 'popup');
			this.node.imageContainer.style.cursor = 'zoom-in';
			// remove double scroll bar
			document.body.style.overflow = '';
		},

		closeByEscape: function(event)
		{
			event = event || window.event;

			if (event.keyCode == 27)
			{
				this.hideMainPictPopup();
			}
		},

		quantityUp: function()
		{
			var curValue = 0,
				boolSet = true;

			if (this.errorCode === 0 && this.config.showQuantity && this.canBuy && !this.isGift)
			{
				curValue = this.isDblQuantity ? parseFloat(this.obQuantity.value) : parseInt(this.obQuantity.value, 10);
				if (!isNaN(curValue))
				{
					curValue += this.stepQuantity;
					if (this.checkQuantity)
					{
						if (curValue > this.maxQuantity)
						{
							boolSet = false;
						}
					}

					if (boolSet)
					{
						if (this.isDblQuantity)
						{
							curValue = Math.round(curValue * this.precisionFactor) / this.precisionFactor;
						}

						this.obQuantity.value = curValue;

						this.setPrice();
					}
				}
			}
		},

		quantityDown: function()
		{
			var curValue = 0,
				boolSet = true;

			if (this.errorCode === 0 && this.config.showQuantity && this.canBuy && !this.isGift)
			{
				curValue = (this.isDblQuantity ? parseFloat(this.obQuantity.value) : parseInt(this.obQuantity.value, 10));
				if (!isNaN(curValue))
				{
					curValue -= this.stepQuantity;

					this.checkPriceRange(curValue);

					if (curValue < this.minQuantity)
					{
						boolSet = false;
					}

					if (boolSet)
					{
						if (this.isDblQuantity)
						{
							curValue = Math.round(curValue * this.precisionFactor) / this.precisionFactor;
						}

						this.obQuantity.value = curValue;

						this.setPrice();
					}
				}
			}
		},

		quantityChange: function()
		{
			var curValue = 0,
				intCount;

			if (this.errorCode === 0 && this.config.showQuantity)
			{
				if (this.canBuy)
				{
					curValue = this.isDblQuantity ? parseFloat(this.obQuantity.value) : Math.round(this.obQuantity.value);
					if (!isNaN(curValue))
					{
						if (this.checkQuantity)
						{
							if (curValue > this.maxQuantity)
							{
								curValue = this.maxQuantity;
							}
						}

						this.checkPriceRange(curValue);

						if (curValue < this.minQuantity)
						{
							curValue = this.minQuantity;
						}
						else
						{
							intCount = Math.round(
									Math.round(curValue * this.precisionFactor / this.stepQuantity) / this.precisionFactor
								) || 1;
							curValue = (intCount <= 1 ? this.stepQuantity : intCount * this.stepQuantity);
							curValue = Math.round(curValue * this.precisionFactor) / this.precisionFactor;
						}

						this.obQuantity.value = curValue;
					}
					else
					{
						this.obQuantity.value = this.minQuantity;
					}
				}
				else
				{
					this.obQuantity.value = this.minQuantity;
				}

				this.setPrice();
			}
		},

		quantitySet: function(index)
		{
			var strLimit, resetQuantity;
			
			var newOffer = this.offers[index],
				oldOffer = this.offers[this.offerNum];

			if (this.errorCode === 0)
			{
				this.canBuy = newOffer.CAN_BUY;

				this.currentPriceMode = newOffer.ITEM_PRICE_MODE;
				this.currentPrices = newOffer.ITEM_PRICES;
				this.currentPriceSelected = newOffer.ITEM_PRICE_SELECTED;
				this.currentQuantityRanges = newOffer.ITEM_QUANTITY_RANGES;
				this.currentQuantityRangeSelected = newOffer.ITEM_QUANTITY_RANGE_SELECTED;

				if (this.canBuy)
				{
					this.node.quantity && BX.style(this.node.quantity, 'display', '');

					this.obBasketActions && BX.style(this.obBasketActions, 'display', '');
					this.smallCardNodes.buyButton && BX.style(this.smallCardNodes.buyButton, 'display', '');
					this.smallCardNodes.addButton && BX.style(this.smallCardNodes.addButton, 'display', '');

					this.obNotAvail && BX.style(this.obNotAvail, 'display', 'none');
					this.smallCardNodes.notAvailableButton && BX.style(this.smallCardNodes.notAvailableButton, 'display', 'none');

					this.obSubscribe && BX.style(this.obSubscribe, 'display', 'none');
				}
				else
				{
					this.node.quantity && BX.style(this.node.quantity, 'display', 'none');

					this.obBasketActions && BX.style(this.obBasketActions, 'display', 'none');
					this.smallCardNodes.buyButton && BX.style(this.smallCardNodes.buyButton, 'display', 'none');
					this.smallCardNodes.addButton && BX.style(this.smallCardNodes.addButton, 'display', 'none');

					this.obNotAvail && BX.style(this.obNotAvail, 'display', '');
					this.smallCardNodes.notAvailableButton && BX.style(this.smallCardNodes.notAvailableButton, 'display', '');

					if (this.obSubscribe)
					{
						if (newOffer.CATALOG_SUBSCRIBE === 'Y')
						{
							BX.style(this.obSubscribe, 'display', '');
							this.obSubscribe.setAttribute('data-item', newOffer.ID);
							BX(this.visual.SUBSCRIBE_LINK + '_hidden').click();
						}
						else
						{
							BX.style(this.obSubscribe, 'display', 'none');
						}
					}
				}

				this.isDblQuantity = newOffer.QUANTITY_FLOAT;
				this.checkQuantity = newOffer.CHECK_QUANTITY;

				if (this.isDblQuantity)
				{
					this.stepQuantity = Math.round(parseFloat(newOffer.STEP_QUANTITY) * this.precisionFactor) / this.precisionFactor;
					this.maxQuantity = parseFloat(newOffer.MAX_QUANTITY);
					this.minQuantity = this.currentPriceMode === 'Q' ? parseFloat(this.currentPrices[this.currentPriceSelected].MIN_QUANTITY) : this.stepQuantity;
				}
				else
				{
					this.stepQuantity = parseInt(newOffer.STEP_QUANTITY, 10);
					this.maxQuantity = parseInt(newOffer.MAX_QUANTITY, 10);
					this.minQuantity = this.currentPriceMode === 'Q' ? parseInt(this.currentPrices[this.currentPriceSelected].MIN_QUANTITY) : this.stepQuantity;
				}

				if (this.config.showQuantity)
				{
					var isDifferentMinQuantity = oldOffer.ITEM_PRICES.length
						&& oldOffer.ITEM_PRICES[oldOffer.ITEM_PRICE_SELECTED]
						&& oldOffer.ITEM_PRICES[oldOffer.ITEM_PRICE_SELECTED].MIN_QUANTITY != this.minQuantity;

					if (this.isDblQuantity)
					{
						resetQuantity = Math.round(parseFloat(oldOffer.STEP_QUANTITY) * this.precisionFactor) / this.precisionFactor !== this.stepQuantity
							|| isDifferentMinQuantity
							|| oldOffer.MEASURE !== newOffer.MEASURE
							|| (
								this.checkQuantity
								&& parseFloat(oldOffer.MAX_QUANTITY) > this.maxQuantity
								&& parseFloat(this.obQuantity.value) > this.maxQuantity
							);
					}
					else
					{
						resetQuantity = parseInt(oldOffer.STEP_QUANTITY, 10) !== this.stepQuantity
							|| isDifferentMinQuantity
							|| oldOffer.MEASURE !== newOffer.MEASURE
							|| (
								this.checkQuantity
								&& parseInt(oldOffer.MAX_QUANTITY, 10) > this.maxQuantity
								&& parseInt(this.obQuantity.value, 10) > this.maxQuantity
							);
					}

					this.obQuantity.disabled = !this.canBuy;

					if (resetQuantity)
					{
						this.obQuantity.value = this.minQuantity;
					}

					if (this.obMeasure)
					{
						if (newOffer.MEASURE)
						{
							BX.adjust(this.obMeasure, {html: newOffer.MEASURE});
						}
						else
						{
							BX.adjust(this.obMeasure, {html: ''});
						}
					}
				}

				if (this.obQuantityLimit.all)
				{
					if (!this.checkQuantity || this.maxQuantity == 0)
					{
						BX.adjust(this.obQuantityLimit.value, {html: ''});
						BX.adjust(this.obQuantityLimit.all, {style: {display: 'none'}});
					}
					else
					{
						if (this.config.showMaxQuantity === 'M')
						{
							strLimit = (this.maxQuantity / this.stepQuantity >= this.config.relativeQuantityFactor)
								? BX.message('RELATIVE_QUANTITY_MANY')
								: BX.message('RELATIVE_QUANTITY_FEW');
						}
						else
						{
							strLimit = this.maxQuantity;

							if (newOffer.MEASURE)
							{
								strLimit += (' ' + newOffer.MEASURE);
							}
						}

						BX.adjust(this.obQuantityLimit.value, {html: strLimit});
						BX.adjust(this.obQuantityLimit.all, {style: {display: ''}});
					}
				}

				if (this.config.usePriceRanges && this.obPriceRanges)
				{
					if (
						this.currentPriceMode === 'Q'
						&& newOffer.PRICE_RANGES_HTML
					)
					{
						var rangesBody = this.getEntity(this.obPriceRanges, 'price-ranges-body'),
							rangesRatioHeader = this.getEntity(this.obPriceRanges, 'price-ranges-ratio-header');

						if (rangesBody)
						{
							rangesBody.innerHTML = newOffer.PRICE_RANGES_HTML;
						}

						if (rangesRatioHeader)
						{
							rangesRatioHeader.innerHTML = newOffer.PRICE_RANGES_RATIO_HTML;
						}

						this.obPriceRanges.style.display = '';
					}
					else
					{
						this.obPriceRanges.style.display = 'none';
					}

				}
			}
		},

		selectOfferProp: function()
		{
			var i = 0,
				strTreeValue = '',
				arTreeItem = [],
				rowItems = null,
				target = BX.proxy_context,
				smallCardItem;

			if (target && target.hasAttribute('data-treevalue'))
			{
				if (BX.hasClass(target, 'selected'))
					return;

				if (typeof document.activeElement === 'object')
				{
					document.activeElement.blur();
				}

				strTreeValue = target.getAttribute('data-treevalue');
				arTreeItem = strTreeValue.split('_');
				this.searchOfferPropIndex(arTreeItem[0], arTreeItem[1]);
				rowItems = BX.findChildren(target.parentNode, {tagName: 'li'}, false);

				if (rowItems && rowItems.length)
				{
					for (i = 0; i < rowItems.length; i++)
					{
						BX.removeClass(rowItems[i], 'selected');
					}
				}

				BX.addClass(target, 'selected');

				if (this.smallCardNodes.panel)
				{
					smallCardItem = this.smallCardNodes.panel.querySelector('[data-treevalue="' + strTreeValue + '"]');
					if (smallCardItem)
					{
						rowItems = this.smallCardNodes.panel.querySelectorAll('[data-sku-line="' + smallCardItem.getAttribute('data-sku-line') + '"]');
						for (i = 0; i < rowItems.length; i++)
						{
							rowItems[i].style.display = 'none';
						}

						smallCardItem.style.display = '';
					}
				}
			}
		},

		searchOfferPropIndex: function(strPropID, strPropValue)
		{
			var strName = '',
				arShowValues = false,
				arCanBuyValues = [],
				allValues = [],
				index = -1,
				i, j,
				arFilter = {},
				tmpFilter = [];

			for (i = 0; i < this.treeProps.length; i++)
			{
				if (this.treeProps[i].ID === strPropID)
				{
					index = i;
					break;
				}
			}

			if (index > -1)
			{
				for (i = 0; i < index; i++)
				{
					strName = 'PROP_' + this.treeProps[i].ID;
					arFilter[strName] = this.selectedValues[strName];
				}

				strName = 'PROP_' + this.treeProps[index].ID;
				arFilter[strName] = strPropValue;

				for (i = index + 1; i < this.treeProps.length; i++)
				{
					strName = 'PROP_' + this.treeProps[i].ID;
					arShowValues = this.getRowValues(arFilter, strName);

					if (!arShowValues)
						break;

					allValues = [];

					if (this.config.showAbsent)
					{
						arCanBuyValues = [];
						tmpFilter = [];
						tmpFilter = BX.clone(arFilter, true);

						for (j = 0; j < arShowValues.length; j++)
						{
							tmpFilter[strName] = arShowValues[j];
							allValues[allValues.length] = arShowValues[j];
							if (this.getCanBuy(tmpFilter))
								arCanBuyValues[arCanBuyValues.length] = arShowValues[j];
						}
					}
					else
					{
						arCanBuyValues = arShowValues;
					}

					if (this.selectedValues[strName] && BX.util.in_array(this.selectedValues[strName], arCanBuyValues))
					{
						arFilter[strName] = this.selectedValues[strName];
					}
					else
					{
						if (this.config.showAbsent)
						{
							arFilter[strName] = (arCanBuyValues.length ? arCanBuyValues[0] : allValues[0]);
						}
						else
						{
							arFilter[strName] = arCanBuyValues[0];
						}
					}

					this.updateRow(i, arFilter[strName], arShowValues, arCanBuyValues);
				}

				this.selectedValues = arFilter;
				this.changeInfo();
			}
		},

		updateRow: function(intNumber, activeId, showId, canBuyId)
		{
			var i = 0,
				value = '',
				isCurrent = false,
				rowItems = null;

			var lineContainer = this.getEntities(this.obTree, 'sku-line-block');

			if (intNumber > -1 && intNumber < lineContainer.length)
			{
				rowItems = lineContainer[intNumber].querySelectorAll('li');
				for (i = 0; i < rowItems.length; i++)
				{
					value = rowItems[i].getAttribute('data-onevalue');
					isCurrent = value === activeId;

					if (isCurrent)
					{
						BX.addClass(rowItems[i], 'selected');
					}
					else
					{
						BX.removeClass(rowItems[i], 'selected');
					}

					if (BX.util.in_array(value, canBuyId))
					{
						BX.removeClass(rowItems[i], 'notallowed');
					}
					else
					{
						BX.addClass(rowItems[i], 'notallowed');
					}

					rowItems[i].style.display = BX.util.in_array(value, showId) ? '' : 'none';

					if (isCurrent)
					{
						lineContainer[intNumber].style.display = (value == 0 && canBuyId.length == 1) ? 'none' : '';
					}
				}

				if (this.smallCardNodes.panel)
				{
					rowItems = this.smallCardNodes.panel.querySelectorAll('[data-sku-line="' + intNumber + '"]');
					for (i = 0; i < rowItems.length; i++)
					{
						value = rowItems[i].getAttribute('data-onevalue');
						isCurrent = value === activeId;

						if (isCurrent)
						{
							rowItems[i].style.display = '';
						}
						else
						{
							rowItems[i].style.display = 'none';
						}

						if (BX.util.in_array(value, canBuyId))
						{
							BX.removeClass(rowItems[i], 'notallowed');
						}
						else
						{
							BX.addClass(rowItems[i], 'notallowed');
						}

						if (isCurrent)
						{
							rowItems[i].style.display = (value == 0 && canBuyId.length == 1) ? 'none' : '';
						}
					}
				}
			}
		},

		getRowValues: function(arFilter, index)
		{
			var arValues = [],
				i = 0,
				j = 0,
				boolSearch = false,
				boolOneSearch = true;

			if (arFilter.length === 0)
			{
				for (i = 0; i < this.offers.length; i++)
				{
					if (!BX.util.in_array(this.offers[i].TREE[index], arValues))
					{
						arValues[arValues.length] = this.offers[i].TREE[index];
					}
				}
				boolSearch = true;
			}
			else
			{
				for (i = 0; i < this.offers.length; i++)
				{
					boolOneSearch = true;

					for (j in arFilter)
					{
						if (arFilter[j] !== this.offers[i].TREE[j])
						{
							boolOneSearch = false;
							break;
						}
					}

					if (boolOneSearch)
					{
						if (!BX.util.in_array(this.offers[i].TREE[index], arValues))
						{
							arValues[arValues.length] = this.offers[i].TREE[index];
						}

						boolSearch = true;
					}
				}
			}

			return (boolSearch ? arValues : false);
		},

		getCanBuy: function(arFilter)
		{
			var i,
				j = 0,
				boolOneSearch = true,
				boolSearch = false;

			for (i = 0; i < this.offers.length; i++)
			{
				boolOneSearch = true;

				for (j in arFilter)
				{
					if (arFilter[j] !== this.offers[i].TREE[j])
					{
						boolOneSearch = false;
						break;
					}
				}

				if (boolOneSearch)
				{
					if (this.offers[i].CAN_BUY)
					{
						boolSearch = true;
						break;
					}
				}
			}

			return boolSearch;
		},

		setCurrent: function()
		{
			var i,
				j = 0,
				strName = '',
				arShowValues = false,
				arCanBuyValues = [],
				arFilter = {},
				tmpFilter = [],
				current = this.offers[this.offerNum].TREE;

			for (i = 0; i < this.treeProps.length; i++)
			{
				strName = 'PROP_' + this.treeProps[i].ID;
				arShowValues = this.getRowValues(arFilter, strName);

				if (!arShowValues)
					break;

				if (BX.util.in_array(current[strName], arShowValues))
				{
					arFilter[strName] = current[strName];
				}
				else
				{
					arFilter[strName] = arShowValues[0];
					this.offerNum = 0;
				}

				if (this.config.showAbsent)
				{
					arCanBuyValues = [];
					tmpFilter = [];
					tmpFilter = BX.clone(arFilter, true);

					for (j = 0; j < arShowValues.length; j++)
					{
						tmpFilter[strName] = arShowValues[j];

						if (this.getCanBuy(tmpFilter))
						{
							arCanBuyValues[arCanBuyValues.length] = arShowValues[j];
						}
					}
				}
				else
				{
					arCanBuyValues = arShowValues;
				}

				this.updateRow(i, arFilter[strName], arShowValues, arCanBuyValues);
			}

			this.selectedValues = arFilter;
			this.changeInfo();
		},

		changeInfo: function()
		{
			var index = -1,
				j = 0,
				boolOneSearch = true,
				eventData = {
					currentId: (this.offerNum > -1 ? this.offers[this.offerNum].ID : 0),
					newId: 0
				};

			var i, offerGroupNode;

			for (i = 0; i < this.offers.length; i++)
			{
				boolOneSearch = true;

				for (j in this.selectedValues)
				{
					if (this.selectedValues[j] !== this.offers[i].TREE[j])
					{
						boolOneSearch = false;
						break;
					}
				}

				if (boolOneSearch)
				{
					index = i;
					break;
				}
			}

			if (index > -1)
			{
				if (index != this.offerNum)
				{
					this.isGift = false;
				}

				this.drawImages(this.offers[index].SLIDER);
				this.checkSliderControls(this.offers[index].SLIDER_COUNT);

				for (i = 0; i < this.offers.length; i++)
				{
					if (this.config.showOfferGroup && this.offers[i].OFFER_GROUP)
					{
						if (offerGroupNode = BX(this.visual.OFFER_GROUP + this.offers[i].ID))
						{
							offerGroupNode.style.display = (i == index ? '' : 'none');
						}
					}

					if (this.slider.controls[i].ID)
					{
						if (i === index)
						{
							this.product.slider = this.slider.controls[i];
							this.slider.controls[i].CONT && BX.show(this.slider.controls[i].CONT);
						}
						else
						{
							this.slider.controls[i].CONT && BX.hide(this.slider.controls[i].CONT);
						}
					}
					else if (i === index)
					{
						this.product.slider = {};
					}
				}

				if (this.offers[index].SLIDER_COUNT > 0)
				{
					this.setMainPict(this.offers[index].ID, this.offers[index].SLIDER[0].ID, true);
				}
				else
				{
					this.setMainPictFromItem(index);
				}

				if (this.offers[index].SLIDER_COUNT > 1)
				{
					this.initSlider();
				}
				else
				{
					this.stopSlider();
				}

				if (this.config.showSkuProps)
				{
					if (this.obSkuProps)
					{
						if (!this.offers[index].DISPLAY_PROPERTIES)
						{
							BX.adjust(this.obSkuProps, {style: {display: 'none'}, html: ''});
						}
						else
						{
							BX.adjust(this.obSkuProps, {style: {display: ''}, html: this.offers[index].DISPLAY_PROPERTIES});
						}
					}

					if (this.obMainSkuProps)
					{
						if (!this.offers[index].DISPLAY_PROPERTIES_MAIN_BLOCK)
						{
							BX.adjust(this.obMainSkuProps, {style: {display: 'none'}, html: ''});
						}
						else
						{
							BX.adjust(this.obMainSkuProps, {style: {display: ''}, html: this.offers[index].DISPLAY_PROPERTIES_MAIN_BLOCK});
						}
					}
				}

				this.quantitySet(index);
				this.setPrice();
				this.setCompared(this.offers[index].COMPARED);

				this.offerNum = index;
				this.fixFontCheck();
				this.setAnalyticsDataLayer('showDetail');
				this.incViewedCounter();

				eventData.newId = this.offers[this.offerNum].ID;
				// only for compatible catalog.store.amount custom templates
				BX.onCustomEvent('onCatalogStoreProductChange', [this.offers[this.offerNum].ID]);
				// new event
				BX.onCustomEvent('onCatalogElementChangeOffer', eventData);
				eventData = null;

				// изменение ID торгового предложения
				this.changeProductId(this.offers[this.offerNum].ID);
				// отображение анонсового текста торгового предложения
				this.showCurrentOfferPreview(this.offers[this.offerNum].ID);

				$('.mess-show-max-quantity').empty();
			}
		},

		changeProductId: function(offer_id) {
			$('.bx_item_detail').attr('data-product-id', offer_id);
		},

		showCurrentOfferPreview: function (offer_id) {
			$('.main_detail_preview_text').hide();
			$('#offer_preview_text_' + offer_id).show();
		},

		drawImages: function(images)
		{
			if (!this.node.imageContainer)
				return;

			var i, img, entities = this.getEntities(this.node.imageContainer, 'image');
			for (i in entities)
			{
				if (entities.hasOwnProperty(i) && BX.type.isDomNode(entities[i]))
				{
					BX.remove(entities[i]);
				}
			}

			for (i = 0; i < images.length; i++)
			{
				img = BX.create('IMG', {
					props: {
						src: images[i].SRC,
						alt: this.config.alt,
						title: this.config.title
					}
				});

				if (i == 0)
				{
					img.setAttribute('itemprop', 'image');
				}

				this.node.imageContainer.appendChild(
					BX.create('DIV', {
						attrs: {
							'data-entity': 'image',
							'data-id': images[i].ID
						},
						props: {
							className: 'product-item-detail-slider-image' + (i == 0 ? ' active' : '')
						},
						children: [img]
					})
				);
			}
		},

		restoreSticker: function()
		{
			if (this.previousStickerText)
			{
				this.redrawSticker({text: this.previousStickerText});
			}
			else
			{
				this.hideSticker();
			}
		},

		hideSticker: function()
		{
			BX.hide(BX(this.visual.STICKER_ID));
		},

		redrawSticker: function(stickerData)
		{
			stickerData = stickerData || {};
			var text = stickerData.text || '';

			var sticker = BX(this.visual.STICKER_ID);
			if (!sticker)
				return;

			BX.show(sticker);

			var previousStickerText = sticker.getAttribute('title');
			if (previousStickerText && previousStickerText != text)
			{
				this.previousStickerText = previousStickerText;
			}

			BX.adjust(sticker, {text: text, attrs: {title: text}});
		},

		checkPriceRange: function(quantity)
		{
			if (typeof quantity === 'undefined'|| this.currentPriceMode != 'Q')
				return;

			var range, found = false;

			for (var i in this.currentQuantityRanges)
			{
				if (this.currentQuantityRanges.hasOwnProperty(i))
				{
					range = this.currentQuantityRanges[i];

					if (
						parseInt(quantity) >= parseInt(range.SORT_FROM)
						&& (
							range.SORT_TO == 'INF'
							|| parseInt(quantity) <= parseInt(range.SORT_TO)
						)
					)
					{
						found = true;
						this.currentQuantityRangeSelected = range.HASH;
						break;
					}
				}
			}

			if (!found && (range = this.getMinPriceRange()))
			{
				this.currentQuantityRangeSelected = range.HASH;
			}

			for (var k in this.currentPrices)
			{
				if (this.currentPrices.hasOwnProperty(k))
				{
					if (this.currentPrices[k].QUANTITY_HASH == this.currentQuantityRangeSelected)
					{
						this.currentPriceSelected = k;
						break;
					}
				}
			}
		},

		getMinPriceRange: function()
		{
			var range;

			for (var i in this.currentQuantityRanges)
			{
				if (this.currentQuantityRanges.hasOwnProperty(i))
				{
					if (
						!range
						|| parseInt(this.currentQuantityRanges[i].SORT_FROM) < parseInt(range.SORT_FROM)
					)
					{
						range = this.currentQuantityRanges[i];
					}
				}
			}

			return range;
		},

		checkQuantityControls: function()
		{
			if (!this.obQuantity)
				return;

			var reachedTopLimit = this.checkQuantity && parseFloat(this.obQuantity.value) + this.stepQuantity > this.maxQuantity,
				reachedBottomLimit = parseFloat(this.obQuantity.value) - this.stepQuantity < this.minQuantity;

			if (reachedTopLimit)
			{
				BX.addClass(this.obQuantityUp, 'product-item-amount-field-btn-disabled');
			}
			else if (BX.hasClass(this.obQuantityUp, 'product-item-amount-field-btn-disabled'))
			{
				BX.removeClass(this.obQuantityUp, 'product-item-amount-field-btn-disabled');
			}

			if (reachedBottomLimit)
			{
				BX.addClass(this.obQuantityDown, 'product-item-amount-field-btn-disabled');
			}
			else if (BX.hasClass(this.obQuantityDown, 'product-item-amount-field-btn-disabled'))
			{
				BX.removeClass(this.obQuantityDown, 'product-item-amount-field-btn-disabled');
			}

			if (reachedTopLimit && reachedBottomLimit)
			{
				this.obQuantity.setAttribute('disabled', 'disabled');
			}
			else
			{
				this.obQuantity.removeAttribute('disabled');
			}
		},

		setPrice: function()
		{
			var economyInfo = '', price;

			if (this.obQuantity)
			{
				this.checkPriceRange(this.obQuantity.value);
			}

			this.checkQuantityControls();

			price = this.currentPrices[this.currentPriceSelected];

			if (this.isGift)
			{
				price.PRICE = 0;
				price.DISCOUNT = price.BASE_PRICE;
				price.PERCENT = 100;
			}

			if (this.obPrice.price)
			{
				if (price)
				{
					var price_delta = 0;
					
					$(".additive.selected").each(function(){
						price_delta+=parseInt($(this).data('price'));
						
					});
					
					
					total = parseInt(price.RATIO_PRICE) + parseInt(price_delta);
					
					BX.adjust(this.obPrice.price, {html: BX.Currency.currencyFormat(total, price.CURRENCY, true)});
					this.smallCardNodes.price && BX.adjust(this.smallCardNodes.price, {
						html: BX.Currency.currencyFormat(total, price.CURRENCY, true)
					});
				}
				else
				{
					BX.adjust(this.obPrice.price, {html: ''});
					this.smallCardNodes.price && BX.adjust(this.smallCardNodes.price, {html: ''});
				}

				if (price && price.RATIO_PRICE !== price.RATIO_BASE_PRICE)
				{
					if (this.config.showOldPrice)
					{
						this.obPrice.full && BX.adjust(this.obPrice.full, {
							style: {display: ''},
							html: BX.Currency.currencyFormat(price.RATIO_BASE_PRICE, price.CURRENCY, true)
						});
						this.smallCardNodes.oldPrice && BX.adjust(this.smallCardNodes.oldPrice, {
							style: {display: ''},
							html: BX.Currency.currencyFormat(price.RATIO_BASE_PRICE, price.CURRENCY, true)
						});

						if (this.obPrice.discount)
						{
							economyInfo = BX.message('ECONOMY_INFO_MESSAGE');
							economyInfo = economyInfo.replace('#ECONOMY#', BX.Currency.currencyFormat(price.RATIO_DISCOUNT, price.CURRENCY, true));
							BX.adjust(this.obPrice.discount, {style: {display: ''}, html: economyInfo});
						}
					}

					if (this.config.showPercent && price.PERCENT>0)
					{
						this.obPrice.percent && BX.adjust(this.obPrice.percent, {
							style: {display: ''},
							html: -price.PERCENT + '%'
						});
					}
				}
				else
				{
					if (this.config.showOldPrice)
					{
						this.obPrice.full && BX.adjust(this.obPrice.full, {style: {display: 'none'}, html: ''});
						this.smallCardNodes.oldPrice && BX.adjust(this.smallCardNodes.oldPrice, {style: {display: 'none'}, html: ''});
						this.obPrice.discount && BX.adjust(this.obPrice.discount, {style: {display: 'none'}, html: ''});
					}

					if (this.config.showPercent)
					{
						this.obPrice.percent && BX.adjust(this.obPrice.percent, {style: {display: 'none'}, html: ''});
					}
				}

				if (this.obPrice.total)
				{
					if (price && this.obQuantity && this.obQuantity.value != this.stepQuantity)
					{
						BX.adjust(this.obPrice.total, {
							html: BX.message('PRICE_TOTAL_PREFIX') + ' <strong>'
							+ BX.Currency.currencyFormat(price.PRICE * this.obQuantity.value, price.CURRENCY, true)
							+ '</strong>',
							style: {display: ''}
						});
					}
					else
					{
						BX.adjust(this.obPrice.total, {
							html: '',
							style: {display: 'none'}
						});
					}
				}
			}
		},

		compare: function(event)
		{
			var checkbox = this.obCompare.querySelector('[data-entity="compare-checkbox"]'),
				target = BX.getEventTarget(event),
				checked = true;

			if (checkbox)
			{
				checked = target === checkbox ? checkbox.checked : !checkbox.checked;
			}

			var url = checked ? this.compareData.compareUrl : this.compareData.compareDeleteUrl,
				compareLink;

			if (url)
			{
				if (target !== checkbox)
				{
					BX.PreventDefault(event);
					this.setCompared(checked);
				}

				switch (this.productType)
				{
					case 0: // no catalog
					case 1: // product
					case 2: // set
						compareLink = url.replace('#ID#', this.product.id.toString());
						break;
					case 3: // sku
						compareLink = url.replace('#ID#', this.offers[this.offerNum].ID);
						break;
				}

				BX.ajax({
					method: 'POST',
					dataType: checked ? 'json' : 'html',
					url: compareLink + (compareLink.indexOf('?') !== -1 ? '&' : '?') + 'ajax_action=Y',
					onsuccess: checked
						? BX.proxy(this.compareResult, this)
						: BX.proxy(this.compareDeleteResult, this)
				});
			}
		},

		compareResult: function(result)
		{
			var popupContent, popupButtons;

			if (this.obPopupWin)
			{
				this.obPopupWin.close();
			}

			if (!BX.type.isPlainObject(result))
				return;

			this.initPopupWindow();

			if (this.offers.length > 0)
			{
				this.offers[this.offerNum].COMPARED = result.STATUS === 'OK';
			}

			if (result.STATUS === 'OK')
			{
				BX.onCustomEvent('OnCompareChange');

				popupContent = '<div style="width: 100%; margin: 0; text-align: center;"><p>'
					+ BX.message('COMPARE_MESSAGE_OK')
					+ '</p></div>';

				if (this.config.showClosePopup)
				{
					popupButtons = [
						new BasketButton({
							text: BX.message('BTN_MESSAGE_COMPARE_REDIRECT'),
							events: {
								click: BX.delegate(this.compareRedirect, this)
							},
							style: {marginRight: '10px'}
						}),
						new BasketButton({
							text: BX.message('BTN_MESSAGE_CLOSE_POPUP'),
							events: {
								click: BX.delegate(this.obPopupWin.close, this.obPopupWin)
							}
						})
					];
				}
				else
				{
					popupButtons = [
						new BasketButton({
							text: BX.message('BTN_MESSAGE_COMPARE_REDIRECT'),
							events: {
								click: BX.delegate(this.compareRedirect, this)
							}
						})
					];
				}
			}
			else
			{
				popupContent = '<div style="width: 100%; margin: 0; text-align: center;"><p>'
					+ (result.MESSAGE ? result.MESSAGE : BX.message('COMPARE_UNKNOWN_ERROR'))
					+ '</p></div>';
				popupButtons = [
					new BasketButton({
						text: BX.message('BTN_MESSAGE_CLOSE'),
						events: {
							click: BX.delegate(this.obPopupWin.close, this.obPopupWin)
						}
					})
				];
			}

			this.obPopupWin.setTitleBar(BX.message('COMPARE_TITLE'));
			this.obPopupWin.setContent(popupContent);
			this.obPopupWin.setButtons(popupButtons);
			this.obPopupWin.show();
		},

		compareDeleteResult: function()
		{
			BX.onCustomEvent('OnCompareChange');

			if (this.offers && this.offers.length)
			{
				this.offers[this.offerNum].COMPARED = false;
			}
		},

		setCompared: function(state)
		{
			if (!this.obCompare)
				return;

			var checkbox = this.getEntity(this.obCompare, 'compare-checkbox');
			if (checkbox)
			{
				checkbox.checked = state;
			}
		},

		setCompareInfo: function(comparedIds)
		{
			if (!BX.type.isArray(comparedIds))
				return;

			for (var i in this.offers)
			{
				if (this.offers.hasOwnProperty(i))
				{
					this.offers[i].COMPARED = BX.util.in_array(this.offers[i].ID, comparedIds);
				}
			}
		},

		compareRedirect: function()
		{
			if (this.compareData.comparePath)
			{
				location.href = this.compareData.comparePath;
			}
			else
			{
				this.obPopupWin.close();
			}
		},

		checkDeletedCompare: function(id)
		{
			switch (this.productType)
			{
				case 0: // no catalog
				case 1: // product
				case 2: // set
					if (this.product.id == id)
					{
						this.setCompared(false);
					}

					break;
				case 3: // sku
					var i = this.offers.length;
					while (i--)
					{
						if (this.offers[i].ID == id)
						{
							this.offers[i].COMPARED = false;

							if (this.offerNum == i)
							{
								this.setCompared(false);
							}

							break;
						}
					}
			}
		},

		initBasketUrl: function()
		{
			this.basketUrl = (this.basketMode === 'ADD' ? this.basketData.add_url : this.basketData.buy_url);

			switch (this.productType)
			{
				case 1: // product
				case 2: // set
					this.basketUrl = this.basketUrl.replace('#ID#', this.product.id.toString());
					break;
				case 3: // sku
					this.basketUrl = this.basketUrl.replace('#ID#', this.offers[this.offerNum].ID);
					break;
			}

			this.basketParams = {
				'ajax_basket': 'Y'
			};

			if (this.config.showQuantity)
			{
				this.basketParams[this.basketData.quantity] = this.obQuantity.value;
			}

			if (this.basketData.sku_props)
			{
				this.basketParams[this.basketData.sku_props_var] = this.basketData.sku_props;
			}
		},

		fillBasketProps: function()
		{
			if (!this.visual.BASKET_PROP_DIV)
				return;

			var
				i = 0,
				propCollection = null,
				foundValues = false,
				obBasketProps = null;

			if (this.basketData.useProps && !this.basketData.emptyProps)
			{
				if (this.obPopupWin && this.obPopupWin.contentContainer)
				{
					obBasketProps = this.obPopupWin.contentContainer;
				}
			}
			else
			{
				obBasketProps = BX(this.visual.BASKET_PROP_DIV);
			}

			if (obBasketProps)
			{
				propCollection = obBasketProps.getElementsByTagName('select');
				if (propCollection && propCollection.length)
				{
					for (i = 0; i < propCollection.length; i++)
					{
						if (!propCollection[i].disabled)
						{
							switch (propCollection[i].type.toLowerCase())
							{
								case 'select-one':
									this.basketParams[propCollection[i].name] = propCollection[i].value;
									foundValues = true;
									break;
								default:
									break;
							}
						}
					}
				}

				propCollection = obBasketProps.getElementsByTagName('input');
				if (propCollection && propCollection.length)
				{
					for (i = 0; i < propCollection.length; i++)
					{
						if (!propCollection[i].disabled)
						{
							switch (propCollection[i].type.toLowerCase())
							{
								case 'hidden':
									this.basketParams[propCollection[i].name] = propCollection[i].value;
									foundValues = true;
									break;
								case 'radio':
									if (propCollection[i].checked)
									{
										this.basketParams[propCollection[i].name] = propCollection[i].value;
										foundValues = true;
									}
									break;
								default:
									break;
							}
						}
					}
				}
			}

			if (!foundValues)
			{
				this.basketParams[this.basketData.props] = [];
				this.basketParams[this.basketData.props][0] = 0;
			}
		},

		sendToBasket: function()
		{
			if (!this.canBuy)
				return;

			this.initBasketUrl();
			this.fillBasketProps();
			
			var add_url ="";
			if($(".additive.selected").length>0){
				var len = $(".additive.selected").length;
				add_url = add_url+ "&additives=";
				$(".additive.selected").each(function(index){
					add_url = add_url + $(this).data("id");
					if(index<(len-1)){
						add_url = add_url + ",";
					}
					
				});
			}
			this.basketUrl = this.basketUrl + add_url;
			//console.log(this.basketUrl);
			BX.ajax({
				method: 'POST',
				dataType: 'json',
				url: this.basketUrl,
				data: this.basketParams,
				onsuccess: BX.proxy(this.basketResult, this)
			});
		},

		add2Basket: function()
		{
			this.basketMode = 'ADD';
			this.basket();
		},

		buyBasket: function()
		{
			this.basketMode = 'BUY';
			this.basket();
		},

		basket: function()
		{
			var contentBasketProps = '';

			if (!this.canBuy)
				return;

			switch (this.productType)
			{
				case 1: // product
				case 2: // set
					if (this.basketData.useProps && !this.basketData.emptyProps)
					{
						this.initPopupWindow();
						this.obPopupWin.setTitleBar(BX.message('TITLE_BASKET_PROPS'));

						if (BX(this.visual.BASKET_PROP_DIV))
						{
							contentBasketProps = BX(this.visual.BASKET_PROP_DIV).innerHTML;
						}

						this.obPopupWin.setContent(contentBasketProps);
						this.obPopupWin.setButtons([
							new BasketButton({
								text: BX.message('BTN_SEND_PROPS'),
								events: {
									click: BX.delegate(this.sendToBasket, this)
								},
								style: {marginRight: '10px'}
							}),
							new BasketButton({
								text: BX.message('BTN_MESSAGE_CLOSE_POPUP'),
								events: {
									click: BX.delegate(this.obPopupWin.close, this.obPopupWin)
								}
							})
						]);
						this.obPopupWin.show();
					}
					else
					{
						this.sendToBasket();
					}
					break;
				case 3: // sku
					this.sendToBasket();
					break;
			}
		},

		isInt: function (n) {
			return Number(n) === n && n % 1 === 0;
		},

		getFormattedPrice: function (price) {
			price = parseFloat(price);

			if (this.isInt(price)) {
				return number_format(price, 0, ".", " ");
			}

			return number_format(price.toFixed(2), 2, ".", " ");
		},

		basketResult: function(arResult)
		{
			var popupContent, popupButtons, productPict;
			var priceText, arPrice, fullPrice, priceId, quantity, currencyText;

			if (this.obPopupWin)
			{
				this.obPopupWin.close();
			}

			if (!BX.type.isPlainObject(arResult))
				return;

			if (arResult.STATUS === 'OK')
			{
				this.setAnalyticsDataLayer('addToCart');
			}

			if (arResult.STATUS === 'OK' && this.basketMode === 'BUY')
			{
				this.basketRedirect();
			}
			else
			{
				this.initPopupWindow();

				if (arResult.STATUS === 'OK')
				{
					BX.onCustomEvent('OnBasketChange');
					switch (this.productType)
					{
						case 1: // product
						case 2: // set
							productPict = this.product.pict.SRC;
							break;
						case 3: // sku
							productPict = this.offers[this.offerNum].PREVIEW_PICTURE
								? this.offers[this.offerNum].PREVIEW_PICTURE.SRC
								: this.defaultPict.pict.SRC;
							break;
					}

					arPrice = this.currentPrices;
					priceId = this.currentPriceSelected;
					quantity = this.basketParams.quantity;
					currencyText = arPrice[priceId].PRINT_PRICE.replace(/[0-9. ]/g, '');
					fullPrice = this.getFormattedPrice(quantity * arPrice[priceId].PRICE) + ' ' + currencyText;
					if(quantity !== undefined){
                        priceText = quantity + '&nbsp;x&nbsp;' + arPrice[priceId].PRINT_PRICE + '&nbsp;=&nbsp;' + fullPrice;
					} else {
                        priceText = arPrice[priceId].PRINT_PRICE;
					}
					
					if(total>0){
						priceText = total + ' ' + currencyText;
					}

					popupContent = '<div class="add_to_basket_box">'
						+ '<div class="img"><img class="radius5" src="' + productPict + '" title="' + this.product.name + '"></div>'
						+ '<div class="name">' + this.product.name + '</div>'
						+ '<div class="pr">' + priceText + '</div>'
						+ '</div>';

					if (this.config.showClosePopup)
					{
						popupButtons = [
							new BasketButton({
								text: BX.message('BTN_MESSAGE_BASKET_REDIRECT'),
								events: {
									click: BX.delegate(this.basketRedirect, this)
								},
								style: {marginRight: '10px'}
							}),
							
							new BasketButton({
								text: BX.message('BTN_MESSAGE_CLOSE_POPUP_2'),
								events: {
									click: BX.delegate(this.obPopupWin.close, this.obPopupWin)
								}
							})
						];
					}
					else
					{
						popupButtons = [
							new BasketButton({
								text: BX.message('BTN_MESSAGE_BASKET_REDIRECT'),
								events: {
									click: BX.delegate(this.basketRedirect, this)
								}
							})
						];
					}
				}
				else
				{
					popupContent = '<div style="width: 100%; margin: 0; text-align: center;"><p>'
						+ (arResult.MESSAGE ? arResult.MESSAGE : BX.message('BASKET_UNKNOWN_ERROR'))
						+ '</p></div>';
					popupButtons = [
						new BasketButton({
							text: BX.message('BTN_MESSAGE_CLOSE'),
							events: {
								click: BX.delegate(this.obPopupWin.close, this.obPopupWin)
							}
						})
					];
				}

				this.obPopupWin.setTitleBar(arResult.STATUS === 'OK' ? BX.message('TITLE_SUCCESSFUL') : BX.message('TITLE_ERROR'));
				this.obPopupWin.setContent(popupContent);
				this.obPopupWin.setButtons(popupButtons);
				this.obPopupWin.show();
			}
		},

		basketRedirect: function()
		{
			location.href = (this.basketData.basketUrl ? this.basketData.basketUrl : BX.message('BASKET_URL'));
		},

		initPopupWindow: function()
		{
			if (this.obPopupWin)
				return;

			this.obPopupWin = BX.PopupWindowManager.create('CatalogElementBasket_' + this.visual.ID, null, {
				autoHide: false,
				offsetLeft: 0,
				offsetTop: 0,
				overlay: true,
				closeByEsc: true,
				titleBar: true,
				closeIcon: true,
				contentColor: 'white',
				className: '' //this.config.templateTheme ? 'bx-' + this.config.templateTheme : ''
			});
		},

		incViewedCounter: function()
		{
			if (this.currentIsSet && !this.updateViewedCount)
			{
				switch (this.productType)
				{
					case 1:
					case 2:
						this.viewedCounter.params.PRODUCT_ID = this.product.id;
						this.viewedCounter.params.PARENT_ID = this.product.id;
						break;
					case 3:
						this.viewedCounter.params.PARENT_ID = this.product.id;
						this.viewedCounter.params.PRODUCT_ID = this.offers[this.offerNum].ID;
						break;
					default:
						return;
				}

				this.viewedCounter.params.SITE_ID = BX.message('SITE_ID');
				this.updateViewedCount = true;
				BX.ajax.post(
					this.viewedCounter.path,
					this.viewedCounter.params,
					BX.delegate(function()
					{
						this.updateViewedCount = false;
					}, this)
				);
			}
		},

		allowViewedCount: function(update)
		{
			this.currentIsSet = true;

			if (update)
			{
				this.incViewedCounter();
			}
		},

		fixFontCheck: function()
		{
			if (BX.type.isDomNode(this.obPrice.price))
			{
				BX.FixFontSize && BX.FixFontSize.init({
					objList: [{
						node: this.obPrice.price,
						maxFontSize: 28,
						smallestValue: false,
						scaleBy: this.obPrice.price.parentNode
					}],
					onAdaptiveResize: true
				});

			}
		}
	}
})(window);
$(document).ready(function(){
	$(".additive").on("click",function(){
		$(this).toggleClass("selected");
		var delta = $(this).data("price");
		var priceText = $(".main_detail_price .price").text();
		priceText = priceText.replace(" ","");
		var price = parseInt(priceText);
		if($(this).hasClass("selected")){
			price+=delta;
		}else{
			price-=delta;
		}
		$(".main_detail_price .price").text(price+" руб");
	});
});
/* End */
;
; /* Start:"a:4:{s:4:"full";s:105:"/bitrix/templates/redesign/components/bitrix/catalog.product.subscribe/.default/script.js?157963565525094";s:6:"source";s:89:"/bitrix/templates/redesign/components/bitrix/catalog.product.subscribe/.default/script.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/
(function (window) {

    if (!!window.JCCatalogProductSubscribe)
    {
        return;
    }

    var subscribeButton = function(params)
    {
        subscribeButton.superclass.constructor.apply(this, arguments);
        this.nameNode = BX.create('span', {
            props : { id : this.id },
            style: typeof(params.style) === 'object' ? params.style : {},
            text: params.text
        });
        this.buttonNode = BX.create('span', {
            attrs: { className: params.className },
            style: { marginBottom: '0', borderBottom: '0 none transparent' },
            children: [this.nameNode],
            events : this.contextEvents
        });
        if (BX.browser.IsIE())
        {
            this.buttonNode.setAttribute("hideFocus", "hidefocus");
        }
    };
    BX.extend(subscribeButton, BX.PopupWindowButton);

    window.JCCatalogProductSubscribe = function(params)
    {
        this.buttonId = params.buttonId;
        this.buttonClass = params.buttonClass;
        this.jsObject = params.jsObject;
        this.ajaxUrl = '/bitrix/components/bitrix/catalog.product.subscribe/ajax.php';
        this.alreadySubscribed = params.alreadySubscribed;
        this.urlListSubscriptions = params.urlListSubscriptions;
        this.listOldItemId = {};

        this.elemButtonSubscribe = null;
        this.elemPopupWin = null;
        this.defaultButtonClass = 'bx-catalog-subscribe-button';

        this._elemButtonSubscribeClickHandler = BX.delegate(this.subscribe, this);
        this._elemHiddenClickHandler = BX.delegate(this.checkSubscribe, this);

        BX.ready(BX.delegate(this.init,this));
    };

    window.JCCatalogProductSubscribe.prototype.init = function()
    {
        if (!!this.buttonId)
        {
            this.elemButtonSubscribe = BX(this.buttonId);
            this.elemHiddenSubscribe = BX(this.buttonId+'_hidden');
        }

        if (!!this.elemButtonSubscribe)
        {
            BX.bind(this.elemButtonSubscribe, 'click', this._elemButtonSubscribeClickHandler);
        }

        if (!!this.elemHiddenSubscribe)
        {
            BX.bind(this.elemHiddenSubscribe, 'click', this._elemHiddenClickHandler);
        }

        this.setButton(this.alreadySubscribed);
    };

    window.JCCatalogProductSubscribe.prototype.checkSubscribe = function()
    {
        if(!this.elemHiddenSubscribe || !this.elemButtonSubscribe) return;

        if(this.listOldItemId.hasOwnProperty(this.elemButtonSubscribe.dataset.item))
        {
            this.setButton(true);
        }
        else
        {
            BX.ajax({
                method: 'POST',
                dataType: 'json',
                url: this.ajaxUrl,
                data: {
                    sessid: BX.bitrix_sessid(),
                    checkSubscribe: 'Y',
                    itemId: this.elemButtonSubscribe.dataset.item
                },
                onsuccess: BX.delegate(function (result) {
                    if(result.subscribe)
                    {
                        this.setButton(true);
                        this.listOldItemId[this.elemButtonSubscribe.dataset.item] = true;
                    }
                    else
                    {
                        this.setButton(false);
                    }
                }, this)
            });
        }
    };

    window.JCCatalogProductSubscribe.prototype.subscribe = function()
    {
        this.elemButtonSubscribe = BX.proxy_context;
        if(!this.elemButtonSubscribe) return false;

        BX.ajax({
            method: 'POST',
            dataType: 'json',
            url: this.ajaxUrl,
            data: {
                sessid: BX.bitrix_sessid(),
                subscribe: 'Y',
                itemId: this.elemButtonSubscribe.dataset.item,
                siteId: BX.message('SITE_ID')
            },
            onsuccess: BX.delegate(function (result) {
                if(result.success)
                {
                    this.createSuccessPopup(result);
                    this.setButton(true);
                    this.listOldItemId[this.elemButtonSubscribe.dataset.item] = true;
                }
                else if(result.contactFormSubmit)
                {
                    this.initPopupWindow();
                    this.elemPopupWin.setTitleBar(BX.message('CPST_SUBSCRIBE_POPUP_TITLE'));
                    var form = this.createContentForPopup(result);
                    this.elemPopupWin.setContent(form);
                    this.elemPopupWin.setButtons([
                        new subscribeButton({
                            text: BX.message('CPST_SUBSCRIBE_BUTTON_NAME'),
                            className : 'btn btn-default',
                            events: {
                                click : BX.delegate(function() {
                                    if(!this.validateContactField(result.contactTypeData))
                                    {
                                        return false;
                                    }
                                    BX.ajax.submitAjax(form, {
                                        method : 'POST',
                                        url: this.ajaxUrl,
                                        processData : true,
                                        onsuccess: BX.delegate(function (resultForm) {
                                            resultForm = BX.parseJSON(resultForm, {});
                                            if(resultForm.success)
                                            {
                                                this.createSuccessPopup(resultForm);
                                                this.setButton(true);
                                                this.listOldItemId[this.elemButtonSubscribe.dataset.item] = true;
                                            }
                                            else if(resultForm.error)
                                            {
                                                if(resultForm.hasOwnProperty('setButton'))
                                                {
                                                    this.listOldItemId[this.elemButtonSubscribe.dataset.item] = true;
                                                    this.setButton(true);
                                                }
                                                var errorMessage = resultForm.message;
                                                if(resultForm.hasOwnProperty('typeName'))
                                                {
                                                    errorMessage = resultForm.message.replace('USER_CONTACT',
                                                        resultForm.typeName);
                                                }
                                                BX('bx-catalog-subscribe-form-notify').style.color = 'red';
                                                BX('bx-catalog-subscribe-form-notify').innerHTML = errorMessage;
                                            }
                                        }, this)
                                    });
                                }, this)
                            }
                        }),
                        new subscribeButton({
                            text : BX.message('CPST_SUBSCRIBE_BUTTON_CLOSE'),
                            className : 'btn btn-default',
                            events : {
                                click : BX.delegate(function() {
                                    this.elemPopupWin.close();
                                }, this)
                            }
                        })
                    ]);
                    this.elemPopupWin.show();
                }
                else if(result.error)
                {
                    if(result.hasOwnProperty('setButton'))
                    {
                        this.listOldItemId[this.elemButtonSubscribe.dataset.item] = true;
                        this.setButton(true);
                    }
                    this.showWindowWithAnswer({status: 'error', message: result.message});
                }
            }, this)
        });
    };

    window.JCCatalogProductSubscribe.prototype.validateContactField = function(contactTypeData)
    {
        var inputFields = BX.findChildren(BX('bx-catalog-subscribe-form'),
            {'tag': 'input', 'attribute': {id: 'userContact'}}, true);
        if(!inputFields.length || typeof contactTypeData !== 'object')
        {
            BX('bx-catalog-subscribe-form-notify').style.color = 'red';
            BX('bx-catalog-subscribe-form-notify').innerHTML = BX.message('CPST_SUBSCRIBE_VALIDATE_UNKNOW_ERROR');
            return false;
        }

        var contactTypeId, contactValue, useContact, errors = [], useContactErrors = [];
        for(var k = 0; k < inputFields.length; k++)
        {
            contactTypeId = inputFields[k].getAttribute('data-id');
            contactValue = inputFields[k].value;
            useContact = BX('bx-contact-use-'+contactTypeId);
            if(useContact && useContact.value == 'N')
            {
                useContactErrors.push(true);
                continue;
            }
            if(!contactValue.length)
            {
                errors.push(BX.message('CPST_SUBSCRIBE_VALIDATE_ERROR_EMPTY_FIELD').replace(
                    '#FIELD#', contactTypeData[contactTypeId].contactLable));
            }
        }

        if(inputFields.length == useContactErrors.length)
        {
            BX('bx-catalog-subscribe-form-notify').style.color = 'red';
            BX('bx-catalog-subscribe-form-notify').innerHTML = BX.message('CPST_SUBSCRIBE_VALIDATE_ERROR');
            return false;
        }

        if(errors.length)
        {
            BX('bx-catalog-subscribe-form-notify').style.color = 'red';
            for(var i = 0; i < errors.length; i++)
            {
                BX('bx-catalog-subscribe-form-notify').innerHTML = errors[i];
            }
            return false;
        }

        return true;
    };

    window.JCCatalogProductSubscribe.prototype.reloadCaptcha = function()
    {
        BX.ajax.get(this.ajaxUrl+'?reloadCaptcha=Y', '', function(captchaCode) {
            BX('captcha_sid').value = captchaCode;
            BX('captcha_img').src = '/bitrix/tools/captcha.php?captcha_sid='+captchaCode+'';
        });
    };

    window.JCCatalogProductSubscribe.prototype.createContentForPopup = function(responseData)
    {
        if(!responseData.hasOwnProperty('contactTypeData'))
        {
            return null;
        }

        var contactTypeData = responseData.contactTypeData, contactCount = Object.keys(contactTypeData).length,
            styleInputForm = '', manyContact = 'N', content = document.createDocumentFragment();

        if(contactCount > 1)
        {
            manyContact = 'Y';
            styleInputForm = 'display:none;';
            content.appendChild(BX.create('p', {
                text: BX.message('CPST_SUBSCRIBE_MANY_CONTACT_NOTIFY')
            }));
        }

        content.appendChild(BX.create('p', {
            props: {id: 'bx-catalog-subscribe-form-notify'}
        }));

        for(var k in contactTypeData)
        {
            if(contactCount > 1)
            {
                content.appendChild(BX.create('div', {
                    props: {
                        className: 'bx-catalog-subscribe-form-container'
                    },
                    children: [
                        BX.create('div', {
                            props: {
                                className: 'checkbox'
                            },
                            children: [
                                BX.create('lable', {
                                    props: {
                                        className: 'bx-filter-param-label'
                                    },
                                    attrs: {
                                        onclick: this.jsObject+'.selectContactType('+k+', event);'
                                    },
                                    children: [
                                        BX.create('input', {
                                            props: {
                                                type: 'hidden',
                                                id: 'bx-contact-use-'+k,
                                                name: 'contact['+k+'][use]',
                                                value: 'N'
                                            }
                                        }),
                                        BX.create('input', {
                                            props: {
                                                id: 'bx-contact-checkbox-'+k,
                                                type: 'checkbox'
                                            }
                                        }),
                                        BX.create('span', {
                                            props: {
                                                className: 'bx-filter-param-text'
                                            },
                                            text: contactTypeData[k].contactLable
                                        })
                                    ]
                                })
                            ]
                        })
                    ]
                }));
            }
            content.appendChild(BX.create('div', {
                props: {
                    id: 'bx-catalog-subscribe-form-container-'+k,
                    className: 'bx-catalog-subscribe-form-container',
                    style: styleInputForm
                },
                children: [
                    BX.create('div', {
                        props: {
                            className: 'bx-catalog-subscribe-form-container-label'
                        },
                        text: BX.message('CPST_SUBSCRIBE_LABLE_CONTACT_INPUT').replace(
                            '#CONTACT#', contactTypeData[k].contactLable)
                    }),
                    BX.create('div', {
                        props: {
                            className: 'bx-catalog-subscribe-form-container-input'
                        },
                        children: [
                            BX.create('input', {
                                props: {
                                    id: 'userContact',
                                    className: '',
                                    type: 'text',
                                    name: 'contact['+k+'][user]'
                                },
                                attrs: {'data-id': k}
                            })
                        ]
                    })
                ]
            }));
        }
        if(responseData.hasOwnProperty('captchaCode'))
        {
            content.appendChild(BX.create('div', {
                props: {
                    className: 'bx-catalog-subscribe-form-container'
                },
                children: [
                    BX.create('span', {props: {className: 'bx-catalog-subscribe-form-star-required'}, text: '*'}),
                    BX.message('CPST_ENTER_WORD_PICTURE'),
                    BX.create('div', {
                        props: {className: 'bx-captcha'},
                        children: [
                            BX.create('input', {
                                props: {
                                    type: 'hidden',
                                    id: 'captcha_sid',
                                    name: 'captcha_sid',
                                    value: responseData.captchaCode
                                }
                            }),
                            BX.create('img', {
                                props: {
                                    id: 'captcha_img',
                                    src: '/bitrix/tools/captcha.php?captcha_sid='+responseData.captchaCode+''
                                },
                                attrs: {
                                    width: '180',
                                    height: '40',
                                    alt: 'captcha',
                                    onclick: this.jsObject+'.reloadCaptcha();'
                                }
                            })
                        ]
                    }),
                    BX.create('div', {
                        props: {className: 'bx-catalog-subscribe-form-container-input'},
                        children: [
                            BX.create('input', {
                                props: {
                                    id: 'captcha_word',
                                    className: '',
                                    type: 'text',
                                    name: 'captcha_word'
                                },
                                attrs: {maxlength: '50'}
                            })
                        ]
                    })
                ]
            }));
        }
        var form = BX.create('form', {
            props: {
                id: 'bx-catalog-subscribe-form'
            },
            children: [
                BX.create('input', {
                    props: {
                        type: 'hidden',
                        name: 'manyContact',
                        value: manyContact
                    }
                }),
                BX.create('input', {
                    props: {
                        type: 'hidden',
                        name: 'sessid',
                        value: BX.bitrix_sessid()
                    }
                }),
                BX.create('input', {
                    props: {
                        type: 'hidden',
                        name: 'itemId',
                        value: this.elemButtonSubscribe.dataset.item
                    }
                }),
                BX.create('input', {
                    props: {
                        type: 'hidden',
                        name: 'siteId',
                        value: BX.message('SITE_ID')
                    }
                }),
                BX.create('input', {
                    props: {
                        type: 'hidden',
                        name: 'contactFormSubmit',
                        value: 'Y'
                    }
                })
            ]
        });

        form.appendChild(content);

        return form;
    };

    window.JCCatalogProductSubscribe.prototype.selectContactType = function(contactTypeId, event)
    {
        var contactInput = BX('bx-catalog-subscribe-form-container-'+contactTypeId), visibility = '',
            checkboxInput = BX('bx-contact-checkbox-'+contactTypeId);
        if(!contactInput)
        {
            return false;
        }

        if(checkboxInput != event.target)
        {
            if(checkboxInput.checked)
            {
                checkboxInput.checked = false;
            }
            else
            {
                checkboxInput.checked = true;
            }
        }

        if (contactInput.currentStyle)
        {
            visibility = contactInput.currentStyle.display;
        }
        else if (window.getComputedStyle)
        {
            var computedStyle = window.getComputedStyle(contactInput, null);
            visibility = computedStyle.getPropertyValue('display');
        }

        if(visibility === 'none')
        {
            BX('bx-contact-use-'+contactTypeId).value = 'Y';
            BX.style(contactInput, 'display', '');
        }
        else
        {
            BX('bx-contact-use-'+contactTypeId).value = 'N';
            BX.style(contactInput, 'display', 'none');
        }
    };

    window.JCCatalogProductSubscribe.prototype.createSuccessPopup = function(result)
    {
        this.initPopupWindow();
        this.elemPopupWin.setTitleBar(BX.message('CPST_SUBSCRIBE_POPUP_TITLE'));
        var content = BX.create('div', {
            props:{
                className: 'bx-catalog-popup-content'
            },
            children: [
                BX.create('p', {
                    props: {
                        className: 'bx-catalog-popup-message'
                    },
                    text: result.message
                })
            ]
        });
        this.elemPopupWin.setContent(content);
        this.elemPopupWin.setButtons([
            new subscribeButton({
                text : BX.message('CPST_SUBSCRIBE_BUTTON_CLOSE'),
                className : 'btn btn-default',
                events : {
                    click : BX.delegate(function() {
                        this.elemPopupWin.close();
                    }, this)
                }
            })
        ]);
        this.elemPopupWin.show();
    };

    window.JCCatalogProductSubscribe.prototype.initPopupWindow = function()
    {
        if (!!this.elemPopupWin)
        {
            return;
        }
        this.elemPopupWin = BX.PopupWindowManager.create('CatalogSubscribe_'+this.buttonId, null, {
            autoHide: false,
            offsetLeft: 0,
            offsetTop: 0,
            overlay : true,
            closeByEsc: true,
            titleBar: true,
            closeIcon: true,
            contentColor: 'black'
        });
    };

    window.JCCatalogProductSubscribe.prototype.setButton = function(statusSubscription)
    {
        this.alreadySubscribed = Boolean(statusSubscription);
        if(this.alreadySubscribed)
        {
            this.elemButtonSubscribe.className = this.buttonClass + ' ' + this.defaultButtonClass + ' disabled';
            this.elemButtonSubscribe.innerHTML = '<span>' + BX.message('CPST_TITLE_ALREADY_SUBSCRIBED') + '</span>';
            BX.unbind(this.elemButtonSubscribe, 'click', this._elemButtonSubscribeClickHandler);
        }
        else
        {
            this.elemButtonSubscribe.className = this.buttonClass + ' ' + this.defaultButtonClass;
            this.elemButtonSubscribe.innerHTML = '<span>' + BX.message('CPST_SUBSCRIBE_BUTTON_NAME') + '</span>';
            BX.bind(this.elemButtonSubscribe, 'click', this._elemButtonSubscribeClickHandler);
        }
    };

    window.JCCatalogProductSubscribe.prototype.showWindowWithAnswer = function(answer)
    {
        answer = answer || {};
        if (!answer.message) {
            if (answer.status == 'success') {
                answer.message = BX.message('CPST_STATUS_SUCCESS');
            } else {
                answer.message = BX.message('CPST_STATUS_ERROR');
            }
        }
        var messageBox = BX.create('div', {
            props: {
                className: 'bx-catalog-subscribe-alert'
            },
            children: [
                BX.create('span', {
                    props: {
                        className: 'bx-catalog-subscribe-aligner'
                    }
                }),
                BX.create('span', {
                    props: {
                        className: 'bx-catalog-subscribe-alert-text'
                    },
                    text: answer.message
                }),
                BX.create('div', {
                    props: {
                        className: 'bx-catalog-subscribe-alert-footer'
                    }
                })
            ]
        });
        var currentPopup = BX.PopupWindowManager.getCurrentPopup();
        if(currentPopup) {
            currentPopup.destroy();
        }
        var idTimeout = setTimeout(function () {
            var w = BX.PopupWindowManager.getCurrentPopup();
            if (!w || w.uniquePopupId != 'bx-catalog-subscribe-status-action') {
                return;
            }
            w.close();
            w.destroy();
        }, 3500);
        var popupConfirm = BX.PopupWindowManager.create('bx-catalog-subscribe-status-action', null, {
            content: messageBox,
            onPopupClose: function () {
                this.destroy();
                clearTimeout(idTimeout);
            },
            autoHide: true,
            zIndex: 2000,
            className: 'bx-catalog-subscribe-alert-popup'
        });
        popupConfirm.show();
        BX('bx-catalog-subscribe-status-action').onmouseover = function (e) {
            clearTimeout(idTimeout);
        };
        BX('bx-catalog-subscribe-status-action').onmouseout = function (e) {
            idTimeout = setTimeout(function () {
                var w = BX.PopupWindowManager.getCurrentPopup();
                if (!w || w.uniquePopupId != 'bx-catalog-subscribe-status-action') {
                    return;
                }
                w.close();
                w.destroy();
            }, 3500);
        };
    };

})(window);

/* End */
;
; /* Start:"a:4:{s:4:"full";s:103:"/bitrix/components/bitrix/sale.prediction.product.detail/templates/.default/script.min.js?1574018301394";s:6:"source";s:85:"/bitrix/components/bitrix/sale.prediction.product.detail/templates/.default/script.js";s:3:"min";s:89:"/bitrix/components/bitrix/sale.prediction.product.detail/templates/.default/script.min.js";s:3:"map";s:89:"/bitrix/components/bitrix/sale.prediction.product.detail/templates/.default/script.map.js";}"*/
(function(t){})(window);function bx_sale_prediction_product_detail_load(t,a,e){a=a||{};e=e||{};BX.ajax({url:"/bitrix/components/bitrix/sale.prediction.product.detail/ajax.php",method:"POST",data:BX.merge(a,e),dataType:"html",processData:false,start:true,onsuccess:function(a){var e=BX.processHTML(a);BX(t).innerHTML=e.HTML;BX.ajax.processScripts(e.SCRIPT)}})}
/* End */
;
; /* Start:"a:4:{s:4:"full";s:102:"/bitrix/templates/redesign/components/bitrix/catalog.products.viewed/.default/script.js?15796356581291";s:6:"source";s:87:"/bitrix/templates/redesign/components/bitrix/catalog.products.viewed/.default/script.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/
(function() {
	'use strict';

	if (!!window.JCCatalogProductsViewedComponent)
		return;

	window.JCCatalogProductsViewedComponent = function(params) {
		this.container = document.querySelector('[data-entity="' + params.container + '"]');

		if (params.initiallyShowHeader)
		{
			BX.ready(BX.delegate(this.showHeader, this));
		}
	};

	window.JCCatalogProductsViewedComponent.prototype =
	{
		showHeader: function(animate)
		{
			var parentNode = BX.findParent(this.container, {attr: {'data-entity': 'parent-container'}}),
				header;

			if (parentNode && BX.type.isDomNode(parentNode))
			{
				header = parentNode.querySelector('[data-entity="header"');

				if (header && header.getAttribute('data-showed') != 'true')
				{
					header.style.display = '';

					if (animate)
					{
						new BX.easing({
							duration: 2000,
							start: {opacity: 0},
							finish: {opacity: 100},
							transition: BX.easing.makeEaseOut(BX.easing.transitions.quad),
							step: function(state){
								header.style.opacity = state.opacity / 100;
							},
							complete: function(){
								header.removeAttribute('style');
								header.setAttribute('data-showed', 'true');
							}
						}).animate();
					}
					else
					{
						header.style.opacity = 100;
					}
				}
			}
		}
	}
})();
/* End */
;
; /* Start:"a:4:{s:4:"full";s:92:"/bitrix/templates/redesign/components/bitrix/catalog.item/.default/script.js?157963565063194";s:6:"source";s:76:"/bitrix/templates/redesign/components/bitrix/catalog.item/.default/script.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/
(function (window){
	'use strict';

	if (window.JCCatalogItem)
		return;

	var BasketButton = function(params)
	{
		BasketButton.superclass.constructor.apply(this, arguments);
		this.buttonNode = BX.create('span', {
			props: {className: 'btn btn-default btn-buy', id: this.id},
			style: typeof params.style === 'object' ? params.style : {},
			text: params.text,
			events: this.contextEvents
		});

		if (BX.browser.IsIE())
		{
			this.buttonNode.setAttribute("hideFocus", "hidefocus");
		}
	};
	BX.extend(BasketButton, BX.PopupWindowButton);

	window.JCCatalogItem = function (arParams)
	{
		this.productType = 0;
		this.showQuantity = true;
		this.showAbsent = true;
		this.secondPict = false;
		this.showOldPrice = false;
		this.showMaxQuantity = 'N';
		this.relativeQuantityFactor = 5;
		this.showPercent = false;
		this.showSkuProps = false;
		this.basketAction = 'ADD';
		this.showClosePopup = false;
		this.useCompare = false;
		this.showSubscription = false;
		this.visual = {
			ID: '',
			PICT_ID: '',
			SECOND_PICT_ID: '',
			PICT_SLIDER_ID: '',
			QUANTITY_ID: '',
			QUANTITY_UP_ID: '',
			QUANTITY_DOWN_ID: '',
			PRICE_ID: '',
			PRICE_OLD_ID: '',
			DSC_PERC: '',
			SECOND_DSC_PERC: '',
			DISPLAY_PROP_DIV: '',
			BASKET_PROP_DIV: '',
			SUBSCRIBE_ID: ''
		};
		this.product = {
			checkQuantity: false,
			maxQuantity: 0,
			stepQuantity: 1,
			isDblQuantity: false,
			canBuy: true,
			name: '',
			pict: {},
			id: 0,
			addUrl: '',
			buyUrl: ''
		};

		this.basketMode = '';
		this.basketData = {
			useProps: false,
			emptyProps: false,
			quantity: 'quantity',
			props: 'prop',
			basketUrl: '',
			sku_props: '',
			sku_props_var: 'basket_props',
			add_url: '',
			buy_url: ''
		};

		this.compareData = {
			compareUrl: '',
			compareDeleteUrl: '',
			comparePath: ''
		};

		this.defaultPict = {
			pict: null,
			secondPict: null
		};

		this.defaultSliderOptions = {
			interval: 3000,
			wrap: true
		};
		this.slider = {
			options: {},
			items: [],
			active: null,
			sliding: null,
			paused: null,
			interval: null,
			progress: null
		};
		this.touch = null;

		this.checkQuantity = false;
		this.maxQuantity = 0;
		this.minQuantity = 0;
		this.stepQuantity = 1;
		this.isDblQuantity = false;
		this.canBuy = true;
		this.precision = 6;
		this.precisionFactor = Math.pow(10, this.precision);
		this.bigData = false;
		this.fullDisplayMode = false;
		this.viewMode = '';
		this.templateTheme = '';

		this.currentPriceMode = '';
		this.currentPrices = [];
		this.currentPriceSelected = 0;
		this.currentQuantityRanges = [];
		this.currentQuantityRangeSelected = 0;

		this.offers = [];
		this.offerNum = 0;
		this.treeProps = [];
		this.selectedValues = {};

		this.obProduct = null;
		this.blockNodes = {};
		this.obQuantity = null;
		this.obQuantityUp = null;
		this.obQuantityDown = null;
		this.obQuantityLimit = {};
		this.obPict = null;
		this.obSecondPict = null;
		this.obPictSlider = null;
		this.obPictSliderIndicator = null;
		this.obPrice = null;
		this.obTree = null;
		this.obBuyBtn = null;
		this.obBasketActions = null;
		this.obNotAvail = null;
		this.obSubscribe = null;
		this.obDscPerc = null;
		this.obSecondDscPerc = null;
		this.obSkuProps = null;
		this.obMeasure = null;
		this.obCompare = null;

		this.obPopupWin = null;
		this.basketUrl = '';
		this.basketParams = {};
		this.isTouchDevice = BX.hasClass(document.documentElement, 'bx-touch');
		this.hoverTimer = null;
		this.hoverStateChangeForbidden = false;
		this.mouseX = null;
		this.mouseY = null;

		this.useEnhancedEcommerce = false;
		this.dataLayerName = 'dataLayer';
		this.brandProperty = false;

		this.errorCode = 0;

		if (typeof arParams === 'object')
		{
			if (arParams.PRODUCT_TYPE)
			{
				this.productType = parseInt(arParams.PRODUCT_TYPE, 10);
			}

			this.showQuantity = arParams.SHOW_QUANTITY;
			this.showAbsent = arParams.SHOW_ABSENT;
			this.secondPict = arParams.SECOND_PICT;
			this.showOldPrice = arParams.SHOW_OLD_PRICE;
			this.showMaxQuantity = arParams.SHOW_MAX_QUANTITY;
			this.relativeQuantityFactor = parseInt(arParams.RELATIVE_QUANTITY_FACTOR);
			this.showPercent = arParams.SHOW_DISCOUNT_PERCENT;
			this.showSkuProps = arParams.SHOW_SKU_PROPS;
			this.showSubscription = arParams.USE_SUBSCRIBE;

			if (arParams.ADD_TO_BASKET_ACTION)
			{
				this.basketAction = arParams.ADD_TO_BASKET_ACTION;
			}

			this.showClosePopup = arParams.SHOW_CLOSE_POPUP;
			this.useCompare = arParams.DISPLAY_COMPARE;
			this.fullDisplayMode = arParams.PRODUCT_DISPLAY_MODE === 'Y';
			this.bigData = arParams.BIG_DATA;
			this.viewMode = arParams.VIEW_MODE || '';
			this.templateTheme = arParams.TEMPLATE_THEME || '';
			this.useEnhancedEcommerce = arParams.USE_ENHANCED_ECOMMERCE === 'Y';
			this.dataLayerName = arParams.DATA_LAYER_NAME;
			this.brandProperty = arParams.BRAND_PROPERTY;

			this.visual = arParams.VISUAL;

			switch (this.productType)
			{
				case 0: // no catalog
				case 1: // product
				case 2: // set
					if (arParams.PRODUCT && typeof arParams.PRODUCT === 'object')
					{
						this.currentPriceMode = arParams.PRODUCT.ITEM_PRICE_MODE;
						this.currentPrices = arParams.PRODUCT.ITEM_PRICES;
						this.currentPriceSelected = arParams.PRODUCT.ITEM_PRICE_SELECTED;
						this.currentQuantityRanges = arParams.PRODUCT.ITEM_QUANTITY_RANGES;
						this.currentQuantityRangeSelected = arParams.PRODUCT.ITEM_QUANTITY_RANGE_SELECTED;

						if (this.showQuantity)
						{
							this.product.checkQuantity = arParams.PRODUCT.CHECK_QUANTITY;
							this.product.isDblQuantity = arParams.PRODUCT.QUANTITY_FLOAT;

							if (this.product.checkQuantity)
							{
								this.product.maxQuantity = (this.product.isDblQuantity ? parseFloat(arParams.PRODUCT.MAX_QUANTITY) : parseInt(arParams.PRODUCT.MAX_QUANTITY, 10));
							}

							this.product.stepQuantity = (this.product.isDblQuantity ? parseFloat(arParams.PRODUCT.STEP_QUANTITY) : parseInt(arParams.PRODUCT.STEP_QUANTITY, 10));

							this.checkQuantity = this.product.checkQuantity;
							this.isDblQuantity = this.product.isDblQuantity;
							this.stepQuantity = this.product.stepQuantity;
							this.maxQuantity = this.product.maxQuantity;
							this.minQuantity = this.currentPriceMode === 'Q'
								? parseFloat(this.currentPrices[this.currentPriceSelected].MIN_QUANTITY)
								: this.stepQuantity;

							if (this.isDblQuantity)
							{
								this.stepQuantity = Math.round(this.stepQuantity * this.precisionFactor) / this.precisionFactor;
							}
						}

						this.product.canBuy = arParams.PRODUCT.CAN_BUY;

						if (arParams.PRODUCT.MORE_PHOTO_COUNT)
						{
							this.product.morePhotoCount = arParams.PRODUCT.MORE_PHOTO_COUNT;
							this.product.morePhoto = arParams.PRODUCT.MORE_PHOTO;
						}

						if (arParams.PRODUCT.RCM_ID)
						{
							this.product.rcmId = arParams.PRODUCT.RCM_ID;
						}

						this.canBuy = this.product.canBuy;
						this.product.name = arParams.PRODUCT.NAME;
						this.product.pict = arParams.PRODUCT.PICT;
						this.product.id = arParams.PRODUCT.ID;
						this.product.DETAIL_PAGE_URL = arParams.PRODUCT.DETAIL_PAGE_URL;

						if (arParams.PRODUCT.ADD_URL)
						{
							this.product.addUrl = arParams.PRODUCT.ADD_URL;
						}

						if (arParams.PRODUCT.BUY_URL)
						{
							this.product.buyUrl = arParams.PRODUCT.BUY_URL;
						}

						if (arParams.BASKET && typeof arParams.BASKET === 'object')
						{
							this.basketData.useProps = arParams.BASKET.ADD_PROPS;
							this.basketData.emptyProps = arParams.BASKET.EMPTY_PROPS;
						}
					}
					else
					{
						this.errorCode = -1;
					}

					break;
				case 3: // sku
					if (arParams.PRODUCT && typeof arParams.PRODUCT === 'object')
					{
						this.product.name = arParams.PRODUCT.NAME;
						this.product.id = arParams.PRODUCT.ID;
						this.product.DETAIL_PAGE_URL = arParams.PRODUCT.DETAIL_PAGE_URL;
						this.product.morePhotoCount = arParams.PRODUCT.MORE_PHOTO_COUNT;
						this.product.morePhoto = arParams.PRODUCT.MORE_PHOTO;

						if (arParams.PRODUCT.RCM_ID)
						{
							this.product.rcmId = arParams.PRODUCT.RCM_ID;
						}
					}

					if (arParams.OFFERS && BX.type.isArray(arParams.OFFERS))
					{
						this.offers = arParams.OFFERS;
						this.offerNum = 0;

						if (arParams.OFFER_SELECTED)
						{
							this.offerNum = parseInt(arParams.OFFER_SELECTED, 10);
						}

						if (isNaN(this.offerNum))
						{
							this.offerNum = 0;
						}

						if (arParams.TREE_PROPS)
						{
							this.treeProps = arParams.TREE_PROPS;
						}

						if (arParams.DEFAULT_PICTURE)
						{
							this.defaultPict.pict = arParams.DEFAULT_PICTURE.PICTURE;
							this.defaultPict.secondPict = arParams.DEFAULT_PICTURE.PICTURE_SECOND;
						}
					}

					break;
				default:
					this.errorCode = -1;
			}
			if (arParams.BASKET && typeof arParams.BASKET === 'object')
			{
				if (arParams.BASKET.QUANTITY)
				{
					this.basketData.quantity = arParams.BASKET.QUANTITY;
				}

				if (arParams.BASKET.PROPS)
				{
					this.basketData.props = arParams.BASKET.PROPS;
				}

				if (arParams.BASKET.BASKET_URL)
				{
					this.basketData.basketUrl = arParams.BASKET.BASKET_URL;
				}

				if (3 === this.productType)
				{
					if (arParams.BASKET.SKU_PROPS)
					{
						this.basketData.sku_props = arParams.BASKET.SKU_PROPS;
					}
				}

				if (arParams.BASKET.ADD_URL_TEMPLATE)
				{
					this.basketData.add_url = arParams.BASKET.ADD_URL_TEMPLATE;
				}

				if (arParams.BASKET.BUY_URL_TEMPLATE)
				{
					this.basketData.buy_url = arParams.BASKET.BUY_URL_TEMPLATE;
				}

				if (this.basketData.add_url === '' && this.basketData.buy_url === '')
				{
					this.errorCode = -1024;
				}
			}

			if (this.useCompare)
			{
				if (arParams.COMPARE && typeof arParams.COMPARE === 'object')
				{
					if (arParams.COMPARE.COMPARE_PATH)
					{
						this.compareData.comparePath = arParams.COMPARE.COMPARE_PATH;
					}

					if (arParams.COMPARE.COMPARE_URL_TEMPLATE)
					{
						this.compareData.compareUrl = arParams.COMPARE.COMPARE_URL_TEMPLATE;
					}
					else
					{
						this.useCompare = false;
					}

					if (arParams.COMPARE.COMPARE_DELETE_URL_TEMPLATE)
					{
						this.compareData.compareDeleteUrl = arParams.COMPARE.COMPARE_DELETE_URL_TEMPLATE;
					}
					else
					{
						this.useCompare = false;
					}
				}
				else
				{
					this.useCompare = false;
				}
			}
		}

		if (this.errorCode === 0)
		{
			BX.ready(BX.delegate(this.init,this));
		}
	};

	window.JCCatalogItem.prototype = {
		init: function()
		{
			var i = 0,
				treeItems = null;

			this.obProduct = BX(this.visual.ID);
			if (!this.obProduct)
			{
				this.errorCode = -1;
			}

			this.obPict = BX(this.visual.PICT_ID);
			if (!this.obPict)
			{
				this.errorCode = -2;
			}

			if (this.secondPict && this.visual.SECOND_PICT_ID)
			{
				this.obSecondPict = BX(this.visual.SECOND_PICT_ID);
			}

			this.obPictSlider = BX(this.visual.PICT_SLIDER_ID);
			this.obPictSliderIndicator = BX(this.visual.PICT_SLIDER_ID + '_indicator');
			this.obPictSliderProgressBar = BX(this.visual.PICT_SLIDER_ID + '_progress_bar');
			if (!this.obPictSlider)
			{
				this.errorCode = -4;
			}

			this.obPrice = BX(this.visual.PRICE_ID);
			this.obPriceOld = BX(this.visual.PRICE_OLD_ID);
			this.obPriceTotal = BX(this.visual.PRICE_TOTAL_ID);
			if (!this.obPrice)
			{
				this.errorCode = -16;
			}

			if (this.showQuantity && this.visual.QUANTITY_ID)
			{
				this.obQuantity = BX(this.visual.QUANTITY_ID);
				this.blockNodes.quantity = this.obProduct.querySelector('[data-entity="quantity-block"]');

				if (!this.isTouchDevice)
				{
					BX.bind(this.obQuantity, 'focus', BX.proxy(this.onFocus, this));
					BX.bind(this.obQuantity, 'blur', BX.proxy(this.onBlur, this));
				}

				if (this.visual.QUANTITY_UP_ID)
				{
					this.obQuantityUp = BX(this.visual.QUANTITY_UP_ID);
				}

				if (this.visual.QUANTITY_DOWN_ID)
				{
					this.obQuantityDown = BX(this.visual.QUANTITY_DOWN_ID);
				}
			}

			if (this.visual.QUANTITY_LIMIT && this.showMaxQuantity !== 'N')
			{
				this.obQuantityLimit.all = BX(this.visual.QUANTITY_LIMIT);
				if (this.obQuantityLimit.all)
				{
					this.obQuantityLimit.value = this.obQuantityLimit.all.querySelector('[data-entity="quantity-limit-value"]');
					if (!this.obQuantityLimit.value)
					{
						this.obQuantityLimit.all = null;
					}
				}
			}

			if (this.productType === 3 && this.fullDisplayMode)
			{
				if (this.visual.TREE_ID)
				{
					this.obTree = BX(this.visual.TREE_ID);
					if (!this.obTree)
					{
						this.errorCode = -256;
					}
				}

				if (this.visual.QUANTITY_MEASURE)
				{
					this.obMeasure = BX(this.visual.QUANTITY_MEASURE);
				}
			}

			this.obBasketActions = BX(this.visual.BASKET_ACTIONS_ID);
			if (this.obBasketActions)
			{
				if (this.visual.BUY_ID)
				{
					this.obBuyBtn = BX(this.visual.BUY_ID);
				}
			}

			this.obNotAvail = BX(this.visual.NOT_AVAILABLE_MESS);

			if (this.showSubscription)
			{
				this.obSubscribe = BX(this.visual.SUBSCRIBE_ID);
			}

			if (this.showPercent)
			{
				if (this.visual.DSC_PERC)
				{
					this.obDscPerc = BX(this.visual.DSC_PERC);
				}
				if (this.secondPict && this.visual.SECOND_DSC_PERC)
				{
					this.obSecondDscPerc = BX(this.visual.SECOND_DSC_PERC);
				}
			}

			if (this.showSkuProps)
			{
				if (this.visual.DISPLAY_PROP_DIV)
				{
					this.obSkuProps = BX(this.visual.DISPLAY_PROP_DIV);
				}
			}

			if (this.errorCode === 0)
			{
				// product slider events
				if (this.isTouchDevice)
				{
					BX.bind(this.obPictSlider, 'touchstart', BX.proxy(this.touchStartEvent, this));
					BX.bind(this.obPictSlider, 'touchend', BX.proxy(this.touchEndEvent, this));
					BX.bind(this.obPictSlider, 'touchcancel', BX.proxy(this.touchEndEvent, this));
				}
				else
				{
					if (this.viewMode === 'CARD')
					{
						// product hover events
						BX.bind(this.obProduct, 'mouseenter', BX.proxy(this.hoverOn, this));
						BX.bind(this.obProduct, 'mouseleave', BX.proxy(this.hoverOff, this));
					}

					// product slider events
					BX.bind(this.obProduct, 'mouseenter', BX.proxy(this.cycleSlider, this));
					BX.bind(this.obProduct, 'mouseleave', BX.proxy(this.stopSlider, this));
				}

				if (this.bigData)
				{
					var links = BX.findChildren(this.obProduct, {tag:'a'}, true);
					if (links)
					{
						for (i in links)
						{
							if (links.hasOwnProperty(i))
							{
								if (links[i].getAttribute('href') == this.product.DETAIL_PAGE_URL)
								{
									BX.bind(links[i], 'click', BX.proxy(this.rememberProductRecommendation, this));
								}
							}
						}
					}
				}

				if (this.showQuantity)
				{
					if (this.obQuantityUp)
					{
						BX.bind(this.obQuantityUp, 'click', BX.delegate(this.quantityUp, this));
					}

					if (this.obQuantityDown)
					{
						BX.bind(this.obQuantityDown, 'click', BX.delegate(this.quantityDown, this));
					}

					if (this.obQuantity)
					{
						BX.bind(this.obQuantity, 'change', BX.delegate(this.quantityChange, this));
					}
				}

				switch (this.productType)
				{
					case 0: // no catalog
					case 1: // product
					case 2: // set
						if (parseInt(this.product.morePhotoCount) > 1 && this.obPictSlider)
						{
							this.initializeSlider();
						}

						this.checkQuantityControls();

						break;
					case 3: // sku
						if (this.offers.length > 0)
						{
							treeItems = BX.findChildren(this.obTree, {tagName: 'li'}, true);

							if (treeItems && treeItems.length)
							{
								for (i = 0; i < treeItems.length; i++)
								{
									BX.bind(treeItems[i], 'click', BX.delegate(this.selectOfferProp, this));
								}
							}

							this.setCurrent();
						}
						else if (parseInt(this.product.morePhotoCount) > 1 && this.obPictSlider)
						{
							this.initializeSlider();
						}

						break;
				}

				if (this.obBuyBtn)
				{
					if (this.basketAction === 'ADD')
					{
						BX.bind(this.obBuyBtn, 'click', BX.proxy(this.add2Basket, this));
					}
					else
					{
						BX.bind(this.obBuyBtn, 'click', BX.proxy(this.buyBasket, this));
					}
				}

				if (this.useCompare)
				{
					this.obCompare = BX(this.visual.COMPARE_LINK_ID);
					if (this.obCompare)
					{
						BX.bind(this.obCompare, 'click', BX.proxy(this.compare, this));
					}

					BX.addCustomEvent('onCatalogDeleteCompare', BX.proxy(this.checkDeletedCompare, this));
				}
			}
		},

		setAnalyticsDataLayer: function(action)
		{
			if (!this.useEnhancedEcommerce || !this.dataLayerName)
				return;

			var item = {},
				info = {},
				variants = [],
				i, k, j, propId, skuId, propValues;

			switch (this.productType)
			{
				case 0: //no catalog
				case 1: //product
				case 2: //set
					item = {
						'id': this.product.id,
						'name': this.product.name,
						'price': this.currentPrices[this.currentPriceSelected] && this.currentPrices[this.currentPriceSelected].PRICE,
						'brand': BX.type.isArray(this.brandProperty) ? this.brandProperty.join('/') : this.brandProperty
					};
					break;
				case 3: //sku
					for (i in this.offers[this.offerNum].TREE)
					{
						if (this.offers[this.offerNum].TREE.hasOwnProperty(i))
						{
							propId = i.substring(5);
							skuId = this.offers[this.offerNum].TREE[i];

							for (k in this.treeProps)
							{
								if (this.treeProps.hasOwnProperty(k) && this.treeProps[k].ID == propId)
								{
									for (j in this.treeProps[k].VALUES)
									{
										propValues = this.treeProps[k].VALUES[j];
										if (propValues.ID == skuId)
										{
											variants.push(propValues.NAME);
											break;
										}
									}

								}
							}
						}
					}

					item = {
						'id': this.offers[this.offerNum].ID,
						'name': this.offers[this.offerNum].NAME,
						'price': this.currentPrices[this.currentPriceSelected] && this.currentPrices[this.currentPriceSelected].PRICE,
						'brand': BX.type.isArray(this.brandProperty) ? this.brandProperty.join('/') : this.brandProperty,
						'variant': variants.join('/')
					};
					break;
			}

			switch (action)
			{
				case 'addToCart':
					info = {
						'event': 'addToCart',
						'ecommerce': {
							'currencyCode': this.currentPrices[this.currentPriceSelected] && this.currentPrices[this.currentPriceSelected].CURRENCY || '',
							'add': {
								'products': [{
									'name': item.name || '',
									'id': item.id || '',
									'price': item.price || 0,
									'brand': item.brand || '',
									'category': item.category || '',
									'variant': item.variant || '',
									'quantity': this.showQuantity && this.obQuantity ? this.obQuantity.value : 1
								}]
							}
						}
					};
					break;
			}

			window[this.dataLayerName] = window[this.dataLayerName] || [];
			window[this.dataLayerName].push(info);
		},

		hoverOn: function(event)
		{
			// clearTimeout(this.hoverTimer);
			// this.obProduct.style.height = getComputedStyle(this.obProduct).height;
			// BX.addClass(this.obProduct, 'hover');

			BX.PreventDefault(event);
		},

		hoverOff: function(event)
		{
			if (this.hoverStateChangeForbidden)
				return;

			// BX.removeClass(this.obProduct, 'hover');
			// this.hoverTimer = setTimeout(
			// 	BX.delegate(function(){
			// 		this.obProduct.style.height = 'auto';
			// 	}, this),
			// 	300
			// );

			BX.PreventDefault(event);
		},

		onFocus: function()
		{
			this.hoverStateChangeForbidden = true;
			BX.bind(document, 'mousemove', BX.proxy(this.captureMousePosition, this));
		},

		onBlur: function()
		{
			this.hoverStateChangeForbidden = false;
			BX.unbind(document, 'mousemove', BX.proxy(this.captureMousePosition, this));

			var cursorElement = document.elementFromPoint(this.mouseX, this.mouseY);
			if (!cursorElement || !this.obProduct.contains(cursorElement))
			{
				this.hoverOff();
			}
		},

		captureMousePosition: function(event)
		{
			this.mouseX = event.clientX;
			this.mouseY = event.clientY;
		},

		getCookie: function(name)
		{
			var matches = document.cookie.match(new RegExp(
				"(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
			));

			return matches ? decodeURIComponent(matches[1]) : null;
		},

		rememberProductRecommendation: function()
		{
			// save to RCM_PRODUCT_LOG
			var cookieName = BX.cookie_prefix + '_RCM_PRODUCT_LOG',
				cookie = this.getCookie(cookieName),
				itemFound = false;

			var cItems = [],
				cItem;

			if (cookie)
			{
				cItems = cookie.split('.');
			}

			var i = cItems.length;

			while (i--)
			{
				cItem = cItems[i].split('-');

				if (cItem[0] == this.product.id)
				{
					// it's already in recommendations, update the date
					cItem = cItems[i].split('-');

					// update rcmId and date
					cItem[1] = this.product.rcmId;
					cItem[2] = BX.current_server_time;

					cItems[i] = cItem.join('-');
					itemFound = true;
				}
				else
				{
					if ((BX.current_server_time - cItem[2]) > 3600 * 24 * 30)
					{
						cItems.splice(i, 1);
					}
				}
			}

			if (!itemFound)
			{
				// add recommendation
				cItems.push([this.product.id, this.product.rcmId, BX.current_server_time].join('-'));
			}

			// serialize
			var plNewCookie = cItems.join('.'),
				cookieDate = new Date(new Date().getTime() + 1000 * 3600 * 24 * 365 * 10).toUTCString();

			document.cookie = cookieName + "=" + plNewCookie + "; path=/; expires=" + cookieDate + "; domain=" + BX.cookie_domain;
		},

		quantityUp: function()
		{
			var curValue = 0,
				boolSet = true;

			if (this.errorCode === 0 && this.showQuantity && this.canBuy)
			{
				curValue = (this.isDblQuantity ? parseFloat(this.obQuantity.value) : parseInt(this.obQuantity.value, 10));
				if (!isNaN(curValue))
				{
					curValue += this.stepQuantity;
					if (this.checkQuantity)
					{
						if (curValue > this.maxQuantity)
						{
							boolSet = false;
						}
					}

					if (boolSet)
					{
						if (this.isDblQuantity)
						{
							curValue = Math.round(curValue * this.precisionFactor) / this.precisionFactor;
						}

						this.obQuantity.value = curValue;

						this.setPrice();
					}
				}
			}
		},

		quantityDown: function()
		{
			var curValue = 0,
				boolSet = true;

			if (this.errorCode === 0 && this.showQuantity && this.canBuy)
			{
				curValue = (this.isDblQuantity ? parseFloat(this.obQuantity.value) : parseInt(this.obQuantity.value, 10));
				if (!isNaN(curValue))
				{
					curValue -= this.stepQuantity;

					this.checkPriceRange(curValue);

					if (curValue < this.minQuantity)
					{
						boolSet = false;
					}

					if (boolSet)
					{
						if (this.isDblQuantity)
						{
							curValue = Math.round(curValue * this.precisionFactor) / this.precisionFactor;
						}

						this.obQuantity.value = curValue;

						this.setPrice();
					}
				}
			}
		},

		quantityChange: function()
		{
			var curValue = 0,
				intCount;

			if (this.errorCode === 0 && this.showQuantity)
			{
				if (this.canBuy)
				{
					curValue = this.isDblQuantity ? parseFloat(this.obQuantity.value) : Math.round(this.obQuantity.value);
					if (!isNaN(curValue))
					{
						if (this.checkQuantity)
						{
							if (curValue > this.maxQuantity)
							{
								curValue = this.maxQuantity;
							}
						}

						this.checkPriceRange(curValue);

						if (curValue < this.minQuantity)
						{
							curValue = this.minQuantity;
						}
						else
						{
							intCount = Math.round(
									Math.round(curValue * this.precisionFactor / this.stepQuantity) / this.precisionFactor
								) || 1;
							curValue = (intCount <= 1 ? this.stepQuantity : intCount * this.stepQuantity);
							curValue = Math.round(curValue * this.precisionFactor) / this.precisionFactor;
						}

						this.obQuantity.value = curValue;
					}
					else
					{
						this.obQuantity.value = this.minQuantity;
					}
				}
				else
				{
					this.obQuantity.value = this.minQuantity;
				}

				this.setPrice();
			}
		},

		quantitySet: function(index)
		{
			var resetQuantity, strLimit;
			
			var newOffer = this.offers[index],
				oldOffer = this.offers[this.offerNum];

			if (this.errorCode === 0)
			{
				this.canBuy = newOffer.CAN_BUY;

				this.currentPriceMode = newOffer.ITEM_PRICE_MODE;
				this.currentPrices = newOffer.ITEM_PRICES;
				this.currentPriceSelected = newOffer.ITEM_PRICE_SELECTED;
				this.currentQuantityRanges = newOffer.ITEM_QUANTITY_RANGES;
				this.currentQuantityRangeSelected = newOffer.ITEM_QUANTITY_RANGE_SELECTED;

				if (this.canBuy)
				{
					if (this.blockNodes.quantity)
					{
						BX.style(this.blockNodes.quantity, 'display', '');
					}

					if (this.obBasketActions)
					{
						BX.style(this.obBasketActions, 'display', '');
					}

					if (this.obNotAvail)
					{
						BX.style(this.obNotAvail, 'display', 'none');
					}

					if (this.obSubscribe)
					{
						BX.style(this.obSubscribe, 'display', 'none');
					}
				}
				else
				{
					if (this.blockNodes.quantity)
					{
						BX.style(this.blockNodes.quantity, 'display', 'none');
					}

					if (this.obBasketActions)
					{
						BX.style(this.obBasketActions, 'display', 'none');
					}

					if (this.obNotAvail)
					{
						BX.style(this.obNotAvail, 'display', '');
					}

					if (this.obSubscribe)
					{
						if (newOffer.CATALOG_SUBSCRIBE === 'Y')
						{
							BX.style(this.obSubscribe, 'display', '');
							this.obSubscribe.setAttribute('data-item', newOffer.ID);
							BX(this.visual.SUBSCRIBE_ID + '_hidden').click();
						}
						else
						{
							BX.style(this.obSubscribe, 'display', 'none');
						}
					}
				}

				this.isDblQuantity = newOffer.QUANTITY_FLOAT;
				this.checkQuantity = newOffer.CHECK_QUANTITY;

				if (this.isDblQuantity)
				{
					this.stepQuantity = Math.round(parseFloat(newOffer.STEP_QUANTITY) * this.precisionFactor) / this.precisionFactor;
					this.maxQuantity = parseFloat(newOffer.MAX_QUANTITY);
					this.minQuantity = this.currentPriceMode === 'Q' ? parseFloat(this.currentPrices[this.currentPriceSelected].MIN_QUANTITY) : this.stepQuantity;
				}
				else
				{
					this.stepQuantity = parseInt(newOffer.STEP_QUANTITY, 10);
					this.maxQuantity = parseInt(newOffer.MAX_QUANTITY, 10);
					this.minQuantity = this.currentPriceMode === 'Q' ? parseInt(this.currentPrices[this.currentPriceSelected].MIN_QUANTITY) : this.stepQuantity;
				}

				if (this.showQuantity)
				{
					var isDifferentMinQuantity = oldOffer.ITEM_PRICES.length
						&& oldOffer.ITEM_PRICES[oldOffer.ITEM_PRICE_SELECTED]
						&& oldOffer.ITEM_PRICES[oldOffer.ITEM_PRICE_SELECTED].MIN_QUANTITY != this.minQuantity;

					if (this.isDblQuantity)
					{
						resetQuantity = Math.round(parseFloat(oldOffer.STEP_QUANTITY) * this.precisionFactor) / this.precisionFactor !== this.stepQuantity
							|| isDifferentMinQuantity
							|| oldOffer.MEASURE !== newOffer.MEASURE
							|| (
								this.checkQuantity
								&& parseFloat(oldOffer.MAX_QUANTITY) > this.maxQuantity
								&& parseFloat(this.obQuantity.value) > this.maxQuantity
							);
					}
					else
					{
						resetQuantity = parseInt(oldOffer.STEP_QUANTITY, 10) !== this.stepQuantity
							|| isDifferentMinQuantity
							|| oldOffer.MEASURE !== newOffer.MEASURE
							|| (
								this.checkQuantity
								&& parseInt(oldOffer.MAX_QUANTITY, 10) > this.maxQuantity
								&& parseInt(this.obQuantity.value, 10) > this.maxQuantity
							);
					}

					this.obQuantity.disabled = !this.canBuy;

					if (resetQuantity)
					{
						this.obQuantity.value = this.minQuantity;
					}

					if (this.obMeasure)
					{
						if (newOffer.MEASURE)
						{
							BX.adjust(this.obMeasure, {html: newOffer.MEASURE});
						}
						else
						{
							BX.adjust(this.obMeasure, {html: ''});
						}
					}
				}

				if (this.obQuantityLimit.all)
				{
					if (!this.checkQuantity || this.maxQuantity == 0)
					{
						BX.adjust(this.obQuantityLimit.value, {html: ''});
						BX.adjust(this.obQuantityLimit.all, {style: {display: 'none'}});
					}
					else
					{
						if (this.showMaxQuantity === 'M')
						{
							strLimit = (this.maxQuantity / this.stepQuantity >= this.relativeQuantityFactor)
								? BX.message('RELATIVE_QUANTITY_MANY')
								: BX.message('RELATIVE_QUANTITY_FEW');
						}
						else
						{
							strLimit = this.maxQuantity;

							if (newOffer.MEASURE)
							{
								strLimit += (' ' + newOffer.MEASURE);
							}
						}

						BX.adjust(this.obQuantityLimit.value, {html: strLimit});
						BX.adjust(this.obQuantityLimit.all, {style: {display: ''}});
					}
				}
			}
		},

		initializeSlider: function()
		{
			var wrap = this.obPictSlider.getAttribute('data-slider-wrap');
			if (wrap)
			{
				this.slider.options.wrap = wrap === 'true';
			}
			else
			{
				this.slider.options.wrap = this.defaultSliderOptions.wrap;
			}

			if (this.isTouchDevice)
			{
				this.slider.options.interval = false;
			}
			else
			{
				this.slider.options.interval = parseInt(this.obPictSlider.getAttribute('data-slider-interval')) || this.defaultSliderOptions.interval;
				// slider interval must be more than 700ms because of css transitions
				if (this.slider.options.interval < 700)
				{
					this.slider.options.interval = 700;
				}

				if (this.obPictSliderIndicator)
				{
					var controls = this.obPictSliderIndicator.querySelectorAll('[data-go-to]');
					for (var i in controls)
					{
						if (controls.hasOwnProperty(i))
						{
							BX.bind(controls[i], 'click', BX.proxy(this.sliderClickHandler, this));
						}
					}
				}

				if (this.obPictSliderProgressBar)
				{
					if (this.slider.progress)
					{
						this.resetProgress();
						this.cycleSlider();
					}
					else
					{
						this.slider.progress = new BX.easing({
							transition: BX.easing.transitions.linear,
							step: BX.delegate(function(state){
								this.obPictSliderProgressBar.style.width = state.width / 10 + '%';
							}, this)
						});
					}
				}
			}
		},

		checkTouch: function(event)
		{
			if (!event || !event.changedTouches)
				return false;

			return event.changedTouches[0].identifier === this.touch.identifier;
		},

		touchStartEvent: function(event)
		{
			if (event.touches.length != 1)
				return;

			this.touch = event.changedTouches[0];
		},

		touchEndEvent: function(event)
		{
			if (!this.checkTouch(event))
				return;

			var deltaX = this.touch.pageX - event.changedTouches[0].pageX,
				deltaY = this.touch.pageY - event.changedTouches[0].pageY;

			if (Math.abs(deltaX) >= Math.abs(deltaY) + 10)
			{
				if (deltaX > 0)
				{
					this.slideNext();
				}

				if (deltaX < 0)
				{
					this.slidePrev();
				}
			}
		},

		sliderClickHandler: function(event)
		{
			var target = BX.getEventTarget(event),
				slideIndex = target.getAttribute('data-go-to');

			if (slideIndex)
			{
				this.slideTo(slideIndex)
			}

			BX.PreventDefault(event);
		},

		slideNext: function()
		{
			if (this.slider.sliding)
				return;

			return this.slide('next');
		},

		slidePrev: function()
		{
			if (this.slider.sliding)
				return;

			return this.slide('prev');
		},

		slideTo: function(pos)
		{
			this.slider.active = BX.findChild(this.obPictSlider, {className: 'item active'}, true, false);
			this.slider.progress && (this.slider.interval = true);

			var activeIndex = this.getItemIndex(this.slider.active);

			if (pos > (this.slider.items.length - 1) || pos < 0)
				return;

			if (this.slider.sliding)
				return false;

			if (activeIndex == pos)
			{
				this.stopSlider();
				this.cycleSlider();
				return;
			}

			return this.slide(pos > activeIndex ? 'next' : 'prev', this.eq(this.slider.items, pos));
		},

		slide: function(type, next)
		{
			var active = BX.findChild(this.obPictSlider, {className: 'item active'}, true, false),
				isCycling = this.slider.interval,
				direction = type === 'next' ? 'left' : 'right';

			next = next || this.getItemForDirection(type, active);

			if (BX.hasClass(next, 'active'))
			{
				return (this.slider.sliding = false);
			}

			this.slider.sliding = true;

			isCycling && this.stopSlider();

			if (this.obPictSliderIndicator)
			{
				BX.removeClass(this.obPictSliderIndicator.querySelector('.active'), 'active');
				var nextIndicator = this.obPictSliderIndicator.querySelectorAll('[data-go-to]')[this.getItemIndex(next)];
				nextIndicator && BX.addClass(nextIndicator, 'active');
			}

			if (BX.hasClass(this.obPictSlider, 'slide') && !BX.browser.IsIE())
			{
				var self = this;
				BX.addClass(next, type);
				next.offsetWidth; // force reflow
				BX.addClass(active, direction);
				BX.addClass(next, direction);
				setTimeout(function() {
					BX.addClass(next, 'active');
					BX.removeClass(active, 'active');
					BX.removeClass(active, direction);
					BX.removeClass(next, type);
					BX.removeClass(next, direction);
					self.slider.sliding = false;
				}, 700);
			}
			else
			{
				BX.addClass(next, 'active');
				this.slider.sliding = false;
			}

			this.obPictSliderProgressBar && this.resetProgress();
			isCycling && this.cycleSlider();
		},

		stopSlider: function(event)
		{
			event || (this.slider.paused = true);

			this.slider.interval && clearInterval(this.slider.interval);

			if (this.slider.progress)
			{
				this.slider.progress.stop();

				var width = parseInt(this.obPictSliderProgressBar.style.width);

				this.slider.progress.options.duration = this.slider.options.interval * width / 200;
				this.slider.progress.options.start = {width: width * 10};
				this.slider.progress.options.finish = {width: 0};
				this.slider.progress.options.complete = null;
				this.slider.progress.animate();
			}
		},

		cycleSlider: function(event)
		{
			event || (this.slider.paused = false);

			this.slider.interval && clearInterval(this.slider.interval);

			if (this.slider.options.interval && !this.slider.paused)
			{
				if (this.slider.progress)
				{
					this.slider.progress.stop();

					var width = parseInt(this.obPictSliderProgressBar.style.width);

					this.slider.progress.options.duration = this.slider.options.interval * (100 - width) / 100;
					this.slider.progress.options.start = {width: width * 10};
					this.slider.progress.options.finish = {width: 1000};
					this.slider.progress.options.complete = BX.delegate(function(){
						this.slider.interval = true;
						this.slideNext();
					}, this);
					this.slider.progress.animate();
				}
				else
				{
					this.slider.interval = setInterval(BX.proxy(this.slideNext, this), this.slider.options.interval);
				}
			}
		},

		resetProgress: function()
		{
			this.slider.progress && this.slider.progress.stop();
			this.obPictSliderProgressBar.style.width = 0;
		},

		getItemForDirection: function(direction, active)
		{
			var activeIndex = this.getItemIndex(active),
				willWrap = direction === 'prev' && activeIndex === 0
					|| direction === 'next' && activeIndex == (this.slider.items.length - 1);

			if (willWrap && !this.slider.options.wrap)
				return active;

			var delta = direction === 'prev' ? -1 : 1,
				itemIndex = (activeIndex + delta) % this.slider.items.length;

			return this.eq(this.slider.items, itemIndex);
		},

		getItemIndex: function(item)
		{
			this.slider.items = BX.findChildren(item.parentNode, {className: 'item'}, true);

			return this.slider.items.indexOf(item || this.slider.active);
		},

		eq: function(obj, i)
		{
			var len = obj.length,
				j = +i + (i < 0 ? len : 0);

			return j >= 0 && j < len ? obj[j] : {};
		},

		selectOfferProp: function()
		{
			var i = 0,
				value = '',
				strTreeValue = '',
				arTreeItem = [],
				rowItems = null,
				target = BX.proxy_context;

			if (target && target.hasAttribute('data-treevalue'))
			{
				if (BX.hasClass(target, 'selected'))
					return;

				strTreeValue = target.getAttribute('data-treevalue');
				arTreeItem = strTreeValue.split('_');
				if (this.searchOfferPropIndex(arTreeItem[0], arTreeItem[1]))
				{
					rowItems = BX.findChildren(target.parentNode, {tagName: 'li'}, false);
					if (rowItems && 0 < rowItems.length)
					{
						for (i = 0; i < rowItems.length; i++)
						{
							value = rowItems[i].getAttribute('data-onevalue');
							if (value === arTreeItem[1])
							{
								BX.addClass(rowItems[i], 'selected');
							}
							else
							{
								BX.removeClass(rowItems[i], 'selected');
							}
						}
					}
				}
			}
		},

		searchOfferPropIndex: function(strPropID, strPropValue)
		{
			var strName = '',
				arShowValues = false,
				i, j,
				arCanBuyValues = [],
				allValues = [],
				index = -1,
				arFilter = {},
				tmpFilter = [];

			for (i = 0; i < this.treeProps.length; i++)
			{
				if (this.treeProps[i].ID === strPropID)
				{
					index = i;
					break;
				}
			}

			if (-1 < index)
			{
				for (i = 0; i < index; i++)
				{
					strName = 'PROP_'+this.treeProps[i].ID;
					arFilter[strName] = this.selectedValues[strName];
				}
				strName = 'PROP_'+this.treeProps[index].ID;
				arShowValues = this.getRowValues(arFilter, strName);
				if (!arShowValues)
				{
					return false;
				}
				if (!BX.util.in_array(strPropValue, arShowValues))
				{
					return false;
				}
				arFilter[strName] = strPropValue;
				for (i = index+1; i < this.treeProps.length; i++)
				{
					strName = 'PROP_'+this.treeProps[i].ID;
					arShowValues = this.getRowValues(arFilter, strName);
					if (!arShowValues)
					{
						return false;
					}
					allValues = [];
					if (this.showAbsent)
					{
						arCanBuyValues = [];
						tmpFilter = [];
						tmpFilter = BX.clone(arFilter, true);
						for (j = 0; j < arShowValues.length; j++)
						{
							tmpFilter[strName] = arShowValues[j];
							allValues[allValues.length] = arShowValues[j];
							if (this.getCanBuy(tmpFilter))
								arCanBuyValues[arCanBuyValues.length] = arShowValues[j];
						}
					}
					else
					{
						arCanBuyValues = arShowValues;
					}
					if (this.selectedValues[strName] && BX.util.in_array(this.selectedValues[strName], arCanBuyValues))
					{
						arFilter[strName] = this.selectedValues[strName];
					}
					else
					{
						if (this.showAbsent)
							arFilter[strName] = (arCanBuyValues.length > 0 ? arCanBuyValues[0] : allValues[0]);
						else
							arFilter[strName] = arCanBuyValues[0];
					}
					this.updateRow(i, arFilter[strName], arShowValues, arCanBuyValues);
				}
				this.selectedValues = arFilter;
				this.changeInfo();
			}
			return true;
		},

		updateRow: function(intNumber, activeID, showID, canBuyID)
		{
			var i = 0,
				value = '',
				isCurrent = false,
				rowItems = null;

			var lineContainer = this.obTree.querySelectorAll('[data-entity="sku-line-block"]'),
				listContainer;

			if (intNumber > -1 && intNumber < lineContainer.length)
			{
				listContainer = lineContainer[intNumber].querySelector('ul');
				rowItems = BX.findChildren(listContainer, {tagName: 'li'}, false);
				if (rowItems && 0 < rowItems.length)
				{
					for (i = 0; i < rowItems.length; i++)
					{
						value = rowItems[i].getAttribute('data-onevalue');
						isCurrent = value === activeID;

						if (isCurrent)
						{
							BX.addClass(rowItems[i], 'selected');
						}
						else
						{
							BX.removeClass(rowItems[i], 'selected');
						}

						if (BX.util.in_array(value, canBuyID))
						{
							BX.removeClass(rowItems[i], 'notallowed');
						}
						else
						{
							BX.addClass(rowItems[i], 'notallowed');
						}

						rowItems[i].style.display = BX.util.in_array(value, showID) ? '' : 'none';

						if (isCurrent)
						{
							lineContainer[intNumber].style.display = (value == 0 && canBuyID.length == 1) ? 'none' : '';
						}
					}
				}
			}
		},

		getRowValues: function(arFilter, index)
		{
			var i = 0,
				j,
				arValues = [],
				boolSearch = false,
				boolOneSearch = true;

			if (0 === arFilter.length)
			{
				for (i = 0; i < this.offers.length; i++)
				{
					if (!BX.util.in_array(this.offers[i].TREE[index], arValues))
					{
						arValues[arValues.length] = this.offers[i].TREE[index];
					}
				}
				boolSearch = true;
			}
			else
			{
				for (i = 0; i < this.offers.length; i++)
				{
					boolOneSearch = true;
					for (j in arFilter)
					{
						if (arFilter[j] !== this.offers[i].TREE[j])
						{
							boolOneSearch = false;
							break;
						}
					}
					if (boolOneSearch)
					{
						if (!BX.util.in_array(this.offers[i].TREE[index], arValues))
						{
							arValues[arValues.length] = this.offers[i].TREE[index];
						}
						boolSearch = true;
					}
				}
			}
			return (boolSearch ? arValues : false);
		},

		getCanBuy: function(arFilter)
		{
			var i, j,
				boolSearch = false,
				boolOneSearch = true;

			for (i = 0; i < this.offers.length; i++)
			{
				boolOneSearch = true;
				for (j in arFilter)
				{
					if (arFilter[j] !== this.offers[i].TREE[j])
					{
						boolOneSearch = false;
						break;
					}
				}
				if (boolOneSearch)
				{
					if (this.offers[i].CAN_BUY)
					{
						boolSearch = true;
						break;
					}
				}
			}

			return boolSearch;
		},

		setCurrent: function()
		{
			var i,
				j = 0,
				arCanBuyValues = [],
				strName = '',
				arShowValues = false,
				arFilter = {},
				tmpFilter = [],
				current = this.offers[this.offerNum].TREE;

			for (i = 0; i < this.treeProps.length; i++)
			{
				strName = 'PROP_'+this.treeProps[i].ID;
				arShowValues = this.getRowValues(arFilter, strName);
				if (!arShowValues)
				{
					break;
				}
				if (BX.util.in_array(current[strName], arShowValues))
				{
					arFilter[strName] = current[strName];
				}
				else
				{
					arFilter[strName] = arShowValues[0];
					this.offerNum = 0;
				}
				if (this.showAbsent)
				{
					arCanBuyValues = [];
					tmpFilter = [];
					tmpFilter = BX.clone(arFilter, true);
					for (j = 0; j < arShowValues.length; j++)
					{
						tmpFilter[strName] = arShowValues[j];
						if (this.getCanBuy(tmpFilter))
						{
							arCanBuyValues[arCanBuyValues.length] = arShowValues[j];
						}
					}
				}
				else
				{
					arCanBuyValues = arShowValues;
				}
				this.updateRow(i, arFilter[strName], arShowValues, arCanBuyValues);
			}
			this.selectedValues = arFilter;
			this.changeInfo();
		},

		changeInfo: function()
		{
			var i, j,
				index = -1,
				boolOneSearch = true,
				quantityChanged;

			for (i = 0; i < this.offers.length; i++)
			{
				boolOneSearch = true;
				for (j in this.selectedValues)
				{
					if (this.selectedValues[j] !== this.offers[i].TREE[j])
					{
						boolOneSearch = false;
						break;
					}
				}
				if (boolOneSearch)
				{
					index = i;
					break;
				}
			}
			if (index > -1)
			{
				if (parseInt(this.offers[index].MORE_PHOTO_COUNT) > 1 && this.obPictSlider)
				{
					// hide pict and second_pict containers
					if (this.obPict)
					{
						this.obPict.style.display = 'none';
					}

					if (this.obSecondPict)
					{
						this.obSecondPict.style.display = 'none';
					}

					// clear slider container
					BX.cleanNode(this.obPictSlider);

					// fill slider container with slides
					for (i in this.offers[index].MORE_PHOTO)
					{
						if (this.offers[index].MORE_PHOTO.hasOwnProperty(i))
						{
							this.obPictSlider.appendChild(
								BX.create('SPAN', {
									props: {className: 'product-item-image-slide item' + (i == 0 ? ' active' : '')},
									style: {backgroundImage: 'url(' + this.offers[index].MORE_PHOTO[i].SRC + ')'}
								})
							);
						}
					}

					// fill slider indicator if exists
					if (this.obPictSliderIndicator)
					{
						BX.cleanNode(this.obPictSliderIndicator);

						for (i in this.offers[index].MORE_PHOTO)
						{
							if (this.offers[index].MORE_PHOTO.hasOwnProperty(i))
							{
								this.obPictSliderIndicator.appendChild(
									BX.create('DIV', {
										attrs: {'data-go-to': i},
										props: {className: 'product-item-image-slider-control' + (i == 0 ? ' active' : '')}
									})
								);
								this.obPictSliderIndicator.appendChild(document.createTextNode(' '));
							}
						}

						this.obPictSliderIndicator.style.display = '';
					}

					if (this.obPictSliderProgressBar)
					{
						this.obPictSliderProgressBar.style.display = '';
					}

					// show slider container
					this.obPictSlider.style.display = '';
					this.initializeSlider();
				}
				else
				{
					// hide slider container
					if (this.obPictSlider)
					{
						this.obPictSlider.style.display = 'none';
					}

					if (this.obPictSliderIndicator)
					{
						this.obPictSliderIndicator.style.display = 'none';
					}

					if (this.obPictSliderProgressBar)
					{
						this.obPictSliderProgressBar.style.display = 'none';
					}

					// show pict and pict_second containers
					if (this.obPict)
					{
						if (this.offers[index].PREVIEW_PICTURE)
						{
							BX.adjust(this.obPict, {style: {backgroundImage: 'url(' + this.offers[index].PREVIEW_PICTURE.SRC + ')'}});
						}
						else
						{
							BX.adjust(this.obPict, {style: {backgroundImage: 'url(' + this.defaultPict.pict.SRC + ')'}});
						}

						this.obPict.style.display = '';
					}

					if (this.secondPict && this.obSecondPict)
					{
						if (this.offers[index].PREVIEW_PICTURE_SECOND)
						{
							BX.adjust(this.obSecondPict, {style: {backgroundImage: 'url(' + this.offers[index].PREVIEW_PICTURE_SECOND.SRC + ')'}});
						}
						else if (this.offers[index].PREVIEW_PICTURE.SRC)
						{
							BX.adjust(this.obSecondPict, {style: {backgroundImage: 'url(' + this.offers[index].PREVIEW_PICTURE.SRC + ')'}});
						}
						else if (this.defaultPict.secondPict)
						{
							BX.adjust(this.obSecondPict, {style: {backgroundImage: 'url(' + this.defaultPict.secondPict.SRC + ')'}});
						}
						else
						{
							BX.adjust(this.obSecondPict, {style: {backgroundImage: 'url(' + this.defaultPict.pict.SRC + ')'}});
						}

						this.obSecondPict.style.display = '';
					}
				}

				if (this.showSkuProps && this.obSkuProps)
				{
					if (this.offers[index].DISPLAY_PROPERTIES.length)
					{
						BX.adjust(this.obSkuProps, {style: {display: ''}, html: this.offers[index].DISPLAY_PROPERTIES});
					}
					else
					{
						BX.adjust(this.obSkuProps, {style: {display: 'none'}, html: ''});
					}
				}

				this.quantitySet(index);
				this.setPrice();
				this.setCompared(this.offers[index].COMPARED);

				this.offerNum = index;
			}
		},

		checkPriceRange: function(quantity)
		{
			if (typeof quantity === 'undefined'|| this.currentPriceMode != 'Q')
				return;

			var range, found = false;

			for (var i in this.currentQuantityRanges)
			{
				if (this.currentQuantityRanges.hasOwnProperty(i))
				{
					range = this.currentQuantityRanges[i];

					if (
						parseInt(quantity) >= parseInt(range.SORT_FROM)
						&& (
							range.SORT_TO == 'INF'
							|| parseInt(quantity) <= parseInt(range.SORT_TO)
						)
					)
					{
						found = true;
						this.currentQuantityRangeSelected = range.HASH;
						break;
					}
				}
			}

			if (!found && (range = this.getMinPriceRange()))
			{
				this.currentQuantityRangeSelected = range.HASH;
			}

			for (var k in this.currentPrices)
			{
				if (this.currentPrices.hasOwnProperty(k))
				{
					if (this.currentPrices[k].QUANTITY_HASH == this.currentQuantityRangeSelected)
					{
						this.currentPriceSelected = k;
						break;
					}
				}
			}
		},

		getMinPriceRange: function()
		{
			var range;

			for (var i in this.currentQuantityRanges)
			{
				if (this.currentQuantityRanges.hasOwnProperty(i))
				{
					if (
						!range
						|| parseInt(this.currentQuantityRanges[i].SORT_FROM) < parseInt(range.SORT_FROM)
					)
					{
						range = this.currentQuantityRanges[i];
					}
				}
			}

			return range;
		},

		checkQuantityControls: function()
		{
			if (!this.obQuantity)
				return;

			var reachedTopLimit = this.checkQuantity && parseFloat(this.obQuantity.value) + this.stepQuantity > this.maxQuantity,
				reachedBottomLimit = parseFloat(this.obQuantity.value) - this.stepQuantity < this.minQuantity;

			if (reachedTopLimit)
			{
				BX.addClass(this.obQuantityUp, 'product-item-amount-field-btn-disabled');
			}
			else if (BX.hasClass(this.obQuantityUp, 'product-item-amount-field-btn-disabled'))
			{
				BX.removeClass(this.obQuantityUp, 'product-item-amount-field-btn-disabled');
			}

			if (reachedBottomLimit)
			{
				BX.addClass(this.obQuantityDown, 'product-item-amount-field-btn-disabled');
			}
			else if (BX.hasClass(this.obQuantityDown, 'product-item-amount-field-btn-disabled'))
			{
				BX.removeClass(this.obQuantityDown, 'product-item-amount-field-btn-disabled');
			}

			if (reachedTopLimit && reachedBottomLimit)
			{
				this.obQuantity.setAttribute('disabled', 'disabled');
			}
			else
			{
				this.obQuantity.removeAttribute('disabled');
			}
		},

		setPrice: function()
		{
			var obData, price;

			if (this.obQuantity)
			{
				this.checkPriceRange(this.obQuantity.value);
			}

			this.checkQuantityControls();

			price = this.currentPrices[this.currentPriceSelected];

			if (this.obPrice)
			{
				if (price)
				{
					BX.adjust(this.obPrice, {html: BX.Currency.currencyFormat(price.RATIO_PRICE, price.CURRENCY, true)});
				}
				else
				{
					BX.adjust(this.obPrice, {html: ''});
				}

				if (this.showOldPrice && this.obPriceOld)
				{
					if (price && price.RATIO_PRICE !== price.RATIO_BASE_PRICE)
					{
						BX.adjust(this.obPriceOld, {
							style: {display: ''},
							html: BX.Currency.currencyFormat(price.RATIO_BASE_PRICE, price.CURRENCY, true)
						});
					}
					else
					{
						BX.adjust(this.obPriceOld, {
							style: {display: 'none'},
							html: ''
						});
					}
				}

				if (this.obPriceTotal)
				{
					if (price && this.obQuantity && this.obQuantity.value != this.stepQuantity)
					{
						BX.adjust(this.obPriceTotal, {
							html: BX.message('PRICE_TOTAL_PREFIX') + ' <strong>'
							+ BX.Currency.currencyFormat(price.PRICE * this.obQuantity.value, price.CURRENCY, true)
							+ '</strong>',
							style: {display: ''}
						});
					}
					else
					{
						BX.adjust(this.obPriceTotal, {
							html: '',
							style: {display: 'none'}
						});
					}
				}

				if (this.showPercent)
				{
					if (price && parseInt(price.DISCOUNT) > 0)
					{
						obData = {style: {display: ''}, html: -price.PERCENT + '%'};
					}
					else
					{
						obData = {style: {display: 'none'}, html: ''};
					}

					if (this.obDscPerc)
					{
						BX.adjust(this.obDscPerc, obData);
					}

					if (this.obSecondDscPerc)
					{
						BX.adjust(this.obSecondDscPerc, obData);
					}
				}
			}
		},

		compare: function(event)
		{
			var checkbox = this.obCompare.querySelector('[data-entity="compare-checkbox"]'),
				target = BX.getEventTarget(event),
				checked = true;

			if (checkbox)
			{
				checked = target === checkbox ? checkbox.checked : !checkbox.checked;
			}

			var url = checked ? this.compareData.compareUrl : this.compareData.compareDeleteUrl,
				compareLink;

			if (url)
			{
				if (target !== checkbox)
				{
					BX.PreventDefault(event);
					this.setCompared(checked);
				}

				switch (this.productType)
				{
					case 0: // no catalog
					case 1: // product
					case 2: // set
						compareLink = url.replace('#ID#', this.product.id.toString());
						break;
					case 3: // sku
						compareLink = url.replace('#ID#', this.offers[this.offerNum].ID);
						break;
				}

				BX.ajax({
					method: 'POST',
					dataType: checked ? 'json' : 'html',
					url: compareLink + (compareLink.indexOf('?') !== -1 ? '&' : '?') + 'ajax_action=Y',
					onsuccess: checked
						? BX.proxy(this.compareResult, this)
						: BX.proxy(this.compareDeleteResult, this)
				});
			}
		},

		compareResult: function(result)
		{
			var popupContent, popupButtons;

			if (this.obPopupWin)
			{
				this.obPopupWin.close();
			}

			if (!BX.type.isPlainObject(result))
				return;

			this.initPopupWindow();

			if (this.offers.length > 0)
			{
				this.offers[this.offerNum].COMPARED = result.STATUS === 'OK';
			}

			if (result.STATUS === 'OK')
			{
				BX.onCustomEvent('OnCompareChange');

				popupContent = '<div style="width: 100%; margin: 0; text-align: center;"><p>'
					+ BX.message('COMPARE_MESSAGE_OK')
					+ '</p></div>';

				if (this.showClosePopup)
				{
					popupButtons = [
						new BasketButton({
							text: BX.message('BTN_MESSAGE_COMPARE_REDIRECT'),
							events: {
								click: BX.delegate(this.compareRedirect, this)
							},
							style: {marginRight: '10px'}
						}),
						new BasketButton({
							text: BX.message('BTN_MESSAGE_CLOSE_POPUP'),
							events: {
								click: BX.delegate(this.obPopupWin.close, this.obPopupWin)
							}
						})
					];
				}
				else
				{
					popupButtons = [
						new BasketButton({
							text: BX.message('BTN_MESSAGE_COMPARE_REDIRECT'),
							events: {
								click: BX.delegate(this.compareRedirect, this)
							}
						})
					];
				}
			}
			else
			{
				popupContent = '<div style="width: 100%; margin: 0; text-align: center;"><p>'
					+ (result.MESSAGE ? result.MESSAGE : BX.message('COMPARE_UNKNOWN_ERROR'))
					+ '</p></div>';
				popupButtons = [
					new BasketButton({
						text: BX.message('BTN_MESSAGE_CLOSE'),
						events: {
							click: BX.delegate(this.obPopupWin.close, this.obPopupWin)
						}
					})
				];
			}

			this.obPopupWin.setTitleBar(BX.message('COMPARE_TITLE'));
			this.obPopupWin.setContent(popupContent);
			this.obPopupWin.setButtons(popupButtons);
			this.obPopupWin.show();
		},

		compareDeleteResult: function()
		{
			BX.onCustomEvent('OnCompareChange');

			if (this.offers && this.offers.length)
			{
				this.offers[this.offerNum].COMPARED = false;
			}
		},

		setCompared: function(state)
		{
			if (!this.obCompare)
				return;

			var checkbox = this.obCompare.querySelector('[data-entity="compare-checkbox"]');
			if (checkbox)
			{
				checkbox.checked = state;
			}
		},

		setCompareInfo: function(comparedIds)
		{
			if (!BX.type.isArray(comparedIds))
				return;

			for (var i in this.offers)
			{
				if (this.offers.hasOwnProperty(i))
				{
					this.offers[i].COMPARED = BX.util.in_array(this.offers[i].ID, comparedIds);
				}
			}
		},

		compareRedirect: function()
		{
			if (this.compareData.comparePath)
			{
				location.href = this.compareData.comparePath;
			}
			else
			{
				this.obPopupWin.close();
			}
		},

		checkDeletedCompare: function(id)
		{
			switch (this.productType)
			{
				case 0: // no catalog
				case 1: // product
				case 2: // set
					if (this.product.id == id)
					{
						this.setCompared(false);
					}

					break;
				case 3: // sku
					var i = this.offers.length;
					while (i--)
					{
						if (this.offers[i].ID == id)
						{
							this.offers[i].COMPARED = false;

							if (this.offerNum == i)
							{
								this.setCompared(false);
							}

							break;
						}
					}
			}
		},

		initBasketUrl: function()
		{
			this.basketUrl = (this.basketMode === 'ADD' ? this.basketData.add_url : this.basketData.buy_url);
			switch (this.productType)
			{
				case 1: // product
				case 2: // set
					this.basketUrl = this.basketUrl.replace('#ID#', this.product.id.toString());
					break;
				case 3: // sku
					this.basketUrl = this.basketUrl.replace('#ID#', this.offers[this.offerNum].ID);
					break;
			}
			this.basketParams = {
				'ajax_basket': 'Y'
			};
			if (this.showQuantity)
			{
				this.basketParams[this.basketData.quantity] = this.obQuantity.value;
			}
			if (this.basketData.sku_props)
			{
				this.basketParams[this.basketData.sku_props_var] = this.basketData.sku_props;
			}
		},

		fillBasketProps: function()
		{
			if (!this.visual.BASKET_PROP_DIV)
			{
				return;
			}
			var
				i = 0,
				propCollection = null,
				foundValues = false,
				obBasketProps = null;

			if (this.basketData.useProps && !this.basketData.emptyProps)
			{
				if (this.obPopupWin && this.obPopupWin.contentContainer)
				{
					obBasketProps = this.obPopupWin.contentContainer;
				}
			}
			else
			{
				obBasketProps = BX(this.visual.BASKET_PROP_DIV);
			}
			if (obBasketProps)
			{
				propCollection = obBasketProps.getElementsByTagName('select');
				if (propCollection && propCollection.length)
				{
					for (i = 0; i < propCollection.length; i++)
					{
						if (!propCollection[i].disabled)
						{
							switch (propCollection[i].type.toLowerCase())
							{
								case 'select-one':
									this.basketParams[propCollection[i].name] = propCollection[i].value;
									foundValues = true;
									break;
								default:
									break;
							}
						}
					}
				}
				propCollection = obBasketProps.getElementsByTagName('input');
				if (propCollection && propCollection.length)
				{
					for (i = 0; i < propCollection.length; i++)
					{
						if (!propCollection[i].disabled)
						{
							switch (propCollection[i].type.toLowerCase())
							{
								case 'hidden':
									this.basketParams[propCollection[i].name] = propCollection[i].value;
									foundValues = true;
									break;
								case 'radio':
									if (propCollection[i].checked)
									{
										this.basketParams[propCollection[i].name] = propCollection[i].value;
										foundValues = true;
									}
									break;
								default:
									break;
							}
						}
					}
				}
			}
			if (!foundValues)
			{
				this.basketParams[this.basketData.props] = [];
				this.basketParams[this.basketData.props][0] = 0;
			}
		},

		add2Basket: function()
		{
			this.basketMode = 'ADD';
			this.basket();
		},

		buyBasket: function()
		{
			this.basketMode = 'BUY';
			this.basket();
		},

		sendToBasket: function()
		{
			if (!this.canBuy)
			{
				return;
			}

			// check recommendation
			if (this.product && this.product.id && this.bigData)
			{
				this.rememberProductRecommendation();
			}

			this.initBasketUrl();
			this.fillBasketProps();
			BX.ajax({
				method: 'POST',
				dataType: 'json',
				url: this.basketUrl,
				data: this.basketParams,
				onsuccess: BX.proxy(this.basketResult, this)
			});
		},

		basket: function()
		{
			var contentBasketProps = '';
			if (!this.canBuy)
			{
				return;
			}
			switch (this.productType)
			{
				case 1: // product
				case 2: // set
					if (this.basketData.useProps && !this.basketData.emptyProps)
					{
						this.initPopupWindow();
						this.obPopupWin.setTitleBar(BX.message('TITLE_BASKET_PROPS'));
						if (BX(this.visual.BASKET_PROP_DIV))
						{
							contentBasketProps = BX(this.visual.BASKET_PROP_DIV).innerHTML;
						}
						this.obPopupWin.setContent(contentBasketProps);
						this.obPopupWin.setButtons([
							new BasketButton({
								text: BX.message('BTN_MESSAGE_SEND_PROPS'),
								events: {
									click: BX.delegate(this.sendToBasket, this)
								}
							})
						]);
						this.obPopupWin.show();
					}
					else
					{
						this.sendToBasket();
					}
					break;
				case 3: // sku
					this.sendToBasket();
					break;
			}
		},

		isInt: function (n) {
			return Number(n) === n && n % 1 === 0;
		},

		getFormattedPrice: function (price) {
			price = parseFloat(price);

			if (this.isInt(price)) {
				return number_format(price, 0, ".", " ");
			}

			return number_format(price.toFixed(2), 2, ".", " ");
		},

		basketResult: function(arResult)
		{
			var strContent = '',
				strPict = '',
				successful,
				buttons = [],
				priceText, arPrice, fullPrice, priceId, quantity, currencyText;

			if (this.obPopupWin)
				this.obPopupWin.close();

			if (!BX.type.isPlainObject(arResult))
				return;

			successful = arResult.STATUS === 'OK';

			if (successful)
			{
				this.setAnalyticsDataLayer('addToCart');
			}

			if (successful && this.basketAction === 'BUY')
			{
				this.basketRedirect();
			}
			else
			{
				this.initPopupWindow();

				if (successful)
				{
					BX.onCustomEvent('OnBasketChange');

					if  (BX.findParent(this.obProduct, {className: 'bx_sale_gift_main_products'}, 10))
					{
						BX.onCustomEvent('onAddToBasketMainProduct', [this]);
					}

					switch (this.productType)
					{
						case 1: // product
						case 2: // set
							strPict = this.product.pict.SRC;
							break;
						case 3: // sku
							strPict = (this.offers[this.offerNum].PREVIEW_PICTURE ?
									this.offers[this.offerNum].PREVIEW_PICTURE.SRC :
									this.defaultPict.pict.SRC
							);
							break;
					}

					priceText = '';
					quantity = this.basketParams.quantity;

                    arPrice = this.currentPrices;
                    priceId = this.currentPriceSelected;
                    if (quantity) {
                        currencyText = arPrice[priceId].PRINT_PRICE.replace(/[0-9. ]/g, '');
                        fullPrice = this.getFormattedPrice(quantity * arPrice[priceId].PRICE) + ' ' + currencyText;
                        priceText = '<div class="pr">' + quantity + '&nbsp;x&nbsp;' + arPrice[priceId].PRINT_PRICE + '&nbsp;=&nbsp;' + fullPrice + '</div>';
                    } else {
                        priceText = '<div class="pr">'+ arPrice[priceId].PRINT_PRICE + '</div>'
                    }

					strContent = '<div class="add_to_basket_box">'
						+ '<div class="img"><img class="radius5" src="' + strPict + '" title="' + this.product.name + '"></div>'
						+ '<div class="name">' + this.product.name + '</div>'
						+ priceText
						+ '</div>';

					if (this.showClosePopup)
					{
						buttons = [
							new BasketButton({
								text: BX.message("BTN_MESSAGE_BASKET_REDIRECT"),
								events: {
									click: BX.delegate(this.basketRedirect, this)
								},
								style: {marginRight: '10px'}
							}),
							new BasketButton({
								text: BX.message("BTN_MESSAGE_CLOSE_POPUP"),
								events: {
									click: BX.delegate(this.obPopupWin.close, this.obPopupWin)
								}
							})
						];
					}
					else
					{
						buttons = [
							new BasketButton({
								text: BX.message("BTN_MESSAGE_BASKET_REDIRECT"),
								events: {
									click: BX.delegate(this.basketRedirect, this)
								}
							})
						];
					}
				}
				else
				{
					strContent = '<div style="width: 100%; margin: 0; text-align: center;"><p>'
						+ (arResult.MESSAGE ? arResult.MESSAGE : BX.message('BASKET_UNKNOWN_ERROR'))
						+ '</p></div>';
					buttons = [
						new BasketButton({
							text: BX.message('BTN_MESSAGE_CLOSE'),
							events: {
								click: BX.delegate(this.obPopupWin.close, this.obPopupWin)
							}
						})
					];
				}
				this.obPopupWin.setTitleBar(successful ? BX.message('TITLE_SUCCESSFUL') : BX.message('TITLE_ERROR'));
				this.obPopupWin.setContent(strContent);
				this.obPopupWin.setButtons(buttons);
				this.obPopupWin.show();
			}
		},

		basketRedirect: function()
		{
			location.href = (this.basketData.basketUrl ? this.basketData.basketUrl : BX.message('BASKET_URL'));
		},

		initPopupWindow: function()
		{
			if (this.obPopupWin)
				return;

			this.obPopupWin = BX.PopupWindowManager.create('CatalogSectionBasket_' + this.visual.ID, null, {
				autoHide: true,
				offsetLeft: 0,
				offsetTop: 0,
				overlay : true,
				closeByEsc: true,
				titleBar: true,
				closeIcon: true,
				contentColor: 'white',
				className: '' //this.templateTheme ? 'bx-' + this.templateTheme : ''
			});
		}
	};
})(window);
/* End */
;; /* /bitrix/templates/redesign/components/bitrix/catalog/.default/script.js?15796356262075*/
; /* /bitrix/templates/redesign/components/bitrix/catalog.element/visual/script.js?157963564787265*/
; /* /bitrix/templates/redesign/components/bitrix/catalog.product.subscribe/.default/script.js?157963565525094*/
; /* /bitrix/components/bitrix/sale.prediction.product.detail/templates/.default/script.min.js?1574018301394*/
; /* /bitrix/templates/redesign/components/bitrix/catalog.products.viewed/.default/script.js?15796356581291*/
; /* /bitrix/templates/redesign/components/bitrix/catalog.item/.default/script.js?157963565063194*/

//# sourceMappingURL=page_dea630c2f5ba4f089eb9eb1bca9456ed.map.js