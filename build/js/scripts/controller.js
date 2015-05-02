
// controller
// ////////////////////////////////////

var recipes,
	ingredients,
	recipe_ingredients,
	favorites;

var dur = 1000;


$(document).ready(init);


function init() {
	favorites = new Favorites();

	$(".bar .title").click(list_menu);

	d3.csv("js/recipes.csv", function(csv) { csv.forEach(function(d) { d.recipe_id = +d.recipe_id; }); recipes = csv; });
	d3.csv("js/ingredients.csv", function(csv) {
		ingredients = d3.nest()
			.key(function(d) { return d.ingredient_id; })
			.entries(csv);

		d3.csv("js/recipe_ingredients.csv", function(csv) {
			csv.forEach(function(d) { d.recipe_id = +d.recipe_id; d.ingredient_id = +d.ingredient_id; })
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
		.selectAll(".cell")
		.data(menu_data, function(d) { return d; });


	// MENU EXIT
	menu.exit()
		.attr("class", "cell exit")
		.transition()
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
		}
	});
}


function list_recipes(list) {
	var recipes_list = d3.select(".list-view")
		.attr("class", "list-view recipes")
		.selectAll(".cell")
		.data(list, function(d) { return d.recipe_id; });

	// EXIT
	recipes_list.exit()
		.attr("class", "cell recipe exit")
		.transition()
			.call(exit_transition);

	// ENTER
	container_enter = recipes_list.enter()
		.append("div")
			.attr("class", "cell recipe enter");


	container_enter
		.append("h2")
			.attr("class", "title")
			.text(function(d) { return d.name; })
			.on("click", toggle_recipe);

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
			.attr("class", "favorite-check")
			.property("checked", function(d) { return (favorites.hasRecipe(d.recipe_id)); })
			.on("change", update_favorites);

	// UPDATE
	recipes_list
		.order()
		.style("-webkit-transform", function(d, i) { return "translate(100%, " + i * lines(2) + "px)"; })
		.classed("favorite", function(d) { return (favorites.hasRecipe(d.recipe_id)); })
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
			.text(function(a) { return (a.ingredient_id === 0) ? "" : a.quantity + " "; });

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
				return (a.ingredient_id === 0) ? "Add " + ing_obj.name : ing_obj.name;
			});
	});
}


function enter_transition(transition) {
	transition
		.duration(dur)
		.delay(function(d, i) { return (i+1)/transition.size() * dur; })
		.styleTween("-webkit-transform", function (d, i) {
			var startTranslateState = "translate(100%, " + i * lines(2) + "px)";
			var endTranslateState = "translate(0%, " + i * lines(2) + "px)";
			var translateInterpolator = d3.interpolateString(startTranslateState, endTranslateState);
    	return translateInterpolator;
    })
		.style("opacity", 1);
}


function exit_transition(transition) {
	transition
		.duration(dur/2)
		.delay(function(d, i) { return i/transition.size() * dur/2; })
		.styleTween("-webkit-transform", function (d, i) {
			var startTranslateState = "translate(0%, " + i * lines(2) + "px)";
			var endTranslateState = "translate(-100%, " + i * lines(2) + "px)";
			var translateInterpolator = d3.interpolateString(startTranslateState, endTranslateState);
    	return translateInterpolator;
    })
		.style("opacity", 1e-6)
		.remove();
}


function list_favorites() {
	var fav_recipes = [];
	favorites.getRecipes().forEach(
		function(f) { fav_recipes.push(find_recipe_id(f)[0]); }
	);

	list_recipes(fav_recipes);
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

function update_favorites(d) {
	if(this.checked) {
		favorites.addRecipe(d.recipe_id);
	} else {
		favorites.removeRecipe(d.recipe_id);
	}
}
