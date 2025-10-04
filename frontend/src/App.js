import "./fonts/SanFranciscoProDisplay/fonts.css";
import "./App.css";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Switch, Route, useHistory, Redirect } from "react-router-dom";

import { Header, ProtectedRoute } from "./components";
import api from "./api";
import { AuthContext, UserContext } from "./contexts";

import {
  RecipeHomepage,
  Authentication, 
  FavoriteRecipesPage,
  SingleCard,
  UserRegistration,
  RecipeModificationInterface,
  NewRecipeBuilder,
  PasswordUpdatePage,
  PasswordResetHandler,
} from "./pages";

const BitesnapApplication = () => {
  const [authenticationState, setAuthenticationState] = useState(null);
  const [currentUserData, setCurrentUserData] = useState({});
  const [loginErrorState, setLoginErrorState] = useState({ submitError: "" });
  const [signupErrorState, setSignupErrorState] = useState({ submitError: "" });
  const [passwordChangeErrorState, setPasswordChangeErrorState] = useState({
    submitError: "",
  });

  const navigationHistory = useHistory();

  const handleUserRegistration = useCallback(async (registrationData) => {
    const { email, password, username, first_name, last_name } = registrationData;
    
    try {
      await api.signup({ email, password, username, first_name, last_name });
      navigationHistory.push("/signin");
    } catch (error) {
      const errorMessages = Object.values(error);
      if (errorMessages.length > 0) {
        setSignupErrorState({ submitError: errorMessages.join(", ") });
      }
      setAuthenticationState(false);
    }
  }, [navigationHistory]);

  const executePasswordChange = useCallback(async (passwordData) => {
    const { new_password, current_password } = passwordData;
    
    try {
      await api.changePassword({ new_password, current_password });
      navigationHistory.push("/signin");
    } catch (error) {
      const errorMessages = Object.values(error);
      if (errorMessages.length > 0) {
        setPasswordChangeErrorState({ submitError: errorMessages.join(", ") });
      }
    }
  }, [navigationHistory]);

  const processUserAuthentication = useCallback(async (credentials) => {
    const { email, password } = credentials;
    
    try {
      const authResponse = await api.signin({ email, password });
      
      if (authResponse.auth_token) {
        localStorage.setItem("token", authResponse.auth_token);
        
        try {
          const userData = await api.getUserData();
          setCurrentUserData(userData);
          setAuthenticationState(true);
        } catch (userError) {
          setAuthenticationState(false);
          navigationHistory.push("/signin");
        }
      } else {
        setAuthenticationState(false);
      }
    } catch (authError) {
      const errorMessages = Object.values(authError);
      if (errorMessages.length > 0) {
        setLoginErrorState({ submitError: errorMessages.join(", ") });
      }
      setAuthenticationState(false);
    }
  }, [navigationHistory]);

  // Password reset functionality
  const initiatePasswordReset = useCallback(async (resetData) => {
    const { email } = resetData;
    
    try {
      await api.resetPassword({ email });
      navigationHistory.push("/signin");
    } catch (error) {
      const errorMessages = Object.values(error);
      if (errorMessages.length > 0) {
        alert(errorMessages.join(", "));
      }
      setAuthenticationState(false);
    }
  }, [navigationHistory]);

  const handleUserSignout = useCallback(async () => {
    try {
      await api.signout();
      localStorage.removeItem("token");
      setAuthenticationState(false);
    } catch (error) {
      const errorMessages = Object.values(error);
      if (errorMessages.length > 0) {
        alert(errorMessages.join(", "));
      }
    }
  }, []);

  // Item loading simulation
  const simulateItemLoading = useCallback(({ id, callback }) => {
    setTimeout(() => callback(), 3000);
  }, []);

  // Token verification on app mount
  const verifyExistingAuthentication = useCallback(async () => {
    const existingToken = localStorage.getItem("token");
    
    if (existingToken) {
      try {
        const userData = await api.getUserData();
        setCurrentUserData(userData);
        setAuthenticationState(true);
      } catch (error) {
        setAuthenticationState(false);
        navigationHistory.push("/recipes");
      }
    } else {
      setAuthenticationState(false);
    }
  }, [navigationHistory]);

  useEffect(() => {
    verifyExistingAuthentication();
  }, [verifyExistingAuthentication]);

  // Memoized route configurations
  const protectedRouteConfigurations = useMemo(() => [
    {
      path: "/favorites",
      component: FavoriteRecipesPage,
      exact: true
    },
    {
      path: "/recipes/create",
      component: NewRecipeBuilder,
      exact: true
    },
    {
      path: "/recipes/:id/edit",
      component: RecipeModificationInterface,
      exact: true,
      additionalProps: { loadItem: simulateItemLoading }
    },
    {
      path: "/change-password",
      component: PasswordUpdatePage,
      exact: true,
      additionalProps: {
        submitError: passwordChangeErrorState,
        setSubmitError: setPasswordChangeErrorState,
        onPasswordChange: executePasswordChange
      }
    }
  ], [simulateItemLoading, passwordChangeErrorState, executePasswordChange]);

  const publicRouteConfigurations = useMemo(() => [
    {
      path: "/recipes/:id",
      component: SingleCard,
      exact: true,
      props: { 
        loggedIn: authenticationState, 
        loadItem: simulateItemLoading 
      }
    },
    {
      path: "/reset-password",
      component: PasswordResetHandler,
      exact: true,
      props: { onPasswordReset: initiatePasswordReset }
    },
    {
      path: "/recipes",
      component: RecipeHomepage,
      exact: true
    },
    {
      path: "/signin",
      component: Authentication,
      exact: true,
      props: {
        onSignIn: processUserAuthentication,
        submitError: loginErrorState,
        setSubmitError: setLoginErrorState
      }
    },
    {
      path: "/signup",
      component: UserRegistration,
      exact: true,
      props: {
        onSignUp: handleUserRegistration,
        submitError: signupErrorState,
        setSubmitError: setSignupErrorState
      }
    }
  ], [
    authenticationState,
    simulateItemLoading,
    initiatePasswordReset,
    processUserAuthentication,
    loginErrorState,
    setLoginErrorState,
    handleUserRegistration,
    signupErrorState,
    setSignupErrorState
  ]);

  // Render protected routes dynamically
  const renderProtectedRoutes = () => 
    protectedRouteConfigurations.map(({ path, component, exact, additionalProps = {} }) => (
      <ProtectedRoute
        key={path}
        exact={exact}
        path={path}
        component={component}
        loggedIn={authenticationState}
        {...additionalProps}
      />
    ));

  // Render public routes dynamically
  const renderPublicRoutes = () =>
    publicRouteConfigurations.map(({ path, component: RouteComponent, exact, props = {} }) => (
      <Route key={path} exact={exact} path={path}>
        <RouteComponent {...props} />
      </Route>
    ));

  const applicationContent = useMemo(() => (
    <div className="App">
      <Header loggedIn={authenticationState} onSignOut={handleUserSignout} />
      <Switch>
        {renderProtectedRoutes()}
        {renderPublicRoutes()}
        <Route exact path="/">
          <Redirect to="/recipes" />
        </Route>
        <Route path="*">
          <Redirect to="/recipes" />
        </Route>
      </Switch>
    </div>
  ), [authenticationState, handleUserSignout]);

  return (
    <AuthContext.Provider value={authenticationState}>
      <UserContext.Provider value={currentUserData}>
        {applicationContent}
      </UserContext.Provider>
    </AuthContext.Provider>
  );
};

export default BitesnapApplication;