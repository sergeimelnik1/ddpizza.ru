
; /* Start:"a:4:{s:4:"full";s:105:"/bitrix/templates/redesign/components/bitrix/sale.personal.order.detail/.default/script.js?15796357874155";s:6:"source";s:90:"/bitrix/templates/redesign/components/bitrix/sale.personal.order.detail/.default/script.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/
BX.namespace('BX.Sale.PersonalOrderComponent');

(function() {
	BX.Sale.PersonalOrderComponent.PersonalOrderDetail = {
		init : function(params)
		{
			var linkMoreOrderInformation = document.getElementsByClassName('sale-order-detail-about-order-inner-container-name-read-more')[0];
			var linkLessOrderInformation = document.getElementsByClassName('sale-order-detail-about-order-inner-container-name-read-less')[0];
			var clientInformation = document.getElementsByClassName('sale-order-detail-about-order-inner-container-details')[0];
			var listShipmentWrapper = document.getElementsByClassName('sale-order-detail-payment-options-shipment');
			var listPaymentWrapper = document.getElementsByClassName('sale-order-detail-payment-options-methods');
			var shipmentTrackingId = document.getElementsByClassName('sale-order-detail-shipment-id');

			if (shipmentTrackingId[0])
			{
				Array.prototype.forEach.call(shipmentTrackingId, function(blockId)
				{
					var clipboard = blockId.parentNode.getElementsByClassName('sale-order-detail-shipment-id-icon')[0];
					if (clipboard)
					{
						BX.clipboard.bindCopyClick(clipboard, {text : blockId.innerHTML});
					}
				});
			}


			BX.bind(linkMoreOrderInformation, 'click', function()
			{

				clientInformation.style.display = 'inline-block';
				linkMoreOrderInformation.style.display = 'none';
				linkLessOrderInformation.style.display = 'inline-block';
			},this);
			BX.bind(linkLessOrderInformation, 'click', function()
			{
				clientInformation.style.display = 'none';
				linkMoreOrderInformation.style.display = 'inline-block';
				linkLessOrderInformation.style.display = 'none';
			},this);

			Array.prototype.forEach.call(listShipmentWrapper, function(shipmentWrapper)
			{
				var detailShipmentBlock = shipmentWrapper.getElementsByClassName('sale-order-detail-payment-options-shipment-composition-map')[0];
				var showInformation = shipmentWrapper.getElementsByClassName('sale-order-detail-show-link')[0];
				var hideInformation = shipmentWrapper.getElementsByClassName('sale-order-detail-hide-link')[0];

				BX.bindDelegate(shipmentWrapper, 'click', { 'class': 'sale-order-detail-show-link' }, BX.proxy(function()
				{
					showInformation.style.display = 'none';
					hideInformation.style.display = 'inline-block';
					detailShipmentBlock.style.display = 'block';
				}, this));
				BX.bindDelegate(shipmentWrapper, 'click', { 'class': 'sale-order-detail-hide-link' }, BX.proxy(function()
				{
					showInformation.style.display = 'inline-block';
					hideInformation.style.display = 'none';
					detailShipmentBlock.style.display = 'none';
				}, this));
			});

			Array.prototype.forEach.call(listPaymentWrapper, function(paymentWrapper)
			{
				var rowPayment = paymentWrapper.getElementsByClassName('sale-order-detail-payment-options-methods-info')[0];

				BX.bindDelegate(paymentWrapper, 'click', { 'class': 'active-button' }, BX.proxy(function()
				{
					BX.toggleClass(paymentWrapper, 'sale-order-detail-active-event');
				}, this));

				BX.bindDelegate(rowPayment, 'click', { 'class': 'sale-order-detail-payment-options-methods-info-change-link' }, BX.proxy(function(event)
				{
					event.preventDefault();

					var btn = rowPayment.parentNode.getElementsByClassName('sale-order-detail-payment-options-methods-button-container')[0];
					var linkReturn = rowPayment.parentNode.getElementsByClassName('sale-order-detail-payment-inner-row-template')[0];
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
								rowPayment.innerHTML = result;
								if (btn)
								{
									btn.parentNode.removeChild(btn);
								}
								linkReturn.style.display = "block";
								BX.bind(linkReturn, 'click', function()
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
;; /* /bitrix/templates/redesign/components/bitrix/sale.personal.order.detail/.default/script.js?15796357874155*/
; /* /bitrix/components/bitrix/sale.order.payment.change/templates/.default/script.min.js?15740183013628*/
