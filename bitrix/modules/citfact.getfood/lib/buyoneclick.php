<?

namespace Citfact\Getfood;

use	Bitrix\Main\Loader,
	Bitrix\Main\Config\Option,
	Bitrix\Sale\Delivery,
	Bitrix\Sale\PaySystem,
	Bitrix\Sale,
	Bitrix\Sale\Order,
	Bitrix\Sale\DiscountCouponsManager;

/**
 * ������ � ���� ����
 * Class BuyOneClick
 */
class BuyOneClick
{
	/**
	 * @var array ���������� � �������
	 */
	protected $arProductInfo;


	/**
	 * @var int Id ������������
	 */
	protected $userId;


	/**
	 * @var int ��� ������������
	 */
	protected $personTypeId;


	/**
	 * @var int ������
	 */
	protected $currency;


	/**
	 * @var string ����������� � ������
	 */
	protected $comment;


	/**
	 * @var string �������
	 */
	protected $phone;


	/**
	 * @var array ������
	 */
	protected $arProducts;


	/**
	 * BuyOneClick constructor.
	 * @param array $params
	 */
	public function __construct(array $options = [])
	{
		global $USER;

		if (isset($options['arProductInfo']) && is_array($options['arProductInfo']))
		{
			$this->arProductInfo = $options['arProductInfo'];
		}

		if (isset($options['personTypeId']) && $options['personTypeId'] > 0)
		{
			$this->personTypeId = $options['personTypeId'];
		}

		$this->currency = (isset($options['currency']) && !empty($options['currency'])) ? $options['currency'] : Option::get('sale', 'default_currency', 'RUB');

		if (isset($options['comment']) && !empty($options['comment']))
		{
			$this->comment = $options['comment'];
		}

		// ��������� ���������� � �������
		if ($this->arProductInfo)
		{
			$this->setProducts();
		}

		$this->userId = $USER->isAuthorized() ? $USER->GetID() : \CSaleUser::GetAnonymousUserID();
	}


	/**
	 * ���������� ���������� � �������
	 * @return array
	 */
	public function getProducts()
	{
		return $this->arProducts;
	}


	/**
	 * Id ���� ������������
	 * @return int|null
	 */
	public function getPersonType()
	{
		$arPersonType = \CSalePersonType::GetList(
			['SORT' => 'ASC'],
			[
				'LID' => SITE_ID,
				'ACTIVE' => 'Y'
			],
			false,
			false,
			['ID']
		)->Fetch();

		if (isset($arPersonType['ID']) && !empty($arPersonType['ID']))
		{
			return $arPersonType['ID'];
		}

		return null;
	}


	/**
	 * ���������� ������ �������� ������
	 */
	public function getPropertyByCode($propertyCollection, $code)
	{
		foreach ($propertyCollection as $property)
		{
			if ($property->getField('CODE') == $code)
			{
				return $property;
			}
		}
	}


	/**
	 * ���������� ������
	 * @return bool
	 */
	public function order()
	{
		DiscountCouponsManager::init();

		// �������� ������� �������
		if ($this->arProducts) // ������� ��������� �������
		{
			$oBasket = \Bitrix\Sale\Basket::create(SITE_ID);

			// ����������� �������
			foreach ($this->arProducts as $product)
			{
				$item = $oBasket->createItem("catalog", $product["PRODUCT_ID"]);
				unset($product["PRODUCT_ID"]);
				$item->setFields($product);
			}
		}
		else // ������� ������� �� �������
		{
			$oBasket = Sale\Basket::loadItemsForFUser(\CSaleBasket::GetBasketUserID(), SITE_ID)->getOrderableItems();
		}

		// �������� ������� ������
		$oOrder = Order::create(SITE_ID, $this->userId);

		// ��� ������������
		if ($this->personTypeId)
		{
			$oOrder->setPersonTypeId($this->getPersonType());
		}

		// �������� ������� � ������
		$oOrder->setBasket($oBasket);

		/**
		 * ������ �������� (��� ��������)
		 */
		$shipmentCollection = $oOrder->getShipmentCollection();
		$shipment = $shipmentCollection->createItem();
		$service = Delivery\Services\Manager::getById(Delivery\Services\EmptyDeliveryService::getEmptyDeliveryServiceId());
		$shipment->setFields(array(
			'DELIVERY_ID' => $service['ID'],
			'DELIVERY_NAME' => $service['NAME'],
		));
		$shipmentItemCollection = $shipment->getShipmentItemCollection();

		foreach ($oOrder->getBasket() as $item)
		{
			$shipmentItem = $shipmentItemCollection->createItem($item);
			$shipmentItem->setQuantity($item->getQuantity());
		}


		/**
		 * ������ ������ (������ � ������)
		 */
		$arPaySystemServiceAll = [];
		$paySystemId = 1;
		$paymentCollection = $oOrder->getPaymentCollection();
		$remainingSum = $oOrder->getPrice() - $paymentCollection->getSum();

		if ($remainingSum > 0 || $oOrder->getPrice() == 0)
		{
			$extPayment = $paymentCollection->createItem();
			$extPayment->setField('SUM', $remainingSum);
			$arPaySystemServices = PaySystem\Manager::getListWithRestrictions($extPayment);

			$arPaySystemServiceAll += $arPaySystemServices;

			if (array_key_exists($paySystemId, $arPaySystemServiceAll))
			{
				$arPaySystem = $arPaySystemServiceAll[$paySystemId];
			}
			else
			{
				reset($arPaySystemServiceAll);

				$arPaySystem = current($arPaySystemServiceAll);
			}

			if (!empty($arPaySystem))
			{
				$extPayment->setFields(array(
					'PAY_SYSTEM_ID' => $arPaySystem["ID"],
					'PAY_SYSTEM_NAME' => $arPaySystem["NAME"]
				));
			}
			else
			{
				$extPayment->delete();
			}
		}


		$oOrder->doFinalAction(true);
		$propertyCollection = $oOrder->getPropertyCollection();

		$phoneProperty = $this->getPropertyByCode($propertyCollection, 'PHONE');
		$phoneProperty->setValue($this->phone);

		if ($this->comment)
		{
			$oOrder->setField('USER_DESCRIPTION', $this->comment); // ����������� ����������
		}

		$oOrder->setField('CURRENCY', $this->currency);

		$result = $oOrder->save();

		if ($result->isSuccess())
		{
			return $oOrder->getId();
		}

		return null;
	}


	/**
	 * ��������� ���� ������������
	 * @param int $id Id ���� ������������
	 */
	public function setPersonType($id)
	{
		$this->personTypeId = $id;
	}


	/**
	 * ��������� Id ������������
	 * @param int $id Id ������������
	 */
	public function setUserId($id)
	{
		$this->userId = $id;
	}


	/**
	 * ����������� � ������
	 * @param string $text �����������
	 */
	public function setComment($text)
	{
		$this->comment = $text;
	}


	/**
	 * �������
	 * @param string $text �������
	 */
	public function setPhone($value)
	{
		$this->phone = $value;
	}


	/**
	 * ���� ������
	 * @param $itemId
	 * @return bool
	 */
	protected function getPrice($itemId, $quantity = 1)
	{
		global $USER;

		$currencyCode = $this->currency;

		// ������� �����, ��� �������� ����������� (��� ���������� ������� 1)
		$price = \CCatalogProduct::GetOptimalPrice($itemId, $quantity, $USER->GetUserGroupArray(), 'N');
		if(!$price || !isset($price['PRICE'])) {
			return false;
		}

		// ������ ��� ������, ���� �����
		if (isset($price['CURRENCY'])) {
			$currencyCode = $price['CURRENCY'];
		}

		if (isset($price['PRICE']['CURRENCY'])) {
			$currencyCode = $price['PRICE']['CURRENCY'];
		}

		// �������� ����
		$finalPrice = $price['PRICE']['PRICE'];

		// ����� ������ � �������� ��� �������
		$arDiscounts = \CCatalogDiscount::GetDiscountByProduct($itemId, $USER->GetUserGroupArray(), "N");
		if (is_array($arDiscounts) && sizeof($arDiscounts) > 0) {
			$finalPrice = \CCatalogProduct::CountPriceWithDiscount($finalPrice, $currencyCode, $arDiscounts);
		}

		// ����������� ������
		if ($currencyCode != $this->currency) {
			$finalPrice = \CCurrencyRates::ConvertCurrency($finalPrice, $currencyCode, $this->currency);
		}

		return $finalPrice;
	}


	/**
	 * ���������� � ������������ �������
	 * @return array
	 */
	protected function setProducts()
	{
		// ��������� ���������� � ������
		$dbElements = \CIBlockElement::GetList(
			array(),
			array(
				'ACTIVE' => 'Y',
				'ID' => array_keys($this->arProductInfo)
			),
			false,
			false,
			array('ID', 'NAME')
		);

		$this->arProducts = array();
		while ($rsElement = $dbElements->GetNext())
		{
			$quantity = $this->arProductInfo[$rsElement['ID']];
			$this->arProducts[] = array(
				'PRODUCT_ID' => $rsElement['ID'],
				'NAME' => $rsElement['NAME'],
				'PRICE' => $this->getPrice($rsElement['ID'], $quantity),
				'CURRENCY' => $this->currency,
				'QUANTITY' => $quantity
			);
		}
	}
}