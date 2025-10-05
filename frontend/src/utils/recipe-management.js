import { useState } from "react";
import { useTags } from './use-tags';
import api from '../api';

export function useRecipeDetails() {
  const [recipeData, setRecipeData] = useState({});

  const toggleRecipeFavorite = async ({ id, toLike = 1 }) => {
    // Convert toLike to boolean for consistent API logic
    const shouldLike = Boolean(toLike);
    const favoriteAction = shouldLike ? api.addToFavorites : api.removeFromFavorites;
    
    try {
      await favoriteAction({ id });
      const updatedRecipe = { 
        ...recipeData, 
        is_favorited: shouldLike
      };
      setRecipeData(updatedRecipe);
    } catch (error) {
      console.error('Favorites error (single recipe):', error);
      // Handle different error types
      if (error && typeof error === 'object') {
        const errorMessage = error.error || error.message || JSON.stringify(error);
        alert(`Favorites error: ${errorMessage}`);
      } else {
        alert('Failed to update favorites. Please check console for details.');
      }
    }
  };

  return {
    recipe: recipeData,
    setRecipe: setRecipeData,
    handleLike: toggleRecipeFavorite
  };
}

export function useRecipeCollection() {
  const [recipeList, setRecipeList] = useState([]);
  const [totalRecipes, setTotalRecipes] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const categoryManagement = useTags();
  
  const { 
    value: categoryFilters, 
    handleChange: updateCategoryFilters, 
    setValue: setCategoryFilters 
  } = categoryManagement;

  const toggleCollectionItemFavorite = async ({ id, toLike = true }) => {
    // Convert toLike to boolean for consistent API logic  
    const shouldLike = Boolean(toLike);
    const favoriteAction = shouldLike ? api.addToFavorites : api.removeFromFavorites;
    
    try {
      await favoriteAction({ id });
      const updatedRecipeList = recipeList.map(recipeItem => {
        if (recipeItem.id === id) {
          return { ...recipeItem, is_favorited: shouldLike };
        }
        return recipeItem;
      });
      setRecipeList(updatedRecipeList);
    } catch (error) {
      console.error('Favorites error (recipe collection):', error);
      // Handle different error types
      if (error && typeof error === 'object') {
        const errorMessage = error.error || error.message || JSON.stringify(error);
        alert(`Favorites error: ${errorMessage}`);
      } else {
        alert('Failed to update favorites. Please check console for details.');
      }
    }
  };

  return {
    recipes: recipeList,
    setRecipes: setRecipeList,
    recipesCount: totalRecipes,
    setRecipesCount: setTotalRecipes,
    recipesPage: currentPage,
    setRecipesPage: setCurrentPage,
    tagsValue: categoryFilters,
    handleLike: toggleCollectionItemFavorite,
    handleTagsChange: updateCategoryFilters,
    setTagsValue: setCategoryFilters
  };
}

export const useRecipe = useRecipeDetails;
export const useRecipes = useRecipeCollection;

const recipeManagementHooks = {
  useRecipeDetails,
  useRecipeCollection,
  useRecipe,
  useRecipes
};

export default recipeManagementHooks;
