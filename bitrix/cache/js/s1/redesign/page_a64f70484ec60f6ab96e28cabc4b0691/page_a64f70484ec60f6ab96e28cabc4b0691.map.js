{"version":3, "file":"page_a64f70484ec60f6ab96e28cabc4b0691.js", "sections": [{"offset": { "line": 9390, "column": 0 }, "map": {"version":3,"file":"/bitrix/components/bitrix/sale.location.selector.steps/templates/.default/script.min.js","sources":["/bitrix/components/bitrix/sale.location.selector.steps/templates/.default/script.js"],"names":["BX","namespace","Sale","component","location","selector","steps","ui","widget","opts","nf","this","parentConstruct","merge","bindEvents","after-select-item","value","callback","length","window","apply","disableKeyboardInput","dontShowNextChoice","pseudoValues","provideLinkBy","requestParamsInject","vars","cache","nodesByCode","sys","code","flags","skipAfterSelectItemEventOnce","handleInitStack","extend","chainedSelectors","prototype","init","pushFuncStack","buildUpDOM","ctx","so","bindEvent","adapter","control","getControl","unbindAll","ctrls","toggle","bind","scope","e","toggleDropDown","bindDelegate","tag","setValueByLocationId","data","id","superclass","setValue","setValueByLocationIds","locationsData","PARENT_ID","IDS","filter","=ID","tryDisplayPage","setValueByLocationCode","sv","toString","displayRoute","setValueVariable","setTargetValue","fireEvent","d","deferred","done","proxy","route","VALUE","checkCanSelectItem","getLastValidValue","fail","type","showError","errors","messages","nothingFound","options","hideError","getRouteToNodeByCode","setTargetInputValue","nodes","CODE","getValue","getNodeByLocationId","getSelectedPath","result","node","item","clone","parentId","PARENT_VALUE","TYPE_ID","types","TYPE","push","setInitialValue","selectedItem","inputs","origin","getRouteToNodeFromCache","downloadBundle","request","callbacks","onLoad","k","links","incomplete","fillCache","reject","resolve","onError","addItem2Cache","controlChangeActions","stackIndex","sc","truncateStack","util","in_array","Error","IS_UNCHOOSABLE","appendControl","IS_PARENT","refineRequest","select","DISPLAY","1","2","additionals","isNotEmptyString","query","BEHAVIOUR","LANGUAGE_ID","FILTER","SITE_ID","version","hasOwnProperty","undefined","param","tmp","val","refineResponce","responce","r","levels","ITEMS","ETC","PATH_ITEMS","itemId","parameters","error","errorMessage","innerHTML","htmlspecialchars","join","show","debug"],"mappings":"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"}}]}