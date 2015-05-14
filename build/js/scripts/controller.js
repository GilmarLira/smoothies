
// controller
// ////////////////////////////////////

var recipes = [],
	ingredients = [],
	favorites,
	filter,
	nutrients = [];

var dur = 800;


$(document).ready(init);


function init() {
	favorites = new Favorites();

	$(".bar .title").click(list_menu);

	d3.csv("data/recipes-list.csv", function(csv) {
		csv.forEach(function(d) {
			d.recipe_id = +d.recipe_id;
			d.ingredients = [];
		});
		recipes = csv;
	});

	d3.csv("data/ingredients-list.csv", function(csv) {
		csv.forEach(function(d) {
			d.ingredient_id = +d.ingredient_id;
			d.eq = +d.eq;
		});

		csv.sort(function(a, b) { return d3.descending(a.group, b.group); });
		ingredients = csv;

		d3.csv("data/recipe_ingredients-list.csv", function(csv) {
			csv.forEach(function(d) {
				d.recipe_id = +d.recipe_id;
				d.ingredient_id = +d.ingredient_id;

				var rec = find_recipe_id(d.recipe_id);
				rec.ingredients.push(d);
			});
		});

		d3.csv("data/usda-chart.csv", function(csv) {
			// nutrients = csv;

			ingredients.forEach(function(ing) {
				var water = 0,
						calories = 0,
						lipids = 0,
						proteins = 0,
						carbs = 0,
						vit_min = 0,
						summary = [];

				water			= +csv[1][ing.ingredient_id];
				calories	= +csv[2][ing.ingredient_id];
				proteins	= +csv[3][ing.ingredient_id];
				lipids 		= +csv[4][ing.ingredient_id];
				carbs 		= +csv[5][ing.ingredient_id];

				vit_min		+= +csv[9][ing.ingredient_id] / 1000;   // Calcium (mg)
				vit_min		+= +csv[10][ing.ingredient_id] / 1000;  // Iron (mg);
				vit_min		+= +csv[11][ing.ingredient_id] / 1000;  // Magnesium (mg)
				vit_min		+= +csv[12][ing.ingredient_id] / 1000;  // Phosphorus (mg)
				vit_min		+= +csv[13][ing.ingredient_id] / 1000;  // Potassium (mg)
				vit_min		+= +csv[14][ing.ingredient_id] / 1000;  // Sodium (mg)
				vit_min		+= +csv[15][ing.ingredient_id] / 1000;  // Zinc (mg)

				vit_min		+= +csv[17][ing.ingredient_id] / 1000;  // Vitamin C (mg)
				vit_min		+= +csv[26][ing.ingredient_id] / 1000;  // Vitamin E (mg);

				summary.push(water);
				summary.push(calories);
				summary.push(lipids);
				summary.push(carbs);
				summary.push(proteins);
				summary.push(vit_min);

				ing.nutrients = summary;
			});

			recipes.forEach(function(rec) {
				var combined_nutrients = [0, 0, 0, 0, 0, 0];
				// console.log("recipe " + rec.recipe_id);

				rec.ingredients.forEach(function(rec_ing, i) {
					if(rec_ing.ingredient_id) {
						var ing_obj = find_ingredient_id(rec_ing.ingredient_id);
						rec.masses = get_recipe_masses(rec.recipe_id);

						// console.log("    Ingredient " + i + ": " + ing_obj.name);
						var i_mass 		= rec.masses[i];
						combined_nutrients[0] += Math.round(i_mass / 100 * ing_obj.nutrients[0]);
						combined_nutrients[1] += Math.round(i_mass / 100 * ing_obj.nutrients[1]);
						combined_nutrients[2] += Math.round(i_mass / 100 * ing_obj.nutrients[2]);
						combined_nutrients[3] += Math.round(i_mass / 100 * ing_obj.nutrients[3]);
						combined_nutrients[4] += Math.round(i_mass / 100 * ing_obj.nutrients[4]);
						combined_nutrients[5] += Math.round(i_mass / 100 * ing_obj.nutrients[5]);

						// ing_obj.nutrients.forEach(function(n) {
						// 	combined_nutrients[i] += Math.round(i_mass / 100 + n);
						// });
					}
				});
				// console.log(combined_nutrients);
				// console.log("=============================");
				rec.nutrients = combined_nutrients;
			});
		});
	});

	list_menu();
}


function get_recipe_masses(r_id) {
	var rec = find_recipe_id(r_id);
	var mass = [];
	rec.ingredients.forEach(function(d, i) {

		var portions = d.quantity_decimal;
		var portion_mass = find_ingredient_id(d.ingredient_id).eq;
		var ing_mass = portions * portion_mass;

		mass.push(ing_mass);
	});

	return mass;
}





function list_menu() {
	$(".filter-button").remove();

	var menu_data = ["Recipes", "Favorites", "Ingredients", "Plans"];
	var menu = d3.select(".list-view")
		.attr("class", "list-view menu")
		.selectAll(".cell")
		.data(menu_data, function(d) { return d; });


	// MENU EXIT
	menu.exit()
		.classed("enter", false)
		.classed("exit", true)
		.transition()
			// .each("end", function() { d3.select(this).attr("class", "list-view menu"); })
			.call(exit_transition);

	// MENU ENTER
	var menu_enter = menu.enter()
		.append("div")
			.attr("class", "cell enter")
			.style("-webkit-transform", function(d, i) { return "translate(100%, " + i * lines(2) + "px)"; });


	menu_enter
		.append("h2")
			.append("a")
				.attr("class", "label")
				.attr("href", "#")
				.attr("rel", function(d) { return d; })
				.text(function(d) { return d; });

	// MENU UPDATE
	menu_enter
		.classed("exit", false)
		.transition()
			.call(enter_transition);


	$(".menu a").click(function() {
		var rel = this.rel;
		switch (rel) {
			case "Recipes":
				list_recipes(recipes);
				break;
			case "Favorites":
				list_favorites();
				break;
			case "Ingredients":
				list_ingredients();
				break;
		}
	});
}


function list_recipes(list) {
	var recipe_list = d3.select(".list-view")
		.attr("class", "list-view recipes")
		.selectAll(".cell")
		.data(list, function(d) { return d.recipe_id; });

	// EXIT
	recipe_list.exit()
		.classed("enter", false)
		.classed("exit", true)
		.transition()
			.call(exit_transition);

	// ENTER
	var recipe_enter = recipe_list.enter()
		.append("div")
			.attr("class", "cell recipe enter")
			.attr("data-recipe-id", function(d) { return d.recipe_id; })
			.call(scroll_top);

	var recipe_header = recipe_enter
		.append("div")
			.attr("class", "recipe-header");

	recipe_header
		.append("h2")
			.attr("class", "title")
			.text(function(d) { return d.name; })
			.on("click", toggle_recipe);

	recipe_header
		.append("div")
			.attr("class", "controls")
		.append("input")
			.attr("type", "checkbox")
			.attr("class", "favorite-check")
			.property("checked", function(d) { return (favorites.hasRecipe(d.recipe_id)); })
			.on("change", update_favorites);


	var recipe_body = recipe_enter
		.append("div")
			.attr("class", "recipe-body");


	recipe_body
		.append("p")
			.attr("class", "description")
			.text(function(d) { return d.description; });

	recipe_body
		.append("ul")
			.attr("class", "ingredients")
			.call(list_recipe_ingredients);

	var recipe_nutrition = recipe_body
		.append("div")
			.attr("class", "nutrition");

	// recipe_nutrition
	// 		.append("div")
	// 			.attr("class", "base-bar")
	// 			.style("width", function(d) {
	// 				return get_recipe_total_mass(d) + "px";
	// 			});

	recipe_nutrition
		.call(list_recipe_nutrients);



	// UPDATE
	recipe_list
		.classed("exit", false)
		.order()
		.style("-webkit-transform", function(d, i) { return "translate(100%, " + i * lines(2) + "px)"; })
		.classed("favorite", function(d) { return (favorites.hasRecipe(d.recipe_id)); })
		.transition()
			.call(enter_transition);
}


// function list_recipe_nutrients(selection) {
// 	selection
// 		.each(function(d, i) {
//
// 		});
// }


function list_recipe_ingredients(selection) {
	selection
		.each(function(d, i) {
			var ing_enter = d3.select(this).selectAll("li").data(d.ingredients).enter().append("li").attr("class", "ingredient_group"); // todo: get ingredient group

			ing_enter
				.append("span")
				.attr("class", "quantity")
				.text(function(a) { return (a.ingredient_id === 0) ? "" : a.quantity + " "; });

			ing_enter
				.append("span")
				.attr("class", "unit") // todo: get ingredient group
				.text(function(a) {
					var ing_obj = find_ingredient_id(a.ingredient_id);
					return ing_obj.unit + " ";
				});

			ing_enter
				.append("span")
				.attr("class", "name") // todo: get ingredient group
				.text(function(a) {
					var ing_obj = find_ingredient_id(a.ingredient_id);
					return (a.ingredient_id === 0) ? "Add " + ing_obj.name : ing_obj.name;
				});

			ing_enter
				.append("span")
				.attr("class", "nutrients") // todo: get ingredient group
				.text(function(a, i) {
					if(a.ingredient_id) {
						var ing_obj = find_ingredient_id(a.ingredient_id);
						if (ing_obj.nutrients.length) {
							var i_mass 		= d.masses[i];
							var i_water 	= Math.round(i_mass / 100 * ing_obj.nutrients[0]);
							var i_protein = Math.round(i_mass / 100 * ing_obj.nutrients[1]);
							// var i_fat 		= Math.round(i_mass / 100 * ing_obj.nutrients[3]);
							var i_carbs 	= Math.round(i_mass / 100 * ing_obj.nutrients[2]);

							// return " (" + i_mass + "g, " + i_water + "g water, " + i_protein  + "g protein, " + i_carbs + "g carbs)";
						}
					}
				});
		});
}


function list_recipe_nutrients(selection) {
	selection
		.each(function(d, i) {
			var nutrient_label = ["lipids", "carbs", "proteins", "vitamins-and-minerals"];
			var nutrients_subset = d.nutrients.filter(function(x, y) { return y > 1; });
			var bar_graph = d3.select(this).selectAll(".nutrient-bar").data(nutrients_subset);

			var nutrient_enter = bar_graph.enter()
				.append("div")
					.attr("class", function(e, j) { return nutrient_label[j]; })
					.classed("nutrient-bar", true)
					.style("width", function(e) {
						return e/(get_recipe_total_mass(d) - d.nutrients[0]) * 100 + "%";
					});


			var labels = d3.select(this).append("div").classed("graph-labels", true).selectAll(".nutrient-label").data(nutrient_label);

			labels.enter()
				.append("div")
					.attr("class", function(e, j) { return nutrient_label[j]; })
					.classed("nutrient-label", function(e, j) { return (d.nutrients[j+2] > 0); })
					.text(function(e, j) {
						if(d.nutrients[j+2] > 0) {
							return (j<3) ? e : "vitamins & minerals";
						}
					});

		});
}


function get_recipe_total_mass(recipe) {
	var total_mass = 0;

	recipe.masses.forEach(function(d) {
		total_mass += d;
	});

	return total_mass;
}


function list_ingredients() {
	var ingredients_subset = ingredients.filter(function(i) {
		return (i.group != "beverage");
	});

	filter = new Filter();
	$(".list-view").append($("<div class='filter-button'>Choose ingredients</div>"));

	var ingredient_list = d3.select(".list-view")
			.attr("class", "list-view ingredients")
			.selectAll(".cell")
			.data(ingredients_subset, function(d) { return d.ingredient_id; });

	// EXIT
	ingredient_list.exit()
		.classed("enter", false)
		.classed("exit", true)
		.transition()
			.call(exit_transition);

	// ENTER
	var ingredient_list_enter = ingredient_list.enter()
		.append("div")
			.classed("exit", false)
			.attr("class", "cell ingredient enter")
			.attr("data-ingredient-id", function(d) { return d.ingredient_id; })
			.attr("data-ingredient-group", function(d) { return d.group; });

	var ingredient_header = ingredient_list_enter
		.append("div")
			.attr("class", "header");

	ingredient_header
		.append("h2")
			.attr("class", "title")
			.text(function(d) { return d.name; });
			// .on("click", toggle_recipe);

	ingredient_header
		.append("div")
			.attr("class", "controls")
		.append("input")
			.attr("type", "checkbox")
			.attr("class", "ingredient-check")
			.attr("data-ingredient-id", function(d) { return d.ingredient_id; })
			.on("change", toggle_ingredient);

	// UPDATE
	ingredient_list
		.classed("exit", false)
		.order()
		.style("-webkit-transform", function(d, i) { return "translate(100%, " + i * lines(2) + "px)"; })
		.transition()
			.call(enter_transition);
}



function enter_transition(transition) {
	var startTranslateState,
			endTranslateState,
			translateInterpolator;

	transition
		.duration(dur)
		.delay(function(d, i) { return (i+1)/transition.size() * dur; })
		.styleTween("-webkit-transform", function(d, i) {
			startTranslateState = "translate(100%, " + i * lines(2) + "px)";
			endTranslateState = "translate(0%, " + i * lines(2) + "px)";
			translateInterpolator = d3.interpolateString(startTranslateState, endTranslateState);
    	return translateInterpolator;
    })
		.styleTween("-moz-transform", function() {
    	return translateInterpolator;
    })
		.style("opacity", 1);
}


function exit_transition(transition) {
	var startTranslateState,
			endTranslateState,
			translateInterpolator;

	transition
		.duration(dur/2)
		.delay(function(d, i) { return i/transition.size() * dur/2; })
		.styleTween("-webkit-transform", function(d, i) {
			startTranslateState = "translate(0%, " + i * lines(2) + "px)";
			endTranslateState = "translate(-100%, " + i * lines(2) + "px)";
			translateInterpolator = d3.interpolateString(startTranslateState, endTranslateState);
    	return translateInterpolator;
    })
		.styleTween("-moz-transform", function() {
    	return translateInterpolator;
    })
		.style("opacity", 1e-6)
		.remove();
}


function list_favorites() {
	var fav_recipes = [];
	favorites.recipes.forEach(
		function(f) { fav_recipes.push(find_recipe_id(f)); }
	);

	list_recipes(fav_recipes);
}




function toggle_recipe(r, i) {
	var $cel = $(this).parents(".cell");
	var height, top;

	if($cel.is(".selected")) {
		height = lines(2);
		top = "-=" + lines(16);
	} else {
		height = lines(17);
		top = "+=" + lines(16);
	}

	$cel
		.toggleClass("selected")
		.animate({
			height: height
		}, dur/2)
		.nextAll()
			.animate({
				top: top
			}, dur/2);
}



function toggle_ingredient(d) {
	if(this.checked) {
		filter.addIngredient(d.ingredient_id);
	} else {
		filter.removeIngredient(d.ingredient_id);
	}
}



function update_favorites(d) {
	if(this.checked) {
		favorites.addRecipe(d.recipe_id);
	} else {
		favorites.removeRecipe(d.recipe_id);
	}
}


function find_ingredient_id(id) {
	var ing = $.grep(ingredients, function(e) {
		return e.ingredient_id == id;
	});
	return ing[0];
}


function find_recipe_id(id) {
	var fRec = $.grep(recipes, function(e) {
		return e.recipe_id == id;
	});

	return fRec[0];
}


function get_recipe_ingredients(r_id) {
	var rec_ing = [];
	find_recipe_id(r_id).ingredients.forEach(function(ing) {

		if(ing.ingredient_id) { // remove water (ing_id = 0)
			rec_ing.push(ing.ingredient_id);
		}
	});

	return rec_ing;
}


function update_ingredient_list_view() {
	// console.log("update ingredient list view");
	$(".filter-button")
		.text("Found" + filter.recipes.length + " smoothies")
		.on("click", function() {
			list_recipes(filter.recipes);
			$(this).remove();
		});

	// d3.selectAll(".cell")
	// 	.each(function(d, i) {
	// 		d3.select(this)
	// 			.classed("not-combo", function(e, j) {
	// 				return (!filter.hasComboIngredient(e.ingredient_id));
	// 			});
	// 	});
}


function scroll_top() {
	$("body").animate({
		scrollTop: 0
	}, dur);
}













// end
