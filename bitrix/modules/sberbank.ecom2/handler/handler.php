<?php

namespace Sale\Handlers\PaySystem;

use Bitrix\Main\Error;
use Bitrix\Main\Localization\Loc;
use Bitrix\Main\Request;
use Bitrix\Main\Text\Encoding;
use Bitrix\Main\Type\DateTime;
use Bitrix\Main\Web;
use Bitrix\Sale\BusinessValue;
use Bitrix\Sale\PaySystem;
use Bitrix\Sale\Payment;
use Bitrix\Sale\Order;
use Bitrix\Main\Loader;
use Bitrix\Main\Config\Option;

IncludeModuleLangFile(__FILE__);
require_once dirname(dirname(__FILE__)) . '/config.php';
Loader::includeModule( 'sberbank.ecom2' );

/**
 * Class SberbankEcomHandler
 * @package Sale\Handlers\PaySystem
 */
class sberbank_ecom2Handler extends PaySystem\ServiceHandler implements PaySystem\IPrePayable
{
	/**
	 * @param Payment $payment
	 * @param Request|null $request
	 * @return PaySystem\ServiceResult
	 */
	public function initiatePay(Payment $payment, Request $request = null)
	{

		$moduleId = 'sberbank.ecom2';
		
		$RBS_Gateway = new \Sberbank\Payments\Gateway;

		
		// module settings
		$RBS_Gateway->setOptions(array(
			'module_id' => Option::get($moduleId, 'MODULE_ID'),
			'gate_url_prod' => Option::get($moduleId, 'SBERBANK_PROD_URL'),
			'gate_url_test' => Option::get($moduleId, 'SBERBANK_TEST_URL'),
			'module_version' => Option::get($moduleId, 'MODULE_VERSION'),
			'iso' => unserialize(Option::get($moduleId, 'ISO')),
			'cms_version' => 'Bitrix ' . SM_VERSION,
			'language' => 'ru',
		));

		// handler settings
		$RBS_Gateway->setOptions(array(
			'ofd_tax' => $this->getBusinessValue($payment, 'SBERBANK_OFD_TAX_SYSTEM') == 0 ? 0 : $this->getBusinessValue($payment, 'SBERBANK_OFD_TAX_SYSTEM'),
			'ofd_enabled' => $this->getBusinessValue($payment, 'SBERBANK_OFD_RECIEPT')  == 'Y' ? 1 : 0,
			'ffd_version' => $this->getBusinessValue($payment, 'SBERBANK_FFD_VERSION'),
			'ffd_payment_object' => $this->getBusinessValue($payment, 'SBERBANK_FFD_PAYMENT_OBJECT'),
			'ffd_payment_method' => $this->getBusinessValue($payment, 'SBERBANK_FFD_PAYMENT_METHOD'),
			'test_mode' => $this->getBusinessValue($payment, 'SBERBANK_GATE_TEST_MODE') == 'Y' ? 1 : 0,
			'handler_logging' => $this->getBusinessValue($payment, 'SBERBANK_HANDLER_LOGGING') == 'Y' ? 1 : 0,
			'handler_two_stage' => $this->getBusinessValue($payment, 'SBERBANK_HANDLER_TWO_STAGE') == 'Y' ? 1 : 0,
		));

		$RBS_Gateway->buildData(array(
			'orderNumber' => $this->getBusinessValue($payment, 'SBERBANK_ORDER_NUMBER'),
		    'amount' => $this->getBusinessValue($payment, 'SBERBANK_ORDER_AMOUNT'),
		    'userName' => $this->getBusinessValue($payment, 'SBERBANK_GATE_LOGIN'),
		    'password' => $this->getBusinessValue($payment, 'SBERBANK_GATE_PASSWORD'),
		    'description' => $this->getBusinessValue($payment, 'SBERBANK_ORDER_DESCRIPTION'),
		));

		$protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== "off" ? 'https://' : 'http://';
		$domain_name = $_SERVER['HTTP_HOST'];
		
		
		if(SITE_DIR == '/' || strlen(SITE_DIR) == 0) {
			$site_dir = '/';
		} else {
			if(substr(SITE_DIR, 0, 1) != '/') {
			    $site_dir = '/' . SITE_DIR;
			}
			if(substr(SITE_DIR, -1, 1) != '/') {
			    $site_dir = SITE_DIR . '/';
			}
		}

		
		$RBS_Gateway->buildData(array(
		    'returnUrl' => $protocol . $domain_name . $site_dir  . 'sberbank/result.php' . '?PAYMENT=SBERBANK&ORDER_ID=' . $payment->getField('ORDER_ID') . '&PAYMENT_ID=' . $payment->getField('ID')
		));

		if ($RBS_Gateway->ofdEnable()) {

			$Order = Order::load($payment->getOrderId());
			$propertyCollection = $Order->getPropertyCollection();
			$Basket = $Order->getBasket();
			$basketItems = $Basket->getBasketItems();

			$phone_key = strlen(Option::get($moduleId, 'OPTION_PHONE')) > 0 ? Option::get($moduleId, 'OPTION_PHONE') : 'PHONE';
			$email_key = strlen(Option::get($moduleId, 'OPTION_EMAIL')) > 0 ? Option::get($moduleId, 'OPTION_EMAIL') : 'EMAIL';
			
			$RBS_Gateway->setOptions(array(
				'customer_name' => $this->getPropertyValueByCode($propertyCollection, 'FIO'),
				'customer_email' => $this->getPropertyValueByCode($propertyCollection, $email_key),
				'customer_phone' => $this->getPropertyValueByCode($propertyCollection, $phone_key),
			));

			$lastIndex = 0;
			foreach ($basketItems as $key => $BasketItem) {
				$lastIndex = $key + 1;
		        $RBS_Gateway->setPosition(array(
		            'positionId' => $key,
		            'itemCode' => $BasketItem->getProductId(),
		            'name' => $BasketItem->getField('NAME'),
		            'itemAmount' => $BasketItem->getFinalPrice(),
		            'itemPrice' => $BasketItem->getPrice(),
		            'quantity' => array(
		                'value' => $BasketItem->getQuantity(),
		                'measure' => $BasketItem->getField('MEASURE_NAME'),
		            ),
		            'tax' => array(
		                'taxType' =>  $RBS_Gateway->getTaxCode( $BasketItem->getField('VAT_RATE') * 100 ),
		            ),
		        ));
			}

			if($Order->getField('PRICE_DELIVERY') > 0) {
				
				Loader::includeModule('catalog');
				$deliveryInfo = \Bitrix\Sale\Delivery\Services\Manager::getById($Order->getField('DELIVERY_ID'));

				$deliveryVatItem = \CCatalogVat::GetByID($deliveryInfo['VAT_ID'])->Fetch();
				$RBS_Gateway->setOptions(array(
				    'delivery' => true,
				));
				$RBS_Gateway->setPosition(array(
		            'positionId' => $lastIndex + 1,
		            'itemCode' => 'DELIVERY_' . $Order->getField('DELIVERY_ID'),
		            'name' => Loc::getMessage('SBERBANK_PAYMENT_FIRLD_DELIVERY'),
		            'itemAmount' => $Order->getField('PRICE_DELIVERY'),
		            'itemPrice' => $Order->getField('PRICE_DELIVERY'),
		            'quantity' => array(
		                'value' => 1,
		                'measure' => Loc::getMessage('SBERBANK_PAYMENT_FIELD_MEASURE'),
		            ),
		            'tax' => array(
		                'taxType' => $RBS_Gateway->getTaxCode($deliveryVatItem['RATE']),
		            ),
		        ));	
			}
		}

		$gateResponse = $RBS_Gateway->registerOrder();

		$params = array(
	        'sberbank_result' => $gateResponse,
	        'payment_link' => $RBS_Gateway->getPaymentLink(),
	        'currency' => $payment->getField('CURRENCY')
	    );
	    $this->setExtraParams($params);

	    return $this->showTemplate($payment, "payment");
	}

	public function processRequest(Payment $payment, Request $request)
	{
		global $APPLICATION;
		$moduleId = 'sberbank.ecom2';

		$RBS_Gateway = new \Sberbank\Payments\Gateway;
		$RBS_Gateway->setOptions(array(
			// module settings
			'gate_url_prod' => Option::get($moduleId, 'SBERBANK_PROD_URL'),
			'gate_url_test' => Option::get($moduleId, 'SBERBANK_TEST_URL'),
			'test_mode' => $this->getBusinessValue($payment, 'SBERBANK_GATE_TEST_MODE') == 'Y' ? 1 : 0,
		));

		$RBS_Gateway->buildData(array(
		    'userName' => $this->getBusinessValue($payment, 'SBERBANK_GATE_LOGIN'),
		    'password' => $this->getBusinessValue($payment, 'SBERBANK_GATE_PASSWORD'),
		    'orderId' => $request->get('orderId'),
		));
		
		$gateResponse = $RBS_Gateway->checkOrder();

		$resultId = explode("_", $gateResponse['orderNumber'] );
        array_pop($resultId);
        $resultId = implode('_', $resultId);

        $successPayment = true;
        
        if($resultId != $this->getBusinessValue($payment, 'SBERBANK_ORDER_NUMBER')) {
			$successPayment = false;
		}

        if( $gateResponse['errorCode'] != 0 || ($gateResponse['orderStatus'] != 1 && $gateResponse['orderStatus'] != 2) ) {
        	$successPayment = false;
        }

        if($successPayment && !$payment->isPaid()) {

        	// set payment status
        	$order = Order::load($payment->getOrderId());
			$paymentCollection = $order->getPaymentCollection();
			
			foreach ($paymentCollection as $col_payment) {
				if($col_payment->getField('ID') == $payment->getField('ID')) {
					$col_payment->setPaid("Y");
					$col_payment->setFields(array(
		                "PS_SUM" => $gateResponse["amount"] / 100,
		                "PS_CURRENCY" => $gateResponse["currency"],
		                "PS_RESPONSE_DATE" => new DateTime(),
		                "PS_STATUS" => "Y",
		                "PS_STATUS_DESCRIPTION" => $gateResponse["cardAuthInfo"]["pan"] . ";" . $gateResponse['cardAuthInfo']["cardholderName"],
		                "PS_STATUS_MESSAGE" => $gateResponse["paymentAmountInfo"]["paymentState"],
		                "PS_STATUS_CODE" =>  $gateResponse['orderStatus'],
	        		));

	        		break;
				}
			}

			$option_order_status = Option::get($moduleId, 'RESULT_ORDER_STATUS');

			$statuses = array();
			$dbStatus = \CSaleStatus::GetList(Array("SORT" => "ASC"), Array("LID" => LANGUAGE_ID), false, false, Array("ID", "NAME", "SORT"));
			while ($arStatus = $dbStatus->GetNext()) {
			    $statuses[$arStatus["ID"]] = "[" . $arStatus["ID"] . "] " . $arStatus["NAME"];
			}

			if($order->isPaid()) {
				// // set order status
				if(array_key_exists($option_order_status, $statuses)) {
					$order->setField('STATUS_ID', $option_order_status);
				} else {
					echo '<span style="display:block; font-size:16px; display:block; color:red;padding:20px 0;">ERROR! CANT CHANGE ORDER STATUS</span>';
				}
				// set delivery status
				if($this->getBusinessValue($payment, 'SBERBANK_HANDLER_SHIPMENT') == 'Y') {
					$shipmentCollection = $order->getShipmentCollection();
					foreach ($shipmentCollection as $shipment){
					    if (!$shipment->isSystem()) {
			        		$shipment->allowDelivery();
					    }
			    	}
		    	}
	    	}

		    $order->save();
        }

        
		echo '<div class="sberbank-result-message" style="margin:20px; text-align:center;"><span style="font-size:16px;">';
        if($successPayment) {
        	$APPLICATION->SetTitle(Loc::getMessage('SBERBANK_PAYMENT_MESSAGE_THANKS'));
        	echo Loc::getMessage('SBERBANK_PAYMENT_MESSAGE_THANKS_DESCRIPTION') . $this->getBusinessValue($payment, 'SBERBANK_ORDER_NUMBER');
        } else {
        	$APPLICATION->SetTitle(Loc::getMessage('SBERBANK_PAYMENT_MESSAGE_ERROR'));
        	echo Loc::getMessage('SBERBANK_PAYMENT_MESSAGE_ERROR') . ' #' . $this->getBusinessValue($payment, 'SBERBANK_ORDER_NUMBER');
        }
        echo "</span></div>";
       
        return new PaySystem\ServiceResult();
	}

	public function getPaymentIdFromRequest(Request $request)
	{
	    $paymentId = $request->get('PAYMENT_ID');
	    return intval($paymentId);
	}

	public function getCurrencyList()
	{
		return array('RUB');
	}

	public static function getIndicativeFields()
	{
		return array('PAYMENT' => 'SBERBANK');
	}

	static protected function isMyResponseExtended(Request $request, $paySystemId)
	{
		$order = Order::load($request->get('ORDER_ID'));
		if(!$order) {
			$order = Order::loadByAccountNumber($request->get('ORDER_ID'));
		} 
		if(!$order) {
			echo Loc::getMessage('RBS_MESSAGE_ERROR_BAD_ORDER');
			return false;
		}

		$paymentIds = $order->getPaymentSystemId();
		return in_array($paySystemId, $paymentIds);
	}

	private function getPropertyValueByCode($propertyCollection, $code) {
		$property = '';
		foreach ($propertyCollection as $property)
	    {
	        if($property->getField('CODE') == $code)
	            return $property->getValue();
	    }
	}


	/**
	 * @return array
	 */
	protected function getUrlList()
	{
		return array(

		);
	}
	/**
	 * @return array
	 */
	public function getProps()
	{
		$data = array();

		return $data;
	}
	/**
	 * @param Payment $payment
	 * @param Request $request
	 * @return bool
	 */
	public function initPrePayment(Payment $payment = null, Request $request)
	{
		return true;
	}
	/**
	 * @param array $orderData
	 */
	public function payOrder($orderData = array())
	{

	}
	/**
	 * @param array $orderData
	 * @return bool|string
	 */
	public function BasketButtonAction($orderData = array())
	{
		return true;
	}
	/**
	 * @param array $orderData
	 */
	public function setOrderConfig($orderData = array())
	{
		if ($orderData)
			$this->prePaymentSetting = array_merge($this->prePaymentSetting, $orderData);
	}
	public function isTuned(){}
	public function isRefundableExtended(){}
	public function confirm(Payment $payment){}
	public function cancel(Payment $payment){}
	public function refund(Payment $payment, $refundableSum){}
	public function sendResponse(PaySystem\ServiceResult $result, Request $request){}

}