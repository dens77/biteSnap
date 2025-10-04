import React, { useContext, useCallback } from "react";
import { Redirect } from "react-router-dom";
import MetaTags from "react-meta-tags";

import { 
  Container, Input, Main, Form, Button, FormTitle 
} from "../../components";
import { useFormWithValidation } from "../../utils";
import { AuthContext } from "../../contexts";
import styles from "./styles.module.css";

const Authentication = ({ onSignIn, submitError, setSubmitError }) => {
  const { values: formData, handleChange: updateField, errors: validationErrors } = useFormWithValidation();
  const isUserLoggedIn = useContext(AuthContext);

  const clearErrorsOnInput = useCallback((event) => {
    setSubmitError({ submitError: "" });
    updateField(event);
  }, [setSubmitError, updateField]);

  const processAuthenticationRequest = useCallback((event) => {
    event.preventDefault();
    onSignIn(formData);
  }, [formData, onSignIn]);

  const renderPageHeader = () => (
    <MetaTags>
      <title>Sign In</title>
      <meta name="description" content="BiteSnap - Sign In" />
      <meta property="og:title" content="Sign In" />
    </MetaTags>
  );

  const renderAuthenticationForm = () => (
    <Form className={styles.form} onSubmit={processAuthenticationRequest}>
      <FormTitle>Sign In</FormTitle>
      
      <Input
        required
        isAuth={true}
        name="email"
        placeholder="Email"
        onChange={clearErrorsOnInput}
        error={validationErrors}
      />
      
      <Input
        required
        isAuth={true}
        type="password"
        name="password"
        placeholder="Password"
        error={validationErrors}
        submitError={submitError}
        onChange={clearErrorsOnInput}
      />
      
      <Button modifier="style_dark" type="submit" className={styles.button}>
        Sign In
      </Button>
    </Form>
  );

  if (isUserLoggedIn) {
    return <Redirect to="/recipes" />;
  }

  return (
    <Main withBG asFlex>
      <Container className={styles.center}>
        {renderPageHeader()}
        {renderAuthenticationForm()}
      </Container>
    </Main>
  );
};

export default Authentication;