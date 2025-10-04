import { Tooltip } from "react-tooltip";
import {
  Container,
  Main,
  Button,
  TagsContainer,
  Icons,
  LinkComponent,
} from "../../components";
import { UserContext, AuthContext } from "../../contexts";
import { useContext, useState, useEffect } from "react";
import styles from "./styles.module.css";
import Ingredients from "./ingredients";
import Description from "./description";
import cn from "classnames";
import { useRouteMatch, useParams, useHistory } from "react-router-dom";
import MetaTags from "react-meta-tags";
import { useRecipe } from "../../utils/index.js";
import api from "../../api";

const SingleCard = ({ loadItem }) => {
  const { recipe, setRecipe, handleLike } =
    useRecipe();
  const authContext = useContext(AuthContext);
  const userContext = useContext(UserContext);
  const { id } = useParams();
  const history = useHistory();



  useEffect((_) => {
    api
      .getRecipe({
        recipe_id: id,
      })
      .then((res) => {
        setRecipe(res);
      })
      .catch((err) => {
        console.error('Recipe error:', err);
        history.push("/recipes");
      });
  }, []);

  const { url } = useRouteMatch();
  const {
    author = {},
    image,
    tags,
    cooking_time,
    name,
    ingredients,
    text,
    is_favorited,
  } = recipe;

  return (
    <Main>
      <Container>
        <MetaTags>
          <title>{name}</title>
          <meta name="description" content={`BiteSnap - ${name}`} />
          <meta property="og:title" content={name} />
        </MetaTags>
        <div className={styles["single-card"]}>
          <img
            src={image}
            alt={name}
            className={styles["single-card__image"]}
          />
          <div className={styles["single-card__info"]}>
            <div className={styles["single-card__header-info"]}>
              <h1 className={styles["single-card__title"]}>{name}</h1>
              <div className={styles.btnsBox}>
                {authContext && (
                  <>
                    <Button
                      modifier="style_none"
                      clickHandler={(_) => {
                        handleLike({ id, toLike: Number(!is_favorited) });
                      }}
                      className={cn(styles["single-card__save-button"], {
                        [styles["single-card__save-button_active"]]:
                          is_favorited,
                      })}
                      data-tooltip-id="tooltip-save"
                      data-tooltip-content={
                        is_favorited
                          ? "Remove from Favorites"
                          : "Add to Favorites"
                      }
                      data-tooltip-place="bottom"
                    >
                      <Icons.LikeIcon />
                    </Button>
                    <Tooltip id="tooltip-save" />
                  </>
                )}
              </div>
            </div>

            <div className={styles["single-card__extra-info"]}>
              <TagsContainer tags={tags} />
              <p className={styles["single-card__text"]}>{cooking_time} min</p>
              <p className={styles["single-card__text_with_link"]}>
                <div className={styles["single-card__text"]}>
                  <span className={styles["single-card__link"]}>
                    {`${author.first_name} ${author.last_name}`}
                  </span>
                </div>
              </p>
            </div>
            <div className={styles["single-card__buttons"]}>
              {authContext && (userContext || {}).id === author.id && (
                <Button
                  clickHandler={() => history.push(`${url}/edit`)}
                  className={styles["single-card__edit"]}
                >
                  Edit Recipe
                </Button>
              )}
            </div>
            <Ingredients ingredients={ingredients} />
            <Description description={text} />
          </div>
        </div>
      </Container>
    </Main>
  );
};

export default SingleCard;
