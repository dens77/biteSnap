import React, { useEffect, useCallback } from 'react';
import MetaTags from 'react-meta-tags';
import { 
  Card, Title, Pagination, CardList, Container, Main, CheckboxGroup 
} from '../../components';

import { useRecipes } from '../../utils/index.js';
import api from '../../api';
import styles from './styles.module.css';

const RecipeHomepage = () => {
  const recipeState = useRecipes();
  const {
    recipes: recipeCollection,
    setRecipes: updateRecipeCollection,
    recipesCount: totalRecipeCount,
    setRecipesCount: updateRecipeCount,
    recipesPage: currentPageNumber,
    setRecipesPage: navigateToPage,
    tagsValue: selectedTags,
    setTagsValue: updateTagSelection,
    handleTagsChange: toggleTagSelection,
    handleLike: toggleRecipeFavorite
  } = recipeState;

  const fetchRecipeData = useCallback(async ({ page = 1, tags = null }) => {
    try {
      const response = await api.getRecipes({ page, tags });
      const { results: recipeResults, count: totalCount } = response;
      updateRecipeCollection(recipeResults);
      updateRecipeCount(totalCount);
    } catch (error) {
      console.error('Failed to fetch recipes:', error);
    }
  }, [updateRecipeCollection, updateRecipeCount]);

  const initializeTags = useCallback(async () => {
    try {
      const availableTags = await api.getTags();
      const tagConfiguration = availableTags.map((tag) => ({ 
        ...tag, 
        value: false  // Tags start unselected - no filters applied initially
      }));
      updateTagSelection(tagConfiguration);
    } catch (error) {
      console.error('Failed to load tags:', error);
    }
  }, [updateTagSelection]);

  const handlePageChange = useCallback((newPageNumber) => {
    navigateToPage(newPageNumber);
  }, [navigateToPage]);

  const handleTagFilterChange = useCallback((updatedTagValue) => {
    navigateToPage(1);
    toggleTagSelection(updatedTagValue);
  }, [navigateToPage, toggleTagSelection]);

  useEffect(() => {
    initializeTags();
  }, [initializeTags]);

  useEffect(() => {
    fetchRecipeData({ page: currentPageNumber, tags: selectedTags });
  }, [currentPageNumber, selectedTags, fetchRecipeData]);

  const pageMetadata = (
    <MetaTags>
      <title>Recipes</title>
      <meta name="description" content="BiteSnap - Recipes" />
      <meta property="og:title" content="Recipes" />
    </MetaTags>
  );

  const renderRecipeGrid = () => (
    recipeCollection.length > 0 && (
      <CardList>
        {recipeCollection.map((recipeData) => (
          <Card
            {...recipeData}
            key={`recipe-${recipeData.id}`}
            handleLike={toggleRecipeFavorite}
          />
        ))}
      </CardList>
    )
  );

  const renderPaginationControls = () => (
    <Pagination
      count={totalRecipeCount}
      limit={6}
      onPageChange={handlePageChange}
    />
  );

  return (
    <Main>
      <Container>
        {pageMetadata}
        <div className={styles.title}>
          <Title title='Recipes' />
          <CheckboxGroup
            values={selectedTags}
            handleChange={handleTagFilterChange}
          />
        </div>
        {renderRecipeGrid()}
        {renderPaginationControls()}
      </Container>
    </Main>
  );
};

export default RecipeHomepage;