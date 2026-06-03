export interface IButtonProps {
  /**
   * test props
   */
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  size?: 'small' | 'middle' | 'large';
  type?: 'primary' | 'text' | 'default';
  htmlType?: 'button' | 'submit' | 'reset';
}
