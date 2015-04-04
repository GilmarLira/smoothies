// View
// ////////////////////////////////////

function list_smoothies() {
	var list_container = d3.select("body").append("div").attr("class", "list-container");

	var recipe_list = list_container.append("div")
		.attr("class", "recipes")
		.selectAll("div")
		.data(smoothies);

	var recipe_enter = recipe_list.enter()
		.append("div")
		.attr("class", function(d) { return "recipe-" + d.id; });

	recipe_enter.append("h2").text(function(d) { return d.name; });
	recipe_enter.append("p").text(function(d) { return d.description; });

	recipe_enter.append("ul")
		.attr("class", "ingredients")
		.each(function(d, i) {
			for(var j = 0; j < d.ingredients.length; j++) {
				var current_ingredient = ingredients[d.ingredients[j]];

				d3.select(this).append("li")
					.attr("class", function(d) { return current_ingredient.group; })
					.text(function(d) { return d.quantities[j] + " " + current_ingredient.unit + " " + current_ingredient.name; });
			}
		});

	recipe_enter.append("div")
		.attr("class", "nutrition")
		.append("svg")
		.attr("class", "graph")
		.each(function(d, i) {
			var graph = d3.select(this);
			for(var j = 0; j < d.total.length; j++) {
			var graph_enter = graph.append("g");
				graph_enter
					.append("circle")
					.attr("r", 50)
					.attr("cy", 75)
					.attr("cx", 50 + j*150);

				graph_enter
					.append("text")
					.attr("y", 90)
					.attr("x", 50 + j*150)
					.text(Math.round(d.total[j] * 100) / 100);
			}
		});


}


function plot_now() {
	plot_nutrition_graph(recipe_enter);
}


function plot_nutrition_graph(selection) {
var nutri_chart = smoothies.map(function(s) {
	return s.nutrients;
});

	var nutrient_enter = selection
		.append("div")
		.attr("class", "nutrition")
		.append("svg")
		.attr("class", "graph");

	nutrient_enter
		.append("g")
		.append("circle")
		.attr("r", 50)
		.attr("cy", 75)
		.attr("cx", function(d, i) { return 50 + i*150; });

	nutrient_enter
		.append("text")
		.attr("y", 80)
		.attr("x", function(d, i) { return 50 + i*150; })
		.text(function(d, i) {

		});
	// var nutrient_enter = nutrient_graph
	// 	.enter()
	//

	// nutrient_enter
	// 	.append("circle")
	// 	.attr("r", 50)
	// 	.attr("cy", 75)
	// 	.attr("cx", function(d, i) { return 50 + i*150; });
	//
	// nutrient_enter
	// 	.append("text")
	// 	.attr("y", 80)
	// 	.attr("x", function(d, i) { return 50 + i*150; })
	// 	.text(function(d) {
	// 		d.getTotal
	// 	});

		// var nutrient_table = selection
		// 	.append("table")
		// 	.attr("class", "nutrition")
		// 	.selectAll("tr")
		// 	.data(recipe.nutrients);
		//
		// var nutrient_table_enter = nutrient_table.enter().append("tr");
		//
		// nutrient_table_enter
		// 	.append("td")
		// 	.text(function(d) { return d.ndbno; });
		//
		// nutrient_table_enter
		// 	.append("td")
		// 	.text(function(d) { return d.calories; });
		//
		// nutrient_table_enter
		// 	.append("td")
		// 	.text(function(d) { return d.protein; });
		//
		// nutrient_table_enter
		// 	.append("td")
		// 	.text(function(d) { return d.fat; });
}
