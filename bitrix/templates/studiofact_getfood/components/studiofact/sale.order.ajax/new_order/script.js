BX.saleOrderAjax = { // bad solution, actually, a singleton at the page

	BXCallAllowed: false,

	options: {},
	indexCache: {},
	controls: {},

	modes: {},
	properties: {},

	// called once, on component load
	init: function(options)
	{
		var ctx = this;
		this.options = options;

		window.submitFormProxy = BX.proxy(function(){
			ctx.submitFormProxy.apply(ctx, arguments);
		}, this);

		BX(function(){
			ctx.initDeferredControl();
		});
		BX(function(){
			ctx.BXCallAllowed = true; // unlock form refresher
		});

		this.controls.scope = BX('bx-soa-order');

		// user presses "add location" when he cannot find location in popup mode
		BX.bindDelegate(this.controls.scope, 'click', {className: '-bx-popup-set-mode-add-loc'}, function(){

			var input = BX.create('input', {
				attrs: {
					type: 'hidden',
					name: 'PERMANENT_MODE_STEPS',
					value: '1'
				}
			});

			BX.prepend(input, BX('bx-soa-order'));

			ctx.BXCallAllowed = false;
			BX.Sale.OrderAjaxComponent.sendRequest();
		});
	},

	cleanUp: function(){

		for(var k in this.properties)
		{
			if (this.properties.hasOwnProperty(k))
			{
				if(typeof this.properties[k].input != 'undefined')
				{
					BX.unbindAll(this.properties[k].input);
					this.properties[k].input = null;
				}

				if(typeof this.properties[k].control != 'undefined')
					BX.unbindAll(this.properties[k].control);
			}
		}

		this.properties = {};
	},

	addPropertyDesc: function(desc){
		this.properties[desc.id] = desc.attributes;
		this.properties[desc.id].id = desc.id;
	},

	// called each time form refreshes
	initDeferredControl: function()
	{
		var ctx = this,
			k,
			row,
			input,
			locPropId,
			m,
			control,
			code,
			townInputFlag,
			adapter;

		// first, init all controls
		if(typeof window.BX.locationsDeferred != 'undefined'){

			this.BXCallAllowed = false;

			for(k in window.BX.locationsDeferred){

				window.BX.locationsDeferred[k].call(this);
				window.BX.locationsDeferred[k] = null;
				delete(window.BX.locationsDeferred[k]);

				this.properties[k].control = window.BX.locationSelectors[k];
				delete(window.BX.locationSelectors[k]);
			}
		}

		for(k in this.properties){

			// zip input handling
			if(this.properties[k].isZip){
				row = this.controls.scope.querySelector('[data-property-id-row="'+k+'"]');
				if(BX.type.isElementNode(row)){

					input = row.querySelector('input[type="text"]');
					if(BX.type.isElementNode(input)){
						this.properties[k].input = input;

						// set value for the first "location" property met
						locPropId = false;
						for(m in this.properties){
							if(this.properties[m].type == 'LOCATION'){
								locPropId = m;
								break;
							}
						}

						if(locPropId !== false){
							BX.bindDebouncedChange(input, function(value){

								var zipChangedNode = BX('ZIP_PROPERTY_CHANGED');
								zipChangedNode && (zipChangedNode.value = 'Y');

								input = null;
								row = null;

								if(BX.type.isNotEmptyString(value) && /^\s*\d+\s*$/.test(value) && value.length > 3){

									ctx.getLocationsByZip(value, function(locationsData){
										ctx.properties[locPropId].control.setValueByLocationIds(locationsData);
									}, function(){
										try{
											// ctx.properties[locPropId].control.clearSelected();
										}catch(e){}
									});
								}
							});
						}
					}
				}
			}

			// location handling, town property, etc...
			if(this.properties[k].type == 'LOCATION')
			{

				if(typeof this.properties[k].control != 'undefined'){

					control = this.properties[k].control; // reference to sale.location.selector.*
					code = control.getSysCode();

					// we have town property (alternative location)
					if(typeof this.properties[k].altLocationPropId != 'undefined')
					{
						if(code == 'sls') // for sale.location.selector.search
						{
							// replace default boring "nothing found" label for popup with "-bx-popup-set-mode-add-loc" inside
							control.replaceTemplate('nothing-found', this.options.messages.notFoundPrompt);
						}

						if(code == 'slst')  // for sale.location.selector.steps
						{
							(function(k, control){

								// control can have "select other location" option
								control.setOption('pseudoValues', ['other']);

								// insert "other location" option to popup
								control.bindEvent('control-before-display-page', function(adapter){

									control = null;

									var parentValue = adapter.getParentValue();

									// you can choose "other" location only if parentNode is not root and is selectable
									if(parentValue == this.getOption('rootNodeValue') || !this.checkCanSelectItem(parentValue))
										return;

									var controlInApater = adapter.getControl();

									if(typeof controlInApater.vars.cache.nodes['other'] == 'undefined')
									{
										controlInApater.fillCache([{
											CODE:		'other', 
											DISPLAY:	ctx.options.messages.otherLocation, 
											IS_PARENT:	false,
											VALUE:		'other'
										}], {
											modifyOrigin:			true,
											modifyOriginPosition:	'prepend'
										});
									}
								});

								townInputFlag = BX('LOCATION_ALT_PROP_DISPLAY_MANUAL['+parseInt(k)+']');

								control.bindEvent('after-select-real-value', function(){

									// some location chosen
									if(BX.type.isDomNode(townInputFlag))
										townInputFlag.value = '0';
								});
								control.bindEvent('after-select-pseudo-value', function(){

									// option "other location" chosen
									if(BX.type.isDomNode(townInputFlag))
										townInputFlag.value = '1';
								});

								// when user click at default location or call .setValueByLocation*()
								control.bindEvent('before-set-value', function(){
									if(BX.type.isDomNode(townInputFlag))
										townInputFlag.value = '0';
								});

								// restore "other location" label on the last control
								if(BX.type.isDomNode(townInputFlag) && townInputFlag.value == '1'){

									// a little hack: set "other location" text display
									adapter = control.getAdapterAtPosition(control.getStackSize() - 1);

									if(typeof adapter != 'undefined' && adapter !== null)
										adapter.setValuePair('other', ctx.options.messages.otherLocation);
								}

							})(k, control);
						}
					}
				}
			}
		}

		this.BXCallAllowed = true;

		//set location initialized flag and refresh region & property actual content
		if (BX.Sale.OrderAjaxComponent)
			BX.Sale.OrderAjaxComponent.locationsCompletion();
	},

	checkMode: function(propId, mode){

		//if(typeof this.modes[propId] == 'undefined')
		//	this.modes[propId] = {};

		//if(typeof this.modes[propId] != 'undefined' && this.modes[propId][mode])
		//	return true;

		if(mode == 'altLocationChoosen'){

			if(this.checkAbility(propId, 'canHaveAltLocation')){

				var input = this.getInputByPropId(this.properties[propId].altLocationPropId);
				var altPropId = this.properties[propId].altLocationPropId;

				if(input !== false && input.value.length > 0 && !input.disabled && this.properties[altPropId].valueSource != 'default'){

					//this.modes[propId][mode] = true;
					return true;
				}
			}
		}

		return false;
	},

	checkAbility: function(propId, ability){

		if(typeof this.properties[propId] == 'undefined')
			this.properties[propId] = {};

		if(typeof this.properties[propId].abilities == 'undefined')
			this.properties[propId].abilities = {};

		if(typeof this.properties[propId].abilities != 'undefined' && this.properties[propId].abilities[ability])
			return true;

		if(ability == 'canHaveAltLocation'){

			if(this.properties[propId].type == 'LOCATION'){

				// try to find corresponding alternate location prop
				if(typeof this.properties[propId].altLocationPropId != 'undefined' && typeof this.properties[this.properties[propId].altLocationPropId]){

					var altLocPropId = this.properties[propId].altLocationPropId;

					if(typeof this.properties[propId].control != 'undefined' && this.properties[propId].control.getSysCode() == 'slst'){

						if(this.getInputByPropId(altLocPropId) !== false){
							this.properties[propId].abilities[ability] = true;
							return true;
						}
					}
				}
			}

		}

		return false;
	},

	getInputByPropId: function(propId){
		if(typeof this.properties[propId].input != 'undefined')
			return this.properties[propId].input;

		var row = this.getRowByPropId(propId);
		if(BX.type.isElementNode(row)){
			var input = row.querySelector('input[type="text"]');
			if(BX.type.isElementNode(input)){
				this.properties[propId].input = input;
				return input;
			}
		}

		return false;
	},

	getRowByPropId: function(propId){

		if(typeof this.properties[propId].row != 'undefined')
			return this.properties[propId].row;

		var row = this.controls.scope.querySelector('[data-property-id-row="'+propId+'"]');
		if(BX.type.isElementNode(row)){
			this.properties[propId].row = row;
			return row;
		}

		return false;
	},

	getAltLocPropByRealLocProp: function(propId){
		if(typeof this.properties[propId].altLocationPropId != 'undefined')
			return this.properties[this.properties[propId].altLocationPropId];

		return false;
	},

	toggleProperty: function(propId, way, dontModifyRow){

		var prop = this.properties[propId];

		if(typeof prop.row == 'undefined')
			prop.row = this.getRowByPropId(propId);

		if(typeof prop.input == 'undefined')
			prop.input = this.getInputByPropId(propId);

		if(!way){
			if(!dontModifyRow)
				BX.hide(prop.row);
			prop.input.disabled = true;
		}else{
			if(!dontModifyRow)
				BX.show(prop.row);
			prop.input.disabled = false;
		}
	},

	submitFormProxy: function(item, control)
	{
		var propId = false;
		for(var k in this.properties){
			if(typeof this.properties[k].control != 'undefined' && this.properties[k].control == control){
				propId = k;
				break;
			}
		}

		// turning LOCATION_ALT_PROP_DISPLAY_MANUAL on\off

		if(item != 'other'){

			if(this.BXCallAllowed){

				this.BXCallAllowed = false;
				setTimeout(function(){BX.Sale.OrderAjaxComponent.sendRequest()}, 20);
			}

		}
	},

	getPreviousAdapterSelectedNode: function(control, adapter){

		var index = adapter.getIndex();
		var prevAdapter = control.getAdapterAtPosition(index - 1);

		if(typeof prevAdapter !== 'undefined' && prevAdapter != null){
			var prevValue = prevAdapter.getControl().getValue();

			if(typeof prevValue != 'undefined'){
				var node = control.getNodeByValue(prevValue);

				if(typeof node != 'undefined')
					return node;

				return false;
			}
		}

		return false;
	},
	getLocationsByZip: function(value, successCallback, notFoundCallback)
	{
		if(typeof this.indexCache[value] != 'undefined')
		{
			successCallback.apply(this, [this.indexCache[value]]);
			return;
		}

		var ctx = this;

		BX.ajax({
			url: this.options.source,
			method: 'post',
			dataType: 'json',
			async: true,
			processData: true,
			emulateOnload: true,
			start: true,
			data: {'ACT': 'GET_LOCS_BY_ZIP', 'ZIP': value},
			//cache: true,
			onsuccess: function(result){
				if(result.result)
				{
					ctx.indexCache[value] = result.data;
					successCallback.apply(ctx, [result.data]);
				}
				else
				{
					notFoundCallback.call(ctx);
				}
			},
			onfailure: function(type, e){
				// on error do nothing
			}
		});
	}
};

$(window).load(function(){    
ymaps.ready(init);


	function init() {
		$("#soa-property-3").mask("+7(999)999-99-99","+7(___)___-__-__");
		
		$("#soa-property-7").closest(".form-group").hide();
		$("#soa-property-10").closest(".form-group").hide();
                $("#soa-property-16").closest(".form-group").hide();
		var myMap = new ymaps.Map('map', {
				center: [55.816148, 37.063843],
				zoom: 11.5,
				controls: ['geolocationControl', 'searchControl']
			}),
			deliveryPoint = new ymaps.GeoObject({
				geometry: {type: 'Point'},
				properties: {iconCaption: 'Адрес'}
			},
			
			{
				preset: 'islands#blackDotIconWithCaption',
				draggable: true,
				iconCaptionMaxWidth: '215'
			}),
			restaurant1 = new ymaps.GeoObject({
				geometry: {type: 'Point'},
				properties: {iconCaption: 'с. Павловская Слобода'}
			}),
			restaurant2 = new ymaps.GeoObject({
				geometry: {type: 'Point'},
				properties: {iconCaption: 'КП «Резиденция Бенилюкс»'}
			}),
			searchControl = myMap.controls.get('searchControl');
			
			 restaurant1.options.set('iconColor', 'orange');
			 var rest1coords = [55.81400590795189,37.08624769247683];
			restaurant1.geometry.setCoordinates(rest1coords);
			 restaurant2.options.set('iconColor', 'orange');
			 var rest2coords = [55.77575868467692,37.04068597109733];
			restaurant2.geometry.setCoordinates(rest2coords);
				myMap.geoObjects.add(restaurant1);
				myMap.geoObjects.add(restaurant2);
				
			
		searchControl.options.set({noPlacemark: true, placeholderContent: 'Введите адрес доставки'});
		myMap.geoObjects.add(deliveryPoint);
		var json = {"type": "FeatureCollection",
  "features": [{
    "type": "Feature",
    "id": 0,
    "geometry": {
      "type": "Polygon",
      "coordinates": [[
		[55.85580885732791,36.932694053688714],
[55.85262493813791,36.942310598434126],
[55.850163040268896,36.95119407469167],
[55.84635443947344,36.958513823093114],
[55.84376636911894,36.962244775832815],
[55.84205648766999,36.963014569819904],
[55.84353848926842,36.97665092045016],
[55.84221948031083,36.97877522999085],
[55.83965377259627,36.977211502135034],
[55.838772337451346,36.97946455770742],
[55.83142877937184,36.97105315023666],
[55.823096343537564,36.970189478933904],
[55.822074103951635,36.97361465984615],
[55.81885772350068,36.97315600210433],
[55.81878523868652,36.954828467905315],
[55.813203495295475,36.95767160946106],
[55.796955080708585,36.952645149766994],
[55.78407659355253,36.96187731319579],
[55.78010996347928,36.96664091640639],
[55.778660301260125,36.975009408531385],
[55.77613573686546,36.95897248083274],
[55.77105587393708,36.942391064702385],
[55.78124516595486,36.92577477985514],
[55.791806550822294,36.92235228115206],
[55.81989478059305,36.9172936349496],
[55.84804565510636,36.92536976629341],
[55.85192651217424,36.928676930008336]
	]]
    },
    "options": {"strokeColor": "#FFFFFF", "fillColor": "#FF000040"},
    "properties": {"name": "Зона 1", "price": zone1price}
  }, {
    "type": "Feature",
    "id": 1,
    "geometry": {
      "type": "Polygon",
      "coordinates": [[
		[55.85439840276594,36.95651941081107],
[55.85392768000503,36.96361653586358],
[55.8539895383261,36.965072975358204],
[55.85414795511056,36.96579180737456],
[55.85635515589964,36.96916066189654],
[55.85713813170984,36.970686838826495],
[55.85677908142009,36.971555874547356],
[55.856566365008604,36.972529516419605],
[55.855501257339704,36.97243027468596],
[55.852062841331296,36.969638095101416],
[55.85102175123226,36.96831844826601],
[55.850249214039344,36.96845792313487],
[55.84925334226946,36.96837209244556],
[55.84760198224723,36.9653465606776],
[55.85258582179305,36.956524775227265]
	  ]]
    },
    "options": {"strokeColor": "#FFFFFF", "fillColor": "#ffd21e40"},
    "properties": {"name": "Зона 2", "price": "700"}
  },
{
    "type": "Feature",
    "id": 2,
    "geometry": {
      "type": "Polygon",
      "coordinates": [[
		[55.84903566193218,36.98304263785885],
[55.84904018861422,36.99340401128312],
[55.84829477310325,36.99904737905045],
[55.84438186044315,37.02318457797567],
[55.84535673020797,37.03425673678864],
[55.84235055119474,37.04551128581545],
[55.839098121736626,37.050738911185206],
[55.83774273621025,37.04634008840094],
[55.823612509258936,37.03473416999284],
[55.8200746167505,37.037440518888964],
[55.81841352296611,37.03963456586318],
[55.81511528556998,37.0360377235741],
[55.81072173036727,37.03809497788846],
[55.809827552937335,37.03113196328598],
[55.80865979940823,37.03227155990885],
[55.80299955196458,37.0254962999398],
[55.796978872188284,37.0120047885952],
[55.795807865883354,37.00710707493379],
[55.794390523172524,37.00438463278341],
[55.79307588377364,37.00064295120773],
[55.789393146254255,36.99873858280742],
[55.78568889915128,36.994339760022875],
[55.78163815493381,36.99567013569434],
[55.77844260516865,36.990168925004475],
[55.778660301260125,36.975009408531385],
[55.78010996347928,36.96664091640639],
[55.78407659355253,36.96187731319579],
[55.796955080708585,36.952645149766994],
[55.813203495295475,36.95767160946106],
[55.81878523868652,36.954828467905315],
[55.81885772350068,36.97315600210433],
[55.822074103951635,36.97361465984615],
[55.823096343537564,36.970189478933904],
[55.83142877937184,36.97105315023666],
[55.838772337451346,36.97946455770742],
[55.83965377259627,36.977211502135034],
[55.84221948031083,36.97877522999085],
[55.84353848926842,36.97665092045016]
	  ]]
    },
    "options": {"strokeColor": "#FFFFFF", "fillColor": "#ffd21e40"},
    "properties": {"name": "Зона 3", "price": "700"}
  },
  {
    "type": "Feature",
    "id": 3,
    "geometry": {
      "type": "Polygon",
      "coordinates": [[
	 [55.82753475849143,37.10449215631041],
[55.829207538962585,37.111779718204],
[55.840298021381415,37.12291028035257],
[55.838815895203844,37.13735665810654],
[55.83108135459536,37.13845636380259],
[55.82986004974626,37.13955606949851],
[55.829290899494005,37.14303489459102],
[55.82750791006658,37.142823000078494],
[55.82526433712582,37.144697864180145],
[55.821530296400134,37.14482392800359],
[55.80772949393832,37.15754832757016],
[55.80449530497526,37.143759091023135],
[55.8031054729947,37.12707575095129],
[55.798826893543016,37.12827201617131],
[55.79305592885957,37.10097624761895],
[55.79049500099976,37.093879122564864],
[55.78869511402718,37.080779213737536],
[55.79890697078773,37.070887226890676],
[55.79944635045645,37.08203448755658],
[55.80110372496684,37.08575739366923],
[55.805720430817836,37.08525582058283],
[55.809490736171924,37.088206250499994],
[55.81115674373018,37.096145589184125],
[55.81062658949416,37.10820480091507],
[55.81549739157182,37.11303009493279],
[55.81711934599549,37.09518267614775],
[55.81864156563158,37.09711118442954],
[55.82028301925322,37.10144563419764],
[55.823013084076834,37.103722829651446],
[55.824895931529944,37.101657528710064],
[55.82501823051033,37.097838063073006]
	  ]]
    },
    "options": {"strokeColor": "#FFFFFF", "fillColor": "#ffd21e40"},
    "properties": {"name": "Зона 3", "price": "700"}
  }, {
    "type": "Feature",
    "id": 4,
    "geometry": {
      "type": "Polygon",
      "coordinates": [[
	[55.838025002257474,37.06601365311107],
[55.83186484143818,37.06041051847932],
[55.82447316718779,37.07613362772454],
[55.82550591224574,37.08013280136551],
[55.82210107063739,37.0909045527693],
[55.82501823051033,37.097838063073006],
[55.824895931529944,37.101657528710064],
[55.823013084076834,37.103722829651446],
[55.82028301925322,37.10144563419764],
[55.81864156563158,37.09711118442954],
[55.81711934599549,37.09518267614775],
[55.81549739157182,37.11303009493279],
[55.81062658949416,37.10820480091507],
[55.81115674373018,37.096145589184125],
[55.809490736171924,37.088206250499994],
[55.805720430817836,37.08525582058283],
[55.80110372496684,37.08575739366923],
[55.79944635045645,37.08203448755658],
[55.79890697078773,37.070887226890676],
[55.78869511402718,37.080779213737536],
[55.79049500099976,37.093879122564864],
[55.79305592885957,37.10097624761895],
[55.7904340717218,37.1233351419671],
[55.78936714422618,37.12527974350284],
[55.78771531331451,37.122291762660254],
[55.78483464204967,37.102293212245094],
[55.784464340854136,37.09215714437778],
[55.77669173510458,37.09073289139071],
[55.77409447311122,37.084703285525165],
[55.774236586178056,37.06121518118155],
[55.763612951816185,37.03333630068058],
[55.77844260516865,36.990168925004475],
[55.78163815493381,36.99567013569434],
[55.78568889915128,36.994339760022875],
[55.789393146254255,36.99873858280742],
[55.79307588377364,37.00064295120773],
[55.794390523172524,37.00438463278341],
[55.795807865883354,37.00710707493379],
[55.796978872188284,37.0120047885952],
[55.80299955196458,37.0254962999398],
[55.80865979940823,37.03227155990885],
[55.809827552937335,37.03113196328598],
[55.81072173036727,37.03809497788846],
[55.81511528556998,37.0360377235741],
[55.81841352296611,37.03963456586318],
[55.8200746167505,37.037440518888964],
[55.823612509258936,37.03473416999284],
[55.83774273621025,37.04634008840094],
[55.839098121736626,37.050738911185206]
	  ]]
    },
    "options": {"strokeColor": "#FFFFFF", "fillColor": "#00FF0040"},
    "properties": {"name": "Зона 4", "price": "500"}
  }, {
    "type": "Feature",
    "id": 5,
    "geometry": {
      "type": "Polygon",
      "coordinates": [[
[55.79305592885957,37.10097624761895],
[55.7904340717218,37.1233351419671],
[55.78936714422618,37.12527974350284],
[55.78771531331451,37.122291762660254],
[55.77124653573829,37.14028026593134],
[55.768989120655135,37.160445113305414],
[55.791499940545506,37.175427932862625],
[55.79815303565249,37.171412665967374],
[55.82726936640207,37.17989649308154],
[55.83738201193054,37.17584099305086],
[55.84115678324845,37.163725454931],
[55.844309438765876,37.146221358899844],
[55.845041349367705,37.13801648152333],
[55.84845624611433,37.134239931230354],
[55.848432102987246,37.12313558590877],
[55.84213928040347,37.11995716822624],
[55.840298021381415,37.12291028035257],
[55.838815895203844,37.13735665810654],
[55.83108135459536,37.13845636380259],
[55.82986004974626,37.13955606949851],
[55.829290899494005,37.14303489459102],
[55.82750791006658,37.142823000078494],
[55.82526433712582,37.144697864180145],
[55.821530296400134,37.14482392800359],
[55.80772949393832,37.15754832757016],
[55.80449530497526,37.143759091023135],
[55.8031054729947,37.12707575095129],
[55.798826893543016,37.12827201617131]
	  ]]
    },
    "options": {"strokeColor": "#FFFFFF", "fillColor": "#f371d040"},
    "properties": {"name": "Зона 5", "price": "1000"}
  },
  {
    "type": "Feature",
    "id": 6,
    "geometry": {
      "type": "Polygon",
      "coordinates": [[
[55.85229901569957,37.15827849368734],
[55.85124586141367,37.161711721226474],
[55.85268677464859,37.17396941642445],
[55.851096486099365,37.182123331829665],
[55.84706917287397,37.191170422836755],
[55.845893643493625,37.19598230580941],
[55.833819388885765,37.19279047708159],
[55.82105280774281,37.19908562163946],
[55.81374515703584,37.19026115398039],
[55.791499940545506,37.175427932862625],
[55.79815303565249,37.171412665967374],
[55.82726936640207,37.17989649308154],
[55.83738201193054,37.17584099305086],
[55.84115678324845,37.163725454931],
[55.844309438765876,37.146221358899844]
	  ]]
    },
    "options": {"strokeColor": "#FFFFFF", "fillColor": "#b51eff40"},
    "properties": {"name": "Зона 6", "price": "2000"}
  }
  
  ]};

        // Добавляем зоны на карту.
        var deliveryZones = ymaps.geoQuery(json).addToMap(myMap);
        // Задаём цвет и контент балунов полигонов.
        deliveryZones.each(function (obj) {
            var color = obj.options.get('fillColor');
                color = color.substring(0, color.length - 2);
            obj.options.set({fillColor: color, fillOpacity: 0.2});
            //obj.properties.set('balloonContent', obj.properties.get('name'));
			
            obj.properties.set('balloonContentHeader', 'Минимальная сумма заказа: ' + obj.properties.get('price') + ' р.')
        });

        // Проверим попадание результата поиска в одну из зон доставки.
        searchControl.events.add('resultshow', function (e) {
			var obj = searchControl.getResultsArray()[e.get('index')];
            highlightResult(obj);
			
        });

        // Проверим попадание метки геолокации в одну из зон доставки.
        myMap.controls.get('geolocationControl').events.add('locationchange', function (e) {
            highlightResult(e.get('geoObjects').get(0));
        });

        // При перемещении метки сбрасываем подпись, содержимое балуна и перекрашиваем метку.
        deliveryPoint.events.add('dragstart', function () {
            deliveryPoint.properties.set({iconCaption: '', balloonContent: ''});
            deliveryPoint.options.set('iconColor', 'black');
        });

        // По окончании перемещения метки вызываем функцию выделения зоны доставки.
        deliveryPoint.events.add('dragend', function () {
            highlightResult(deliveryPoint);
        });

        function highlightResult(obj) {
            // Сохраняем координаты переданного объекта.
            var coords = obj.geometry.getCoordinates(),
            // Находим полигон, в который входят переданные координаты.
                polygon = deliveryZones.searchContaining(coords).get(0);

            if (polygon) {
                // Уменьшаем прозрачность всех полигонов, кроме того, в который входят переданные координаты.
                deliveryZones.setOptions('fillOpacity', 0.2);
                polygon.options.set('fillOpacity', 0.5);
                // Перемещаем метку с подписью в переданные координаты и перекрашиваем её в цвет полигона.
                deliveryPoint.geometry.setCoordinates(coords);
				
                deliveryPoint.options.set('iconColor', polygon.options.get('fillColor'));
                // Задаем подпись для метки.
                if (typeof(obj.getThoroughfare) === 'function') {
                    setData(obj);
                } else {
                    // Если вы не хотите, чтобы при каждом перемещении метки отправлялся запрос к геокодеру,
                    // закомментируйте код ниже.
                    ymaps.geocode(coords, {results: 1}).then(function (res) {
                        var obj = res.geoObjects.get(0);
                        setData(obj);
                    });
                }
            } else {
                // Если переданные координаты не попадают в полигон, то задаём стандартную прозрачность полигонов.
                deliveryZones.setOptions('fillOpacity', 0.2);
                // Перемещаем метку по переданным координатам.
                deliveryPoint.geometry.setCoordinates(coords);
                // Задаём контент балуна и метки.
                deliveryPoint.properties.set({
                    iconCaption: 'Доставка не осуществляется',
                    balloonContent: 'Пожалуйста, выберите другое место',
                    balloonContentHeader: ''
                });
                // Перекрашиваем метку в чёрный цвет.
                deliveryPoint.options.set('iconColor', 'black');
            }

            function setData(obj){
                var address = [obj.getThoroughfare(), obj.getPremiseNumber(), obj.getPremise()].join(' ');
                if (address.trim() === '') {
                    address = obj.getAddressLine();
                }
                deliveryPoint.properties.set({
                    iconCaption: address,
                    balloonContent: address,
                    balloonContentHeader: '<b>Минимальная сумма заказа: ' + polygon.properties.get('price') + ' р.</b>'
                });
				$(".bx-soa-price-free").text(polygon.properties.get('price') + ' руб');
				$("#soa-property-7").val(obj.getAddressLine());
				$("#soa-property-10").val(polygon.properties.get('name'));
            }
        }

	}

 
         
});