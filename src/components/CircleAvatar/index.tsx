import classNames from 'classnames'
// import gql from 'graphql-tag'

import { Img } from '~/components'

import ICON_CIRCLE_AVATAR_DEFAULT from '@/public/static/icons/72px/circle-avatar-default.svg'

import styles from './styles.css'

// import { CircleUser } from './__generated__/CircleUser'

export type CircleAvatarSize = 'xl' | 'xxl'

export interface CircleAvatarProps {
  // circle?: CircleUser
  circle?: any
  size?: CircleAvatarSize
  src?: string
  inEditor?: boolean
}

// const fragments = {
//   circle: gql`
//     fragment CircleUser on Circle {
//       avatar
//     }
//   `,
// }

export const CircleAvatar = (props: CircleAvatarProps) => {
  const { circle, size = 'xl', src, inEditor } = props
  const source = src || circle?.avatar || ICON_CIRCLE_AVATAR_DEFAULT
  const isFallback =
    (!src && !circle?.avatar) || source.indexOf('data:image') >= 0
  const avatarClasses = classNames({
    avatar: true,
    [size]: true,
  })

  return (
    <div className={avatarClasses}>
      <Img url={source} size="144w" disabled={isFallback || inEditor} />

      <style jsx>{styles}</style>
    </div>
  )
}

// CircleAvatar.fragments = fragments