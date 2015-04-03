// View
// ////////////////////////////////////

var list_container = d3.select("body").append("div").attr("class", "list-container");

var recipe_list = list_container.append("div")
	.attr("class", "recipes")
	.selectAll("div")
	.data(recipes);

var recipe_enter = recipe_list.enter()
	.append("div")
	.attr("class", function(d) { return "recipe-" + d.id; })
	.call(function(d, i) {
		var asmoothie = new Smoothie(d.id);
		smoothies.push(asmoothie);
		console.log("smoothie " + i + " added");
	});

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

			if(current_ingredient.ndbno) {
				// var nutrition_sheet = get_nutrition_sheet(current_ingredient.ndbno);

				// console.log("current smoothie index is: " + i);
				// console.log(smoothies[i]);

				smoothies[i].addndbno(current_ingredient.ndbno);
				// smoothies[i].addNutrientSet(nutrition_sheet);

				// recipe.valid_ndbno.push(current_ingredient.ndbno);
				// recipe.nutrients.push(nutrition_sheet);

				// recipe.total[0] += +recipe.nutrients.calories;
				// recipe.total[1] += +recipe.nutrients.protein;
				// recipe.total[2] += +recipe.nutrients.fat;
			}

			if(j == d.ingredients.length - 1) {
				// console.log("ready to plot");
				// recipe_enter.call(plot_nutrition_graph);
			}
		}
	});

function plot_now() {
	plot_nutrition_graph(recipe_enter);
}


function plot_nutrition_graph(selection) {
	var nutrient_graph = selection
		.append("div")
		.attr("class", "nutrition")
		.append("svg")
		.attr("class", "graph")
		.selectAll("circle")
		.data(function(d, i) { return smoothies[i].getTotal; });

	var nutrient_enter = nutrient_graph
		.enter()
		.append("g");

	nutrient_enter
		.append("circle")
		.attr("r", 50)
		.attr("cy", 75)
		.attr("cx", function(d, i) { return 50 + i*150; });

	nutrient_enter
		.append("text")
		.attr("y", 80)
		.attr("x", function(d, i) { return 50 + i*150; })
		.text(function(d) { return d; });

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
