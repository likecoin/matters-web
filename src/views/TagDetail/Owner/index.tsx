import { useContext } from 'react'
import { FormattedMessage } from 'react-intl'

import {
  Button,
  IconAvatarEmpty24,
  TagAdoptionDialog,
  TextIcon,
  toast,
  UserDigest,
  ViewerContext,
} from '~/components'
import { TagFragmentFragment } from '~/gql/graphql'

import styles from './styles.module.css'

const Owner = ({ tag }: { tag: TagFragmentFragment }) => {
  const viewer = useContext(ViewerContext)

  const forbid = () => {
    toast.error({
      message: (
        <FormattedMessage defaultMessage="You do not have permission to perform this operation" />
      ),
    })
  }

  if (!tag) {
    return null
  }

  if (!tag.owner) {
    return (
      <section className={styles.container}>
        <section className={styles.left}>
          <TextIcon
            icon={<IconAvatarEmpty24 size="md" />}
            color="greyDark"
            size="mdS"
            spacing="xtight"
          >
            <FormattedMessage
              defaultMessage="This tag has no manager currently"
              description="src/views/TagDetail/Owner/index.tsx"
            />
          </TextIcon>
        </section>
        <section className={styles.right}>
          <TagAdoptionDialog id={tag.id}>
            {({ openDialog }) => (
              <Button
                spacing={['xtight', 'tight']}
                textColor="green"
                textActiveColor="white"
                bgActiveColor="green"
                borderColor="green"
                onClick={viewer.isFrozen ? forbid : openDialog}
                aria-haspopup="dialog"
              >
                <TextIcon weight="md" size="xs">
                  <FormattedMessage
                    defaultMessage="Maintain Tag"
                    description="src/views/TagDetail/Owner/index.tsx"
                  />
                </TextIcon>
              </Button>
            )}
          </TagAdoptionDialog>
        </section>
      </section>
    )
  }

  return (
    <section className={styles.container}>
      <section className={styles.left}>
        <UserDigest.Mini
          user={tag.owner}
          avatarSize="md"
          hasAvatar
          hasDisplayName
        />

        <TextIcon size="sm" color="greyDark">
          <FormattedMessage
            defaultMessage="Maintain"
            description="src/views/TagDetail/Owner/index.tsx"
          />
        </TextIcon>
      </section>
      <section className={styles.right}>{/* editos */}</section>
    </section>
  )
}

export default Owner
