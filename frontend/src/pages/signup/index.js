import React, { useContext, useState, useCallback } from "react";
import { Redirect } from "react-router-dom";
import MetaTags from "react-meta-tags";

import {
  Container, Input, FormTitle, Main, Form, Button
} from "../../components";
import { useFormWithValidation } from "../../utils";
import { AuthContext } from "../../contexts";
import styles from "./styles.module.css";

const UserRegistration = ({ onSignUp, submitError, setSubmitError }) => {
  const { 
    values: registrationData, 
    handleChange: updateFormField, 
    errors: fieldErrors 
  } = useFormWithValidation();
  
  const authenticationStatus = useContext(AuthContext);

  const resetErrorState = useCallback(() => {
    setSubmitError({ submitError: "" });
  }, [setSubmitError]);

  const handleFieldUpdate = useCallback((event) => {
    resetErrorState();
    updateFormField(event);
  }, [resetErrorState, updateFormField]);

  const handleRegistrationSubmit = useCallback((event) => {
    event.preventDefault();
    onSignUp(registrationData);
  }, [registrationData, onSignUp]);

  const userInputFields = [
    { name: "first_name", placeholder: "First Name" },
    { name: "last_name", placeholder: "Last Name" },
    { name: "username", placeholder: "Username" },
    { name: "email", placeholder: "Email Address" },
    { name: "password", placeholder: "Password", type: "password" }
  ];

  const renderFormField = ({ name, placeholder, type = "text" }) => (
    <Input
      key={name}
      placeholder={placeholder}
      name={name}
      type={type}
      required
      isAuth={true}
      error={fieldErrors}
      submitError={name === "password" ? submitError : undefined}
      onChange={handleFieldUpdate}
    />
  );

  const renderRegistrationForm = () => (
    <Form className={styles.form} onSubmit={handleRegistrationSubmit}>
      <FormTitle>Sign Up</FormTitle>
      {userInputFields.map(renderFormField)}
      <Button modifier="style_dark" type="submit" className={styles.button}>
        Create Account
      </Button>
    </Form>
  );

  const pageMetadata = {
    title: "Sign Up",
    description: "BiteSnap - Sign Up",
    ogTitle: "Sign Up"
  };

  return authenticationStatus ? (
    <Redirect to="/recipes" />
  ) : (
    <Main withBG asFlex>
      <Container className={styles.center}>
        <MetaTags>
          <title>{pageMetadata.title}</title>
          <meta name="description" content={pageMetadata.description} />
          <meta property="og:title" content={pageMetadata.ogTitle} />
        </MetaTags>
        {renderRegistrationForm()}
      </Container>
    </Main>
  );
};

export default UserRegistration;