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
