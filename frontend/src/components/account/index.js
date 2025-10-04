import styles from "./styles.module.css";
import { useContext, useEffect, useState } from "react";
import { LinkComponent } from "../index.js";
import { AuthContext, UserContext } from "../../contexts";
import { UserMenu } from "../../configs/navigation";
import Icons from "../icons";

const AccountData = ({ userContext }) => {
  return (
    <div className={styles.accountProfile}>
      <div className={styles.accountData}>
        <div className={styles.accountName}>
          {userContext.first_name} {userContext.last_name}
        </div>
        <div className={styles.accountEmail}>{userContext.email}</div>
      </div>
    </div>
  );
};

const Account = ({ onSignOut }) => {
  const authContext = useContext(AuthContext);
  const userContext = useContext(UserContext);


  if (!authContext) {
    return null;
  }

  return (
    <>
      <div className={styles.account}>
        <AccountData
          userContext={userContext}
        />

        <div className={styles.accountControls}>
          <ul className={styles.accountLinks}>
            {UserMenu.map((menuItem, index) => {
              return (
                <li key={menuItem.href || index} className={styles.accountLinkItem}>
                  <LinkComponent
                    className={styles.accountLink}
                    href={menuItem.href}
                    title={
                      <div className={styles.accountLinkTitle}>
                        <div className={styles.accountLinkIcon}>
                          {menuItem.icon}
                        </div>
                        {menuItem.title}
                      </div>
                    }
                  />
                </li>
              );
            })}
            <li className={styles.accountLinkItem} onClick={onSignOut}>
              <div className={styles.accountLinkIcon}>
                <Icons.LogoutMenu />
              </div>
              Sign Out
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default Account;
