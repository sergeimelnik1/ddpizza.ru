<?php

/**
 * �������� � �������������
 */

namespace Citfact\Getfood;

class Image
{
	/**
	 * ��������� �������� �����������
	 * @param array|int $image ������ � ������� ��� ID �����������
	 * @param int $width ������
	 * @param int $height ������
	 * @param int $type ��� ���������������
	 * @return string ���� �� �����������
	 */
	public static function resize(&$image, $width, $height, $type = BX_RESIZE_IMAGE_EXACT)
	{
		if (empty($image)) return null;

		if (is_array($image))
		{
			if (isset($image['ID']) && !empty($image['ID']))
			{
				$fileId = $image['ID'];
			}
			else
			{
				return null;
			}
		}
		elseif (is_numeric($image))
		{
			$fileId = $image;
		}
		else
		{
			return null;
		}

		$rsImage = \CFile::ResizeImageGet(
			$fileId,
			array(
				'width' => $width,
				'height' => $height
			),
			$type,
			true,
                        false,
                        false,
                        95
		);

		if (is_array($image))
		{
			$image['SRC'] = $rsImage['src'];
			$image['WIDTH'] = $rsImage['width'];
			$image['HEIGHT'] = $rsImage['height'];
		}

		return $rsImage['src'];
	}


	/**
	 * ��������� ����������� ������� � �������� ��������
	 * @param $arResult
	 */
	public static function resizeCatalogItem(&$arResult, $width, $height)
	{
		$arItem = &$arResult['ITEM'];

		if (!empty($arItem['PREVIEW_PICTURE']))
		{
			self::resize($arItem['PREVIEW_PICTURE'], $width, $height);
		}

		if (!empty($arItem['PREVIEW_PICTURE_SECOND']))
		{
			self::resize($arItem['PREVIEW_PICTURE_SECOND'], $width, $height);
		}

		if (!empty($arItem['PRODUCT_PREVIEW']))
		{
			self::resize($arItem['PRODUCT_PREVIEW'], $width, $height);
		}

		if (!empty($arItem['PRODUCT_PREVIEW_SECOND']))
		{
			self::resize($arItem['PRODUCT_PREVIEW_SECOND'], $width, $height);
		}

		if (!empty($arItem['MORE_PHOTO']))
		{
			foreach ($arItem['MORE_PHOTO'] as &$morePhoto)
			{
				self::resize($morePhoto, $width, $height);
			}
			unset($morePhoto);
		}

		if (!empty($arItem['OFFERS']))
		{
			foreach ($arItem['OFFERS'] as &$arOffer)
			{
				if (!empty($arOffer['PREVIEW_PICTURE']))
				{
					self::resize($arOffer['PREVIEW_PICTURE'], $width, $height);
				}

				if (!empty($arOffer['PREVIEW_PICTURE_SECOND']))
				{
					self::resize($arOffer['PREVIEW_PICTURE_SECOND'], $width, $height);
				}

				if (is_array($arOffer['MORE_PHOTO']) && count($arOffer['MORE_PHOTO']) > 1)
				{
					foreach ($arOffer['MORE_PHOTO'] as &$morePhoto)
					{
						self::resize($morePhoto, $width, $height);
					}
				}
			}

			foreach ($arItem['JS_OFFERS'] as &$arOffer)
			{
				if (!empty($arOffer['PREVIEW_PICTURE']))
				{
					self::resize($arOffer['PREVIEW_PICTURE'], $width, $height);
				}

				if (!empty($arOffer['PREVIEW_PICTURE_SECOND']))
				{
					self::resize($arOffer['PREVIEW_PICTURE_SECOND'], $width, $height);
				}

				if (!empty($arOffer['MORE_PHOTO']))
				{
					foreach ($arOffer['MORE_PHOTO'] as &$morePhoto)
					{
						self::resize($morePhoto, $width, $height);
					}
				}
			}
		}
	}


	/**
	 * ��������� ����������� ������� � ������� ������
	 * @param $arResult
	 */
	public static function resizeCatalogElement(&$arResult, $height, $width)
	{
		if (!empty($arResult['MORE_PHOTO']))
		{
			foreach ($arResult['MORE_PHOTO'] as &$arMorePhoto)
			{
				self::resize($arMorePhoto, $height, $width);
			}
		}

		if (!empty($arResult['OFFERS']))
		{
			foreach ($arResult['OFFERS'] as &$arOffer)
			{
				if (!empty($arOffer['MORE_PHOTO']))
				{
					foreach ($arOffer['MORE_PHOTO'] as &$arMorePhoto)
					{
						self::resize($arMorePhoto, $height, $width);
					}
				}
			}

			foreach ($arResult['JS_OFFERS'] as &$arOffer)
			{
				if (!empty($arOffer['SLIDER']))
				{
					foreach ($arOffer['SLIDER'] as &$arMorePhoto)
					{
						self::resize($arMorePhoto, $height, $width);
					}
				}
			}
		}
	}


	/**
	 * ��������� ����������� �������
	 * @param $arResult
	 * @param $width
	 * @param $height
	 */
	public static function resizeBasket(&$arResult, $pictureSize, $bigPictureSize)
	{
		foreach ($arResult['GRID']['ROWS'] as &$arItem)
		{
			if ($arItem['PREVIEW_PICTURE'])
			{
				$arItem['PICTURE_SRC'] = self::resize($arItem['PREVIEW_PICTURE'], $pictureSize['width'], $pictureSize['height']);
				$arItem['BIG_PICTURE_SRC'] = self::resize($arItem['PREVIEW_PICTURE'], $bigPictureSize['width'], $bigPictureSize['height']);
			}
			elseif ($arItem['DETAIL_PICTURE'])
			{
				$arItem['PICTURE_SRC'] = self::resize($arItem['DETAIL_PICTURE'], $pictureSize['width'], $pictureSize['height']);
				$arItem['BIG_PICTURE_SRC'] = self::resize($arItem['DETAIL_PICTURE'], $bigPictureSize['width'], $bigPictureSize['height']);
			}
			else
			{
				$arProductProps = \CIBlockElement::GetList(
					array(),
					array(
						'ID' => $arItem['PRODUCT_ID']
					),
					false,
					false,
					array('PROPERTY_MORE_PHOTO', 'PROPERTY_CML2_LINK')
				)->Fetch();

				if (!empty($arProductProps['PROPERTY_MORE_PHOTO_VALUE']))
				{
					$arItem['PICTURE_SRC'] = self::resize($arProductProps['PROPERTY_MORE_PHOTO_VALUE'], $pictureSize['width'], $pictureSize['height']);
					$arItem['BIG_PICTURE_SRC'] = self::resize($arProductProps['PROPERTY_MORE_PHOTO_VALUE'], $bigPictureSize['width'], $bigPictureSize['height']);
				}
				elseif (!empty($arProductProps['PROPERTY_CML2_LINK_VALUE'])) // ��� �������� �����������
				{
					// ����� ����������� � �������� ������
					$arMorePhoto = \CIBlockElement::GetList(
						array(),
						array(
							'ID' => $arProductProps['PROPERTY_CML2_LINK_VALUE']
						),
						false,
						false,
						array('PROPERTY_MORE_PHOTO')
					)->Fetch();

					if (!empty($arMorePhoto['PROPERTY_MORE_PHOTO_VALUE']))
					{
						$arItem['PICTURE_SRC'] = self::resize($arMorePhoto['PROPERTY_MORE_PHOTO_VALUE'], $pictureSize['width'], $pictureSize['height']);
						$arItem['BIG_PICTURE_SRC'] = self::resize($arMorePhoto['PROPERTY_MORE_PHOTO_VALUE'], $bigPictureSize['width'], $bigPictureSize['height']);
					}
					else
					{
						$arItem['PICTURE_SRC'] = SITE_TEMPLATE_PATH . '/images/no-img.png';
					}
				}
				else
				{
					$arItem['PICTURE_SRC'] = SITE_TEMPLATE_PATH . '/images/no-img.png';
				}
			}
		}
	}


	/**
	 * ��������� ����������� �������� �������
	 * @param array $arResult
	 * @param int $width
	 * @param int $height
	 */
	public static function resizeBasketGifts(&$arResult, $width, $height)
	{
		foreach ($arResult['ITEMS'] as &$arItem)
		{
			if (!empty($arItem['PREVIEW_PICTURE']))
			{
				self::resize($arItem['PREVIEW_PICTURE'], $width, $height);
			}

			if (!empty($arItem['PREVIEW_PICTURE_SECOND']))
			{
				self::resize($arItem['PREVIEW_PICTURE_SECOND'], $width, $height);
			}

			if (!empty($arItem['PRODUCT_PREVIEW']))
			{
				self::resize($arItem['PRODUCT_PREVIEW'], $width, $height);
			}

			if (!empty($arItem['PRODUCT_PREVIEW_SECOND']))
			{
				self::resize($arItem['PRODUCT_PREVIEW_SECOND'], $width, $height);
			}

			if (!empty($arItem['OFFERS']))
			{
				foreach ($arItem['OFFERS'] as &$arOffer)
				{
					if (!empty($arOffer['PREVIEW_PICTURE']))
					{
						self::resize($arOffer['PREVIEW_PICTURE'], $width, $height);
					}

					if (!empty($arOffer['PREVIEW_PICTURE_SECOND']))
					{
						self::resize($arOffer['PREVIEW_PICTURE_SECOND'], $width, $height);
					}
				}

				foreach ($arItem['JS_OFFERS'] as &$arOffer)
				{
					if (!empty($arOffer['PREVIEW_PICTURE']))
					{
						self::resize($arOffer['PREVIEW_PICTURE'], $width, $height);
					}

					if (!empty($arOffer['PREVIEW_PICTURE_SECOND']))
					{
						self::resize($arOffer['PREVIEW_PICTURE_SECOND'], $width, $height);
					}
				}
			}
		}
	}
}