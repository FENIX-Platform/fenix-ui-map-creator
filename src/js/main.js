/*global requirejs*/
requirejs(['./paths'], function (paths) {

    requirejs.config(paths);

    requirejs(['fx-m-c/start', 'amplify'], function (MapCreator) {

        var mapCreator = new MapCreator();

        mapCreator.render({
            container: '.content',
            model: {}
        });

        // TODO: add map to existing map

        // TODO: add JOIN from catalog to the map
        amplify.subscribe('fx.component.map.ready', function () {
            //$.get("http://faostat3.fao.org/d3s2/v2/msd/resources/uid/UAE_CropProduction10?dsd=true&full=true&order=time", function (model) {
            //    console.log(model);
            //    mapCreator.addLayer(model)
            //})

            $.get("../tests/dataset/FAOSTAT_QC.json", function (model) {
                mapCreator.addLayer(model);
            })
        })
    });
});