
// controller
// ////////////////////////////////////

var recipes,
	ingredients,
	recipe_ingredients,
	favorites = ["1", "2", "4"];

var dur = 600;


$(document).ready(init);


function init() {
	$(".bar .title").click(function() {
		list_menu();
	});

	d3.csv("js/recipes.csv", function(csv) { recipes = csv; });
	d3.csv("js/ingredients.csv", function(csv) {
		ingredients = d3.nest()
			.key(function(d) { return d.ingredient_id; })
			.entries(csv);

		d3.csv("js/recipe_ingredients.csv", function(csv) {
			recipe_ingredients = d3.nest()
				.key(function(d) { return d.recipe_id; })
				.entries(csv);
		});
	});

	list_menu();
}


function list_menu() {
	var menu_data = ["Recipes", "Favorites", "Plans", "Ingredients"];
	var menu = d3.select(".list-view")
		.attr("class", "list-view menu")
		.selectAll("div")
		.data(menu_data, function(d) { return d; });

	var menu_enter = menu.enter()
		.append("div")
			.attr("class", "cell")
			.style("top", function(d, i) { return i * 4 + "rem"; })
			.classed("enter", true);

	menu_enter
		.append("h2")
			.append("a")
				.attr("class", "label")
				.attr("href", "#")
				.attr("rel", function(d) { return d; })
				.text(function(d) { return d; });

	menu_enter.transition().call(enter_transition);

	menu.exit()
		.attr("class", "cell exit")
		.transition()
		.call(exit_transition);


	$(".menu a").click(function() {
		var rel = this.rel;
		switch (rel) {
			case "Recipes":
				list_recipes(recipes);
				break;
			case "Favorites":
				list_favorites();
				break;
		}
	});
}


function list_recipes(list) {
	var recipes_list = d3.select(".list-view")
		.attr("class", "list-view recipes")
		.selectAll("div")
		.data(list, function(d) { return d.recipe_id; });

	// EXIT
	recipes_list.exit()
		.transition()
			.call(exit_transition);

	// ENTER
	container_enter = recipes_list.enter()
		.append("div")
			.attr("class", "cell recipe enter")
			.style("top", function(d, i) { return i * 4 + "rem"; });


	container_enter
		.append("h2")
			.attr("class", "title")
			.text(function(d) { return d.name; })
			.on("click", function() {
				$(this).parents(".recipe").toggleClass("selected");
			});

	container_enter
		.append("p")
			.attr("class", "description")
			.text(function(d) { return d.description; });

	container_enter
		.append("ul")
			.attr("class", "ingredients")
			.call(list_ingredients);

	container_enter
		.append("div")
			.attr("class", "controls")
		.append("input")
			.attr("type", "checkbox")
			.attr("class", "favorite")
			.on("change", function(d) {
				var checked = this.checked;
				if(checked) { favorites.push(d.recipe_id); }
			});

	// UPDATE
	recipes_list
		.transition()
			.call(enter_transition);

}


function list_ingredients() {
	var ing = this.data(recipe_ingredients);

	ing.each(function(d, i) {
		var ing_enter = d3.select(this).selectAll("li").data(d.values).enter().append("li").attr("class", "ingredient_group"); // todo: get ingredient group
		var ing_obj;

		ing_enter
			.append("span")
			.attr("class", "quantity")
			.text(function(a) { return a.quantity + " "; });

		ing_enter
			.append("span")
			.attr("class", "unit") // todo: get ingredient group
			.text(function(a) {
				ing_obj = find_ingredient_id(a.ingredient_id);
				return ing_obj.unit + " ";
			});

		ing_enter
			.append("span")
			.attr("class", "name") // todo: get ingredient group
			.text(function(a) {
				ing_obj = find_ingredient_id(a.ingredient_id);
				return ing_obj.name;
			});
	});
}


function enter_transition(transition) {
	transition
		.duration(dur)
		.delay(function(d, i) { return i * dur/8; })
		.style("left", "0%")
		.style("opacity", 1);
}


function exit_transition(transition) {
	transition
		.duration(dur)
		.delay(function(d, i) { return i * dur/16; })
		.style("left", "-100%")
		.style("opacity", 1e-6)
	.remove();
}


function list_favorites() {
	var favorite_recipes = [];
	favorites.forEach(
		function(f) { favorite_recipes.push(find_recipe_id(f)[0]); }
	);

	list_recipes(favorite_recipes);
}


function find_ingredient_id(id) {
	var ing = $.grep(ingredients, function(e) {
		return e.key == id;
	});

	return ing[0].values[0];
}


function find_recipe_id(id) {
	var fRec = $.grep(recipes, function(e) {
		return e.recipe_id == id;
	});

	return fRec;
}









///End
