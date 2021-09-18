import Prismic from '@prismicio/client';
import { GetStaticPaths, GetStaticProps, GetStaticPropsContext } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';
import { useEffect, useState } from 'react';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import Header from '../../components/Header';
import { getPrismicClient } from "../../services/prismic";
import { formatDate } from '../../utils/date-format';
import classes from './post.module.scss';

interface IPost {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: IPost;
}

export default function Post({ post }: PostProps) {
  const [readTime, setReadTime] = useState(0)
  const router = useRouter()
  if (router.isFallback) {
    return <p>Carregando...</p>
  }
  if (router.isFallback) {
    return <p>Carregando...</p>
  }

  useEffect(() => {
    const time = post.data.content.reduce((acc, content) => {
      const textBody = RichText.asText(content.body);
      const split = textBody.split(' ');
      const number_words = split.length;

      const result = Math.ceil(number_words / 200);
      return acc + result;
    }, 0);

    setReadTime(time);
  }, [post])

  function createMarkup(content: any) {
    return { __html: content };
  }

  return (
    <>
      <Head>
        <title>{post.data.title} | SpaceTraveling</title>
      </Head>

      <Header />

      <article className={classes.wrapper}>
        <section className={classes.imageBox}>
          <Image
            src={post.data.banner.url}
            alt={post.data.title}
            layout="fill"
            objectFit="cover"
          />
        </section>
        <section className={classes.content}>
          <h1 className={classes.title}>{post.data.title}</h1>
          <div className={classes.info}>
            <div className={classes.date}>
              <FiCalendar />
              <time>{formatDate(new Date(post.first_publication_date))}</time>
            </div>
            <div className={classes.author}>
              <FiUser />
              <p>{post.data.author}</p>
            </div>
            <div className={classes.time}>
              <FiClock />
              <time>{readTime} min</time>
            </div>
          </div>
          {post.data.content.map(section => (
            <section key={section.heading} className={classes.post}>
              <h2>{section.heading}</h2>
              <div
                dangerouslySetInnerHTML={createMarkup(RichText.asHtml(section.body))}
              />
            </section>
          ))}
        </section>
      </article>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([
    Prismic.Predicates.at('document.type', 'posts')
  ], {
    fetch: ['posts.uid']
  }
  );

  const paths = postsResponse.results?.map((post) => ({
    params: { slug: post.uid },
  }))

  return { paths, fallback: true }
};

export const getStaticProps: GetStaticProps = async ({ params }: GetStaticPropsContext) => {
  const prismic = getPrismicClient();

  const postResponse: IPost = await prismic.getByUID('posts', `${params.slug}`, { });



  const post = {
    first_publication_date: postResponse.first_publication_date,
    data: {
      title: postResponse?.data.title,
      banner: {
        url: postResponse?.data.banner.url
      },
      author: postResponse?.data.author,
      content: postResponse?.data.content.map((content: any) => ({
        heading: RichText.asText(content.heading),
        body: content.body
      })),
    }
  };

  console.log(JSON.stringify(post, null, 2))

  return {
    props: {
      post,
    }
  }
}
