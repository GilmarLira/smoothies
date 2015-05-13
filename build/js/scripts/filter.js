
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
