import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useHistory } from "react-router-dom";
import MetaTags from "react-meta-tags";
import cn from "classnames";

import {
  Container, IngredientsSearch, FileInput, Input, Title,
  CheckboxGroup, Main, Form, Button, Textarea, Icons
} from "../../components";
import { useTags } from "../../utils";
import api from "../../api";
import styles from "./styles.module.css";

const RecipeModificationInterface = ({ onItemDelete }) => {
  // URL parameter extraction
  const { id: recipeIdentifier } = useParams();
  const navigationController = useHistory();

  // Tag management system
  const categoryManagement = useTags();
  const { 
    value: categorySelections, 
    handleChange: updateCategorySelection, 
    setValue: configureCategoryState 
  } = categoryManagement;

  // Recipe data state management
  const [recipeModificationData, setRecipeModificationData] = useState({
    title: "",
    description: "",
    preparationTime: 0,
    imageContent: null,
    imageModified: false
  });

  // Ingredient handling state
  const [ingredientEntryState, setIngredientEntryState] = useState({
    name: "",
    id: null,
    amount: "",
    measurement_unit: "",
  });

  const [recipeComponentsList, setRecipeComponentsList] = useState([]);
  const [ingredientSearchResults, setIngredientSearchResults] = useState([]);
  const [ingredientSuggestionsVisible, setIngredientSuggestionsVisible] = useState(false);

  // Error and loading management
  const [formValidationError, setFormValidationError] = useState({ submitError: "" });
  const [ingredientInputError, setIngredientInputError] = useState("");
  const [recipeDataLoaded, setRecipeDataLoaded] = useState(false);

  // Validation configuration
  const ingredientValidationConfig = useMemo(() => ({
    amountRegex: /^\d+$/,
    validationMessages: {
      notSelected: "Ingredient not selected",
      alreadyExists: "Ingredient already selected"
    }
  }), []);

  // Data update utilities
  const updateRecipeProperty = useCallback((property, newValue) => {
    setRecipeModificationData(currentData => ({
      ...currentData,
      [property]: newValue
    }));
  }, []);

  const clearAllErrors = useCallback(() => {
    setFormValidationError({ submitError: "" });
    setIngredientInputError("");
  }, []);

  // Ingredient validation and management
  const validateIngredientEntry = useCallback(() => {
    const { amount, name, id } = ingredientEntryState;
    const { validationMessages } = ingredientValidationConfig;

    if (!amount || !name || !id) {
      setIngredientInputError(validationMessages.notSelected);
      return false;
    }

    if (recipeComponentsList.some(component => component.name === name)) {
      setIngredientInputError(validationMessages.alreadyExists);
      return false;
    }

    return true;
  }, [ingredientEntryState, recipeComponentsList, ingredientValidationConfig]);

  const incorporateIngredientIntoRecipe = useCallback(() => {
    if (!validateIngredientEntry()) return;

    setRecipeComponentsList(currentComponents => [
      ...currentComponents,
      ingredientEntryState
    ]);

    setIngredientEntryState({
      name: "",
      id: null,
      amount: "",
      measurement_unit: "",
    });
  }, [validateIngredientEntry, ingredientEntryState]);

  const populateIngredientFromSuggestions = useCallback((suggestionData) => {
    const { id, name, measurement_unit } = suggestionData;
    
    setIngredientEntryState(currentState => ({
      ...currentState,
      id,
      name,
      measurement_unit,
    }));
  }, []);

  // API data loading functions
  const fetchIngredientSuggestions = useCallback(async (searchQuery) => {
    if (!searchQuery) {
      setIngredientSearchResults([]);
      return;
    }

    try {
      const suggestions = await api.getIngredients({ name: searchQuery });
      setIngredientSearchResults(suggestions);
    } catch (error) {
      console.error("Failed to fetch ingredient suggestions:", error);
    }
  }, []);

  const loadTagOptions = useCallback(async () => {
    try {
      const tagData = await api.getTags();
      const initialTagState = tagData.map(tag => ({ ...tag, value: true }));
      configureCategoryState(initialTagState);
    } catch (error) {
      console.error("Failed to load tag options:", error);
    }
  }, [configureCategoryState]);

  const loadExistingRecipeData = useCallback(async () => {
    if (categorySelections.length === 0 || recipeDataLoaded) {
              return;
            }

    try {
      const existingRecipe = await api.getRecipe({ recipe_id: recipeIdentifier });
      const { 
        image, 
        tags: recipeTags, 
        cooking_time, 
        name, 
        ingredients: recipeIngredients, 
        text 
      } = existingRecipe;

      // Update recipe data
      setRecipeModificationData({
        title: name,
        description: text,
        preparationTime: cooking_time,
        imageContent: image,
        imageModified: false
      });

      setRecipeComponentsList(recipeIngredients);

      // Configure tag selections
      const updatedCategoryState = categorySelections.map((category) => ({
        ...category,
        value: Boolean(recipeTags.find((tag) => tag.id === category.id))
      }));
      
      configureCategoryState(updatedCategoryState);
      setRecipeDataLoaded(true);
    } catch (error) {
      console.error('Recipe loading failed:', error);
      navigationController.push("/recipes");
    }
  }, [
    categorySelections.length, 
    recipeDataLoaded, 
    recipeIdentifier, 
    categorySelections,
    configureCategoryState,
    navigationController
  ]);

  // Form validation logic
  const validateCompleteForm = useCallback(() => {
    const { title, description, preparationTime, imageContent } = recipeModificationData;
    const hasSelectedCategories = categorySelections.filter(cat => cat.value).length > 0;
    const hasIngredients = recipeComponentsList.length > 0;

    if (!title || !description || !preparationTime || !imageContent || !hasIngredients) {
      setFormValidationError({ submitError: "Please fill in all fields!" });
      return false;
    }

    if (!hasSelectedCategories) {
      setFormValidationError({ submitError: "Please select at least one tag" });
      return false;
    }

    return true;
  }, [recipeModificationData, categorySelections, recipeComponentsList]);

  // Recipe update submission
  const submitRecipeModifications = useCallback(async (event) => {
    event.preventDefault();
    
    if (!validateCompleteForm()) return;

    const { title, description, preparationTime, imageContent, imageModified } = recipeModificationData;
    const updatePayload = {
      text: description,
      name: title,
      ingredients: recipeComponentsList.map(component => ({
        id: component.id,
        amount: component.amount,
      })),
      tags: categorySelections
        .filter(category => category.value)
        .map(category => category.id),
      cooking_time: preparationTime,
      image: imageContent,
      recipe_id: recipeIdentifier,
    };

    try {
      await api.updateRecipe(updatePayload, imageModified);
      navigationController.push(`/recipes/${recipeIdentifier}`);
    } catch (error) {
      handleUpdateSubmissionError(error);
    }
  }, [
    validateCompleteForm,
    recipeModificationData,
    recipeComponentsList,
    categorySelections,
    recipeIdentifier,
    navigationController
  ]);

  // Error handling for update submissions
  const handleUpdateSubmissionError = useCallback((error) => {
    const { non_field_errors, ingredients, cooking_time } = error;
    
                if (non_field_errors) {
      setFormValidationError({ submitError: non_field_errors.join(", ") });
      return;
                }
    
                if (ingredients) {
      const ingredientErrorDetails = ingredients
        .filter(item => Object.keys(item).length > 0)
        .map(item => {
          const errorField = Object.keys(item)[0];
          return item[errorField]?.join(", ");
        })
        .filter(Boolean)[0];
        
      setFormValidationError({ 
        submitError: `Ingredients: ${ingredientErrorDetails}` 
      });
      return;
    }
    
                if (cooking_time) {
      setFormValidationError({ 
        submitError: `Cooking time: ${cooking_time[0]}` 
      });
      return;
    }
    
    const errorMessages = Object.values(error);
    if (errorMessages.length > 0) {
      setFormValidationError({ submitError: errorMessages.join(", ") });
    }
  }, []);

  // Recipe deletion handler
  const executeRecipeDeletion = useCallback(async () => {
    try {
      await api.deleteRecipe({ recipe_id: recipeIdentifier });
      onItemDelete && onItemDelete();
      navigationController.push("/recipes");
    } catch (error) {
      console.error("Failed to delete recipe:", error);
    }
  }, [recipeIdentifier, onItemDelete, navigationController]);

  // Input change handlers
  const handleIngredientNameInput = useCallback((inputEvent) => {
    clearAllErrors();
    const inputValue = inputEvent.target.value;
    
    setIngredientEntryState(currentState => ({
      ...currentState,
      name: inputValue,
    }));
  }, [clearAllErrors]);

  const handleIngredientAmountInput = useCallback((amountEvent) => {
    const amountValue = amountEvent.target.value;
    
    setIngredientEntryState(currentState => ({
      ...currentState,
      amount: amountValue,
    }));
  }, []);

  // Component lifecycle effects
  useEffect(() => {
    loadTagOptions();
  }, [loadTagOptions]);

  useEffect(() => {
    fetchIngredientSuggestions(ingredientEntryState.name);
  }, [ingredientEntryState.name, fetchIngredientSuggestions]);

  useEffect(() => {
    loadExistingRecipeData();
  }, [loadExistingRecipeData]);

  // Render helper functions
  const renderPageMetadata = () => (
    <MetaTags>
      <title>Edit Recipe</title>
      <meta name="description" content="BiteSnap - Edit Recipe" />
      <meta property="og:title" content="Edit Recipe" />
    </MetaTags>
  );

  const renderIngredientSuggestions = () => {
    if (!ingredientSuggestionsVisible || ingredientSearchResults.length === 0) {
      return null;
    }

    return (
                <IngredientsSearch
        ingredients={ingredientSearchResults}
        onClick={(suggestionItem) => {
          populateIngredientFromSuggestions(suggestionItem);
          setIngredientSearchResults([]);
          setIngredientSuggestionsVisible(false);
        }}
      />
    );
  };

  const renderSelectedComponentsList = () => {
    if (recipeComponentsList.length === 0) return null;

    return (
            <div className={styles.ingredientsAdded}>
        {recipeComponentsList.map((component) => (
          <div key={`component-${component.id}`} className={styles.ingredientsAddedItem}>
                    <span className={styles.ingredientsAddedItemTitle}>
              {component.name}
            </span>
            <span>, </span>
            <p className={styles.amountText}>amount </p>
                    <span>
              {component.amount}
              {component.measurement_unit}
            </span>
                    <span
                      className={styles.ingredientsAddedItemRemove}
              onClick={() => {
                const updatedComponents = recipeComponentsList.filter(
                  item => item.id !== component.id
                );
                setRecipeComponentsList(updatedComponents);
                      }}
                    >
                      <Icons.IngredientDelete />
                    </span>
          </div>
        ))}
                  </div>
                );
  };

  const renderIngredientInputInterface = () => (
    <div className={styles.ingredients}>
      <div className={styles.ingredientsInputs}>
        <Input
          label="Ingredients"
          className={styles.ingredientsNameInput}
          inputClassName={styles.ingredientsInput}
          placeholder="Start typing ingredient name"
          labelClassName={styles.ingredientsLabel}
          onChange={handleIngredientNameInput}
          onFocus={() => setIngredientSuggestionsVisible(true)}
          onBlur={() => setTimeout(() => setIngredientSuggestionsVisible(false), 200)}
          value={ingredientEntryState.name}
        />
        
        <div className={styles.ingredientsAmountInputContainer}>
          <Input
            className={styles.ingredientsAmountValue}
            inputClassName={styles.ingredientsInput}
            placeholder="1"
            onChange={handleIngredientAmountInput}
            value={ingredientEntryState.amount}
          />
          <p className={styles.amountText}>amount </p>
          <div className={styles.measurementUnit}>
            {ingredientEntryState.measurement_unit}
          </div>
        </div>
      </div>

      {renderIngredientSuggestions()}

      <div className={styles.ingredientAdd} onClick={() => {
        if (!validateIngredientEntry()) return;
        setRecipeComponentsList(currentComponents => [
          ...currentComponents,
          ingredientEntryState
        ]);
        setIngredientEntryState({
          name: "",
          id: null,
          amount: "",
          measurement_unit: "",
        });
      }}>
        Add Ingredient
              </div>

      {ingredientInputError && (
        <p className={cn(styles.error, styles.errorIngredient)}>
          {ingredientInputError}
        </p>
            )}

      {renderSelectedComponentsList()}
          </div>
  );

  const renderTimingConfiguration = () => (
          <div className={styles.cookingTime}>
            <Input
        label="Cooking Time"
              className={styles.ingredientsTimeInput}
              inputClassName={styles.ingredientsTimeValue}
        onChange={(event) => {
          clearAllErrors();
          updateRecipeProperty('preparationTime', event.target.value);
        }}
        value={recipeModificationData.preparationTime}
              placeholder="0"
            />
      <div className={styles.cookingTimeUnit}>min</div>
          </div>
  );

  const renderActionButtons = () => (
          <div className={styles.actions}>
            <Button
              modifier="style_dark"
              type="submit"
              className={styles.button}
            >
        Save Recipe
            </Button>
      <div className={styles.deleteRecipe} onClick={executeRecipeDeletion}>
        Delete
            </div>
          </div>
  );

  const renderModificationForm = () => (
    <Form className={styles.form} onSubmit={submitRecipeModifications}>
      <Input
        label="Recipe Name"
        onChange={(event) => {
          clearAllErrors();
          updateRecipeProperty('title', event.target.value);
        }}
        value={recipeModificationData.title}
        className={styles.mb36}
      />

      <CheckboxGroup
        label="Tags"
        values={categorySelections}
        emptyText="No tags loaded"
        className={styles.checkboxGroup}
        labelClassName={styles.checkboxGroupLabel}
        tagsClassName={styles.checkboxGroupTags}
        checkboxClassName={styles.checkboxGroupItem}
        handleChange={updateCategorySelection}
      />

      {renderIngredientInputInterface()}
      {renderTimingConfiguration()}

      <Textarea
        label="Recipe Description"
        onChange={(event) => {
          const newDescription = event.target.value;
          updateRecipeProperty('description', newDescription);
        }}
        placeholder="Describe the cooking steps"
        value={recipeModificationData.description}
      />

      <FileInput
        onChange={(newFile) => {
          setRecipeModificationData(currentData => ({
            ...currentData,
            imageContent: newFile,
            imageModified: true
          }));
        }}
        fileTypes={["image/png", "image/jpeg"]}
        fileSize={5000}
        className={styles.fileInput}
        label="Upload Photo"
        file={recipeModificationData.imageContent}
      />

      {renderActionButtons()}

      {formValidationError.submitError && (
        <p className={styles.error}>{formValidationError.submitError}</p>
          )}
        </Form>
  );

  // Page configuration
  const pageSettings = useMemo(() => ({
    title: "Edit Recipe",
    description: "BiteSnap - Edit Recipe",
    ogTitle: "Edit Recipe"
  }), []);

  return (
    <Main>
      <Container>
        <MetaTags>
          <title>{pageSettings.title}</title>
          <meta name="description" content={pageSettings.description} />
          <meta property="og:title" content={pageSettings.ogTitle} />
        </MetaTags>
        <Title title={pageSettings.title} />
        {renderModificationForm()}
      </Container>
    </Main>
  );
};

export default RecipeModificationInterface;