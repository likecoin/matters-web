import gql from 'graphql-tag'

export const ANNOUNCEMENTS_PUBLIC = gql`
  query AnnouncementsPublic {
    official {
      announcements(input: { visible: true }) {
        id
        title
        cover
        content
        link
        type
        visible
        createdAt
      }
    }
  }
`