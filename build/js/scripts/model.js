// Model
// ////////////////////////////////////

var recipe = {
	"nutrients": [],
	"valid_ndbno": [],
	"total": [0, 0, 0]
};

var nutrients = itest.map(function(obj) {
	var rObj = {};
	var ndbno = obj.ndbno;

	rObj.id = obj.id;
	rObj.ndbno = ndbno;

	if(ndbno) {
		food_report(ndbno, add_nutrients);
	}

	return rObj;
});


function add_nutrients(ndbno, data) {
	if(data && ndbno) {
		var result = $.grep(nutrients, function(e) {
			return e.ndbno == ndbno;
		});

		result[0].nutrients = data;
	}
}

function get_nutrition_sheet(ndbno) {
	var result = $.grep(nutrients, function(e) { return e.ndbno == ndbno; });
	return result[0];
}

function get_nutrition_value() {

}



function food_report(ndbno, callback) {
	return $.ajax({
		url: "http://api.nal.usda.gov/usda/ndb/reports/",
		data: { ndbno: ndbno, api_key: "LL9FvzzSpBk7k74fKERh4bvUMj7NlbZIrqMWqCCh" }
	})
	.done(function(r) {
		var data = r.report.food.nutrients;

		callback(ndbno, data);


		// var rObj = {};
		//
		// rObj.ndbno = r.report.food.ndbno;
		// rObj.calories = type(r.report.food.nutrients[1].value);
		// rObj.protein = type(r.report.food.nutrients[3].value);
		// rObj.fat = type(r.report.food.nutrients[4].value);
		//
		// recipe.nutrients.push(rObj);
		// recipe.total[0] += +rObj.calories;
		// recipe.total[1] += +rObj.protein;
		// recipe.total[2] += +rObj.fat;
		//
		// if(recipe.nutrients.length == recipe.valid_ndbno.length) {
		// 	recipe_enter.call(plot_nutrition_graph);
		// }
	});
}



function type(d) {
  d.value = +d.value; // coerce to number
  return d;
}

function gram_eq(ing) {
	// var unit = ingredients[];

	// switch (ing.unit) {
	// 	case "handfuls":
	//
	// }
}
