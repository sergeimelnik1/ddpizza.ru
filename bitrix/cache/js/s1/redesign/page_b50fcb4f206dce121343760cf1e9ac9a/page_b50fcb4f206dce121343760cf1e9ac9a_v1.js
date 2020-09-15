
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
;; /* /bitrix/templates/redesign/components/bitrix/sale.personal.order.list/.default/script.js?15796357903279*/
; /* /bitrix/components/bitrix/sale.order.payment.change/templates/.default/script.min.js?15740183013628*/
