import Icons from "../components/icons"

export default [
  {
    title: 'Recipes',
    href: '/recipes',
    auth: false
  }, {
    title: 'Create Recipe',
    href: '/recipes/create',
    auth: true
  }
]

export const UserMenu = [
  {
    title: 'Favorites',
    href: '/favorites',
    auth: true,
    icon: <Icons.SavedMenu />
  }, {
    
    title: 'Change Password',
    href: '/change-password',
    auth: true,
    icon: <Icons.ResetPasswordMenu />
  }
]

export const NotLoggedInMenu = [
  {
    title: 'Sign In',
    href: '/signin',
    auth: false
  }, {
    title: 'Sign Up',
    href: '/signup',
    auth: false
  }
]
