
; /* Start:"a:4:{s:4:"full";s:100:"/bitrix/templates/redesign/components/studiofact/sale.order.ajax/new_order/script.js?159717579158008";s:6:"source";s:84:"/bitrix/templates/redesign/components/studiofact/sale.order.ajax/new_order/script.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/
BX.saleOrderAjax = {// bad solution, actually, a singleton at the page

    BXCallAllowed: false,

    options: {},
    indexCache: {},
    controls: {},

    modes: {},
    properties: {},

    // called once, on component load
    init: function (options)
    {
        var ctx = this;
        this.options = options;

        window.submitFormProxy = BX.proxy(function () {
            ctx.submitFormProxy.apply(ctx, arguments);
        }, this);

        BX(function () {
            ctx.initDeferredControl();
        });
        BX(function () {
            ctx.BXCallAllowed = true; // unlock form refresher
        });

        this.controls.scope = BX('bx-soa-order');

        // user presses "add location" when he cannot find location in popup mode
        BX.bindDelegate(this.controls.scope, 'click', {className: '-bx-popup-set-mode-add-loc'}, function () {

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

    cleanUp: function () {

        for (var k in this.properties)
        {
            if (this.properties.hasOwnProperty(k))
            {
                if (typeof this.properties[k].input != 'undefined')
                {
                    BX.unbindAll(this.properties[k].input);
                    this.properties[k].input = null;
                }

                if (typeof this.properties[k].control != 'undefined')
                    BX.unbindAll(this.properties[k].control);
            }
        }

        this.properties = {};
    },

    addPropertyDesc: function (desc) {
        this.properties[desc.id] = desc.attributes;
        this.properties[desc.id].id = desc.id;
    },

    // called each time form refreshes
    initDeferredControl: function ()
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
        if (typeof window.BX.locationsDeferred != 'undefined') {

            this.BXCallAllowed = false;

            for (k in window.BX.locationsDeferred) {

                window.BX.locationsDeferred[k].call(this);
                window.BX.locationsDeferred[k] = null;
                delete(window.BX.locationsDeferred[k]);

                this.properties[k].control = window.BX.locationSelectors[k];
                delete(window.BX.locationSelectors[k]);
            }
        }

        for (k in this.properties) {

            // zip input handling
            if (this.properties[k].isZip) {
                row = this.controls.scope.querySelector('[data-property-id-row="' + k + '"]');
                if (BX.type.isElementNode(row)) {

                    input = row.querySelector('input[type="text"]');
                    if (BX.type.isElementNode(input)) {
                        this.properties[k].input = input;

                        // set value for the first "location" property met
                        locPropId = false;
                        for (m in this.properties) {
                            if (this.properties[m].type == 'LOCATION') {
                                locPropId = m;
                                break;
                            }
                        }

                        if (locPropId !== false) {
                            BX.bindDebouncedChange(input, function (value) {

                                var zipChangedNode = BX('ZIP_PROPERTY_CHANGED');
                                zipChangedNode && (zipChangedNode.value = 'Y');

                                input = null;
                                row = null;

                                if (BX.type.isNotEmptyString(value) && /^\s*\d+\s*$/.test(value) && value.length > 3) {

                                    ctx.getLocationsByZip(value, function (locationsData) {
                                        ctx.properties[locPropId].control.setValueByLocationIds(locationsData);
                                    }, function () {
                                        try {
                                            // ctx.properties[locPropId].control.clearSelected();
                                        } catch (e) {
                                        }
                                    });
                                }
                            });
                        }
                    }
                }
            }

            // location handling, town property, etc...
            if (this.properties[k].type == 'LOCATION')
            {

                if (typeof this.properties[k].control != 'undefined') {

                    control = this.properties[k].control; // reference to sale.location.selector.*
                    code = control.getSysCode();

                    // we have town property (alternative location)
                    if (typeof this.properties[k].altLocationPropId != 'undefined')
                    {
                        if (code == 'sls') // for sale.location.selector.search
                        {
                            // replace default boring "nothing found" label for popup with "-bx-popup-set-mode-add-loc" inside
                            control.replaceTemplate('nothing-found', this.options.messages.notFoundPrompt);
                        }

                        if (code == 'slst')  // for sale.location.selector.steps
                        {
                            (function (k, control) {

                                // control can have "select other location" option
                                control.setOption('pseudoValues', ['other']);

                                // insert "other location" option to popup
                                control.bindEvent('control-before-display-page', function (adapter) {

                                    control = null;

                                    var parentValue = adapter.getParentValue();

                                    // you can choose "other" location only if parentNode is not root and is selectable
                                    if (parentValue == this.getOption('rootNodeValue') || !this.checkCanSelectItem(parentValue))
                                        return;

                                    var controlInApater = adapter.getControl();

                                    if (typeof controlInApater.vars.cache.nodes['other'] == 'undefined')
                                    {
                                        controlInApater.fillCache([{
                                                CODE: 'other',
                                                DISPLAY: ctx.options.messages.otherLocation,
                                                IS_PARENT: false,
                                                VALUE: 'other'
                                            }], {
                                            modifyOrigin: true,
                                            modifyOriginPosition: 'prepend'
                                        });
                                    }
                                });

                                townInputFlag = BX('LOCATION_ALT_PROP_DISPLAY_MANUAL[' + parseInt(k) + ']');

                                control.bindEvent('after-select-real-value', function () {

                                    // some location chosen
                                    if (BX.type.isDomNode(townInputFlag))
                                        townInputFlag.value = '0';
                                });
                                control.bindEvent('after-select-pseudo-value', function () {

                                    // option "other location" chosen
                                    if (BX.type.isDomNode(townInputFlag))
                                        townInputFlag.value = '1';
                                });

                                // when user click at default location or call .setValueByLocation*()
                                control.bindEvent('before-set-value', function () {
                                    if (BX.type.isDomNode(townInputFlag))
                                        townInputFlag.value = '0';
                                });

                                // restore "other location" label on the last control
                                if (BX.type.isDomNode(townInputFlag) && townInputFlag.value == '1') {

                                    // a little hack: set "other location" text display
                                    adapter = control.getAdapterAtPosition(control.getStackSize() - 1);

                                    if (typeof adapter != 'undefined' && adapter !== null)
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

    checkMode: function (propId, mode) {

        //if(typeof this.modes[propId] == 'undefined')
        //	this.modes[propId] = {};

        //if(typeof this.modes[propId] != 'undefined' && this.modes[propId][mode])
        //	return true;

        if (mode == 'altLocationChoosen') {

            if (this.checkAbility(propId, 'canHaveAltLocation')) {

                var input = this.getInputByPropId(this.properties[propId].altLocationPropId);
                var altPropId = this.properties[propId].altLocationPropId;

                if (input !== false && input.value.length > 0 && !input.disabled && this.properties[altPropId].valueSource != 'default') {

                    //this.modes[propId][mode] = true;
                    return true;
                }
            }
        }

        return false;
    },

    checkAbility: function (propId, ability) {

        if (typeof this.properties[propId] == 'undefined')
            this.properties[propId] = {};

        if (typeof this.properties[propId].abilities == 'undefined')
            this.properties[propId].abilities = {};

        if (typeof this.properties[propId].abilities != 'undefined' && this.properties[propId].abilities[ability])
            return true;

        if (ability == 'canHaveAltLocation') {

            if (this.properties[propId].type == 'LOCATION') {

                // try to find corresponding alternate location prop
                if (typeof this.properties[propId].altLocationPropId != 'undefined' && typeof this.properties[this.properties[propId].altLocationPropId]) {

                    var altLocPropId = this.properties[propId].altLocationPropId;

                    if (typeof this.properties[propId].control != 'undefined' && this.properties[propId].control.getSysCode() == 'slst') {

                        if (this.getInputByPropId(altLocPropId) !== false) {
                            this.properties[propId].abilities[ability] = true;
                            return true;
                        }
                    }
                }
            }

        }

        return false;
    },

    getInputByPropId: function (propId) {
        if (typeof this.properties[propId].input != 'undefined')
            return this.properties[propId].input;

        var row = this.getRowByPropId(propId);
        if (BX.type.isElementNode(row)) {
            var input = row.querySelector('input[type="text"]');
            if (BX.type.isElementNode(input)) {
                this.properties[propId].input = input;
                return input;
            }
        }

        return false;
    },

    getRowByPropId: function (propId) {

        if (typeof this.properties[propId].row != 'undefined')
            return this.properties[propId].row;

        var row = this.controls.scope.querySelector('[data-property-id-row="' + propId + '"]');
        if (BX.type.isElementNode(row)) {
            this.properties[propId].row = row;
            return row;
        }

        return false;
    },

    getAltLocPropByRealLocProp: function (propId) {
        if (typeof this.properties[propId].altLocationPropId != 'undefined')
            return this.properties[this.properties[propId].altLocationPropId];

        return false;
    },

    toggleProperty: function (propId, way, dontModifyRow) {

        var prop = this.properties[propId];

        if (typeof prop.row == 'undefined')
            prop.row = this.getRowByPropId(propId);

        if (typeof prop.input == 'undefined')
            prop.input = this.getInputByPropId(propId);

        if (!way) {
            if (!dontModifyRow)
                BX.hide(prop.row);
            prop.input.disabled = true;
        } else {
            if (!dontModifyRow)
                BX.show(prop.row);
            prop.input.disabled = false;
        }
    },

    submitFormProxy: function (item, control)
    {
        var propId = false;
        for (var k in this.properties) {
            if (typeof this.properties[k].control != 'undefined' && this.properties[k].control == control) {
                propId = k;
                break;
            }
        }

        // turning LOCATION_ALT_PROP_DISPLAY_MANUAL on\off

        if (item != 'other') {

            if (this.BXCallAllowed) {

                this.BXCallAllowed = false;
                setTimeout(function () {
                    BX.Sale.OrderAjaxComponent.sendRequest()
                }, 20);
            }

        }
    },

    getPreviousAdapterSelectedNode: function (control, adapter) {

        var index = adapter.getIndex();
        var prevAdapter = control.getAdapterAtPosition(index - 1);

        if (typeof prevAdapter !== 'undefined' && prevAdapter != null) {
            var prevValue = prevAdapter.getControl().getValue();

            if (typeof prevValue != 'undefined') {
                var node = control.getNodeByValue(prevValue);

                if (typeof node != 'undefined')
                    return node;

                return false;
            }
        }

        return false;
    },
    getLocationsByZip: function (value, successCallback, notFoundCallback)
    {
        if (typeof this.indexCache[value] != 'undefined')
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
            onsuccess: function (result) {
                if (result.result)
                {
                    ctx.indexCache[value] = result.data;
                    successCallback.apply(ctx, [result.data]);
                } else
                {
                    notFoundCallback.call(ctx);
                }
            },
            onfailure: function (type, e) {
                // on error do nothing
            }
        });
    }
};

$(window).load(function () {
    ymaps.ready(init);

if($.cookie("deliveryOption")=="0"){
    $("#ID_DELIVERY_ID_3").closest(".bx-soa-pp-company").click();
}
if($.cookie("deliveryOption")=="1"){
    $("#ID_DELIVERY_ID_16").closest(".bx-soa-pp-company").click();
}
    function init() {
        //$("#soa-property-3").mask("+7(999)999-99-99","+7(___)___-__-__");

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
        var rest1coords = [55.81400590795189, 37.08624769247683];
        restaurant1.geometry.setCoordinates(rest1coords);
        restaurant2.options.set('iconColor', 'orange');
        var rest2coords = [55.77575868467692, 37.04068597109733];
        restaurant2.geometry.setCoordinates(rest2coords);
        myMap.geoObjects.add(restaurant1);
        myMap.geoObjects.add(restaurant2);


        searchControl.options.set({noPlacemark: true, placeholderContent: 'Введите адрес доставки'});
        myMap.geoObjects.add(deliveryPoint);

        /*var json = {"type": "FeatureCollection",
            "features": [{
                    "type": "Feature",
                    "id": 0,
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                                [55.85580885732791, 36.932694053688714],
                                [55.85262493813791, 36.942310598434126],
                                [55.850163040268896, 36.95119407469167],
                                [55.84635443947344, 36.958513823093114],
                                [55.84376636911894, 36.962244775832815],
                                [55.84205648766999, 36.963014569819904],
                                [55.84353848926842, 36.97665092045016],
                                [55.84221948031083, 36.97877522999085],
                                [55.83965377259627, 36.977211502135034],
                                [55.838772337451346, 36.97946455770742],
                                [55.83142877937184, 36.97105315023666],
                                [55.823096343537564, 36.970189478933904],
                                [55.822074103951635, 36.97361465984615],
                                [55.81885772350068, 36.97315600210433],
                                [55.81878523868652, 36.954828467905315],
                                [55.813203495295475, 36.95767160946106],
                                [55.796955080708585, 36.952645149766994],
                                [55.78407659355253, 36.96187731319579],
                                [55.78010996347928, 36.96664091640639],
                                [55.778660301260125, 36.975009408531385],
                                [55.77613573686546, 36.95897248083274],
                                [55.77105587393708, 36.942391064702385],
                                [55.78124516595486, 36.92577477985514],
                                [55.791806550822294, 36.92235228115206],
                                [55.81989478059305, 36.9172936349496],
                                [55.84804565510636, 36.92536976629341],
                                [55.85192651217424, 36.928676930008336]
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
                                [55.85439840276594, 36.95651941081107],
                                [55.85392768000503, 36.96361653586358],
                                [55.8539895383261, 36.965072975358204],
                                [55.85414795511056, 36.96579180737456],
                                [55.85635515589964, 36.96916066189654],
                                [55.85713813170984, 36.970686838826495],
                                [55.85677908142009, 36.971555874547356],
                                [55.856566365008604, 36.972529516419605],
                                [55.855501257339704, 36.97243027468596],
                                [55.852062841331296, 36.969638095101416],
                                [55.85102175123226, 36.96831844826601],
                                [55.850249214039344, 36.96845792313487],
                                [55.84925334226946, 36.96837209244556],
                                [55.84760198224723, 36.9653465606776],
                                [55.85258582179305, 36.956524775227265]
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
                                [55.84903566193218, 36.98304263785885],
                                [55.84904018861422, 36.99340401128312],
                                [55.84829477310325, 36.99904737905045],
                                [55.84438186044315, 37.02318457797567],
                                [55.84535673020797, 37.03425673678864],
                                [55.84235055119474, 37.04551128581545],
                                [55.839098121736626, 37.050738911185206],
                                [55.83774273621025, 37.04634008840094],
                                [55.823612509258936, 37.03473416999284],
                                [55.8200746167505, 37.037440518888964],
                                [55.81841352296611, 37.03963456586318],
                                [55.81511528556998, 37.0360377235741],
                                [55.81072173036727, 37.03809497788846],
                                [55.809827552937335, 37.03113196328598],
                                [55.80865979940823, 37.03227155990885],
                                [55.80299955196458, 37.0254962999398],
                                [55.796978872188284, 37.0120047885952],
                                [55.795807865883354, 37.00710707493379],
                                [55.794390523172524, 37.00438463278341],
                                [55.79307588377364, 37.00064295120773],
                                [55.789393146254255, 36.99873858280742],
                                [55.78568889915128, 36.994339760022875],
                                [55.78163815493381, 36.99567013569434],
                                [55.77844260516865, 36.990168925004475],
                                [55.778660301260125, 36.975009408531385],
                                [55.78010996347928, 36.96664091640639],
                                [55.78407659355253, 36.96187731319579],
                                [55.796955080708585, 36.952645149766994],
                                [55.813203495295475, 36.95767160946106],
                                [55.81878523868652, 36.954828467905315],
                                [55.81885772350068, 36.97315600210433],
                                [55.822074103951635, 36.97361465984615],
                                [55.823096343537564, 36.970189478933904],
                                [55.83142877937184, 36.97105315023666],
                                [55.838772337451346, 36.97946455770742],
                                [55.83965377259627, 36.977211502135034],
                                [55.84221948031083, 36.97877522999085],
                                [55.84353848926842, 36.97665092045016]
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
                                [55.82753475849143, 37.10449215631041],
                                [55.829207538962585, 37.111779718204],
                                [55.840298021381415, 37.12291028035257],
                                [55.838815895203844, 37.13735665810654],
                                [55.83108135459536, 37.13845636380259],
                                [55.82986004974626, 37.13955606949851],
                                [55.829290899494005, 37.14303489459102],
                                [55.82750791006658, 37.142823000078494],
                                [55.82526433712582, 37.144697864180145],
                                [55.821530296400134, 37.14482392800359],
                                [55.80772949393832, 37.15754832757016],
                                [55.80449530497526, 37.143759091023135],
                                [55.8031054729947, 37.12707575095129],
                                [55.798826893543016, 37.12827201617131],
                                [55.79305592885957, 37.10097624761895],
                                [55.79049500099976, 37.093879122564864],
                                [55.78869511402718, 37.080779213737536],
                                [55.79890697078773, 37.070887226890676],
                                [55.79944635045645, 37.08203448755658],
                                [55.80110372496684, 37.08575739366923],
                                [55.805720430817836, 37.08525582058283],
                                [55.809490736171924, 37.088206250499994],
                                [55.81115674373018, 37.096145589184125],
                                [55.81062658949416, 37.10820480091507],
                                [55.81549739157182, 37.11303009493279],
                                [55.81711934599549, 37.09518267614775],
                                [55.81864156563158, 37.09711118442954],
                                [55.82028301925322, 37.10144563419764],
                                [55.823013084076834, 37.103722829651446],
                                [55.824895931529944, 37.101657528710064],
                                [55.82501823051033, 37.097838063073006]
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
                                [55.838025002257474, 37.06601365311107],
                                [55.83186484143818, 37.06041051847932],
                                [55.82447316718779, 37.07613362772454],
                                [55.82550591224574, 37.08013280136551],
                                [55.82210107063739, 37.0909045527693],
                                [55.82501823051033, 37.097838063073006],
                                [55.824895931529944, 37.101657528710064],
                                [55.823013084076834, 37.103722829651446],
                                [55.82028301925322, 37.10144563419764],
                                [55.81864156563158, 37.09711118442954],
                                [55.81711934599549, 37.09518267614775],
                                [55.81549739157182, 37.11303009493279],
                                [55.81062658949416, 37.10820480091507],
                                [55.81115674373018, 37.096145589184125],
                                [55.809490736171924, 37.088206250499994],
                                [55.805720430817836, 37.08525582058283],
                                [55.80110372496684, 37.08575739366923],
                                [55.79944635045645, 37.08203448755658],
                                [55.79890697078773, 37.070887226890676],
                                [55.78869511402718, 37.080779213737536],
                                [55.79049500099976, 37.093879122564864],
                                [55.79305592885957, 37.10097624761895],
                                [55.7904340717218, 37.1233351419671],
                                [55.78936714422618, 37.12527974350284],
                                [55.78771531331451, 37.122291762660254],
                                [55.78483464204967, 37.102293212245094],
                                [55.784464340854136, 37.09215714437778],
                                [55.77669173510458, 37.09073289139071],
                                [55.77409447311122, 37.084703285525165],
                                [55.774236586178056, 37.06121518118155],
                                [55.763612951816185, 37.03333630068058],
                                [55.77844260516865, 36.990168925004475],
                                [55.78163815493381, 36.99567013569434],
                                [55.78568889915128, 36.994339760022875],
                                [55.789393146254255, 36.99873858280742],
                                [55.79307588377364, 37.00064295120773],
                                [55.794390523172524, 37.00438463278341],
                                [55.795807865883354, 37.00710707493379],
                                [55.796978872188284, 37.0120047885952],
                                [55.80299955196458, 37.0254962999398],
                                [55.80865979940823, 37.03227155990885],
                                [55.809827552937335, 37.03113196328598],
                                [55.81072173036727, 37.03809497788846],
                                [55.81511528556998, 37.0360377235741],
                                [55.81841352296611, 37.03963456586318],
                                [55.8200746167505, 37.037440518888964],
                                [55.823612509258936, 37.03473416999284],
                                [55.83774273621025, 37.04634008840094],
                                [55.839098121736626, 37.050738911185206]
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
                                [55.79305592885957, 37.10097624761895],
                                [55.7904340717218, 37.1233351419671],
                                [55.78936714422618, 37.12527974350284],
                                [55.78771531331451, 37.122291762660254],
                                [55.77124653573829, 37.14028026593134],
                                [55.768989120655135, 37.160445113305414],
                                [55.791499940545506, 37.175427932862625],
                                [55.79815303565249, 37.171412665967374],
                                [55.82726936640207, 37.17989649308154],
                                [55.83738201193054, 37.17584099305086],
                                [55.84115678324845, 37.163725454931],
                                [55.844309438765876, 37.146221358899844],
                                [55.845041349367705, 37.13801648152333],
                                [55.84845624611433, 37.134239931230354],
                                [55.848432102987246, 37.12313558590877],
                                [55.84213928040347, 37.11995716822624],
                                [55.840298021381415, 37.12291028035257],
                                [55.838815895203844, 37.13735665810654],
                                [55.83108135459536, 37.13845636380259],
                                [55.82986004974626, 37.13955606949851],
                                [55.829290899494005, 37.14303489459102],
                                [55.82750791006658, 37.142823000078494],
                                [55.82526433712582, 37.144697864180145],
                                [55.821530296400134, 37.14482392800359],
                                [55.80772949393832, 37.15754832757016],
                                [55.80449530497526, 37.143759091023135],
                                [55.8031054729947, 37.12707575095129],
                                [55.798826893543016, 37.12827201617131]
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
                                [55.85229901569957, 37.15827849368734],
                                [55.85124586141367, 37.161711721226474],
                                [55.85268677464859, 37.17396941642445],
                                [55.851096486099365, 37.182123331829665],
                                [55.84706917287397, 37.191170422836755],
                                [55.845893643493625, 37.19598230580941],
                                [55.833819388885765, 37.19279047708159],
                                [55.82105280774281, 37.19908562163946],
                                [55.81374515703584, 37.19026115398039],
                                [55.791499940545506, 37.175427932862625],
                                [55.79815303565249, 37.171412665967374],
                                [55.82726936640207, 37.17989649308154],
                                [55.83738201193054, 37.17584099305086],
                                [55.84115678324845, 37.163725454931],
                                [55.844309438765876, 37.146221358899844]
                            ]]
                    },
                    "options": {"strokeColor": "#FFFFFF", "fillColor": "#b51eff40"},
                    "properties": {"name": "Зона 6", "price": "1500"}
                }
                

            ]};*/
        var json = {"type": "FeatureCollection",
                        "features": [{
                                "type": "Feature",
                                "id": 0,
                                "geometry": {
                                    "type": "Polygon",
                                    "coordinates": [[
[55.855543332172495, 36.93277988437706],
[55.85238353185567, 36.94205310636858],
[55.850163040268896, 36.95119407469167],
[55.84635443947344, 36.958513823093114],
[55.84376636911894, 36.962244775832815],
[55.84205648766999, 36.963014569819904],
[55.84093061018041, 36.970170703469435],
[55.8422194802725, 36.978539195597484],
[55.83965377259627, 36.977211502135034],
[55.838772337451346, 36.97946455770742],
[55.83142877937184, 36.97105315023666],
[55.823096343537564, 36.970189478933904],
[55.822074103951635, 36.97361465984615],
[55.81885772350068, 36.97315600210433],
[55.81878523868652, 36.954828467905315],
[55.813203495295475, 36.95767160946106],
[55.796955080708585, 36.952645149766994],
[55.78407659355253, 36.96187731319579],
[55.78010996347928, 36.96664091640639],
[55.778660301260125, 36.975009408531385],
[55.77613573686546, 36.95897248083274],
[55.77105587393708, 36.942391064702385],
[55.78124516595486, 36.92577477985514],
[55.791806550822294, 36.92235228115206],
[55.81950820294143, 36.91798028045709],
[55.833556902929644, 36.92167904668835],
[55.844345501627615, 36.9247287183376],
[55.849922758839384, 36.927053524241074],
[55.85366462361976, 36.931001735910996],
                                        ]]
                                },
                                "options": {"strokeColor": "#FFFFFF", "fillColor": "#FF000040"},
                                "properties": {"name": "Зона 1", "price": "1500"}
                            }, {
                                "type": "Feature",
                                "id": 1,
                                "geometry": {
                                    "type": "Polygon",
                                    "coordinates": [[
[55.857417222767, 36.98768284612658 ],
[55.856765503384075, 36.9832196503258 ],
[55.85541375392578, 36.980215576229135 ],
[55.85466544374009, 36.97673943334581 ],
[55.85341018125341, 36.97330620580676 ],
[55.85191346891458, 36.97120335393909 ],
[55.850754684120375, 36.969357994136836 ],
[55.84901644186964, 36.96077492528918 ],
[55.84776099613398, 36.95626881414416 ],
[55.84445318429509, 36.96159031682947 ],
[55.842328309665156, 36.962663200435614 ],
[55.84095190748927, 36.970602539119184 ],
[55.84226794219274, 36.97888520055767 ],
[55.83981694356894, 36.97761919790263 ],
[55.838633647076044, 36.979722049770146 ],
[55.83563902176907, 36.97538760000219 ],
[55.83109834126342, 36.97075274282446 ],
[55.82320522666402, 36.97028067403776 ],
[55.82211806120586, 36.97377827459313 ],
[55.81899531055271, 36.97338130765869 ],
[55.81880805825871, 36.955045726832815 ],
[55.81289404648499, 36.95804980092966 ],
[55.7970262637284, 36.95294287496542 ],
[55.784126640035794, 36.9619765549273 ],
[55.78024956741711, 36.966769662436704 ],
[55.778747003308425, 36.97503354841156 ],
[55.7786079297797, 36.990185347136354 ],
[55.781582779906564, 36.99554976516634 ],
[55.785633529816806, 36.99428376251112 ],
[55.789372540849115, 36.99873622947588 ],
[55.793041680623205, 37.000624504622365 ],
[55.79436538712514, 37.00432058864469 ],
[55.795797840538306, 37.00704034858555 ],
[55.79698848940776, 37.011921968992574 ],
[55.803013700092016, 37.02539738708336 ],
[55.808439818524896, 37.032092180784396 ],
[55.809926128359386, 37.03110512786703 ],
[55.81083238682195, 37.03799304061727 ],
[55.81513984562267, 37.03601893478229 ],
[55.81839579754246, 37.03960773044416 ],
[55.820038771464816, 37.03742977672407 ],
[55.82362045470262, 37.0346831946928 ],
[55.83319816944365, 37.04146381908244 ],
[55.837907652190765, 37.04618450694865 ],
[55.83918756644965, 37.05056187206096 ],
[55.84230265264912, 37.0454549460966 ],
[55.84529676281312, 37.03433987193888 ],
[55.844258508896544, 37.023010221059984 ],
[55.84575551726578, 37.01755997234162 ],
[55.847107604118555, 37.00768944316682 ],
[55.84843550059015, 36.999707189138505 ],
[55.85053589834406, 36.994428601797196 ],
[55.8541087268771, 36.99515816264925 ],
[55.857270887741336, 36.99202534251987 ],
                                        ]]
                                },
                                "options": {"strokeColor": "#FFFFFF", "fillColor": "#4462ff40"},
                                "properties": {"name": "Зона 2", "price": "700"}
                            },
                            {
                                "type": "Feature",
                                "id": 2,
                                "geometry": {
                                    "type": "Polygon",
                                    "coordinates": [[
                                           [55.82483702937056, 37.097369114905234 ],
[55.82208746422157, 37.09073601201251 ],
[55.824772105668465, 37.08290396168904 ],
[55.8243840676373, 37.07571295932198 ],
[55.83192973812355, 37.06009177401945 ],
[55.83805215436127, 37.06559566691809 ],
[55.839098121736626, 37.050738911185206 ],
[55.83774273621025, 37.04634008840094 ],
[55.823612509258936, 37.03473416999284 ],
[55.8200746167505, 37.037440518888964 ],
[55.81841352296611, 37.03963456586318 ],
[55.81511528556998, 37.0360377235741 ],
[55.81072173036727, 37.03809497788846 ],
[55.809827552937335, 37.03113196328598 ],
[55.80865979940823, 37.03227155990885 ],
[55.80307206636485, 37.0251958925301 ],
[55.79707557253068, 37.012133534626585 ],
[55.795807865883354, 37.00710707493379 ],
[55.794390523172524, 37.00438463278341 ],
[55.79307588377364, 37.00064295120773 ],
[55.789393146254255, 36.99873858280742 ],
[55.78568889915128, 36.994339760022875 ],
[55.78163815493381, 36.99567013569434 ],
[55.77844260516865, 36.990168925004475 ],
[55.76885755735587, 37.021808591420594 ],
[55.76537364128023, 37.029447522694994 ],
[55.76440583132705, 37.03202244334929 ],
[55.764526808884256, 37.03545567088832 ],
[55.76924463982347, 37.04605576091517 ],
[55.77161543583125, 37.0547246604513 ],
[55.77451825414398, 37.0609903007101 ],
[55.77442149703132, 37.08442207866419 ],
[55.776791976850014, 37.090258565480596 ],
[55.78443457866494, 37.09223267131546 ],
[55.785111698635184, 37.102017369801764 ],
[55.78482150580935, 37.120900121266615 ],
[55.78844876011729, 37.122874227101576 ],
[55.79023808063997, 37.122960057790024 ],
[55.79176135598561, 37.112445798451596 ],
[55.794904433654445, 37.10536476665232 ],
[55.790576591442345, 37.09407803111766 ],
[55.788666384546254, 37.08081718974793 ],
[55.798990053744745, 37.07094666057323 ],
[55.79949770425644, 37.08206173473084 ],
[55.80114147943833, 37.08579536967958 ],
[55.80578235085168, 37.085194554860244 ],
[55.80952848239991, 37.08819862895694 ],
[55.81124433142632, 37.09618088298525 ],
[55.810712668015114, 37.108154264027725 ],
[55.815569867201845, 37.113003697926644 ],
[55.81643974895619, 37.10424896770189 ],
[55.81723712356809, 37.09506508403505 ],
[55.818735176801205, 37.09716793590272 ],
[55.820474778841835, 37.101287808949614 ],
[55.82315651230209, 37.10347649150576 ],
[55.82489591582988, 37.1015023856708 ],
                                        ]]
                                },
                                "options": {"strokeColor": "#FFFFFF", "fillColor": "#ffd21e40"},
                                "properties": {"name": "Зона 3", "price": "500"}
                            },
                            {
                                "type": "Feature",
                                "id": 3,
                                "geometry": {
                                    "type": "Polygon",
                                    "coordinates": [[
                                            [55.83803707670458, 37.12193234665279 ],
[55.836405431716145, 37.11371137602242 ],
[55.83490806154279, 37.10832013590223 ],
[55.83212449009767, 37.10347874862985 ],
[55.828237118226106, 37.0993159602393 ],
[55.82501823051033, 37.097838063073006 ],
[55.824895931529944, 37.101657528710064 ],
[55.823013084076834, 37.103722829651446 ],
[55.82028301925322, 37.10144563419764 ],
[55.81864156563158, 37.09711118442954 ],
[55.81711934599549, 37.09518267614775 ],
[55.81549739157182, 37.11303009493279 ],
[55.81062658949416, 37.10820480091507 ],
[55.81115674373018, 37.096145589184125 ],
[55.809490736171924, 37.088206250499994 ],
[55.805720430817836, 37.08525582058283 ],
[55.80110372496684, 37.08575739366923 ],
[55.79944635045645, 37.08203448755658 ],
[55.79890697078773, 37.070887226890676 ],
[55.78869511402718, 37.080779213737536 ],
[55.79049500099976, 37.093879122564864 ],
[55.79489338976986, 37.10535361273089 ],
[55.79650260780606, 37.11724116308489 ],
[55.79882036826506, 37.1282409022541 ],
[55.80313973717455, 37.12701245052554 ],
[55.804466120284324, 37.1437494347775 ],
[55.80781813263739, 37.157731790372864 ],
[55.816484588177005, 37.151586849519504 ],
[55.82292653525428, 37.1475313494888 ],
[55.82645057889343, 37.14550091726426 ],
[55.82923607520995, 37.14311693076692 ],
[55.83189305098715, 37.140966224226695 ],
[55.83454984223138, 37.13959293321107 ],
[55.83817244564789, 37.12697582200502 ],
                                        ]]
                                },
                                "options": {"strokeColor": "#FFFFFF", "fillColor": "#4462ff40"},
                                "properties": {"name": "Зона 4", "price": "700"}
                            }, {
                                "type": "Feature",
                                "id": 4,
                                "geometry": {
                                    "type": "Polygon",
                                    "coordinates": [[
                                          [55.84213928040347, 37.11995716822624 ],
[55.848432102987246, 37.12313558590877 ],
[55.84845624611433, 37.134239931230354 ],
[55.845041349367705, 37.13801648152333 ],
[55.844309438765876, 37.146221358899844 ],
[55.84115678324845, 37.163725454931 ],
[55.83738201193054, 37.17584099305086 ],
[55.82726936640207, 37.17989649308154 ],
[55.8140082744757, 37.175875861767324 ],
[55.801170199132734, 37.16581489575159 ],
[55.79597877872054, 37.17143144142986 ],
[55.79136846819848, 37.17444087994409 ],
[55.786694133542156, 37.17375354722475 ],
[55.781760761518925, 37.1710069651935 ],
[55.777600764315224, 37.16757373765442 ],
[55.774214390826614, 37.16242389634585 ],
[55.77034388786067, 37.151437568220835 ],
[55.771311549786844, 37.142854499373186 ],
[55.776246250378726, 37.13100986436342 ],
[55.78504974590448, 37.12139682725403 ],
[55.788628617952455, 37.12298469499081 ],
[55.790345392105046, 37.12315635636776 ],
[55.791820306397206, 37.11251335099667 ],
[55.79501173221534, 37.10538940385311 ],
[55.79658317115682, 37.11731986955135 ],
[55.79885560099582, 37.12826328233212 ],
[55.803182519340645, 37.126975822004944 ],
[55.80448775185555, 37.14375572160205 ],
[55.80779897791876, 37.15770320847951 ],
[55.81648658033252, 37.15159850076148 ],
[55.822931546936246, 37.147532271894924 ],
[55.82645559021442, 37.14550452187962 ],
[55.82926825327293, 37.143125402483285 ],
[55.83193730131132, 37.14103327945167 ],
[55.83458805156506, 37.139659988436044 ],
[55.83743785820661, 37.135840522798276 ],
[55.83821065135592, 37.12708579257398 ],
[55.8381200904711, 37.1220003242817 ],
                                        ]]
                                },
                                "options": {"strokeColor": "#FFFFFF", "fillColor": "#00FF0040"},
                                "properties": {"name": "Зона 5", "price": "1000"}
                            }, {
                                "type": "Feature",
                                "id": 5,
                                "geometry": {
                                    "type": "Polygon",
                                    "coordinates": [[
                                           [55.85229901569957, 37.15827849368734 ],
[55.85308056454069, 37.16565993289624 ],
[55.85268677464859, 37.17396941642445 ],
[55.851096486099365, 37.182123331829665 ],
[55.84706917287397, 37.191170422836755 ],
[55.845893643493625, 37.19598230580941 ],
[55.833819388885765, 37.19279047708159 ],
[55.82105280774281, 37.19908562163946 ],
[55.81587160031105, 37.18974616984937 ],
[55.81426804337158, 37.1759770984972 ],
[55.82733881539131, 37.18009697154409 ],
[55.83748313964901, 37.17576252177599 ],
[55.84120205943759, 37.163746225389225 ],
[55.84441356634367, 37.14615093425152 ],
[55.84933896897625, 37.151687013658226 ],
                                        ]]
                                },
                                "options": {"strokeColor": "#FFFFFF", "fillColor": "#f371d040"},
                                "properties": {"name": "Зона 6", "price": "2000"}
                            },
                            {
                                "type": "Feature",
                                "id": 6,
                                "geometry": {
                                    "type": "Polygon",
                                    "coordinates": [[
                                            [55.874393157506915, 37.00405192153509 ],
[55.87463442720632, 36.992378947903106 ],
[55.87106349457858, 36.97890352981357 ],
[55.866720022753405, 36.9675738789334 ],
[55.8607348855101, 36.943369624783564 ],
[55.8682161629583, 36.92238402145163 ],
[55.8608796986956, 36.90126967208639 ],
[55.85196486559914, 36.87037062423341 ],
[55.8372772560466, 36.84221815841372 ],
[55.82239792534515, 36.84273314254502 ],
[55.807899574682885, 36.84917044418097 ],
[55.78914032885755, 36.86204504745244 ],
[55.77733862866082, 36.87612128036261 ],
[55.76824306664189, 36.90410208480596 ],
[55.768823698115426, 36.929851291348925 ],
[55.78660041371158, 36.924779010997426 ],
[55.808164509089124, 36.91911418555799 ],
[55.82459545118674, 36.91705424903456 ],
[55.84478629796679, 36.924092365489614 ],
[55.85125673349423, 36.927611423717174 ],
[55.85581918757744, 36.9325037729587 ],
[55.852733144707074, 36.9419666063639 ],
[55.85036730589634, 36.950850082621926 ],
[55.84884633246676, 36.96016271232094 ],
[55.850632865911116, 36.968831611856636 ],
[55.8523408599723, 36.97176058410157 ],
[55.85376513644469, 36.97423894523142 ],
[55.854869517866646, 36.97768290160663 ],
[55.85556954640643, 36.98092301009554 ],
[55.85689715279999, 36.983540846094506 ],
[55.85819152468796, 36.98751051543628 ],
[55.85632085675896, 36.994264317736196 ],
[55.86031552877286, 36.99665684817688 ],
[55.86523890805864, 36.99819643615209 ],
[55.86944983054121, 37.00114686606821 ],
                                        ]]
                                },
                                "options": {"strokeColor": "#FFFFFF", "fillColor": "#b51eff40"},
                                "properties": {"name": "Зона 7", "price": "2500"}
                            }


                        ]};
        var zone7 = {
                    "type": "Feature",
                    "id": 7,
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                                [55.78771531331451, 37.122291762660254],
[55.78483464204967, 37.102293212245094],
[55.784464340854136, 37.09215714437778],
[55.77669173510458, 37.09073289139071],
[55.77409447311122, 37.084703285525165],
[55.770278389978344, 37.07653593795613],
[55.766818795083026, 37.07679343002145],
[55.76609296725796, 37.08739352004838],
[55.744372330952665, 37.07351040618718],
[55.74216933741733, 37.08037686126527],
[55.74122515909383, 37.089861152341925],
[55.73398585149541, 37.10317250947588],
[55.73781155440148, 37.11145517091305],
[55.73386477875211, 37.12950107316598],
[55.7565593190395, 37.134200303359954],
[55.762125021367375, 37.1146738217315],
[55.76788347357285, 37.12149736146541]
                            ]]
                    },
                    "options": {"strokeColor": "#FFFFFF", "fillColor": "#551eff40"},
                    "properties": {"name": "Зона 7", "price": "1200"}
                }
                var date = new Date();
                var hour = date.getHours();
                var minutes = date.getMinutes();
                if((hour>=10 && hour<22)|| (hour===22 && minutes<30)){
json.features.push(zone7);
                }
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

        if ($.cookie("deliveryCoords") != "") {
            var str_coords = $.cookie("deliveryCoords");
            var coords = str_coords.split(",");
            deliveryPoint.geometry.setCoordinates(coords);
            highlightResult(deliveryPoint);
        }


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
                if (typeof (obj.getThoroughfare) === 'function') {
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

            function setData(obj) {
                console.log(polygon.properties.get('price'));
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
/* End */
;
; /* Start:"a:4:{s:4:"full";s:105:"/bitrix/templates/redesign/components/studiofact/sale.order.ajax/new_order/order_ajax.js?1585720465233098";s:6:"source";s:88:"/bitrix/templates/redesign/components/studiofact/sale.order.ajax/new_order/order_ajax.js";s:3:"min";s:0:"";s:3:"map";s:0:"";}"*/
BX.namespace('BX.Sale.OrderAjaxComponent');
showChange = false;
(function() {
	'use strict';

	/**
	 * Show empty default property value to multiple properties without default values
	 */
	if (BX.Sale && BX.Sale.Input && BX.Sale.Input.Utils)
	{
		BX.Sale.Input.Utils.asMultiple = function (value)
		{
			if (value === undefined || value === null || value === '')
			{
				return [];
			}
			else if (value.constructor === Array)
			{
				var i = 0, length = value.length, val;

				for (; i < length;)
				{
					val = value[i];

					if (val === undefined || val === null || val === '')
					{
						value.splice(i, 1);
						--length;
					}
					else
					{
						++i;
					}
				}

				return value.length ? value : [''];
			}
			else
			{
				return [value];
			}
		};
	}

	BX.Sale.OrderAjaxComponent = {
		BXFormPosting: false,
		regionBlockNotEmpty: false,
		locationsInitialized: false,
		locations: {},
		cleanLocations: {},
		locationsTemplate: '',
		pickUpMapFocused: false,
		basketColumns: [],
		options: {},
		activeSectionId: '',
		firstLoad: true,
		initialized: {},
		mapsReady: false,
		lastSelectedDelivery: 0,
		deliveryLocationInfo: {},
		deliveryPagination: {},
		deliveryCachedInfo: [],
		paySystemPagination: {},
		validation: {},
		hasErrorSection: {},
		pickUpPagination: {},
		timeOut: {},
		isMobile: BX.browser.IsMobile(),
		isHttps: window.location.protocol === "https:",
		orderSaveAllowed: false,

		/**
		 * Initialization of sale.order.ajax component js
		 */
		init: function(parameters)
		{
			this.result = parameters.result || {};
			this.prepareLocations(parameters.locations);
			this.params = parameters.params || {};
			this.signedParamsString = parameters.signedParamsString || '';
			this.siteId = parameters.siteID || '';
			this.ajaxUrl = parameters.ajaxUrl || '';
			this.templateFolder = parameters.templateFolder || '';
			this.defaultBasketItemLogo = this.templateFolder + "/images/product_logo.png";
			this.defaultStoreLogo = this.templateFolder + "/images/pickup_logo.png";
			this.defaultDeliveryLogo = this.templateFolder + "/images/delivery_logo.png";
			this.defaultPaySystemLogo = this.templateFolder + "/images/pay_system_logo.png";

			this.orderBlockNode = BX(parameters.orderBlockId);
			this.totalBlockNode = BX(parameters.totalBlockId);
			this.mobileTotalBlockNode = BX(parameters.totalBlockId + '-mobile');
			this.savedFilesBlockNode = BX('bx-soa-saved-files');
			this.orderSaveBlockNode = BX('bx-soa-orderSave');
			this.mainErrorsNode = BX('bx-soa-main-notifications');

			this.authBlockNode = BX(parameters.authBlockId);
			this.authHiddenBlockNode = BX(parameters.authBlockId + '-hidden');
			this.basketBlockNode = BX(parameters.basketBlockId);
			this.basketHiddenBlockNode = BX(parameters.basketBlockId + '-hidden');
			this.regionBlockNode = BX(parameters.regionBlockId);
			this.regionHiddenBlockNode = BX(parameters.regionBlockId + '-hidden');
			this.paySystemBlockNode = BX(parameters.paySystemBlockId);
			this.paySystemHiddenBlockNode = BX(parameters.paySystemBlockId + '-hidden');
			this.deliveryBlockNode = BX(parameters.deliveryBlockId);
			this.deliveryHiddenBlockNode = BX(parameters.deliveryBlockId + '-hidden');
			this.pickUpBlockNode = BX(parameters.pickUpBlockId);
			this.pickUpHiddenBlockNode = BX(parameters.pickUpBlockId + '-hidden');
			this.propsBlockNode = BX(parameters.propsBlockId);
			this.propsHiddenBlockNode = BX(parameters.propsBlockId + '-hidden');

			if (this.result.SHOW_AUTH)
			{
				this.authBlockNode.style.display = '';
				BX.addClass(this.authBlockNode, 'bx-active');
				this.authGenerateUser = this.result.AUTH.new_user_registration_email_confirmation != 'Y';
			}

			if (this.totalBlockNode)
			{
				this.totalInfoBlockNode = this.totalBlockNode.querySelector('.bx-soa-cart-total');
				this.totalGhostBlockNode = this.totalBlockNode.querySelector('.bx-soa-cart-total-ghost');
			}

			this.options.deliveriesPerPage = parseInt(parameters.params.DELIVERIES_PER_PAGE);
			this.options.paySystemsPerPage = parseInt(parameters.params.PAY_SYSTEMS_PER_PAGE);
			this.options.pickUpsPerPage = parseInt(parameters.params.PICKUPS_PER_PAGE);

			this.options.showWarnings = !!parameters.showWarnings;
			this.options.propertyValidation = !!parameters.propertyValidation;
			this.options.priceDiffWithLastTime = false;

			this.options.pickUpMap = parameters.pickUpMap;
			this.options.propertyMap = parameters.propertyMap;

			this.options.totalPriceChanged = false;

			if (!this.result.IS_AUTHORIZED || typeof this.result.LAST_ORDER_DATA.FAIL !== 'undefined')
				this.initFirstSection();

			this.initOptions();
			this.editOrder();
			this.bindEvents();

			this.orderBlockNode.removeAttribute('style');
			this.basketBlockScrollCheck();

			if (this.params.USE_ENHANCED_ECOMMERCE === 'Y')
			{
				this.setAnalyticsDataLayer('checkout');
			}

			if (this.params.USER_CONSENT === 'Y')
			{
				this.initUserConsent();
			}
		},

		/**
		 * Send ajax request with order data and executes callback by action
		 */
		sendRequest: function(action, actionData)
		{
			var loaderTimer, form;
			if (!(loaderTimer = this.startLoader()))
				return;

			this.firstLoad = false;
			action = BX.type.isString(action) ? action : 'refreshOrderAjax';

			if (action == 'saveOrderAjax')
			{
				form = BX('bx-soa-order-form');
				if (form)
					form.querySelector('input[type=hidden][name=sessid]').value = BX.bitrix_sessid();
				
				BX.ajax.submit(BX('bx-soa-order-form'), BX.proxy(this.saveOrder, this));
			}
			else
				BX.ajax({
					method: 'POST',
					dataType: 'json',
					url: this.ajaxUrl,
					data: this.getData(action, actionData),
					onsuccess: BX.delegate(function(result) {
						if (result.redirect && result.redirect.length)
							document.location.href = result.redirect;

						this.saveFiles();

						switch (action)
						{
							case 'refreshOrderAjax':
								this.refreshOrder(result);
								break;
							case 'showAuthForm':
								this.firstLoad = true;
								this.refreshOrder(result);
								break;
							case 'enterCoupon':
								if (result && result.order)
								{
									this.deliveryCachedInfo = [];
									this.refreshOrder(result);
								}
								else
								{
									this.addCoupon(result);
								}

								break;
							case 'removeCoupon':
								if (result && result.order)
								{
									this.deliveryCachedInfo = [];
									this.refreshOrder(result);
								}
								else
								{
									this.removeCoupon(result);
								}

								break;
						}
						BX.cleanNode(this.savedFilesBlockNode);
						this.endLoader(loaderTimer);
					}, this),
					onfailure: BX.delegate(function(){
						this.endLoader(loaderTimer);
					}, this)
				});
			
		},

		getData: function(action, actionData)
		{
			var data = {
				order: this.getAllFormData(),
				sessid: BX.bitrix_sessid(),
				via_ajax: 'Y',
				SITE_ID: this.siteId,
				signedParamsString: this.signedParamsString
			};

			data[this.params.ACTION_VARIABLE] = action;

			if (action === 'enterCoupon' || action === 'removeCoupon')
				data.coupon = actionData;

			return data;
		},

		getAllFormData: function()
		{
			var form = BX('bx-soa-order-form'),
				prepared = BX.ajax.prepareForm(form),
				i;

			for (i in prepared.data)
				if (prepared.data.hasOwnProperty(i) && i == '')
					delete prepared.data[i];

			return !!prepared && prepared.data ? prepared.data : {};
		},

		/**
		 * Refreshes order via json data from ajax request
		 */
		refreshOrder: function(result)
		{
			if (result.error)
			{
				this.showError(this.mainErrorsNode, result.error);
				this.animateScrollTo(this.mainErrorsNode, 800, 20);
			}
			else if (result.order.SHOW_AUTH)
			{
				var animation = this.result.OK_MESSAGE && this.result.OK_MESSAGE.length ? 'bx-step-good' : 'bx-step-bad';
				this.addAnimationEffect(this.authBlockNode, animation);
				BX.merge(this.result, result.order);
				this.editAuthBlock();
				this.showAuthBlock();
				this.showErrors(result.order.ERROR, false);
				this.animateScrollTo(this.authBlockNode);
			}
			else
			{
				this.isPriceChanged(result);

				if (this.activeSectionId !== this.deliveryBlockNode.id)
					this.deliveryCachedInfo = [];

				this.result = result.order;
				this.prepareLocations(result.locations);
				this.locationsInitialized = false;
				this.maxWaitTimeExpired = false;
				this.pickUpMapFocused = false;
				this.deliveryLocationInfo = {};
				this.initialized = {};

				this.initOptions();
				this.editOrder();
				this.mapsReady && this.initMaps();
				BX.saleOrderAjax && BX.saleOrderAjax.initDeferredControl();
			}

			return true;
		},

		saveOrder: function(result)
		{
			var res = BX.parseJSON(result), redirected = false;
			if (res && res.order)
			{
				result = res.order;
				this.result.SHOW_AUTH = result.SHOW_AUTH;
				this.result.AUTH = result.AUTH;

				if (this.result.SHOW_AUTH)
				{
					this.editAuthBlock();
					this.showAuthBlock();
					this.animateScrollTo(this.authBlockNode);
				}
				else
				{
					
					if (result.REDIRECT_URL && result.REDIRECT_URL.length)
					{
						if (this.params.USE_ENHANCED_ECOMMERCE === 'Y')
						{
							this.setAnalyticsDataLayer('purchase', result.ID);
						}

						redirected = true;
						document.location.href = result.REDIRECT_URL;
					}

					this.showErrors(result.ERROR, true, true);
				}
			}

			if (!redirected)
			{
				this.endLoader();
				this.disallowOrderSave();
			}
		},

		/**
		 * Showing loader image with overlay.
		 */
		startLoader: function()
		{
			if (this.BXFormPosting === true)
				return false;

			this.BXFormPosting = true;

			if (!this.loadingScreen)
			{
				this.loadingScreen = new BX.PopupWindow("loading_screen", null, {
					overlay: {backgroundColor: 'white', opacity: '80'},
					events: {
						onAfterPopupShow: BX.delegate(function(){
							BX.cleanNode(this.loadingScreen.popupContainer);
							BX.removeClass(this.loadingScreen.popupContainer, 'popup-window');
							this.loadingScreen.popupContainer.appendChild(
								BX.create('IMG', {props: {src: this.templateFolder + "/images/loader.gif", style: "width:64px"}})
							);
							this.loadingScreen.popupContainer.removeAttribute('style');
							this.loadingScreen.popupContainer.style.display = 'block';
						}, this)
					}
				});
				BX.addClass(this.loadingScreen.popupContainer, 'bx-step-opacity');
			}

			return setTimeout(BX.delegate(function(){this.loadingScreen.show()}, this), 100);
		},

		/**
		 * Hiding loader image with overlay.
		 */
		endLoader: function(loaderTimer)
		{
			this.BXFormPosting = false;

			if (this.loadingScreen && this.loadingScreen.isShown())
				this.loadingScreen.close();

			clearTimeout(loaderTimer);
		},

		htmlspecialcharsEx: function(str)
		{
			return str.replace(/&amp;/g, '&amp;amp;')
				.replace(/&lt;/g, '&amp;lt;').replace(/&gt;/g, '&amp;gt;')
				.replace(/&quot;/g, '&amp;quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
		},

		saveFiles: function()
		{
			if (this.result.ORDER_PROP && this.result.ORDER_PROP.properties)
			{
				var props = this.result.ORDER_PROP.properties, i, prop;
				for (i = 0; i < props.length; i++)
				{
					if (props[i].TYPE == 'FILE')
					{
						prop = this.orderBlockNode.querySelector('div[data-property-id-row="' + props[i].ID + '"]');
						if (prop)
							this.savedFilesBlockNode.appendChild(prop);
					}
				}
			}
		},

		/**
		 * Animating scroll to certain node
		 */
		animateScrollTo: function(node, duration, shiftToTop)
		{
			if (!node)
				return;

			var scrollTop = BX.GetWindowScrollPos().scrollTop,
				orderBlockPos = BX.pos(this.orderBlockNode),
				ghostTop = BX.pos(node).top - (this.isMobile ? 50 : 0);

			if (shiftToTop)
				ghostTop -= parseInt(shiftToTop);

			if (ghostTop + window.innerHeight > orderBlockPos.bottom)
				ghostTop = orderBlockPos.bottom - window.innerHeight + 17;

			new BX.easing({
				duration: duration || 800,
				start: {scroll: scrollTop},
				finish: {scroll: ghostTop},
				transition: BX.easing.makeEaseOut(BX.easing.transitions.quad),
				step: BX.delegate(function(state){
					window.scrollTo(0, state.scroll);
				}, this)
			}).animate();
		},

		checkKeyPress: function(event)
		{
			if (event.keyCode == 13)
			{
				var target = event.target || event.srcElement,
					send = target.getAttribute('data-send'),
					nextAttr, next;

				if (!send)
				{
					nextAttr = target.getAttribute('data-next');
					if (nextAttr)
					{
						next = this.orderBlockNode.querySelector('input[name=' + nextAttr + ']');
						next && next.focus();
					}

					return BX.PreventDefault(event);
				}
			}
		},

		getSizeString: function(maxSize, len)
		{
			var gbDivider = 1024 * 1024 * 1024,
				mbDivider = 1024 * 1024,
				kbDivider = 1024,
				str;

			maxSize = parseInt(maxSize);
			len = parseInt(len);

			if (maxSize > gbDivider)
				str = parseFloat(maxSize / gbDivider).toFixed(len) + ' Gb';
			else if (maxSize > mbDivider)
				str = parseFloat(maxSize / mbDivider).toFixed(len) + ' Mb';
			else if (maxSize > kbDivider)
				str = parseFloat(maxSize / kbDivider).toFixed(len) + ' Kb';
			else
				str = maxSize + ' B';

			return str;
		},

		getFileAccepts: function(accepts)
		{
			var arr = [],
				arAccepts = accepts.split(','),
				i, currentAccept;

			var mimeTypesMap = {
				json: 'application/json', javascript: 'application/javascript', 'octet-stream': 'application/octet-stream',
				ogg: 'application/ogg', pdf: 'application/pdf', zip: 'application/zip', gzip: 'application/gzip',
				aac: 'audio/aac', mp3: 'audio/mpeg', gif: 'image/gif', jpeg: 'image/jpeg', png: 'image/png', svg: 'image/svg+xml',
				tiff: 'image/tiff', css: 'text/css', csv: 'text/csv', html: 'text/html', plain: 'text/plain',
				php: 'text/php', xml: 'text/xml', mpeg: 'video/mpeg', mp4: 'video/mp4', quicktime: 'video/quicktime',
				flv: 'video/x-flv', doc: 'application/msword', docx: 'application/msword',
				xls: 'application/vnd.ms-excel', xlsx: 'application/vnd.ms-excel'
			};

			for (i = 0; i < arAccepts.length; i++)
			{
				currentAccept = BX.util.trim(arAccepts[i]);
				currentAccept = mimeTypesMap[currentAccept] || currentAccept;
				arr.push(currentAccept);
			}

			return arr.join(',');
		},

		uniqueText: function(text, separator)
		{
			var phrases, i, output = [];

			text = text || '';
			separator = separator || '<br>';

			phrases = text.split(separator);
			phrases = BX.util.array_unique(phrases);

			for (i = 0; i < phrases.length; i++)
			{
				if (phrases[i] == '')
					continue;

				output.push(BX.util.trim(phrases[i]));
			}

			return output.join(separator);
		},

		getImageSources: function(item, key)
		{
			if (!item || !key || !item[key])
				return false;

			return {
				src_1x: item[key + '_SRC'],
				src_2x: item[key + '_SRC_2X'],
				src_orig: item[key + '_SRC_ORIGINAL']
			};
		},

		getErrorContainer: function(node)
		{
			if (!node)
				return;

			node.appendChild(
				BX.create('DIV', {props: {className: 'alert alert-danger'}, style: {display: 'none'}})
			);
		},

		showError: function(node, msg, border)
		{
			if (BX.type.isArray(msg))
				msg = msg.join('<br>');

			var errorContainer = node.querySelector('.alert.alert-danger'), animate;
			if (errorContainer && msg.length)
			{
				BX.cleanNode(errorContainer);
				errorContainer.appendChild(BX.create('DIV', {html: msg}));

				animate = !this.hasErrorSection[node.id];
				if (animate)
				{
					errorContainer.style.opacity = 0;
					errorContainer.style.display = '';
					new BX.easing({
						duration: 300,
						start: {opacity: 0},
						finish: {opacity: 100},
						transition: BX.easing.makeEaseOut(BX.easing.transitions.quad),
						step: function(state){
							errorContainer.style.opacity = state.opacity / 100;
						},
						complete: function(){
							errorContainer.removeAttribute('style');
						}
					}).animate();
				}
				else
					errorContainer.style.display = '';

				if (!!border)
					BX.addClass(node, 'bx-step-error');
			}
		},

		showErrors: function(errors, scroll, showAll)
		{
			var errorNodes = this.orderBlockNode.querySelectorAll('div.alert.alert-danger'),
				section, k, blockErrors;

			for (k = 0; k < errorNodes.length; k++)
			{
				section = BX.findParent(errorNodes[k], {className: 'bx-soa-section'});
				BX.removeClass(section, 'bx-step-error');
				errorNodes[k].style.display = 'none';
				BX.cleanNode(errorNodes[k]);
			}

			if (!errors || BX.util.object_keys(errors).length < 1)
				return;

			for (k in errors)
			{
				if (!errors.hasOwnProperty(k))
					continue;

				blockErrors = errors[k];
				switch (k.toUpperCase())
				{
					case 'MAIN':
						this.showError(this.mainErrorsNode, blockErrors);
						this.animateScrollTo(this.mainErrorsNode, 800, 20);
						scroll = false;
						break;
					case 'AUTH':
						if (this.authBlockNode.style.display == 'none')
						{
							this.showError(this.mainErrorsNode, blockErrors, true);
							this.animateScrollTo(this.mainErrorsNode, 800, 20);
							scroll = false;
						}
						else
							this.showError(this.authBlockNode, blockErrors, true);
						break;
					case 'REGION':
						if (showAll || this.regionBlockNode.getAttribute('data-visited') === 'true')
						{
							this.showError(this.regionBlockNode, blockErrors, true);
							this.showError(this.regionHiddenBlockNode, blockErrors);
						}
						break;
					case 'DELIVERY':
						if (showAll || this.deliveryBlockNode.getAttribute('data-visited') === 'true')
						{
							this.showError(this.deliveryBlockNode, blockErrors, true);
							this.showError(this.deliveryHiddenBlockNode, blockErrors);
						}
						break;
					case 'PAY_SYSTEM':
						if (showAll || this.paySystemBlockNode.getAttribute('data-visited') === 'true')
						{
							this.showError(this.paySystemBlockNode, blockErrors, true);
							this.showError(this.paySystemHiddenBlockNode, blockErrors);
						}
						break;
					case 'PROPERTY':
						if (showAll || this.propsBlockNode.getAttribute('data-visited') === 'true')
						{
							this.showError(this.propsBlockNode, blockErrors, true);
							this.showError(this.propsHiddenBlockNode, blockErrors);
						}
						break;
				}
			}

			!!scroll && this.scrollToError();
		},

		showBlockErrors: function(node)
		{
			var errorNode = node.querySelector('div.alert.alert-danger'),
				hiddenNode, errors;

			if (!errorNode)
				return;

			BX.removeClass(node, 'bx-step-error');
			errorNode.style.display = 'none';
			BX.cleanNode(errorNode);

			switch (node.id)
			{
				case this.regionBlockNode.id:
					hiddenNode = this.regionHiddenBlockNode;
					errors = this.result.ERROR.REGION;
					break;
				case this.deliveryBlockNode.id:
					hiddenNode = this.deliveryHiddenBlockNode;
					errors = this.result.ERROR.DELIVERY;
					break;
				case this.paySystemBlockNode.id:
					hiddenNode = this.paySystemHiddenBlockNode;
					errors = this.result.ERROR.PAY_SYSTEM;
					break;
				case this.propsBlockNode.id:
					hiddenNode = this.propsHiddenBlockNode;
					errors = this.result.ERROR.PROPERTY;
					break;
			}

			if (errors && BX.util.object_keys(errors).length)
			{
				this.showError(node, errors, true);
				this.showError(hiddenNode, errors);
			}
		},

		checkNotifications: function()
		{
			var informer = this.mainErrorsNode.querySelector('[data-type="informer"]'),
				success, sections, className, text, scrollTop, informerPos;

			if (informer)
			{
				if (this.firstLoad && this.result.IS_AUTHORIZED && typeof this.result.LAST_ORDER_DATA.FAIL === 'undefined')
				{
					sections = this.orderBlockNode.querySelectorAll('.bx-soa-section.bx-active');
					success = sections.length && sections[sections.length - 1].getAttribute('data-visited') == 'true';
					className = success ? 'success' : 'warning';
					text = (success ? this.params.MESS_SUCCESS_PRELOAD_TEXT : this.params.MESS_FAIL_PRELOAD_TEXT).split('#ORDER_BUTTON#').join(this.params.MESS_ORDER);

					informer.appendChild(
						BX.create('DIV', {
							props: {className: 'row'},
							children: [
								BX.create('DIV', {
									props: {className: 'col-xs-12'},
									style: {position: 'relative', paddingLeft: '48px'},
									children: [
										BX.create('DIV', {props: {className: 'icon-' + className}}),
										BX.create('DIV', {html: text}),
										
									]
								}),
								BX.create('DIV', {props: {className: 'clearfix'}})
							]
						})
					);
					BX.addClass(informer, 'alert alert-' + className);
					informer.style.display = '';
				}
				else if (BX.hasClass(informer, 'alert'))
				{
					scrollTop = BX.GetWindowScrollPos().scrollTop;
					informerPos = BX.pos(informer);

					new BX.easing({
						duration: 300,
						start: {opacity: 100},
						finish: {opacity: 0},
						transition: BX.easing.transitions.linear,
						step: function(state){
							informer.style.opacity = state.opacity / 100;
						},
						complete: function(){
							if (scrollTop > informerPos.top)
								window.scrollBy(0, -(informerPos.height + 20));

							informer.style.display = 'none';
							BX.cleanNode(informer);
							informer.removeAttribute('class');
							informer.removeAttribute('style');
						}
					}).animate();
				}
			}
		},

		/**
		 * Returns status of preloaded data from back-end for certain block
		 */
		checkPreload: function(node)
		{
			var status;

			switch (node.id)
			{
				case this.regionBlockNode.id:
					status = this.result.LAST_ORDER_DATA && this.result.LAST_ORDER_DATA.PERSON_TYPE;
					break;
				case this.paySystemBlockNode.id:
					status = this.result.LAST_ORDER_DATA && this.result.LAST_ORDER_DATA.PAY_SYSTEM;
					break;
				case this.deliveryBlockNode.id:
					status = this.result.LAST_ORDER_DATA && this.result.LAST_ORDER_DATA.DELIVERY;
					break;
				case this.pickUpBlockNode.id:
					status = this.result.LAST_ORDER_DATA && this.result.LAST_ORDER_DATA.PICK_UP;
					break;
				default:
					status = true;
			}

			return status;
		},

		checkBlockErrors: function(node)
		{
			var hiddenNode, errorNode, showError, showWarning, errorTooltips, i;

			if (hiddenNode = BX(node.id + '-hidden'))
			{
				errorNode = hiddenNode.querySelector('div.alert.alert-danger');
				showError = errorNode && errorNode.style.display != 'none';
				showWarning = hiddenNode.querySelector('div.alert.alert-warning.alert-show');

				if (!showError)
				{
					errorTooltips = hiddenNode.querySelectorAll('div.tooltip');
					for (i = 0; i < errorTooltips.length; i++)
					{
						if (errorTooltips[i].getAttribute('data-state') == 'opened')
						{
							showError = true;
							break;
						}
					}
				}
			}

			if (showError)
				BX.addClass(node, 'bx-step-error');
			else if (showWarning)
				BX.addClass(node, 'bx-step-warning');
			else
				BX.removeClass(node, 'bx-step-error bx-step-warning');

			return !showError;
		},

		scrollToError: function()
		{
			var sections = this.orderBlockNode.querySelectorAll('div.bx-soa-section.bx-active'),
				i, errorNode;

			for (i in sections)
			{
				if (sections.hasOwnProperty(i))
				{
					errorNode = sections[i].querySelector('.alert.alert-danger');
					if (errorNode && errorNode.style.display != 'none')
					{
						this.animateScrollTo(sections[i]);
						break;
					}
				}
			}
		},

		showWarnings: function()
		{
			var sections = this.orderBlockNode.querySelectorAll('div.bx-soa-section.bx-active'),
				currentDelivery = this.getSelectedDelivery(),
				k,  warningString;

			for (k = 0; k < sections.length; k++)
			{
				BX.removeClass(sections[k], 'bx-step-warning');

				if (sections[k].getAttribute('data-visited') == 'false')
					BX.removeClass(sections[k], 'bx-step-completed');
			}

			if (currentDelivery && currentDelivery.CALCULATE_ERRORS)
			{
				BX.addClass(this.deliveryBlockNode, 'bx-step-warning');

				warningString = '<strong>' + this.params.MESS_DELIVERY_CALC_ERROR_TITLE + '</strong>';
				if (this.params.MESS_DELIVERY_CALC_ERROR_TEXT.length)
					warningString += '<br><small>' + this.params.MESS_DELIVERY_CALC_ERROR_TEXT + '</small>';

				this.showBlockWarning(this.deliveryBlockNode, warningString);
				this.showBlockWarning(this.deliveryHiddenBlockNode, warningString);

				if (this.activeSectionId != this.deliveryBlockNode.id)
				{
					BX.addClass(this.deliveryBlockNode, 'bx-step-completed');
					BX.bind(this.deliveryBlockNode.querySelector('.alert.alert-warning'), 'click', BX.proxy(this.showByClick, this));
				}
			}
			else if (BX.hasClass(this.deliveryBlockNode, 'bx-step-warning') && this.activeSectionId != this.deliveryBlockNode.id)
			{
				BX.removeClass(this.deliveryBlockNode, 'bx-step-warning');
			}

			if (!this.result.WARNING || !this.options.showWarnings)
				return;

			for (k in this.result.WARNING)
			{
				if (this.result.WARNING.hasOwnProperty(k))
				{
					switch (k.toUpperCase())
					{
						case 'DELIVERY':
							if (this.deliveryBlockNode.getAttribute('data-visited') === 'true')
							{
								this.showBlockWarning(this.deliveryBlockNode, this.result.WARNING[k], true);
								this.showBlockWarning(this.deliveryHiddenBlockNode, this.result.WARNING[k], true);
							}

							break;
						case 'PAY_SYSTEM':
							if (this.paySystemBlockNode.getAttribute('data-visited') === 'true')
							{
								this.showBlockWarning(this.paySystemBlockNode, this.result.WARNING[k], true);
								this.showBlockWarning(this.paySystemHiddenBlockNode, this.result.WARNING[k], true);
							}

							break;
					}
				}
			}
		},

		notifyAboutWarnings: function(node)
		{
			if (!BX.type.isDomNode(node))
				return;

			switch (node.id)
			{
				case this.deliveryBlockNode.id:
					this.showBlockWarning(this.deliveryBlockNode, this.result.WARNING.DELIVERY, true);
					break;
				case this.paySystemBlockNode.id:
					this.showBlockWarning(this.paySystemBlockNode, this.result.WARNING.PAY_SYSTEM, true);
					break;
			}
		},

		showBlockWarning: function(node, warnings, hide)
		{
			var errorNode = node.querySelector('.alert.alert-danger'),
				existedWarningNode = node.querySelector('.alert.alert-warning'),
				warnStr = '', i, warningNode;

			if (errorNode)
			{
				if (BX.type.isString(warnings))
				{
					warnStr = warnings;
				}
				else
				{
					for (i in warnings)
					{
						if (warnings.hasOwnProperty(i) && warnings[i])
						{
							warnStr += warnings[i] + '<br>';
						}
					}
				}

				if (!warnStr)
				{
					return;
				}

				if (BX.type.isDomNode(existedWarningNode) && existedWarningNode.innerHTML === warnStr)
				{
					return;
				}

				warningNode = BX.create('DIV', {
					props: {className: 'alert alert-warning' + (!!hide ? ' alert-hide' : ' alert-show')},
					html: warnStr
				});
				BX.prepend(warningNode, errorNode.parentNode);
				BX.addClass(node, 'bx-step-warning');
			}
		},

		showPagination: function(entity, node)
		{
			if (!node || !entity)
				return;

			var pagination, navigation = [], i,
				pageCounter, active,
				colorTheme, paginationNode;

			switch (entity)
			{
				case 'delivery':
					pagination = this.deliveryPagination; break;
				case 'paySystem':
					pagination = this.paySystemPagination; break;
				case 'pickUp':
					pagination = this.pickUpPagination; break;
			}

			if (pagination.pages.length > 1)
			{
				navigation.push(
					BX.create('LI', {
						attrs: {
							'data-action': 'prev',
							'data-entity': entity
						},
						props: {className: 'bx-pag-prev'},
						html: pagination.pageNumber == 1
							? '<span>' + this.params.MESS_NAV_BACK + '</span>'
							: '<a href=""><span>' + this.params.MESS_NAV_BACK + '</span></a>',
						events: {click: BX.proxy(this.doPagination, this)}
					})
				);
				for (i = 0; i < pagination.pages.length; i++)
				{
					pageCounter = parseInt(i) + 1;
					active = pageCounter == pagination.pageNumber ? 'bx-active' : '';

					navigation.push(
						BX.create('LI', {
							attrs: {
								'data-action': pageCounter,
								'data-entity': entity
							},
							props: {className: active},
							html: '<a href=""><span>' + pageCounter  + '</span></a>',
							events: {click: BX.proxy(this.doPagination, this)}
						})
					);
				}

				navigation.push(
					BX.create('LI', {
						attrs: {
							'data-action': 'next',
							'data-entity': entity
						},
						props: {className: 'bx-pag-next'},
						html: pagination.pageNumber == pagination.pages.length
							? '<span>' + this.params.MESS_NAV_FORWARD + '</span>'
							: '<a href=""><span>' + this.params.MESS_NAV_FORWARD + '</span></a>',
						events: {click: BX.proxy(this.doPagination, this)}
					})
				);
				colorTheme = this.params.TEMPLATE_THEME || '';
				paginationNode = BX.create('DIV', {
					props: {className: 'bx-pagination' + (colorTheme ? ' bx-' + colorTheme : '')},
					children: [
						BX.create('DIV', {
							props: {className: 'bx-pagination-container'},
							children: [BX.create('UL', {children: navigation})]
						})
					]
				});

				node.appendChild(BX.create('DIV', {style: {clear: 'both'}}));
				node.appendChild(paginationNode);
			}
		},

		doPagination: function(e)
		{
			var target = e.target || e.srcElement,
				node = target.tagName == 'LI' ? target : BX.findParent(target, {tagName: 'LI'}),
				page = node.getAttribute('data-action'),
				entity = node.getAttribute('data-entity'),
				pageNum;

			if (BX.hasClass(node, 'bx-active'))
				return BX.PreventDefault(e);

			if (page == 'prev' || page == 'next')
			{
				pageNum = parseInt(BX.findParent(node).querySelector('.bx-active').getAttribute('data-action'));
				page = page == 'next' ? ++pageNum : --pageNum;
			}

			if (entity == 'delivery')
				this.showDeliveryItemsPage(page);
			else if (entity == 'paySystem')
				this.showPaySystemItemsPage(page);
			else if (entity == 'pickUp')
				this.showPickUpItemsPage(page);

			return BX.PreventDefault(e);
		},

		showDeliveryItemsPage: function(page)
		{
			this.getCurrentPageItems('delivery', page);

			var selectedDelivery = this.getSelectedDelivery(), hidden,
				deliveryItemsContainer, k, deliveryItemNode;

			if (selectedDelivery && selectedDelivery.ID)
			{
				if(selectedDelivery.ID == 3){
					showAddress = false;
				}
				if(selectedDelivery.ID == 2){
					showAddress = true;
				}
				hidden = this.deliveryBlockNode.querySelector('input[type=hidden][name=DELIVERY_ID]');
				if (!hidden)
				{
					hidden = BX.create('INPUT', {
						props: {
							type: 'hidden',
							name: 'DELIVERY_ID',
							value: selectedDelivery.ID
						}
					})
				}
			}

			deliveryItemsContainer = this.deliveryBlockNode.querySelector('.bx-soa-pp-item-container');
			BX.cleanNode(deliveryItemsContainer);

			if (BX.type.isDomNode(hidden))
				BX.prepend(hidden, BX.findParent(deliveryItemsContainer));

			for (k = 0; k < this.deliveryPagination.currentPage.length; k++)
			{
				deliveryItemNode = this.createDeliveryItem(this.deliveryPagination.currentPage[k]);
				deliveryItemsContainer.appendChild(deliveryItemNode);
			}

			this.showPagination('delivery', deliveryItemsContainer);
		},

		showPaySystemItemsPage: function(page)
		{
			this.getCurrentPageItems('paySystem', page);

			var selectedPaySystem = this.getSelectedPaySystem(), hidden,
				paySystemItemsContainer, k, paySystemItemNode;

			if (selectedPaySystem && selectedPaySystem.ID)
			{
				hidden = this.paySystemBlockNode.querySelector('input[type=hidden][name=PAY_SYSTEM_ID]');
				if (!hidden)
				{
					hidden = BX.create('INPUT', {
						props: {
							type: 'hidden',
							name: 'PAY_SYSTEM_ID',
							value: selectedPaySystem.ID
						}
					})
				}
			}

			
			paySystemItemsContainer = this.paySystemBlockNode.querySelector('.bx-soa-pp-item-container');
			BX.cleanNode(paySystemItemsContainer);

			if (BX.type.isDomNode(hidden))
				BX.prepend(hidden, BX.findParent(paySystemItemsContainer));

			for (k = 0; k < this.paySystemPagination.currentPage.length; k++)
			{
				paySystemItemNode = this.createPaySystemItem(this.paySystemPagination.currentPage[k]);
				paySystemItemsContainer.appendChild(paySystemItemNode);
			}

			this.showPagination('paySystem', paySystemItemsContainer);
			
		},

		showPickUpItemsPage: function(page)
		{
			this.getCurrentPageItems('pickUp', page);
			this.editPickUpList(false);
		},

		getCurrentPageItems: function(entity, page)
		{
			if (!entity || typeof page === 'undefined')
				return;

			var pagination, perPage;

			switch (entity)
			{
				case 'delivery':
					pagination = this.deliveryPagination;
					perPage = this.options.deliveriesPerPage;
					break;
				case 'paySystem':
					pagination = this.paySystemPagination;
					perPage = this.options.paySystemsPerPage;
					break;
				case 'pickUp':
					pagination = this.pickUpPagination;
					perPage = this.options.pickUpsPerPage;
					break;
			}

			if (pagination && perPage > 0)
			{
				if (page <= 0 || page > pagination.pages.length)
					return;

				pagination.pageNumber = page;
				pagination.currentPage = pagination.pages.slice(pagination.pageNumber - 1, pagination.pageNumber)[0];
			}
		},

		initPropsListForLocation: function()
		{
			if (BX.saleOrderAjax && this.result.ORDER_PROP && this.result.ORDER_PROP.properties)
			{
				var i, k, curProp, attrObj;

				BX.saleOrderAjax.cleanUp();

				for (i = 0; i < this.result.ORDER_PROP.properties.length; i++)
				{
					curProp = this.result.ORDER_PROP.properties[i];

					if (curProp.TYPE == 'LOCATION' && curProp.MULTIPLE == 'Y' && curProp.IS_LOCATION != 'Y')
					{
						for (k = 0; k < this.locations[curProp.ID].length; k++)
						{
							BX.saleOrderAjax.addPropertyDesc({
								id: curProp.ID + '_' + k,
								attributes: {
									id: curProp.ID + '_' + k,
									type: curProp.TYPE,
									valueSource: curProp.SOURCE == 'DEFAULT' ? 'default' : 'form'
								}
							});
						}
					}
					else
					{
						attrObj = {
							id: curProp.ID,
							type: curProp.TYPE,
							valueSource: curProp.SOURCE == 'DEFAULT' ? 'default' : 'form'
						};

						if (!this.deliveryLocationInfo.city && parseInt(curProp.INPUT_FIELD_LOCATION) > 0)
						{
							attrObj.altLocationPropId = parseInt(curProp.INPUT_FIELD_LOCATION);
							this.deliveryLocationInfo.city = curProp.INPUT_FIELD_LOCATION;
						}

						if (!this.deliveryLocationInfo.loc && curProp.IS_LOCATION == 'Y')
							this.deliveryLocationInfo.loc = curProp.ID;

						if (!this.deliveryLocationInfo.zip && curProp.IS_ZIP == 'Y')
						{
							attrObj.isZip = true;
							this.deliveryLocationInfo.zip = curProp.ID;
						}

						BX.saleOrderAjax.addPropertyDesc({
							id: curProp.ID,
							attributes: attrObj
						});
					}
				}
			}
		},

		/**
		 * Binds main events for scrolling/resizing
		 */
		bindEvents: function()
		{
			BX.bind(this.orderSaveBlockNode.querySelector('[data-save-button]'), 'click', BX.proxy(this.clickOrderSaveAction, this));
			BX.bind(window, 'scroll', BX.proxy(this.totalBlockScrollCheck, this));
			BX.bind(window, 'resize', BX.throttle(function(){
				this.totalBlockResizeCheck();
				this.alignBasketColumns();
				this.basketBlockScrollCheck();
				this.mapsReady && this.resizeMapContainers();
			}, 50, this));
			BX.addCustomEvent('onDeliveryExtraServiceValueChange', BX.proxy(this.sendRequest, this));
		},

		initFirstSection: function()
		{
			var firstSection = this.orderBlockNode.querySelector('.bx-soa-section.bx-active');
			BX.addClass(firstSection, 'bx-selected');
			this.activeSectionId = firstSection.id;
		},

		initOptions: function()
		{
			var headers, i, total;

			this.initPropsListForLocation();

			this.propertyCollection = new BX.Sale.PropertyCollection(BX.merge({publicMode: true}, this.result.ORDER_PROP));
			this.fadedPropertyCollection = new BX.Sale.PropertyCollection(BX.merge({publicMode: true}, this.result.ORDER_PROP));

			if (this.options.propertyValidation)
				this.initValidation();

			this.initPagination();

			if (this.result.GRID && this.result.GRID.HEADERS)
			{
				headers = this.result.GRID.HEADERS;
				for (i = 0; i < headers.length; i++)
				{
					if (headers[i].id == 'PREVIEW_PICTURE')
						this.options.showPreviewPicInBasket = true;

					if (headers[i].id == 'DETAIL_PICTURE')
						this.options.showDetailPicInBasket = true;

					if (headers[i].id == 'PROPS')
						this.options.showPropsInBasket = true;

					if (headers[i].id == 'NOTES')
						this.options.showPriceNotesInBasket = true;
				}
			}

			if (this.result.TOTAL)
			{
				total = this.result.TOTAL;
				this.options.showOrderWeight = total.ORDER_WEIGHT && parseFloat(total.ORDER_WEIGHT) > 0;
				this.options.showPriceWithoutDiscount = parseFloat(total.ORDER_PRICE) < parseFloat(total.PRICE_WITHOUT_DISCOUNT_VALUE);
				this.options.showDiscountPrice = total.DISCOUNT_PRICE && parseFloat(total.DISCOUNT_PRICE) > 0;
				this.options.showTaxList = total.TAX_LIST && total.TAX_LIST.length;
				this.options.showPayedFromInnerBudget = total.PAYED_FROM_ACCOUNT_FORMATED && total.PAYED_FROM_ACCOUNT_FORMATED.length;
			}
		},

		reachGoal: function(goal, section)
		{
			var counter = this.params.YM_GOALS_COUNTER || '',
				useGoals = this.params.USE_YM_GOALS == 'Y' && typeof window['yaCounter' + counter] !== 'undefined',
				goalId;

			if (useGoals)
			{
				goalId = this.getGoalId(goal, section);
				window['yaCounter' + counter].reachGoal(goalId);
			}
		},

		getGoalId: function(goal, section)
		{
			if (!goal)
				return '';

			if (goal == 'initialization')
				return this.params.YM_GOALS_INITIALIZE;

			if (goal == 'order')
				return this.params.YM_GOALS_SAVE_ORDER;

			var goalId = '',
				isEdit = goal == 'edit';

			if (!section || !section.id)
				return '';

			switch (section.id)
			{
				case this.basketBlockNode.id:
					goalId = isEdit ? this.params.YM_GOALS_EDIT_BASKET : this.params.YM_GOALS_NEXT_BASKET; break;
				case this.regionBlockNode.id:
					goalId = isEdit ? this.params.YM_GOALS_EDIT_REGION : this.params.YM_GOALS_NEXT_REGION; break;
				case this.paySystemBlockNode.id:
					goalId = isEdit ? this.params.YM_GOALS_EDIT_PAY_SYSTEM : this.params.YM_GOALS_NEXT_PAY_SYSTEM; break;
				case this.deliveryBlockNode.id:
					goalId = isEdit ? this.params.YM_GOALS_EDIT_DELIVERY : this.params.YM_GOALS_NEXT_DELIVERY; break;
				case this.pickUpBlockNode.id:
					goalId = isEdit ? this.params.YM_GOALS_EDIT_PICKUP : this.params.YM_GOALS_NEXT_PICKUP; break;
				case this.propsBlockNode.id:
					goalId = isEdit ? this.params.YM_GOALS_EDIT_PROPERTIES : this.params.YM_GOALS_NEXT_PROPERTIES; break;
			}

			return goalId;
		},

		isPriceChanged: function(result)
		{
			var priceBefore = this.result.TOTAL.ORDER_TOTAL_LEFT_TO_PAY === null || this.result.TOTAL.ORDER_TOTAL_LEFT_TO_PAY === ''
					? this.result.TOTAL.ORDER_TOTAL_PRICE
					: this.result.TOTAL.ORDER_TOTAL_LEFT_TO_PAY,
				priceAfter = result.order.TOTAL.ORDER_TOTAL_LEFT_TO_PAY === null ? result.order.TOTAL.ORDER_TOTAL_PRICE : result.order.TOTAL.ORDER_TOTAL_LEFT_TO_PAY;

			this.options.totalPriceChanged = parseFloat(priceBefore) != parseFloat(priceAfter);
		},

		initValidation: function()
		{
			if (!this.result.ORDER_PROP || !this.result.ORDER_PROP.properties)
				return;

			var properties = this.result.ORDER_PROP.properties,
				obj = {}, i;

			for (i in properties)
			{
				if (properties.hasOwnProperty(i))
					obj[properties[i].ID] = properties[i];
			}

			this.validation.properties = obj;
		},

		initPagination: function()
		{
			var arReserve, pages, arPages, i;

			if (this.result.DELIVERY)
			{
				this.result.DELIVERY = this.getDeliverySortedArray(this.result.DELIVERY);

				if (this.options.deliveriesPerPage > 0 && this.result.DELIVERY.length > this.options.deliveriesPerPage)
				{
					arReserve = this.result.DELIVERY.slice();
					pages = Math.ceil(arReserve.length / this.options.deliveriesPerPage);
					arPages = [];

					for (i = 0; i < pages; i++)
					{
						arPages.push(arReserve.splice(0, this.options.deliveriesPerPage));
					}
					this.deliveryPagination.pages = arPages;

					for (i = 0; i < this.result.DELIVERY.length; i++)
					{
						if (this.result.DELIVERY[i].CHECKED == 'Y')
						{
							this.deliveryPagination.pageNumber = Math.ceil(++i / this.options.deliveriesPerPage);
							break;
						}
					}

					this.deliveryPagination.pageNumber = this.deliveryPagination.pageNumber || 1;
					this.deliveryPagination.currentPage = arPages.slice(this.deliveryPagination.pageNumber - 1, this.deliveryPagination.pageNumber)[0];
					this.deliveryPagination.show = true
				}
				else
				{
					this.deliveryPagination.pageNumber = 1;
					this.deliveryPagination.currentPage = this.result.DELIVERY;
					this.deliveryPagination.show = false;
				}
			}

			if (this.result.PAY_SYSTEM)
			{
				if (this.options.paySystemsPerPage > 0 && this.result.PAY_SYSTEM.length > this.options.paySystemsPerPage)
				{
					arReserve = this.result.PAY_SYSTEM.slice();
					pages = Math.ceil(arReserve.length / this.options.paySystemsPerPage);
					arPages = [];

					for (i = 0; i < pages; i++)
					{
						arPages.push(arReserve.splice(0, this.options.paySystemsPerPage));
					}
					this.paySystemPagination.pages = arPages;

					for (i = 0; i < this.result.PAY_SYSTEM.length; i++)
					{
						if (this.result.PAY_SYSTEM[i].CHECKED == 'Y')
						{
							this.paySystemPagination.pageNumber = Math.ceil(++i / this.options.paySystemsPerPage);
							break;
						}
					}

					this.paySystemPagination.pageNumber = this.paySystemPagination.pageNumber || 1;
					this.paySystemPagination.currentPage = arPages.slice(this.paySystemPagination.pageNumber - 1, this.paySystemPagination.pageNumber)[0];
					this.paySystemPagination.show = true
				}
				else
				{
					this.paySystemPagination.pageNumber = 1;
					this.paySystemPagination.currentPage = this.result.PAY_SYSTEM;
					this.paySystemPagination.show = false;
				}
			}
		},

		initPickUpPagination: function()
		{
			var usePickUpPagination = false,
				usePickUp = false,
				stores, i = 0,
				arReserve, pages, arPages;

			if (this.options.pickUpsPerPage >= 0 && this.result.DELIVERY)
			{
				for (i = 0; i < this.result.DELIVERY.length; i++)
				{
					if (this.result.DELIVERY[i].CHECKED === 'Y' && this.result.DELIVERY[i].STORE_MAIN)
					{
						usePickUp = this.result.DELIVERY[i].STORE_MAIN.length > 0;
						usePickUpPagination = this.result.DELIVERY[i].STORE_MAIN.length > this.options.pickUpsPerPage;
						if (usePickUp)
							stores = this.getPickUpInfoArray(this.result.DELIVERY[i].STORE_MAIN);
						break;
					}
				}
			}

			if (usePickUp)
			{
				if (this.options.pickUpsPerPage > 0 && usePickUpPagination)
				{
					arReserve = stores.slice();
					pages = Math.ceil(arReserve.length / this.options.pickUpsPerPage);
					arPages = [];

					for (i = 0; i < pages; i++)
						arPages.push(arReserve.splice(0, this.options.pickUpsPerPage));

					this.pickUpPagination.pages = arPages;

					for (i = 0; i < stores.length; i++)
					{
						if (!this.result.BUYER_STORE || stores[i].ID == this.result.BUYER_STORE)
						{
							this.pickUpPagination.pageNumber = Math.ceil(++i / this.options.pickUpsPerPage);
							break;
						}
					}

					if (!this.pickUpPagination.pageNumber)
						this.pickUpPagination.pageNumber = 1;

					this.pickUpPagination.currentPage = arPages.slice(this.pickUpPagination.pageNumber - 1, this.pickUpPagination.pageNumber)[0];
					this.pickUpPagination.show = true
				}
				else
				{
					this.pickUpPagination.pageNumber = 1;
					this.pickUpPagination.currentPage = stores;
					this.pickUpPagination.show = false;
				}
			}
		},

		prepareLocations: function(locations)
		{
			this.locations = {};
			this.cleanLocations = {};

			var temporaryLocations,
				i, k, output;

			if (BX.util.object_keys(locations).length)
			{
				for (i in locations)
				{
					if (!locations.hasOwnProperty(i))
						continue;

					this.locationsTemplate = locations[i].template || '';
					temporaryLocations = [];
					output = locations[i].output;

					if (output.clean)
					{
						this.cleanLocations[i] = BX.processHTML(output.clean, false);
						delete output.clean;
					}

					for (k in output)
					{
						if (output.hasOwnProperty(k))
						{
							temporaryLocations.push({
								output: BX.processHTML(output[k], false),
								showAlt: locations[i].showAlt,
								lastValue: locations[i].lastValue,
								coordinates: locations[i].coordinates || false
							});
						}
					}

					this.locations[i] = temporaryLocations;
				}
			}
		},

		locationsCompletion: function()
		{
			var i, locationNode, clearButton, inputStep, inputSearch,
				arProperty, data, section;

			this.locationsInitialized = true;
			this.fixLocationsStyle(this.regionBlockNode, this.regionHiddenBlockNode);
			this.fixLocationsStyle(this.propsBlockNode, this.propsHiddenBlockNode);

			for (i in this.locations)
			{
				if (!this.locations.hasOwnProperty(i))
					continue;

				locationNode = this.orderBlockNode.querySelector('div[data-property-id-row="' + i + '"]');
				if (!locationNode)
					continue;

				clearButton = locationNode.querySelector('div.bx-ui-sls-clear');
				inputStep = locationNode.querySelector('div.bx-ui-slst-pool');
				inputSearch = locationNode.querySelector('input.bx-ui-sls-fake[type=text]');

				locationNode.removeAttribute('style');
				this.bindValidation(i, locationNode);
				if (clearButton)
				{
					BX.bind(clearButton, 'click', function(e){
						var target = e.target || e.srcElement,
							parent = BX.findParent(target, {tagName: 'DIV', className: 'form-group'}),
							locationInput;

						if (parent)
							locationInput = parent.querySelector('input.bx-ui-sls-fake[type=text]');

						if (locationInput)
							BX.fireEvent(locationInput, 'keyup');
					});
				}

				if (!this.firstLoad && this.options.propertyValidation)
				{
					if (inputStep)
					{
						arProperty = this.validation.properties[i];
						data = this.getValidationData(arProperty, locationNode);
						section = BX.findParent(locationNode, {className: 'bx-soa-section'});

						if (section && section.getAttribute('data-visited') == 'true')
							this.isValidProperty(data);
					}

					if (inputSearch)
						BX.fireEvent(inputSearch, 'keyup');
				}
			}

			if (this.firstLoad && this.result.IS_AUTHORIZED && typeof this.result.LAST_ORDER_DATA.FAIL === 'undefined')
				this.showActualBlock();

			this.checkNotifications();

			if (this.activeSectionId !== this.regionBlockNode.id)
				this.editFadeRegionContent(this.regionBlockNode.querySelector('.bx-soa-section-content'));

			if (this.activeSectionId != this.propsBlockNode.id)
				this.editFadePropsContent(this.propsBlockNode.querySelector('.bx-soa-section-content'));
		},

		fixLocationsStyle: function(section, hiddenSection)
		{
			if (!section || !hiddenSection)
				return;

			var regionActive = this.activeSectionId == section.id ? section : hiddenSection,
				locationSearchInputs, locationStepInputs, i;

			locationSearchInputs = regionActive.querySelectorAll('div.bx-sls div.dropdown-block.bx-ui-sls-input-block');
			locationStepInputs = regionActive.querySelectorAll('div.bx-slst div.dropdown-block.bx-ui-slst-input-block');

			if (locationSearchInputs.length)
				for (i = 0; i < locationSearchInputs.length; i++)
					BX.addClass(locationSearchInputs[i], 'form-control');

			if (locationStepInputs.length)
				for (i = 0; i < locationStepInputs.length; i++)
					BX.addClass(locationStepInputs[i], 'form-control');
		},

		/**
		 * Order saving action with validation. Doesn't send request while have errors
		 */
		clickOrderSaveAction: function(event)
		{
			if (this.isValidForm())
			{
				this.allowOrderSave();

				if (this.params.USER_CONSENT === 'Y')
				{
					BX.onCustomEvent('bx-soa-order-save', []);
				}
				else
				{
					this.doSaveAction();
				}
			}

			return BX.PreventDefault(event);
		},

		doSaveAction: function()
		{
			if (this.isOrderSaveAllowed())
			{
				this.reachGoal('order');
				this.sendRequest('saveOrderAjax');
			}
		},

		/**
		 * Hiding current block node and showing next available block node
		 */
		clickNextAction: function(event)
		{
			var target = event.target || event.srcElement,
				actionSection = BX.findParent(target, {className : "bx-active"}),
				section = this.getNextSection(actionSection),
				allSections, titleNode, editStep;

			this.reachGoal('next', actionSection);

			if (
				(!this.result.IS_AUTHORIZED || typeof this.result.LAST_ORDER_DATA.FAIL !== 'undefined')
				&& section.next.getAttribute('data-visited') == 'false'
			)
			{
				titleNode = section.next.querySelector('.bx-soa-section-title-container');
				BX.bind(titleNode, 'click', BX.proxy(this.showByClick, this));
				editStep = section.next.querySelector('.bx-soa-editstep');
				if (editStep)
					editStep.style.display = '';

				allSections = this.orderBlockNode.querySelectorAll('.bx-soa-section.bx-active');
				if (section.next.id == allSections[allSections.length - 1].id)
					this.switchOrderSaveButtons(true);
			}

			this.fade(actionSection, section.next);
			this.show(section.next);

			return BX.PreventDefault(event);
		},

		/**
		 * Hiding current block node and showing previous available block node
		 */
		clickPrevAction: function(event)
		{
			var target = event.target || event.srcElement,
				actionSection = BX.findParent(target, {className: "bx-active"}),
				section = this.getPrevSection(actionSection);

			this.fade(actionSection);
			this.show(section.next);
			this.animateScrollTo(section.next, 500);
			return BX.PreventDefault(event);
		},

		/**
		 * Showing authentication block node
		 */
		showAuthBlock: function()
		{
			var showNode = this.authBlockNode,
				fadeNode = BX(this.activeSectionId);

			if (!showNode || BX.hasClass(showNode, 'bx-selected'))
				return;

			fadeNode && this.fade(fadeNode);
			this.show(showNode);
		},

		/**
		 * Hiding authentication block node
		 */
		closeAuthBlock: function()
		{
			var actionSection = this.authBlockNode,
				nextSection = this.getNextSection(actionSection).next;

			this.fade(actionSection);
			BX.cleanNode(BX(nextSection.id + '-hidden'));
			this.show(nextSection);
		},

		/**
		 * Checks possibility to skip section
		 */
		shouldSkipSection: function(section)
		{
			var skip = false;

			if (this.params.SKIP_USELESS_BLOCK === 'Y')
			{
				if (section.id === this.pickUpBlockNode.id)
				{
					var delivery = this.getSelectedDelivery();
					if (delivery)
					{
						skip = this.getPickUpInfoArray(delivery.STORE).length === 1;
					}
				}

				if (section.id === this.deliveryBlockNode.id)
				{
					skip = this.result.DELIVERY && this.result.DELIVERY.length === 1
						&& this.result.DELIVERY[0].EXTRA_SERVICES.length === 0
						&& !this.result.DELIVERY[0].CALCULATE_ERRORS;
				}

				if (section.id === this.paySystemBlockNode.id)
				{
					skip = this.result.PAY_SYSTEM && this.result.PAY_SYSTEM.length === 1 && this.result.PAY_FROM_ACCOUNT !== 'Y';
				}
			}
			
			return skip;
		},

		/**
		 * Returns next available block node (node skipped while have one pay system, delivery or pick up)
		 */
		getNextSection: function(actionSection, skippedSection)
		{
			if (!this.orderBlockNode || !actionSection)
				return {};

			var allSections = this.orderBlockNode.querySelectorAll('.bx-soa-section.bx-active'),
				nextSection, i;

			for (i = 0; i < allSections.length; i++)
			{
				if (allSections[i].id === actionSection.id && allSections[i + 1])
				{
					nextSection = allSections[i + 1];

					if (this.shouldSkipSection(nextSection))
					{
						this.markSectionAsCompleted(nextSection);

						return this.getNextSection(nextSection, nextSection);
					}

					return {
						prev: actionSection,
						next: nextSection,
						skip: skippedSection
					};
				}
			}

			return {next: actionSection};
		},

		markSectionAsCompleted: function(section)
		{
			var titleNode;

			if (
				(!this.result.IS_AUTHORIZED || typeof this.result.LAST_ORDER_DATA.FAIL !== 'undefined')
				&& section.getAttribute('data-visited') === 'false'
			)
			{
				this.changeVisibleSection(section, true);
				titleNode = section.querySelector('.bx-soa-section-title-container');
				BX.bind(titleNode, 'click', BX.proxy(this.showByClick, this));
			}

			section.setAttribute('data-visited', 'true');
			BX.addClass(section, 'bx-step-completed');
			BX.remove(section.querySelector('.alert.alert-warning.alert-hide'));
			this.checkBlockErrors(section);
		},

		/**
		 * Returns previous available block node (node skipped while have one pay system, delivery or pick up)
		 */
		getPrevSection: function(actionSection)
		{
			if (!this.orderBlockNode || !actionSection)
				return {};

			var allSections = this.orderBlockNode.querySelectorAll('.bx-soa-section.bx-active'),
				prevSection, i;

			for (i = 0; i < allSections.length; i++)
			{
				if (allSections[i].id === actionSection.id && allSections[i - 1])
				{
					prevSection = allSections[i - 1];

					if (this.shouldSkipSection(prevSection))
					{
						this.markSectionAsCompleted(prevSection);

						return this.getPrevSection(prevSection);
					}

					return {
						prev: actionSection,
						next: prevSection
					};
				}
			}

			return {next: actionSection};
		},

		addAnimationEffect: function(node, className, timeout)
		{
			if (!node || !className)
				return;

			if (this.timeOut[node.id])
			{
				clearTimeout(this.timeOut[node.id].timer);
				BX.removeClass(node, this.timeOut[node.id].className);
			}

			setTimeout(function(){BX.addClass(node, className)}, 10);
			this.timeOut[node.id] = {
				className: className,
				timer: setTimeout(
					BX.delegate(function(){
						BX.removeClass(node, className);
						delete this.timeOut[node.id];
					}, this),
					timeout || 5000)
			};
		},

		/**
		 * Replacing current active block node with generated fade block node
		 */
		fade: function(node, nextSection)
		{
			if (!node || !node.id || this.activeSectionId != node.id)
				return;

			this.hasErrorSection[node.id] = false;

			var objHeightOrig = node.offsetHeight,
				objHeight;

			switch (node.id)
			{
				case this.authBlockNode.id:
					this.authBlockNode.style.display = 'none';
					BX.removeClass(this.authBlockNode, 'bx-active');
					break;
				case this.basketBlockNode.id:
					this.editFadeBasketBlock();
					break;
				case this.regionBlockNode.id:
					this.editFadeRegionBlock();
					break;
				case this.paySystemBlockNode.id:
					BX.remove(this.paySystemBlockNode.querySelector('.alert.alert-warning.alert-hide'));
					this.editFadePaySystemBlock();
					break;
				case this.deliveryBlockNode.id:
					BX.remove(this.deliveryBlockNode.querySelector('.alert.alert-warning.alert-hide'));
					this.editFadeDeliveryBlock();
					break;
				case this.pickUpBlockNode.id:
					this.editFadePickUpBlock();
					break;
				case this.propsBlockNode.id:
					this.editFadePropsBlock();
					break;
			}

			BX.addClass(node, 'bx-step-completed');
			BX.removeClass(node, 'bx-selected');

			objHeight = node.offsetHeight;
			node.style.height = objHeightOrig + 'px';

			// calculations of scrolling animation
			if (nextSection)
			{
				var windowScrollTop = BX.GetWindowScrollPos().scrollTop,
					orderPos = BX.pos(this.orderBlockNode),
					nodePos = BX.pos(node),
					diff, scrollTo, nextSectionHeightBefore, nextSectionHeightAfter, nextSectionHidden, offset;

				nextSectionHidden = BX(nextSection.id + '-hidden');
				nextSectionHidden.style.left = '-10000';
				nextSectionHidden.style.position = 'absolute';
				this.orderBlockNode.appendChild(nextSectionHidden);
				nextSectionHeightBefore = nextSection.offsetHeight;
				nextSectionHeightAfter = nextSectionHidden.offsetHeight + 57;
				BX(node.id + '-hidden').parentNode.appendChild(nextSectionHidden);
				nextSectionHidden.removeAttribute('style');

				diff = objHeight + nextSectionHeightAfter - objHeightOrig - nextSectionHeightBefore;

				offset = window.innerHeight - orderPos.height - diff;
				if (offset > 0)
					scrollTo = orderPos.top - offset/2;
				else
				{
					if (nodePos.top > windowScrollTop)
						scrollTo = nodePos.top;
					else
						scrollTo = nodePos.bottom + 6 - objHeightOrig + objHeight;

					if (scrollTo + window.innerHeight > orderPos.bottom + 25 + diff)
						scrollTo = orderPos.bottom + 25 + diff - window.innerHeight;
				}

				scrollTo -= this.isMobile ? 50 : 0;
			}

			new BX.easing({
				duration: nextSection ? 1000 : 600,
				start: {height: objHeightOrig, scrollTop: windowScrollTop},
				finish: {height: objHeight, scrollTop: scrollTo},
				transition: BX.easing.makeEaseOut(BX.easing.transitions.quad),
				step: function(state){
					node.style.height = state.height + "px";
					if (nextSection)
						window.scrollTo(0, state.scrollTop);
				},
				complete: function(){
					node.style.height = '';
				}
			}).animate();

			this.checkBlockErrors(node);
		},

		/**
		 * Showing active data in certain block node
		 */
		show: function(node)
		{
			if (!node || !node.id || this.activeSectionId == node.id)
				return;

			this.activeSectionId = node.id;
			BX.removeClass(node, 'bx-step-error bx-step-warning');

			switch (node.id)
			{
				case this.authBlockNode.id:
					this.authBlockNode.style.display = '';
					BX.addClass(this.authBlockNode, 'bx-active');
					break;
				case this.basketBlockNode.id:
					this.editActiveBasketBlock(true);
					this.alignBasketColumns();
					break;
				case this.regionBlockNode.id:
					this.editActiveRegionBlock(true);
					break;
				case this.deliveryBlockNode.id:
					this.editActiveDeliveryBlock(true);
					break;
				case this.paySystemBlockNode.id:
					this.editActivePaySystemBlock(true);
					break;
				case this.pickUpBlockNode.id:
					this.editActivePickUpBlock(true);
					break;
				case this.propsBlockNode.id:
					this.editActivePropsBlock(true);
					break;
			}

			if (node.getAttribute('data-visited') === 'false')
			{
				this.showBlockErrors(node);
				this.notifyAboutWarnings(node);
			}

			node.setAttribute('data-visited', 'true');
			BX.addClass(node, 'bx-selected');
			BX.removeClass(node, 'bx-step-completed');
		},

		showByClick: function(event)
		{
			var target = event.target || event.srcElement,
				showNode = BX.findParent(target, {className: "bx-active"}),
				fadeNode = BX(this.activeSectionId),
				scrollTop = BX.GetWindowScrollPos().scrollTop;

			if (!showNode || BX.hasClass(showNode, 'bx-selected'))
				return BX.PreventDefault(event);

			this.reachGoal('edit', showNode);

			fadeNode && this.fade(fadeNode);
			this.show(showNode);

			setTimeout(BX.delegate(function(){
				if (BX.pos(showNode).top < scrollTop)
					this.animateScrollTo(showNode, 300);
			}, this), 320);

			return BX.PreventDefault(event);
		},

		/**
		 * Checks each active block from top to bottom for errors (showing first block with errors or last block)
		 */
		showActualBlock: function()
		{
			var allSections = this.orderBlockNode.querySelectorAll('.bx-soa-section.bx-active'),
				i = 0;

			while (allSections[i])
			{
				if (allSections[i].id == this.regionBlockNode.id)
					this.isValidRegionBlock();

				if (allSections[i].id == this.propsBlockNode.id)
					this.isValidPropertiesBlock();

				if (!this.checkBlockErrors(allSections[i]) || !this.checkPreload(allSections[i]))
				{
					this.show(allSections[i]);
					break;
				}

				BX.addClass(allSections[i], 'bx-step-completed');
				allSections[i].setAttribute('data-visited', 'true');
				i++;
			}
		},

		/**
		 * Returns footer node with navigation buttons
		 */
		getBlockFooter: function(node)
		{
			var sections = this.orderBlockNode.querySelectorAll('.bx-soa-section.bx-active'),
				firstSection = sections[0],
				lastSection = sections[sections.length - 1],
				currentSection = BX.findParent(node, {className: "bx-soa-section"}),
				isLastNode = false,
				buttons = [];

			if (currentSection && currentSection.id.indexOf(firstSection.id) == '-1')
			{
				buttons.push(
					BX.create('A', {
						props: {
							href: 'javascript:void(0)',
							className: 'pull-left btn btn-default btn-md'
						},
						html: this.params.MESS_BACK,
						events: {
							click: BX.proxy(this.clickPrevAction, this)
						}
					})
				);
			}

			if (currentSection && currentSection.id.indexOf(lastSection.id) != '-1')
				isLastNode = true;

			if (!isLastNode)
			{
				buttons.push(
					BX.create('A', {
						props: {href: 'javascript:void(0)', className: 'pull-right btn btn-default btn-md'},
						html: this.params.MESS_FURTHER,
						events: {click: BX.proxy(this.clickNextAction, this)}
					})
				);
			}

			node.appendChild(
				BX.create('DIV', {
					props: {className: 'row bx-soa-more'},
					children: [
						BX.create('DIV', {
							props: {className: 'bx-soa-more-btn col-xs-12'},
							children: buttons
						})
					]
				})
			);
		},

		getNewContainer: function(notFluid)
		{
			return BX.create('DIV', {props: {className: 'bx-soa-section-content' + (!!notFluid ? '' : ' container-fluid')}});
		},

		/**
		 * Showing/hiding order save buttons
		 */
		switchOrderSaveButtons: function(state)
		{
			var orderSaveNode = this.orderSaveBlockNode,
				totalButton = this.totalBlockNode.querySelector('.bx-soa-cart-total-button-container'),
				mobileButton = this.mobileTotalBlockNode.querySelector('.bx-soa-cart-total-button-container'),
				lastState = this.orderSaveBlockNode.style.display == '';

			if (lastState != state)
			{
				if (state)
				{
					orderSaveNode.style.opacity = 0;
					orderSaveNode.style.display = '';
					if (totalButton)
					{
						totalButton.style.opacity = 0;
						totalButton.style.display = '';
					}
					if (mobileButton)
					{
						mobileButton.style.opacity = 0;
						mobileButton.style.display = '';
					}

					new BX.easing({
						duration: 500,
						start: {opacity: 0},
						finish: {opacity: 100},
						transition: BX.easing.transitions.linear,
						step: function(state){
							orderSaveNode.style.opacity = state.opacity / 100;
							if (totalButton)
								totalButton.style.opacity = state.opacity / 100;
							if (mobileButton)
								mobileButton.style.opacity = state.opacity / 100;
						},
						complete: function(){
							orderSaveNode.removeAttribute('style');
							totalButton && totalButton.removeAttribute('style');
							mobileButton && mobileButton.removeAttribute('style');
						}
					}).animate();
				}
				else
				{
					orderSaveNode.style.display = 'none';
					if (totalButton)
						totalButton.setAttribute('style', 'display: none !important');
					if (mobileButton)
						mobileButton.setAttribute('style', 'display: none !important');
				}
			}
		},

		/**
		 * Returns true if current section or next sections had already visited
		 */
		shouldBeSectionVisible: function(sections, currentPosition)
		{
			var state = false, editStepNode;

			if (!sections || !sections.length)
				return state;

			for (; currentPosition < sections.length; currentPosition++)
			{
				if (sections[currentPosition].getAttribute('data-visited') == 'true')
				{
					state = true;
					break;
				}

				if (!this.firstLoad)
				{
					editStepNode = sections[currentPosition].querySelector('.bx-soa-editstep');
					if (editStepNode && editStepNode.style.display !== 'none')
					{
						state = true;
						break;
					}
				}
			}

			return state;
		},

		/**
		 * Showing/hiding blocks content if user authorized/unauthorized
		 */
		changeVisibleContent: function()
		{
			var sections = this.orderBlockNode.querySelectorAll('.bx-soa-section[data-visited]'),
				i, state;

			var orderDataLoaded = !!this.result.IS_AUTHORIZED && this.params.USE_PRELOAD === 'Y' && this.result.LAST_ORDER_DATA.FAIL !== true,
				skipFlag = true;

			for (i = 0; i < sections.length; i++)
			{
				state = this.firstLoad && orderDataLoaded;
				state = state || this.shouldBeSectionVisible(sections, i);

				this.changeVisibleSection(sections[i], state);

				if (this.firstLoad && skipFlag)
				{
					if (
						state
						&& sections[i + 1]
						&& this.checkBlockErrors(sections[i])
						&& (
							(orderDataLoaded && this.checkPreload(sections[i]))
							|| (!orderDataLoaded && this.shouldSkipSection(sections[i]))
						)
					)
					{
						this.fade(sections[i]);
						this.markSectionAsCompleted(sections[i]);
						this.show(sections[i + 1]);
					}
					else
					{
						skipFlag = false;
					}
				}
			}

			if (
				(!this.result.IS_AUTHORIZED || typeof this.result.LAST_ORDER_DATA.FAIL !== 'undefined')
				&& this.params.SHOW_ORDER_BUTTON === 'final_step'
			)
			{
				this.switchOrderSaveButtons(this.shouldBeSectionVisible(sections, sections.length - 1));
			}
		},

		changeVisibleSection: function(section, state)
		{
			var titleNode, content, editStep;

			if (section.id !== this.basketBlockNode.id)
			{
				content = section.querySelector('.bx-soa-section-content');
				if (content)
					content.style.display = state ? '' : 'none';
			}

			editStep = section.querySelector('.bx-soa-editstep');
			if (editStep)
				editStep.style.display = state ? '' : 'none';

			titleNode = section.querySelector('.bx-soa-section-title-container');
			if (titleNode && !state)
				BX.unbindAll(titleNode);
		},

		/**
		 * Edit order block nodes with this.result/this.params data
		 */
		editOrder: function()
		{
			if (!this.orderBlockNode || !this.result)
				return;

			if (this.result.DELIVERY.length > 0)
			{
				BX.addClass(this.deliveryBlockNode, 'bx-active');
				this.deliveryBlockNode.removeAttribute('style');
			}
			else
			{
				BX.removeClass(this.deliveryBlockNode, 'bx-active');
				this.deliveryBlockNode.style.display = 'none';
			}

			this.orderSaveBlockNode.style.display = this.result.SHOW_AUTH ? 'none' : '';
			this.mobileTotalBlockNode.style.display = this.result.SHOW_AUTH ? 'none' : '';

			this.checkPickUpShow();

			var sections = this.orderBlockNode.querySelectorAll('.bx-soa-section.bx-active'), i;
			for (i in sections)
			{
				if (sections.hasOwnProperty(i))
				{
					this.editSection(sections[i]);
				}
			}

			this.editTotalBlock();
			this.totalBlockFixFont();

			if (!this.result.SHOW_AUTH)
			{
				this.changeVisibleContent();
			}

			this.showErrors(this.result.ERROR, false);
			this.showWarnings();
		},

		/**
		 * Edit certain block node
		 */
		editSection: function(section)
		{
			if (!section || !section.id)
				return;

			if (this.result.SHOW_AUTH && section.id != this.authBlockNode.id && section.id != this.basketBlockNode.id)
				section.style.display = 'none';
			else if (section.id != this.pickUpBlockNode.id)
				section.style.display = '';

			var active = section.id == this.activeSectionId,
				titleNode = section.querySelector('.bx-soa-section-title-container'),
				editButton, errorContainer;

			BX.unbindAll(titleNode);
			if (this.result.SHOW_AUTH)
			{
				BX.bind(titleNode, 'click', BX.delegate(function(){
					this.animateScrollTo(this.authBlockNode);
					this.addAnimationEffect(this.authBlockNode, 'bx-step-good');
				}, this));
			}
			else
			{
				BX.bind(titleNode, 'click', BX.proxy(this.showByClick, this));
				editButton = titleNode.querySelector('.bx-soa-editstep');
				editButton && BX.bind(editButton, 'click', BX.proxy(this.showByClick, this));
			}

			errorContainer = section.querySelector('.alert.alert-danger');
			this.hasErrorSection[section.id] = errorContainer && errorContainer.style.display != 'none';

			switch (section.id)
			{
				case this.authBlockNode.id:
					this.editAuthBlock();
					break;
				case this.basketBlockNode.id:
					this.editBasketBlock(active);
					break;
				case this.regionBlockNode.id:
					this.editRegionBlock(active);
					break;
				case this.paySystemBlockNode.id:
					this.editPaySystemBlock(active);
					break;
				case this.deliveryBlockNode.id:
					this.editDeliveryBlock(active);
					break;
				case this.pickUpBlockNode.id:
					this.editPickUpBlock(active);
					break;
				case this.propsBlockNode.id:
					this.editPropsBlock(active);
					break;
			}

			if (active)
				section.setAttribute('data-visited', 'true');
		},

		editAuthBlock: function()
		{
			if (!this.authBlockNode)
				return;

			var authContent = this.authBlockNode.querySelector('.bx-soa-section-content'),
				regContent, okMessageNode;

			if (BX.hasClass(authContent, 'reg'))
			{
				regContent = authContent;
				authContent = BX.firstChild(this.authHiddenBlockNode);
			}
			else
				regContent = BX.firstChild(this.authHiddenBlockNode);

			BX.cleanNode(authContent);
			BX.cleanNode(regContent);

			if (this.result.SHOW_AUTH)
			{
				this.getErrorContainer(authContent);
				this.editAuthorizeForm(authContent);
				this.editSocialContent(authContent);
				this.getAuthReference(authContent);

				this.getErrorContainer(regContent);
				this.editRegistrationForm(regContent);
				this.getAuthReference(regContent);
			}
			else
			{
				BX.onCustomEvent('OnBasketChange');
				this.closeAuthBlock();
			}

			if (this.result.OK_MESSAGE && this.result.OK_MESSAGE.length)
			{
				this.toggleAuthForm({target: this.authBlockNode.querySelector('input[type=submit]')});
				okMessageNode = BX.create('DIV', {
					props: {className: 'alert alert-success'},
					text: this.result.OK_MESSAGE.join()
				});
				this.result.OK_MESSAGE = '';
				BX.prepend(okMessageNode, this.authBlockNode.querySelector('.bx-soa-section-content'));
			}
		},

		editAuthorizeForm: function(authContent)
		{
			var login, password, remember, button, authFormNode;

			login = this.createAuthFormInputContainer(
				BX.message('STOF_LOGIN'),
				BX.create('INPUT', {
					attrs: {'data-next': 'USER_PASSWORD'},
					props: {
						name: 'USER_LOGIN',
						type: 'text',
						value: this.result.AUTH.USER_LOGIN,
						maxlength: "30"
					},
					events: {keypress: BX.proxy(this.checkKeyPress, this)}
				})
			);
			password = this.createAuthFormInputContainer(
				BX.message('STOF_PASSWORD'),
				BX.create('INPUT', {
					attrs: {'data-send': true},
					props: {
						name: 'USER_PASSWORD',
						type: 'password',
						value: '',
						maxlength: "30"
					},
					events: {keypress: BX.proxy(this.checkKeyPress, this)}
				})
			);
			remember = BX.create('DIV', {
				props: {className: 'bx-authform-formgroup-container'},
				children: [
					BX.create('DIV', {
						props: {className: 'checkbox user-agree-checkbox'},
						children: [
							BX.create('LABEL', {
								props: {className: 'bx-filter-param-label'},
								children: [
									BX.create('INPUT', {
										props: {
											type: 'checkbox',
											name: 'USER_REMEMBER',
											value: 'Y'
										}
									}),
									BX.create('SPAN', {props: {className: 'bx-filter-param-text'}, text: BX.message('STOF_REMEMBER')})
								]
							})
						]
					})
				]
			});
			button = BX.create('DIV', {
				props: {className: 'bx-authform-formgroup-container'},
				children: [
					BX.create('INPUT', {
						props: {
							id: 'do_authorize',
							type: 'hidden',
							name: 'do_authorize',
							value: 'N'
						}
					}),
					BX.create('INPUT', {
						props: {
							type: 'submit',
							className: 'btn btn-lg btn-default',
							value: BX.message('STOF_ENTER')
						},
						events: {
							click: BX.delegate(function(e){
								BX('do_authorize').value = 'Y';
								this.sendRequest('showAuthForm');
								return BX.PreventDefault(e);
							}, this)
						}
					})
				]
			});
			authFormNode = BX.create('DIV', {
				props: {className: 'bx-authform'},
				children: [
					BX.create('H3', {props: {className: 'bx-title'}, text: BX.message('STOF_AUTH_REQUEST')}),
					login,
					password,
					remember,
					button,
					BX.create('A', {
						props: {
							href: this.params.PATH_TO_AUTH + '?forgot_password=yes&back_url=' + encodeURIComponent(document.location.href)
						},
						text: BX.message('STOF_FORGET_PASSWORD')
					})
				]
			});

			authContent.appendChild(BX.create('DIV', {props: {className: 'col-md-6'}, children: [authFormNode]}));
		},

		createAuthFormInputContainer: function(labelText, inputNode, required)
		{
			var labelHtml = '';
            labelHtml += labelText;
			if (required)
				labelHtml += '<span class="bx-authform-starrequired">*</span>';
			return BX.create('DIV', {
				props: {className: 'bx-authform-formgroup-container'},
				children: [
					BX.create('DIV', {props: {className: 'bx-authform-label-container'}, html: labelHtml}),
					BX.create('DIV', {props: {className: 'bx-authform-input-container'},  children: [inputNode]})
				]
			});
		},

		editRegistrationForm: function(authContent)
		{
			if (!this.result.AUTH)
				return;

			var authFormNodes = [];

			authFormNodes.push(BX.create('H3', {
				props: {className: 'bx-title'},
				text: BX.message('STOF_REG_REQUEST')
			}));
			authFormNodes.push(this.createAuthFormInputContainer(
				BX.message('STOF_NAME'),
				BX.create('INPUT', {
					attrs: {'data-next': 'NEW_LAST_NAME'},
					props: {
						name: 'NEW_NAME',
						type: 'text',
						size: 40,
						value: this.result.AUTH.NEW_NAME || ''
					},
					events: {keypress: BX.proxy(this.checkKeyPress, this)}
				}),
				true
			));
			authFormNodes.push(this.createAuthFormInputContainer(
				BX.message('STOF_LASTNAME'),
				BX.create('INPUT', {
					attrs: {'data-next': 'NEW_EMAIL'},
					props: {
						name: 'NEW_LAST_NAME',
						type: 'text',
						size: 40,
						value: this.result.AUTH.NEW_LAST_NAME || ''
					},
					events: {keypress: BX.proxy(this.checkKeyPress, this)}
				}),
				true
			));
			authFormNodes.push(this.createAuthFormInputContainer(
				BX.message('STOF_EMAIL'),
				BX.create('INPUT', {
					attrs: {'data-next': 'captcha_word'},
					props: {
						name: 'NEW_EMAIL',
						type: 'text',
						size: 40,
						value: this.result.AUTH.NEW_EMAIL || ''
					},
					events: {keypress: BX.proxy(this.checkKeyPress, this)}
				}),
				this.result.AUTH.new_user_email_required == 'Y'
			));

			if (this.result.AUTH.new_user_registration_email_confirmation != 'Y')
			{
				authFormNodes.push(
					BX.create('LABEL', {
						props: {for: 'NEW_GENERATE_N'},
						children: [
							BX.create('INPUT', {
								attrs: {checked: !this.authGenerateUser},
								props: {
									id: 'NEW_GENERATE_N',
									type: 'radio',
									name: 'NEW_GENERATE',
									value: 'N'
								}
							}),
							BX.message('STOF_MY_PASSWORD')
						],
						events: {
							change: BX.delegate(function(){
								var generated = this.authBlockNode.querySelector('.generated');
								generated.style.display = '';
								this.authGenerateUser = false;
							}, this)
						}
					})
				);
				authFormNodes.push(BX.create('BR'));
				authFormNodes.push(
					BX.create('LABEL', {
						props: {for: 'NEW_GENERATE_Y'},
						children: [
							BX.create('INPUT', {
								attrs: {checked: this.authGenerateUser},
								props: {
									id: 'NEW_GENERATE_Y',
									type: 'radio',
									name: 'NEW_GENERATE',
									value: 'Y'
								}
							}),
							BX.message('STOF_SYS_PASSWORD')
						],
						events: {
							change: BX.delegate(function(){
								var generated = this.authBlockNode.querySelector('.generated');
								generated.style.display = 'none';
								this.authGenerateUser = true;
							}, this)
						}
					})
				);
			}

			authFormNodes.push(
				BX.create('DIV', {
					props: {className: 'generated'},
					style: {display: this.authGenerateUser ? 'none' : ''},
					children: [
						this.createAuthFormInputContainer(
							BX.message('STOF_LOGIN'),
							BX.create('INPUT', {
								props: {
									name: 'NEW_LOGIN',
									type: 'text',
									size: 30,
									value: this.result.AUTH.NEW_LOGIN || ''
								},
								events: {
									keypress: BX.proxy(this.checkKeyPress, this)
								}
							}),
							true
						),
						this.createAuthFormInputContainer(
							BX.message('STOF_PASSWORD'),
							BX.create('INPUT', {
								props: {
									name: 'NEW_PASSWORD',
									type: 'password',
									size: 30
								},
								events: {
									keypress: BX.proxy(this.checkKeyPress, this)
								}
							}),
							true
						),
						this.createAuthFormInputContainer(
							BX.message('STOF_RE_PASSWORD'),
							BX.create('INPUT', {
								props: {
									name: 'NEW_PASSWORD_CONFIRM',
									type: 'password',
									size: 30
								},
								events: {
									keypress: BX.proxy(this.checkKeyPress, this)
								}
							}),
							true
						)
					]
				})
			);
			if (this.result.AUTH.captcha_registration == 'Y')
			{
				authFormNodes.push(BX.create('DIV', {
					props: {className: 'bx-authform-formgroup-container'},
					children: [
						BX.create('DIV', {
							props: {className: 'bx-authform-label-container'},
							children: [
								BX.create('SPAN', {props: {className: 'bx-authform-starrequired'}, text: '*'}),
								BX.message('CAPTCHA_REGF_PROMT'),
								BX.create('DIV', {
									props: {className: 'bx-captcha'},
									children: [
										BX.create('INPUT', {
											props: {
												name: 'captcha_sid',
												type: 'hidden',
												value: this.result.AUTH.capCode || ''
											}
										}),
										BX.create('IMG', {
											props: {
												src: '/bitrix/tools/captcha.php?captcha_sid=' + this.result.AUTH.capCode,
												alt: ''
											}
										})
									]
								})
							]
						}),
						BX.create('DIV', {
							props: {className: 'bx-authform-input-container'},
							children: [
								BX.create('INPUT', {
									attrs: {'data-send': true},
									props: {
										name: 'captcha_word',
										type: 'text',
										size: '30',
										maxlength: '50',
										value: ''
									},
									events: {keypress: BX.proxy(this.checkKeyPress, this)}
								})
							]
						})
					]
				}));
			}
			authFormNodes.push(
				BX.create('DIV', {
					props: {className: 'bx-authform-formgroup-container'},
					children: [
						BX.create('INPUT', {
							props: {
								id: 'do_register',
								name: 'do_register',
								type: 'hidden',
								value: 'N'
							}
						}),
						BX.create('INPUT', {
							props: {
								type: 'submit',
								className: 'btn btn-lg btn-default',
								value: BX.message('STOF_REGISTER')
							},
							events: {
								click: BX.delegate(function(e){
									BX('do_register').value = 'Y';
									this.sendRequest('showAuthForm');
									return BX.PreventDefault(e);
								}, this)
							}
						}),
						BX.create('A', {
							props: {className: 'btn btn-auth-link', href: ''},
							text: BX.message('STOF_DO_AUTHORIZE'),
							events: {
								click: BX.delegate(function(e){
									this.toggleAuthForm(e);
									return BX.PreventDefault(e);
								}, this)
							}
						})
					]
				})
			);

			authContent.appendChild(
				BX.create('DIV', {
					props: {className: 'col-md-12'},
					children: [BX.create('DIV', {props: {className: 'bx-authform'}, children: authFormNodes})]
				})
			);
		},

		editSocialContent: function(authContent)
		{
			if (!BX('bx-soa-soc-auth-services'))
				return;

			var nodes = [],
				socServiceHiddenNode = BX('bx-soa-soc-auth-services').querySelector('.bx-authform-social');

			if (socServiceHiddenNode)
			{
				nodes.push(BX.create('DIV', {
						props: {className: 'bx-authform-social'},
						children: [
							BX.create('H3', {props: {className: 'bx-title'}, text: BX.message('SOA_DO_SOC_SERV')}),
							socServiceHiddenNode.cloneNode(true)
						]
					})
				);
				nodes.push(BX.create('hr', {props: {className: 'bxe-light'}}));
			}
			nodes.push(BX.create('DIV', {
				props: {className: 'bx-soa-reg-block'},
				children: [
					BX.create('P', {html: this.params.MESS_REGISTRATION_REFERENCE}),
					BX.create('A', {
						props: {className: 'btn btn-default btn-registration-link'},
						text: BX.message('STOF_DO_REGISTER'),
						events: {
							click: BX.delegate(function(e){
								this.toggleAuthForm(e);
								return BX.PreventDefault(e);
							}, this)
						}
					})
				]
			}));

			authContent.appendChild(BX.create('DIV', {props: {className: 'col-md-6'}, children: nodes}));
		},

		getAuthReference: function(authContent)
		{
			authContent.appendChild(
				BX.create('DIV', {
					props: {className: 'row'},
					children: [
						BX.create('DIV', {
							props: {className: 'bx-soa-reference col-xs-12'},
							children: [
								this.params.MESS_AUTH_REFERENCE_1,
								BX.create('BR'),
								this.params.MESS_AUTH_REFERENCE_2,
								BX.create('BR'),
								this.params.MESS_AUTH_REFERENCE_3
							]
						})
					]
				})
			);
		},

		toggleAuthForm: function(event)
		{
			if (!event)
				return;

			var target = event.target || event.srcElement,
				section = BX.findParent(target, {className: 'bx-soa-section'}),
				container = BX.findParent(target, {className: 'bx-soa-section-content'}),
				insertContainer = BX.firstChild(this.authHiddenBlockNode);

			new BX.easing({
				duration: 100,
				start: {opacity: 100},
				finish: {opacity: 0},
				transition: BX.easing.makeEaseOut(BX.easing.transitions.quad),
				step: function(state){
					container.style.opacity = state.opacity / 100;
				}
			}).animate();

			this.authHiddenBlockNode.appendChild(container);
			BX.cleanNode(section);
			section.appendChild(
				BX.create('DIV', {
					props: {className: 'bx-soa-section-title-container'},
					children: [
						BX.create('h2', {
							props: {className: 'bx-soa-section-title col-xs-7 col-sm-9'},
							html: BX.hasClass(insertContainer, 'reg') ? this.params.MESS_REG_BLOCK_NAME : this.params.MESS_AUTH_BLOCK_NAME
						})
					]
				})
			);
			insertContainer.style.opacity = 0;
			section.appendChild(insertContainer);

			setTimeout(function(){
				new BX.easing({
					duration: 100,
					start: {opacity: 0},
					finish: {opacity: 100},
					transition: BX.easing.makeEaseOut(BX.easing.transitions.quart),
					step: function(state){
						insertContainer.style.opacity = state.opacity / 100;
					},
					complete: function() {
						insertContainer.style.height = '';
						insertContainer.style.opacity = '';
					}
				}).animate();
			}, 110);

			this.animateScrollTo(section);
		},

		alignBasketColumns: function()
		{
			if (!this.basketBlockNode)
				return;

			var i = 0, k, columns = 0, columnNodes,
				windowSize = BX.GetWindowInnerSize(),
				basketRows, percent;

			if (windowSize.innerWidth > 580 && windowSize.innerWidth < 992)
			{
				basketRows = this.basketBlockNode.querySelectorAll('.bx-soa-basket-info');
				percent = 100;

				if (basketRows.length)
				{
					columnNodes = basketRows[0].querySelectorAll('.bx-soa-item-properties');

					if (columnNodes.length && columnNodes[0].style.width != '')
						return;

					columns = columnNodes.length;
					if (columns > 0)
					{
						columns = columns > 4 ? 4 : columns;
						percent = parseInt(percent / columns);
						for (; i < basketRows.length; i++)
						{
							columnNodes = basketRows[i].querySelectorAll('.bx-soa-item-properties')
							for (k = 0; k < columnNodes.length; k++)
							{
								columnNodes[k].style.width = percent + '%';
							}
						}
					}
				}
			}
			else
			{
				columnNodes = this.basketBlockNode.querySelectorAll('.bx-soa-item-properties');

				if (columnNodes.length && columnNodes[0].style.width == '')
					return;

				for (; i < columnNodes.length; i++)
				{
					columnNodes[i].style.width = '';
				}
			}
		},

		editBasketBlock: function(active)
		{
			if (!this.basketBlockNode || !this.basketHiddenBlockNode || !this.result.GRID)
				return;

			BX.remove(BX.lastChild(this.basketBlockNode));
			BX.remove(BX.lastChild(this.basketHiddenBlockNode));

			this.editActiveBasketBlock(active);
			this.editFadeBasketBlock(active);

			this.initialized.basket = true;
		},

		editActiveBasketBlock: function(activeNodeMode)
		{
			var node = !!activeNodeMode ? this.basketBlockNode : this.basketHiddenBlockNode,
				basketContent, basketTable;

			if (this.initialized.basket)
			{
				this.basketHiddenBlockNode.appendChild(BX.lastChild(node));
				node.appendChild(BX.firstChild(this.basketHiddenBlockNode));
			}
			else
			{
				basketContent = node.querySelector('.bx-soa-section-content');
				basketTable = BX.create('DIV', {props: {className: 'bx-soa-item-table'}});

				if (!basketContent)
				{
					basketContent = this.getNewContainer();
					node.appendChild(basketContent);
				}
				else
					BX.cleanNode(basketContent);

				this.editBasketItems(basketTable, true);

				basketContent.appendChild(
					BX.create('DIV', {
						props: {className: 'bx-soa-table-fade'},
						children: [
							BX.create('DIV', {
								style: {overflowX: 'auto', overflowY: 'hidden'},
								children: [basketTable]
							})
						]
					})
				);

				if (this.params.SHOW_COUPONS_BASKET == 'Y')
					this.editCoupons(basketContent);

				this.getBlockFooter(basketContent);

				BX.bind(
					basketContent.querySelector('div.bx-soa-table-fade').firstChild,
					'scroll',
					BX.proxy(this.basketBlockScrollCheckEvent, this)
				);
			}

			this.alignBasketColumns();
		},

		editFadeBasketBlock: function(activeNodeMode)
		{
			var node = !!activeNodeMode ? this.basketHiddenBlockNode : this.basketBlockNode,
				newContent, basketTable;

			if (this.initialized.basket)
			{
				this.basketHiddenBlockNode.appendChild(node.querySelector('.bx-soa-section-content'));
				this.basketBlockNode.appendChild(BX.firstChild(this.basketHiddenBlockNode));
			}
			else
			{
				newContent = this.getNewContainer();
				basketTable = BX.create('DIV', {props: {className: 'bx-soa-item-table'}});

				this.editBasketItems(basketTable, false);

				newContent.appendChild(
					BX.create('DIV', {
						props: {className: 'bx-soa-table-fade'},
						children: [
							BX.create('DIV', {
								style: {overflowX: 'auto', overflowY: 'hidden'},
								children: [basketTable]
							})
						]
					})
				);

				if (this.params.SHOW_COUPONS_BASKET == 'Y')
					this.editCouponsFade(newContent);

				node.appendChild(newContent);
				this.alignBasketColumns();
				this.basketBlockScrollCheck();

				BX.bind(
					this.basketBlockNode.querySelector('div.bx-soa-table-fade').firstChild,
					'scroll',
					BX.proxy(this.basketBlockScrollCheckEvent, this)
				);
			}

			this.alignBasketColumns();
		},

		editBasketItems: function(basketItemsNode, active)
		{
			if (!this.result.GRID.ROWS)
				return;

			var index = 0, i;

			if (this.params.SHOW_BASKET_HEADERS == 'Y')
				this.editBasketItemsHeader(basketItemsNode);

			for (i in this.result.GRID.ROWS)
				if (this.result.GRID.ROWS.hasOwnProperty(i))
					this.createBasketItem(basketItemsNode, this.result.GRID.ROWS[i], index++, !!active);
		},

		editBasketItemsHeader: function(basketItemsNode)
		{
			if (!basketItemsNode)
				return;

			var headers = [
					BX.create('DIV', {
						props: {className: 'bx-soa-item-td'},
						style: {paddingBottom: '5px'},
						children: [
							BX.create('DIV', {
								props: {className: 'bx-soa-item-td-title'},
								text: BX.message('SOA_SUM_NAME')
							})
						]
					})
				],
				toRight = false, column, basketColumnIndex = 0, i;

			for (i = 0; i < this.result.GRID.HEADERS.length; i++)
			{
				column = this.result.GRID.HEADERS[i];

				if (column.id == 'NAME' || column.id == 'PREVIEW_PICTURE' || column.id == 'PROPS' || column.id == 'NOTES')
					continue;

				toRight = BX.util.in_array(column.id, ["QUANTITY", "PRICE_FORMATED", "DISCOUNT_PRICE_PERCENT_FORMATED", "SUM"]);
				headers.push(
					BX.create('DIV', {
						props: {className: 'bx-soa-item-td bx-soa-item-properties' + (toRight ? ' bx-text-right' : '')},
						style: {paddingBottom: '5px'},
						children: [
							BX.create('DIV', {
								props: {className: 'bx-soa-item-td-title'},
								text: column.name
							})
						]
					})
				);

				++basketColumnIndex;
				if (basketColumnIndex == 4 && this.result.GRID.HEADERS[i + 1])
				{
					headers.push(BX.create('DIV', {props: {className: 'bx-soa-item-nth-4p1'}}));
					basketColumnIndex = 0;
				}
			}

			basketItemsNode.appendChild(
				BX.create('DIV', {
					props: {className: 'bx-soa-item-tr hidden-sm hidden-xs'},
					children: headers
				})
			);
		},

		createBasketItem: function(basketItemsNode, item, index, active)
		{
			var mainColumns = [],
				otherColumns = [],
				hiddenColumns = [],
				currentColumn, basketColumnIndex = 0,
				i, tr, cols;

			if (this.options.showPreviewPicInBasket || this.options.showDetailPicInBasket)
				mainColumns.push(this.createBasketItemImg(item.data));

			mainColumns.push(this.createBasketItemContent(item.data));

			for (i = 0; i < this.result.GRID.HEADERS.length; i++)
			{
				currentColumn = this.result.GRID.HEADERS[i];

				if (currentColumn.id == 'NAME' || currentColumn.id == 'PREVIEW_PICTURE' || currentColumn.id == 'PROPS' || currentColumn.id == 'NOTES')
					continue;

				otherColumns.push(this.createBasketItemColumn(currentColumn, item, active));

				++basketColumnIndex;
				if (basketColumnIndex == 4 && this.result.GRID.HEADERS[i + 1])
				{
					otherColumns.push(BX.create('DIV', {props: {className: 'bx-soa-item-nth-4p1'}}));
					basketColumnIndex = 0;
				}
			}

			if (active)
			{
				for (i = 0; i < this.result.GRID.HEADERS_HIDDEN.length; i++)
				{
					tr = this.createBasketItemHiddenColumn(this.result.GRID.HEADERS_HIDDEN[i], item);
					if (BX.type.isArray(tr))
						hiddenColumns = hiddenColumns.concat(tr);
					else if (tr)
						hiddenColumns.push(tr);
				}
			}

			cols = [
				BX.create('DIV', {
					props: {className: 'bx-soa-item-td'},
					style: {minWidth: '300px'},
					children: [
						BX.create('DIV', {
							props: {className: 'bx-soa-item-block'},
							children: mainColumns
						})
					]
				})
			].concat(otherColumns);

			basketItemsNode.appendChild(
				BX.create('DIV', {
					props: {className: 'bx-soa-item-tr bx-soa-basket-info' + (index == 0 ? ' bx-soa-item-tr-first' : '')},
					children: cols
				})
			);

			if (hiddenColumns.length)
			{
				basketItemsNode.appendChild(
					BX.create('DIV', {
						props: {className: 'bx-soa-item-tr bx-soa-item-info-container'},
						children: [
							BX.create('DIV', {
								props: {className: 'bx-soa-item-td'},
								children: [
									BX.create('A', {
										props: {href: '', className: 'bx-soa-info-shower'},
										html: this.params.MESS_ADDITIONAL_PROPS,
										events: {
											click: BX.proxy(this.showAdditionalProperties, this)
										}
									}),
									BX.create('DIV', {
										props: {className: 'bx-soa-item-info-block'},
										children: [
											BX.create('TABLE', {
												props: {className: 'bx-soa-info-block'},
												children: hiddenColumns
											})
										]
									})
								]
							})
						]
					})
				);
			}
		},

		showAdditionalProperties: function(event)
		{
			var target = event.target || event.srcElement,
				infoContainer = target.nextSibling,
				parentContainer = BX.findParent(target, {className: 'bx-soa-item-tr bx-soa-item-info-container'}),
				parentHeight = parentContainer.offsetHeight;

			if (BX.hasClass(infoContainer, 'bx-active'))
			{
				new BX.easing({
					duration: 300,
					start: {opacity: 100, height: parentHeight},
					finish: {opacity: 0, height: 35},
					transition: BX.easing.makeEaseOut(BX.easing.transitions.quad),
					step: function(state){
						infoContainer.style.opacity = state.opacity / 100;
						infoContainer.style.height = state.height + 'px';
						parentContainer.style.height = state.height + 'px';
					},
					complete: function(){
						BX.removeClass(infoContainer, 'bx-active');
						infoContainer.removeAttribute("style");
						parentContainer.removeAttribute("style");
					}
				}).animate();
			}
			else
			{
				infoContainer.style.opacity = 0;
				BX.addClass(infoContainer, 'bx-active');
				var height = infoContainer.offsetHeight + parentHeight;
				BX.removeClass(infoContainer, 'bx-active');
				infoContainer.style.paddingTop = '10px';

				new BX.easing({
					duration: 300,
					start: {opacity: 0, height: parentHeight},
					finish: {opacity: 100, height: height},
					transition: BX.easing.makeEaseOut(BX.easing.transitions.quad),
					step: function(state){
						infoContainer.style.opacity = state.opacity / 100;
						infoContainer.style.height = state.height + 'px';
						parentContainer.style.height = state.height + 'px';
					},
					complete: function(){
						BX.addClass(infoContainer, 'bx-active');
						infoContainer.removeAttribute("style");
					}
				}).animate();
			}

			return BX.PreventDefault(event);
		},

		createBasketItemImg: function(data)
		{
			if (!data)
				return;

			var logoNode, logotype;

			logoNode = BX.create('DIV', {props: {className: 'bx-soa-item-imgcontainer'}});

			if (data.PREVIEW_PICTURE_SRC && data.PREVIEW_PICTURE_SRC.length)
				logotype = this.getImageSources(data, 'PREVIEW_PICTURE');
			else if (data.DETAIL_PICTURE_SRC && data.DETAIL_PICTURE_SRC.length)
				logotype = this.getImageSources(data, 'DETAIL_PICTURE');

			if (logotype && logotype.src_2x)
			{
				logoNode.setAttribute('style',
					'background-image: url(' + logotype.src_1x + ');' +
					'background-image: -webkit-image-set(url(' + logotype.src_1x + ') 1x, url(' + logotype.src_2x + ') 2x)'
				);
			}
			else
			{
				logotype = logotype && logotype.src_1x || this.defaultBasketItemLogo;
				logoNode.setAttribute('style', 'background-image: url(' + logotype + ');');
			}

			if (data.DETAIL_PAGE_URL && data.DETAIL_PAGE_URL.length)
				logoNode = BX.create('A', {
					props: {href: data.DETAIL_PAGE_URL},
					children: [logoNode]
				});

			return BX.create('DIV', {
				props: {className: 'bx-soa-item-img-block'},
				children: [logoNode]
			});
		},

		createBasketItemContent: function(data)
		{
			var itemName = data.NAME || '',
				titleHtml = this.htmlspecialcharsEx(itemName),
				props = data.PROPS || [],
				propsNodes = [];
				
				var itemAdditives = data.NOTES;
				var additivesHtml = this.htmlspecialcharsEx(itemAdditives);

			if (data.DETAIL_PAGE_URL && data.DETAIL_PAGE_URL.length)
				titleHtml = '<a href="' + data.DETAIL_PAGE_URL + '">' + titleHtml + '</a>';

			if (this.options.showPropsInBasket && props.length)
			{
				for (var i in props)
				{
					if (props.hasOwnProperty(i))
					{
                        var name = props[i].NAME || '',
                            value = props[i].VALUE || '',
							title = props[i].VALUE || '';

                        if(props[i].FILE !== undefined){
                            value = '<img src="'+props[i].FILE[0]+'" alt="'+name+'" title="'+title+'">'
                        }

						propsNodes.push(
							BX.create('DIV', {
								props: {className: 'bx-soa-item-td-title bx-soa-item-td-title--prop'},
								style: {textAlign: 'left'},
								text: name
							})
						);
						propsNodes.push(
							BX.create('DIV', {
								props: {className: 'bx-soa-item-td-text bx-soa-item-td-text--prop'},
								style: {textAlign: 'left'},
								html: value
							})
						);
					}
				}
			}

			return BX.create('DIV', {
				props: {className: 'bx-soa-item-content'},
				children: propsNodes.length ? [
					BX.create('DIV', {props: {className: 'bx-soa-item-title'}, html: titleHtml}),
					BX.create('DIV', {props: {className: 'bx-scu-container'}, children: propsNodes}),
					BX.create('DIV', {props: {className: 'bx-soa-item-additives'}, html: additivesHtml})
				] : [
					BX.create('DIV', {props: {className: 'bx-soa-item-title'}, html: titleHtml})
				]
			});
		},

		createBasketItemColumn: function(column, allData, active)
		{
			if (!column || !allData)
				return;

			var data = allData.columns[column.id] ? allData.columns : allData.data,
				toRight = BX.util.in_array(column.id, ["QUANTITY", "PRICE_FORMATED", "DISCOUNT_PRICE_PERCENT_FORMATED", "SUM"]),
				textNode = BX.create('DIV', {props: {className: 'bx-soa-item-td-text'}}),
				logotype = this.getImageSources(allData.data, 'DETAIL_PICTURE'),
				img;

			if (column.id == 'PRICE_FORMATED')
			{
				textNode.appendChild(BX.create('STRONG', {props: {className: 'bx-price'}, html: data.PRICE_FORMATED}));
				/*if (parseFloat(data.DISCOUNT_PRICE) > 0)
				{
					textNode.appendChild(BX.create('BR'));
					textNode.appendChild(BX.create('STRONG', {
						props: {className: 'bx-price-old'},
						html: data.BASE_PRICE_FORMATED
					}));
				}*/

				if (this.options.showPriceNotesInBasket && active)
				{
					textNode.appendChild(BX.create('BR'));
					textNode.appendChild(BX.create('SMALL', {text: data.NOTES}));
				}
			}
			else if (column.id == 'SUM')
			{
				textNode.appendChild(BX.create('STRONG', {props: {className: 'bx-price all'}, html: data.SUM}));
				/*if (parseFloat(data.DISCOUNT_PRICE) > 0)
				{
					textNode.appendChild(BX.create('BR'));
					textNode.appendChild(BX.create('STRONG', {
						props: {className: 'bx-price-old'},
						html: data.SUM_BASE_FORMATED
					}));
				}*/
			}
			else if (column.id == 'DISCOUNT')
				textNode.appendChild(BX.create('STRONG', {props: {className: 'bx-price'}, text: data.DISCOUNT_PRICE_PERCENT_FORMATED}));
			else if (column.id == 'DETAIL_PICTURE' && this.options.showPreviewPicInBasket)
			{
				img = BX.create('IMG', {props: {src: logotype && logotype.src_1x || this.defaultBasketItemLogo}});

				if (logotype && logotype.src_1x && logotype.src_orig)
					BX.bind(img, 'click', BX.delegate(function(e){
						this.popupShow(e, logotype.src_orig);
					}, this));

				textNode.appendChild(img);
			}
			else if (BX.util.in_array(column.id, ["QUANTITY", "WEIGHT_FORMATED", "DISCOUNT_PRICE_PERCENT_FORMATED"]))
				textNode.appendChild(BX.create('SPAN', {html: data[column.id]}));
			else
			{
				var columnData = data[column.id], val = [];
				if (BX.type.isArray(columnData))
				{
					for (var i in columnData)
					{
						if (columnData.hasOwnProperty(i))
						{
							if (columnData[i].type == 'image')
								val.push(this.getImageContainer(columnData[i].value, columnData[i].source));
							else if (columnData[i].type == 'linked')
							{
								textNode.appendChild(BX.create('SPAN', {html: columnData[i].value_format}));
								textNode.appendChild(BX.create('BR'));
							}
							else if (columnData[i].value)
							{
								textNode.appendChild(BX.create('SPAN', {html: columnData[i].value}));
								textNode.appendChild(BX.create('BR'));
							}
						}
					}

					if (val.length)
					{
						textNode.appendChild(
							BX.create('DIV', {
								props: {className: 'bx-scu-list'},
								children: [BX.create('UL', {props: {className: 'bx-scu-itemlist'}, children: val})]
							})
						);
					}
				}
				else if (columnData)
					textNode.appendChild(BX.create('SPAN', {html: BX.util.htmlspecialchars(columnData)}));
			}

			return BX.create('DIV', {
				props: {className: 'bx-soa-item-td bx-soa-item-properties' + (toRight ? ' bx-text-right' : '')},
				children: [
					BX.create('DIV', {
						props: {className: 'bx-soa-item-td-title visible-xs visible-sm'},
						text: column.name
					}),
					textNode
				]
			});
		},

		createBasketItemHiddenColumn: function(column, allData)
		{
			if (!column || !allData)
				return;

			var data = allData.columns[column.id] ? allData.columns : allData.data,
				textNode = BX.create('TD', {props: {className: 'bx-soa-info-text'}}),
				logotype = this.getImageSources(allData.data, 'DETAIL_PICTURE'),
				img, i;

			if (column.id == 'PROPS')
			{
				var propsNodes = [], props = allData.data.PROPS;
				if (props && props.length)
				{
					for (i in props)
					{
						if (props.hasOwnProperty(i))
						{
							var name = props[i].NAME || '',
								value = props[i].VALUE || '';

							if (value.length == 0)
								continue;

							propsNodes.push(
								BX.create('TR', {
									props: {className: 'bx-soa-info-line'},
									children: [
										BX.create('TD', {props: {className: 'bx-soa-info-title'}, text: name + ':'}),
										BX.create('TD', {props: {className: 'bx-soa-info-text'}, html: BX.util.htmlspecialchars(value)})
									]
								})
							);
						}
					}

					return propsNodes;
				}
				else return;
			}
			else if (column.id == 'PRICE_FORMATED')
			{
				textNode.appendChild(BX.create('STRONG', {props: {className: 'bx-price'}, html: data.PRICE_FORMATED}));
				/*if (parseFloat(data.DISCOUNT_PRICE) > 0)
				{
					textNode.appendChild(BX.create('BR'));
					textNode.appendChild(BX.create('STRONG', {
						props: {className: 'bx-price-old'},
						html: data.BASE_PRICE_FORMATED
					}));
				}*/
			}
			else if (column.id == 'SUM')
				textNode.appendChild(BX.create('STRONG', {props: {className: 'bx-price all'}, text: data.SUM}));
			else if (column.id == 'DISCOUNT')
				textNode.appendChild(BX.create('STRONG', {props: {className: 'bx-price'}, text: data.DISCOUNT_PRICE_PERCENT_FORMATED}));
			else if (column.id == 'DETAIL_PICTURE' || column.id == 'PREVIEW_PICTURE')
			{
				img = BX.create('IMG', {props: {src: logotype && logotype.src_1x || this.defaultBasketItemLogo}, style: {maxWidth: '50%'}});

				if (logotype && logotype.src_1x && logotype.src_orig)
					BX.bind(img, 'click', BX.delegate(function(e){
						this.popupShow(e, logotype.src_orig);
					}, this));

				textNode.appendChild(img);
			}
			else if (BX.util.in_array(column.id, ["QUANTITY", "WEIGHT_FORMATED", "DISCOUNT_PRICE_PERCENT_FORMATED"]))
				textNode.appendChild(BX.create('SPAN', {html: data[column.id]}));
			else
			{
				var columnData = data[column.id], val = [];
				if (BX.type.isArray(columnData))
				{
					for (i in columnData)
					{
						if (columnData.hasOwnProperty(i))
						{
							if (columnData[i].type == 'image')
								val.push(this.getImageContainer(columnData[i].value, columnData[i].source));
							else if (columnData[i].type == 'linked')
							{
								textNode.appendChild(BX.create('SPAN', {html: columnData[i].value_format}));
								textNode.appendChild(BX.create('BR'));
							}
							else if (columnData[i].value)
							{
								textNode.appendChild(BX.create('SPAN', {html: columnData[i].value}));
								textNode.appendChild(BX.create('BR'));
							}
							else return;
						}
					}

					if (val.length)
					{
						textNode.appendChild(
							BX.create('DIV', {
								props: {className: 'bx-scu-list'},
								children: [BX.create('UL', {props: {className: 'bx-scu-itemlist'}, children: val})]
							})
						);
					}

				}
				else if (columnData)
					textNode.appendChild(BX.create('SPAN', {html: BX.util.htmlspecialchars(columnData)}));
				else return;
			}

			return BX.create('TR', {
				props: {className: 'bx-soa-info-line'},
				children: [
					BX.create('TD', {
						props: {className: 'bx-soa-info-title'},
						text: column.name + ':'
					}),
					textNode
				]
			});
		},

		popupShow: function(e, url, source)
		{
			if (this.popup)
				this.popup.destroy();

			var that = this;
			this.popup = new BX.PopupWindow('bx-soa-image-popup', null, {
				lightShadow: true,
				offsetTop: 0,
				offsetLeft: 0,
				closeIcon: {top: '3px', right: '10px'},
				autoHide: true,
				bindOptions: {position: "bottom"},
				closeByEsc: true,
				zIndex: 100,
				events: {
					onPopupShow: function() {
						BX.create("IMG", {
							props: {src: source || url},
							events: {
								load: function() {
									var content = BX('bx-soa-image-popup-content');
									if (content)
									{
										var windowSize = BX.GetWindowInnerSize(),
											ratio = this.isMobile ? 0.5 : 0.9,
											contentHeight, contentWidth;

										BX.cleanNode(content);
										content.appendChild(this);

										contentHeight = content.offsetHeight;
										contentWidth = content.offsetWidth;

										if (contentHeight > windowSize.innerHeight * ratio)
										{
											content.style.height = windowSize.innerHeight * ratio + 'px';
											content.style.width = contentWidth * (windowSize.innerHeight * ratio / contentHeight) + 'px';
											contentHeight = content.offsetHeight;
											contentWidth = content.offsetWidth;
										}

										if (contentWidth > windowSize.innerWidth * ratio)
										{
											content.style.width = windowSize.innerWidth * ratio + 'px';
											content.style.height = contentHeight * (windowSize.innerWidth * ratio / contentWidth) + 'px';
										}

										content.style.height = content.offsetHeight + 'px';
										content.style.width = content.offsetWidth + 'px';

										that.popup.adjustPosition();
									}
								}
							}
						});
					},
					onPopupClose: function() {
						this.destroy();
					}
				},
				content: BX.create('DIV', {
					props: {id: 'bx-soa-image-popup-content'},
					children: [BX.create('IMG', {props: {src: this.templateFolder + "/images/loader.gif"}})]
				})
			});
			this.popup.show();
		},

		getImageContainer: function(link, source)
		{
			return BX.create('LI', {
				props: {className: 'bx-img-item'},
				children: [
					BX.create('DIV', {
						props: {className: 'bx-scu-itemColorBlock'},
						children: [
							BX.create('DIV', {
								props: {className: 'bx-img-itemColor'},
								style: {backgroundImage: 'url(' + link + ')'}
							})
						],
						events: {
							click: BX.delegate(function(e){this.popupShow(e, link, source)}, this)
						}
					})
				]
			});
		},

		editCoupons: function(basketItemsNode)
		{
			var couponsList = this.getCouponsList(true),
				couponsLabel = this.getCouponsLabel(true),
				couponsBlock = BX.create('DIV', {
					props: {className: 'bx-soa-coupon-block'},
					children: [
						BX.create('DIV', {
							props: {className: 'bx-soa-coupon-input'},
							children: [
								BX.create('INPUT', {
									props: {
										id: 'coupon',
										className: 'form-control bx-ios-fix',
										type: 'text',
										placeholder: this.params.MESS_USE_COUPON
									},
									events: {
										change: BX.delegate(function(){
											var newCoupon = BX('coupon');
											if (newCoupon && newCoupon.value)
											{
												this.sendRequest('enterCoupon', newCoupon.value);
											}
										}, this)
									}
								})
							]
						}),
						BX.create('SPAN', {props: {className: 'bx-soa-coupon-item'}, children: couponsList})
					]
				});

			basketItemsNode.appendChild(
				BX.create('DIV', {
					props: {className: 'bx-soa-coupon'},
					children: [
						couponsLabel,
						couponsBlock
					]
				})
			);
		},

		editCouponsFade: function(basketItemsNode)
		{
			if (this.result.COUPON_LIST.length < 1)
				return;

			var couponsList = this.getCouponsList(false),
				couponsLabel, couponsBlock;

			if (couponsList.length)
			{
				couponsLabel = this.getCouponsLabel(false);
				couponsBlock = BX.create('DIV', {
					props: {className: 'bx-soa-coupon-block'},
					children: [
						BX.create('DIV', {
							props: {className: 'bx-soa-coupon-list'},
							children: [
								BX.create('DIV', {
									props: {className: 'bx-soa-coupon-item'},
									children: [couponsLabel].concat(couponsList)
								})
							]
						})
					]
				});

				basketItemsNode.appendChild(
					BX.create('DIV', {
						props: {className: 'bx-soa-coupon bx-soa-coupon-item-fixed'},
						children: [couponsBlock]
					})
				);
			}
		},

		getCouponsList: function(active)
		{
			var couponsList = [], i;

			for (i = 0; i < this.result.COUPON_LIST.length; i++)
			{
				if (active || (!active && this.result.COUPON_LIST[i].JS_STATUS == 'APPLIED'))
				{
					couponsList.push(this.getCouponNode({
						text: this.result.COUPON_LIST[i].COUPON,
						desc: this.result.COUPON_LIST[i].JS_CHECK_CODE,
						status: this.result.COUPON_LIST[i].JS_STATUS
					}, active));
				}
			}

			return couponsList;
		},

		getCouponNode: function(coupon, active)
		{
			var couponName = BX.util.htmlspecialchars(coupon.text) || '',
				couponDesc = coupon.desc && coupon.desc.length
					? coupon.desc.charAt(0).toUpperCase() + coupon.desc.slice(1)
					: BX.message('SOA_NOT_FOUND'),
				couponStatus = coupon.status || 'BAD',
				couponItem, tooltip;

			switch (couponStatus.toUpperCase())
			{
				case 'ENTERED': couponItem = 'used'; tooltip = 'warning'; break;
				case 'BAD': couponItem = tooltip = 'danger'; break;
				default: couponItem = tooltip  = 'success';
			}

			return BX.create('STRONG', {
				attrs: {
					'data-coupon': couponName,
					className: 'bx-soa-coupon-item-' + couponItem
				},
				children: active ? [
					couponName || '',
					BX.create('SPAN', {
						props: {className: 'bx-soa-coupon-remove'},
						events: {
							click: BX.delegate(function(e){
								var target = e.target || e.srcElement,
									coupon = BX.findParent(target, {tagName: 'STRONG'});

								if (coupon && coupon.getAttribute('data-coupon'))
								{
									this.sendRequest('removeCoupon', coupon.getAttribute('data-coupon'))
								}
							}, this)
						}
					}),
					BX.create('SPAN', {
						props: {
							className: 'bx-soa-tooltip bx-soa-tooltip-coupon bx-soa-tooltip-' + tooltip + ' tooltip top'
						},
						children: [
							BX.create('SPAN', {props: {className: 'tooltip-arrow'}}),
							BX.create('SPAN', {props: {className: 'tooltip-inner'}, text: couponDesc})
						]
					})
				] : [couponName]
			});
		},

		getCouponsLabel: function(active)
		{
            /*return BX.create('DIV', {
                props: {className: 'bx-soa-coupon-label'},
                children: active
                    ? [BX.create('LABEL', {attr: {'for': 'coupon'}, html: this.params.MESS_USE_COUPON + ':'})]
                    : [this.params.MESS_COUPON + ':']
			});*/
		},

		addCoupon: function(coupon)
		{
			var couponListNodes = this.orderBlockNode.querySelectorAll('.bx-soa-coupon:not(.bx-soa-coupon-item-fixed) .bx-soa-coupon-item'),
				couponInput = BX('coupon'), i;

			for (i = 0; i < couponListNodes.length; i++)
			{
				if (couponListNodes[i].querySelector('[data-coupon="' + BX.util.htmlspecialchars(coupon) + '"'))
					break;

				couponListNodes[i].appendChild(this.getCouponNode({text: coupon}, true, 'bx-soa-coupon-item-danger'));
			}

			couponInput && (couponInput.value = '');
		},

		removeCoupon: function(coupon)
		{
			var couponNodes = this.orderBlockNode.querySelectorAll('[data-coupon="' + BX.util.htmlspecialchars(coupon) + '"]'), i;

			for (i in couponNodes)
			{
				if (couponNodes.hasOwnProperty(i))
				{
					BX.remove(couponNodes[i]);
				}
			}
		},

		editRegionBlock: function(active)
		{
			if (!this.regionBlockNode || !this.regionHiddenBlockNode || !this.result.PERSON_TYPE)
				return;

			if (active)
			{
				this.editActiveRegionBlock(true);
				!this.regionBlockNotEmpty && this.editFadeRegionBlock();
			}
			else
				this.editFadeRegionBlock();

			this.initialized.region = true;
		},

		editActiveRegionBlock: function(activeNodeMode)
		{
			var node = activeNodeMode ? this.regionBlockNode : this.regionHiddenBlockNode,
				regionContent, regionNode, regionNodeCol;

			if (this.initialized.region)
			{
				BX.remove(BX.lastChild(node));
				node.appendChild(BX.firstChild(this.regionHiddenBlockNode));
			}
			else
			{
				regionContent = node.querySelector('.bx-soa-section-content');
				if (!regionContent)
				{
					regionContent = this.getNewContainer();
					node.appendChild(regionContent);
				}
				else
					BX.cleanNode(regionContent);

				this.getErrorContainer(regionContent);

				regionNode = BX.create('DIV', {props: {className: 'bx_soa_location row'}});
				regionNodeCol = BX.create('DIV', {props: {className: 'col-xs-12'}});

				this.getPersonTypeControl(regionNodeCol);

				this.getProfilesControl(regionNodeCol);

				this.getDeliveryLocationInput(regionNodeCol);


				if (!this.result.SHOW_AUTH)
				{
					if (this.regionBlockNotEmpty)
					{
						BX.addClass(this.regionBlockNode, 'bx-active');
						this.regionBlockNode.style.display = '';
					}
					else
					{
						BX.removeClass(this.regionBlockNode, 'bx-active');
						this.regionBlockNode.style.display = 'none';

						if (!this.result.IS_AUTHORIZED || typeof this.result.LAST_ORDER_DATA.FAIL !== 'undefined')
							this.initFirstSection();
					}
				}

				regionNode.appendChild(regionNodeCol);
				regionContent.appendChild(regionNode);
				this.getBlockFooter(regionContent);
			}
		},

		editFadeRegionBlock: function()
		{
			var regionContent = this.regionBlockNode.querySelector('.bx-soa-section-content'), newContent;

			if (this.initialized.region)
			{
				this.regionHiddenBlockNode.appendChild(regionContent);
			}
			else
			{
				this.editActiveRegionBlock(false);
				BX.remove(BX.lastChild(this.regionBlockNode));
			}

			newContent = this.getNewContainer(true);
			this.regionBlockNode.appendChild(newContent);
			this.editFadeRegionContent(newContent);
		},

		editFadeRegionContent: function(node)
		{
			if (!node || !this.locationsInitialized)
				return;

			var selectedPersonType = this.getSelectedPersonType(),
				errorNode = this.regionHiddenBlockNode.querySelector('.alert.alert-danger'),
				addedHtml = '', props = [], locationProperty,
				input, zipValue = '', zipProperty,
				fadeParamName, i, k, locationString, validRegionErrors;

			BX.cleanNode(node);

			if (errorNode)
				node.appendChild(errorNode.cloneNode(true));

			if (selectedPersonType && selectedPersonType.NAME && this.result.PERSON_TYPE.length > 1)
			{
				addedHtml += '<strong>' + this.params.MESS_PERSON_TYPE + ':</strong> '
					+ BX.util.htmlspecialchars(selectedPersonType.NAME) + '<br>';
			}

			if (selectedPersonType)
			{
				fadeParamName = 'PROPS_FADE_LIST_' + selectedPersonType.ID;
				props = this.params[fadeParamName] || [];
			}

			for (i in this.result.ORDER_PROP.properties)
			{
				if (this.result.ORDER_PROP.properties.hasOwnProperty(i))
				{
					if (this.result.ORDER_PROP.properties[i].IS_LOCATION == 'Y'
						&& this.result.ORDER_PROP.properties[i].ID == this.deliveryLocationInfo.loc)
					{
						locationProperty = this.result.ORDER_PROP.properties[i];
					}
					else if (this.result.ORDER_PROP.properties[i].IS_ZIP == 'Y'
						&& this.result.ORDER_PROP.properties[i].ID == this.deliveryLocationInfo.zip)
					{
						zipProperty = this.result.ORDER_PROP.properties[i];
						for (k = 0; k < props.length; k++)
						{
							if (props[k] == zipProperty.ID)
							{
								input = BX('zipProperty');
								zipValue = input && input.value && input.value.length ? input.value : BX.message('SOA_NOT_SPECIFIED');
								break;
							}
						}
					}
				}
			}

			locationString = this.getLocationString(this.regionHiddenBlockNode);
			if (locationProperty && locationString.length)
				addedHtml += '<strong>' + BX.util.htmlspecialchars(locationProperty.NAME) + ':</strong> ' + locationString + '<br>';

			if (zipProperty && zipValue.length)
				addedHtml += '<strong>' + BX.util.htmlspecialchars(zipProperty.NAME) + ':</strong> ' + zipValue;

			node.innerHTML += addedHtml;

			if (this.regionBlockNode.getAttribute('data-visited') == 'true')
			{
				validRegionErrors = this.isValidRegionBlock();

				if (validRegionErrors.length)
				{
					BX.addClass(this.regionBlockNode, 'bx-step-error');
					this.showError(this.regionBlockNode, validRegionErrors);
				}
				else
					BX.removeClass(this.regionBlockNode, 'bx-step-error');
			}

			BX.bind(node.querySelector('.alert.alert-danger'), 'click', BX.proxy(this.showByClick, this));
			BX.bind(node.querySelector('.alert.alert-warning'), 'click', BX.proxy(this.showByClick, this));
		},

		getSelectedPersonType: function()
		{
			var personTypeInput, currentPersonType, personTypeId, i,
				personTypeLength = this.result.PERSON_TYPE.length;

			if (personTypeLength == 1)
			{
				personTypeInput = this.regionBlockNode.querySelector('input[type=hidden][name=PERSON_TYPE]');
				if (!personTypeInput)
					personTypeInput = this.regionHiddenBlockNode.querySelector('input[type=hidden][name=PERSON_TYPE]');
			}
			else if (personTypeLength == 2)
			{
				personTypeInput = this.regionBlockNode.querySelector('input[type=radio][name=PERSON_TYPE]:checked');
				if (!personTypeInput)
					personTypeInput = this.regionHiddenBlockNode.querySelector('input[type=radio][name=PERSON_TYPE]:checked');
			}
			else
			{
				personTypeInput = this.regionBlockNode.querySelector('select[name=PERSON_TYPE] > option:checked');
				if (!personTypeInput)
					personTypeInput = this.regionHiddenBlockNode.querySelector('select[name=PERSON_TYPE] > option:checked');
			}

			if (personTypeInput)
			{
				personTypeId = personTypeInput.value;

				for (i in this.result.PERSON_TYPE)
				{
					if (this.result.PERSON_TYPE[i].ID == personTypeId)
					{
						currentPersonType = this.result.PERSON_TYPE[i];
						break;
					}
				}
			}

			return currentPersonType;
		},

		getDeliveryLocationInput: function(node)
		{
			var currentProperty, locationId, altId, location, k, altProperty,
				labelHtml, currentLocation, insertedLoc,
				labelTextHtml, label, input, altNode;

			for (k in this.result.ORDER_PROP.properties)
			{
				if (this.result.ORDER_PROP.properties.hasOwnProperty(k))
				{
					currentProperty = this.result.ORDER_PROP.properties[k];
					if (currentProperty.IS_LOCATION == 'Y')
					{
						locationId = currentProperty.ID;
						altId = parseInt(currentProperty.INPUT_FIELD_LOCATION);
						break;
					}
				}
			}

            var node_wrapper = node.appendChild(BX.create('DIV', {
                props: {className: 'bx-soa-location-input-wrap'},
                html:  ''
            }));

			location = this.locations[locationId];
			if (location && location[0] && location[0].output)
			{
				this.regionBlockNotEmpty = true;

				labelHtml = '<label class="bx-soa-custom-label" for="soa-property-' + locationId + '">'
					+ BX.util.htmlspecialchars(currentProperty.NAME)
                    + (currentProperty.REQUIRED == 'Y' ? '<span class="bx-authform-starrequired"> *</span>' : '')
					+ (currentProperty.DESCRIPTION.length ? ' <small>(' + BX.util.htmlspecialchars(currentProperty.DESCRIPTION) + ')</small>' : '')
					+ '</label>';

				currentLocation = location[0].output;
				insertedLoc = BX.create('DIV', {
					attrs: {'data-property-id-row': locationId},
					props: {className: 'form-group bx-soa-location-input-container bx-soa-location-input-container--first'},
					style: {visibility: 'hidden'},
					html:  labelHtml + currentLocation.HTML
				});
                node_wrapper.appendChild(insertedLoc);
                node_wrapper.appendChild(BX.create('INPUT', {
					props: {
						type: 'hidden',
						name: 'RECENT_DELIVERY_VALUE',
						value: location[0].lastValue
					}
				}));

				for (k in currentLocation.SCRIPT)
					if (currentLocation.SCRIPT.hasOwnProperty(k))
						BX.evalGlobal(currentLocation.SCRIPT[k].JS);
			}

			if (location && location[0] && location[0].showAlt && altId > 0)
			{
				for (k in this.result.ORDER_PROP.properties)
				{
					if (parseInt(this.result.ORDER_PROP.properties[k].ID) == altId)
					{
						altProperty = this.result.ORDER_PROP.properties[k];
						break;
					}
				}
			}

			if (altProperty)
			{
				altNode = BX.create('DIV', {
					attrs: {'data-property-id-row': altProperty.ID},
					props: {className: "form-group bx-soa-location-input-container"}
				});

				labelTextHtml = BX.util.htmlspecialchars(altProperty.NAME);
				labelTextHtml += altProperty.REQUIRED == 'Y' ? '<span class="bx-authform-starrequired"> *</span>' : '';

				label = BX.create('LABEL', {
					attrs: {for: 'altProperty'},
					props: {className: 'bx-soa-custom-label'},
					html: labelTextHtml
				});

				input = BX.create('INPUT', {
					props: {
						id: 'altProperty',
						type: 'text',
						placeholder: altProperty.DESCRIPTION,
						autocomplete: 'city',
						className: 'form-control bx-soa-customer-input bx-ios-fix',
						name: 'ORDER_PROP_' + altProperty.ID,
						value: altProperty.VALUE
					}
				});

				altNode.appendChild(label);
				altNode.appendChild(input);
                node_wrapper.appendChild(altNode);

				this.bindValidation(altProperty.ID, altNode);
			}

			this.getZipLocationInput(node_wrapper);

			// if (location && location[0])
			// {
			// 	node.appendChild(
			// 		BX.create('DIV', {
			// 			props: {className: 'bx-soa-reference'},
			// 			html: this.params.MESS_REGION_REFERENCE
			// 		})
			// 	);
			// }
		},

		getLocationString: function(node)
		{
			if (!node)
				return '';

			var locationInputNode = node.querySelector('.bx-ui-sls-route'),
				locationString = '',
				locationSteps, i, altLoc;

			if (locationInputNode && locationInputNode.value && locationInputNode.value.length)
				locationString = locationInputNode.value;
			else
			{
				locationSteps = node.querySelectorAll('.bx-ui-combobox-fake.bx-combobox-fake-as-input');
				for (i = locationSteps.length; i--;)
				{
					if (locationSteps[i].innerHTML.indexOf('...') >= 0)
						continue;

					if (locationSteps[i].innerHTML.indexOf('---') >= 0)
					{
						altLoc = BX('altProperty');
						if (altLoc && altLoc.value.length)
							locationString += altLoc.value;

						continue;
					}

					if (locationString.length)
						locationString += ', ';

					locationString += locationSteps[i].innerHTML;
				}

				if (locationString.length == 0)
					locationString = BX.message('SOA_NOT_SPECIFIED');
			}

			return locationString;
		},

		getZipLocationInput: function(node)
		{
			var zipProperty, i, propsItemNode, labelTextHtml, label, input;

			for (i in this.result.ORDER_PROP.properties)
			{
				if (this.result.ORDER_PROP.properties.hasOwnProperty(i) && this.result.ORDER_PROP.properties[i].IS_ZIP == 'Y')
				{
					zipProperty = this.result.ORDER_PROP.properties[i];
					break;
				}
			}

			if (zipProperty)
			{
				this.regionBlockNotEmpty = true;

				propsItemNode = BX.create('DIV', {props: {className: "form-group bx-soa-location-input-container"}});
				propsItemNode.setAttribute('data-property-id-row', zipProperty.ID);

				labelTextHtml = BX.util.htmlspecialchars(zipProperty.NAME);
				labelTextHtml += zipProperty.REQUIRED == 'Y' ? '<span class="bx-authform-starrequired"> *</span>' : '';

				label = BX.create('LABEL', {
					attrs: {'for': 'zipProperty'},
					props: {className: 'bx-soa-custom-label'},
					html: labelTextHtml
				});
				input = BX.create('INPUT', {
					props: {
						id: 'zipProperty',
						type: 'text',
						placeholder: zipProperty.DESCRIPTION,
						autocomplete: 'zip',
						className: 'form-control bx-soa-customer-input bx-ios-fix',
						name: 'ORDER_PROP_' + zipProperty.ID,
						value: zipProperty.VALUE
					}
				});

				propsItemNode.appendChild(label);
				propsItemNode.appendChild(input);
				node.appendChild(propsItemNode);
				node.appendChild(
					BX.create('input', {
						props: {
							id: 'ZIP_PROPERTY_CHANGED',
							name: 'ZIP_PROPERTY_CHANGED',
							type: 'hidden',
							value: this.result.ZIP_PROPERTY_CHANGED || 'N'
						}
					})
				);

				this.bindValidation(zipProperty.ID, propsItemNode);
			}
		},

		getPersonTypeSortedArray: function(objPersonType)
		{
			var personTypes = [], k;

			for (k in objPersonType)
			{
				if (objPersonType.hasOwnProperty(k))
				{
					personTypes.push(objPersonType[k]);
				}
			}

			return personTypes.sort(function(a, b){return parseInt(a.SORT) - parseInt(b.SORT)});
		},

		getPersonTypeControl: function(node)
		{
			if (!this.result.PERSON_TYPE)
				return;

			this.result.PERSON_TYPE = this.getPersonTypeSortedArray(this.result.PERSON_TYPE);

			var personTypesCount = this.result.PERSON_TYPE.length,
				currentType, oldPersonTypeId, i,
				input, options = [], label, delimiter = false;

			if (personTypesCount > 1)
			{
				input = BX.create('DIV', {
					props: {className: 'form-group form-group--location'},
					children: [
						BX.create('LABEL', {props: {className: 'bx-soa-custom-label'}, html: this.params.MESS_PERSON_TYPE}),
						BX.create('BR')
					]
				});
				node.appendChild(input);
				node = input;
			}

			if (personTypesCount > 2)
			{
				for (i in this.result.PERSON_TYPE)
				{
					if (this.result.PERSON_TYPE.hasOwnProperty(i))
					{
						currentType = this.result.PERSON_TYPE[i];
						options.push(BX.create('OPTION', {
							props: {
								value: currentType.ID,
								selected: currentType.CHECKED == 'Y'
							},
							text: currentType.NAME
						}));

						if (currentType.CHECKED == 'Y')
							oldPersonTypeId = currentType.ID;
					}

				}
				node.appendChild(BX.create('SELECT', {
					props: {name: 'PERSON_TYPE', className: 'form-control'},
					children: options,
					events: {change: BX.proxy(this.sendRequest, this)}
				}));

				this.regionBlockNotEmpty = true;
			}
			else if (personTypesCount == 2)
			{
				for (i in this.result.PERSON_TYPE)
				{
					if (this.result.PERSON_TYPE.hasOwnProperty(i))
					{
						currentType = this.result.PERSON_TYPE[i];
						label = BX.create('LABEL', {
							children: [
								BX.create('INPUT', {
									attrs: {checked: currentType.CHECKED == 'Y'},
									props: {type: 'radio', name: 'PERSON_TYPE', value: currentType.ID}
								}),
								BX.create('DIV',{props: {className: 'radio-inline_border'}}),
								BX.util.htmlspecialchars(currentType.NAME)
							],
							events: {change: BX.proxy(this.sendRequest, this)}
						});

						if (delimiter)
							node.appendChild(BX.create('BR'));

						node.appendChild(BX.create('DIV', {props: {className: 'radio-inline'}, children: [label]}));
						delimiter = true;

						if (currentType.CHECKED == 'Y')
							oldPersonTypeId = currentType.ID;
					}
				}

				this.regionBlockNotEmpty = true;
			}
			else
			{
				for (i in this.result.PERSON_TYPE)
					if (this.result.PERSON_TYPE.hasOwnProperty(i))
						node.appendChild(BX.create('INPUT', {props: {type: 'hidden', name: 'PERSON_TYPE', value: this.result.PERSON_TYPE[i].ID}}));
			}

			if (oldPersonTypeId)
			{
				node.appendChild(
					BX.create('INPUT', {
						props: {
							type: 'hidden',
							name: 'PERSON_TYPE_OLD',
							value: oldPersonTypeId

						}
					})
				);
			}
		},

		getProfilesControl: function(node)
		{
			var profilesLength = BX.util.object_keys(this.result.USER_PROFILES).length,
				i, label, options = [],
				profileChangeInput, input;

			if (profilesLength)
			{
				if (this.params.ALLOW_USER_PROFILES == 'Y')
				{
					this.regionBlockNotEmpty = true;

					if (profilesLength > 1 || this.params.ALLOW_NEW_PROFILE == 'Y')
					{
						label = BX.create('LABEL', {props: {className: 'bx-soa-custom-label'}, html: this.params.MESS_SELECT_PROFILE});

						for (i in this.result.USER_PROFILES)
						{
							if (this.result.USER_PROFILES.hasOwnProperty(i))
							{
								options.unshift(
									BX.create('OPTION', {
										props: {
											value: this.result.USER_PROFILES[i].ID,
											selected: this.result.USER_PROFILES[i].CHECKED == 'Y'
										},
										html: this.result.USER_PROFILES[i].NAME
									})
								);
							}
						}

						if (this.params.ALLOW_NEW_PROFILE == 'Y')
							options.unshift(BX.create('OPTION', {props: {value: 0}, text: BX.message('SOA_PROP_NEW_PROFILE')}));

						profileChangeInput = BX.create('INPUT', {
							props: {
								type: 'hidden',
								value: 'N',
								id: 'profile_change',
								name: 'profile_change'
							}
						});
						input = BX.create('SELECT', {
							props: {className: 'form-control', name: 'PROFILE_ID'},
							children: options,
							events:{
								change: BX.delegate(function(){
									BX('profile_change').value = 'Y';
									this.sendRequest();
								}, this)
							}
						});

						node.appendChild(
							BX.create('DIV', {
								props: {className: "form-group bx-soa-location-input-container"},
								children: [label, profileChangeInput, input]
							})
						);
					}
				}
				else
				{
					for (i in this.result.USER_PROFILES)
					{
						if (this.result.USER_PROFILES.hasOwnProperty(i)
							&& this.result.USER_PROFILES[i].CHECKED == 'Y')
						{
							node.appendChild(
								BX.create('INPUT', {
									props: {
										name: 'PROFILE_ID',
										type: "hidden",
										value: this.result.USER_PROFILES[i].ID}
								})
							);
						}
					}
				}
			}
		},

		editPaySystemBlock: function(active)
		{
			if (!this.paySystemBlockNode || !this.paySystemHiddenBlockNode || !this.result.PAY_SYSTEM)
				return;

			if (active)
				this.editActivePaySystemBlock(true);
			else
				this.editFadePaySystemBlock();

			this.initialized.paySystem = true;
		},

		editActivePaySystemBlock: function(activeNodeMode)
		{
			var node = activeNodeMode ? this.paySystemBlockNode : this.paySystemHiddenBlockNode,
				paySystemContent, paySystemNode;

			if (this.initialized.paySystem)
			{
				BX.remove(BX.lastChild(node));
				node.appendChild(BX.firstChild(this.paySystemHiddenBlockNode));
			}
			else
			{
				paySystemContent = node.querySelector('.bx-soa-section-content');
				if (!paySystemContent)
				{
					paySystemContent = this.getNewContainer();
					node.appendChild(paySystemContent);
				}
				else
					BX.cleanNode(paySystemContent);

				this.getErrorContainer(paySystemContent);
				paySystemNode = BX.create('DIV', {props: {className: 'bx-soa-pp row'}});
				this.editPaySystemItems(paySystemNode);
				paySystemContent.appendChild(paySystemNode);
				// this.editPaySystemInfo(paySystemNode);

				if (this.params.SHOW_COUPONS_PAY_SYSTEM == 'Y')
					this.editCoupons(paySystemContent);

				this.getBlockFooter(paySystemContent);
			}
		},

		editFadePaySystemBlock: function()
		{
			var paySystemContent = this.paySystemBlockNode.querySelector('.bx-soa-section-content'), newContent;

			if (this.initialized.paySystem)
			{
				this.paySystemHiddenBlockNode.appendChild(paySystemContent);
			}
			else
			{
				this.editActivePaySystemBlock(false);
				BX.remove(BX.lastChild(this.paySystemBlockNode));
			}

			newContent = this.getNewContainer(true);
			this.paySystemBlockNode.appendChild(newContent);

			this.editFadePaySystemContent(newContent);

			if (this.params.SHOW_COUPONS_PAY_SYSTEM == 'Y')
				this.editCouponsFade(newContent);
		},

		editPaySystemItems: function(paySystemNode)
		{
			if (!this.result.PAY_SYSTEM || this.result.PAY_SYSTEM.length <= 0)
				return;

			var paySystemItemsContainer = BX.create('DIV', {props: {className: 'col-sm-12 bx-soa-pp-item-container'}}),
				paySystemItemNode, i;

			for (i = 0; i < this.paySystemPagination.currentPage.length; i++)
			{
				paySystemItemNode = this.createPaySystemItem(this.paySystemPagination.currentPage[i]);
				paySystemItemsContainer.appendChild(paySystemItemNode);
			}

			if (this.paySystemPagination.show)
				this.showPagination('paySystem', paySystemItemsContainer);

			paySystemNode.appendChild(paySystemItemsContainer);
		},

		createPaySystemItem: function(item)
		{
			var checked = item.CHECKED == 'Y',
				logotype, logoNode,
				paySystemId = parseInt(item.ID),
				title, label, itemNode;
                       
console.log(checked);
			logoNode = BX.create('DIV', {props: {className: 'bx-soa-pp-company-image'}});
			logotype = this.getImageSources(item, 'PSA_LOGOTIP');
			if (logotype && logotype.src_2x)
			{
				logoNode.setAttribute('style',
					'background-image: url(' + logotype.src_1x + ');' +
					'background-image: -webkit-image-set(url(' + logotype.src_1x + ') 1x, url(' + logotype.src_2x + ') 2x)'
				);
			}
			else
			{
				logotype = logotype && logotype.src_1x || this.defaultPaySystemLogo;
				logoNode.setAttribute('style', 'background-image: url(' + logotype + ');');
			}
			var attrsObj = {};
			if(checked){
				attrsObj = {'checked':'checked'};
			}
			label = BX.create('DIV', {
				props: {className: 'bx-soa-pp-company-graf-container'},
				children: [
					BX.create('INPUT', {
						'attrs': attrsObj,
						props: {
							id: 'ID_PAY_SYSTEM_ID_' + paySystemId,
							name: 'PAY_SYSTEM_ID',
							type: 'checkbox',
							className: 'bx-soa-pp-company-checkbox',
							value: paySystemId,
							checked: checked
						}
					}),
					logoNode
				]
			});

			if (this.params.SHOW_PAY_SYSTEM_LIST_NAMES == 'Y')
			{
				title = BX.create('DIV', {props: {className: 'bx-soa-pp-company-smalltitle'}, text: item.NAME});
			}

			itemNode = BX.create('DIV', {
				props: {className: 'bx-soa-pp-company'},
				children: [label, title],
				events: {
					click: BX.proxy(this.selectPaySystem, this)
				}
			});

			if (checked)
				BX.addClass(itemNode, 'bx-selected');

			return itemNode;
		},

		// editPaySystemInfo: function(paySystemNode)
		// {
		// 	if (!this.result.PAY_SYSTEM || (this.result.PAY_SYSTEM.length == 0 && this.result.PAY_FROM_ACCOUNT != 'Y'))
		// 		return;
        //
		// 	var paySystemInfoContainer = BX.create('DIV', {
		// 			props: {
		// 				className: (this.result.PAY_SYSTEM.length == 0 ? 'col-sm-12' : 'col-sm-5') + ' bx-soa-pp-desc-container'
		// 			}
		// 		}),
		// 		innerPs, extPs, delimiter, currentPaySystem,
		// 		logotype, logoNode, subTitle, label, title, price;
        //
		// 	BX.cleanNode(paySystemInfoContainer);
        //
		// 	if (this.result.PAY_FROM_ACCOUNT == 'Y')
		// 		innerPs = this.getInnerPaySystem(paySystemInfoContainer);
        //
		// 	currentPaySystem = this.getSelectedPaySystem();
		// 	if (currentPaySystem)
		// 	{
		// 		logoNode = BX.create('DIV', {props: {className: 'bx-soa-pp-company-image'}});
		// 		logotype = this.getImageSources(currentPaySystem, 'PSA_LOGOTIP');
		// 		if (logotype && logotype.src_2x)
		// 		{
		// 			logoNode.setAttribute('style',
		// 				'background-image: url(' + logotype.src_1x + ');' +
		// 				'background-image: -webkit-image-set(url(' + logotype.src_1x + ') 1x, url(' + logotype.src_2x + ') 2x)'
		// 			);
		// 		}
		// 		else
		// 		{
		// 			logotype = logotype && logotype.src_1x || this.defaultPaySystemLogo;
		// 			logoNode.setAttribute('style', 'background-image: url(' + logotype + ');');
		// 		}
        //
		// 		if (this.params.SHOW_PAY_SYSTEM_INFO_NAME == 'Y')
		// 		{
		// 			subTitle = BX.create('DIV', {
		// 				props: {className: 'bx-soa-pp-company-subTitle'},
		// 				text: currentPaySystem.NAME
		// 			});
		// 		}
        //
		// 		label = BX.create('DIV', {
		// 			props: {className: 'bx-soa-pp-company-logo'},
		// 			children: [
		// 				BX.create('DIV', {
		// 					props: {className: 'bx-soa-pp-company-graf-container'},
		// 					children: [logoNode]
		// 				})
		// 			]
		// 		});
        //
		// 		title = BX.create('DIV', {
		// 			props: {className: 'bx-soa-pp-company-block'},
		// 			children: [BX.create('DIV', {props: {className: 'bx-soa-pp-company-desc'}, html: currentPaySystem.DESCRIPTION})]
		// 		});
        //
		// 		if (currentPaySystem.PRICE && parseFloat(currentPaySystem.PRICE) > 0)
		// 		{
		// 			price = BX.create('UL', {
		// 				props: {className: 'bx-soa-pp-list'},
		// 				children: [
		// 					BX.create('LI', {
		// 						children: [
		// 							BX.create('DIV', {props: {className: 'bx-soa-pp-list-termin'}, html: this.params.MESS_PRICE + ':'}),
		// 							BX.create('DIV', {props: {className: 'bx-soa-pp-list-description'}, text: '~' + currentPaySystem.PRICE_FORMATTED})
		// 						]
		// 					})
		// 				]
		// 			});
		// 		}
        //
		// 		extPs = BX.create('DIV', {children: [subTitle, label, title, price]});
		// 	}
        //
		// 	if (innerPs && extPs)
		// 		delimiter = BX.create('HR', {props: {className: 'bxe-light'}});
        //
		// 	paySystemInfoContainer.appendChild(
		// 		BX.create('DIV', {
		// 			props: {className: 'bx-soa-pp-company'},
		// 			children: [innerPs, delimiter, extPs]
		// 		})
		// 	);
		// 	paySystemNode.appendChild(paySystemInfoContainer);
		// },

		getInnerPaySystem: function()
		{
			if (!this.result.CURRENT_BUDGET_FORMATED || !this.result.PAY_CURRENT_ACCOUNT || !this.result.INNER_PAY_SYSTEM)
				return;

			var accountOnly = this.params.ONLY_FULL_PAY_FROM_ACCOUNT && (this.params.ONLY_FULL_PAY_FROM_ACCOUNT == 'Y'),
				isSelected = this.result.PAY_CURRENT_ACCOUNT && (this.result.PAY_CURRENT_ACCOUNT == 'Y'),
				paySystem = this.result.INNER_PAY_SYSTEM,
				logotype, logoNode,subTitle, label, title, hiddenInput, htmlString, innerPsDesc;

			if (this.params.SHOW_PAY_SYSTEM_INFO_NAME == 'Y')
			{
				subTitle = BX.create('DIV', {
					props: {className: 'bx-soa-pp-company-subTitle'},
					text: paySystem.NAME
				});
			}

			logoNode = BX.create('DIV', {props: {className: 'bx-soa-pp-company-image'}});
			logotype = this.getImageSources(paySystem, 'LOGOTIP');
			if (logotype && logotype.src_2x)
			{
				logoNode.setAttribute('style',
					'background-image: url(' + logotype.src_1x + ');' +
					'background-image: -webkit-image-set(url(' + logotype.src_1x + ') 1x, url(' + logotype.src_2x + ') 2x)'
				);
			}
			else
			{
				logotype = logotype && logotype.src_1x || this.defaultPaySystemLogo;
				logoNode.setAttribute('style', 'background-image: url(' + logotype + ');');
			}

			label = BX.create('DIV', {
				props: {className: 'bx-soa-pp-company-logo'},
				children: [
					BX.create('DIV', {
						props: {className: 'bx-soa-pp-company-graf-container'},
						children: [
							BX.create('INPUT', {
								props: {
									type: 'checkbox',
									className: 'bx-soa-pp-company-checkbox',
									name: 'PAY_CURRENT_ACCOUNT',
									value: 'Y',
									checked: isSelected
								}
							}),
							logoNode
						],
						events: {
							click: BX.proxy(this.selectPaySystem, this)
						}
					})
				]
			});

			if (paySystem.DESCRIPTION && paySystem.DESCRIPTION.length)
			{
				title = BX.create('DIV', {
					props: {className: 'bx-soa-pp-company-block'},
					children: [BX.create('DIV', {props: {className: 'bx-soa-pp-company-desc'}, html: paySystem.DESCRIPTION})]
				});
			}

			hiddenInput = BX.create('INPUT', {
				props: {
					type: 'hidden',
					name: 'PAY_CURRENT_ACCOUNT',
					value: 'N'
				}
			});

			htmlString = this.params.MESS_INNER_PS_BALANCE + ' <b class="wsnw">' + this.result.CURRENT_BUDGET_FORMATED
				+ '</b><br>' + (accountOnly ? BX.message('SOA_PAY_ACCOUNT3') : '');
			innerPsDesc = BX.create('DIV', {props: {className: 'bx-soa-pp-company-desc'}, html: htmlString});

			return BX.create('DIV', {
				props: {className: 'bx-soa-pp-inner-ps' + (isSelected ? ' bx-selected' : '')},
				children: [hiddenInput, subTitle, label, title, innerPsDesc]
			});
		},

		editFadePaySystemContent: function(node)
		{
			var selectedPaySystem = this.getSelectedPaySystem(),
				errorNode = this.paySystemHiddenBlockNode.querySelector('div.alert.alert-danger'),
				warningNode = this.paySystemHiddenBlockNode.querySelector('div.alert.alert-warning.alert-show'),
				addedHtml = '', logotype, imgSrc;

			if (errorNode)
				node.appendChild(errorNode.cloneNode(true));
			else
				this.getErrorContainer(node);

			if (warningNode && warningNode.innerHTML)
				node.appendChild(warningNode.cloneNode(true));

			if (this.isSelectedInnerPayment())
			{
				logotype = this.getImageSources(this.result.INNER_PAY_SYSTEM, 'LOGOTIP');
				imgSrc = logotype && logotype.src_1x || this.defaultPaySystemLogo;

				addedHtml += '<div class="bx-soa-pp-company-selected">';
				addedHtml += '<img src="' + imgSrc + '" style="height:22px;" alt="">';
				addedHtml += '<strong>' + this.result.INNER_PAY_SYSTEM.NAME + '</strong><br>';
				addedHtml += '</div>';
			}

			if (selectedPaySystem && selectedPaySystem.NAME)
			{
				logotype = this.getImageSources(selectedPaySystem, 'PSA_LOGOTIP');
				imgSrc = logotype && logotype.src_1x || this.defaultPaySystemLogo;

				addedHtml += '<div class="bx-soa-pp-company-selected">';
				addedHtml += '<img src="' + imgSrc + '" style="height:28px;" alt="">';
				addedHtml += '<strong>' + BX.util.htmlspecialchars(selectedPaySystem.NAME) + '</strong>';
				addedHtml += '</div>';
			}

			if (!addedHtml.length)
				addedHtml = '<strong>' + BX.message('SOA_PS_SELECT_ERROR') + '</strong>';

			node.innerHTML += addedHtml;

			node.appendChild(BX.create('DIV', {style: {clear: 'both'}}));
			BX.bind(node.querySelector('.alert.alert-danger'), 'click', BX.proxy(this.showByClick, this));
			BX.bind(node.querySelector('.alert.alert-warning'), 'click', BX.proxy(this.showByClick, this));
		},

		getSelectedPaySystem: function()
		{
			var paySystemCheckbox = this.paySystemBlockNode.querySelector('input[type=checkbox][name=PAY_SYSTEM_ID]:checked'),
				currentPaySystem = null, paySystemId, i;

			if (!paySystemCheckbox)
				paySystemCheckbox = this.paySystemHiddenBlockNode.querySelector('input[type=checkbox][name=PAY_SYSTEM_ID]:checked');

			if (!paySystemCheckbox)
				paySystemCheckbox = this.paySystemHiddenBlockNode.querySelector('input[type=hidden][name=PAY_SYSTEM_ID]');

			if (paySystemCheckbox)
			{
				paySystemId = paySystemCheckbox.value;

				for (i = 0; i < this.result.PAY_SYSTEM.length; i++)
				{
					if (this.result.PAY_SYSTEM[i].ID == paySystemId)
					{
						currentPaySystem = this.result.PAY_SYSTEM[i];
						break;
					}
				}
			}
			if(currentPaySystem.ID == 3) {
				showChange = false;
			}else{
				showChange = true;
			}
			
			return currentPaySystem;
		},

		isSelectedInnerPayment: function()
		{
			var innerPaySystemCheckbox = this.paySystemBlockNode.querySelector('input[type=checkbox][name=PAY_CURRENT_ACCOUNT]');

			if (!innerPaySystemCheckbox)
				innerPaySystemCheckbox = this.paySystemHiddenBlockNode.querySelector('input[type=checkbox][name=PAY_CURRENT_ACCOUNT]');

			return innerPaySystemCheckbox && innerPaySystemCheckbox.checked;
		},

		selectPaySystem: function(event)
		{
			if (!this.orderBlockNode || !event)
				return;

			var target = event.target || event.srcElement,
				innerPaySystemSection = this.paySystemBlockNode.querySelector('div.bx-soa-pp-inner-ps'),
				innerPaySystemCheckbox = this.paySystemBlockNode.querySelector('input[type=checkbox][name=PAY_CURRENT_ACCOUNT]'),
				fullPayFromInnerPaySystem = this.result.TOTAL && parseFloat(this.result.TOTAL.ORDER_TOTAL_LEFT_TO_PAY) === 0;

			var innerPsAction = BX.hasClass(target, 'bx-soa-pp-inner-ps') ? target : BX.findParent(target, {className: 'bx-soa-pp-inner-ps'}),
				actionSection = BX.hasClass(target, 'bx-soa-pp-company') ? target : BX.findParent(target, {className: 'bx-soa-pp-company'}),
				actionInput, selectedSection;

			if (innerPsAction)
			{
				if (target.nodeName == 'INPUT')
					innerPaySystemCheckbox.checked = !innerPaySystemCheckbox.checked;

				if (innerPaySystemCheckbox.checked)
				{
					BX.removeClass(innerPaySystemSection, 'bx-selected');
					innerPaySystemCheckbox.checked = false;
				}
				else
				{
					BX.addClass(innerPaySystemSection, 'bx-selected');
					innerPaySystemCheckbox.checked = true;
				}
			}
			else if (actionSection)
			{
				if (BX.hasClass(actionSection, 'bx-selected'))
					return BX.PreventDefault(event);

				if (innerPaySystemCheckbox && innerPaySystemCheckbox.checked && fullPayFromInnerPaySystem)
				{
					BX.addClass(actionSection, 'bx-selected');
					actionInput = actionSection.querySelector('input[type=checkbox]');
					actionInput.checked = true;
					BX.removeClass(innerPaySystemSection, 'bx-selected');
					innerPaySystemCheckbox.checked = false;
				}
				else
				{
					selectedSection = this.paySystemBlockNode.querySelector('.bx-soa-pp-company.bx-selected');
					BX.addClass(actionSection, 'bx-selected');
					actionInput = actionSection.querySelector('input[type=checkbox]');
					actionInput.checked = true;

					if (selectedSection)
					{
						BX.removeClass(selectedSection, 'bx-selected');
						selectedSection.querySelector('input[type=checkbox]').checked = false;
					}
				}
			}

			this.sendRequest();
		},

		editDeliveryBlock: function(active)
		{
			if (!this.deliveryBlockNode || !this.deliveryHiddenBlockNode || !this.result.DELIVERY)
				return;

			if (active)
				this.editActiveDeliveryBlock(true);
			else
				this.editFadeDeliveryBlock();

			this.checkPickUpShow();

			this.initialized.delivery = true;
		},

		editActiveDeliveryBlock: function(activeNodeMode)
		{
			var node = activeNodeMode ? this.deliveryBlockNode : this.deliveryHiddenBlockNode,
				deliveryContent, deliveryNode;

			if (this.initialized.delivery)
			{
				BX.remove(BX.lastChild(node));
				node.appendChild(BX.firstChild(this.deliveryHiddenBlockNode));
			}
			else
			{
				deliveryContent = node.querySelector('.bx-soa-section-content');
				if (!deliveryContent)
				{
					deliveryContent = this.getNewContainer();
					node.appendChild(deliveryContent);
				}
				else
					BX.cleanNode(deliveryContent);

				this.getErrorContainer(deliveryContent);

				deliveryNode = BX.create('DIV', {props: {className: 'bx-soa-pp row'}});
				this.editDeliveryItems(deliveryNode);
				deliveryContent.appendChild(deliveryNode);
				this.editDeliveryInfo(deliveryNode);

				if (this.params.SHOW_COUPONS_DELIVERY == 'Y')
					this.editCoupons(deliveryContent);

				this.getBlockFooter(deliveryContent);
			}
		},

		editDeliveryItems: function(deliveryNode)
		{
			if (!this.result.DELIVERY || this.result.DELIVERY.length <= 0)
				return;

			var deliveryItemsContainer = BX.create('DIV', {props: {className: 'col-sm-7 bx-soa-pp-item-container'}}),
				deliveryItemNode, k;

			for (k = 0; k < this.deliveryPagination.currentPage.length; k++)
			{
				deliveryItemNode = this.createDeliveryItem(this.deliveryPagination.currentPage[k]);
				deliveryItemsContainer.appendChild(deliveryItemNode);
			}

			if (this.deliveryPagination.show)
				this.showPagination('delivery', deliveryItemsContainer);

			deliveryNode.appendChild(deliveryItemsContainer);
		},

		 editDeliveryInfo: function(deliveryNode)
		 {
		 	if (!this.result.DELIVERY)
		 		return;

		 	var deliveryInfoContainer = BX.create('DIV', {props: {className: 'col-sm-5 bx-soa-pp-desc-container'}}),
		 		currentDelivery, logotype, name, logoNode,
		 		subTitle, label, title, price, period,
		 		clear, infoList, extraServices, extraServicesNode;

		 	BX.cleanNode(deliveryInfoContainer);
		 	currentDelivery = this.getSelectedDelivery();

		 	logoNode = BX.create('DIV', {props: {className: 'bx-soa-pp-company-image'}});
		 	logotype = this.getImageSources(currentDelivery, 'LOGOTIP');
		 	if (logotype && logotype.src_2x)
		 	{
		 		logoNode.setAttribute('style',
		 			'background-image: url(' + logotype.src_1x + ');' +
		 			'background-image: -webkit-image-set(url(' + logotype.src_1x + ') 1x, url(' + logotype.src_2x + ') 2x)'
		 		);
		 	}
		 	else
		 	{
		 		logotype = logotype && logotype.src_1x || this.defaultDeliveryLogo;
		 		logoNode.setAttribute('style', 'background-image: url(' + logotype + ');');
		 	}

		 	name = this.params.SHOW_DELIVERY_PARENT_NAMES != 'N' ? currentDelivery.NAME : currentDelivery.OWN_NAME;

		 	if (this.params.SHOW_DELIVERY_INFO_NAME == 'Y')
		 		subTitle = BX.create('DIV', {props: {className: 'bx-soa-pp-company-subTitle'}, text: name});

		 	label = BX.create('DIV', {
		 		props: {className: 'bx-soa-pp-company-logo'},
		 		children: [
		 			BX.create('DIV', {
		 				props: {className: 'bx-soa-pp-company-graf-container'},
		 				children: [logoNode]
		 			})
		 		]
		 	});
		 	title = BX.create('DIV', {
		 		props: {className: 'bx-soa-pp-company-block'},
		 		children: [
		 			BX.create('DIV', {props: {className: 'bx-soa-pp-company-desc'}, html: currentDelivery.DESCRIPTION}),
		 			currentDelivery.CALCULATE_DESCRIPTION
		 				? BX.create('DIV', {props: {className: 'bx-soa-pp-company-desc'}, html: currentDelivery.CALCULATE_DESCRIPTION})
		 				: null
		 		]
		 	});

		 	if (currentDelivery.PRICE >= 0)
		 	{
		 		price = BX.create('LI', {
		 			children: [
		 				BX.create('DIV', {
		 					props: {className: 'bx-soa-pp-list-termin'},
		 					html: this.params.MESS_PRICE + ':'
		 				}),
		 				BX.create('DIV', {
		 					props: {className: 'bx-soa-pp-list-description'},
		 					children: this.getDeliveryPriceNodes(currentDelivery)
		 				})
		 			]
		 		});
		 	}

		 	if (currentDelivery.PERIOD_TEXT && currentDelivery.PERIOD_TEXT.length)
		 	{
		 		period = BX.create('LI', {
		 			children: [
		 				BX.create('DIV', {props: {className: 'bx-soa-pp-list-termin'}, html: this.params.MESS_PERIOD + ':'}),
		 				BX.create('DIV', {props: {className: 'bx-soa-pp-list-description'}, html: currentDelivery.PERIOD_TEXT})
		 			]
		 		});
		 	}

		 	clear = BX.create('DIV', {style: {clear: 'both'}});
		 	infoList = BX.create('UL', {props: {className: 'bx-soa-pp-list'}, children: [price, period]});
		 	extraServices = this.getDeliveryExtraServices(currentDelivery);

		 	if (extraServices.length)
		 	{
		 		extraServicesNode = BX.create('DIV', {
		 			props: {className: 'bx-soa-pp-company-block'},
		 			children: extraServices
		 		});
		 	}

		 	deliveryInfoContainer.appendChild(
		 		BX.create('DIV', {
		 			props: {className: 'bx-soa-pp-company'},
		 			children: [subTitle, label, title, clear, extraServicesNode, infoList]
		 		})
		 	);
		 	deliveryNode.appendChild(deliveryInfoContainer);

		 	if (this.params.DELIVERY_NO_AJAX != 'Y')
		 		this.deliveryCachedInfo[currentDelivery.ID] = currentDelivery;
		 },

		getDeliveryPriceNodes: function(delivery)
		{
			var priceNodesArray;

			if (typeof delivery.DELIVERY_DISCOUNT_PRICE !== 'undefined'
				&& parseFloat(delivery.DELIVERY_DISCOUNT_PRICE) != parseFloat(delivery.PRICE))
			{
				if (parseFloat(delivery.DELIVERY_DISCOUNT_PRICE) > parseFloat(delivery.PRICE))
					priceNodesArray = [delivery.DELIVERY_DISCOUNT_PRICE_FORMATED];
				else
					priceNodesArray = [
						delivery.DELIVERY_DISCOUNT_PRICE_FORMATED,
						BX.create('BR'),
						BX.create('SPAN', {props: {className: 'bx-price-old'}, html: delivery.PRICE_FORMATED})
					];
			}
			else
			{
				priceNodesArray = [delivery.PRICE_FORMATED];
			}

			return priceNodesArray;
		},

		getDeliveryExtraServices: function(delivery)
		{
			var extraServices = [], brake = false,
				i, currentService, serviceNode, serviceName, input;

			for (i in delivery.EXTRA_SERVICES)
			{
				if (!delivery.EXTRA_SERVICES.hasOwnProperty(i))
					continue;

				currentService = delivery.EXTRA_SERVICES[i];

				if (!currentService.canUserEditValue)
					continue;

				if (currentService.editControl.indexOf('this.checked') == -1)
				{
					serviceName = BX.create('LABEL', {
						html: BX.util.htmlspecialchars(currentService.name)
						+ (currentService.price ? ' (' + currentService.priceFormatted + ')' : '')
					});

					if (i == 0)
						brake = true;

					serviceNode = BX.create('DIV', {
						props: {className: 'form-group bx-soa-pp-field'},
						html: currentService.editControl
						+ (currentService.description && currentService.description.length
							? '<div class="bx-soa-service-small">' + BX.util.htmlspecialchars(currentService.description) + '</div>'
							: '')
					});

					BX.prepend(serviceName, serviceNode);
					input = serviceNode.querySelector('input[type=text]');
					if (!input)
						input = serviceNode.querySelector('select');

					if (input)
						BX.addClass(input, 'form-control');
				}
				else
				{
					serviceNode = BX.create('DIV', {
						props: {className: 'checkbox'},
						children: [
							BX.create('LABEL', {
								html: currentService.editControl + '<div class="label-border"></div>'
								+ BX.util.htmlspecialchars(currentService.name)
								+ (currentService.price ? ' (' + currentService.priceFormatted + ')' : '')
								+ (currentService.description && currentService.description.length
									? '<div class="bx-soa-service-small">' + BX.util.htmlspecialchars(currentService.description) + '</div>'
									: '')
							})
						]
					});
				}

				extraServices.push(serviceNode);
			}

			brake && extraServices.unshift(BX.create('BR'));

			return extraServices;
		},

		editFadeDeliveryBlock: function()
		{
			var deliveryContent = this.deliveryBlockNode.querySelector('.bx-soa-section-content'), newContent;

			if (this.initialized.delivery)
			{
				this.deliveryHiddenBlockNode.appendChild(deliveryContent);
			}
			else
			{
				this.editActiveDeliveryBlock(false);
				BX.remove(BX.lastChild(this.deliveryBlockNode));
			}

			newContent = this.getNewContainer(true);
			this.deliveryBlockNode.appendChild(newContent);

			this.editFadeDeliveryContent(newContent);

			if (this.params.SHOW_COUPONS_DELIVERY == 'Y')
				this.editCouponsFade(newContent);
		},

		createDeliveryItem: function(item)
		{
			var checked = item.CHECKED == 'Y';
			var attrsObj = {};
			if(checked){
				attrsObj = {'checked':'checked'};
			}
				var deliveryId = parseInt(item.ID),
				labelNodes = [
					BX.create('INPUT', {
						'attrs':attrsObj,
						props: {
							id: 'ID_DELIVERY_ID_' + deliveryId,
							name: 'DELIVERY_ID',
							type: 'checkbox',
							className: 'bx-soa-pp-company-checkbox',
							value: deliveryId,
							checked: checked
						}
					})
				],
				deliveryCached = this.deliveryCachedInfo[deliveryId],
				logotype, label, title, itemNode, logoNode;
			if(checked && deliveryId == 3){
					showAddress = false;
					showChange = false;
				}
				if(checked && deliveryId == 2){
					showAddress = true;
					showChange = true;
				}
				if(checked && deliveryId == 16){
					showAddress = true;
					showChange = true;
				}
			logoNode = BX.create('DIV', {props: {className: 'bx-soa-pp-company-image'}});
			logotype = this.getImageSources(item, 'LOGOTIP');
			if (logotype && logotype.src_2x)
			{
				logoNode.setAttribute('style',
					'background-image: url(' + logotype.src_1x + ');' +
					'background-image: -webkit-image-set(url(' + logotype.src_1x + ') 1x, url(' + logotype.src_2x + ') 2x)'
				);
			}
			else
			{
				logotype = logotype && logotype.src_1x || this.defaultDeliveryLogo;
				logoNode.setAttribute('style', 'background-image: url(' + logotype + ');');
			}
			labelNodes.push(logoNode);

            if (this.params.SHOW_DELIVERY_LIST_NAMES == 'Y')
            {
                labelNodes.push(
                    BX.create('DIV', {
                        props: {className: 'bx-soa-pp-company-smalltitle'},
                        text: this.params.SHOW_DELIVERY_PARENT_NAMES != 'N' ? item.NAME : item.OWN_NAME
                    }));
            }

            if (item.PRICE >= 0 || typeof item.DELIVERY_DISCOUNT_PRICE !== 'undefined')
            {
            	//console.log(BX.message);
            	//console.log(item);
                labelNodes.push(
                    // BX.create('DIV', {
                    //     props: {className: 'bx-soa-pp-delivery-text'},
                    //     html: item.DESCRIPTION}),
                    // BX.create('DIV', {
                    //     props: {className: 'bx-soa-pp-delivery-cost'},
                    //     html: typeof item.DELIVERY_DISCOUNT_PRICE !== 'undefined'
                    //         ? item.DELIVERY_DISCOUNT_PRICE_FORMATED
                    //         : BX.message('PRICE_DEFAULT') + ': ' + item.PRICE_FORMATED})
                );
            }
            else if (deliveryCached && (deliveryCached.PRICE >= 0 || typeof deliveryCached.DELIVERY_DISCOUNT_PRICE !== 'undefined'))
            {
                labelNodes.push(
                    // BX.create('DIV', {
                    //     props: {className: 'bx-soa-pp-delivery-cost'},
                    //     html: typeof deliveryCached.DELIVERY_DISCOUNT_PRICE !== 'undefined'
                    //         ? deliveryCached.DELIVERY_DISCOUNT_PRICE_FORMATED
                    //         : BX.message('PRICE_DEFAULT') + ': ' + deliveryCached.PRICE_FORMATED})
                );
            }

			label = BX.create('DIV', {
				props: {
					className: 'bx-soa-pp-company-graf-container'
					+ (item.CALCULATE_ERRORS || deliveryCached && deliveryCached.CALCULATE_ERRORS ? ' bx-bd-waring' : '')},
				children: labelNodes
			});

			if (this.params.SHOW_DELIVERY_LIST_NAMES == 'Y')
			{
			 	title = BX.create('DIV', {
			 		props: {className: 'bx-soa-pp-company-smalltitle'},
			 		text: this.params.SHOW_DELIVERY_PARENT_NAMES != 'N' ? item.NAME : item.OWN_NAME
			 	});
			}

			itemNode = BX.create('DIV', {
				props: {className: 'bx-soa-pp-company col-lg-4 col-sm-4 col-xs-6'},
				children: [label],
				// children: [label, title],
				events: {click: BX.proxy(this.selectDelivery, this)}
			});
			checked && BX.addClass(itemNode, 'bx-selected');

			if (checked && this.result.LAST_ORDER_DATA.PICK_UP)
				this.lastSelectedDelivery = deliveryId;

			return itemNode;
		},

		editFadeDeliveryContent: function(node)
		{
			var selectedDelivery = this.getSelectedDelivery(),
				name = this.params.SHOW_DELIVERY_PARENT_NAMES != 'N' ? selectedDelivery.NAME : selectedDelivery.OWN_NAME,
				errorNode = this.deliveryHiddenBlockNode.querySelector('div.alert.alert-danger'),
				warningNode = this.deliveryHiddenBlockNode.querySelector('div.alert.alert-warning.alert-show'),
				extraService, logotype, imgSrc, arNodes, i;

			if (errorNode && errorNode.innerHTML)
				node.appendChild(errorNode.cloneNode(true));
			else
				this.getErrorContainer(node);

			if (warningNode && warningNode.innerHTML)
				node.appendChild(warningNode.cloneNode(true));

			if (selectedDelivery && selectedDelivery.NAME)
			{
				logotype = this.getImageSources(selectedDelivery, 'LOGOTIP');
				imgSrc = logotype && logotype.src_1x || this.defaultDeliveryLogo;
				arNodes = [
					BX.create('IMG', {props: {src: imgSrc, alt: ''}, style: {height: '22px'}}),
					BX.create('STRONG', {text: name})
				];

				if (this.params.DELIVERY_FADE_EXTRA_SERVICES == 'Y' && BX.util.object_keys(selectedDelivery.EXTRA_SERVICES).length)
				{
					arNodes.push(BX.create('BR'));

					for (i in selectedDelivery.EXTRA_SERVICES)
					{
						if (selectedDelivery.EXTRA_SERVICES.hasOwnProperty(i))
						{
							extraService = selectedDelivery.EXTRA_SERVICES[i];
							if (extraService.value && extraService.value != 'N' && extraService.canUserEditValue)
							{
								arNodes.push(BX.create('BR'));
								arNodes.push(BX.create('STRONG', {text: extraService.name + ': '}));
								arNodes.push(extraService.viewControl);
							}
						}
					}
				}

				node.appendChild(
					BX.create('DIV', {
						props: {className: 'col-sm-9 bx-soa-pp-company-selected'},
						children: arNodes
					})
				);
				node.appendChild(
					BX.create('DIV', {
						props: {className: 'col-sm-3 bx-soa-pp-price'},
						children: this.getDeliveryPriceNodes(selectedDelivery)
					})
				);
			}
			else
				node.appendChild(BX.create('STRONG', {text: BX.message('SOA_DELIVERY_SELECT_ERROR')}));

			node.appendChild(BX.create('DIV', {style: {clear: 'both'}}));
			BX.bind(node.querySelector('.alert.alert-danger'), 'click', BX.proxy(this.showByClick, this));
			BX.bind(node.querySelector('.alert.alert-warning'), 'click', BX.proxy(this.showByClick, this));
		},

		selectDelivery: function(event)
		{
			if (!this.orderBlockNode)
				return;

			var target = event.target || event.srcElement,
				actionSection =  BX.hasClass(target, 'bx-soa-pp-company') ? target : BX.findParent(target, {className: 'bx-soa-pp-company'}),
				selectedSection = this.deliveryBlockNode.querySelector('.bx-soa-pp-company.bx-selected'),
				actionInput, selectedInput;

			if (BX.hasClass(actionSection, 'bx-selected'))
				return BX.PreventDefault(event);

			if (actionSection)
			{
				actionInput = actionSection.querySelector('input[type=checkbox]');
				BX.addClass(actionSection, 'bx-selected');
				actionInput.checked = true;
			}
			if (selectedSection)
			{
				selectedInput = selectedSection.querySelector('input[type=checkbox]');
				BX.removeClass(selectedSection, 'bx-selected');
				selectedInput.checked = false;
			}

			this.sendRequest();
		},

		getSelectedDelivery: function()
		{
			var deliveryCheckbox = this.deliveryBlockNode.querySelector('input[type=checkbox][name=DELIVERY_ID]:checked'),
				currentDelivery = false,
				deliveryId, i;

			if (!deliveryCheckbox)
				deliveryCheckbox = this.deliveryHiddenBlockNode.querySelector('input[type=checkbox][name=DELIVERY_ID]:checked');

			if (!deliveryCheckbox)
				deliveryCheckbox = this.deliveryHiddenBlockNode.querySelector('input[type=hidden][name=DELIVERY_ID]');

			if (deliveryCheckbox)
			{
				deliveryId = deliveryCheckbox.value;

				for (i in this.result.DELIVERY)
				{
					if (this.result.DELIVERY[i].ID == deliveryId)
					{
						currentDelivery = this.result.DELIVERY[i];
						break;
					}
				}
			}

			return currentDelivery;
		},

		activatePickUp: function(deliveryName)
		{
			if (!this.pickUpBlockNode || !this.pickUpHiddenBlockNode)
				return;

			this.pickUpBlockNode.style.display = '';
			this.pickUpBlockNode.querySelector('h2.bx-soa-section-title').innerHTML =
				'<span class="bx-soa-section-title-count"></span>' + BX.util.htmlspecialchars(deliveryName);

			if (BX.hasClass(this.pickUpBlockNode, 'bx-active'))
				return;

			BX.addClass(this.pickUpBlockNode, 'bx-active');
			this.pickUpBlockNode.style.display = '';
		},

		deactivatePickUp: function()
		{
			if (!this.pickUpBlockNode || !this.pickUpHiddenBlockNode)
				return;

			if (!BX.hasClass(this.pickUpBlockNode, 'bx-active'))
				return;

			BX.removeClass(this.pickUpBlockNode, 'bx-active');
			this.pickUpBlockNode.style.display = 'none';
		},

		editPickUpBlock: function(active)
		{
			if (!this.pickUpBlockNode || !this.pickUpHiddenBlockNode || !BX.hasClass(this.pickUpBlockNode, 'bx-active') || !this.result.DELIVERY)
				return;

			this.initialized.pickup = false;

			if (active)
				this.editActivePickUpBlock(true);
			else
				this.editFadePickUpBlock();

			this.initialized.pickup = true;
		},

		editActivePickUpBlock: function(activeNodeMode)
		{
			var node = activeNodeMode ? this.pickUpBlockNode : this.pickUpHiddenBlockNode,
				pickUpContent, pickUpContentCol;

			if (this.initialized.pickup)
			{
				BX.remove(BX.lastChild(node));
				node.appendChild(BX.firstChild(this.pickUpHiddenBlockNode));

				if (
					this.params.SHOW_NEAREST_PICKUP === 'Y'
					&& this.maps
					&& !this.maps.maxWaitTimeExpired
				)
				{
					this.maps.maxWaitTimeExpired = true;
					this.initPickUpPagination();
					this.editPickUpList(true);
					this.pickUpFinalAction();
				}

				if (this.maps && !this.pickUpMapFocused)
				{
					this.pickUpMapFocused = true;
					setTimeout(BX.proxy(this.maps.pickUpMapFocusWaiter, this.maps), 200);
				}
			}
			else
			{
				pickUpContent = node.querySelector('.bx-soa-section-content');
				if (!pickUpContent)
				{
					pickUpContent = this.getNewContainer();
					node.appendChild(pickUpContent);
				}
				BX.cleanNode(pickUpContent);

				pickUpContentCol = BX.create('DIV', {props: {className: 'col-xs-12'}});
				this.editPickUpMap(pickUpContentCol);
				this.editPickUpLoader(pickUpContentCol);

				pickUpContent.appendChild(
					BX.create('DIV', {
						props: {className: 'bx_soa_pickup row'},
						children: [pickUpContentCol]
					})
				);

				if (this.params.SHOW_PICKUP_MAP != 'Y' || this.params.SHOW_NEAREST_PICKUP != 'Y')
				{
					this.initPickUpPagination();
					this.editPickUpList(true);
					this.pickUpFinalAction();
				}

				this.getBlockFooter(pickUpContent);
			}
		},

		editFadePickUpBlock: function()
		{
			var pickUpContent = this.pickUpBlockNode.querySelector('.bx-soa-section-content'), newContent;

			if (this.initialized.pickup)
			{
				this.pickUpHiddenBlockNode.appendChild(pickUpContent);
			}
			else
			{
				this.editActivePickUpBlock(false);
				BX.remove(BX.lastChild(this.pickUpBlockNode));
			}

			newContent = this.getNewContainer();
			this.pickUpBlockNode.appendChild(newContent);

			this.editFadePickUpContent(newContent);
		},

		editFadePickUpContent: function(pickUpContainer)
		{
			var selectedPickUp = this.getSelectedPickUp(), html = '', logotype, imgSrc;

			if (selectedPickUp)
			{
				if (this.params.SHOW_STORES_IMAGES == 'Y')
				{
					logotype = this.getImageSources(selectedPickUp, 'IMAGE_ID');
					imgSrc = logotype.src_1x || this.defaultStoreLogo;

					html += '<img src="' + imgSrc + '" class="bx-soa-pickup-preview-img">';
				}

				html += '<strong>' + BX.util.htmlspecialchars(selectedPickUp.TITLE) + '</strong>';
				if (selectedPickUp.ADDRESS)
					html += '<br><strong>' + BX.message('SOA_PICKUP_ADDRESS') + ':</strong> ' + BX.util.htmlspecialchars(selectedPickUp.ADDRESS);

				if (selectedPickUp.PHONE)
					html += '<br><strong>' + BX.message('SOA_PICKUP_PHONE') + ':</strong> ' + BX.util.htmlspecialchars(selectedPickUp.PHONE);

				if (selectedPickUp.SCHEDULE)
					html += '<br><strong>' + BX.message('SOA_PICKUP_WORK') + ':</strong> ' + BX.util.htmlspecialchars(selectedPickUp.SCHEDULE);

				if (selectedPickUp.DESCRIPTION)
					html += '<br><strong>' + BX.message('SOA_PICKUP_DESC') + ':</strong> ' + BX.util.htmlspecialchars(selectedPickUp.DESCRIPTION);

				pickUpContainer.innerHTML = html;

				if (this.params.SHOW_STORES_IMAGES == 'Y')
				{
					BX.bind(pickUpContainer.querySelector('.bx-soa-pickup-preview-img'), 'click', BX.delegate(function(e){
						this.popupShow(e, logotype && logotype.src_orig || imgSrc);
					}, this));
				}
			}
		},

		getPickUpInfoArray: function(storeIds)
		{
			if (!storeIds || storeIds.length <= 0)
				return [];

			var arr = [], i;

			for (i = 0; i < storeIds.length; i++)
				if (this.result.STORE_LIST[storeIds[i]])
					arr.push(this.result.STORE_LIST[storeIds[i]]);

			return arr;
		},

		getSelectedPickUp: function()
		{
			var pickUpInput = BX('BUYER_STORE'),
				currentPickUp, pickUpId,
				allStoresList = this.result.STORE_LIST,
				stores, i;

			if (pickUpInput)
			{
				pickUpId = pickUpInput.value;
				currentPickUp = allStoresList[pickUpId];

				if (!currentPickUp)
				{
					stores = this.getSelectedDelivery().STORE;
					if (stores)
					{
						for (i in stores)
						{
							if (stores.hasOwnProperty(i))
							{
								currentPickUp = allStoresList[stores[i]];
								pickUpInput.setAttribute('value', stores[i]);
								break;
							}
						}
					}
				}
			}

			return currentPickUp;
		},

		/**
		 * Checking delivery for pick ups. Displaying/hiding pick up block node.
		 */
		checkPickUpShow: function()
		{
			var currentDelivery = this.getSelectedDelivery(), name, stores;

			if (currentDelivery && currentDelivery.STORE && currentDelivery.STORE.length)
				stores = this.getPickUpInfoArray(currentDelivery.STORE);

			if (stores && stores.length)
			{
				name = this.params.SHOW_DELIVERY_PARENT_NAMES != 'N' ? currentDelivery.NAME : currentDelivery.OWN_NAME;
				currentDelivery.STORE_MAIN = currentDelivery.STORE;
				this.activatePickUp(name);
				this.editSection(this.pickUpBlockNode);
			}
			else
			{
				this.deactivatePickUp();
			}
		},

		geoLocationSuccessCallback: function(result)
		{
			var activeStores,
				currentDelivery = this.getSelectedDelivery();

			if (currentDelivery && currentDelivery.STORE)
			{
				activeStores = this.getPickUpInfoArray(currentDelivery.STORE);
			}

			if (activeStores && activeStores.length >= this.options.pickUpMap.minToShowNearestBlock)
			{
				this.editPickUpRecommendList(result.geoObjects.get(0));
			}

			this.initPickUpPagination();
			this.editPickUpList(true);
			this.pickUpFinalAction();
		},

		geoLocationFailCallback: function()
		{
			this.initPickUpPagination();
			this.editPickUpList(true);
			this.pickUpFinalAction();
		},

		initMaps: function()
		{
			this.maps = BX.Sale.OrderAjaxComponent.Maps.init(this);
			if (this.maps)
			{
				this.mapsReady = true;
				this.resizeMapContainers();

				if (this.params.SHOW_PICKUP_MAP === 'Y' && BX('pickUpMap'))
				{
					var currentDelivery = this.getSelectedDelivery();
					if (currentDelivery && currentDelivery.STORE && currentDelivery.STORE.length)
					{
						var activeStores = this.getPickUpInfoArray(currentDelivery.STORE);
					}

					if (activeStores && activeStores.length)
					{
						var selected = this.getSelectedPickUp();
						this.maps.initializePickUpMap(selected);

						if (this.params.SHOW_NEAREST_PICKUP === 'Y')
						{
							this.maps.showNearestPickups(BX.proxy(this.geoLocationSuccessCallback, this), BX.proxy(this.geoLocationFailCallback, this));
						}

						this.maps.buildBalloons(activeStores);
					}
				}

				if (this.params.SHOW_MAP_IN_PROPS === 'Y' && BX('propsMap'))
				{
					var propsMapData = this.getPropertyMapData();
					this.maps.initializePropsMap(propsMapData);
				}
			}
		},

		getPropertyMapData: function()
		{
			var currentProperty, locationId, k;
			var data = this.options.propertyMap.defaultMapPosition;

			for (k in this.result.ORDER_PROP.properties)
			{
				if (this.result.ORDER_PROP.properties.hasOwnProperty(k))
				{
					currentProperty = this.result.ORDER_PROP.properties[k];
					if (currentProperty.IS_LOCATION == 'Y')
					{
						locationId = currentProperty.ID;
						break;
					}
				}
			}

			if (this.locations[locationId] && this.locations[locationId][0] && this.locations[locationId][0].coordinates)
			{
				currentProperty = this.locations[locationId][0].coordinates;

				if (parseFloat(currentProperty.LONGITUDE) != 0 && parseFloat(currentProperty.LATITUDE) != 0)
				{
					data.lat = parseFloat(currentProperty.LATITUDE);
					data.lon = parseFloat(currentProperty.LONGITUDE);
				}
			}

			return data;
		},

		resizeMapContainers: function()
		{
			var pickUpMapContainer = BX('pickUpMap'),
				propertyMapContainer = BX('propsMap'),
				resizeBy = this.propsBlockNode,
				width, height;

			if (resizeBy && (pickUpMapContainer || propertyMapContainer))
			{
				width = resizeBy.clientWidth;
				height = parseInt(width / 16 * 9);

				if (this.params.SHOW_PICKUP_MAP === 'Y' && pickUpMapContainer)
				{
					pickUpMapContainer.style.height = height + 'px';
				}

				if (this.params.SHOW_MAP_IN_PROPS === 'Y' && propertyMapContainer)
				{
					propertyMapContainer.style.height = height + 'px';
				}
			}
		},

		editPickUpMap: function(pickUpContent)
		{
			pickUpContent.appendChild(BX.create('DIV', {
				props: {id: 'pickUpMap'},
				style: {width: '100%', marginBottom: '10px'}
			}));
		},

		editPickUpLoader: function(pickUpContent)
		{
			pickUpContent.appendChild(
				BX.create('DIV', {
					props: {id: 'pickUpLoader', className: 'text-center'},
					children: [BX.create('IMG', {props: {src: this.templateFolder + '/images/loader.gif'}})]
				})
			);
		},

		editPickUpList: function(isNew)
		{
			if (!this.pickUpPagination.currentPage || !this.pickUpPagination.currentPage.length)
				return;

			BX.remove(BX('pickUpLoader'));

			var pickUpList = BX.create('DIV', {props: {className: 'bx-soa-pickup-list main'}}),
				buyerStoreInput = BX('BUYER_STORE'),
				selectedStore,
				container, i, found = false,
				recommendList, selectedDelivery, currentStore, storeNode;

			if (buyerStoreInput)
				selectedStore = buyerStoreInput.value;

			recommendList = this.pickUpBlockNode.querySelector('.bx-soa-pickup-list.recommend');
			if (!recommendList)
				recommendList = this.pickUpHiddenBlockNode.querySelector('.bx-soa-pickup-list.recommend');

			if (!recommendList || !recommendList.querySelector('.bx-soa-pickup-list-item.bx-selected'))
			{
				selectedDelivery = this.getSelectedDelivery();
				if (selectedDelivery && selectedDelivery.STORE)
				{
					for (i = 0; i < selectedDelivery.STORE.length; i++)
						if (selectedDelivery.STORE[i] == selectedStore)
							found = true;
				}
			}
			else
				found = true;

			for (i = 0; i < this.pickUpPagination.currentPage.length; i++)
			{
				currentStore = this.pickUpPagination.currentPage[i];

				if (currentStore.ID == selectedStore || parseInt(selectedStore) == 0 || !found)
				{
					selectedStore = buyerStoreInput.value = currentStore.ID;
					found = true;
				}

				storeNode = this.createPickUpItem(currentStore, {selected: currentStore.ID == selectedStore});
				pickUpList.appendChild(storeNode);
			}

			if (!!isNew)
			{
				container = this.pickUpHiddenBlockNode.querySelector('.bx_soa_pickup>.col-xs-12');
				if (!container)
					container = this.pickUpBlockNode.querySelector('.bx_soa_pickup>.col-xs-12');

				container.appendChild(
					BX.create('DIV', {
						props: {className: 'bx-soa-pickup-subTitle'},
						html: this.params.MESS_PICKUP_LIST
					})
				);
				container.appendChild(pickUpList);
			}
			else
			{
				container = this.pickUpBlockNode.querySelector('.bx-soa-pickup-list.main');
				BX.insertAfter(pickUpList, container);
				BX.remove(container);
			}

			this.pickUpPagination.show && this.showPagination('pickUp', pickUpList);
		},

		pickUpFinalAction: function()
		{
			var selectedDelivery = this.getSelectedDelivery(),
				deliveryChanged;

			if (selectedDelivery)
			{
				deliveryChanged = this.lastSelectedDelivery !== parseInt(selectedDelivery.ID);
				this.lastSelectedDelivery = parseInt(selectedDelivery.ID);
			}

			if (deliveryChanged && this.pickUpBlockNode.id !== this.activeSectionId)
			{
				if (this.pickUpBlockNode.id !== this.activeSectionId)
				{
					this.editFadePickUpContent(BX.lastChild(this.pickUpBlockNode));
				}

				BX.removeClass(this.pickUpBlockNode, 'bx-step-completed');
			}

			this.maps && this.maps.pickUpFinalAction();
		},

		getStoreInfoHtml: function(currentStore)
		{
			var html = '';

			if (currentStore.ADDRESS)
				html += BX.message('SOA_PICKUP_ADDRESS') + ': ' + BX.util.htmlspecialchars(currentStore.ADDRESS) + '<br>';

			if (currentStore.PHONE)
				html += BX.message('SOA_PICKUP_PHONE') + ': ' + BX.util.htmlspecialchars(currentStore.PHONE) + '<br>';

			if (currentStore.SCHEDULE)
				html += BX.message('SOA_PICKUP_WORK') + ': ' + BX.util.htmlspecialchars(currentStore.SCHEDULE) + '<br>';

			if (currentStore.DESCRIPTION)
				html += BX.message('SOA_PICKUP_DESC') + ': ' + BX.util.htmlspecialchars(currentStore.DESCRIPTION) + '<br>';

			return html;
		},

		createPickUpItem: function(currentStore, options)
		{
			options = options || {};

			var imgClassName = 'bx-soa-pickup-l-item-detail',
				buttonClassName = 'bx-soa-pickup-l-item-btn',
				logoNode, logotype, html, storeNode, imgSrc;

			if (this.params.SHOW_STORES_IMAGES === 'Y')
			{
				logotype = this.getImageSources(currentStore, 'IMAGE_ID');
				imgSrc = logotype && logotype.src_1x || this.defaultStoreLogo;
				logoNode = BX.create('IMG', {
					props: {
						src: imgSrc,
						className: 'bx-soa-pickup-l-item-img'
					},
					events: {
						click: BX.delegate(function(e){
							this.popupShow(e, logotype && logotype.src_orig || imgSrc);
						}, this)
					}
				});
			}
			else
			{
				imgClassName += ' no-image';
				buttonClassName += ' no-image';
			}

			html = this.getStoreInfoHtml(currentStore);
			storeNode = BX.create('DIV', {
				props: {className: 'bx-soa-pickup-list-item', id: 'store-' + currentStore.ID},
				children: [
					BX.create('DIV', {
						props: {className: 'bx-soa-pickup-l-item-adress'},
						children: options.distance ? [
							BX.util.htmlspecialchars(currentStore.ADDRESS),
							' ( ~' + options.distance + ' ' + BX.message('SOA_DISTANCE_KM') + ' ) '
						] : [BX.util.htmlspecialchars(currentStore.ADDRESS)]
					}),
					BX.create('DIV', {
						props: {className: imgClassName},
						children: [
							logoNode,
							BX.create('DIV', {props: {className: 'bx-soa-pickup-l-item-name'}, text: currentStore.TITLE}),
							BX.create('DIV', {props: {className: 'bx-soa-pickup-l-item-desc'}, html: html})
						]
					}),
					BX.create('DIV', {
						props: {className: buttonClassName},
						children: [
							BX.create('A', {
								props: {href: '', className: 'btn btn-sm btn-default'},
								html: this.params.MESS_SELECT_PICKUP,
								events: {
									click: BX.delegate(function(event){
										this.selectStore(event);
										this.clickNextAction(event)
									}, this)
								}
							})
						]
					})
				],
				events: {
					click: BX.proxy(this.selectStore, this)
				}
			});

			if (options.selected)
				BX.addClass(storeNode, 'bx-selected');

			return storeNode;
		},

		editPickUpRecommendList: function(geoLocation)
		{
			if (!this.maps || !this.maps.canUseRecommendList() || !geoLocation)
			{
				return;
			}

			BX.remove(BX('pickUpLoader'));

			var recommendList = BX.create('DIV', {props: {className: 'bx-soa-pickup-list recommend'}}),
				buyerStoreInput = BX('BUYER_STORE'),
				selectedDelivery = this.getSelectedDelivery();

			var i, currentStore, currentStoreId, distance, storeNode, container;

			var recommendedStoreIds = this.maps.getRecommendedStoreIds(geoLocation);
			for (i = 0; i < recommendedStoreIds.length; i++)
			{
				currentStoreId = recommendedStoreIds[i];
				currentStore = this.getPickUpInfoArray([currentStoreId])[0];

				if (i === 0 && parseInt(selectedDelivery.ID) !== this.lastSelectedDelivery)
				{
					buyerStoreInput.value = parseInt(currentStoreId);
				}

				distance = this.maps.getDistance(geoLocation, currentStoreId);
				storeNode = this.createPickUpItem(currentStore, {
					selected: buyerStoreInput.value === currentStoreId,
					distance: distance
				});
				recommendList.appendChild(storeNode);

				if (selectedDelivery.STORE_MAIN)
				{
					selectedDelivery.STORE_MAIN.splice(selectedDelivery.STORE_MAIN.indexOf(currentStoreId), 1);
				}
			}

			container = this.pickUpHiddenBlockNode.querySelector('.bx_soa_pickup>.col-xs-12');
			if (!container)
			{
				container = this.pickUpBlockNode.querySelector('.bx_soa_pickup>.col-xs-12');
			}

			container.appendChild(
				BX.create('DIV', {
					props: {className: 'bx-soa-pickup-subTitle'},
					html: this.params.MESS_NEAREST_PICKUP_LIST
				})
			);
			container.appendChild(recommendList);
		},

		selectStore: function(event)
		{
			var storeItem,
				storeInput = BX('BUYER_STORE'),
				selectedPickUp, storeItemId, i, k, page,
				target, h1, h2;

			if (BX.type.isString(event))
			{
				storeItem = BX('store-' + event);
				if (!storeItem)
				{
					for (i = 0; i < this.pickUpPagination.pages.length; i++)
					{
						page = this.pickUpPagination.pages[i];
						for (k = 0; k < page.length; k++)
						{
							if (page[k].ID == event)
							{
								this.showPickUpItemsPage(++i);
								break;
							}
						}
					}
					storeItem = BX('store-' + event);
				}
			}
			else
			{
				target = event.target || event.srcElement;
				storeItem = BX.hasClass(target, 'bx-soa-pickup-list-item')
					? target
					: BX.findParent(target, {className: 'bx-soa-pickup-list-item'});
			}

			if (storeItem && storeInput)
			{
				if (BX.hasClass(storeItem, 'bx-selected'))
					return;

				selectedPickUp = this.pickUpBlockNode.querySelector('.bx-selected');
				storeItemId = storeItem.id.substr('store-'.length);

				BX.removeClass(selectedPickUp, 'bx-selected');

				h1 = storeItem.clientHeight;
				storeItem.style.overflow = 'hidden';
				BX.addClass(storeItem, 'bx-selected');
				h2 = storeItem.clientHeight;
				storeItem.style.height = h1 + 'px';

				new BX.easing({
					duration: 300,
					start: {height: h1, opacity: 0},
					finish: {height: h2, opacity: 100},
					transition: BX.easing.transitions.quad,
					step: function(state){
						storeItem.style.height = state.height + "px";
					},
					complete: function(){
						storeItem.removeAttribute('style');
					}
				}).animate();

				storeInput.setAttribute('value', storeItemId);
				this.maps && this.maps.selectBalloon(storeItemId);
			}
		},

		getDeliverySortedArray: function(objDelivery)
		{
			var deliveries = [],
				problemDeliveries = [],
				sortFunc = function(a, b){
					var sort = parseInt(a.SORT) - parseInt(b.SORT);
					if (sort === 0)
					{
						return a.OWN_NAME.toLowerCase() > b.OWN_NAME.toLowerCase()
							? 1
							: (a.OWN_NAME.toLowerCase() < b.OWN_NAME.toLowerCase() ? -1 : 0);
					}
					else
					{
						return sort;
					}
				},
				k;

			for (k in objDelivery)
			{
				if (objDelivery.hasOwnProperty(k))
				{
					if (this.params.SHOW_NOT_CALCULATED_DELIVERIES === 'L' && objDelivery[k].CALCULATE_ERRORS)
					{
						problemDeliveries.push(objDelivery[k]);
					}
					else
					{
						deliveries.push(objDelivery[k]);
					}
				}
			}

			deliveries.sort(sortFunc);
			problemDeliveries.sort(sortFunc);

			return deliveries.concat(problemDeliveries);
		},

		editPropsBlock: function(active)
		{
			if (!this.propsBlockNode || !this.propsHiddenBlockNode || !this.result.ORDER_PROP)
				return;

			if (active)
				this.editActivePropsBlock(true);
			else
				this.editFadePropsBlock();

			this.initialized.props = true;
		},

		editActivePropsBlock: function(activeNodeMode)
		{
			var node = activeNodeMode ? this.propsBlockNode : this.propsHiddenBlockNode,
				propsContent, propsNode, selectedDelivery, showPropMap = false, i, validationErrors;

			if (this.initialized.props)
			{
				BX.remove(BX.lastChild(node));
				node.appendChild(BX.firstChild(this.propsHiddenBlockNode));
				this.maps && setTimeout(BX.proxy(this.maps.propsMapFocusWaiter, this.maps), 200);
			}
			else
			{
				propsContent = node.querySelector('.bx-soa-section-content');
				if (!propsContent)
				{
					propsContent = this.getNewContainer();
					node.appendChild(propsContent);
				}
				else
					BX.cleanNode(propsContent);

				this.getErrorContainer(propsContent);

				propsNode = BX.create('DIV', {props: {className: 'row'}});
				selectedDelivery = this.getSelectedDelivery();

				if (
					selectedDelivery && this.params.SHOW_MAP_IN_PROPS === 'Y'
					&& this.params.SHOW_MAP_FOR_DELIVERIES && this.params.SHOW_MAP_FOR_DELIVERIES.length
				)
				{
					for (i = 0; i < this.params.SHOW_MAP_FOR_DELIVERIES.length; i++)
					{
						if (parseInt(selectedDelivery.ID) === parseInt(this.params.SHOW_MAP_FOR_DELIVERIES[i]))
						{
							showPropMap = true;
							break;
						}
					}
				}

				this.editPropsItems(propsNode);
				showPropMap && this.editPropsMap(propsNode);
				this.editPropsComment(propsNode);
				propsContent.appendChild(propsNode);
				this.getBlockFooter(propsContent);

				if (this.propsBlockNode.getAttribute('data-visited') === 'true')
				{
					validationErrors = this.isValidPropertiesBlock(true);
					if (validationErrors.length)
						BX.addClass(this.propsBlockNode, 'bx-step-error');
					else
						BX.removeClass(this.propsBlockNode, 'bx-step-error');
				}
			}
		},

		editFadePropsBlock: function()
		{
			var propsContent = this.propsBlockNode.querySelector('.bx-soa-section-content'), newContent;

			if (this.initialized.props)
			{
				this.propsHiddenBlockNode.appendChild(propsContent);
			}
			else
			{
				this.editActivePropsBlock(false);
				BX.remove(BX.lastChild(this.propsBlockNode));
			}

			newContent = this.getNewContainer();
			this.propsBlockNode.appendChild(newContent);

			this.editFadePropsContent(newContent);
		},

		editFadePropsContent: function(node)
		{
			if (!node || !this.locationsInitialized)
				return;

			var errorNode = this.propsHiddenBlockNode.querySelector('.alert'),
				personType = this.getSelectedPersonType(),
				fadeParamName, props,
				group, property, groupIterator, propsIterator, i, validPropsErrors;

			BX.cleanNode(node);

			if (errorNode)
				node.appendChild(errorNode.cloneNode(true));

			if (personType)
			{
				fadeParamName = 'PROPS_FADE_LIST_' + personType.ID;
				props = this.params[fadeParamName];
			}

			if (!props || props.length === 0)
			{
				node.innerHTML += '<strong>' + BX.message('SOA_ORDER_PROPS') + '</strong>';
			}
			else
			{
				groupIterator = this.fadedPropertyCollection.getGroupIterator();
				while (group = groupIterator())
				{
					propsIterator = group.getIterator();
					while (property = propsIterator())
					{
						for (i = 0; i < props.length; i++)
							if (props[i] == property.getId() && property.getSettings()['IS_ZIP'] != 'Y')
								this.getPropertyRowNode(property, node, true);
					}
				}
			}

			if (this.propsBlockNode.getAttribute('data-visited') === 'true')
			{
				validPropsErrors = this.isValidPropertiesBlock();
				if (validPropsErrors.length)
					this.showError(this.propsBlockNode, validPropsErrors);
			}

			BX.bind(node.querySelector('.alert.alert-danger'), 'click', BX.proxy(this.showByClick, this));
			BX.bind(node.querySelector('.alert.alert-warning'), 'click', BX.proxy(this.showByClick, this));
		},

		editPropsItems: function(propsNode)
		{
			if (!this.result.ORDER_PROP || !this.propertyCollection)
				return;

			var propsItemsContainer = BX.create('DIV', {props: {className: 'col-sm-12 bx-soa-customer'}}),
				group, property, groupIterator = this.propertyCollection.getGroupIterator(), propsIterator;

			if (!propsItemsContainer)
				propsItemsContainer = this.propsBlockNode.querySelector('.col-sm-12.bx-soa-customer');

			while (group = groupIterator())
			{
				propsIterator =  group.getIterator();
				while (property = propsIterator())
				{
					if (
						this.deliveryLocationInfo.loc == property.getId()
						|| this.deliveryLocationInfo.zip == property.getId()
						|| this.deliveryLocationInfo.city == property.getId()
					)
						continue;

					this.getPropertyRowNode(property, propsItemsContainer, false);
				}
			}

			propsNode.appendChild(propsItemsContainer);
		},

		getPropertyRowNode: function(property, propsItemsContainer, disabled)
		{
			var propsItemNode = BX.create('DIV'),
				textHtml = '',
				propertyType = property.getType() || '',
				propertyDesc = property.getDescription() || '',
				label;

			if (disabled)
			{
				propsItemNode.innerHTML = '<strong>' + BX.util.htmlspecialchars(property.getName()) + ':</strong> ';
			}
			else
			{
				BX.addClass(propsItemNode, "form-group bx-soa-customer-field");

				textHtml += BX.util.htmlspecialchars(property.getName());
				if (propertyDesc.length && propertyType != 'STRING' && propertyType != 'NUMBER' && propertyType != 'DATE')
					textHtml += ' <small>(' + BX.util.htmlspecialchars(propertyDesc) + ')</small>';

                if (property.isRequired())
                    textHtml += '<span class="bx-authform-starrequired"> *</span>';

				label = BX.create('LABEL', {
					attrs: {'for': 'soa-property-' + property.getId()},
					props: {className: 'bx-soa-custom-label'},
					html: textHtml
				});
				propsItemNode.setAttribute('data-property-id-row', property.getId());
				propsItemNode.appendChild(label);
			}

			switch (propertyType)
			{
				case 'LOCATION':
					this.insertLocationProperty(property, propsItemNode, disabled);
					break;
				case 'DATE':
					this.insertDateProperty(property, propsItemNode, disabled);
					break;
				case 'FILE':
					this.insertFileProperty(property, propsItemNode, disabled);
					break;
				case 'STRING':
					this.insertStringProperty(property, propsItemNode, disabled);
					break;
				case 'ENUM':
					this.insertEnumProperty(property, propsItemNode, disabled);
					break;
				case 'Y/N':
					this.insertYNProperty(property, propsItemNode, disabled);
					break;
				case 'NUMBER':
					this.insertNumberProperty(property, propsItemNode, disabled);
			}

			propsItemsContainer.appendChild(propsItemNode);
		},

		insertLocationProperty: function(property, propsItemNode, disabled)
		{
			var propRow, propNodes, locationString, currentLocation, insertedLoc, propContainer, i, k, values = [];

			if (property.getId() in this.locations)
			{
				if (disabled)
				{
					propRow = this.propsHiddenBlockNode.querySelector('[data-property-id-row="' + property.getId() + '"]');
					if (propRow)
					{
						propNodes = propRow.querySelectorAll('div.bx-soa-loc');
						for (i = 0; i < propNodes.length; i++)
						{
							locationString = this.getLocationString(propNodes[i]);
							values.push(locationString.length ? locationString : BX.message('SOA_NOT_SELECTED'));
						}
					}
					propsItemNode.innerHTML += values.join('<br>');
				}
				else
				{
					propContainer = BX.create('DIV', {props: {className: 'soa-property-container'}});
					propRow = this.locations[property.getId()];
					for (i = 0; i < propRow.length; i ++)
					{
						currentLocation = propRow[i] ? propRow[i].output : {};
						insertedLoc = BX.create('DIV', {props: {className: 'bx-soa-loc'}, html: currentLocation.HTML});

						if (property.isMultiple())
							insertedLoc.style.marginBottom = this.locationsTemplate == 'search' ? '5px' : '20px';

						propContainer.appendChild(insertedLoc);

						for (k in currentLocation.SCRIPT)
						{
							if (currentLocation.SCRIPT.hasOwnProperty(k))
								BX.evalGlobal(currentLocation.SCRIPT[k].JS);
						}
					}

					if (property.isMultiple())
					{
						propContainer.appendChild(
							BX.create('DIV', {
								attrs: {'data-prop-id': property.getId()},
								props: {className: 'btn btn-sm btn-default'},
								text: BX.message('ADD_DEFAULT'),
								events: {
									click: BX.proxy(this.addLocationProperty, this)
								}
							})
						);
					}

					propsItemNode.appendChild(propContainer);
				}
			}
		},

		addLocationProperty: function(e)
		{
			var target = e.target || e.srcElement,
				propId = target.getAttribute('data-prop-id'),
				lastProp = BX.previousSibling(target),
				insertedLoc, k, input, index = 0,
				prefix = 'sls-',
				randomStr = BX.util.getRandomString(5);

			if (BX.hasClass(lastProp, 'bx-soa-loc'))
			{
				if (this.locationsTemplate == 'search')
				{
					input = lastProp.querySelector('input[type=text][class=dropdown-field]');
					if (input)
						index = parseInt(input.name.substring(input.name.indexOf('[') + 1, input.name.indexOf(']'))) + 1;
				}
				else
				{
					input = lastProp.querySelectorAll('input[type=hidden]');
					if (input.length)
					{
						input = input[input.length - 1];
						index = parseInt(input.name.substring(input.name.indexOf('[') + 1, input.name.indexOf(']'))) + 1;
					}
				}
			}

			if (this.cleanLocations[propId])
			{
				insertedLoc = BX.create('DIV', {
					props: {className: 'bx-soa-loc'},
					style: {marginBottom: this.locationsTemplate == 'search' ? '5px' : '20px'},
					html: this.cleanLocations[propId].HTML.split('#key#').join(index).replace(/sls-\d{5}/g, prefix + randomStr)
				});
				target.parentNode.insertBefore(insertedLoc, target);

				BX.saleOrderAjax.addPropertyDesc({
					id: propId + '_' + index,
					attributes: {
						id: propId + '_' + index,
						type: 'LOCATION',
						valueSource: 'form'
					}
				});


				for (k in this.cleanLocations[propId].SCRIPT)
					if (this.cleanLocations[propId].SCRIPT.hasOwnProperty(k))
						BX.evalGlobal(this.cleanLocations[propId].SCRIPT[k].JS.split('_key__').join('_' + index).replace(/sls-\d{5}/g, prefix + randomStr));

				BX.saleOrderAjax.initDeferredControl();
			}
		},

		insertDateProperty: function(property, propsItemNode, disabled)
		{
			var prop, dateInputs, values, i,
				propContainer, inputText;

			if (disabled)
			{
				prop = this.propsHiddenBlockNode.querySelector('div[data-property-id-row="' + property.getId() + '"]');
				if (prop)
				{
					values = [];
					dateInputs = prop.querySelectorAll('input[type=text]');

					for (i = 0; i < dateInputs.length; i++)
						if (dateInputs[i].value && dateInputs[i].value.length)
							values.push(dateInputs[i].value);

					propsItemNode.innerHTML += this.valuesToString(values);
				}
			}
			else
			{
				propContainer = BX.create('DIV', {props: {className: 'soa-property-container'}});
				property.appendTo(propContainer);
				propsItemNode.appendChild(propContainer);
				inputText = propContainer.querySelectorAll('input[type=text]');

				for (i = 0; i < inputText.length; i++)
					this.alterDateProperty(property.getSettings(), inputText[i]);

				this.alterProperty(property.getSettings(), propContainer);
				this.bindValidation(property.getId(), propContainer);
			}
		},

		insertFileProperty: function(property, propsItemNode, disabled)
		{
			var prop, fileLinks, values, i, html,
				saved, propContainer;

			if (disabled)
			{
				prop = this.propsHiddenBlockNode.querySelector('div[data-property-id-row="' + property.getId() + '"]');
				if (prop)
				{
					values = [];
					fileLinks = prop.querySelectorAll('a');

					for (i = 0; i < fileLinks.length; i++)
					{
						html = fileLinks[i].innerHTML;
						if (html.length)
							values.push(html);
					}

					propsItemNode.innerHTML += this.valuesToString(values);
				}
			}
			else
			{
				saved = this.savedFilesBlockNode.querySelector('div[data-property-id-row="' + property.getId() + '"]');
				if (saved)
					propContainer = saved.querySelector('div.soa-property-container');

				if (propContainer)
					propsItemNode.appendChild(propContainer);
				else
				{
					propContainer = BX.create('DIV', {props: {className: 'soa-property-container'}});
					property.appendTo(propContainer);
					propsItemNode.appendChild(propContainer);
					this.alterProperty(property.getSettings(), propContainer);
				}
			}
		},

		insertStringProperty: function(property, propsItemNode, disabled)
		{
            var prop, inputs, values, i, propContainer;

			if (disabled)
			{
				prop = this.propsHiddenBlockNode.querySelector('div[data-property-id-row="' + property.getId() + '"]');
				if (prop)
				{
					values = [];
					inputs = prop.querySelectorAll('input[type=text]');
					if (inputs.length == 0)
						inputs = prop.querySelectorAll('textarea');

					if (inputs.length)
					{
						for (i = 0; i < inputs.length; i++)
						{
							if (inputs[i].value.length)
								values.push(inputs[i].value);
						}
					}

					propsItemNode.innerHTML += this.valuesToString(values);
				}
			}
			else
			{
				propContainer = BX.create('DIV', {props: {className: 'soa-property-container'}});
				property.appendTo(propContainer);
				propsItemNode.appendChild(propContainer);
				this.alterProperty(property.getSettings(), propContainer);
				this.bindValidation(property.getId(), propContainer);
			}
			
		},

		insertEnumProperty: function(property, propsItemNode, disabled)
		{
			var prop, inputs, values, i, propContainer;

			if (disabled)
			{
				prop = this.propsHiddenBlockNode.querySelector('div[data-property-id-row="' + property.getId() + '"]');
				if (prop)
				{
					values = [];
					inputs = prop.querySelectorAll('input[type=radio]');
					if (inputs.length)
					{
						for (i = 0; i < inputs.length; i++)
						{
							if (inputs[i].checked)
								values.push(inputs[i].nextSibling.nodeValue);
						}
					}
					inputs = prop.querySelectorAll('option');
					if (inputs.length)
					{
						for (i = 0; i < inputs.length; i++)
						{
							if (inputs[i].selected)
								values.push(inputs[i].innerHTML);
						}
					}

					propsItemNode.innerHTML += this.valuesToString(values);
				}
			}
			else
			{
				propContainer = BX.create('DIV', {props: {className: 'soa-property-container'}});
				property.appendTo(propContainer);
				propsItemNode.appendChild(propContainer);
				this.bindValidation(property.getId(), propContainer);
			}
		},

		insertYNProperty: function(property, propsItemNode, disabled)
		{
			var prop, inputs, values, i, propContainer;

			if (disabled)
			{
				prop = this.propsHiddenBlockNode.querySelector('div[data-property-id-row="' + property.getId() + '"]');
				if (prop)
				{
					values = [];
					inputs = prop.querySelectorAll('input[type=checkbox]');

					for (i = 0; i < inputs.length; i+=2)
						values.push(inputs[i].checked ? BX.message('SOA_YES') : BX.message('SOA_NO'));

					propsItemNode.innerHTML += this.valuesToString(values);
				}
			}
			else
			{
				propContainer = BX.create('DIV', {props: {className: 'soa-property-container'}});
				property.appendTo(propContainer);
				propsItemNode.appendChild(propContainer);
				this.alterProperty(property.getSettings(), propContainer);
				this.bindValidation(property.getId(), propContainer);
			}
		},

		insertNumberProperty: function(property, propsItemNode, disabled)
		{
			var prop, inputs, values, i, propContainer;

			if (disabled)
			{
				prop = this.propsHiddenBlockNode.querySelector('div[data-property-id-row="' + property.getId() + '"]');
				if (prop)
				{
					values = [];
					inputs = prop.querySelectorAll('input[type=text]');

					for (i = 0; i < inputs.length; i++)
						if (inputs[i].value.length)
							values.push(inputs[i].value);

					propsItemNode.innerHTML += this.valuesToString(values);
				}
			}
			else
			{
				propContainer = BX.create('DIV', {props: {className: 'soa-property-container'}});
				property.appendTo(propContainer);
				propsItemNode.appendChild(propContainer);
				this.alterProperty(property.getSettings(), propContainer);
				this.bindValidation(property.getId(), propContainer);
			}
		},

		valuesToString: function(values)
		{
			var str = values.join(', ');

			return str.length ? str : BX.message('SOA_NOT_SELECTED');
		},

		alterProperty: function(settings, propContainer)
		{
			var divs = BX.findChildren(propContainer, {tagName: 'DIV'}),
				i, textNode, inputs, del, add,
				fileInputs, accepts, fileTitles;

			if (divs && divs.length)
			{
				for (i = 0; i < divs.length; i++)
				{
					divs[i].style.margin = '5px 0';
				}
			}

			textNode = propContainer.querySelector('input[type=text]');
			if (!textNode)
				textNode = propContainer.querySelector('textarea');

			if (textNode)
			{
				textNode.id = 'soa-property-' + settings.ID;
				if (settings.IS_ADDRESS == 'Y')
					textNode.setAttribute('autocomplete', 'address');
				if (settings.IS_EMAIL == 'Y')
					textNode.setAttribute('autocomplete', 'email');
				if (settings.IS_PAYER == 'Y')
					textNode.setAttribute('autocomplete', 'name');
				if (settings.IS_PHONE == 'Y')
					textNode.setAttribute('autocomplete', 'tel');

				if (settings.PATTERN && settings.PATTERN.length)
				{
					textNode.removeAttribute('pattern');
				}
			}

			inputs = propContainer.querySelectorAll('input[type=text]');
			for (i = 0; i < inputs.length; i++)
			{
				inputs[i].placeholder = settings.DESCRIPTION;
				BX.addClass(inputs[i], 'form-control bx-soa-customer-input bx-ios-fix');
			}

			inputs = propContainer.querySelectorAll('select');
			for (i = 0; i < inputs.length; i++)
				BX.addClass(inputs[i], 'form-control');

			inputs = propContainer.querySelectorAll('textarea');
			for (i = 0; i < inputs.length; i++)
			{
				inputs[i].placeholder = settings.DESCRIPTION;
				BX.addClass(inputs[i], 'form-control bx-ios-fix');
			}

			del = propContainer.querySelectorAll('label');
			for (i = 0; i < del.length; i++)
				BX.remove(del[i]);

			if (settings.TYPE == 'FILE')
			{
				if (settings.ACCEPT && settings.ACCEPT.length)
				{
					fileInputs = propContainer.querySelectorAll('input[type=file]');
					accepts = this.getFileAccepts(settings.ACCEPT);
					for (i = 0; i < fileInputs.length; i++)
						fileInputs[i].setAttribute('accept', accepts);
				}

				fileTitles = propContainer.querySelectorAll('a');
				for (i = 0; i < fileTitles.length; i++)
				{
					BX.bind(fileTitles[i], 'click', function(e){
						var target = e.target || e.srcElement,
							fileInput = target && target.nextSibling && target.nextSibling.nextSibling;

						if (fileInput)
							BX.fireEvent(fileInput, 'change');
					});
				}
			}

			add = propContainer.querySelectorAll('input[type=button]');
			for (i = 0; i < add.length; i++)
			{
				BX.addClass(add[i], 'btn btn-default btn-sm');

				if (settings.MULTIPLE == 'Y' && i == add.length - 1)
					continue;

				if (settings.TYPE == 'FILE')
				{
					BX.prepend(add[i], add[i].parentNode);
					add[i].style.marginRight = '10px';
				}
			}

			if (add.length)
			{
				add = add[add.length - 1];
				BX.bind(add, 'click', BX.delegate(function(e){
					var target = e.target || e.srcElement,
						targetContainer = BX.findParent(target, {tagName: 'div', className: 'soa-property-container'}),
						del = targetContainer.querySelector('label'),
						add = targetContainer.querySelectorAll('input[type=button]'),
						textInputs = targetContainer.querySelectorAll('input[type=text]'),
						textAreas = targetContainer.querySelectorAll('textarea'),
						divs = BX.findChildren(targetContainer, {tagName: 'DIV'});

					var i, fileTitles, fileInputs, accepts;

					if (divs && divs.length)
					{
						for (i = 0; i < divs.length; i++)
						{
							divs[i].style.margin = '5px 0';
						}
					}

					this.bindValidation(settings.ID, targetContainer);

					if (add.length && add[add.length - 2])
					{
						BX.prepend(add[add.length - 2], add[add.length - 2].parentNode);
						add[add.length - 2].style.marginRight = '10px';
						BX.addClass(add[add.length - 2], 'btn btn-default btn-sm');
					}

					del && BX.remove(del);
					if (textInputs.length)
					{
						textInputs[textInputs.length - 1].placeholder = settings.DESCRIPTION;
						BX.addClass(textInputs[textInputs.length - 1], 'form-control bx-soa-customer-input bx-ios-fix');
						if (settings.TYPE == 'DATE')
							this.alterDateProperty(settings, textInputs[textInputs.length - 1]);

						if (settings.PATTERN && settings.PATTERN.length)
							textInputs[textInputs.length - 1].removeAttribute('pattern');
					}

					if (textAreas.length)
					{
						textAreas[textAreas.length - 1].placeholder = settings.DESCRIPTION;
						BX.addClass(textAreas[textAreas.length - 1], 'form-control bx-ios-fix');
					}

					if (settings.TYPE == 'FILE')
					{
						if (settings.ACCEPT && settings.ACCEPT.length)
						{
							fileInputs = propContainer.querySelectorAll('input[type=file]');
							accepts = this.getFileAccepts(settings.ACCEPT);
							for (i = 0; i < fileInputs.length; i++)
								fileInputs[i].setAttribute('accept', accepts);
						}

						fileTitles = targetContainer.querySelectorAll('a');
						BX.bind(fileTitles[fileTitles.length - 1], 'click', function(e){
							var target = e.target || e.srcElement,
								fileInput = target && target.nextSibling && target.nextSibling.nextSibling;

							if (fileInput)
								setTimeout(function(){BX.fireEvent(fileInput, 'change');}, 10);
						});
					}
				}, this));
			}
		},

		alterDateProperty: function(settings, inputText)
		{
			var parentNode = BX.findParent(inputText, {tagName: 'DIV'}),
				addon;

			BX.addClass(parentNode, 'input-group');
			addon = BX.create('DIV', {
				props: {className: 'input-group-addon'},
				children: [BX.create('I', {props: {className: 'bx-calendar'}})]
			});
			BX.insertAfter(addon, inputText);
			BX.remove(parentNode.querySelector('input[type=button]'));
			BX.bind(addon, 'click', BX.delegate(function(e){
				var target = e.target || e.srcElement,
					parentNode = BX.findParent(target, {tagName: 'DIV', className: 'input-group'});

				BX.calendar({
					node: parentNode.querySelector('.input-group-addon'),
					field: parentNode.querySelector('input[type=text]').name,
					form: '',
					bTime: settings.TIME == 'Y',
					bHideTime: false
				});
			}, this));
		},

		isValidForm: function()
		{
			if (!this.options.propertyValidation)
				return true;

			var regionErrors = this.isValidRegionBlock(),
				propsErrors = this.isValidPropertiesBlock(),
				navigated = false, tooltips, i;

			if (regionErrors.length)
			{
				navigated = true;
				this.animateScrollTo(this.regionBlockNode, 800, 50);
			}

			if (propsErrors.length && !navigated)
			{
				if (this.activeSectionId == this.propsBlockNode.id)
				{
					tooltips = this.propsBlockNode.querySelectorAll('div.tooltip');
					for (i = 0; i < tooltips.length; i++)
					{
						if (tooltips[i].getAttribute('data-state') == 'opened')
						{
							this.animateScrollTo(BX.findParent(tooltips[i], {className: 'form-group bx-soa-customer-field'}), 800, 50);
							break;
						}
					}
				}
				else
					this.animateScrollTo(this.propsBlockNode, 800, 50);
			}

			if (regionErrors.length)
			{
				this.showError(this.regionBlockNode, regionErrors);
				BX.addClass(this.regionBlockNode, 'bx-step-error');
			}

			if (propsErrors.length)
			{
				if (this.activeSectionId !== this.propsBlockNode.id)
					this.showError(this.propsBlockNode, propsErrors);

				BX.addClass(this.propsBlockNode, 'bx-step-error');
			}

			return !(regionErrors.length + propsErrors.length);
		},

		isValidRegionBlock: function()
		{
			if (!this.options.propertyValidation)
				return [];

			var regionProps = this.orderBlockNode.querySelectorAll('.bx-soa-location-input-container[data-property-id-row]'),
				regionErrors = [],
				id, arProperty, data, i;

			for (i = 0; i < regionProps.length; i++)
			{
				id = regionProps[i].getAttribute('data-property-id-row');
				arProperty = this.validation.properties[id];
				data = this.getValidationData(arProperty, regionProps[i]);

				regionErrors = regionErrors.concat(this.isValidProperty(data, true));
			}

			return regionErrors;
		},

		isValidPropertiesBlock: function(excludeLocation)
		{
			if (!this.options.propertyValidation)
				return [];

			var props = this.orderBlockNode.querySelectorAll('.bx-soa-customer-field[data-property-id-row]'),
				propsErrors = [],
				id, propContainer, arProperty, data, i;

			for (i = 0; i < props.length; i++)
			{
				id = props[i].getAttribute('data-property-id-row');

				if (!!excludeLocation && this.locations[id])
					continue;

				propContainer = props[i].querySelector('.soa-property-container');
				if (propContainer)
				{
					arProperty = this.validation.properties[id];
					data = this.getValidationData(arProperty, propContainer);
					propsErrors = propsErrors.concat(this.isValidProperty(data, true));
				}
			}

			return propsErrors;
		},

		isValidProperty: function(data, fieldName)
		{
			var propErrors = [], inputErrors, i;

			if (!data || !data.inputs)
				return propErrors;

			for (i = 0; i < data.inputs.length; i++)
			{
				inputErrors = data.func(data.inputs[i], !!fieldName);
				if (inputErrors.length)
					propErrors[i] = inputErrors.join('<br>');
			}

			this.showValidationResult(data.inputs, propErrors);

			return propErrors;
		},

		bindValidation: function(id, propContainer)
		{
			if (!this.validation.properties || !this.validation.properties[id])
				return;

			var arProperty = this.validation.properties[id],
				data = this.getValidationData(arProperty, propContainer),
				i, k;

			if (data && data.inputs && data.action)
			{
				for (i = 0; i < data.inputs.length; i++)
				{
					if (BX.type.isElementNode(data.inputs[i]))
						BX.bind(data.inputs[i], data.action, BX.delegate(function(){
							this.isValidProperty(data);
						}, this));
					else
						for (k = 0; k < data.inputs[i].length; k++)
							BX.bind(data.inputs[i][k], data.action, BX.delegate(function(){
								this.isValidProperty(data);
							}, this));
				}
			}
		},

		getValidationData: function(arProperty, propContainer)
		{
			if (!arProperty || !propContainer)
				return;

			var data = {}, inputs;

			switch (arProperty.TYPE)
			{
				case 'STRING':
					data.action = 'change';
					data.func = BX.delegate(function(input, fieldName){
						return this.validateString(input, arProperty, fieldName);
					}, this);

					inputs = propContainer.querySelectorAll('input[type=text]');
					if (inputs.length)
					{
						data.inputs = inputs;
						break;
					}
					inputs = propContainer.querySelectorAll('textarea');
					if (inputs.length)
						data.inputs = inputs;
					break;
				case 'LOCATION':
					data.func = BX.delegate(function(input, fieldName){
						return this.validateLocation(input, arProperty, fieldName);
					}, this);

					inputs = propContainer.querySelectorAll('input.bx-ui-sls-fake[type=text]');
					if (inputs.length)
					{
						data.inputs = inputs;
						data.action = 'keyup';
						break;
					}
					inputs = propContainer.querySelectorAll('div.bx-ui-slst-pool');
					if (inputs.length)
					{
						data.inputs = inputs;
					}
					break;
				case 'Y/N':
					data.inputs = propContainer.querySelectorAll('input[type=checkbox]');
					data.action = 'change';
					data.func = BX.delegate(function(input, fieldName){
						return this.validateCheckbox(input, arProperty, fieldName);
					}, this);
					break;
				case 'NUMBER':
					data.inputs = propContainer.querySelectorAll('input[type=text]');
					data.action = 'blur';
					data.func = BX.delegate(function(input, fieldName){
						return this.validateNumber(input, arProperty, fieldName);
					}, this);
					break;
				case 'ENUM':
					inputs = propContainer.querySelectorAll('input[type=radio]');
					if (!inputs.length)
						inputs = propContainer.querySelectorAll('input[type=checkbox]');

					if (inputs.length)
					{
						data.inputs = [inputs];
						data.action = 'change';
						data.func = BX.delegate(function(input, fieldName){
							return this.validateEnum(input, arProperty, fieldName);
						}, this);
						break;
					}

					inputs = propContainer.querySelectorAll('option');
					if (inputs.length)
					{
						data.inputs = [inputs];
						data.action = 'click';
						data.func = BX.delegate(function(input, fieldName){
							return this.validateSelect(input, arProperty, fieldName);
						}, this);
					}
					break;
				case 'FILE':
					data.inputs = propContainer.querySelectorAll('input[type=file]');
					data.action = 'change';
					data.func = BX.delegate(function(input, fieldName){
						return this.validateFile(input, arProperty, fieldName);
					}, this);
					break;
				case 'DATE':
					data.inputs = propContainer.querySelectorAll('input[type=text]');
					data.action = 'change';
					data.func = BX.delegate(function(input, fieldName){
						return this.validateDate(input, arProperty, fieldName);
					}, this);
					break;
			}

			return data;
		},

		showErrorTooltip: function(tooltipId, targetNode, text)
		{
			if (!tooltipId || !targetNode || !text)
				return;

			var tooltip = BX('tooltip-' + tooltipId),
				tooltipInner, quickLocation;

			text = this.uniqueText(text, '<br>');

			if (tooltip)
			{
				tooltipInner = tooltip.querySelector('div.tooltip-inner');
			}
			else
			{
				tooltipInner = BX.create('DIV', {props: {className: 'tooltip-inner'}});
				tooltip = BX.create('DIV', {
					props: {
						id: 'tooltip-' + tooltipId,
						className: 'bx-soa-tooltip bx-soa-tooltip-static bx-soa-tooltip-danger tooltip top'
					},
					children: [
						BX.create('DIV', {props: {className: 'tooltip-arrow'}}),
						tooltipInner
					]
				});

				quickLocation = targetNode.parentNode.querySelector('div.quick-locations');
				if (quickLocation)
					targetNode = quickLocation;

				BX.insertAfter(tooltip, targetNode);
			}

			tooltipInner.innerHTML = text;

			if (tooltip.getAttribute('data-state') != 'opened')
			{
				tooltip.setAttribute('data-state', 'opened');
				tooltip.style.opacity = 0;
				tooltip.style.display = 'block';

				new BX.easing({
					duration: 150,
					start: {opacity: 0},
					finish: {opacity: 100},
					transition: BX.easing.transitions.quad,
					step: function(state){
						tooltip.style.opacity = state.opacity / 100;
					}
				}).animate();
			}
		},

		closeErrorTooltip: function(tooltipId)
		{
			var tooltip = BX('tooltip-' + tooltipId);
			if (tooltip)
			{
				tooltip.setAttribute('data-state', 'closed');

				new BX.easing({
					duration: 150,
					start: {opacity: 100},
					finish: {opacity: 0},
					transition: BX.easing.transitions.quad,
					step: function(state){
						tooltip.style.opacity = state.opacity / 100;
					},
					complete: function(){
						tooltip.style.display = 'none';
					}
				}).animate();
			}
		},

		showValidationResult: function(inputs, errors)
		{
			if (!inputs || !inputs.length || !errors)
				return;

			var input0 = BX.type.isElementNode(inputs[0]) ? inputs[0] : inputs[0][0],
				formGroup = BX.findParent(input0, {tagName: 'DIV', className: 'form-group'}),
				label = formGroup.querySelector('label'),
				tooltipId, inputDiv, i;

			if (label)
				tooltipId = label.getAttribute('for');

			for (i = 0; i < inputs.length; i++)
			{
				inputDiv = BX.findParent(inputs[i], {tagName: 'DIV', className: 'form-group'});
				if (errors[i] && errors[i].length)
					BX.addClass(inputDiv, 'has-error');
				else
					BX.removeClass(inputDiv, 'has-error');
			}

			if (errors.length)
				this.showErrorTooltip(tooltipId, label, errors.join('<br>'));
			else
				this.closeErrorTooltip(tooltipId);
		},

		validateString: function(input, arProperty, fieldName)
		{
			if (!input || !arProperty)
				return [];

			var value = input.value,
				errors = [],
				name = BX.util.htmlspecialchars(arProperty.NAME),
				field = !!fieldName ? BX.message('SOA_FIELD') + ' "' + name + '"' : BX.message('SOA_FIELD'),
				re;

			if (arProperty.MULTIPLE == 'Y')
				return errors;

			if (arProperty.REQUIRED == 'Y' && value.length == 0)
				errors.push(field + ' ' + BX.message('SOA_REQUIRED'));

			if (value.length > 0)
			{
				if (arProperty.MINLENGTH && arProperty.MINLENGTH > value.length)
					errors.push(BX.message('SOA_MIN_LENGTH') + ' "' + name + '" ' + BX.message('SOA_LESS') + ' ' + arProperty.MINLENGTH + ' ' + BX.message('SOA_SYMBOLS'));

				if (arProperty.MAXLENGTH && arProperty.MAXLENGTH < value.length)
					errors.push(BX.message('SOA_MAX_LENGTH') + ' "' + name + '" ' + BX.message('SOA_MORE') + ' ' + arProperty.MAXLENGTH + ' ' + BX.message('SOA_SYMBOLS'));

				if (value.length > 0 && arProperty.IS_EMAIL == 'Y')
				{
					re = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
					if (!re.test(value))
						errors.push(BX.message('SOA_INVALID_EMAIL'));
				}

				if (value.length > 0 && arProperty.PATTERN && arProperty.PATTERN.length)
				{
					re = new RegExp(arProperty.PATTERN);
					if (!re.test(value))
						errors.push(field + ' ' + BX.message('SOA_INVALID_PATTERN'));
				}
			}

			return errors;
		},

		validateLocation: function(input, arProperty, fieldName)
		{
			if (!input || !arProperty)
				return [];

			var parent = BX.findParent(input, {tagName: 'DIV', className: 'form-group'}),
				value = this.getLocationString(parent),
				errors = [],
				field = !!fieldName ? BX.message('SOA_FIELD') + ' "' + BX.util.htmlspecialchars(arProperty.NAME) + '"' : BX.message('SOA_FIELD');

			if (arProperty.MULTIPLE == 'Y' && arProperty.IS_LOCATION !== 'Y')
				return errors;

			if (arProperty.REQUIRED == 'Y' && (value.length == 0 || value == BX.message('SOA_NOT_SPECIFIED')))
				errors.push(field + ' ' + BX.message('SOA_REQUIRED'));

			return errors;
		},

		validateCheckbox: function(input, arProperty, fieldName)
		{
			if (!input || !arProperty)
				return [];

			var errors = [],
				field = !!fieldName ? BX.message('SOA_FIELD') + ' "' + BX.util.htmlspecialchars(arProperty.NAME) + '"' : BX.message('SOA_FIELD');

			if (arProperty.MULTIPLE == 'Y')
				return errors;

			if (arProperty.REQUIRED == 'Y' && !input.checked)
				errors.push(field + ' ' + BX.message('SOA_REQUIRED'));

			return errors;
		},

		validateNumber: function(input, arProperty, fieldName)
		{
			if (!input || !arProperty)
				return [];

			var value = input.value,
				errors = [],
				name = BX.util.htmlspecialchars(arProperty.NAME),
				field = !!fieldName ? BX.message('SOA_FIELD') + ' "' + name + '"' : BX.message('SOA_FIELD'),
				num, del;

			if (arProperty.MULTIPLE == 'Y')
				return errors;

			if (arProperty.REQUIRED == 'Y' && value.length == 0)
				errors.push(field + ' ' + BX.message('SOA_REQUIRED'));

			if (value.length)
			{
				if (!/[0-9]|\./.test(value))
					errors.push(field + ' ' + BX.message('SOA_NOT_NUMERIC'));

				if (arProperty.MIN && parseFloat(arProperty.MIN) > parseFloat(value))
					errors.push(BX.message('SOA_MIN_VALUE') + ' "' + name + '" ' + parseFloat(arProperty.MIN));

				if (arProperty.MAX && parseFloat(arProperty.MAX) < parseFloat(value))
					errors.push(BX.message('SOA_MAX_VALUE') + ' "' + name + '" ' + parseFloat(arProperty.MAX));

				if (arProperty.STEP && parseFloat(arProperty.STEP) > 0)
				{
					num = Math.abs(parseFloat(value) - (arProperty.MIN && parseFloat(arProperty.MIN) > 0 ? parseFloat(arProperty.MIN) : 0));
					del = (num / parseFloat(arProperty.STEP)).toPrecision(12);
					if (del != parseInt(del))
						errors.push(field + ' ' + BX.message('SOA_NUM_STEP') + ' ' + arProperty.STEP);
				}
			}

			return errors;
		},

		validateEnum: function(inputs, arProperty, fieldName)
		{
			if (!inputs || !arProperty)
				return [];

			var values = [], errors = [], i,
				field = !!fieldName ? BX.message('SOA_FIELD') + ' "' + BX.util.htmlspecialchars(arProperty.NAME) + '"' : BX.message('SOA_FIELD');

			if (arProperty.MULTIPLE == 'Y')
				return errors;

			for (i = 0; i < inputs.length; i++)
				if (inputs[i].checked || inputs[i].selected)
					values.push(i);

			if (arProperty.REQUIRED == 'Y' && values.length == 0)
				errors.push(field + ' ' + BX.message('SOA_REQUIRED'));

			return errors;
		},

		validateSelect: function(inputs, arProperty, fieldName)
		{
			if (!inputs || !arProperty)
				return [];

			var values = [], errors = [], i,
				field = !!fieldName ? BX.message('SOA_FIELD') + ' "' + BX.util.htmlspecialchars(arProperty.NAME) + '"' : BX.message('SOA_FIELD');

			if (arProperty.MULTIPLE == 'Y')
				return errors;

			for (i = 0; i < inputs.length; i++)
				if (inputs[i].selected)
					values.push(i);

			if (arProperty.REQUIRED == 'Y' && values.length == 0)
				errors.push(field + ' ' + BX.message('SOA_REQUIRED'));

			return errors;
		},

		validateFile: function(inputs, arProperty, fieldName)
		{
			if (!inputs || !arProperty)
				return [];

			var errors = [], i,
				files = inputs.files || [],
				field = !!fieldName ? BX.message('SOA_FIELD') + ' "' + BX.util.htmlspecialchars(arProperty.NAME) + '"' : BX.message('SOA_FIELD'),
				defaultValue = inputs.previousSibling.value,
				file, fileName, splittedName, fileExtension;

			if (arProperty.MULTIPLE == 'Y')
				return errors;

			if (arProperty.REQUIRED == 'Y' && files.length == 0 && defaultValue == '' && !arProperty.DEFAULT_VALUE.length)
				errors.push(field + ' ' + BX.message('SOA_REQUIRED'));
			else
			{
				for (i = 0; i < files.length; i++)
				{
					file = files[i];
					fileName = BX.util.htmlspecialchars(file.name);
					splittedName = file.name.split('.');
					fileExtension = splittedName.length > 1 ? splittedName[splittedName.length - 1].toLowerCase() : '';

					if (arProperty.ACCEPT.length > 0 && (fileExtension.length == 0 || arProperty.ACCEPT.indexOf(fileExtension) == '-1'))
						errors.push(BX.message('SOA_BAD_EXTENSION') + ' "' + fileName + '" (' + BX.util.htmlspecialchars(arProperty.ACCEPT) + ')');

					if (file.size > parseInt(arProperty.MAXSIZE))
						errors.push(BX.message('SOA_MAX_SIZE') + ' "' + fileName + '" (' + this.getSizeString(arProperty.MAXSIZE, 1) + ')');
				}
			}

			return errors;
		},

		validateDate: function(input, arProperty, fieldName)
		{
			if (!input || !arProperty)
				return [];

			var value = input.value,
				errors = [],
				name = BX.util.htmlspecialchars(arProperty.NAME),
				field = !!fieldName ? BX.message('SOA_FIELD') + ' "' + name + '"' : BX.message('SOA_FIELD');

			if (arProperty.MULTIPLE == 'Y')
				return errors;

			if (arProperty.REQUIRED == 'Y' && value.length == 0)
				errors.push(field + ' ' + BX.message('SOA_REQUIRED'));

			return errors;
		},

		editPropsMap: function(propsNode)
		{
			var propsMapContainer = BX.create('DIV', {props: {className: 'col-sm-12'}, style: {marginBottom: '10px'}}),
				map = BX.create('DIV', {props: {id: 'propsMap'}, style: {width: '100%'}});

			propsMapContainer.appendChild(map);
			propsNode.appendChild(propsMapContainer);
		},

		editPropsComment: function(propsNode)
		{
			var propsCommentContainer, label, input, div;

			propsCommentContainer = BX.create('DIV', {props: {className: 'col-sm-12'}});
			label = BX.create('LABEL', {
				attrs: {for: 'orderDescription'},
				props: {className: 'bx-soa-customer-label'},
				html: this.params.MESS_ORDER_DESC
			});
			input = BX.create('TEXTAREA', {
				props: {
					id: 'orderDescription',
					cols: '4',
					//type: 'text',
					className: 'form-control bx-soa-customer-textarea bx-ios-fix',
					name: 'ORDER_DESCRIPTION'
				},
				text: this.result.ORDER_DESCRIPTION ? this.result.ORDER_DESCRIPTION : ''
			});
			div = BX.create('DIV', {
				props: {className: 'form-group bx-soa-customer-field'},
				children: [label, input]
			});

			propsCommentContainer.appendChild(div);
			propsNode.appendChild(propsCommentContainer);
		},

		editTotalBlock: function()
		{
			if (!this.totalInfoBlockNode || !this.result.TOTAL)
				return;

			var total = this.result.TOTAL,
				priceHtml, params = {},
				discText, valFormatted, i,
				curDelivery, deliveryError, deliveryValue,
				minOrderPrice,
				showOrderButton = this.params.SHOW_TOTAL_ORDER_BUTTON === 'Y';

			BX.cleanNode(this.totalInfoBlockNode);

			if (parseFloat(total.ORDER_PRICE) === 0)
			{
				priceHtml = this.params.MESS_PRICE_FREE;
				params.free = true;
			}
			else
			{
				priceHtml = total.ORDER_PRICE_FORMATED;
			}

			/*if (this.options.showPriceWithoutDiscount)
			{
				priceHtml += '<br><span class="bx-price-old">' + total.PRICE_WITHOUT_DISCOUNT + '</span>';
			}*/

			//this.totalInfoBlockNode.appendChild(this.createTotalUnit(BX.message('SOA_SUM_SUMMARY'), priceHtml, params));

			if (this.options.showOrderWeight)
			{
				this.totalInfoBlockNode.appendChild(this.createTotalUnit(BX.message('SOA_SUM_WEIGHT_SUM'), total.ORDER_WEIGHT_FORMATED));
			}

			if (this.options.showTaxList)
			{
				for (i = 0; i < total.TAX_LIST.length; i++)
				{
					valFormatted = total.TAX_LIST[i].VALUE_MONEY_FORMATED || '';
					this.totalInfoBlockNode.appendChild(
						this.createTotalUnit(
							total.TAX_LIST[i].NAME + (!!total.TAX_LIST[i].VALUE_FORMATED ? ' ' + total.TAX_LIST[i].VALUE_FORMATED : '') + ':',
							valFormatted
						)
					);
				}
			}

			params = {};
			curDelivery = this.getSelectedDelivery();
			deliveryError = curDelivery && curDelivery.CALCULATE_ERRORS && curDelivery.CALCULATE_ERRORS.length;

			if (deliveryError)
			{
				deliveryValue = BX.message('SOA_NOT_CALCULATED');
				params.error = deliveryError;
			}
			else
			{
				if (parseFloat(total.DELIVERY_PRICE) === 0)
				{
					deliveryValue = this.params.MESS_PRICE_FREE;
					params.free = true;
				}
				else
				{
					deliveryValue = total.DELIVERY_PRICE_FORMATED;
				}

				if (
					curDelivery && typeof curDelivery.DELIVERY_DISCOUNT_PRICE !== 'undefined'
					&& parseFloat(curDelivery.PRICE) > parseFloat(curDelivery.DELIVERY_DISCOUNT_PRICE)
				)
				{
					deliveryValue += '<br><span class="bx-price-old">' + curDelivery.PRICE_FORMATED + '</span>';
				}
			}

			if (this.result.DELIVERY.length)
			{
				minOrderPrice = this.result.minOrderPrice;
                                if($.cookie("deliveryPrice")!="" && typeof($.cookie("deliveryPrice"))!="undefined"){
                                    minOrderPrice = $.cookie("deliveryPrice")+" руб";
                                }else{
                                    minOrderPrice = "0 руб";
                                }
				this.totalInfoBlockNode.appendChild(this.createTotalUnit("Мин. заказ:", minOrderPrice, params));
			}

			if (this.options.showDiscountPrice)
			{
				/*discText = this.params.MESS_ECONOMY;
				if (total.DISCOUNT_PERCENT_FORMATED && parseFloat(total.DISCOUNT_PERCENT_FORMATED) > 0)
					discText += total.DISCOUNT_PERCENT_FORMATED;

				this.totalInfoBlockNode.appendChild(this.createTotalUnit(discText + ':', total.DISCOUNT_PRICE_FORMATED, {highlighted: true}));*/
			}

			if (this.options.showPayedFromInnerBudget)
			{
				this.totalInfoBlockNode.appendChild(this.createTotalUnit(BX.message('SOA_SUM_IT'), total.ORDER_TOTAL_PRICE_FORMATED));
				this.totalInfoBlockNode.appendChild(this.createTotalUnit(BX.message('SOA_SUM_PAYED'), total.PAYED_FROM_ACCOUNT_FORMATED));
				this.totalInfoBlockNode.appendChild(this.createTotalUnit(BX.message('SOA_SUM_LEFT_TO_PAY'), total.ORDER_TOTAL_LEFT_TO_PAY_FORMATED, {total: true}));
			}
			else
			{
				this.totalInfoBlockNode.appendChild(this.createTotalUnit(BX.message('SOA_SUM_IT'), total.ORDER_TOTAL_PRICE_FORMATED, {total: true}));
			}

			if (parseFloat(total.PAY_SYSTEM_PRICE) >= 0 && this.result.DELIVERY.length)
			{
				this.totalInfoBlockNode.appendChild(this.createTotalUnit(BX.message('SOA_PAYSYSTEM_PRICE'), '~' + total.PAY_SYSTEM_PRICE_FORMATTED));
			}

			if (!this.result.SHOW_AUTH)
			{
				this.totalInfoBlockNode.appendChild(
					BX.create('DIV', {
						props: {className: 'bx-soa-cart-total-button-container' + (!showOrderButton ? ' visible-xs' : '')},
						children: [
							BX.create('A', {
								props: {
									href: 'javascript:void(0)',
									className: 'btn btn-default btn-lg btn-order-save'
								},
								html: this.params.MESS_ORDER,
								events: {
									click: BX.proxy(this.clickOrderSaveAction, this)
								}
							})

						]
					})
				);
			}

			this.editMobileTotalBlock();
		},

		editMobileTotalBlock: function()
		{
			if (this.result.SHOW_AUTH)
				BX.removeClass(this.mobileTotalBlockNode, 'visible-xs');
			else
				BX.addClass(this.mobileTotalBlockNode, 'visible-xs');

			BX.cleanNode(this.mobileTotalBlockNode);
			this.mobileTotalBlockNode.appendChild(this.totalInfoBlockNode.cloneNode(true));
			BX.bind(this.mobileTotalBlockNode.querySelector('a.bx-soa-price-not-calc'), 'click', BX.delegate(function(){
				this.animateScrollTo(this.deliveryBlockNode);
			}, this));
			BX.bind(this.mobileTotalBlockNode.querySelector('a.btn-order-save'), 'click', BX.proxy(this.clickOrderSaveAction, this));
		},

		createTotalUnit: function(name, value, params)
		{
			var totalValue, className = 'bx-soa-cart-total-line';

			name = name || '';
			value = value || '';
			params = params || {};

			if (params.error)
			{
				totalValue = [BX.create('A', {
					props: {className: 'bx-soa-price-not-calc'},
					html: value,
					events: {
						click: BX.delegate(function(){
							this.animateScrollTo(this.deliveryBlockNode);
						}, this)
					}
				})];
			}
			else if (params.free)
			{
				totalValue = [BX.create('SPAN', {
					props: {className: 'bx-soa-price-free'},
					html: value
				})];
			}
			else
			{
				totalValue = [value];
			}

			if (params.total)
			{
				className += ' bx-soa-cart-total-line-total';
			}

			if (params.highlighted)
			{
				className += ' bx-soa-cart-total-line-highlighted';
			}

			return BX.create('DIV', {
				props: {className: className},
				children: [
					BX.create('SPAN', {props: {className: 'bx-soa-cart-t'}, text: name}),
					BX.create('SPAN', {
						props: {
							className: 'bx-soa-cart-d' + (!!params.total && this.options.totalPriceChanged ? ' bx-soa-changeCostSign' : '')
						},
						children: totalValue
					})
				]
			});
		},

		basketBlockScrollCheckEvent: function(e)
		{
			var target = e.target || e.srcElement,
				scrollLeft = target.scrollLeft,
				scrollRight = target.scrollWidth - (scrollLeft + target.clientWidth),
				parent = target.parentNode;

			if (scrollLeft == 0)
				BX.removeClass(parent, 'bx-soa-table-fade-left');
			else
				BX.addClass(parent, 'bx-soa-table-fade-left');

			if (scrollRight == 0)
				BX.removeClass(parent, 'bx-soa-table-fade-right');
			else
				BX.addClass(parent, 'bx-soa-table-fade-right');
		},

		basketBlockScrollCheck: function()
		{
			var scrollableNodes = this.orderBlockNode.querySelectorAll('div.bx-soa-table-fade'),
				parentNode, parentWidth, tableNode, tableWidth,
				i, scrollNode, scrollLeft, scrollRight, scrollable = false;

			for (i = 0; i < scrollableNodes.length; i++)
			{
				parentNode = scrollableNodes[i];
				tableNode = parentNode.querySelector('div.bx-soa-item-table');
				parentWidth = parentNode.clientWidth;
				tableWidth = tableNode.clientWidth || 0;
				scrollable = scrollable || tableWidth > parentWidth;

				if (scrollable)
				{
					scrollNode = BX.firstChild(parentNode);
					scrollLeft = scrollNode.scrollLeft;
					scrollRight = scrollNode.scrollWidth - (scrollLeft + scrollNode.clientWidth);

					if (scrollLeft == 0)
						BX.removeClass(parentNode, 'bx-soa-table-fade-left');
					else
						BX.addClass(parentNode, 'bx-soa-table-fade-left');

					if (scrollRight == 0)
						BX.removeClass(parentNode, 'bx-soa-table-fade-right');
					else
						BX.addClass(parentNode, 'bx-soa-table-fade-right');

					if (scrollLeft == 0 && scrollRight == 0)
						BX.addClass(parentNode, 'bx-soa-table-fade-right');
				}
				else
					BX.removeClass(parentNode, 'bx-soa-table-fade-left bx-soa-table-fade-right');
			}
		},

		totalBlockScrollCheck: function()
		{
			if (!this.totalInfoBlockNode || !this.totalGhostBlockNode)
				return;

			var scrollTop = BX.GetWindowScrollPos().scrollTop,
				ghostTop = BX.pos(this.totalGhostBlockNode).top,
				ghostBottom = BX.pos(this.orderBlockNode).bottom,
				width;

			if (ghostBottom - this.totalBlockNode.offsetHeight < scrollTop + 20)
				BX.addClass(this.totalInfoBlockNode, 'bx-soa-cart-total-bottom');
			else
				BX.removeClass(this.totalInfoBlockNode, 'bx-soa-cart-total-bottom');

			if (scrollTop > ghostTop && !BX.hasClass(this.totalInfoBlockNode, 'bx-soa-cart-total-fixed'))
			{
				width = this.totalInfoBlockNode.offsetWidth;
				BX.addClass(this.totalInfoBlockNode, 'bx-soa-cart-total-fixed');
				this.totalGhostBlockNode.style.paddingTop = this.totalInfoBlockNode.offsetHeight + 'px';
				this.totalInfoBlockNode.style.width = width + 'px';
			}
			else if (scrollTop < ghostTop && BX.hasClass(this.totalInfoBlockNode, 'bx-soa-cart-total-fixed'))
			{
				BX.removeClass(this.totalInfoBlockNode, 'bx-soa-cart-total-fixed');
				this.totalGhostBlockNode.style.paddingTop = 0;
				this.totalInfoBlockNode.style.width = '';
			}
		},

		totalBlockResizeCheck: function()
		{
			if (!this.totalInfoBlockNode || !this.totalGhostBlockNode)
				return;

			if (BX.hasClass(this.totalInfoBlockNode, 'bx-soa-cart-total-fixed'))
				this.totalInfoBlockNode.style.width = this.totalGhostBlockNode.offsetWidth + 'px';
		},

		totalBlockFixFont: function()
		{
			var totalNode = this.totalInfoBlockNode.querySelector('.bx-soa-cart-total-line.bx-soa-cart-total-line-total'),
				buttonNode, target, objList = [];

			if (totalNode)
			{
				target = BX.lastChild(totalNode);
				objList.push({
					node: target,
					maxFontSize: 28,
					smallestValue: false,
					scaleBy: target.parentNode
				});
			}

			if (this.params.SHOW_TOTAL_ORDER_BUTTON == 'Y')
			{
				buttonNode = this.totalInfoBlockNode.querySelector('.bx-soa-cart-total-button-container');
				if (buttonNode)
				{
					target = BX.lastChild(buttonNode);
					objList.push({
						node: target,
						maxFontSize: 18,
						smallestValue: false
					});
				}
			}

			if (objList.length)
				BX.FixFontSize.init({objList: objList, onAdaptiveResize: true});
		},

		setAnalyticsDataLayer: function(action, id)
		{
			if (!this.params.DATA_LAYER_NAME)
				return;

			var info, i;
			var products = [],
				dataVariant, item;

			for (i in this.result.GRID.ROWS)
			{
				if (this.result.GRID.ROWS.hasOwnProperty(i))
				{
					item = this.result.GRID.ROWS[i];
					dataVariant = [];

					for (i = 0; i < item.data.PROPS.length; i++)
					{
						dataVariant.push(item.data.PROPS[i].VALUE);
					}

					products.push({
						'id': item.data.ID,
						'name': item.data.NAME,
						'price': item.data.PRICE,
						'brand': (item.data[this.params.BRAND_PROPERTY + '_VALUE'] || '').split(', ').join('/'),
						'variant': dataVariant.join('/'),
						'quantity': item.data.QUANTITY
					});
				}
			}

			switch (action)
			{
				case 'checkout':
					info = {
						'event': 'checkout',
						'ecommerce': {
							'checkout': {
								'products': products
							}
						}
					};
					break;
				case 'purchase':
					info = {
						'event': 'purchase',
						'ecommerce': {
							'purchase': {
								'actionField': {
									'id': id,
									'revenue': this.result.TOTAL.ORDER_TOTAL_PRICE,
									'tax': this.result.TOTAL.TAX_PRICE,
									'shipping': this.result.TOTAL.DELIVERY_PRICE
								},
								'products': products
							}
						}
					};
					break;
			}

			window[this.params.DATA_LAYER_NAME] = window[this.params.DATA_LAYER_NAME] || [];
			window[this.params.DATA_LAYER_NAME].push(info);
		},

		isOrderSaveAllowed: function()
		{
			return this.orderSaveAllowed === true;
		},

		allowOrderSave: function()
		{
			this.orderSaveAllowed = true;
		},

		disallowOrderSave: function()
		{
			this.orderSaveAllowed = false;
		},

		initUserConsent: function()
		{
			BX.ready(BX.delegate(function(){
				var control = BX.UserConsent.load(this.orderBlockNode);
				BX.addCustomEvent(control, BX.UserConsent.events.save, BX.proxy(this.doSaveAction, this));
				BX.addCustomEvent(control, BX.UserConsent.events.refused, BX.proxy(this.disallowOrderSave, this));
			}, this));
		}
	};
})();
/* End */
;
; /* Start:"a:4:{s:4:"full";s:102:"/bitrix/components/bitrix/sale.location.selector.steps/templates/.default/script.min.js?15740183027752";s:6:"source";s:83:"/bitrix/components/bitrix/sale.location.selector.steps/templates/.default/script.js";s:3:"min";s:87:"/bitrix/components/bitrix/sale.location.selector.steps/templates/.default/script.min.js";s:3:"map";s:87:"/bitrix/components/bitrix/sale.location.selector.steps/templates/.default/script.map.js";}"*/
BX.namespace("BX.Sale.component.location.selector");if(typeof BX.Sale.component.location.selector.steps=="undefined"&&typeof BX.ui!="undefined"&&typeof BX.ui.widget!="undefined"){BX.Sale.component.location.selector.steps=function(e,t){this.parentConstruct(BX.Sale.component.location.selector.steps,e);BX.merge(this,{opts:{bindEvents:{"after-select-item":function(e){if(typeof this.opts.callback=="string"&&this.opts.callback.length>0&&this.opts.callback in window)window[this.opts.callback].apply(this,[e,this])}},disableKeyboardInput:false,dontShowNextChoice:false,pseudoValues:[],provideLinkBy:"id",requestParamsInject:false},vars:{cache:{nodesByCode:{}}},sys:{code:"slst"},flags:{skipAfterSelectItemEventOnce:false}});this.handleInitStack(t,BX.Sale.component.location.selector.steps,e)};BX.extend(BX.Sale.component.location.selector.steps,BX.ui.chainedSelectors);BX.merge(BX.Sale.component.location.selector.steps.prototype,{init:function(){this.pushFuncStack("buildUpDOM",BX.Sale.component.location.selector.steps);this.pushFuncStack("bindEvents",BX.Sale.component.location.selector.steps)},buildUpDOM:function(){},bindEvents:function(){var e=this,t=this.opts;if(t.disableKeyboardInput){this.bindEvent("after-control-placed",function(e){var t=e.getControl();BX.unbindAll(t.ctrls.toggle);BX.bind(t.ctrls.scope,"click",function(e){t.toggleDropDown()})})}BX.bindDelegate(this.getControl("quick-locations",true),"click",{tag:"a"},function(){e.setValueByLocationId(BX.data(this,"id"))})},setValueByLocationId:function(e){BX.Sale.component.location.selector.steps.superclass.setValue.apply(this,[e])},setValueByLocationIds:function(e){if(!e.PARENT_ID)return;this.flags.skipAfterSelectItemEventOnce=true;this.setValueByLocationId(e.PARENT_ID);this.bindEvent("after-control-placed",function(t){var s=t.getControl();if(s.vars.value!=false)return;if(e.IDS)this.opts.requestParamsInject={filter:{"=ID":e.IDS}};s.tryDisplayPage("toggle")})},setValueByLocationCode:function(e){var t=this.vars;if(e==null||e==false||typeof e=="undefined"||e.toString().length==0){this.displayRoute([]);this.setValueVariable("");this.setTargetValue("");this.fireEvent("after-clear-selection");return}this.fireEvent("before-set-value",[e]);var s=new BX.deferred;var i=this;s.done(BX.proxy(function(s){this.displayRoute(s);var i=t.cache.nodesByCode[e].VALUE;t.value=i;this.setTargetValue(this.checkCanSelectItem(i)?i:this.getLastValidValue())},this));s.fail(function(e){if(e=="notfound"){i.displayRoute([]);i.setValueVariable("");i.setTargetValue("");i.showError({errors:[i.opts.messages.nothingFound],type:"server-logic",options:{}})}});this.hideError();this.getRouteToNodeByCode(e,s)},setValue:function(e){if(this.opts.provideLinkBy=="id")BX.Sale.component.location.selector.steps.superclass.setValue.apply(this,[e]);else this.setValueByLocationCode(e)},setTargetValue:function(e){this.setTargetInputValue(this.opts.provideLinkBy=="code"?e?this.vars.cache.nodes[e].CODE:"":e);if(!this.flags.skipAfterSelectItemEventOnce)this.fireEvent("after-select-item",[e]);else this.flags.skipAfterSelectItemEventOnce=false},getValue:function(){if(this.opts.provideLinkBy=="id")return this.vars.value===false?"":this.vars.value;else{return this.vars.value?this.vars.cache.nodes[this.vars.value].CODE:""}},getNodeByLocationId:function(e){return this.vars.cache.nodes[e]},getSelectedPath:function(){var e=this.vars,t=[];if(typeof e.value=="undefined"||e.value==false||e.value=="")return t;if(typeof e.cache.nodes[e.value]!="undefined"){var s=e.cache.nodes[e.value];while(typeof s!="undefined"){var i=BX.clone(s);var n=i.PARENT_VALUE;delete i.PATH;delete i.PARENT_VALUE;delete i.IS_PARENT;if(typeof i.TYPE_ID!="undefined"&&typeof this.opts.types!="undefined")i.TYPE=this.opts.types[i.TYPE_ID].CODE;t.push(i);if(typeof n=="undefined"||typeof e.cache.nodes[n]=="undefined")break;else s=e.cache.nodes[n]}}return t},setInitialValue:function(){if(this.opts.selectedItem!==false)this.setValueByLocationId(this.opts.selectedItem);else if(this.ctrls.inputs.origin.value.length>0){if(this.opts.provideLinkBy=="id")this.setValueByLocationId(this.ctrls.inputs.origin.value);else this.setValueByLocationCode(this.ctrls.inputs.origin.value)}},getRouteToNodeByCode:function(e,t){var s=this.vars,i=this;if(typeof e!="undefined"&&e!==false&&e.toString().length>0){var n=[];if(typeof s.cache.nodesByCode[e]!="undefined")n=this.getRouteToNodeFromCache(s.cache.nodesByCode[e].VALUE);if(n.length==0){i.downloadBundle({request:{CODE:e},callbacks:{onLoad:function(o){for(var a in o){if(typeof s.cache.links[a]=="undefined")s.cache.incomplete[a]=true}i.fillCache(o,true);n=[];if(typeof s.cache.nodesByCode[e]!="undefined")n=this.getRouteToNodeFromCache(s.cache.nodesByCode[e].VALUE);if(n.length==0)t.reject("notfound");else t.resolve(n)},onError:function(){t.reject("internal")}},options:{}})}else t.resolve(n)}else t.resolve([])},addItem2Cache:function(e){this.vars.cache.nodes[e.VALUE]=e;this.vars.cache.nodesByCode[e.CODE]=e},controlChangeActions:function(e,t){var s=this,i=this.opts,n=this.vars,o=this.ctrls;this.hideError();if(t.length==0){s.truncateStack(e);n.value=s.getLastValidValue();s.setTargetValue(n.value);this.fireEvent("after-select-real-value")}else if(BX.util.in_array(t,i.pseudoValues)){s.truncateStack(e);s.setTargetValue(s.getLastValidValue());this.fireEvent("after-select-item",[t]);this.fireEvent("after-select-pseudo-value")}else{var a=n.cache.nodes[t];if(typeof a=="undefined")throw new Error("Selected node not found in the cache");s.truncateStack(e);if(i.dontShowNextChoice){if(a.IS_UNCHOOSABLE)s.appendControl(t)}else{if(typeof n.cache.links[t]!="undefined"||a.IS_PARENT)s.appendControl(t)}if(s.checkCanSelectItem(t)){n.value=t;s.setTargetValue(t);this.fireEvent("after-select-real-value")}}},refineRequest:function(e){var t={};var s={VALUE:"ID",DISPLAY:"NAME.NAME",1:"TYPE_ID",2:"CODE"};var i={};if(typeof e["PARENT_VALUE"]!="undefined"){t["=PARENT_ID"]=e.PARENT_VALUE;s["10"]="IS_PARENT"}if(typeof e["VALUE"]!="undefined"){t["=ID"]=e.VALUE;i["1"]="PATH"}if(BX.type.isNotEmptyString(e["CODE"])){t["=CODE"]=e.CODE;i["1"]="PATH"}if(BX.type.isNotEmptyString(this.opts.query.BEHAVIOUR.LANGUAGE_ID))t["=NAME.LANGUAGE_ID"]=this.opts.query.BEHAVIOUR.LANGUAGE_ID;if(BX.type.isNotEmptyString(this.opts.query.FILTER.SITE_ID)){if(typeof this.vars.cache.nodes[e.PARENT_VALUE]=="undefined"||this.vars.cache.nodes[e.PARENT_VALUE].IS_UNCHOOSABLE)t["=SITE_ID"]=this.opts.query.FILTER.SITE_ID}var n={select:s,filter:t,additionals:i,version:"2"};if(this.opts.requestParamsInject){for(var o in this.opts.requestParamsInject){if(this.opts.requestParamsInject.hasOwnProperty(o)){if(n[o]==undefined)n[o]={};for(var a in this.opts.requestParamsInject[o]){if(this.opts.requestParamsInject[o].hasOwnProperty(a)){if(n[o][a]!=undefined){var r=n[o][a];n[o][a]=[];n[o][a].push(r)}else{n[o][a]=[]}for(var l in this.opts.requestParamsInject[o][a])if(this.opts.requestParamsInject[o][a].hasOwnProperty(l))n[o][a].push(this.opts.requestParamsInject[o][a][l])}}}}}return n},refineResponce:function(e,t){if(e.length==0)return e;if(typeof t.PARENT_VALUE!="undefined"){var s={};s[t.PARENT_VALUE]=e["ITEMS"];e=s}else if(typeof t.VALUE!="undefined"||typeof t.CODE!="undefined"){var i={};if(typeof e.ITEMS[0]!="undefined"&&typeof e.ETC.PATH_ITEMS!="undefined"){var n=0;for(var o=e.ITEMS[0]["PATH"].length-1;o>=0;o--){var a=e.ITEMS[0]["PATH"][o];var r=e.ETC.PATH_ITEMS[a];r.IS_PARENT=true;i[n]=[r];n=r.VALUE}i[n]=[e.ITEMS[0]]}e=i}return e},showError:function(e){if(e.type!="server-logic")e.errors=[this.opts.messages.error];this.ctrls.errorMessage.innerHTML='<p><font class="errortext">'+BX.util.htmlspecialchars(e.errors.join(", "))+"</font></p>";BX.show(this.ctrls.errorMessage);BX.debug(e)}})}
/* End */
;
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
; /* Start:"a:4:{s:4:"full";s:103:"/bitrix/components/bitrix/sale.location.selector.search/templates/.default/script.min.js?15740183007747";s:6:"source";s:84:"/bitrix/components/bitrix/sale.location.selector.search/templates/.default/script.js";s:3:"min";s:88:"/bitrix/components/bitrix/sale.location.selector.search/templates/.default/script.min.js";s:3:"map";s:88:"/bitrix/components/bitrix/sale.location.selector.search/templates/.default/script.map.js";}"*/
BX.namespace("BX.Sale.component.location.selector");if(typeof BX.Sale.component.location.selector.search=="undefined"&&typeof BX.ui!="undefined"&&typeof BX.ui.widget!="undefined"){BX.Sale.component.location.selector.search=function(e,t){this.parentConstruct(BX.Sale.component.location.selector.search,e);BX.merge(this,{opts:{usePagingOnScroll:true,pageSize:10,arrowScrollAdditional:2,pageUpWardOffset:3,provideLinkBy:"id",bindEvents:{"after-input-value-modify":function(){this.ctrls.fullRoute.value=""},"after-select-item":function(e){var t=this.opts;var i=this.vars.cache.nodes[e];var s=i.DISPLAY;if(typeof i.PATH=="object"){for(var o=0;o<i.PATH.length;o++){s+=", "+this.vars.cache.path[i.PATH[o]]}}this.ctrls.inputs.fake.setAttribute("title",s);this.ctrls.fullRoute.value=s;if(typeof this.opts.callback=="string"&&this.opts.callback.length>0&&this.opts.callback in window)window[this.opts.callback].apply(this,[e,this])},"after-deselect-item":function(){this.ctrls.fullRoute.value="";this.ctrls.inputs.fake.setAttribute("title","")},"before-render-variant":function(e){if(e.PATH.length>0){var t="";for(var i=0;i<e.PATH.length;i++)t+=", "+this.vars.cache.path[e.PATH[i]];e.PATH=t}else e.PATH="";var s="";if(this.vars&&this.vars.lastQuery&&this.vars.lastQuery.QUERY)s=this.vars.lastQuery.QUERY;if(BX.type.isNotEmptyString(s)){var o=[];if(this.opts.wrapSeparate)o=s.split(/\s+/);else o=[s];e["=display_wrapped"]=BX.util.wrapSubstring(e.DISPLAY+e.PATH,o,this.opts.wrapTagName,true)}else e["=display_wrapped"]=BX.util.htmlspecialchars(e.DISPLAY)}}},vars:{cache:{path:{},nodesByCode:{}}},sys:{code:"sls"}});this.handleInitStack(t,BX.Sale.component.location.selector.search,e)};BX.extend(BX.Sale.component.location.selector.search,BX.ui.autoComplete);BX.merge(BX.Sale.component.location.selector.search.prototype,{init:function(){if(typeof this.opts.pathNames=="object")BX.merge(this.vars.cache.path,this.opts.pathNames);this.pushFuncStack("buildUpDOM",BX.Sale.component.location.selector.search);this.pushFuncStack("bindEvents",BX.Sale.component.location.selector.search)},buildUpDOM:function(){var e=this.ctrls,t=this.opts,i=this.vars,s=this,o=this.sys.code;e.fullRoute=BX.create("input",{props:{className:"bx-ui-"+o+"-route"},attrs:{type:"text",disabled:"disabled",autocomplete:"off"}});BX.style(e.fullRoute,"paddingTop",BX.style(e.inputs.fake,"paddingTop"));BX.style(e.fullRoute,"paddingLeft",BX.style(e.inputs.fake,"paddingLeft"));BX.style(e.fullRoute,"paddingRight","0px");BX.style(e.fullRoute,"paddingBottom","0px");BX.style(e.fullRoute,"marginTop",BX.style(e.inputs.fake,"marginTop"));BX.style(e.fullRoute,"marginLeft",BX.style(e.inputs.fake,"marginLeft"));BX.style(e.fullRoute,"marginRight","0px");BX.style(e.fullRoute,"marginBottom","0px");if(BX.style(e.inputs.fake,"borderTopStyle")!="none"){BX.style(e.fullRoute,"borderTopStyle","solid");BX.style(e.fullRoute,"borderTopColor","transparent");BX.style(e.fullRoute,"borderTopWidth",BX.style(e.inputs.fake,"borderTopWidth"))}if(BX.style(e.inputs.fake,"borderLeftStyle")!="none"){BX.style(e.fullRoute,"borderLeftStyle","solid");BX.style(e.fullRoute,"borderLeftColor","transparent");BX.style(e.fullRoute,"borderLeftWidth",BX.style(e.inputs.fake,"borderLeftWidth"))}BX.prepend(e.fullRoute,e.container);e.inputBlock=this.getControl("input-block");e.loader=this.getControl("loader")},bindEvents:function(){var e=this;BX.bindDelegate(this.getControl("quick-locations",true),"click",{tag:"a"},function(){e.setValueByLocationId(BX.data(this,"id"))});this.vars.outSideClickScope=this.ctrls.inputBlock},setValueByLocationId:function(e,t){BX.Sale.component.location.selector.search.superclass.setValue.apply(this,[e,t])},setValueByLocationIds:function(e){if(e.IDS){this.displayPage({VALUE:e.IDS,order:{TYPE_ID:"ASC","NAME.NAME":"ASC"}})}},setValueByLocationCode:function(e,t){var i=this.vars,s=this.opts,o=this.ctrls,n=this;this.hideError();if(e==null||e==false||typeof e=="undefined"||e.toString().length==0){this.resetVariables();BX.cleanNode(o.vars);if(BX.type.isElementNode(o.nothingFound))BX.hide(o.nothingFound);this.fireEvent("after-deselect-item");this.fireEvent("after-clear-selection");return}if(t!==false)i.forceSelectSingeOnce=true;if(typeof i.cache.nodesByCode[e]=="undefined"){this.resetNavVariables();n.downloadBundle({CODE:e},function(t){n.fillCache(t,false);if(typeof i.cache.nodesByCode[e]=="undefined"){n.showNothingFound()}else{var o=i.cache.nodesByCode[e].VALUE;if(s.autoSelectIfOneVariant||i.forceSelectSingeOnce)n.selectItem(o);else n.displayVariants([o])}},function(){i.forceSelectSingeOnce=false})}else{var a=i.cache.nodesByCode[e].VALUE;if(i.forceSelectSingeOnce)this.selectItem(a);else this.displayVariants([a]);i.forceSelectSingeOnce=false}},getNodeByValue:function(e){if(this.opts.provideLinkBy=="id")return this.vars.cache.nodes[e];else return this.vars.cache.nodesByCode[e]},getNodeByLocationId:function(e){return this.vars.cache.nodes[e]},setValue:function(e){if(this.opts.provideLinkBy=="id")BX.Sale.component.location.selector.search.superclass.setValue.apply(this,[e]);else this.setValueByLocationCode(e)},getValue:function(){if(this.opts.provideLinkBy=="id")return this.vars.value===false?"":this.vars.value;else{return this.vars.value?this.vars.cache.nodes[this.vars.value].CODE:""}},getSelectedPath:function(){var e=this.vars,t=[];if(typeof e.value=="undefined"||e.value==false||e.value=="")return t;if(typeof e.cache.nodes[e.value]!="undefined"){var i=BX.clone(e.cache.nodes[e.value]);if(typeof i.TYPE_ID!="undefined"&&typeof this.opts.types!="undefined")i.TYPE=this.opts.types[i.TYPE_ID].CODE;var s=i.PATH;delete i.PATH;t.push(i);if(typeof s!="undefined"){for(var o in s){var i=BX.clone(e.cache.nodes[s[o]]);if(typeof i.TYPE_ID!="undefined"&&typeof this.opts.types!="undefined")i.TYPE=this.opts.types[i.TYPE_ID].CODE;delete i.PATH;t.push(i)}}}return t},setInitialValue:function(){if(this.opts.selectedItem!==false)this.setValueByLocationId(this.opts.selectedItem);else if(this.ctrls.inputs.origin.value.length>0){if(this.opts.provideLinkBy=="id")this.setValueByLocationId(this.ctrls.inputs.origin.value);else this.setValueByLocationCode(this.ctrls.inputs.origin.value)}},addItem2Cache:function(e){this.vars.cache.nodes[e.VALUE]=e;this.vars.cache.nodesByCode[e.CODE]=e},refineRequest:function(e){var t={};if(typeof e["QUERY"]!="undefined")t["=PHRASE"]=e.QUERY;if(typeof e["VALUE"]!="undefined")t["=ID"]=e.VALUE;if(typeof e["CODE"]!="undefined")t["=CODE"]=e.CODE;if(typeof this.opts.query.BEHAVIOUR.LANGUAGE_ID!="undefined")t["=NAME.LANGUAGE_ID"]=this.opts.query.BEHAVIOUR.LANGUAGE_ID;if(BX.type.isNotEmptyString(this.opts.query.FILTER.SITE_ID))t["=SITE_ID"]=this.opts.query.FILTER.SITE_ID;var i={select:{VALUE:"ID",DISPLAY:"NAME.NAME",1:"CODE",2:"TYPE_ID"},additionals:{1:"PATH"},filter:t,version:"2"};if(typeof e["order"]!="undefined")i["order"]=e.order;return i},refineResponce:function(e,t){if(typeof e.ETC.PATH_ITEMS!="undefined"){for(var i in e.ETC.PATH_ITEMS){if(BX.type.isNotEmptyString(e.ETC.PATH_ITEMS[i].DISPLAY))this.vars.cache.path[i]=e.ETC.PATH_ITEMS[i].DISPLAY}for(var i in e.ITEMS){var s=e.ITEMS[i];if(typeof s.PATH!="undefined"){var o=BX.clone(s.PATH);for(var n in s.PATH){var a=s.PATH[n];o.shift();if(typeof this.vars.cache.nodes[a]=="undefined"&&typeof e.ETC.PATH_ITEMS[a]!="undefined"){var l=BX.clone(e.ETC.PATH_ITEMS[a]);l.PATH=BX.clone(o);this.vars.cache.nodes[a]=l}}}}}return e.ITEMS},refineItems:function(e){return e},refineItemDataForTemplate:function(e){return e},getSelectorValue:function(e){if(this.opts.provideLinkBy=="id")return e;if(typeof this.vars.cache.nodes[e]!="undefined")return this.vars.cache.nodes[e].CODE;else return""},whenLoaderToggle:function(e){BX[e?"show":"hide"](this.ctrls.loader)}})}
/* End */
;; /* /bitrix/templates/redesign/components/studiofact/sale.order.ajax/new_order/script.js?159717579158008*/
; /* /bitrix/templates/redesign/components/studiofact/sale.order.ajax/new_order/order_ajax.js?1585720465233098*/
; /* /bitrix/components/bitrix/sale.location.selector.steps/templates/.default/script.min.js?15740183027752*/
; /* /bitrix/templates/redesign/components/bitrix/main.userconsent.request/.default/user_consent.js?157963569610594*/
; /* /bitrix/components/bitrix/sale.location.selector.search/templates/.default/script.min.js?15740183007747*/

//# sourceMappingURL=page_13fa940e6b78e5cce493abcd66a5f0c1.map.js