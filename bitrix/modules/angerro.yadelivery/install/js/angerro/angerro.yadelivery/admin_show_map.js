/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
// ����������� ��� ������ ������� ���������� ����������
var myMap_tab1, myGeoObjectsCollection_tab_1;

function show_map(map_id, date){
    ymaps.ready(function () {

        //data = [{"map":{"zoom":12,"center":[55.80283961247519,49.15166281709875],"map_id":"delivery_kazan"},"delivery_areas":[{"area_coordinates":[[[55.82274457823194,49.075979447288],[55.827189612628125,49.15416630547058],[55.81752584352005,49.177512252736214],[55.80399251663948,49.18403538506044],[55.79529002524011,49.16755589287294],[55.79316976947244,49.11527060518467],[55.800905836785454,49.06480216036047],[55.82274457823194,49.075979447288]]],"settings":{"title":"���� �������� 1","color":"#8000ff"}}]}];
		
		//������� �����:
		$('#'+map_id).html('');
		
		// ����������� � ������ �� ������ date
		data = JSON.parse(date);

        // �������� ���������� ����� � ��� �������� � ���������� � id = map_id
        var center = data[0].map.center;
        var zoom = data[0].map.zoom;

        myMap_tab1 = new ymaps.Map(map_id, {
            center: center,
            zoom: zoom,
            controls: ['zoomControl']
        });

        // �������� ��������� �����������
        //� ���� ��������� �������� ���� �������� (��������)
        myGeoObjectsCollection_tab_1 = new ymaps.GeoObjectCollection();

        /*
         * ������� � ��������� myGeoObjectsCollection_tab_1 �������� �� ������� data
         */
        for (var k = 0; k < data[0].delivery_areas.length; k++) {
            var areaCoord = data[0].delivery_areas[k].area_coordinates;
            var areaColor = data[0].delivery_areas[k].settings.color;
            var areaTitle = data[0].delivery_areas[k].settings.title;
            myGeoObjectsCollection_tab_1.add(new ymaps.Polygon(areaCoord,
                {pointColor: areaColor, deliveryZone: areaTitle, hintContent: areaTitle}, {fillColor: areaColor, opacity: 0.5}));
        }
        // ������������� ����� ���� ����������� � ��������� ����� ����� ���������
        myGeoObjectsCollection_tab_1.options
            .set({
                draggable: false,
                inderactive: 'none'
            });

        // ���������� ��������� ����������� �� �����
        myMap_tab1.geoObjects
            .add(myGeoObjectsCollection_tab_1);
    });
}
// �� ��������� ������ ����� � id = 1
$( document ).ready(function() {
	angerro_yadelivery_tab1_map_preview.style.display = 'block';
	$.post("/bitrix/components/angerro/angerro.yadelivery/classes/get_map.php", {map_id: 1})
		.done(function (data) {
			show_map('angerro_yadelivery_tab1_map_preview', data);
		});
});
//����� �������� ������ "����������" - ������ ����� � ��������� id-�����
$(document).on('click', '.angerro_yadelivery_tab1_show', function (e) {
    e.preventDefault();
	$.post("/bitrix/components/angerro/angerro.yadelivery/classes/get_map.php", {map_id: $('[name="show_map_id"]').val()})
		.done(function (data) {
			show_map('angerro_yadelivery_tab1_map_preview', data);
		});
});




