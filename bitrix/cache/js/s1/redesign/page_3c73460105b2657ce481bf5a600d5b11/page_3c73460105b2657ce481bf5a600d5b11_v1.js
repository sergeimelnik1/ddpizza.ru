
; /* Start:"a:4:{s:4:"full";s:110:"/bitrix/templates/redesign/components/bitrix/main.userconsent.request/.default/user_consent.js?157963569610594";s:6:"source";s:94:"/bitrix/templates/redesign/components/bitrix/main.userconsent.request/.default/user_consent.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/
;(function(){

	function UserConsentControl (params)
	{
		this.caller = params.caller;
		this.formNode = params.formNode;
		this.controlNode = params.controlNode;
		this.inputNode = params.inputNode;
		this.config = params.config;
	}
	UserConsentControl.prototype = {

	};

	BX.UserConsent = {
		msg: {
			'title': 'MAIN_USER_CONSENT_REQUEST_TITLE',
			'btnAccept': 'MAIN_USER_CONSENT_REQUEST_BTN_ACCEPT',
			'btnReject': 'MAIN_USER_CONSENT_REQUEST_BTN_REJECT',
			'loading': 'MAIN_USER_CONSENT_REQUEST_LOADING',
			'errTextLoad': 'MAIN_USER_CONSENT_REQUEST_ERR_TEXT_LOAD'
		},
		events: {
			'save': 'main-user-consent-request-save',
			'refused': 'main-user-consent-request-refused',
			'accepted': 'main-user-consent-request-accepted'
		},
		textList: {},
		current: null,
		autoSave: false,
		isFormSubmitted: false,
		isConsentSaved: false,
		attributeControl: 'data-bx-user-consent',
		load: function (context)
		{
			var item = this.find(context)[0];
			if (!item)
			{
				return null;
			}

			this.bind(item);
			return item;
		},
		loadAll: function (context, limit)
		{
			this.find(context, limit).forEach(this.bind, this);
		},
		loadFromForms: function ()
		{
			var formNodes = document.getElementsByTagName('FORM');
			formNodes = BX.convert.nodeListToArray(formNodes);
			formNodes.forEach(this.loadAll, this);
		},
		find: function (context)
		{
			if (!context)
			{
				return [];
			}

			var controlNodes = context.querySelectorAll('[' + this.attributeControl + ']');
			controlNodes = BX.convert.nodeListToArray(controlNodes);
			return controlNodes.map(this.createItem.bind(this, context)).filter(function (item) { return !!item });
		},
		bind: function (item)
		{
			if (item.config.submitEventName)
			{
				BX.addCustomEvent(item.config.submitEventName, this.onSubmit.bind(this, item));
			}
			else if(item.formNode)
			{
				BX.bind(item.formNode, 'submit', this.onSubmit.bind(this, item));
			}

			BX.bind(item.controlNode, 'click', this.onClick.bind(this, item));
		},
		createItem: function (context, controlNode)
		{
			var inputNode = controlNode.querySelector('input[type="checkbox"]');
			if (!inputNode)
			{
				return;
			}

			try
			{
				var config = JSON.parse(controlNode.getAttribute(this.attributeControl));
				var parameters = {
					'formNode': null,
					'controlNode': controlNode,
					'inputNode': inputNode,
					'config': config
				};

				if (context.tagName == 'FORM')
				{
					parameters.formNode = context;
				}
				else
				{
					parameters.formNode = BX.findParent(inputNode, {tagName: 'FORM'})
				}

				parameters.caller = this;
				return new UserConsentControl(parameters);
			}
			catch (e)
			{
				return null;
			}
		},
		onClick: function (item, e)
		{
			this.requestForItem(item);
			e.preventDefault();
		},
		onSubmit: function (item, e)
		{
			this.isFormSubmitted = true;
			if (this.check(item))
			{
				return true;
			}
			else
			{
				if (e)
				{
					e.preventDefault();
				}

				return false;
			}
		},
		check: function (item)
		{
			if (item.inputNode.checked)
			{
				this.saveConsent(item);
				return true;
			}

			this.requestForItem(item);
			return false;
		},
		requestForItem: function (item)
		{
			this.setCurrent(item);
			this.requestConsent(
				item.config.id,
				{
					'sec': item.config.sec,
					'replace': item.config.replace
				},
				this.onAccepted,
				this.onRefused
			);
		},
		setCurrent: function (item)
		{
			this.current = item;
			this.autoSave = item.config.autoSave;
			this.actionRequestUrl = item.config.actionUrl;
		},
		onAccepted: function ()
		{
			if (!this.current)
			{
				return;
			}

			var item = this.current;
			this.saveConsent(
				this.current,
				function ()
				{
					BX.onCustomEvent(item, this.events.accepted, []);
					BX.onCustomEvent(this, this.events.accepted, [item]);

					this.isConsentSaved = true;

					if (this.isFormSubmitted && item.formNode && !item.config.submitEventName)
					{
						BX.submit(item.formNode);
					}
				}
			);

			this.current.inputNode.checked = true;
			this.current = null;
		},
		onRefused: function ()
		{
			BX.onCustomEvent(this.current, this.events.refused, []);
			BX.onCustomEvent(this, this.events.refused, [this.current]);
			this.current.inputNode.checked = false;
			this.current = null;
			this.isFormSubmitted = false;
		},
		initPopup: function ()
		{
			if (this.popup)
			{
				return;
			}


			this.popup = {

			};
		},
		popup: {
			isInit: false,
			caller: null,
			nodes: {
				container: null,
				shadow: null,
				head: null,
				loader: null,
				content: null,
				textarea: null,
				buttonAccept: null,
				buttonReject: null
			},
			onAccept: function ()
			{
				this.hide();
				BX.onCustomEvent(this, 'accept', []);
			},
			onReject: function ()
			{
				this.hide();
				BX.onCustomEvent(this, 'reject', []);
			},
			init: function ()
			{
				if (this.isInit)
				{
					return true;
				}

				var tmplNode = document.querySelector('script[data-bx-template]');
				if (!tmplNode)
				{
					return false;
				}

				var popup = document.createElement('DIV');
				popup.innerHTML = tmplNode.innerHTML;
				popup = popup.children[0];
				if (!popup)
				{
					return false;
				}
				document.body.insertBefore(popup, document.body.children[0]);

				this.isInit = true;
				this.nodes.container = popup;
				this.nodes.shadow = this.nodes.container.querySelector('[data-bx-shadow]');
				this.nodes.head = this.nodes.container.querySelector('[data-bx-head]');
				this.nodes.loader = this.nodes.container.querySelector('[data-bx-loader]');
				this.nodes.content = this.nodes.container.querySelector('[data-bx-content]');
				this.nodes.textarea = this.nodes.container.querySelector('[data-bx-textarea]');

				this.nodes.buttonAccept = this.nodes.container.querySelector('[data-bx-btn-accept]');
				this.nodes.buttonReject = this.nodes.container.querySelector('[data-bx-btn-reject]');
				this.nodes.buttonAccept.textContent = BX.message(this.caller.msg.btnAccept);
				this.nodes.buttonReject.textContent = BX.message(this.caller.msg.btnReject);
				BX.bind(this.nodes.buttonAccept, 'click', this.onAccept.bind(this));
				BX.bind(this.nodes.buttonReject, 'click', this.onReject.bind(this));

				return true;
			},
			setTitle: function (text)
			{
				if (!this.nodes.head)
				{
					return;
				}
				this.nodes.head.textContent = text;
			},
			setContent: function (text)
			{
				if (!this.nodes.textarea)
				{
					return;
				}
				this.nodes.textarea.textContent = text;
			},
			show: function (isContentVisible)
			{
				if (typeof isContentVisible == 'boolean')
				{
					this.nodes.loader.style.display = !isContentVisible ? '' : 'none';
					this.nodes.content.style.display = isContentVisible ? '' : 'none';
				}

				this.nodes.container.style.display = '';
			},
			hide: function ()
			{
				this.nodes.container.style.display = 'none';
			}
		},
		requestConsent: function (id, sendData, onAccepted, onRefused)
		{
			sendData = sendData || {};
			sendData.id = id;

			if (!this.popup.isInit)
			{
				this.popup.caller = this;
				if (!this.popup.init())
				{
					return;
				}

				BX.addCustomEvent(this.popup, 'accept', onAccepted.bind(this));
				BX.addCustomEvent(this.popup, 'reject', onRefused.bind(this));
			}

			if (this.current && this.current.config.text)
			{
				this.textList[id] = this.current.config.text;
			}

			if (this.textList.hasOwnProperty(id))
			{
				this.setTextToPopup(this.textList[id]);
			}
			else
			{
				this.popup.setTitle(BX.message(this.msg.loading));
				this.popup.show(false);
				this.sendActionRequest(
					'getText', sendData,
					function (data)
					{
						this.textList[id] = data.text || '';
						this.setTextToPopup(this.textList[id]);
					},
					function ()
					{
						this.popup.hide();
						alert(BX.message(this.msg.errTextLoad));
					}
				);
			}
		},
		setTextToPopup: function (text)
		{
			// set title from a first line from text.
			var titleBar = '';
			var textTitlePos = text.indexOf("\n");
			var textTitleDotPos = text.indexOf(".");
			textTitlePos = textTitlePos < textTitleDotPos ? textTitlePos : textTitleDotPos;
			if (textTitlePos >= 0 && textTitlePos <= 100)
			{
				titleBar = text.substr(0, textTitlePos).trim();
				titleBar  = titleBar.split(".").map(Function.prototype.call, String.prototype.trim).filter(String)[0];
			}
			this.popup.setTitle(titleBar ? titleBar : BX.message(this.msg.title));
			this.popup.setContent(text);
			this.popup.show(true);
		},
		saveConsent: function (item, callback)
		{
			this.setCurrent(item);

			var data = {
				'id': item.config.id,
				'sec': item.config.sec,
				'url': window.location.href
			};
			if (item.config.originId)
			{
				var originId = item.config.originId;
				if (item.formNode && originId.indexOf('%') >= 0)
				{
					var inputs = item.formNode.querySelectorAll('input[type="text"], input[type="hidden"]');
					inputs = BX.convert.nodeListToArray(inputs);
					inputs.forEach(function (input) {
						if (!input.name)
						{
							return;
						}
						originId = originId.replace('%' + input.name +  '%', input.value ? input.value : '');
					});
				}
				data.originId = originId;
			}
			if (item.config.originatorId)
			{
				data.originatorId = item.config.originatorId;
			}

			BX.onCustomEvent(item, this.events.save, [data]);
			BX.onCustomEvent(this, this.events.save, [item, data]);

			if (this.isConsentSaved || !item.config.autoSave)
			{
				if (callback)
				{
					callback.apply(this, []);
				}
			}
			else
			{
				this.sendActionRequest(
					'saveConsent',
					data,
					callback,
					callback
				);
			}
		},
		sendActionRequest: function (action, sendData, callbackSuccess, callbackFailure)
		{
			callbackSuccess = callbackSuccess || null;
			callbackFailure = callbackFailure || null;

			sendData.action = action;
			sendData.sessid = BX.bitrix_sessid();
			sendData.action = action;

			BX.ajax({
				url: this.actionRequestUrl,
				method: 'POST',
				data: sendData,
				timeout: 10,
				dataType: 'json',
				processData: true,
				onsuccess: BX.proxy(function(data){
					data = data || {};
					if(data.error)
					{
						callbackFailure.apply(this, [data]);
					}
					else if(callbackSuccess)
					{
						callbackSuccess.apply(this, [data]);
					}
				}, this),
				onfailure: BX.proxy(function(){
					var data = {'error': true, 'text': ''};
					if (callbackFailure)
					{
						callbackFailure.apply(this, [data]);
					}
				}, this)
			});
		}
	};

	BX.ready(function () {
		BX.UserConsent.loadFromForms();
	});

})();
/* End */
;
; /* Start:"a:4:{s:4:"full";s:103:"/bitrix/templates/redesign/components/bitrix/sale.personal.order.list/.default/script.js?15796357903279";s:6:"source";s:88:"/bitrix/templates/redesign/components/bitrix/sale.personal.order.list/.default/script.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/
BX.namespace('BX.Sale.PersonalOrderComponent');

(function() {
	BX.Sale.PersonalOrderComponent.PersonalOrderList = {
		init : function(params)
		{
			var rowWrapper = document.getElementsByClassName('sale-order-list-inner-row');

			params.paymentList = params.paymentList || {};
			params.url = params.url || "";
			
			Array.prototype.forEach.call(rowWrapper, function(wrapper)
			{
				var shipmentTrackingId = wrapper.getElementsByClassName('sale-order-list-shipment-id');
				if (shipmentTrackingId[0])
				{
					Array.prototype.forEach.call(shipmentTrackingId, function(blockId)
					{
						var clipboard = blockId.parentNode.getElementsByClassName('sale-order-list-shipment-id-icon')[0];
						if (clipboard)
						{
							BX.clipboard.bindCopyClick(clipboard, {text : blockId.innerHTML});
						}
					});
				}

				BX.bindDelegate(wrapper, 'click', { 'class': 'ajax_reload' }, BX.proxy(function(event)
				{
					var block = wrapper.getElementsByClassName('sale-order-list-inner-row-body')[0];
					var template = wrapper.getElementsByClassName('sale-order-list-inner-row-template')[0];
					var cancelPaymentLink = template.getElementsByClassName('sale-order-list-cancel-payment')[0];

					BX.ajax(
						{
							method: 'POST',
							dataType: 'html',
							url: event.target.href,
							data:
							{
								sessid: BX.bitrix_sessid()
							},
							onsuccess: BX.proxy(function(result)
							{
								var resultDiv = document.createElement('div');
								resultDiv.innerHTML = result;
								template.insertBefore(resultDiv, cancelPaymentLink);
								block.style.display = 'none';
								template.style.display = 'block';

								BX.bind(cancelPaymentLink, 'click', function()
								{
									block.style.display = 'block';
									template.style.display = 'none';
									resultDiv.remove();
								},this);

							},this),
							onfailure: BX.proxy(function()
							{
								return this;
							}, this)
						}, this
					);
					event.preventDefault();
				}, this));
				
				BX.bindDelegate(wrapper, 'click', { 'class': 'sale-order-list-change-payment' }, BX.proxy(function(event)
				{
					event.preventDefault();

					var block = wrapper.getElementsByClassName('sale-order-list-inner-row-body')[0];
					var template = wrapper.getElementsByClassName('sale-order-list-inner-row-template')[0];
					var cancelPaymentLink = template.getElementsByClassName('sale-order-list-cancel-payment')[0];

					BX.ajax(
						{
							method: 'POST',
							dataType: 'html',
							url: params.url,
							data:
							{
								sessid: BX.bitrix_sessid(),
								orderData: params.paymentList[event.target.id]
							},
							onsuccess: BX.proxy(function(result)
							{
								var resultDiv = document.createElement('div');
								resultDiv.innerHTML = result;
								template.insertBefore(resultDiv, cancelPaymentLink);
								event.target.style.display = 'none';
								block.parentNode.removeChild(block);
								template.style.display = 'block';
								BX.bind(cancelPaymentLink, 'click', function()
								{
									window.location.reload();
								},this);

							},this),
							onfailure: BX.proxy(function()
							{
								return this;
							}, this)
						}, this
					);

				}, this));
			});
		}
	};
})();

/* End */
;
; /* Start:"a:4:{s:4:"full";s:99:"/bitrix/components/bitrix/sale.order.payment.change/templates/.default/script.min.js?15740183013628";s:6:"source";s:80:"/bitrix/components/bitrix/sale.order.payment.change/templates/.default/script.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/
BX.Sale.OrderPaymentChange=function(){var e=function(e){this.ajaxUrl=e.url;this.accountNumber=e.accountNumber||{};this.paymentNumber=e.paymentNumber||{};this.wrapperId=e.wrapperId||"";this.onlyInnerFull=e.onlyInnerFull||"";this.pathToPayment=e.pathToPayment||"";this.templateName=e.templateName||"";this.refreshPrices=e.refreshPrices||"N";this.inner=e.inner||"";this.templateFolder=e.templateFolder;this.wrapper=document.getElementById("bx-sopc"+this.wrapperId);this.paySystemsContainer=this.wrapper.getElementsByClassName("sale-order-payment-change-pp")[0];BX.ready(BX.proxy(this.init,this))};e.prototype.init=function(){var e=this.wrapper.getElementsByClassName("sale-order-payment-change-pp-list")[0];new BX.easing({duration:500,start:{opacity:0,height:50},finish:{opacity:100,height:"auto"},transition:BX.easing.makeEaseOut(BX.easing.transitions.quad),step:function(t){e.style.opacity=t.opacity/100;e.style.height=e.height/450+"px"},complete:function(){e.style.height="auto"}}).animate();BX.bindDelegate(this.paySystemsContainer,"click",{className:"sale-order-payment-change-pp-company"},BX.proxy(function(e){var t=e.target.parentNode;var n=t.getElementsByClassName("sale-order-payment-change-pp-company-hidden")[0];BX.ajax({method:"POST",dataType:"html",url:this.ajaxUrl,data:{sessid:BX.bitrix_sessid(),paySystemId:n.value,accountNumber:this.accountNumber,paymentNumber:this.paymentNumber,inner:this.inner,templateName:this.templateName,refreshPrices:this.refreshPrices,onlyInnerFull:this.onlyInnerFull,pathToPayment:this.pathToPayment},onsuccess:BX.proxy(function(t){this.paySystemsContainer.innerHTML=t;if(this.wrapper.parentNode.previousElementSibling){var n=this.wrapper.parentNode.previousElementSibling.getElementsByClassName("sale-order-detail-payment-options-methods-image-element")[0];if(n!==undefined){n.style.backgroundImage=e.target.style.backgroundImage}}},this),onfailure:BX.proxy(function(){return this},this)},this);return this},this));return this};return e}();BX.Sale.OrderInnerPayment=function(){var e=function(e){this.ajaxUrl=e.url;this.accountNumber=e.accountNumber||{};this.paymentNumber=e.paymentNumber||{};this.wrapperId=e.wrapperId||"";this.valueLimit=parseFloat(e.valueLimit)||0;this.templateFolder=e.templateFolder;this.wrapper=document.getElementById("bx-sopc"+this.wrapperId);this.inputElement=this.wrapper.getElementsByClassName("inner-payment-form-control")[0];this.sendPayment=this.wrapper.getElementsByClassName("sale-order-inner-payment-button")[0];BX.ready(BX.proxy(this.init,this))};e.prototype.init=function(){BX.bind(this.inputElement,"input",BX.delegate(function(){this.inputElement.value=this.inputElement.value.replace(/[^\d,.]*/g,"").replace(/,/g,".").replace(/([,.])[,.]+/g,"$1").replace(/^[^\d]*(\d+([.,]\d{0,2})?).*$/g,"$1");var e=parseFloat(this.inputElement.value);if(e>this.valueLimit){this.inputElement.value=this.valueLimit}if(e<=0){this.inputElement.value=0;this.sendPayment.classList.add("inactive-button")}else{this.sendPayment.classList.remove("inactive-button")}},this));BX.bind(this.sendPayment,"click",BX.delegate(function(){if(event.target.classList.contains("inactive-button")){return this}event.target.classList.add("inactive-button");BX.ajax({method:"POST",dataType:"html",url:this.ajaxUrl,data:{sessid:BX.bitrix_sessid(),accountNumber:this.accountNumber,paymentNumber:this.paymentNumber,inner:"Y",onlyInnerFull:this.onlyInnerFull,paymentSum:this.inputElement.value},onsuccess:BX.proxy(function(e){if(e.length>0)this.wrapper.innerHTML=e;else window.location.reload()},this),onfailure:BX.proxy(function(){return this},this)},this);return this},this))};return e}();
/* End */
;; /* /bitrix/templates/redesign/components/bitrix/main.userconsent.request/.default/user_consent.js?157963569610594*/
; /* /bitrix/templates/redesign/components/bitrix/sale.personal.order.list/.default/script.js?15796357903279*/
; /* /bitrix/components/bitrix/sale.order.payment.change/templates/.default/script.min.js?15740183013628*/
