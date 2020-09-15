/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

//карта дефолтных цветов зон доставки:
var colors_tab_2 = ['#FFD100', '#FF7140', '#ACF53D', '#65E17B', '#5DCEC6', '#92B6E9', '#717BD8', '#896ED7', '#A768D5', '#DB63C4'];
//переменная, позволяющая редактировать полигоны/кликать по карте (доступна только на первом этапе)
var canEdit_tab_2 = true;
//текстовые подсказки
/*var stepTxt_tab_2 = ['1.Нарисуйте области доставки на карте, затем нажмите кнопку "Отредактировать цвета и названия зон доставки". Клик по области доставки включает/выключает режим её редактирования.',
               '2.Отредактируйте наименования областей доставки, их цвета и нажмите "Применить цвета и названия зон доставки"',
               '3.Почти готово! Введите название карты с зонами доставки и нажмите "Сохранить карту доставки".',
               'Поздравляем! Карта зон доставки сохранена! Чтобы посмотреть созданную карту доставки, нажмите "Обновить страницу" и выберите её в первой вкладке.',
               'Если вы хотите изменить геометрию области доставки, вернитесь к пункту 1.'
              ];*/
var stepTxt_tab_2 = [];
    
//console.log (stepTxt_tab_2);        
         
function drawAreas (map_id){
    
ymaps.ready(function () {
	
	$('#angerro_yadelivery_tab2_hint').html(stepTxt_tab_2[0]);
    
    //названия полигонов
    var area_titles = [];
    
    //добавим карту на дивник с id = map
    myMap = new ymaps.Map(map_id, {
        center: [59.9296,30.3186], 
        zoom: 12,
        behaviors: ["default", "scrollZoom"],
		controls: ["searchControl", "zoomControl"]
    });
    
    //добавим строку поиска
    //myMap.controls.add('searchControl').add('scaleLine').add('zoomControl');
	
    
    //добавим обработчик события клика по карте:
    var onClick = function (e) {  
        if(canEdit_tab_2==true){
            alert(stepTxt_tab_2[5]);

            //определим номер зоны доставки, которую рисуем:
            areas_count = 1;
            myMap.geoObjects.each(function (geoObject) {
                areas_count++;
            });


            var shape = new ymaps.Polygon([], {hintContent: stepTxt_tab_2[6]+" "+areas_count}, {fillColor: colors_tab_2[areas_count-1], opacity: 0.5});
            myMap.geoObjects.add(shape);

            shape.editor.startDrawing();
			
            //добавим обработчик клика по полигону: при нажатии включаем/выключаем режим редактирования если можно редактировать (canEdit_tab_2=true)
            shape.events.add('click', function (){
                if(canEdit_tab_2==true){
					// если объект редактируем, но не находится в режиме добавления вершин, то отключаем редактирование
                    if ((shape.editor.state.get('editing')==true)&&(shape.editor.state.get('drawing')==false)){
                        shape.editor.stopEditing();
                    }
                    else{
                        shape.editor.startEditing();
                    }
					//console.log (shape.editor.state.get('drawing'));
                }
                else{
                    alert(stepTxt_tab_2[4]);
                }
            });
        }
        else{
            alert(stepTxt_tab_2[4]);
        }
    };
    
    myMap.events.add('click', onClick);
    
    // сохранение карты доставки:
    $( "#angerro_yadelivery_tab2_send" ).click(function() { 
        var iterator = 0;
        var data = [];
        var data_areas = [];
        //координаты полигонов
        var area_coordinates = [];
        myMap.geoObjects.each(function (geoObject) {
            area_coordinates[iterator] = geoObject.geometry.getCoordinates();
            iterator++;
        });
        
        /*
         * сформируем данные для отправки в виде массива объектов с двумя полями:
         * -area_coordinates (все координаты полигона)
         * -settings (доп. данные полигона: цвет, название и пр.)
         */
        for (var i=0; i < area_coordinates.length; i++){
            data_areas.push({area_coordinates: area_coordinates[i], 
                       settings: {title: area_titles[i], color: colors_tab_2[i]}
                      });
        }
        // добавим в данные для отправки центр карты и её зум:
        var map_center = myMap.getCenter();
        var map_zoom = myMap.getZoom();
        data.push({map: {zoom: map_zoom, center: map_center, map_id: $('#angerro_yadelivery_tab2_delivery_map_name').val()}, delivery_areas: data_areas});
        
        /*
         * итоговый формат данных:
         * [
                {
                    "map":{
                        "zoom":12,
                        "center":[
                            59.928971911376344,
                            30.30770241405099
                        ],
                        "map_id":"delivery_spb"
                    },
                    "delivery_areas":[
                        {
                            "area_coordinates":[
                                [
                                    [
                                        59.918397455124335,
                                        30.283581079101552
                                    ],
                                    [
                                        59.93149543984123,
                                        30.307613671874975
                                    ],
                                    [
                                        59.91753556370916,
                                        30.31036025390622
                                    ],
                                    [
                                        59.918397455124335,
                                        30.283581079101552
                                    ]
                                ]
                            ],
                            "settings":{
                                "title":"Зона доставки 1",
                                "color":"#FFD100"
                            }
                        }
                    ]
                }
            ]
         */
        
        //отправляем в формате json:
        var json = JSON.stringify(data);
        
		$.ajax({
            type: "POST",
            url: "/bitrix/components/angerro/angerro.yadelivery/classes/save_map.php",
            data: "map_data="+json+"&map_name="+$('#angerro_yadelivery_tab2_delivery_map_name').val()+"&sessid="+$('#sessid').val(),
            success: function(result){
                if (result=='OK'){
                    $('#angerro_yadelivery_tab2_hint').html(stepTxt_tab_2[3]);
                    //$( "<br><a href='/comp_map/view/?map_type="+$('#angerro_yadelivery_tab2_delivery_map_name').val()+"' target='_blank'>Посмотреть как выглядит карта зон доставок в просмоторщике (откроется в новой вкладке)</a>" ).insertAfter( "#angerro_yadelivery_tab2_hint" );
                    //$( "<a href='/comp_map/draw/'>Сделать ещё одну карту зон доставки</a>" ).insertAfter( "#angerro_yadelivery_tab2_hint" );  
                    $('.angerro_yadelivery_tab2_map_name_block').hide();
                    $('#angerro_yadelivery_tab2_send').hide();
                    $('#angerro_yadelivery_tab2_back_on_step_2').hide();
                }
            }
        });
    });
    
    // заполнение данных о зонах доставки:
    $( "#angerro_yadelivery_tab2_create_description" ).click(function() { 
        
        canEdit_tab_2 = false;
        
        //fix: удалим полигоны, у которых нет вершин, одна вершина, две вершины:
        myMap.geoObjects.each(function (geoObject) {
            var obj_length = geoObject.geometry.getCoordinates().length;
            if (obj_length==0){
                myMap.geoObjects.remove(geoObject);
            }else{
                if (obj_length==1){
                    if(geoObject.geometry.getCoordinates()[0].length<4){
                        myMap.geoObjects.remove(geoObject);
                    }
                }
            }
        });
        
        //определим количество зон доставки:
        areas_count = 0;
        myMap.geoObjects.each(function (geoObject) {
            areas_count++;
        });
        //скроем кнопку создания блока редактирования и покажем кнопку сохранения:
        $(this).hide();
        $('#angerro_yadelivery_tab2_save_description').show();
        $('#angerro_yadelivery_tab2_back_on_step_1').show();
        $('#angerro_yadelivery_tab2_delivery_description').show('slow');
        $('#angerro_yadelivery_tab2_hint').html(stepTxt_tab_2[1]);
        
        //добавим необходимые поля для заполнения:
		//очищаем весь блок
        $('#angerro_yadelivery_tab2_delivery_description').html('');
		//пишем дефолтный заголовок
        $('#angerro_yadelivery_tab2_delivery_description').append('<div class="angerro_yadelivery_tab2_header">'+stepTxt_tab_2[7]+'</div><div class="angerro_yadelivery_tab2_header">'+stepTxt_tab_2[8]+'</div><div class="angerro_yadelivery_tab2_clear"></div>');
        for (var i = 0; i < areas_count; i++){
            
			var table_tr ='<div class="angerro_yadelivery_tab2_content angerro_yadelivery_tab2_color"><input type="color" class="angerro_yadelivery_tab2_select_color" value="'+colors_tab_2[i]+'"></div><div class="angerro_yadelivery_tab2_content angerro_yadelivery_tab2_margin_10"><input type="text" class="form-control angerro_yadelivery_tab2_input_name" value="'+stepTxt_tab_2[6]+' '+(i+1)+'"></div><div class="angerro_yadelivery_tab2_clear"></div>';
			
            $('#angerro_yadelivery_tab2_delivery_description').append(table_tr);
        }
        //вырубим рисование всех объектов:
        myMap.geoObjects.each(function (geoObject) {
            geoObject.editor.stopDrawing();
            geoObject.editor.stopEditing();
        });
    });
    
    $( "#angerro_yadelivery_tab2_save_description" ).click(function(){
        //очищаем массив с названиями:
        area_titles = [];
        //заполним массив заголовков:
        $( ".angerro_yadelivery_tab2_input_name" ).each(function( index ) {
            area_titles.push($(this).val());
        });
        
        //заполним массив цветов:
        $( ".angerro_yadelivery_tab2_select_color" ).each(function( index ) {
            colors_tab_2[index] = $(this).val();
        });
        
        //применим новые названия областей доставки и их цвета на карте:
        var iterator = 0;
        myMap.geoObjects.each(function (geoObject) {
            geoObject.properties.set({hintContent:area_titles[iterator]});
            geoObject.options.set({fillColor:colors_tab_2[iterator]});
            iterator++;
        });
        
        //скроем таблицу и покажем кнопку сохранения карты
        $('#angerro_yadelivery_tab2_delivery_description').hide('slow');
        $('#angerro_yadelivery_tab2_save_description').hide();
        $('#angerro_yadelivery_tab2_back_on_step_1').hide();
        $('#angerro_yadelivery_tab2_back_on_step_2').show();
        $('#angerro_yadelivery_tab2_send').show();
        $('#angerro_yadelivery_tab2_hint').html(stepTxt_tab_2[2]);
        $('.angerro_yadelivery_tab2_map_name_block').show();
    });
    
    $( "#angerro_yadelivery_tab2_back_on_step_1" ).click(function(){
        canEdit_tab_2 = true;
        $('#angerro_yadelivery_tab2_delivery_description').hide('slow');
        $('#angerro_yadelivery_tab2_save_description').hide();
        $('#angerro_yadelivery_tab2_back_on_step_1').hide();
        $('#angerro_yadelivery_tab2_create_description').show();
        $('#angerro_yadelivery_tab2_hint').html(stepTxt_tab_2[0]);
        //включим рисование всех объектов:
        myMap.geoObjects.each(function (geoObject) {
            geoObject.editor.startEditing();
        });
        
    });
    
    $( "#angerro_yadelivery_tab2_back_on_step_2" ).click(function(){
        $('#angerro_yadelivery_tab2_back_on_step_2').hide();
        $('#angerro_yadelivery_tab2_send').hide();
        $('#angerro_yadelivery_tab2_delivery_description').show('slow');
        $('#angerro_yadelivery_tab2_back_on_step_1').show();
        $('#angerro_yadelivery_tab2_save_description').show();
        $('#angerro_yadelivery_tab2_hint').html(stepTxt_tab_2[1]);
        $('.angerro_yadelivery_tab2_map_name_block').hide();
    });
    
    $( "#go_to_mainpage" ).click(function(){
        window.location.replace('/comp_map/');
    });
});
}

$( document ).ready(function() {

    $.each($('.angerro_yadelivery_text_info_tab2'), function( index, value ) {
        stepTxt_tab_2.push( $(this).html() );
    });  

    drawAreas('angerro_yadelivery_tab2_map_preview');
});


