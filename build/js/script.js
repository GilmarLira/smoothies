var Smoothie = function(id) {
	var r = get_recipe_by_id(id);

	this.id = id;
	this.phase = r.phase,
	this.name = r.name,
	this.description = r.description,
	this.ingredients = r.ingredients,
	this.quantities = r.quantities,
	this.total = [0, 0, 0];
	this.valid_ndbno = [];

	var this_smoothie = this;

	r.ingredients.forEach(function(id) {
		var ing = get_ingredient_by_id(id);
		if(ing.ndbno) {
			this_smoothie.valid_ndbno.push(ing.ndbno);
		}
		return false;
	});

	// this.nutrients = [];
};


Smoothie.prototype.addNutrientSet = function(obj) {
	this.nutrients.push(obj);
	this.total[0] += +obj.calories;
	this.total[1] += +obj.protein;
	this.total[2] += +obj.fat;
};

Smoothie.prototype.addndbno = function(n) {
	this.valid_ndbno.push(n);
};

Smoothie.prototype.getTotal = function() {
	var total = [0, 0, 0];
	this.valid_ndbno.forEach(function(n) {
		var nutri = get_nutrition_sheet(n);

		total[0] += +nutri.calories;
		total[1] += +nutri.protein;
		total[2] += +nutri.fat;
	});
	return total;
};


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

// // Model
// // ////////////////////////////////////
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
