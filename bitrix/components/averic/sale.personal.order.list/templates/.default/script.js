BX.namespace('BX.Sale.PersonalOrderComponent');
var printed_order,needReload = true;
(function() {
	BX.Sale.PersonalOrderComponent.PersonalOrderList = {
		init : function(params)
		{
			var rowWrapper = document.getElementsByClassName('sale-order-list-inner-row');

			params.paymentList = params.paymentList || {};
			params.url = params.url || "";
			params.templateName = params.templateName || "";

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

				var isChangingLoaded = false;
				BX.bindDelegate(wrapper, 'click', { 'class': 'sale-order-list-change-payment' }, BX.proxy(function(event)
				{
					if (isChangingLoaded)
						return;
					isChangingLoaded = true;
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
								orderData: params.paymentList[event.target.id],
								templateName : params.templateName
							},
							onsuccess: BX.proxy(function(result)
							{
								var resultDiv = BX.create("div",{
									props: {className: "row"},
									children: [result]
								});

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
								isChangingLoaded = false;
								return this;
							}, this)
						}, this
					);

				}, this));
			});
		}
	};
})();



$(document).ready(function(){
	$('body').addClass("status_N");
	if($(".newOrder").length>0){
		startSound();
	}
	state_cheking = setInterval(ajaxCheckState,10000);
	reloadPage = setInterval(reloadPage,120000);
	bindEvents();
});

function reloadPage(){
	/*$(".orderRow").each(function(){
		if(!$(this).hasClass('d-none')){
			if($(this).find('.innerInfoRow').css('display')=='block'){
				needReload = false;
			}
		}
	});
	if(needReload){
		document.location.reload();
	}
	needReload = true;*/
	document.location.href = "https://ddpizza.ru/crm/"
}

function updateCounters(old_status,new_status){
	
	$(".filterOrders .btn").each(function(){
		var cnt = 0;
		if($(this).data("val") == old_status){
			cnt = parseInt($(this).find("span").text());
			cnt = cnt - 1;
			$(this).find("span").text(cnt);
		}
		if($(this).data("val") == new_status){
			cnt = parseInt($(this).find("span").text());
			cnt = cnt + 1;
			$(this).find("span").text(cnt);
		}
	});
}

function updateList(new_status){
	
	$(".orderRow").each(function(){
		if($(this).data("status-id") == new_status && new_status!="V"){
			$(this).addClass("d-none");
		}
	});
}

function refreshOrder(order_id,open){
	
if(typeof(open)=="undefined"){
	open  = true;
}
var params = "filter_id="+order_id;
if(open){
	params = params+"&open";
}
	
	$.get("/crm/",params,function(res){
		$(".orderRow").each(function(){
			if($(this).data("id") == order_id){
				$(this).html($(res).find(".orderRow").html());
				unbindEvents();
				bindEvents();
			}
		});
	});
}
function unbindEvents(){
	$("*").unbind("click");
	$("*").unbind("keyup");
}
function bindEvents(){
	$(".topLeft").on("click",function(e){
		e.preventDefault();
		$(this).closest(".orderRow").find(".innerInfoRow").slideToggle();
	});
	$(".newOrder .view").click(function(){

		var order = $(this).closest(".newOrder");
		var order_id = order.data("id");
		var old_status = order.data("status-id");
		var status_val = "V";//просмотренные
$(this).remove();
		$.post("/ajax/change_order.php","order_id="+order_id+"&status="+status_val,function(data){
			console.log(data);
			var msg = $.parseJSON(data);

			if(!msg.error){
				order.removeClass("newOrder");
				order.data("status-id",status_val);
				stopSound();
				setCurrent();
				updateCounters(old_status,status_val);
				updateList(status_val);
			}
		});

		
	});
	$(".orderRow .buttonsRow button").on("click",function(e){
		if(!$(this).hasClass("view")){
			
		e.preventDefault();
if(!$(this).hasClass("inactive")){
	$(this).addClass("inactive");
		var order_id = $(this).closest(".orderRow").data("id");
		var old_status = $(this).closest(".orderRow").data("status-id");
		var status_val = $(this).data("val");
		var order = $(this).closest(".orderRow");
		if(typeof($(this).data("val"))!="undefined" && status_val!=""){
		$.post("/ajax/change_order.php","order_id="+order_id+"&status="+status_val,function(data){
			console.log(data);
			var msg = $.parseJSON(data);
			alert(msg.text);
			if(!msg.error){
				if(status_val == "A"){
					location.reload();
				}
				order.data("status-id",status_val);
				order.find(".innerInfoRow").slideUp();
				order.removeClass("newOrder");
				stopSound();
				setCurrent();
				updateCounters(old_status,status_val);
				updateList(status_val);
			}
			$(this).removeClass("inactive");
		});
		}
		if(typeof($(this).data("id"))!="undefined" && $(this).data("id")!=""){
			$(".row.orderRow").removeAttr("style");
			$(".row.orderRow[data-id='"+$(this).data("id")+"']").attr("style","display:flex !important");
			printed_order = $(this).data("id");
			window.print();
			setTimeout(function(){$(".row.orderRow[data-id='"+printed_order+"']").removeAttr("style");},5000);
			
		}
}
		}
	});
	$(".filterOrders .btn").on("click",function(e){
		e.preventDefault();
		var cur_status = $(this).data("val");

		$('body').removeAttr("class");
		$('body').addClass("status_"+$(this).data("val"));
		$(".orderRow").each(function(){
			if($(this).data("status-id") == cur_status || (cur_status=="N" && $(this).data("status-id")=="V")){
				$(this).removeClass("d-none");
			}else{

				if(!$(this).hasClass("newOrder")){
					$(this).addClass("d-none");
				}
			}
		});
	});
	$(".orderRow .staffForm form .btn").on("click",function(e){
		e.preventDefault();
		$.post("/ajax/change_order.php",$(this).closest("form").serialize(),function(data){
			//console.log(data);
			var msg = $.parseJSON(data);
			alert(msg.text);
			if(!msg.error){
				
			}
		});
	});
	$(".orderRow .clientInfo form .changeValue").on("click",function(e){
		e.preventDefault();
		$(this).closest('form').find(".input").toggleClass("d-none");
		$(this).closest('form').find(".value").toggleClass("d-none");
		$(this).closest('form').find(".btn").toggleClass("d-none");
	});
	$(".orderRow .clientInfo form .cancelValue").on("click",function(e){
		e.preventDefault();
		$(this).closest('form').find(".input").toggleClass("d-none");
		$(this).closest('form').find(".value").toggleClass("d-none");
		$(this).closest('form').find(".btn").toggleClass("d-none");
	});
	$(".orderRow .clientInfo form .saveValue").on("click",function(e){
		e.preventDefault();
		var th = $(this);
		$.post("/ajax/change_order.php",$(this).closest("form").serialize(),function(data){
			//console.log(data);
			var msg = $.parseJSON(data);
			alert(msg.text);
			if(!msg.error){
				refreshOrder(th.closest(".orderRow").data("id"),true);
				th.closest('form').find(".input").toggleClass("d-none");
		th.closest('form').find(".value").toggleClass("d-none");
		th.closest('form').find(".btn").toggleClass("d-none");
			}
		});
	});
	
	
	$(".orderRow .orderFull .changeValue").on("click",function(e){
		e.preventDefault();
		$(this).closest('form').find(".input").toggleClass("d-none");
		$(this).closest('form').find(".value").toggleClass("d-none");
		$(this).closest('form').find(".btn").toggleClass("d-none");
	});
	$(".orderRow .orderFull .cancelValue").on("click",function(e){
		e.preventDefault();
		$(this).closest('form').find(".input").toggleClass("d-none");
		$(this).closest('form').find(".value").toggleClass("d-none");
		$(this).closest('form').find(".btn").toggleClass("d-none");
	});
	$(".orderRow .orderFull .saveValue").on("click",function(e){
		e.preventDefault();
		var th = $(this);
		$.post("/ajax/change_order.php",$(this).closest("form").serialize(),function(data){
			//console.log(data);
			var msg = $.parseJSON(data);
			alert(msg.text);
			if(!msg.error){
				refreshOrder(th.closest(".orderRow").data("id"),true);
				th.closest('form').find(".input").toggleClass("d-none");
		th.closest('form').find(".value").toggleClass("d-none");
		th.closest('form').find(".btn").toggleClass("d-none");
			}
		});
	});
	
	$(".orderItemDelete .btn").on("click",function(e){
		e.preventDefault();
		var th = $(this);
		$.post("/ajax/change_order.php","delete=1&order_id="+$(this).data("order-id")+"&basket_item="+$(this).data("id"),function(data){
			//console.log(data);
			var msg = $.parseJSON(data);
			alert(msg.text);
			if(!msg.error){
				refreshOrder(th.closest(".orderRow").data("id"),true);
			}
		});
	});
	$(".orderItemAmount .btn").on("click",function(){
		var curr = parseInt($(this).parent().find("input").val());
		var add = parseInt($(this).data("add"));
		$(this).parent().find("input").val(curr+add);
	});
	
	$(".orderItemUpdate .btn").on("click",function(e){
		e.preventDefault();
		var th = $(this);
		var quantity = $(this).closest(".orderItem").find("input").val();
		$.post("/ajax/change_order.php","update=1&order_id="+$(this).data("order-id")+"&basket_item="+$(this).data("id")+"&quantity="+quantity,function(data){
			console.log(data);
			var msg = $.parseJSON(data);
			alert(msg.text);
			if(!msg.error){
				refreshOrder(th.closest(".orderRow").data("id"),true);
			}
		});
	});
	var delay = false;
	$(".addName").on("keyup",function(){
		var th = $(this);
		
			
			addItemKeyup(th);
		
	});
	
	$(".addItemButton").on("click",function(e){
		e.preventDefault();
		var th = $(this);
		
		$.post("/ajax/change_order.php",$(this).closest('.addItem').serialize(),function(data){
			console.log(data);
			var msg = $.parseJSON(data);
			alert(msg.text);
			if(!msg.error){
				refreshOrder(th.closest(".orderRow").data("id"),true);
			}
		});
	});
	
	$(".cancelOrder").on("click",function(e){
		e.preventDefault();
		var th = $(this);
		$.post("/ajax/change_order.php",$(this).closest("form").serialize(),function(data){
			//console.log(data);
			var msg = $.parseJSON(data);
			alert(msg.text);
			if(!msg.error){
				refreshOrder(th.closest(".orderRow").data("id"),true);
				th.closest('.orderRow').remove();
			}
		});
	});
}

function addItemKeyup(obj){
	delay = false;
			var th = obj;
			var val = th.val();
			
			//alert(1);
			
			if(val.length > 2){
				$.post("/ajax/get_goods.php","name="+val,function(res){
					var data = $.parseJSON(res);
					//console.log(data.result);
					th.closest(".addItem").find(".variants").html("");
						for(var val in data.result){
							//console.log(data.result[val]);
							if(typeof(data.result[val].SKU)!="undefined" && data.result[val].SKU.length>0){
								data.result[val].SKU.forEach(function(el){
									th.closest(".addItem").find(".variants").append("<div data-id='"+el.ID+"'>"+el.NAME+"</div>");
								});
							}else{
								th.closest(".addItem").find(".variants").append("<div data-id='"+data.result[val].ID+"'>"+data.result[val].NAME+"</div>");
							}
						}
					
					$(".addItem .variants div").on("click",function(){
						$(this).closest(".addItem").find(".hiddenItem").val($(this).data("id"));
						$(this).closest(".addItem").find(".selectedItem").text($(this).text());
						$(this).closest(".variants").html("");
						$(this).closest(".addItem").addClass("selected");
					});
					
				});
			}else{
				$(this).closest(".addItem").removeClass("selected");
				
			}
}
function ajaxCheckState(){
	
	$.post("/ajax/check_state.php","",function(result){
		console.log("state check fired");
		result = $.parseJSON(result);
		
		if(result.text!=current_last_order && parseInt(current_last_order)<=parseInt(result.text)){//появился новый заказ
			current_last_order = result.text;
			$(".ordersList").prepend('<div class="row orderRow newOrder" data-id="'+current_last_order+'" data-status-id="N"></div>');
			refreshOrder(result.text,false);
			updateCounters(false,"N");
			startSound();
		}
	});
}
var audio = new Audio(); // Создаём новый элемент Audio
  audio.src = '/crm/chime.mp3'; // Указываем путь к звуку "клика"
  //audio.loop = true;
  var playInterval;
function startSound(){
	audio.play();
	if(typeof(playInterval) == "undefined"){
		playInterval = setInterval(function(){audio.play()},15000);
	}
}
function stopSound(){
	
	var cnt = 0;
	$(".orderRow").each(function(){
			
				if($(this).hasClass("newOrder")){
					cnt = cnt+1;
				}
			
		});
		
		if(cnt == 0){
			clearInterval(playInterval);
		}
}

function setCurrent(){
	var set = false;
	$(".orderRow").each(function(){
			
				if($(this).data("status-id")=="N" && !set){
					current_last_order =  $(this).data("id");
					set = true;
				}
			
		});
}