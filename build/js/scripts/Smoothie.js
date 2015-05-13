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
