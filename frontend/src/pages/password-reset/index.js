import React, { useCallback } from 'react';
import MetaTags from 'react-meta-tags';

import { 
  Container, Input, FormTitle, Main, Form, Button 
} from '../../components';
import { useFormWithValidation } from '../../utils';
import styles from './styles.module.css';

const PasswordResetHandler = ({ onPasswordReset }) => {
  const { 
    values: resetFormData, 
    handleChange: updateResetField, 
    errors: inputErrors, 
    isValid: canSubmitForm 
  } = useFormWithValidation();

  const executePasswordReset = useCallback((event) => {
    event.preventDefault();
    onPasswordReset(resetFormData);
  }, [resetFormData, onPasswordReset]);

  const renderResetForm = () => (
    <Form className={styles.form} onSubmit={executePasswordReset}>
      <FormTitle>Reset Password</FormTitle>
      <Input
        required
        isAuth={true}
        placeholder="Email"
        name="email"
        onChange={updateResetField}
        error={inputErrors}
      />
      <Button 
        modifier='style_dark'
        disabled={!canSubmitForm}
        type='submit'
        className={styles.button}
      >
        Reset
      </Button>
    </Form>
  );

  const pageConfiguration = {
    title: "Reset Password",
    description: "BiteSnap - Reset Password", 
    ogTitle: "Reset Password"
  };

  return (
    <Main withBG asFlex>
      <Container className={styles.center}>
        <MetaTags>
          <title>{pageConfiguration.title}</title>
          <meta name="description" content={pageConfiguration.description} />
          <meta property="og:title" content={pageConfiguration.ogTitle} />
        </MetaTags>
        {renderResetForm()}
      </Container>
    </Main>
  );
};

export default PasswordResetHandler;