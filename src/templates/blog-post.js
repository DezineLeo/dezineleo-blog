import React from 'react'
import { Link, graphql } from 'gatsby'
import get from 'lodash/get'

import '../fonts/fonts-post.css'
import Bio from '../components/Bio'
import Layout from '../components/Layout'
import SEO from '../components/SEO'
// import Signup from '../components/Signup'
import Panel from '../components/Panel'
import { formatPostDate, formatReadingTime } from '../utils/helpers'
import { rhythm, scale } from '../utils/typography'
import {
  codeToLanguage,
  createLanguageLink,
  loadFontsForCode,
} from '../utils/i18n'

// const GITHUB_USERNAME = 'dezineleo'
// const GITHUB_REPO_NAME = 'dezineleo-blog'
const systemFont = `robotoregular, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans",
    "Droid Sans", "Helvetica Neue", sans-serif`

class Translations extends React.Component {
  render() {
    let { translations, lang, languageLink } = this.props

    let readerTranslations = translations.filter(lang => lang !== 'ru')
    let hasRussianTranslation = translations.indexOf('ru') !== -1

    return (
      <div className="translations">
        <Panel style={{ fontFamily: systemFont }}>
          {translations.length > 0 && (
            <span>
              {hasRussianTranslation && (
                <span>
                  Originally written in:{' '}
                  {'en' === lang ? (
                    <b>{codeToLanguage('en')}</b>
                  ) : (
                    <Link to={languageLink('en')}>English</Link>
                  )}
                  {' • '}
                  {'ru' === lang ? (
                    <b>Русский (авторский перевод)</b>
                  ) : (
                    <Link to={languageLink('ru')}>
                      Русский (авторский перевод)
                    </Link>
                  )}
                  <br />
                  <br />
                </span>
              )}
              <span>Translation: </span>
              {readerTranslations.map((l, i) => (
                <React.Fragment key={l}>
                  {l === lang ? (
                    <b>{codeToLanguage(l)}</b>
                  ) : (
                    <Link to={languageLink(l)}>{codeToLanguage(l)}</Link>
                  )}
                  {i === readerTranslations.length - 1 ? '' : ' • '}
                </React.Fragment>
              ))}
            </span>
          )}
          {lang !== 'en' && lang !== 'ru' && (
            <>
              <br />
              <br />
              <Link to={languageLink('en')}>Read the original</Link>
              {' • '}
              <Link to={`/${lang}`}>View all translated posts</Link>{' '}
            </>
          )}
        </Panel>
      </div>
    )
  }
}

class BlogPostTemplate extends React.Component {
  render() {
    const post = this.props.data.markdownRemark
    const siteTitle = get(this.props, 'data.site.siteMetadata.title')
    let {
      previous,
      next,
      slug,
      translations,
      translatedLinks,
    } = this.props.pageContext
    const lang = post.fields.langKey

    // Replace original links with translated when available.
    let html = post.html
    translatedLinks.forEach(link => {
      // jeez
      function escapeRegExp(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      }
      let translatedLink = '/' + lang + link
      html = html.replace(
        new RegExp('"' + escapeRegExp(link) + '"', 'g'),
        '"' + translatedLink + '"'
      )
    })

    translations = translations.slice()
    translations.sort((a, b) => {
      return codeToLanguage(a) < codeToLanguage(b) ? -1 : 1
    })

    loadFontsForCode(lang)
    const languageLink = createLanguageLink(slug, lang)

    return (
      <Layout location={this.props.location} title={siteTitle}>
        <SEO
          lang={lang}
          title={post.frontmatter.title}
          description={post.frontmatter.spoiler}
          slug={post.fields.slug}
        />
        <main>
          <article>
            <header>
              <h1 style={{ color: 'var(--textTitle)' }}>
                {post.frontmatter.title}
              </h1>
              <p
                style={{
                  ...scale(-1 / 5),
                  display: 'block',
                  marginBottom: rhythm(1),
                  marginTop: rhythm(-4 / 5),
                  fontFamily: `ubuntu_lightregular, ${systemFont}`,
                }}
              >
                {formatPostDate(post.frontmatter.date, lang)}
                {` • ${formatReadingTime(post.timeToRead)}`}
              </p>
              {translations.length > 0 && (
                <Translations
                  translations={translations}
                  // editUrl={editUrl}
                  languageLink={languageLink}
                  lang={lang}
                />
              )}
            </header>
            <div dangerouslySetInnerHTML={{ __html: html }} />
          </article>
        </main>
        <aside>
          <Bio />
          <nav>
            <ul
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                listStyle: 'none',
                padding: 0,
              }}
            >
              <li>
                {previous && (
                  <Link to={previous.fields.slug} rel="prev">
                    ← {previous.frontmatter.title}
                  </Link>
                )}
              </li>
              <li>
                {next && (
                  <Link to={next.fields.slug} rel="next">
                    {next.frontmatter.title} →
                  </Link>
                )}
              </li>
            </ul>
          </nav>
        </aside>
      </Layout>
    )
  }
}

export default BlogPostTemplate

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    site {
      siteMetadata {
        title
        author
      }
    }
    markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      html
      timeToRead
      frontmatter {
        title
        date(formatString: "MMMM DD, YYYY")
        spoiler
      }
      fields {
        slug
        langKey
      }
    }
  }
`