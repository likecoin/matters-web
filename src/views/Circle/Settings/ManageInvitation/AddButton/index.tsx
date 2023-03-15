import { FormattedMessage } from 'react-intl'

import { Button, TextIcon } from '~/components'

import AddInvitationDialog from '../AddInvitationDialog'

/**
 * This button component is for adding new circle invitations.
 *
 * Usage:
 *
 * ```tsx
 *   <CircleInvitationAddButton />
 * ```
 */
const CircleInvitationAddButton = () => {
  return (
    <AddInvitationDialog>
      {({ openDialog }) => (
        <Button
          size={['6rem', '2rem']}
          bgActiveColor="grey-lighter"
          onClick={openDialog}
          aria-haspopup="dialog"
        >
          <TextIcon color="green" size="md" weight="md">
            <FormattedMessage
              defaultMessage="Add Invitation"
              description="src/views/Circle/Settings/ManageInvitation/AddButton/index.tsx"
            />
          </TextIcon>
        </Button>
      )}
    </AddInvitationDialog>
  )
}

export default CircleInvitationAddButton
