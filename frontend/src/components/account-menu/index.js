import styles from './styles.module.css'
import { useContext } from 'react'
import { LinkComponent, Account, Button } from '../index.js'
import { AuthContext } from '../../contexts'
import { useLocation } from 'react-router-dom'
import { NotLoggedInMenu } from '../../configs/navigation'

const AccountMenu = ({ onSignOut }) => {
  const authContext = useContext(AuthContext)
  const location = useLocation()
  if (!authContext) {
    return <div className={styles.menu}>
      {NotLoggedInMenu.map((item, index) => {
        return location.pathname === item.href ? <Button
          key={item.href || index}
          href={item.href}
          modifier='style_dark'
          className={styles.menuButton}
        >
          {item.title}
        </Button> : <LinkComponent
          key={item.href || index}
          title={item.title}
          href={item.href}
          exact
          className={styles.menuLink}
        />
      })}
    </div>
  }
  return <div className={styles.menu}>
    <Account onSignOut={onSignOut} />
  </div>
}


export default AccountMenu