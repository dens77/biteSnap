import styles from './style.module.css'
import { AccountMenu, Button, LinkComponent } from '../index.js'
import navigation from '../../configs/navigation'
import { useLocation } from 'react-router-dom'

const renderMenuItem = (loggedIn, item, pathname) => {
  if (!loggedIn && item.auth) return null;
  
  return (
    <li key={item.href} className={styles['nav-menu__item']}>
      {pathname === item.href ? (
        <Button
          href={item.href}
          modifier='style_dark'
          className={styles['nav-menu__button']}
        >
          {item.title}
        </Button>
      ) : (
        <LinkComponent
          title={item.title}
          href={item.href}
          exact
          className={styles['nav-menu__link']}
        />
      )}
    </li>
  );
};

const Nav = ({ loggedIn, onSignOut }) => {
  const location = useLocation();
  
  return (
    <div className={styles.nav}>
      <div className={styles.nav__container}>
        <ul className={styles['nav-menu']}>
          {navigation.map(item => renderMenuItem(loggedIn, item, location.pathname))}
        </ul>
        <AccountMenu onSignOut={onSignOut} />
      </div>
    </div>
  );
}

export default Nav
