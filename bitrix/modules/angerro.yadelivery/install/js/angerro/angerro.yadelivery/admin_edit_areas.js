/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

//����� ��������� ������ ��� ��������:
var colors_tab_3 = ['#FFD100', '#FF7140', '#ACF53D', '#65E17B', '#5DCEC6', '#92B6E9', '#717BD8', '#896ED7', '#A768D5', '#DB63C4'];
//����������, ����������� ������������� ��������/������� �� ����� (�������� ������ �� ������ �����)
var canEdit_tab_3 = true;
//��������� ���������
/*var stepTxt_tab_3 = ['1.��������� ������� �������� �� �����, ����� ������� ������ "��������������� ����� � �������� ��� ��������". ���� �� ������� �������� ��������/��������� ����� � ��������������.',
               '2.�������������� ������������ �������� ��������, �� ����� � ������� "��������� ����� � �������� ��� ��������"',
               '3.����� ������! ������� �������� ����� � ������ �������� � ������� "��������� ����� ��������".',
               '�����������! ����� ��� �������� ���������! ����� ���������� ��������� ����� ��������, ������� "�������� ��������" � �������� � � ������ �������.',
               '���� �� ������ �������� ��������� ������� ��������, ��������� � ������ 1.'
              ];*/

var stepTxt_tab_3 = [];
              

var myMap_tab3;

//�������� ���������
var area_titles_tab_3 = [];			  
         
function editAreas (map_id, date){
    
ymaps.ready(function () {
	
	$('#angerro_yadelivery_tab3_hint').html(stepTxt_tab_3[0]);
	
	area_titles_tab_3 = [];
    
	//������� �����:
	$('#'+map_id).html('');
	
	// ����������� � ������ �� ������ date
	data = JSON.parse(date);

	// �������� ���������� ����� � ��� �������� � ���������� � id = map_id
	var center = data[0].map.center;
	var zoom = data[0].map.zoom;
    
    //������� ����� �� ������ � id = map
    myMap_tab3 = new ymaps.Map(map_id, {
        center: center,
        zoom: zoom,
        controls: ['zoomControl']
    });
	
	//�������� ����� ��� ��������:
	$('#angerro_yadelivery_tab3_delivery_map_name').val(data[0].map.map_id);
	
	/*
	 * ������� �� ����� �������� �� ������� data 
	 */
	for (var k = 0; k < data[0].delivery_areas.length; k++) {
		var areaCoord = data[0].delivery_areas[k].area_coordinates;
		var areaColor = data[0].delivery_areas[k].settings.color;
		var areaTitle = data[0].delivery_areas[k].settings.title;   
		myMap_tab3.geoObjects.add(new ymaps.Polygon(areaCoord,
				{pointColor: areaColor, deliveryZone: areaTitle, hintContent: areaTitle}, {fillColor: areaColor, opacity: 0.5}));
		colors_tab_3[k] = areaColor; 
		area_titles_tab_3.push(areaTitle);
	}
	
	//������� ���������� ����� �� ��������: ��� ������� ��������/��������� ����� �������������� ���� ����� ������������� (canEdit_tab_3=true)
	//������� ��������� ���� ��������:
	myMap_tab3.geoObjects.each(function (geoObject) {
		geoObject.editor.startEditing();
		geoObject.events.add('click', function (){
			if(canEdit_tab_3==true){
				if ((geoObject.editor.state.get('editing')==true)&&(geoObject.editor.state.get('drawing')==false)){	
					geoObject.editor.stopEditing();
				}
				else{
					geoObject.editor.startEditing();
				}
			}
			else{
				alert(stepTxt_tab_3[4]);
			}
		});
	});
    
    //������� ������ ������
    //myMap_tab3.controls.add('searchControl').add('scaleLine').add('zoomControl');
	
    
    //������� ���������� ������� ����� �� �����:
    var onClick = function (e) {  
        if(canEdit_tab_3==true){
            alert(stepTxt_tab_3[5]);

            //��������� ����� ���� ��������, ������� ������:
            areas_count = 1;
            myMap_tab3.geoObjects.each(function (geoObject) {
                areas_count++;
            });


            var shape = new ymaps.Polygon([], {hintContent: stepTxt_tab_3[6]+" "+areas_count}, {fillColor: colors_tab_3[areas_count-1], opacity: 0.5});
            myMap_tab3.geoObjects.add(shape);

            shape.editor.startDrawing();
			
            //������� ���������� ����� �� ��������: ��� ������� ��������/��������� ����� �������������� ���� ����� ������������� (canEdit_tab_3=true)
            shape.events.add('click', function (){
                if(canEdit_tab_3==true){
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
                    alert(stepTxt_tab_3[4]);
                }
            });
        }
        else{
            alert(stepTxt_tab_3[4]);
        }
    };
    
    myMap_tab3.events.add('click', onClick);
    
});
}

$( document ).ready(function() {
	$.post("/bitrix/components/angerro/angerro.yadelivery/classes/get_map.php", {map_id: 1})
		.done(function (data) {

			$.each($('.angerro_yadelivery_text_info_tab3'), function( index, value ) {
			  stepTxt_tab_3.push( $(this).html() );
			}); 

			editAreas('angerro_yadelivery_tab3_map_preview', data);
			
			//��������� ������ ������:
			// ���������� ����� ��������:
			$( "#angerro_yadelivery_tab3_send" ).click(function() { 
				var iterator = 0;
				var data = [];
				var data_areas = [];
				//���������� ���������
				var area_coordinates = [];
				myMap_tab3.geoObjects.each(function (geoObject) {
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
							   settings: {title: area_titles_tab_3[i], color: colors_tab_3[i]}
							  });
				}
				// ������� � ������ ��� �������� ����� ����� � � ���:
				var map_center = myMap_tab3.getCenter();
				var map_zoom = myMap_tab3.getZoom();
				data.push({map: {zoom: map_zoom, center: map_center, map_id: $('#angerro_yadelivery_tab3_delivery_map_name').val()}, delivery_areas: data_areas});
				
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
				
				//console.log ('send!');
				
				$.ajax({
					type: "POST",
					url: "/bitrix/components/angerro/angerro.yadelivery/classes/save_map.php",
					data: "map_data="+json+"&map_name="+$('#angerro_yadelivery_tab3_delivery_map_name').val()+"&sessid="+$('#sessid').val()+"&map_id="+$('#angerro_yadelivery_tab3_map_preview').attr('map_id'),
					success: function(result){
						if (result=='OK'){
							$('#angerro_yadelivery_tab3_hint').html(stepTxt_tab_3[3]);
							//$( "<br><a href='/comp_map/view/?map_type="+$('#angerro_yadelivery_tab3_delivery_map_name').val()+"' target='_blank'>���������� ��� �������� ����� ��� �������� � ������������� (��������� � ����� �������)</a>" ).insertAfter( "#angerro_yadelivery_tab3_hint" );
							//$( "<a href='/comp_map/draw/'>������� ��� ���� ����� ��� ��������</a>" ).insertAfter( "#angerro_yadelivery_tab3_hint" );  
							$('.angerro_yadelivery_tab3_map_name_block').hide();
							$('#angerro_yadelivery_tab3_send').hide();
							$('#angerro_yadelivery_tab3_back_on_step_2').hide();
						}
					}
				});
				
			});
			
			// ���������� ������ � ����� ��������:
			$( "#angerro_yadelivery_tab3_create_description" ).click(function() { 
				
				canEdit_tab_3 = false;
				
				//fix: ������ ��������, � ������� ��� ������, ���� �������, ��� �������:
				myMap_tab3.geoObjects.each(function (geoObject) {
					var obj_length = geoObject.geometry.getCoordinates().length;
					if (obj_length==0){
						myMap_tab3.geoObjects.remove(geoObject);
					}else{
						if (obj_length==1){
							if(geoObject.geometry.getCoordinates()[0].length<4){
								myMap_tab3.geoObjects.remove(geoObject);
							}
						}
					}
				});
				
				//��������� ���������� ��� ��������:
				areas_count = 0;
				myMap_tab3.geoObjects.each(function (geoObject) {
					areas_count++;
				});
				//������ ������ �������� ����� �������������� � ������� ������ ����������:
				$(this).hide();
				$('#angerro_yadelivery_tab3_save_description').show();
				$('#angerro_yadelivery_tab3_back_on_step_1').show();
				$('#angerro_yadelivery_tab3_delivery_description').show('slow');
				$('#angerro_yadelivery_tab3_hint').html(stepTxt_tab_3[1]);
				
				//������� ����������� ���� ��� ����������:
				//������� ���� ����
				$('#angerro_yadelivery_tab3_delivery_description').html('');
				//����� ��������� ���������
				$('#angerro_yadelivery_tab3_delivery_description').append('<div class="angerro_yadelivery_tab3_header">'+stepTxt_tab_3[7]+'</div><div class="angerro_yadelivery_tab3_header">'+stepTxt_tab_3[8]+'</div><div class="angerro_yadelivery_tab3_clear"></div>');
				for (var i = 0; i < areas_count; i++){
					
					var title_area = area_titles_tab_3[i];
					if ((area_titles_tab_3[i]=='')||(area_titles_tab_3[i]===undefined)){
						title_area = stepTxt_tab_3[6]+' '+(i+1);
					}
					
					var table_tr ='<div class="angerro_yadelivery_tab3_content angerro_yadelivery_tab3_color"><input type="color" class="angerro_yadelivery_tab3_select_color" value="'+colors_tab_3[i]+'"></div><div class="angerro_yadelivery_tab3_content angerro_yadelivery_tab3_margin_10"><input type="text" class="form-control angerro_yadelivery_tab3_input_name" value="'+title_area+'"></div><div class="angerro_yadelivery_tab3_clear"></div>';
					
					$('#angerro_yadelivery_tab3_delivery_description').append(table_tr);
				}
				//������� ��������� ���� ��������:
				myMap_tab3.geoObjects.each(function (geoObject) {
					geoObject.editor.stopDrawing();
					geoObject.editor.stopEditing();
				});
			});
			
			$( "#angerro_yadelivery_tab3_save_description" ).click(function(){
				//������� ������ � ����������:
				area_titles_tab_3 = [];
				//�������� ������ ����������:
				$( ".angerro_yadelivery_tab3_input_name" ).each(function( index ) {
					area_titles_tab_3.push($(this).val());
				});
				
				//�������� ������ ������:
				$( ".angerro_yadelivery_tab3_select_color" ).each(function( index ) {
					colors_tab_3[index] = $(this).val();
				});
				
				//�������� ����� �������� �������� �������� � �� ����� �� �����:
				var iterator = 0;
				myMap_tab3.geoObjects.each(function (geoObject) {
					geoObject.properties.set({hintContent:area_titles_tab_3[iterator]});
					geoObject.options.set({fillColor:colors_tab_3[iterator]});
					iterator++;
				});
				
				//������ ������� � ������� ������ ���������� �����
				$('#angerro_yadelivery_tab3_delivery_description').hide('slow');
				$('#angerro_yadelivery_tab3_save_description').hide();
				$('#angerro_yadelivery_tab3_back_on_step_1').hide();
				$('#angerro_yadelivery_tab3_back_on_step_2').show();
				$('#angerro_yadelivery_tab3_send').show();
				$('#angerro_yadelivery_tab3_hint').html(stepTxt_tab_3[2]);
				$('.angerro_yadelivery_tab3_map_name_block').show();
			});
			
			$( "#angerro_yadelivery_tab3_back_on_step_1" ).click(function(){
				canEdit_tab_3 = true;
				$('#angerro_yadelivery_tab3_delivery_description').hide('slow');
				$('#angerro_yadelivery_tab3_save_description').hide();
				$('#angerro_yadelivery_tab3_back_on_step_1').hide();
				$('#angerro_yadelivery_tab3_create_description').show();
				$('#angerro_yadelivery_tab3_hint').html(stepTxt_tab_3[0]);
				//������� ��������� ���� ��������:
				myMap_tab3.geoObjects.each(function (geoObject) {
					geoObject.editor.startEditing();
				});
				
			});
			
			$( "#angerro_yadelivery_tab3_back_on_step_2" ).click(function(){
				$('#angerro_yadelivery_tab3_back_on_step_2').hide();
				$('#angerro_yadelivery_tab3_send').hide();
				$('#angerro_yadelivery_tab3_delivery_description').show('slow');
				$('#angerro_yadelivery_tab3_back_on_step_1').show();
				$('#angerro_yadelivery_tab3_save_description').show();
				$('#angerro_yadelivery_tab3_hint').html(stepTxt_tab_3[1]);
				$('.angerro_yadelivery_tab3_map_name_block').hide();
			});
			
		});
		
});

//����� �������� ������ "�������������" - ������ ����� � ��������� id-�����
$(document).on('click', '.angerro_yadelivery_tab3_show', function (e) {
    e.preventDefault();
	$.post("/bitrix/components/angerro/angerro.yadelivery/classes/get_map.php", {map_id: $('[name="show_map_id_tab_3"]').val()})
		.done(function (data) {
			
			canEdit_tab_3 = true;
			$('#angerro_yadelivery_tab3_delivery_description').hide('slow');
			$('#angerro_yadelivery_tab3_save_description').hide();
			$('#angerro_yadelivery_tab3_back_on_step_1').hide();
			$('#angerro_yadelivery_tab3_create_description').show();
			$('#angerro_yadelivery_tab3_hint').html(stepTxt_tab_3[0]);
			$('.angerro_yadelivery_tab3_map_name_block').hide();
			$('#angerro_yadelivery_tab3_back_on_step_2').hide();
			$('#angerro_yadelivery_tab3_send').hide();
			
			$('#angerro_yadelivery_tab3_map_preview').attr('map_id', $('[name="show_map_id_tab_3"]').val());
			editAreas('angerro_yadelivery_tab3_map_preview', data);
		});
});


//����� �������� ������ "�������" - ������� ����� � ��������� id-�����
$(document).on('click', '.angerro_yadelivery_tab3_delete', function (e) {
    e.preventDefault();
	$.post("/bitrix/components/angerro/angerro.yadelivery/classes/delete_map.php", {map_id: $('[name="show_map_id_tab_3"]').val(), sessid: $('#sessid').val()})
		.done(function (data) {
			location.reload();
		});
});

//����� �������� ����� � ������ - ������ ���������� ������ "�������"
$(document).on('change', '[name=show_map_id_tab_3]', function (e) {
    if($(this).val()=='1'){
		$('.angerro_yadelivery_tab3_delete').attr('disabled', 'disabled');
	} else {
		$('.angerro_yadelivery_tab3_delete').removeAttr('disabled');
	}
});

