import cn from 'classnames'
import styles from './styles.module.css'

const Checkbox = ({
  onChange,
  className,
  value = false,
  name,
  id
}) => {
  const clickHandler = () => {
    onChange && onChange(id)
  }
  const classNames = cn(styles['checkbox-container'], className, {
    [styles['checkbox_active']]: value
  })

  return <div className={classNames} onClick={clickHandler}>
    {name}
  </div>
}


export default Checkbox