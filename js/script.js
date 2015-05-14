
// ingredient class
// ////////////////////////////////////

var Ingredient = function() {
	this.id 				= "";
	this.group 			= "";
	this.type 			= "";
	this.name 			= "";
	this.plural 		= "";
	this.unit				= "";
	this.pkg				= "";
	this.price			= "";
	this.price_unit = "";
	this.ndbno			= "";
};

var Smoothie = function(r) {
	this.id = r.recipe_id;
	this.phase = r.phase;
	this.name = r.name;
	this.description = r.description;
	this.ingredients = [];
	// this.quantities = r.quantities,
	this.nutritionalValue = null;

	// var r = get_recipe_by_id(id);
	// this.total = [0, 0, 0];
	// this.valid_ndbno = [];
	//
	// var this_smoothie = this;
	//
	// r.ingredients.forEach(function(id) {
	// 	var ing = get_ingredient_by_id(id);
	// 	if(ing.ndbno) {
	// 		this_smoothie.valid_ndbno.push(ing.ndbno);
	// 	}
	// 	return false;
	// });

	// this.nutrients = [];
};




// Smoothie.prototype.addNutrientSet = function(obj) {
// 	this.nutrients.push(obj);
// 	this.total[0] += +obj.calories;
// 	this.total[1] += +obj.protein;
// 	this.total[2] += +obj.fat;
// };
//
// Smoothie.prototype.addndbno = function(n) {
// 	this.valid_ndbno.push(n);
// };
//
// Smoothie.prototype.getTotal = function() {
// 	var total = [0, 0, 0];
// 	this.valid_ndbno.forEach(function(n) {
// 		var nutri = get_nutrition_sheet(n);
//
// 		total[0] += +nutri.calories;
// 		total[1] += +nutri.protein;
// 		total[2] += +nutri.fat;
// 	});
// 	return total;
// };


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
						proteins = 0,
						carbs = 0,
						vit_min = 0,
						summary = [];

				water			= +csv[1][ing.ingredient_id];
				// calories	= +nutrients[2][ing.ingredient_id];
				proteins	= +csv[3][ing.ingredient_id];
				// lipids 		= +nutrients[4][ing.ingredient_id];
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
				// summary.push(calories);
				summary.push(proteins);
				// summary.push(lipids);
				summary.push(carbs);
				summary.push(vit_min);

				ing.nutrients = summary;
			});

			recipes.forEach(function(rec) {
				var combined_nutrients = [0, 0, 0, 0];
				console.log("recipe " + rec.recipe_id);

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

						// ing_obj.nutrients.forEach(function(n) {
						// 	combined_nutrients[i] += Math.round(i_mass / 100 + n);
						// });
					}
				});
				console.log(combined_nutrients);
				console.log("=============================");
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

	recipe_nutrition
			.append("div")
				.attr("class", "base-bar")
				.style("width", function(d) {
					return get_recipe_total_mass(d) + "px";
				});

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

							return " (" + i_mass + "g, " + i_water + "g water, " + i_protein  + "g protein, " + i_carbs + "g carbs)";
						}
					}
				});
		});
}


function list_recipe_nutrients(selection) {
	selection
		.each(function(d, i) {
			var bar_graph = d3.select(this).selectAll(".nutrient-bar").data(d.nutrients);
			var nutrient_label = ["water", "proteins", "carbs", "vitamins-and-minerals"];

			var nutrient_enter = bar_graph.enter()
				.append("div")
					.classed("nutrient", true);
					// .style("width", function(d) { return d + "px"; });

			// nutrient_enter
			// 	.append("div")
			// 		.attr("class", "nutrient-bar")
			// 		.style("width", get_recipe_total_mass(d) + "px");


			nutrient_enter
				.append("div")
					.attr("class", function(d, i) { return nutrient_label[i]; })
					.classed("nutrient-bar", true)
					.style("width", function(d) { return d + "px"; });

			nutrient_enter
				.append("div")
					.attr("class", "nutrient-label")
					.text(function(d, i) { return d +  " " + nutrient_label[i]; });

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
	console.log("update ingredient list view");
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

// var recipes = [
// 	{
// 		id: 1,
// 		phase: 1,
// 		name: "Toxin Cleansing Blast",
// 		description: "Flush toxins from your body with this delicious, fruity concoction.",
// 		ingredients: [ 4, 24, 9, 7, 25, 0 ],
// 		quantities: [ 2, 1, 1, 1, 1, "Add" ]
// 	},
// 	{
// 		id: 2,
// 		phase: 1,
// 		name: "Vita-Berry Blast",
// 		description: "Ward off cancer, heart disease, and viruses with this sweet and tasty blast of flavonoids!",
// 		ingredients: [ 4, 11, 9, 29, 0 ],
// 		quantities: [ 2, 1, 1, "1/2", "Add" ]
// 	},
// 	{
// 		id: 3,
// 		phase: 1,
// 		name: "The Immune Booster",
// 		description: "Keep healthy even during flu season with this delicious elixir packed with antioxidant goodness.",
// 		ingredients: [ 5, 9, 21, 25, 11, 0 ],
// 		quantities: [ 2, 1, 1, 1, "1/2", "Add" ]
// 	},
// 	{
// 		id: 4,
// 		phase: 1,
// 		name: "Morning Glory",
// 		description: "Start your day with boundless energy with this flavorful blend.",
// 		ingredients: [ 4, 8, 29, 19, 40, 0 ],
// 		quantities: [ 2, 1, 1, 1, "1/4", "Add" ]
// 	},
// 	{
// 		id: 5,
// 		phase: 1,
// 		name: "Nutty Nectar",
// 		description: "Go nuts with this vitamin rich blast of flavor.",
// 		ingredients: [ 4, 9, 29, 17, 33, 0 ],
// 		quantities: [ 2, 1, 1, 1, "1/8", "Add" ]
// 	},
// 	{
// 		id: 6,
// 		phase: 1,
// 		name: "Tropical Tonic",
// 		description: "Boost your immune system with this vitamin C rich drink.",
// 		ingredients: [ 5, 8, 42, 19, 22, 37, 0 ],
// 		quantities: [ 2, 1, "Juice of 1/2", 1, 1, "1/4", "Add" ]
// 	},
// 	{
// 		id: 7,
// 		phase: 1,
// 		name: "Protein Powerhouse",
// 		description: "Packed full of protein, this super satisfying blend keeps you energized for hours.",
// 		ingredients: [ 5, 8, 27, 21, 19, 32, 0 ],
// 		quantities: [ 2, 1, 1, 1, 1, "1/8", "Add" ]
// 	},
// 	{
// 		id: 8,
// 		phase: 1,
// 		name: "Peachy Pick-me-up",
// 		description: "Healthy fats and flavor abound in this tasty treat.",
// 		ingredients: [ 5, 9, 23, 17, 10, 0 ],
// 		quantities: [ 2, 1, 1, 1, 1, "Add" ]
// 	},
// 	{
// 		id: 9,
// 		phase: 2,
// 		name: "Energy Elixir",
// 		description: "Add some serious pep to your step with this delicious, energizing elixir. A perfect afternoon pick me up.",
// 		ingredients: [ 5, 9, 28, 24, 33, 0 ],
// 		quantities: [ 2, 1, 1, 1, "1/8", "Add" ]
// 	},
// 	{
// 		id: 10,
// 		phase: 2,
// 		name: "Fountain of Youth",
// 		description: "Look and feel years younger by enjoying this age-reversing blend.",
// 		ingredients: [ 4, 9, 28, 29, 31, 43, 0 ],
// 		quantities: [ 2, 1, 1, 1, "1/8", 1, "Add" ]
// 	},
// 	{
// 		id: 11,
// 		phase: 2,
// 		name: "Longevity Elixir",
// 		description: "Feel the years disappear with this light and snappy blend.",
// 		ingredients: [ 3, 8, 44, 12, 32, 45, 0 ],
// 		quantities: [ 2, 1, 1, 1, "1/4",, 1, "Add" ]
// 	},
// 	{
// 		id: 12,
// 		phase: 2,
// 		name: "Get Up and Goji",
// 		description: "Power up with this antioxidant-rich flavor extravaganza.",
// 		ingredients: [ 46, 17, 12, 30, 9, 40, 0 ],
// 		quantities: [ 2, 1, 1, 1,, 1, "1/8", "Add" ]
// 	},
// 	{
// 		id: 13,
// 		phase: 2,
// 		name: "Nature’s Candy",
// 		description: "Balance hormones by way of this fantastic tasting treat.",
// 		ingredients: [ 46, 24, 7, 11, 9, 43, 0 ],
// 		quantities: [ 2, 1, 1, 1, 1, 1, "Add" ]
// 	},
// 	{
// 		id: 14,
// 		phase: 2,
// 		name: "Antioxidant Fusion",
// 		description: "Fight off free radicals and add years with this tasty blast.",
// 		ingredients: [ 46, 9, 21, 25, 19, 31, 0 ],
// 		quantities: [ 2, 1, 1, 1, 1, "1/4", "Add" ]
// 	},
// 	{
// 		id: 15,
// 		phase: 3,
// 		name: "Life Boost Blast",
// 		description: "Start your day with a blast of calcium and magnesium. No supplement ever tasted this good.",
// 		ingredients: [ 2, 23, 9, 29, 35, 40, 0 ],
// 		quantities: [ "1-2", 1, 1, "1/2", "1/8", "1/8", "Add" ]
// 	},
// 	{
// 		id: 16,
// 		phase: 3,
// 		name: "Digestive Health Elixir",
// 		description: "Rich with enzymes, this pineapple blend helps to get your digestive system running smoothly.",
// 		ingredients: [ 6, 9, 25, 7, 11, 40, 0 ],
// 		quantities: [ "1-2", 1, 1, 1, 1, "1/4 of soaked", "Add" ]
// 	},
// 	{
// 		id: 17,
// 		phase: 3,
// 		name: "Liver and Colon Tonic",
// 		description: "Detox away with this tasty treat.",
// 		ingredients: [ 1, 9, 25, 28, 36, 0 ],
// 		quantities: [ "1-2", 1, 1, 1, "1/4", "Add" ]
// 	},
// 	{
// 		id: 18,
// 		phase: 3,
// 		name: "Banana Berry Vitality Blend",
// 		description: "Grab a quick energy boost with our Banana Berry Blend!",
// 		ingredients: [ 2, 9, 14, 7, 11, 33, 41, 0 ],
// 		quantities: [ 2, 1, 2, 1, "1/2", "1/8", "1/4", "Add" ]
// 	},
// 	{
// 		id: 19,
// 		phase: 3,
// 		name: "Kaleacado Blast",
// 		description: "Unleash your libido with a luscious Kaleacado Blast!",
// 		ingredients: [ 2, 8, 30, 28, 43, 29, 0 ],
// 		quantities: [ 2, 1, 1, "", 1, "1/4", "Add" ]
// 	},
// 	{
// 		id: 20,
// 		phase: 3,
// 		name: "Melon Blast",
// 		description: "Maximize your fiber and melt away pounds with a mouthwatering Melon Blast!",
// 		ingredients: [ 2, 9, 15, 12, 29, 32, 0 ],
// 		quantities: [ 2, 1, 1, 1, "1/2", "1/8", "Add" ]
// 	},
// 	{
// 		id: 21,
// 		phase: 3,
// 		name: "Power Booster",
// 		description: "Pick up your pace with a delicious, nutritious Power Booster.",
// 		ingredients: [ 6, 9, 20, 11, 40, 0 ],
// 		quantities: [ 2, 1, 1, 1, "1/4", "Add" ]
// 	},
// 	{
// 		id: 22,
// 		phase: 3,
// 		name: "Swiss Mix",
// 		description: "Mix it up with this flavor-packed, nutrient-rich blend.",
// 		ingredients: [ 6, 9, 26, 15, 37, 0 ],
// 		quantities: [ 2, 1, 1, 1, "1/8", "Add" ]
// 	},
// 	{
// 		id: 23,
// 		phase: 3,
// 		name: "Free Radical Fighter",
// 		description: "Give free radicals a knock-out punch with a tasty Free Radical Fighter!",
// 		ingredients: [ 6, 8, 30, 10, 14, 11, 35, 0 ],
// 		quantities: [ 2, 1, 1, 1, 1, "1/2", "1/8", "Add" ]
// 	},
// ];
//
//
//
// // Conventions
// // 1 handful = 1/2 cup
//
// var itest = [
// 	{
// 		id: 4,
// 		group: "greens",
// 		type: "green",
// 		name: "spinach",
// 		plural: "spinach",
// 		unit: "handfuls",
// 		pkg: "bunch",
// 		price: 2.00,
// 		price_unit: "bunch",
// 		ndbno: "11457",
// 		eq: 15
// 	},
// 	{
// 		id: 9,
// 		group: "fruits",
// 		type: "fruit",
// 		name: "banana",
// 		plural: "bananas",
// 		unit: "",
// 		pkg: "bunch",
// 		price: 2.00,
// 		price_unit: "lb",
// 		ndbno: "09040"
// 	}
// ];
//
// var ingredients = [
// 	{
// 		id: 0,
// 		group: "beverage",
// 		type: "water",
// 		name: "water",
// 		plural: "water",
// 		unit: "",
// 		pkg: "",
// 		price: 0.00,
// 		price_unit: "",
// 		ndbno: null
// 	},
// 	{
// 		id: 1,
// 		group: "greens",
// 		type: "green",
// 		name: "collard greens",
// 		plural: "collard greens",
// 		unit: "handfuls",
// 		pkg: "bunch",
// 		price: 4.00,
// 		price_unit: "bunch",
// 		ndbno: "11161",
// 		eq: 15
// 	},
// 	{
// 		id: 2,
// 		group: "greens",
// 		type: "green",
// 		name: "kale",
// 		plural: "kale",
// 		unit: "handfuls",
// 		pkg: "bunch",
// 		price: 4.00,
// 		price_unit: "bunch",
// 		ndbno: "11233",
// 		eq: 15
// 	},
// 	{
// 		id: 3,
// 		group: "greens",
// 		type: "green",
// 		name: "romaine lettuce",
// 		plural: "romaine lettuce",
// 		unit: "handfuls",
// 		pkg: "bunch",
// 		price: 3.00,
// 		price_unit: "bunch",
// 		ndbno: "11251",
// 		eq: 15
// 	},
// 	{
// 		id: 4,
// 		group: "greens",
// 		type: "green",
// 		name: "spinach",
// 		plural: "spinach",
// 		unit: "handfuls",
// 		pkg: "bunch",
// 		price: 2.00,
// 		price_unit: "bunch",
// 		ndbno: "11457",
// 		eq: 15
// 	},
// 	{
// 		id: 5,
// 		group: "greens",
// 		type: "green",
// 		name: "spring greens",
// 		plural: "spring greens",
// 		unit: "handfuls",
// 		pkg: "pkg",
// 		price: 2.00,
// 		price_unit: "lb",
// 		ndbno: "11457", //same as spinach
// 		eq: 15
// 	},
// 	{
// 		id: 6,
// 		group: "greens",
// 		type: "green",
// 		name: "Swiss chard",
// 		plural: "Swiss chard",
// 		unit: "handfuls",
// 		pkg: "bunch",
// 		price: 5.00,
// 		price_unit: "bunch",
// 		ndbno: "11147",
// 		eq: 15
// 	},
// 	{
// 		id: 7,
// 		group: "fruits",
// 		type: "fruit",
// 		name: "apple",
// 		plural: "apples",
// 		unit: "",
// 		pkg: "unit",
// 		price: 2.00,
// 		price_unit: "lb",
// 		ndbno: "09003",
// 		eq: 182
// 	},
// 	{
// 		id: 8,
// 		group: "fruits",
// 		type: "fruit",
// 		name: "avocado",
// 		plural: "avocados",
// 		unit: "",
// 		pkg: "unit",
// 		price: 2.00,
// 		price_unit: "lb",
// 		ndbno: "09038"
// 	},
// 	{
// 		id: 9,
// 		group: "fruits",
// 		type: "fruit",
// 		name: "banana",
// 		plural: "bananas",
// 		unit: "",
// 		pkg: "bunch",
// 		price: 2.00,
// 		price_unit: "lb",
// 		ndbno: "09040"
// 	},
// 	{
// 		id: 10,
// 		group: "fruits",
// 		type: "fruit",
// 		name: "blackberry",
// 		plural: "blackberries",
// 		unit: "cup",
// 		pkg: "pkg",
// 		price: 5.00,
// 		price_unit: "pkg",
// 		ndbno: "09042"
// 	},
// 	{
// 		id: 11,
// 		group: "fruits",
// 		type: "fruit",
// 		name: "blueberry",
// 		plural: "blueberries",
// 		unit: "cup",
// 		pkg: "pkg",
// 		price: 5.00,
// 		price_unit: "pkg",
// 		ndbno: "09050"
// 	},
// 	{
// 		id: 12,
// 		group: "fruits",
// 		type: "fruit",
// 		name: "cantaloupe",
// 		plural: "cantaloupes",
// 		unit: "cup",
// 		pkg: "unit",
// 		price: 3.00,
// 		price_unit: "lb",
// 		ndbno: "09181"
// 	},
// 	{
// 		id: 13,
// 		group: "fruits",
// 		type: "fruit",
// 		name: "cranberry",
// 		plural: "cranberries",
// 		unit: "cup",
// 		pkg: "pkg",
// 		price: 5.00,
// 		price_unit: "pkg",
// 		ndbno: "09078"
// 	},
// 	{
// 		id: 14,
// 		group: "fruits",
// 		type: "fruit",
// 		name: "fig",
// 		plural: "figs",
// 		unit: "cup",
// 		pkg: "pkg",
// 		price: 5.00,
// 		price_unit: "pkg",
// 		ndbno: "09089"
// 	},
// 	{
// 		id: 15,
// 		group: "fruits",
// 		type: "fruit",
// 		name: "green grapes",
// 		plural: "green grapes",
// 		unit: "cup",
// 		pkg: "pkg",
// 		price: 5.00,
// 		price_unit: "pkg",
// 		ndbno: "09132"
// 	},
// 	{
// 		id: 16,
// 		group: "fruits",
// 		type: "fruit",
// 		name: "guava",
// 		plural: "guavas",
// 		unit: "",
// 		pkg: "unit",
// 		price: 4.00,
// 		price_unit: "lb",
// 		ndbno: "09139"
// 	},
// 	{
// 		id: 17,
// 		group: "fruits",
// 		type: "fruit",
// 		name: "honeydew",
// 		plural: "honeydews",
// 		unit: "cup",
// 		pkg: "unit",
// 		price: 3.00,
// 		price_unit: "lb",
// 		ndbno: "09184"
// 	},
// 	{
// 		id: 18,
// 		group: "fruits",
// 		type: "fruit",
// 		name: "kiwi",
// 		plural: "kiwis",
// 		unit: "",
// 		pkg: "unit",
// 		price: 1.00,
// 		price_unit: "each",
// 		ndbno: "09148"
// 	},
// 	{
// 		id: 19,
// 		group: "fruits",
// 		type: "fruit",
// 		name: "mango",
// 		plural: "mangos",
// 		unit: "cup",
// 		pkg: "unit",
// 		price: 4.00,
// 		price_unit: "pkg",
// 		ndbno: "09176"
// 	},
// 	{
// 		id: 20,
// 		group: "fruits",
// 		type: "fruit",
// 		name: "nectarine",
// 		plural: "nectarines",
// 		unit: "",
// 		pkg: "unit",
// 		price: 3.00,
// 		price_unit: "lb",
// 		ndbno: "09191"
// 	},
// 	{
// 		id: 21,
// 		group: "fruits",
// 		type: "fruit",
// 		name: "orange",
// 		plural: "oranges",
// 		unit: "",
// 		pkg: "unit",
// 		price: 2.00,
// 		price_unit: "lb",
// 		ndbno: "09201"
// 	},
// 	{
// 		id: 22,
// 		group: "fruits",
// 		type: "fruit",
// 		name: "papaya",
// 		plural: "papayas",
// 		unit: "cup",
// 		pkg: "unit",
// 		price: 3.00,
// 		price_unit: "lb",
// 		ndbno: "09226"
// 	},
// 	{
// 		id: 23,
// 		group: "fruits",
// 		type: "fruit",
// 		name: "peach",
// 		plural: "peaches",
// 		unit: "",
// 		pkg: "unit",
// 		price: 3.00,
// 		price_unit: "lb",
// 		ndbno: "09236"
// 	},
// 	{
// 		id: 24,
// 		group: "fruits",
// 		type: "fruit",
// 		name: "pear",
// 		plural: "pears",
// 		unit: "",
// 		pkg: "unit",
// 		price: 2.00,
// 		price_unit: "lb",
// 		ndbno: "09252"
// 	},
// 	{
// 		id: 25,
// 		group: "fruits",
// 		type: "fruit",
// 		name: "pineapple",
// 		plural: "pineapples",
// 		unit: "cup",
// 		pkg: "unit",
// 		price: 4.00,
// 		price_unit: "lb",
// 		ndbno: "09266"
// 	},
// 	{
// 		id: 26,
// 		group: "fruits",
// 		type: "fruit",
// 		name: "plum",
// 		plural: "plums",
// 		unit: "",
// 		pkg: "unit",
// 		price: 3.00,
// 		price_unit: "lb",
// 		ndbno: "09279"
// 	},
// 	{
// 		id: 27,
// 		group: "fruits",
// 		type: "fruit",
// 		name: "raspberry",
// 		plural: "raspberries",
// 		unit: "cup",
// 		pkg: "pkg",
// 		price: 5.00,
// 		price_unit: "pkg",
// 		ndbno: "09302"
// 	},
// 	{
// 		id: 28,
// 		group: "fruits",
// 		type: "fruit",
// 		name: "red grapes",
// 		plural: "red grapes",
// 		unit: "cup",
// 		pkg: "pkg",
// 		price: 5.00,
// 		price_unit: "pkg",
// 		ndbno: "09132"
// 	},
// 	{
// 		id: 29,
// 		group: "fruits",
// 		type: "fruit",
// 		name: "strawberry",
// 		plural: "strawberries",
// 		unit: "cup",
// 		pkg: "pkg",
// 		price: 5.00,
// 		price_unit: "pkg",
// 		ndbno: "09316"
// 	},
// 	{
// 		id: 30,
// 		group: "fruits",
// 		type: "fruit",
// 		name: "watermelon",
// 		plural: "watermelons",
// 		unit: "cup",
// 		pkg: "unit",
// 		price: 4.00,
// 		price_unit: "lb",
// 		ndbno: "09326"
// 	},
// 	{
// 		id: 31,
// 		group: "boosts",
// 		type: "nuts",
// 		name: "almond",
// 		plural: "almonds",
// 		unit: "cup",
// 		pkg: "pkg",
// 		price: 8.00,
// 		price_unit: "pkg",
// 		ndbno: "12061"
// 	},
// 	{
// 		id: 32,
// 		group: "boosts",
// 		type: "nuts",
// 		name: "cashew",
// 		plural: "cashews",
// 		unit: "cup",
// 		pkg: "pkg",
// 		price: 8.00,
// 		price_unit: "pkg",
// 		ndbno: "12087"
// 	},
// 	{
// 		id: 33,
// 		group: "boosts",
// 		type: "nuts",
// 		name: "walnut",
// 		plural: "walnuts",
// 		unit: "cup",
// 		pkg: "pkg",
// 		price: 8.00,
// 		price_unit: "pkg",
// 		ndbno: "12155"
// 	},
// 	{
// 		id: 34,
// 		group: "boosts",
// 		type: "seeds",
// 		name: "chia seeds",
// 		plural: "chia seeds",
// 		unit: "cup",
// 		pkg: "pkg",
// 		price: 10.00,
// 		price_unit: "pkg",
// 		ndbno: "12006"
// 	},
// 	{
// 		id: 35,
// 		group: "boosts",
// 		type: "seeds",
// 		name: "flax seeds",
// 		plural: "flax seeds",
// 		unit: "cup",
// 		pkg: "pkg",
// 		price: 8.00,
// 		price_unit: "pkg",
// 		ndbno: "12220"
// 	},
// 	{
// 		id: 36,
// 		group: "boosts",
// 		type: "seeds",
// 		name: "hemp seeds",
// 		plural: "hemp seeds",
// 		unit: "cup",
// 		pkg: "pkg",
// 		price: 8.00,
// 		price_unit: "pkg",
// 		ndbno: null
// 	},
// 	{
// 		id: 37,
// 		group: "boosts",
// 		type: "seeds",
// 		name: "pumpkin seeds",
// 		plural: "pumpkin seeds",
// 		unit: "cup",
// 		pkg: "pkg",
// 		price: 8.00,
// 		price_unit: "pkg",
// 		ndbno: "12014"
// 	},
// 	{
// 		id: 38,
// 		group: "boosts",
// 		type: "seeds",
// 		name: "sesame seeds",
// 		plural: "sesame seeds",
// 		unit: "cup",
// 		pkg: "pkg",
// 		price: 8.00,
// 		price_unit: "pkg",
// 		ndbno: "12023"
// 	},
// 	{
// 		id: 39,
// 		group: "boosts",
// 		type: "seeds",
// 		name: "sunflower seeds",
// 		plural: "sunflower seeds",
// 		unit: "cup",
// 		pkg: "pkg",
// 		price: 8.00,
// 		price_unit: "pkg",
// 		ndbno: "12036"
// 	},
// 	{
// 		id: 40,
// 		group: "boosts",
// 		type: "supers",
// 		name: "goji berry",
// 		plural: "goji berries",
// 		unit: "cup",
// 		pkg: "pkg",
// 		price: 8.00,
// 		price_unit: "pkg",
// 		ndbno: null
// 	},
// 	{
// 		id: 41,
// 		group: "boosts",
// 		type: "supers",
// 		name: "açaí berry",
// 		plural: "açaí berries",
// 		unit: "cup",
// 		pkg: "pkg",
// 		price: 8.00,
// 		price_unit: "pkg",
// 		ndbno: null
// 	},
// 	{
// 		id: 42,
// 		group: "beverage",
// 		type: "juice",
// 		name: "lemon",
// 		plural: "lemon",
// 		unit: "",
// 		pkg: "unit",
// 		price: 0.75,
// 		price_unit: "each",
// 		ndbno: "09152"
// 	},
// 	{
// 		id: 43,
// 		group: "boosts",
// 		type: "root",
// 		name: "maca powder",
// 		plural: "maca powder",
// 		unit: "tsp",
// 		pkg: "pkg",
// 		price: 10.00,
// 		price_unit: "pkg",
// 		ndbno: null
// 	},
// 	{
// 		id: 44,
// 		group: "greens",
// 		type: "green",
// 		name: "cucumber",
// 		plural: "cucumbers",
// 		unit: "",
// 		pkg: "unit",
// 		price: 1.00,
// 		price_unit: "each",
// 		ndbno: "11206"
// 	},
// 	{
// 		id: 45,
// 		group: "greens",
// 		type: "green",
// 		name: "mint",
// 		plural: "mint",
// 		unit: "leaf",
// 		pkg: "bunch",
// 		price: 2.00,
// 		price_unit: "bunch",
// 		ndbno: "02064"
// 	},
// 	{
// 		id: 46,
// 		group: "greens",
// 		type: "green",
// 		name: "butterhead lettuce",
// 		plural: "butterhead lettuce",
// 		unit: "cup",
// 		pkg: "unit",
// 		price: 2.00,
// 		price_unit: "each",
// 		ndbno: "11250"
// 	}
//
// ];


// favorites class
// ////////////////////////////////////

var Favorites = function() {
	this.recipes = [];
};

Favorites.prototype.getRecipes = function() {
	return this.recipes;
};

Favorites.prototype.addRecipe = function(id) {
	this.recipes.push(id);
};

Favorites.prototype.removeRecipe = function(id) {
	this.recipes.splice(this.getRecipeIndex(id), 1);
};

Favorites.prototype.getRecipeIndex = function(id) {
	return $.inArray(id, this.recipes);
};

Favorites.prototype.hasRecipe = function(id) {
	return (this.getRecipeIndex(id) == -1) ? false : true;
};


///End


// controller
// ////////////////////////////////////

var Filter = function() {
	this.ingredients = [];
	this.combo_ingredients = [];
	this.recipes = [];
};

Filter.prototype.addIngredient = function(ing_id) {
	// ing_id = +ing_id;
	if(!this.hasIngredient(ing_id)) {
		this.ingredients.push(ing_id);
		this.filterRecipes();
		return true;
	}
	return false;
};

Filter.prototype.removeIngredient = function(ing_id) {
	ing_id = +ing_id;
	if(this.hasIngredient(ing_id)) {
		this.ingredients.splice(this.getIngredientIndex(ing_id), 1);
		this.filterRecipes();
		return true;
	}
	return false;
};

Filter.prototype.getIngredientIndex = function(ing_id) {
	return $.inArray(ing_id, this.ingredients);
};

Filter.prototype.hasIngredient = function(ing_id) {
	return (this.getIngredientIndex(ing_id) == -1) ? false : true;
};


Filter.prototype.addComboIngredient = function(ing_id) {
	ing_id = +ing_id;
	if(!this.hasComboIngredient(ing_id)) {
		this.combo_ingredients.push(ing_id);
		return true;
	}
	return false;
};

Filter.prototype.getComboIngredientIndex = function(ing_id) {
	return $.inArray(ing_id, this.combo_ingredients);
};

Filter.prototype.hasComboIngredient = function(ing_id) {
	return (this.getComboIngredientIndex(ing_id) == -1) ? false : true;
};


Filter.prototype.getRecipeIndex = function(rec_id) {
	return $.inArray(rec_id, this.recipes);
};

Filter.prototype.hasRecipe = function(rec_id) {
	return (this.getRecipeIndex(rec_id) == -1) ? false : true;
};

Filter.prototype.addRecipe = function(rec_id) {
	if(!this.hasRecipe(rec_id)) {
		this.recipes.push(rec_id);
		return true;
	}
	return false;
};


Filter.prototype.filterRecipes = function() {
	var that = this;

	if(this.ingredients.length > 0) {
		this.ingredients.forEach(function(ing_id) {
			var recs = recipes.filter(function(r) {
				var rec_ing = get_recipe_ingredients(r.recipe_id);
				var ing_index = $.inArray(ing_id, rec_ing);

				if(ing_index != -1) {
					rec_ing.forEach(function(ri) {
						// if(ri != ing_id) {
							that.addComboIngredient(ri);
						// }
					});
					return true;
				}
				return false;
			});

			that.recipes = (that.ingredients.length > 1) ? get_intersection(that.recipes, recs) : recs;
		});
	} else {
		this.recipes = [];
	}

	update_ingredient_list_view();
	// Update ingredient list view

};









// end


// model
// ////////////////////////////////////

var line_height;

function lines(n) {
	if(!line_height) { line_height = parseInt($("body").css("line-height")); }
	return n * line_height;
}


function get_intersection(arr1, arr2) {
	var filter = arr1.filter(function(n) {
		return (arr2.indexOf(n) != -1);
	});

	return filter;
}




//
// var smoothies = [];
// var nutrients = [];
// var count = ingredients.length;
// var lastn = ingredients[ingredients.length-1].ndbno;
//
//
// function get_recipe_by_id(id) {
// 	var r = $.grep(recipes, function(e) {
// 		return e.id == id;
// 	});
// 	return r[0];
// }
//
// function get_ingredient_by_id(id) {
// 	var i = $.grep(ingredients, function(ing) {
// 		return ing.id == id;
// 	});
// 	return i[0];
// }
//
// smoothies = recipes.map(function(r) { return new Smoothie(r.id); });
//
// nutrients = ingredients.map(function(obj) {
// 	var rObj = {};
// 	var ndbno = obj.ndbno;
//
// 	rObj.id = obj.id;
// 	rObj.ndbno = ndbno;
//
// 	if(ndbno) {
// 		food_report(ndbno, add_nutrients);
// 	}
//
// 	return rObj;
// });
//
//
// function add_nutrients(ndbno, data) {
// 	if(data && ndbno) {
// 		var result = $.grep(nutrients, function(e) {
// 			return e.ndbno == ndbno;
// 		});
//
// 		result[0].nutrients = data;
//
// 		if(ndbno == lastn) {
// 			get_totals();
// 		}
// 	}
// }
//
//
// function get_totals() {
// 	smoothies.forEach(function(e) {
// 		e.valid_ndbno.forEach(function(n) {
// 			if(n) {
// 				var nutri = get_nutrition_sheet(n);
//
// 				e.total[0] += +nutri.calories;
// 				e.total[1] += +nutri.protein;
// 				e.total[2] += +nutri.fat;
// 			}
// 		});
// 	});
//
// 	list_smoothies();
// }
//
//
// function get_nutrition_sheet(ndbno) {
// 	var result = $.grep(nutrients, function(e) { return e.ndbno == ndbno; });
// 	return result[0].nutrients;
// }
//
//
// function food_report(ndbno, callback) {
// 	return $.ajax({
// 		url: "http://api.nal.usda.gov/usda/ndb/reports/",
// 		data: { ndbno: ndbno, api_key: "LL9FvzzSpBk7k74fKERh4bvUMj7NlbZIrqMWqCCh" }
// 	})
// 	.done(function(r) {
// 		var data = r.report.food.nutrients;
// 		var rObj = {};
//
// 		rObj.calories = +data[1].value;
// 		rObj.protein = +data[3].value;
// 		rObj.fat = +data[4].value;
//
// 		callback(ndbno, rObj);
// 	});
// }

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
