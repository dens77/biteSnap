import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useHistory } from "react-router-dom";
import MetaTags from "react-meta-tags";
import cn from "classnames";

import {
  Container, IngredientsSearch, FileInput, Input, Title,
  CheckboxGroup, Main, Form, Button, Textarea, Icons
} from "../../components";
import { useTags } from "../../utils";
import api from "../../api";
import styles from "./styles.module.css";

const NewRecipeBuilder = ({ onEdit }) => {
  // Tag management system
  const tagControlSystem = useTags();
  const { 
    value: categoryOptions, 
    handleChange: adjustCategorySelection, 
    setValue: establishCategoryState 
  } = tagControlSystem;

  // Navigation management
  const routeController = useHistory();

  // Primary recipe data state
  const [recipeCreationData, setRecipeCreationData] = useState({
    title: "",
    description: "",
    cookingDuration: "",
    recipeImage: null
  });

  // Ingredient input management
  const [currentIngredientInput, setCurrentIngredientInput] = useState({
    name: "",
    id: null,
    amount: "",
    measurement_unit: "",
  });

  const [compiledIngredientsList, setCompiledIngredientsList] = useState([]);
  const [ingredientSearchDatabase, setIngredientSearchDatabase] = useState([]);
  const [searchDropdownActive, setSearchDropdownActive] = useState(false);

  // Validation and error tracking
  const [submissionValidationError, setSubmissionValidationError] = useState({ submitError: "" });
  const [ingredientEntryError, setIngredientEntryError] = useState("");

  // Validation rules configuration
  const inputValidationStandards = useMemo(() => ({
    numericPattern: /^\d+$/,
    errorTexts: {
      invalidNumber: "Ingredient amount must be a whole number",
      incompleteData: "Ingredient not selected",
      duplicateEntry: "Ingredient already selected"
    }
  }), []);

  // State management utilities
  const updateRecipeDataField = useCallback((fieldName, fieldValue) => {
    setRecipeCreationData(existingData => ({
      ...existingData,
      [fieldName]: fieldValue
    }));
  }, []);

  const resetAllErrorStates = useCallback(() => {
    setSubmissionValidationError({ submitError: "" });
    setIngredientEntryError("");
  }, []);

  const resetIngredientInput = useCallback(() => {
    setCurrentIngredientInput({
      name: "",
      id: null,
      amount: "",
      measurement_unit: "",
    });
  }, []);

  // Ingredient validation and processing
  const performIngredientValidation = useCallback(() => {
    const { amount, name, id } = currentIngredientInput;
    const { numericPattern, errorTexts } = inputValidationStandards;

    if (amount !== "" && !numericPattern.test(amount)) {
      setIngredientEntryError(errorTexts.invalidNumber);
      return false;
    }

    if (!amount || !name || !id) {
      setIngredientEntryError(errorTexts.incompleteData);
      return false;
    }

    const isDuplicateIngredient = compiledIngredientsList.some(
      ingredient => ingredient.name === name
    );
    
    if (isDuplicateIngredient) {
      setIngredientEntryError(errorTexts.duplicateEntry);
      return false;
    }

    return true;
  }, [currentIngredientInput, compiledIngredientsList, inputValidationStandards]);

  const processIngredientAddition = useCallback(() => {
    if (!performIngredientValidation()) return;

    setCompiledIngredientsList(existingList => [
      ...existingList, 
      currentIngredientInput
    ]);
    
    resetIngredientInput();
  }, [performIngredientValidation, currentIngredientInput, resetIngredientInput]);

  const configureIngredientFromSearch = useCallback((searchResult) => {
    const { id, name, measurement_unit } = searchResult;
    
    setCurrentIngredientInput(currentInput => ({
      ...currentInput,
      id,
      name,
      measurement_unit,
    }));
  }, []);

  // API interaction handlers
  const retrieveIngredientSuggestions = useCallback(async (searchQuery) => {
    if (!searchQuery) {
      setIngredientSearchDatabase([]);
      return;
    }

    try {
      const searchResults = await api.getIngredients({ name: searchQuery });
      setIngredientSearchDatabase(searchResults);
    } catch (error) {
      console.error("Ingredient search failed:", error);
      setIngredientSearchDatabase([]);
    }
  }, []);

  const loadCategoryOptions = useCallback(async () => {
    try {
      const categoryData = await api.getTags();
      const initialCategoryConfig = categoryData.map(category => ({ 
        ...category, 
        value: true 
      }));
      establishCategoryState(initialCategoryConfig);
    } catch (error) {
      console.error("Category loading failed:", error);
    }
  }, [establishCategoryState]);

  // Form validation system
  const validateEntireForm = useCallback(() => {
    const { title, description, cookingDuration, recipeImage } = recipeCreationData;
    const hasSelectedCategories = categoryOptions.filter(option => option.value).length > 0;
    const hasIngredients = compiledIngredientsList.length > 0;

    if (!title || !description || !cookingDuration || !recipeImage || !hasIngredients) {
      setSubmissionValidationError({ submitError: "Please fill in all fields!" });
      return false;
    }

    if (!hasSelectedCategories) {
      setSubmissionValidationError({ submitError: "Please select at least one tag" });
    return false;
    }

    return true;
  }, [recipeCreationData, categoryOptions, compiledIngredientsList]);

  // Recipe creation submission
  const executeRecipeCreation = useCallback(async (formEvent) => {
    formEvent.preventDefault();
    
    if (!validateEntireForm()) return;

    const { title, description, cookingDuration, recipeImage } = recipeCreationData;
    const creationPayload = {
      text: description,
      name: title,
      ingredients: compiledIngredientsList.map(ingredient => ({
        id: ingredient.id,
        amount: ingredient.amount,
      })),
      tags: categoryOptions
        .filter(category => category.value)
        .map(category => category.id),
      cooking_time: cookingDuration,
      image: recipeImage,
    };

    try {
      const newRecipe = await api.createRecipe(creationPayload);
      routeController.push(`/recipes/${newRecipe.id}`);
    } catch (error) {
      handleCreationSubmissionError(error);
    }
  }, [
    validateEntireForm,
    recipeCreationData,
    compiledIngredientsList,
    categoryOptions,
    routeController
  ]);

  // Error handling for creation submissions
  const handleCreationSubmissionError = useCallback((error) => {
    const { non_field_errors, ingredients, cooking_time } = error;
    
    if (non_field_errors) {
      setSubmissionValidationError({ submitError: non_field_errors.join(", ") });
              return;
            }
    
    if (ingredients) {
      const ingredientErrorInfo = ingredients
        .filter(item => Object.keys(item).length > 0)
        .map(item => {
          const errorProperty = Object.keys(item)[0];
          return item[errorProperty]?.join(", ");
        })
        .filter(Boolean)[0];
        
      setSubmissionValidationError({ 
        submitError: `Ingredients: ${ingredientErrorInfo}` 
      });
      return;
    }
    
                if (cooking_time) {
      setSubmissionValidationError({ 
        submitError: `Cooking time: ${cooking_time[0]}` 
      });
      return;
    }
    
    const errorList = Object.values(error);
    if (errorList.length > 0) {
      setSubmissionValidationError({ submitError: errorList.join(", ") });
    }
  }, []);

  // Input change event handlers
  const handleIngredientNameChange = useCallback((changeEvent) => {
    resetAllErrorStates();
    const inputText = changeEvent.target.value;
    
    setCurrentIngredientInput(currentState => ({
      ...currentState,
      name: inputText,
    }));
  }, [resetAllErrorStates]);

  const handleIngredientQuantityChange = useCallback((quantityEvent) => {
    const quantityValue = quantityEvent.target.value;
    
    setCurrentIngredientInput(currentState => ({
      ...currentState,
      amount: quantityValue,
    }));
  }, []);

  // Component initialization effects
  useEffect(() => {
    loadCategoryOptions();
  }, [loadCategoryOptions]);

  useEffect(() => {
    retrieveIngredientSuggestions(currentIngredientInput.name);
  }, [currentIngredientInput.name, retrieveIngredientSuggestions]);

  // Render utilities
  const renderPageMetadata = () => (
    <MetaTags>
      <title>Create Recipe</title>
      <meta name="description" content="BiteSnap - Create Recipe" />
      <meta property="og:title" content="Create Recipe" />
    </MetaTags>
  );

  const renderIngredientSearchInterface = () => {
    if (!searchDropdownActive || ingredientSearchDatabase.length === 0) {
      return null;
    }

    return (
                <IngredientsSearch
        ingredients={ingredientSearchDatabase}
        onClick={(selectedOption) => {
          const { id, name, measurement_unit } = selectedOption;
          setCurrentIngredientInput(currentInput => ({
            ...currentInput,
            id,
            name,
            measurement_unit,
          }));
          setIngredientSearchDatabase([]);
          setSearchDropdownActive(false);
        }}
      />
    );
  };

  const renderCompiledIngredientsList = () => {
    if (compiledIngredientsList.length === 0) return null;

    return (
            <div className={styles.ingredientsAdded}>
        {compiledIngredientsList.map((ingredientEntry) => (
          <div 
            key={`ingredient-entry-${ingredientEntry.id}`} 
            className={styles.ingredientsAddedItem}
          >
                    <span className={styles.ingredientsAddedItemTitle}>
              {ingredientEntry.name}
                    </span>
            <span>, </span>
            <p className={styles.amountText}>amount </p>
                    <span>
              {ingredientEntry.amount}
              {ingredientEntry.measurement_unit}
            </span>
                    <span
                      className={styles.ingredientsAddedItemRemove}
              onClick={() => {
                const filteredList = compiledIngredientsList.filter(
                  item => item.id !== ingredientEntry.id
                );
                setCompiledIngredientsList(filteredList);
                      }}
                    >
                      <Icons.IngredientDelete />
                    </span>
          </div>
        ))}
                  </div>
                );
  };

  const renderIngredientManagementSection = () => (
    <div className={styles.ingredients}>
      <div className={styles.ingredientsInputs}>
        <Input
          label="Ingredients"
          className={styles.ingredientsNameInput}
          inputClassName={styles.ingredientsInput}
          placeholder="Start typing ingredient name"
          labelClassName={styles.ingredientsLabel}
          onChange={handleIngredientNameChange}
          onFocus={() => setSearchDropdownActive(true)}
          onBlur={() => setTimeout(() => setSearchDropdownActive(false), 200)}
          value={currentIngredientInput.name}
        />
        
        <div className={styles.ingredientsAmountInputContainer}>
          <Input
            className={styles.ingredientsAmountValue}
            inputClassName={styles.ingredientsInput}
            placeholder="1"
            onChange={handleIngredientQuantityChange}
            value={currentIngredientInput.amount}
          />
          <p className={styles.amountText}>amount </p>
          <div className={styles.measurementUnit}>
            {currentIngredientInput.measurement_unit}
          </div>
        </div>
      </div>

      {renderIngredientSearchInterface()}

      <div className={styles.ingredientAdd} onClick={() => {
        if (!performIngredientValidation()) return;
        setCompiledIngredientsList(existingList => [
          ...existingList, 
          currentIngredientInput
        ]);
        setCurrentIngredientInput({
          name: "",
          id: null,
          amount: "",
          measurement_unit: "",
        });
      }}>
        Add Ingredient
      </div>

      {ingredientEntryError && (
        <p className={cn(styles.error, styles.errorIngredient)}>
          {ingredientEntryError}
        </p>
      )}

      {renderCompiledIngredientsList()}
    </div>
  );

  const renderTimingInputSection = () => (
          <div className={styles.cookingTime}>
            <Input
        label="Cooking Time"
        onChange={(event) => {
          resetAllErrorStates();
          updateRecipeDataField('cookingDuration', event.target.value);
        }}
        value={recipeCreationData.cookingDuration}
              placeholder="0"
            />
      <div className={styles.cookingTimeUnit}>min</div>
          </div>
  );

  const renderRecipeCreationForm = () => (
    <Form className={styles.form} onSubmit={executeRecipeCreation}>
      <Input
        label="Recipe Name"
        onChange={(event) => {
          resetAllErrorStates();
          updateRecipeDataField('title', event.target.value);
        }}
        value={recipeCreationData.title}
        className={styles.mb36}
      />
      
      <CheckboxGroup
        label="Tags"
        values={categoryOptions}
        emptyText="No tags loaded"
        className={styles.checkboxGroup}
        labelClassName={styles.checkboxGroupLabel}
        tagsClassName={styles.checkboxGroupTags}
        checkboxClassName={styles.checkboxGroupItem}
        handleChange={adjustCategorySelection}
      />
      
      {renderIngredientManagementSection()}
      {renderTimingInputSection()}
      
          <Textarea
        label="Recipe Description"
        onChange={(event) => updateRecipeDataField('description', event.target.value)}
        placeholder="Describe the cooking steps"
      />
      
          <FileInput
        onChange={(uploadedFile) => updateRecipeDataField('recipeImage', uploadedFile)}
            fileTypes={["image/png", "image/jpeg"]}
            fileSize={5000}
            className={styles.fileInput}
        label="Upload Photo"
          />
      
          <Button modifier="style_dark" type="submit" className={styles.button}>
        Create Recipe
          </Button>
      
      {submissionValidationError.submitError && (
        <p className={styles.error}>{submissionValidationError.submitError}</p>
          )}
        </Form>
  );

  const pageMetadataConfig = useMemo(() => ({
    title: "Create Recipe",
    description: "BiteSnap - Create Recipe",
    ogTitle: "Create Recipe"
  }), []);

  return (
    <Main>
      <Container>
        <MetaTags>
          <title>{pageMetadataConfig.title}</title>
          <meta name="description" content={pageMetadataConfig.description} />
          <meta property="og:title" content={pageMetadataConfig.ogTitle} />
        </MetaTags>
        <Title title={pageMetadataConfig.title} />
        {renderRecipeCreationForm()}
      </Container>
    </Main>
  );
};

export default NewRecipeBuilder;