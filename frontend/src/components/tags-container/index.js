import styles from './styles.module.css'
import cn from 'classnames'

const Tag = ({ name }) => (
  <div className={styles.tag}>
    {name}
  </div>
);

const TagsContainer = ({ tags, className }) => {
  if (!tags) { return null }
  
  return (
    <div className={cn(styles['tags-container'], className)}>
      {tags.map(tag => (
        <Tag key={tag.id} name={tag.name} />
      ))}
    </div>
  );
}

export default TagsContainer
