import classNames from 'classnames';

import styles from './Button.module.scss';

interface IButtonProps {
  type?: 'submit' | 'button' | 'reset' | undefined;
  secondary?: boolean;
  bgColor?: string;
  fgColor?: string;
  width?: string;
  className?: string;
  [x: string]: any;
}

const Button = ({
  type = 'button',
  secondary = false,
  bgColor,
  fgColor,
  width,
  ...restProps
}: IButtonProps) => {
  const style = {
    backgroundColor: bgColor || '',
    color: fgColor || '',
    width: width || '',
  };

  const composeClasses = classNames(styles.button, secondary ? styles.secondary : styles.primary);

  return <button className={composeClasses} type={type} style={style} {...restProps} />;
};

export default Button;
