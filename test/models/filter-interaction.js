/*global define*/

define(function () {

    'use strict';

    return {

        format : {

            selector : {
                id : 'dropdown',
                source : [
					{ value : "value", label : "Raw Value"}
                ],
                config : {
                    maxItems : 1
                },
                default : ['value']
            },

            template : {
                title : "Format"
            }
        },

        show : {

            selector : {
                id : "input",
                type : "checkbox",
                source : [
                    { value : "unit", label : "Unit"},
                    { value : "flag", label : "Flag"},
                    { value : "code", label : "Code"}
                ]
            },

            template : {
                title : "Show"
            }
        },
		
		     typeOfChart : {

            selector :{
                id : 'dropdown',
                source : [
                    { value : "line", label : "Line"},
                    { value : "column", label : "Columns"},
					  { value : "column_stacked", label : "Stacked columns"},
					  { value : "area", label : "Area"},
					  { value : "area_stacked", label : "Stacked area"},
					   { value : "pie", label : "Pie"},
					    { value : "scatter", label : "Scatter"},					
					  { value : "bubble", label : "Bubble"},					
					  { value : "heatmap", label : "Heatmap"},					
					  { value : "treemap", label : "Treemap"},					
					  { value : "boxplot", label : "Boxplot"}					
					
                ],
                config : {
                    maxItems : 1
                },
                default : ['line']
            },

            template : {
                title : "Type of chart"
            }
        }
		
		
		
    }

});