{"version":3,"sources":["script.js"],"names":["window","JCSaleProductsGiftSectionComponent","params","this","formPosting","siteId","template","componentPath","parameters","container","document","querySelector","initiallyShowHeader","BX","ready","delegate","showHeader","deferredLoad","prototype","sendRequest","action","data","defaultData","ajax","url","location","href","indexOf","method","dataType","timeout","merge","onsuccess","result","JS","processScripts","processHTML","SCRIPT","showAction","processDeferredLoadAction","bigData","position","rows","processItems","items","util","array_keys","itemsHtml","processed","temporaryNode","create","k","origRows","innerHTML","HTML","querySelectorAll","length","hasOwnProperty","style","opacity","type","isDomNode","parentNode","insertBefore","appendChild","easing","duration","start","finish","transition","makeEaseOut","transitions","quad","step","state","complete","removeAttribute","animate","findParent","attr","data-entity","header","getAttribute","display","setAttribute"],"mappings":"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","file":""}