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
                        "features": [
{
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
[55.7689269714487, 36.929945614872494],
[55.781196795707004, 36.927233901559106],
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
[55.857417222767, 36.98768284612658],
[55.856765503384075, 36.9832196503258],
[55.85541375392578, 36.980215576229135],
[55.85466544374009, 36.97673943334581],
[55.85341018125341, 36.97330620580676],
[55.85191346891458, 36.97120335393909],
[55.850754684120375, 36.969357994136836],
[55.84901644186964, 36.96077492528918],
[55.84776099613398, 36.95626881414416],
[55.84445318429509, 36.96159031682947],
[55.842328309665156, 36.962663200435614],
[55.84095190748927, 36.970602539119184],
[55.84226794219274, 36.97888520055767],
[55.83981694356894, 36.97761919790263],
[55.838633647076044, 36.979722049770146],
[55.83563902176907, 36.97538760000219],
[55.83109834126342, 36.97075274282446],
[55.82320522666402, 36.97028067403776],
[55.82211806120586, 36.97377827459313],
[55.81899531055271, 36.97338130765869],
[55.81880805825871, 36.955045726832815],
[55.81289404648499, 36.95804980092966],
[55.7970262637284, 36.95294287496542],
[55.784126640035794, 36.9619765549273],
[55.78024956741711, 36.966769662436704],
[55.778747003308425, 36.97503354841156],
[55.7786079297797, 36.990185347136354],
[55.781582779906564, 36.99554976516634],
[55.785633529816806, 36.99428376251112],
[55.789372540849115, 36.99873622947588],
[55.793041680623205, 37.000624504622365],
[55.79436538712514, 37.00432058864469],
[55.795797840538306, 37.00704034858555],
[55.79698848940776, 37.011921968992574],
[55.803013700092016, 37.02539738708336],
[55.808439818524896, 37.032092180784396],
[55.809926128359386, 37.03110512786703],
[55.81083238682195, 37.03799304061727],
[55.81513984562267, 37.03601893478229],
[55.81839579754246, 37.03960773044416],
[55.820038771464816, 37.03742977672407],
[55.82362045470262, 37.0346831946928],
[55.83319816944365, 37.04146381908244],
[55.837907652190765, 37.04618450694865],
[55.83918756644965, 37.05056187206096],
[55.84230265264912, 37.0454549460966],
[55.84529676281312, 37.03433987193888],
[55.844258508896544, 37.023010221059984],
[55.84575551726578, 37.01755997234162],
[55.847107604118555, 37.00768944316682],
[55.84843550059015, 36.999707189138505],
[55.85053589834406, 36.994428601797196],
[55.8541087268771, 36.99515816264925],
[55.857270887741336, 36.99202534251987],
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
[55.82483702937056, 37.097369114905234],
[55.82208746422157, 37.09073601201251],
[55.824772105668465, 37.08290396168904],
[55.8243840676373, 37.07571295932198],
[55.83192973812355, 37.06009177401945],
[55.83805215436127, 37.06559566691809],
[55.839098121736626, 37.050738911185206],
[55.83774273621025, 37.04634008840094],
[55.823612509258936, 37.03473416999284],
[55.8200746167505, 37.037440518888964],
[55.81841352296611, 37.03963456586318],
[55.81511528556998, 37.0360377235741],
[55.81072173036727, 37.03809497788846],
[55.809827552937335, 37.03113196328598],
[55.80865979940823, 37.03227155990885],
[55.80307206636485, 37.0251958925301],
[55.79707557253068, 37.012133534626585],
[55.795807865883354, 37.00710707493379],
[55.794390523172524, 37.00438463278341],
[55.79307588377364, 37.00064295120773],
[55.789393146254255, 36.99873858280742],
[55.78568889915128, 36.994339760022875],
[55.78163815493381, 36.99567013569434],
[55.77844260516865, 36.990168925004475],
[55.76885755735587, 37.021808591420594],
[55.76537364128023, 37.029447522694994],
[55.76440583132705, 37.03202244334929],
[55.764526808884256, 37.03545567088832],
[55.76924463982347, 37.04605576091517],
[55.77161543583125, 37.0547246604513],
[55.77451825414398, 37.0609903007101],
[55.77442149698087, 37.08445426517225],
[55.776791976850014, 37.090258565480596],
[55.78443457866494, 37.09223267131546],
[55.785111698635184, 37.102017369801764],
[55.78482150580935, 37.120900121266615],
[55.78844876011729, 37.122874227101576],
[55.79023808063997, 37.122960057790024],
[55.79176135598561, 37.112445798451596],
[55.794904433654445, 37.10536476665232],
[55.790576591442345, 37.09407803111766],
[55.788666384546254, 37.08081718974793],
[55.798990053744745, 37.07094666057323],
[55.79949770425644, 37.08206173473084],
[55.80114147943833, 37.08579536967958],
[55.80578235085168, 37.085194554860244],
[55.80952848239991, 37.08819862895694],
[55.81124433142632, 37.09618088298525],
[55.810712668015114, 37.108154264027725],
[55.815569867201845, 37.113003697926644],
[55.81643974895619, 37.10424896770189],
[55.81723712356809, 37.09506508403505],
[55.818735176801205, 37.09716793590272],
[55.820474778841835, 37.101287808949614],
[55.82315651230209, 37.10347649150576],
[55.82489591582988, 37.1015023856708],
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
[55.83803707670458, 37.12193234665279],
[55.836405431716145, 37.11371137602242],
[55.83490806154279, 37.10832013590223],
[55.83212449009767, 37.10347874862985],
[55.828237118226106, 37.0993159602393],
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
[55.79489338976986, 37.10535361273089],
[55.79650260780606, 37.11724116308489],
[55.79882036826506, 37.1282409022541],
[55.80313973717455, 37.12701245052554],
[55.804466120284324, 37.1437494347775],
[55.80781813263739, 37.157731790372864],
[55.816484588177005, 37.151586849519504],
[55.82292653525428, 37.1475313494888],
[55.82645057889343, 37.14550091726426],
[55.82923607520995, 37.14311693076692],
[55.831965511245976, 37.141052054915015],
[55.83454984223138, 37.13959293321107],
[55.83747210137867, 37.13594512894954],
[55.838413940486, 37.1287058468179],
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
                                         [55.84213928040347, 37.11995716822624],
[55.848432102987246, 37.12313558590877],
[55.84845624611433, 37.134239931230354],
[55.845041349367705, 37.13801648152333],
[55.844309438765876, 37.146221358899844],
[55.84115678324845, 37.163725454931],
[55.83738201193054, 37.17584099305086],
[55.82726936640207, 37.17989649308154],
[55.8140082744757, 37.175875861767324],
[55.801170199132734, 37.16581489575159],
[55.79597877872054, 37.17143144142986],
[55.79136846819848, 37.17444087994409],
[55.786694133542156, 37.17375354722475],
[55.781760761518925, 37.1710069651935],
[55.777600764315224, 37.16757373765442],
[55.774214390826614, 37.16242389634585],
[55.77034388786067, 37.151437568220835],
[55.771311549786844, 37.142854499373186],
[55.776246250378726, 37.13100986436342],
[55.78504974590448, 37.12139682725403],
[55.788628617952455, 37.12298469499081],
[55.790345392105046, 37.12315635636776],
[55.791820306397206, 37.11251335099667],
[55.79501173221534, 37.10538940385311],
[55.79658317115682, 37.11731986955135],
[55.79885560099582, 37.12826328233212],
[55.803182519340645, 37.126975822004944],
[55.80448775185555, 37.14375572160205],
[55.80779897791876, 37.15770320847951],
[55.81648658033252, 37.15159850076148],
[55.822931546936246, 37.147532271894924],
[55.82645559021442, 37.14550452187962],
[55.82926825327293, 37.143125402483285],
[55.831937301298595, 37.14129077151706],
[55.83466050680692, 37.13983164981287],
[55.83743785799578, 37.135969268830756],
[55.83837969763629, 37.12875949099908],
[55.8381200904711, 37.1220003242817],
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
                                           [55.85229901569957, 37.15827849368734],
[55.85308056454069, 37.16565993289624],
[55.85268677464859, 37.17396941642445],
[55.851096486099365, 37.182123331829665],
[55.84706917287397, 37.191170422836755],
[55.845893643493625, 37.19598230580941],
[55.833819388885765, 37.19279047708159],
[55.82105280774281, 37.19908562163946],
[55.81587160031105, 37.18974616984937],
[55.81426804337158, 37.1759770984972],
[55.82733881539131, 37.18009697154409],
[55.83748313964901, 37.17576252177599],
[55.84120205943759, 37.163746225389225],
[55.84441356634367, 37.14615093425152],
[55.84933896897625, 37.151687013658226],
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
                                           [55.86124172719829, 36.94487166183154],
[55.8682161629583, 36.92238402145163],
[55.86659936381081, 36.91208433883334],
[55.867038514487994, 36.900514232666296],
[55.86624216507232, 36.890472042114546],
[55.86037763258721, 36.886137592346465],
[55.857795025628135, 36.87982903674345],
[55.85196486559914, 36.87037062423341],
[55.8372772560466, 36.84221815841372],
[55.82239792534515, 36.84273314254502],
[55.807899574682885, 36.84917044418097],
[55.78914032885755, 36.86204504745244],
[55.77733862866082, 36.87612128036261],
[55.76824306664189, 36.90410208480596],
[55.768823698115426, 36.929851291348925],
[55.79172659869196, 36.922204090342696],
[55.81961857757911, 36.91791255591916],
[55.8337261090664, 36.92151744483509],
[55.84425509470823, 36.924478603587694],
[55.850025502431386, 36.92713935493052],
[55.85581918757744, 36.9325037729587],
[55.852733144707074, 36.9419666063639],
[55.85036730589634, 36.950850082621926],
[55.84780817299342, 36.95630033133822],
[55.850632865911116, 36.968831611856636],
[55.8523408599723, 36.97176058410157],
[55.85376513644469, 36.97423894523142],
[55.854869517866646, 36.97768290160663],
[55.85556954640643, 36.98092301009554],
[55.85689715279999, 36.983540846094506],
[55.85819152468796, 36.98751051543628],
[55.85632085675896, 36.994264317736196],
[55.86031552877286, 36.99665684817688],
[55.86523890805864, 36.99819643615209],
[55.86944983054121, 37.00114686606821],
[55.874393157506915, 37.00405192153509],
[55.87463442720632, 36.992378947903106],
[55.87106349457858, 36.97890352981357],
[55.866720022753405, 36.9675738789334],
                                        ]]
                                },
                                "options": {"strokeColor": "#FFFFFF", "fillColor": "#b51eff40"},
                                "properties": {"name": "Зона 7", "price": "2500"}
                            }
                        ]};
      
                var date = new Date();
                var hour = date.getHours();
                var minutes = date.getMinutes();
          
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