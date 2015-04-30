// // View
// // ////////////////////////////////////
//
// function list_smoothies() {
// 	var list_container = d3.select("body").append("div").attr("class", "list-container");
//
// 	var recipe_list = list_container.append("div")
// 		.attr("class", "recipes")
// 		.selectAll("div")
// 		.data(smoothies);
//
// 	var recipe_enter = recipe_list.enter()
// 		.append("div")
// 		.attr("class", function(d) { return "recipe-" + d.id; });
//
// 	recipe_enter.append("h2").text(function(d) { return d.name; });
// 	recipe_enter.append("p").text(function(d) { return d.description; });
//
// 	recipe_enter.append("ul")
// 		.attr("class", "ingredients")
// 		.each(function(d, i) {
// 			for(var j = 0; j < d.ingredients.length; j++) {
// 				var current_ingredient = ingredients[d.ingredients[j]];
//
// 				d3.select(this).append("li")
// 					.attr("class", function(d) { return current_ingredient.group; })
// 					.text(function(d) { return d.quantities[j] + " " + current_ingredient.unit + " " + current_ingredient.name; });
// 			}
// 		});
//
// 	recipe_enter.append("div")
// 		.attr("class", "nutrition")
// 		.append("svg")
// 		.attr("class", "graph")
// 		.each(function(d, i) {
// 			var graph = d3.select(this);
// 			for(var j = 0; j < d.total.length; j++) {
// 			var graph_enter = graph.append("g");
// 				graph_enter
// 					.append("circle")
// 					.attr("r", 50)
// 					.attr("cy", 75)
// 					.attr("cx", 50 + j*150);
//
// 				graph_enter
// 					.append("text")
// 					.attr("y", 85)
// 					.attr("x", 50 + j*150)
// 					.text(function() {
// 						var number = Math.round(d.total[j] * 100) / 100;
// 						var unit = ["kcal", "g", "g"];
// 						return number + unit[j];
// 					});
// 			}
// 		});
// }
//
// function plot_graph() {
// 	var graphs = d3.selectAll(".graph");
//
//
// }
