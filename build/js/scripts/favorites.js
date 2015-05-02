
// favorites class
// ////////////////////////////////////

var Favorites = function() {
	this.recipes = [];
};

Favorites.prototype.getRecipes = function() {
	return this.recipes;
};

Favorites.prototype.addRecipe = function(id) {
	this.recipes.push(id);
};

Favorites.prototype.removeRecipe = function(id) {
	this.recipes.splice(this.getRecipeIndex(id), 1);
};

Favorites.prototype.getRecipeIndex = function(id) {
	return $.inArray(id, this.recipes);
};

Favorites.prototype.hasRecipe = function(id) {
	return (this.getRecipeIndex(id) == -1) ? false : true;
};


///End
