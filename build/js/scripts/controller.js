
// controller
// ////////////////////////////////////

var recipes = [],
	ingredients = [],
	favorites,
	filter;

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
		});

		csv.sort(function(a, b) { return d3.descending(a.group, b.group); });

		// ingredients = d3.nest()
		// 	.key(function(d) { return +d.ingredient_id; })
		// 	.entries(csv);

		ingredients = csv;

		d3.csv("data/recipe_ingredients-list.csv", function(csv) {
			csv.forEach(function(d) {
				d.recipe_id = +d.recipe_id;
				d.ingredient_id = +d.ingredient_id;

				var rec = find_recipe_id(d.recipe_id);
				rec.ingredients.push(d);
			});
		});
	});

	list_menu();
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
			.attr("data-recipe-id", function(d) { return d.recipe_id; });

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


	// UPDATE
	recipe_list
		.classed("exit", false)
		.order()
		.style("-webkit-transform", function(d, i) { return "translate(100%, " + i * lines(2) + "px)"; })
		.classed("favorite", function(d) { return (favorites.hasRecipe(d.recipe_id)); })
		.transition()
			.call(enter_transition);

}


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
		});
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
		top = "-=" + lines(11);
	} else {
		height = lines(12);
		top = "+=" + lines(11);
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













// end
