import { ChangeEvent, useState } from 'react';

import classNames from 'classnames';

import styles from './Input.module.scss';
import Icon from '../icon/Icon';

interface IInputProps {
  id: string;
  label: string;
  name?: string;
  labelVisible?: string;
  icon?: 'letter' | 'lock' | 'show' | 'hide';
  email?: boolean;
  password?: boolean;
  placeholder?: string;
  readonly?: boolean;
  disabled?: boolean;
  value?: string;
  error?: { message: string };
  className?: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  [x: string]: any;
}

const Input = ({
  id,
  label,
  name = '',
  labelVisible,
  icon,
  email,
  password,
  placeholder = '',
  readOnly,
  disabled,
  value,
  error: errorProp,
  className = '',
  onChange,
  ...restProps
}: IInputProps) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
    onChange(event);
  };

  const checkType = () => {
    if (email) return 'email';
    if (password) return isPasswordVisible ? 'text' : 'password';

    return 'text';
  };

  const iconType = isPasswordVisible ? 'show' : 'hide';
  const iconLabel = `비밀번호 ${isPasswordVisible ? '표시' : '감춤'}`;

  return (
    <div className={classNames(styles.formControl, className)}>
      <label htmlFor={id} className={classNames(styles.label, labelVisible || styles.labelHidden)}>
        {label}
      </label>

      <div className={classNames(styles.inputWrapper, errorProp && styles.inputWrapperError)}>
        {icon ? <Icon type={icon} /> : null}

        <input
          type={checkType()}
          id={id}
          name={name}
          className={classNames(styles.input)}
          placeholder={placeholder}
          readOnly={readOnly}
          disabled={disabled}
          value={inputValue}
          onChange={handleChange}
          {...restProps}
        />

        {password ? (
          <button
            type="button"
            className={styles.button}
            onClick={() => setIsPasswordVisible((prev) => !prev)}
            disabled={disabled}
          >
            <Icon type={iconType} alt={iconLabel} title={iconLabel} />
          </button>
        ) : null}
      </div>
      {errorProp && (
        <span role="alert" className={styles.error}>
          {errorProp.message}
        </span>
      )}
    </div>
  );
};

export default Input;
