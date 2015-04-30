
// controller
// ////////////////////////////////////

var recipes,
	ingredients,
	recipe_ingredients,
	favorites = ["1", "2", "4"];



$(document).ready(function(){
	// top bar
	$(".bar .title").click(function() {
		$("section").filter(".selected").toggleClass("selected");
	});

	// main
	var $menu = $(".menu");
	$menu.find("a").click(menu_click);

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

function menu_click() {
	var des = $(this).attr("rel");
	// $("." + des).toggleClass("selected");

	switch (des) {
		case "recipes":
			list_recipes(recipes);
			$(".recipes-container").toggleClass("selected");
			break;
		case "favorites":
			list_favorites();
			$(".recipes-container").toggleClass("selected");
			break;
	}
}



function list_recipes(list) {
	var container = d3.select(".recipes-container")
		.selectAll("div")
		.data(list, function(d) { return d.recipe_id; });

	container_enter = container.enter()
		.append("div")
		.classed("recipe", true)
		.classed("enter", true)
		.style("left", "100%")
		.style("opacity", 1e-6);

	container_enter
		.append("h2")
		.attr("class", "title")
		.text(function(d) { return d.name; })
		.on("click", function() { $(this).parents(".recipe").toggleClass("selected"); });

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

	container
		.transition()
		.duration(800)
		.delay(function(d, i) { return i * 800/8; })
		.style("left", "0%")
		.style("opacity", 1);

	container.exit()
		.style("display", "none")
		.remove();
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

function list_favorites() {
	var favorite_recipes = [];
	favorites.forEach(
		function(f) {
			favorite_recipes.push(find_recipe_id(f)[0]);
		}
	);

	console.log(favorite_recipes);
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





















//  end
