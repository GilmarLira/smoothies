// Model
// ////////////////////////////////////

var smoothies = [];
var nutrients = [];
var count = itest.length;
var lastn = itest[itest.length-1].ndbno;
// console.log(count);

var Smoothie = function(id) {
	this.id = id;
	this.total = [0, 0, 0];
	this.valid_ndbno = [];
	this.nutrients = [];
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
	this.valid_ndbno.foreach(function(e) {
		console.log(e);
		this.total[0] += +get_nutrition_sheet(e).calories;
		this.total[1] += +get_nutrition_sheet(e).protein;
		this.total[2] += +get_nutrition_sheet(e).fat;
	});

	return this.total;
};


nutrients = itest.map(function(obj, i) {
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
	console.log(result[0].nutrients);
	return result[0].nutrients;
}


function food_report(ndbno, callback) {
	return $.ajax({
		url: "http://api.nal.usda.gov/usda/ndb/reports/",
		data: { ndbno: ndbno, api_key: "LL9FvzzSpBk7k74fKERh4bvUMj7NlbZIrqMWqCCh" }
	})
	.done(function(r) {
		var data = r.report.food.nutrients;
		var rObj = {};

		rObj.calories = +data[1].value;
		rObj.protein = +data[3].value;
		rObj.fat = +data[4].value;

		callback(ndbno, rObj);

		if(ndbno == lastn) {
			console.log("last ajax; ready to plot");
			plot_now();
		}
	});
}


function type(d) {
  d.value = +d.value; // coerce to number
  return d;
}
