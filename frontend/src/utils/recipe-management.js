import { useState } from "react";
import { useTags } from './use-tags';
import api from '../api';

export function useRecipeDetails() {
  const [recipeData, setRecipeData] = useState({});

  const toggleRecipeFavorite = async ({ id, toLike = 1 }) => {
    const favoriteAction = toLike ? api.addToFavorites : api.removeFromFavorites;
    
    try {
      await favoriteAction({ id });
      const updatedRecipe = { 
        ...recipeData, 
        is_favorited: Number(toLike) 
      };
      setRecipeData(updatedRecipe);
    } catch (error) {
      const { errors } = error;
      if (errors) {
        alert(errors);
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
    const favoriteAction = toLike ? api.addToFavorites : api.removeFromFavorites;
    
    try {
      await favoriteAction({ id });
      const updatedRecipeList = recipeList.map(recipeItem => {
        if (recipeItem.id === id) {
          return { ...recipeItem, is_favorited: toLike };
        }
        return recipeItem;
      });
      setRecipeList(updatedRecipeList);
    } catch (error) {
      const { errors } = error;
      if (errors) {
        alert(errors);
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
