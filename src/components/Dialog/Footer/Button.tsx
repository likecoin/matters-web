import { Button, ButtonProps, Icon, TextIcon } from '~/components'

type DialogButtonProps = {
  textColor?: 'black' | 'white'
  bgColor?: 'green' | 'grey-lighter'

  loading?: boolean
} & ButtonProps

const DialogButton: React.FC<DialogButtonProps> = ({
  loading,
  textColor = 'white',
  bgColor = 'green',

  disabled,
  children,
  ...restProps
}) => (
  <Button
    bgColor={bgColor}
    size={['100%', '3rem']}
    disabled={disabled || loading}
    {...restProps}
  >
    <TextIcon
      icon={loading && <Icon.Spinner size="md" />}
      color={textColor}
      size="md"
      weight="md"
    >
      {loading ? null : children}
    </TextIcon>
  </Button>
)

export default DialogButton
