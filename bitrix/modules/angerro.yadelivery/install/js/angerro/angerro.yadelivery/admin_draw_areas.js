/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

//����� ��������� ������ ��� ��������:
var colors_tab_2 = ['#FFD100', '#FF7140', '#ACF53D', '#65E17B', '#5DCEC6', '#92B6E9', '#717BD8', '#896ED7', '#A768D5', '#DB63C4'];
//����������, ����������� ������������� ��������/������� �� ����� (�������� ������ �� ������ �����)
var canEdit_tab_2 = true;
//��������� ���������
/*var stepTxt_tab_2 = ['1.��������� ������� �������� �� �����, ����� ������� ������ "��������������� ����� � �������� ��� ��������". ���� �� ������� �������� ��������/��������� ����� � ��������������.',
               '2.�������������� ������������ �������� ��������, �� ����� � ������� "��������� ����� � �������� ��� ��������"',
               '3.����� ������! ������� �������� ����� � ������ �������� � ������� "��������� ����� ��������".',
               '�����������! ����� ��� �������� ���������! ����� ���������� ��������� ����� ��������, ������� "�������� ��������" � �������� � � ������ �������.',
               '���� �� ������ �������� ��������� ������� ��������, ��������� � ������ 1.'
              ];*/
var stepTxt_tab_2 = [];
    
//console.log (stepTxt_tab_2);        
         
function drawAreas (map_id){
    
ymaps.ready(function () {
	
	$('#angerro_yadelivery_tab2_hint').html(stepTxt_tab_2[0]);
    
    //�������� ���������
    var area_titles = [];
    
    //������� ����� �� ������ � id = map
    myMap = new ymaps.Map(map_id, {
        center: [59.9296,30.3186], 
        zoom: 12,
        behaviors: ["default", "scrollZoom"],
		controls: ["searchControl", "zoomControl"]
    });
    
    //������� ������ ������
    //myMap.controls.add('searchControl').add('scaleLine').add('zoomControl');
	
    
    //������� ���������� ������� ����� �� �����:
    var onClick = function (e) {  
        if(canEdit_tab_2==true){
            alert(stepTxt_tab_2[5]);

            //��������� ����� ���� ��������, ������� ������:
            areas_count = 1;
            myMap.geoObjects.each(function (geoObject) {
                areas_count++;
            });


            var shape = new ymaps.Polygon([], {hintContent: stepTxt_tab_2[6]+" "+areas_count}, {fillColor: colors_tab_2[areas_count-1], opacity: 0.5});
            myMap.geoObjects.add(shape);

            shape.editor.startDrawing();
			
            //������� ���������� ����� �� ��������: ��� ������� ��������/��������� ����� �������������� ���� ����� ������������� (canEdit_tab_2=true)
            shape.events.add('click', function (){
                if(canEdit_tab_2==true){
					// ���� ������ �����������, �� �� ��������� � ������ ���������� ������, �� ��������� ��������������
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
    
    // ���������� ����� ��������:
    $( "#angerro_yadelivery_tab2_send" ).click(function() { 
        var iterator = 0;
        var data = [];
        var data_areas = [];
        //���������� ���������
        var area_coordinates = [];
        myMap.geoObjects.each(function (geoObject) {
            area_coordinates[iterator] = geoObject.geometry.getCoordinates();
            iterator++;
        });
        
        /*
         * ���������� ������ ��� �������� � ���� ������� �������� � ����� ������:
         * -area_coordinates (��� ���������� ��������)
         * -settings (���. ������ ��������: ����, �������� � ��.)
         */
        for (var i=0; i < area_coordinates.length; i++){
            data_areas.push({area_coordinates: area_coordinates[i], 
                       settings: {title: area_titles[i], color: colors_tab_2[i]}
                      });
        }
        // ������� � ������ ��� �������� ����� ����� � � ���:
        var map_center = myMap.getCenter();
        var map_zoom = myMap.getZoom();
        data.push({map: {zoom: map_zoom, center: map_center, map_id: $('#angerro_yadelivery_tab2_delivery_map_name').val()}, delivery_areas: data_areas});
        
        /*
         * �������� ������ ������:
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
                                "title":"���� �������� 1",
                                "color":"#FFD100"
                            }
                        }
                    ]
                }
            ]
         */
        
        //���������� � ������� json:
        var json = JSON.stringify(data);
        
		$.ajax({
            type: "POST",
            url: "/bitrix/components/angerro/angerro.yadelivery/classes/save_map.php",
            data: "map_data="+json+"&map_name="+$('#angerro_yadelivery_tab2_delivery_map_name').val()+"&sessid="+$('#sessid').val(),
            success: function(result){
                if (result=='OK'){
                    $('#angerro_yadelivery_tab2_hint').html(stepTxt_tab_2[3]);
                    //$( "<br><a href='/comp_map/view/?map_type="+$('#angerro_yadelivery_tab2_delivery_map_name').val()+"' target='_blank'>���������� ��� �������� ����� ��� �������� � ������������� (��������� � ����� �������)</a>" ).insertAfter( "#angerro_yadelivery_tab2_hint" );
                    //$( "<a href='/comp_map/draw/'>������� ��� ���� ����� ��� ��������</a>" ).insertAfter( "#angerro_yadelivery_tab2_hint" );  
                    $('.angerro_yadelivery_tab2_map_name_block').hide();
                    $('#angerro_yadelivery_tab2_send').hide();
                    $('#angerro_yadelivery_tab2_back_on_step_2').hide();
                }
            }
        });
    });
    
    // ���������� ������ � ����� ��������:
    $( "#angerro_yadelivery_tab2_create_description" ).click(function() { 
        
        canEdit_tab_2 = false;
        
        //fix: ������ ��������, � ������� ��� ������, ���� �������, ��� �������:
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
        
        //��������� ���������� ��� ��������:
        areas_count = 0;
        myMap.geoObjects.each(function (geoObject) {
            areas_count++;
        });
        //������ ������ �������� ����� �������������� � ������� ������ ����������:
        $(this).hide();
        $('#angerro_yadelivery_tab2_save_description').show();
        $('#angerro_yadelivery_tab2_back_on_step_1').show();
        $('#angerro_yadelivery_tab2_delivery_description').show('slow');
        $('#angerro_yadelivery_tab2_hint').html(stepTxt_tab_2[1]);
        
        //������� ����������� ���� ��� ����������:
		//������� ���� ����
        $('#angerro_yadelivery_tab2_delivery_description').html('');
		//����� ��������� ���������
        $('#angerro_yadelivery_tab2_delivery_description').append('<div class="angerro_yadelivery_tab2_header">'+stepTxt_tab_2[7]+'</div><div class="angerro_yadelivery_tab2_header">'+stepTxt_tab_2[8]+'</div><div class="angerro_yadelivery_tab2_clear"></div>');
        for (var i = 0; i < areas_count; i++){
            
			var table_tr ='<div class="angerro_yadelivery_tab2_content angerro_yadelivery_tab2_color"><input type="color" class="angerro_yadelivery_tab2_select_color" value="'+colors_tab_2[i]+'"></div><div class="angerro_yadelivery_tab2_content angerro_yadelivery_tab2_margin_10"><input type="text" class="form-control angerro_yadelivery_tab2_input_name" value="'+stepTxt_tab_2[6]+' '+(i+1)+'"></div><div class="angerro_yadelivery_tab2_clear"></div>';
			
            $('#angerro_yadelivery_tab2_delivery_description').append(table_tr);
        }
        //������� ��������� ���� ��������:
        myMap.geoObjects.each(function (geoObject) {
            geoObject.editor.stopDrawing();
            geoObject.editor.stopEditing();
        });
    });
    
    $( "#angerro_yadelivery_tab2_save_description" ).click(function(){
        //������� ������ � ����������:
        area_titles = [];
        //�������� ������ ����������:
        $( ".angerro_yadelivery_tab2_input_name" ).each(function( index ) {
            area_titles.push($(this).val());
        });
        
        //�������� ������ ������:
        $( ".angerro_yadelivery_tab2_select_color" ).each(function( index ) {
            colors_tab_2[index] = $(this).val();
        });
        
        //�������� ����� �������� �������� �������� � �� ����� �� �����:
        var iterator = 0;
        myMap.geoObjects.each(function (geoObject) {
            geoObject.properties.set({hintContent:area_titles[iterator]});
            geoObject.options.set({fillColor:colors_tab_2[iterator]});
            iterator++;
        });
        
        //������ ������� � ������� ������ ���������� �����
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
        //������� ��������� ���� ��������:
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


