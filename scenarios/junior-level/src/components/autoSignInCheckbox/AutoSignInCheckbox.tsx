import { ChangeEvent } from 'react';

import Checkbox from '../checkbox/Checkbox';
import Tooltip from '../tooltip/Tooltip';
import styles from './AutoSignInCheckbox.module.scss';

interface IAuthSignInCheckboxProps {
  label?: string;
  checked: boolean;
  disabled?: boolean;
  orientation?: 'top' | 'bottom' | 'left' | 'right';
  message?: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  [x: string]: any;
}

const AutoSignInCheckbox = ({
  label = '자동 로그인',
  checked,
  disabled,
  orientation = 'top',
  message = '개인 정보 보호를 위해 본인 기기에서만 이용해주세요',
  onChange,
  ...restProps
}: IAuthSignInCheckboxProps) => {
  return (
    <div className={styles.wrapper}>
      <Checkbox
        label={label}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        {...restProps}
      />

      {checked && <Tooltip left={-5} top={24} orientation={orientation} message={message} />}
    </div>
  );
};

export default AutoSignInCheckbox;
