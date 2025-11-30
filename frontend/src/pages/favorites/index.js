import React, { useEffect, useCallback, useMemo } from 'react';
import MetaTags from 'react-meta-tags';

import { 
  Card, Title, Pagination, CardList, Container, Main, CheckboxGroup 
} from '../../components';
import { useRecipes } from '../../utils/index.js';
import api from '../../api';
import styles from './styles.module.css';

const FavoriteRecipesPage = () => {
  const recipeManagement = useRecipes();
  const {
    recipes: favoriteRecipes,
    setRecipes: updateFavoritesList,
    recipesCount: favoritesTotal,
    setRecipesCount: setFavoritesCount,
    recipesPage: activePage,
    setRecipesPage: changePage,
    tagsValue: filterTags,
    handleTagsChange: modifyTagFilters,
    setTagsValue: applyTagFilters,
    handleLike: updateFavoriteStatus
  } = recipeManagement;
  
  const loadFavoriteRecipes = useCallback(async ({ page = 1, tags = null }) => {
    try {
      const favoriteRecipesResponse = await api.getRecipes({ 
        page, 
        is_favorited: Number(true), 
        tags 
      });
      
      const { results: recipeResults, count: recipeCount } = favoriteRecipesResponse;
      updateFavoritesList(recipeResults);
      setFavoritesCount(recipeCount);
    } catch (error) {
      console.error('Error loading favorite recipes:', error);
    }
  }, [updateFavoritesList, setFavoritesCount]);

  const initializeTagOptions = useCallback(async () => {
    try {
      const tagOptions = await api.getTags();
      const configuredTags = tagOptions.map(tagItem => ({ 
        ...tagItem, 
        value: false  // Tags start unselected - no filters applied initially
      }));
      applyTagFilters(configuredTags);
    } catch (error) {
      console.error('Failed to initialize tags:', error);
    }
  }, [applyTagFilters]);

  const onPageUpdate = useCallback((newPage) => {
    changePage(newPage);
  }, [changePage]);

  const onTagFilterUpdate = useCallback((newTagValue) => {
    changePage(1);
    modifyTagFilters(newTagValue);
  }, [changePage, modifyTagFilters]);

  useEffect(() => {
    initializeTagOptions();
  }, [initializeTagOptions]);

  useEffect(() => {
    loadFavoriteRecipes({ page: activePage, tags: filterTags });
  }, [activePage, filterTags, loadFavoriteRecipes]);

  const pageMetaInformation = useMemo(() => ({
    title: "Favorites",
    description: "BiteSnap - Favorites",
    ogTitle: "Favorites"
  }), []);

  const renderFavoritesList = () => {
    if (favoriteRecipes.length === 0) return null;
    
    return (
      <CardList>
        {favoriteRecipes.map((recipeItem) => (
          <Card
            {...recipeItem}
            key={`favorite-${recipeItem.id}`}
            handleLike={updateFavoriteStatus}
          />
        ))}
      </CardList>
    );
  };

  const renderPageHeader = () => (
    <div className={styles.title}>
      <Title title={pageMetaInformation.title} />
      <CheckboxGroup
        values={filterTags}
        handleChange={onTagFilterUpdate}
      />
    </div>
  );

  return (
    <Main>
      <Container>
        <MetaTags>
          <title>{pageMetaInformation.title}</title>
          <meta name="description" content={pageMetaInformation.description} />
          <meta property="og:title" content={pageMetaInformation.ogTitle} />
        </MetaTags>
        
        {renderPageHeader()}
        {renderFavoritesList()}
        
        <Pagination
          count={favoritesTotal}
          limit={6}
          onPageChange={onPageUpdate}
        />
      </Container>
    </Main>
  );
};

export default FavoriteRecipesPage;