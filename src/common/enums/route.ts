import { NextFunction, Request, Response } from 'express'
import fetch from 'isomorphic-unfetch'
import _get from 'lodash/get'
import getConfig from 'next/config'

/**
 * Route paths for Next.js custom routing
 *
 * Note: path order is matters
 *
 * Test route at https://forbeslindesay.github.io/express-route-tester/
 */
type ROUTE_KEY =
  | 'HOME'
  | 'FOLLOW'
  | 'AUTHORS'
  | 'TOPICS'
  | 'ICYMI'
  | 'SEARCH'
  | 'TAGS'
  | 'TAG_DETAIL'
  | 'USER_ARTICLES'
  | 'USER_COMMENTS'
  | 'USER_FOLLOWERS'
  | 'USER_FOLLOWEES'
  | 'ARTICLE_DETAIL'
  | 'ARTICLE_DETAIL_LEGACY'
  | 'ME_DRAFTS'
  | 'ME_BOOKMARKS'
  | 'ME_HISTORY'
  | 'ME_APPRECIATIONS_SENT'
  | 'ME_APPRECIATIONS_RECEIVED'
  | 'ME_NOTIFICATIONS'
  | 'ME_SETTINGS'
  | 'ME_SETTINGS_CHANGE_USERNAME'
  | 'ME_SETTINGS_CHANGE_EMAIL'
  | 'ME_SETTINGS_CHANGE_PASSWORD'
  | 'ME_SETTINGS_NOTIFICATION'
  | 'ME_SETTINGS_BLOCKED'
  | 'ME_DRAFT_DETAIL'
  | 'RECOMMENDATION'
  // | 'EDITOR'
  | 'AUTH_LOGIN'
  | 'AUTH_SIGNUP'
  | 'AUTH_FORGET'
  | 'OAUTH_AUTHORIZE'
  | 'OAUTH_CALLBACK_SUCCESS'
  | 'OAUTH_CALLBACK_FAILURE'
  | 'HELP'
  | 'MIGRATION'
  | 'ABOUT'
  | 'GUIDE'
  | 'COMMUNITY'
  | 'TOS'

export const ROUTES: Array<{
  key: ROUTE_KEY
  href: string
  as: string
  handler?: (req: Request, res: Response, next: NextFunction) => any
  regexp: RegExp
}> = [
  {
    key: 'HOME',
    href: '/Home',
    as: '/',
    regexp: /^\/?$/i,
  },
  {
    key: 'FOLLOW',
    href: '/Follow',
    as: '/follow',
    regexp: /^\/follow\/?$/i,
  },
  {
    key: 'AUTHORS',
    href: '/Authors',
    as: '/authors',
    regexp: /^\/authors\/?$/i,
  },
  {
    key: 'TOPICS',
    href: '/Topics',
    as: '/topics',
    regexp: /^\/topics\/?$/i,
  },
  {
    key: 'ICYMI',
    href: '/Icymi',
    as: 'icymi',
    regexp: /^\/icymi\/?$/i,
  },
  {
    key: 'SEARCH',
    href: '/Search',
    as: '/search',
    regexp: /^\/search\/?$/i,
  },
  // experient page for recommendation engine testing
  {
    key: 'RECOMMENDATION',
    href: '/Recommendation',
    as: '/recommendation',
    regexp: /^\/recommendation\/?$/i,
  },

  // Tag
  {
    key: 'TAGS',
    href: '/Tags',
    as: '/tags',
    regexp: /^\/tags\/?$/i,
  },
  {
    key: 'TAG_DETAIL',
    href: '/TagDetail',
    as: '/tags/:id',
    regexp: /^\/tags\/(?:([^\/]+?))\/?$/i,
  },

  // User
  {
    key: 'USER_ARTICLES',
    href: '/UserArticles',
    as: '/@:userName',
    regexp: /^\/@(?:([^\/]+?))\/?$/i,
  },
  {
    key: 'USER_COMMENTS',
    href: '/UserComments',
    as: '/@:userName/comments',
    regexp: /^\/@(?:([^\/]+?))\/comments\/?$/i,
  },
  {
    key: 'USER_FOLLOWERS',
    href: '/UserFollowers',
    as: '/@:userName/followers',
    regexp: /^\/@(?:([^\/]+?))\/followers\/?$/i,
  },
  {
    key: 'USER_FOLLOWEES',
    href: '/UserFollowees',
    as: '/@:userName/followees',
    regexp: /^\/@(?:([^\/]+?))\/followees\/?$/i,
  },

  // Article
  {
    key: 'ARTICLE_DETAIL',
    href: '/ArticleDetail',
    as: '/@:userName/*-:mediaHash',
    regexp: /^\/@(?:([^\/]+?))\/(.*)-(?:([^\/]+?))\/?$/i,
  },
  {
    key: 'ARTICLE_DETAIL_LEGACY',
    href: '/ArticleDetail',
    as: '/forum',
    regexp: /^\/forum\/?$/i,
    handler: async (req, res) => {
      if (!req.query || !req.query.post) {
        return res.redirect(302, '/')
      }

      const {
        publicRuntimeConfig: { API_URL },
      } = getConfig()

      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: `
              {
                article(input: { uuid: "${req.query.post}" }) {
                  slug
                  mediaHash
                  author {
                    userName
                  }
                }
              }
            `,
          }),
        })
        const data = await response.json()
        const slug = _get(data, 'data.article.slug')
        const mediaHash = _get(data, 'data.article.mediaHash')
        const userName = _get(data, 'data.article.author.userName')

        if (mediaHash && userName) {
          return res.redirect(301, `/@${userName}/${slug}-${mediaHash}`)
        } else {
          return res.redirect(302, '/')
        }
      } catch (e) {
        console.error(e)
        return res.redirect(302, '/')
      }
    },
  },

  // Me
  {
    key: 'ME_DRAFTS',
    href: '/MeDrafts',
    as: '/me/drafts',
    regexp: /^\/?$/i,
  },
  {
    key: 'ME_BOOKMARKS',
    href: '/MeBookmarks',
    as: '/me/bookmarks',
    regexp: /^\/me\/bookmarks\/?$/i,
  },
  {
    key: 'ME_HISTORY',
    href: '/MeHistory',
    as: '/me/history',
    regexp: /^\/me\/history\/?$/i,
  },
  {
    key: 'ME_APPRECIATIONS_SENT',
    href: '/MeAppreciationsSent',
    as: '/me/appreciations/sent',
    regexp: /^\/me\/appreciations\/sent\/?$/i,
  },
  {
    key: 'ME_APPRECIATIONS_RECEIVED',
    href: '/MeAppreciationsReceived',
    as: '/me/appreciations/received',
    regexp: /^\/me\/appreciations\/received\/?$/i,
  },
  {
    key: 'ME_NOTIFICATIONS',
    href: '/MeNotifications',
    as: '/me/notifications',
    regexp: /^\/me\/notifications\/?$/i,
  },

  // Settings
  {
    key: 'ME_SETTINGS',
    href: '/MeSettings',
    as: '/me/settings',
    regexp: /^\/me\/settings\/?$/i,
  },
  {
    key: 'ME_SETTINGS_CHANGE_USERNAME',
    href: '/MeSettingsChangeUserName',
    as: '/me/settings/change-username',
    regexp: /^\/me\/settings\/change-username\/?$/i,
  },
  {
    key: 'ME_SETTINGS_CHANGE_EMAIL',
    href: '/MeSettingsChangeEmail',
    as: '/me/settings/change-email',
    regexp: /^\/me\/settings\/change-email\/?$/i,
  },
  {
    key: 'ME_SETTINGS_CHANGE_PASSWORD',
    href: '/MeSettingsChangePassword',
    as: '/me/settings/change-password',
    regexp: /^\/me\/settings\/change-password\/?$/i,
  },
  {
    key: 'ME_SETTINGS_NOTIFICATION',
    href: '/MeSettingsNotification',
    as: '/me/settings/notification',
    regexp: /^\/me\/settings\/account\/?$/i,
  },
  {
    key: 'ME_SETTINGS_BLOCKED',
    href: '/MeSettingsBlocked',
    as: '/me/settings/blocked',
    regexp: /^\/me\/settings\/blocked\/?$/i,
  },

  // Draft
  {
    key: 'ME_DRAFT_DETAIL',
    href: '/MeDraftDetail',
    as: '/me/drafts/*-:id',
    regexp: /^\/me\/drafts\/(.*)-(?:([^\/]+?))\/?$/i,
  },

  // Auth
  {
    key: 'AUTH_LOGIN',
    href: '/AuthLogin',
    as: '/login',
    regexp: /^\/login\/?$/i,
  },
  {
    key: 'AUTH_SIGNUP',
    href: '/AuthSignUp',
    as: '/signup',
    regexp: /^\/signup\/?$/i,
  },
  {
    key: 'AUTH_FORGET',
    href: '/AuthForget',
    as: '/forget',
    regexp: /^\/forget\/?$/i,
  },

  // OAuth
  {
    key: 'OAUTH_AUTHORIZE',
    href: '/OAuthAuthorize',
    as: '/oauth/authorize',
    regexp: /^\/oauth\/authorize\/?$/i,
  },
  {
    key: 'OAUTH_CALLBACK_SUCCESS',
    href: '/OAuthCallbackSuccess',
    as: '/oauth/:provider/success',
    regexp: /^\/oauth\/(?:([^\/]+?))\/success\/?$/i,
  },
  {
    key: 'OAUTH_CALLBACK_FAILURE',
    href: '/OAuthCallbackFailure',
    as: '/oauth/:provider/failure',
    regexp: /^\/oauth\/(?:([^\/]+?))\/failure\/?$/i,
  },

  // Misc
  {
    key: 'HELP',
    href: '/Help',
    as: '/help',
    regexp: /^\/help\/?$/i,
  },
  {
    key: 'MIGRATION',
    href: '/Migration',
    as: '/migration',
    regexp: /^\/migration\/?$/i,
  },
  {
    key: 'ABOUT',
    href: '/About',
    as: '/about',
    regexp: /^\/about\/?$/i,
  },
  {
    key: 'GUIDE',
    href: '/Guide',
    as: '/guide',
    regexp: /^\/guide\/?$/i,
  },
  {
    key: 'COMMUNITY',
    href: '/Community',
    as: '/community',
    regexp: /^\/community\/?$/i,
  },
  {
    key: 'TOS',
    href: '/ToS',
    as: '/tos',
    regexp: /^\/tos\/?$/i,
  },
]

export const UrlFragments = {
  COMMENTS: 'comments',
}

export const PATHS = {} as { [key in ROUTE_KEY]: { href: string; as: string } }
ROUTES.forEach(({ key, as, href }) => {
  PATHS[key] = { href, as }
})
