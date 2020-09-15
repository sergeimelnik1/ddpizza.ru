<?php namespace Sberbank\Payments;

use Bitrix\Main\Web;
use DateTime;

define('LOG_FILE', realpath(dirname(dirname(dirname(__FILE__)))) . "/logs/sberbank.log");

Class Gateway
{

    const log_file = LOG_FILE;
    /**
     * Массив с НДС
     *
     * @var integer
     * 0 = Без НДС
     * 2 = НДС чека по ставке 10%
     * 3 = НДС чека по ставке 18%
     * 6 = НДС чека по ставке 20%
     */

    private static $arr_tax = array(
        0 => 0,
        2 => 10, 
        3 => 18,
        6 => 20,
    );
    private $gate_url;

	private $basket = array();
	private $data = array();
	private $options = array(
		'gate_url_prod' => '',
		'gate_url_test' => '',
		'payment_link' => '',
		'ofd_enabled' => false,
		'module_version' => 'def',
		'language' => 'ru',
		'ofd_tax' => 0,
		'handler_two_stage' => 0,
		'delivery' => false,
		'handler_logging' => true
	);

	


	public function buildData($data) {
		foreach ($data as $key => $value) {
			$this->data[$key] = $value;
		}
	}

	public function setOptions($data) {
		foreach ($data as $key => $value) {
			$this->options[$key] = $value;
		}
	}

	public function registerOrder() {
		$this->transformPrices();
		$this->buildData(array(
		    'CMS' => $this->options['cms_version'],
			'language' => $this->options['language'],
		    'jsonParams' => '{"CMS":"'. $this->options['cms_version'] . '", "Module-Version": "' . $this->options['module_version'] . '"}'
		));
		$gateData = $this->data;
		$orderId = $this->data['orderNumber'];

		
		for ($i=0; $i < 30; $i++) {

		 	$gateData['orderNumber'] = $orderId . "_" . $i;
			$method = 'getOrderStatusExtended.do';
		 	$gateResponse = $this->setRequest($method, $gateData);
		 	
		 	if($gateResponse['amount'] != $gateData['amount'] && $gateResponse['errorCode'] != 6) {
			 	continue;
			}
		 	if($gateResponse['errorCode'] == 6) {

		 		// register order from gate
		 		if($this->ofdEnable()) {
		 			$this->addFFDParams();
					$gateData = $this->addOrderBundle($gateData);
				}
				$method = $this->options['handler_two_stage'] ? 'registerPreAuth.do' : 'register.do';
		 		$gateResponse = $this->setRequest($method, $gateData);
				if($gateResponse['errorCode'] == 0 ) {		
			 		$this->setRequest('addParams.do', array(
			 			'userName' => $this->data['userName'],
			 			'password' => $this->data['password'],
			 			'orderId' => $gateResponse['orderId'],
			 			'language' => $this->options['language'],
			 			'params' => json_encode(array('formUrl' => $gateResponse['formUrl'])),
			 		));

			 		$this->createPaymentLink($gateResponse['formUrl'],'register.do');
		 		}
		 		break;

		 	} else if($gateResponse['errorCode'] == 0 && $gateResponse['orderStatus'] == 0) {
		 		// return and build payment link already registered order from gate
		 		foreach ($gateResponse['merchantOrderParams'] as $key => $item) {
		 			if($item['name'] == 'formUrl') {
		 				$this->createPaymentLink($item['value'],'getOrderStatusExtended.do');
		 				break;
		 			}
		 		}
		 		
		 		break;
		 	} else if($gateResponse['errorCode'] == 0 && $gateResponse['orderStatus'] == 2 && $gateResponse['amount'] == $gateData['amount']) {
		 		// order allready payed
				$gateResponse = array('payment' => 1);
				break;
		 	} else if($gateResponse['errorCode'] != 0) {
				break;
		 	}

		}

		if($gateResponse['errorCode'] != 0) {
			$this->baseLogger($this->gate_url, $method, $gateData, $gateResponse,'ERROR REGISTER');
		} else if(($method == 'registerPreAuth.do' || $method == 'register.do') && $this->options['handler_logging']) {
			$this->baseLogger($this->gate_url, $method, $gateData, $gateResponse,'REGISTER NEW ORDER');
		}

		return $gateResponse;
	}


	public function checkOrder() {
		$gateData = $this->data;
		$gateResponse = $this->setRequest('getOrderStatusExtended.do', $gateData);

		if($this->options['handler_logging']) {
			$this->baseLogger($this->gate_url, 'getOrderStatusExtended.do', $gateData, Web\Json::encode($gateResponse),'RESULT PAYMENT ORDER');
		}
		return $gateResponse;
	}

	public function ofdEnable() {
		if($this->options['ofd_enabled'] == true) {
			return true;
		}
		return false;
	}

	public function setPosition($position) {
		array_push($this->basket, $position);
	}


	public function getBasket() {        
		return $this->basket;
	}


	public function getTaxCode($tax_rate) {
		$result = 0;
		foreach (self::$arr_tax as $key => $value) {
			if($value == $tax_rate) {
				$result = $key;
			}
		}
		           
		return $result;
	}
	public function getCurrencyCode($currency) {
		$result = 0;
		foreach ($this->options['iso'] as $key => $value) {

			if($key == $currency) {
				$result = $value;
			}
		}
		return $result;
	}



	private function addFFDParams() {
		if($this->options['ffd_version'] == '1.05') {

			foreach ($this->basket as $key => $item) {

				if($this->options['delivery'] && count($this->basket) == $key+1) {
					$paymentMethod = 1;
					$paymentObject = 4;
				} else {
					$paymentMethod = $this->options['ffd_payment_method'];
					$paymentObject = $this->options['ffd_payment_object'];
				}
				$this->basket[$key]['itemAttributes'] = array(
	                'attributes' => array(
	                    array(
	                        'name' => 'paymentMethod',
	                        'value' => $paymentMethod,
	                    ),
	                    array(
	                        'name' => 'paymentObject',
	                        'value' => $paymentObject,
	                    ),
	                )
	            );
			}

		}
	}
	private function setRequest($method,$data) {

		global $APPLICATION;


		$this->gate_url = $this->options['test_mode'] ?  $this->options['gate_url_test'] : $this->options['gate_url_prod'];

		if (mb_strtoupper(SITE_CHARSET) != 'UTF-8') { $data = $APPLICATION->ConvertCharsetArray($data, 'windows-1251', 'UTF-8'); }
		$http = new Web\HttpClient();
	    $http->setCharset("utf-8");
	 	$http->setHeader('CMS: ', $this->options['cms_version']);
	 	$http->setHeader('Module-Version:: ', $this->options['module_version']);
	 	$http->post($this->gate_url . $method, $data);

	 	$response =  $http->getResult();

	 	if ($this->is_json($response)) {
	    	$response =  Web\Json::decode($response, true);
	    } else {
	        $response = array(
	            'errorCode' => 999,
	            'errorMessage' => 'Server not available',
	        );
	        //var_dump( $http->getError() );
			//var_dump( $http->getStatus() );
			//var_dump( $http->getHeaders() );
	    }

	 	if (SITE_CHARSET != 'UTF-8') { $APPLICATION->ConvertCharsetArray($response, 'UTF-8', 'windows-1251'); }
	 	
	 	return $response;
	}
	private function is_json($string,$return_data = false) {
	      $data = json_decode($string);
	     return (json_last_error() == JSON_ERROR_NONE) ? ($return_data ? $data : TRUE) : FALSE;
	}


	private function addOrderBundle($data) {
		$data['orderBundle']['customerDetails'] = array(
			'email' => $this->options['customer_email'],
			'contact' => $this->options['customer_name'],
		);
		$data['orderBundle']['cartItems']['items'] = $this->basket;
		$data['taxSystem'] = $this->options['ofd_tax'];

		$data['orderBundle'] = Web\Json::encode($data['orderBundle']);
		return $data;
	}


	private function transformPrices() {
		$this->data['amount'] = $this->data['amount'] * 100;
		if (is_float($this->data['amount'])) {
		    $this->data['amount'] = round($this->data['amount']);
		}
		if($this->ofdEnable()) {
			foreach ($this->basket as $key => $item) {
				$this->basket[$key]['itemPrice'] = round($item['itemPrice'] * 100);
				$this->basket[$key]['itemAmount'] = round($item['itemAmount'] * 100);
				
			}
		}
	}


	private function createPaymentLink($linkPart,$method) {

		if($method == 'register.do' || $method == 'registerPreAuth.do') {
			$this->options['payment_link'] = $linkPart;
		} else if ($method == 'getOrderStatusExtended.do') {
			$this->options['payment_link'] = $linkPart;	
		}
	}


	public function getPaymentLink() {
		return $this->options['payment_link'];
	}


	public function debug($data) {
		echo "<pre>";
		print_r($data);
		echo "</pre>";
	}

	
	public function baseLogger($url, $method, $data, $response, $title)
    {
        $objDateTime = new DateTime();
        $file = self::log_file;
        $logContent = '';

        if(file_exists($file)) {
            $logSize = filesize($file) / 1000;
            if($logSize < 5000) {
                $logContent = file_get_contents($file);
            }
        }
        $logContent .= $title . "\n";
        $logContent .= '----------------------------' . "\n";
        $logContent .= "DATE: " . $objDateTime->format("Y-m-d H:i:s") . "\n";
        $logContent .= 'URL ' . $url . "\n";
        $logContent .= 'METHOD ' . $method . "\n";
        $logContent .= "DATA: \n" . print_r($data,true) . "\n";
        $logContent .= "RESPONSE: \n" . print_r($response,true) . "\n";
        $logContent .= "\n\n";
        file_put_contents($file, $logContent);

	}

}

?>