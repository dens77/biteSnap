import React, { useContext, useCallback, useMemo } from "react";
import MetaTags from "react-meta-tags";

import {
  Container, Input, FormTitle, Main, Form, Button
} from "../../components";
import { useFormWithValidation } from "../../utils";
import { AuthContext } from "../../contexts";
import styles from "./styles.module.css";

const PasswordUpdatePage = ({ onPasswordChange, submitError, setSubmitError }) => {
  const { 
    values: passwordFormData, 
    handleChange: updatePasswordField, 
    errors: validationResults,
    isValid: formIsValid,
    resetForm: clearForm 
  } = useFormWithValidation();
  
  const userAuthenticationStatus = useContext(AuthContext);

  const handleInputUpdate = useCallback((event) => {
    setSubmitError({ submitError: "" });
    updatePasswordField(event);
  }, [setSubmitError, updatePasswordField]);

  const processPasswordUpdate = useCallback((event) => {
    event.preventDefault();
    onPasswordChange(passwordFormData);
  }, [passwordFormData, onPasswordChange]);

  const passwordRequirements = useMemo(() => [
    "• Your password should not match your name or other personal information",
    "• Your password must contain at least 8 characters",
    "• Your password cannot be one of the commonly used passwords",
    "• Your password cannot consist only of numbers"
  ], []);

  const passwordFields = useMemo(() => [
    {
      name: "current_password",
      placeholder: "Current Password",
      type: "password"
    },
    {
      name: "new_password", 
      placeholder: "New Password",
      type: "password"
    },
    {
      name: "repeat_password",
      placeholder: "Confirm New Password", 
      type: "password"
    }
  ], []);

  const renderPasswordRequirements = () => (
    <ul className={styles.texts}>
      {passwordRequirements.map((requirement, index) => (
        <li key={`requirement-${index}`} className={styles.text}>
          <span>{requirement}</span>
        </li>
      ))}
    </ul>
  );

  const renderPasswordField = ({ name, placeholder, type }) => (
    <Input
      key={name}
      required
      isAuth={true}
      placeholder={placeholder}
      type={type}
      name={name}
      error={validationResults}
      submitError={name === "repeat_password" ? submitError : undefined}
      onChange={handleInputUpdate}
    />
  );

  const renderPasswordForm = () => (
    <Form className={styles.form} onSubmit={processPasswordUpdate}>
      <FormTitle>Change Password</FormTitle>
      
      {passwordFields.map(renderPasswordField)}
      {renderPasswordRequirements()}
      
      <Button modifier="style_dark" type="submit" className={styles.button}>
        Change Password
      </Button>
    </Form>
  );

  const pageMetadata = {
    title: "Change Password",
    description: "BiteSnap - Change Password",
    ogTitle: "Change Password"
  };

  return (
    <Main withBG asFlex>
      <Container className={styles.center}>
        <MetaTags>
          <title>{pageMetadata.title}</title>
          <meta name="description" content={pageMetadata.description} />
          <meta property="og:title" content={pageMetadata.ogTitle} />
        </MetaTags>
        {renderPasswordForm()}
      </Container>
    </Main>
  );
};

export default PasswordUpdatePage;