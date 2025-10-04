import styles from "./style.module.css";
import { Tooltip } from "react-tooltip";
import { LinkComponent, Icons, Button, TagsContainer, Popup } from "../index";
import { AuthContext } from "../../contexts";
import { useContext, useState } from "react";
import cn from "classnames";

const Card = ({
  name = "Untitled Recipe",
  id,
  image,
  is_favorited,
  tags,
  cooking_time,
  author = {},
  handleLike,
}) => {
  const authContext = useContext(AuthContext);
  const [toLogin, setToLogin] = useState(false);
  const [whiteSpaceValue, setWhiteSpaceValue] = useState("nowrap");

  return (
    <div className={styles.card}>
      {toLogin && (
        <Popup
          title={
            <>
              <LinkComponent href="/signin" title="Sign in" /> or{" "}
              <LinkComponent href="/signup" title="sign up" /> to
              save recipe
            </>
          }
          onClose={() => {
            setToLogin(false);
          }}
        />
      )}
      <TagsContainer tags={tags} className={styles.card__tag} />

      <LinkComponent
        href={`/recipes/${id}`}
        title={
          <div
            className={styles.card__image}
            style={{ backgroundImage: `url(${image})` }}
          />
        }
      />
      <div className={styles.card__body}>
        <LinkComponent
          className={styles.card__title}
          href={`/recipes/${id}`}
          title={name}
          style={{ whiteSpace: whiteSpaceValue }}
          onMouseEnter={() => {
            setWhiteSpaceValue("normal");
          }}
          onMouseLeave={() => {
            setWhiteSpaceValue("nowrap");
          }}
        />
        <div className={styles.card__data}>
          <div className={styles.card__author}>
            <span className={styles.card__link}>
              {`${author.first_name} ${author.last_name}`}
            </span>
          </div>
          <div className={styles.card__time}>{cooking_time} min</div>
        </div>
        <div className={styles.card__controls}>
          <Button
            modifier="style_none"
            clickHandler={(_) => {
              if (!authContext) {
                return setToLogin(true);
              }
              handleLike({ id, toLike: Number(!is_favorited) });
            }}
            className={cn(styles["card__save-button"], {
              [styles["card__save-button_active"]]: is_favorited,
            })}
            data-tooltip-id={id}
            data-tooltip-content={
              is_favorited ? "Remove from Favorites" : "Add to Favorites"
            }
            data-tooltip-place="bottom"
          >
            <Icons.LikeIcon />
          </Button>
          <Tooltip id={id.toString()} />
        </div>
      </div>
    </div>
  );
};

export default Card;
