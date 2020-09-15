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
 * Купить в один клик
 * Class BuyOneClick
 */
class BuyOneClick
{
	/**
	 * @var array Информация о товарах
	 */
	protected $arProductInfo;


	/**
	 * @var int Id пользователя
	 */
	protected $userId;


	/**
	 * @var int Тип пользователя
	 */
	protected $personTypeId;


	/**
	 * @var int Валюта
	 */
	protected $currency;


	/**
	 * @var string Комментарий к заказу
	 */
	protected $comment;


	/**
	 * @var string Телефон
	 */
	protected $phone;


	/**
	 * @var array Товары
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

		// получение информации о товарах
		if ($this->arProductInfo)
		{
			$this->setProducts();
		}

		$this->userId = $USER->isAuthorized() ? $USER->GetID() : \CSaleUser::GetAnonymousUserID();
	}


	/**
	 * Возвращает информацию о товарах
	 * @return array
	 */
	public function getProducts()
	{
		return $this->arProducts;
	}


	/**
	 * Id типа пользователя
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
	 * Возвращает объект свойства заказа
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
	 * Оформление заказа
	 * @return bool
	 */
	public function order()
	{
		DiscountCouponsManager::init();

		// Создание объекта корзины
		if ($this->arProducts) // покупка указанных товаров
		{
			$oBasket = \Bitrix\Sale\Basket::create(SITE_ID);

			// наполенение корзины
			foreach ($this->arProducts as $product)
			{
				$item = $oBasket->createItem("catalog", $product["PRODUCT_ID"]);
				unset($product["PRODUCT_ID"]);
				$item->setFields($product);
			}
		}
		else // покупка товаров из корзины
		{
			$oBasket = Sale\Basket::loadItemsForFUser(\CSaleBasket::GetBasketUserID(), SITE_ID)->getOrderableItems();
		}

		// Создание объекта заказа
		$oOrder = Order::create(SITE_ID, $this->userId);

		// тип пользователя
		if ($this->personTypeId)
		{
			$oOrder->setPersonTypeId($this->getPersonType());
		}

		// привязка корзины к заказу
		$oOrder->setBasket($oBasket);

		/**
		 * Служба доставки (без доставки)
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
		 * Служба оплаты (первый в списке)
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
			$oOrder->setField('USER_DESCRIPTION', $this->comment); // комментарий покупателя
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
	 * Установка типа пользователя
	 * @param int $id Id типа пользователя
	 */
	public function setPersonType($id)
	{
		$this->personTypeId = $id;
	}


	/**
	 * Установка Id пользователя
	 * @param int $id Id пользователя
	 */
	public function setUserId($id)
	{
		$this->userId = $id;
	}


	/**
	 * Комментарий к заказу
	 * @param string $text Комментарий
	 */
	public function setComment($text)
	{
		$this->comment = $text;
	}


	/**
	 * Телефон
	 * @param string $text Телефон
	 */
	public function setPhone($value)
	{
		$this->phone = $value;
	}


	/**
	 * Цена товара
	 * @param $itemId
	 * @return bool
	 */
	protected function getPrice($itemId, $quantity = 1)
	{
		global $USER;

		$currencyCode = $this->currency;

		// Простой товар, без торговых предложений (для количества равному 1)
		$price = \CCatalogProduct::GetOptimalPrice($itemId, $quantity, $USER->GetUserGroupArray(), 'N');
		if(!$price || !isset($price['PRICE'])) {
			return false;
		}

		// Меняем код валюты, если нашли
		if (isset($price['CURRENCY'])) {
			$currencyCode = $price['CURRENCY'];
		}

		if (isset($price['PRICE']['CURRENCY'])) {
			$currencyCode = $price['PRICE']['CURRENCY'];
		}

		// Итоговую цена
		$finalPrice = $price['PRICE']['PRICE'];

		// Поиск скидок и пересчет цен товаров
		$arDiscounts = \CCatalogDiscount::GetDiscountByProduct($itemId, $USER->GetUserGroupArray(), "N");
		if (is_array($arDiscounts) && sizeof($arDiscounts) > 0) {
			$finalPrice = \CCatalogProduct::CountPriceWithDiscount($finalPrice, $currencyCode, $arDiscounts);
		}

		// конвертацию валюты
		if ($currencyCode != $this->currency) {
			$finalPrice = \CCurrencyRates::ConvertCurrency($finalPrice, $currencyCode, $this->currency);
		}

		return $finalPrice;
	}


	/**
	 * Информация о заказываемых товарах
	 * @return array
	 */
	protected function setProducts()
	{
		// получение информации о товаре
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