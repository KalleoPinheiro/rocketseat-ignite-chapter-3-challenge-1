import Prismic from '@prismicio/client';
import { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { FiCalendar, FiUser } from 'react-icons/fi';
import Header from '../components/Header';
import { getPrismicClient } from '../services/prismic';
import { formatDate } from '../utils/date-format';
import classes from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string | null;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

const postMap = (posts: Post[]): Post[] => {
  return posts?.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });
};

export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPosts] = useState<PostPagination>({ ...postsPagination });

  const handleMorePosts = async (): Promise<void> => {
    if (posts.next_page) {
      const postsResponse = await fetch(posts.next_page)
        .then(res => res.json())
        .catch(err => console.error(err));

      const postsMapped = postMap(postsResponse?.results);

      setPosts({
        next_page: postsResponse?.next_page,
        results: [...posts?.results, ...postsMapped],
      });
    }
  };

  return (
    <>
      <Head>
        <title>Home | SpaceTraveling</title>
      </Head>

      <Header />
      <div className={classes.container}>
        <main className={classes.content}>
          {posts?.results.map(post => (
            <article key={post.uid} className={classes.post}>
              <Link href={`/post/${post.uid}`}>
                <a>{post.data.title}</a>
              </Link>
              <p>{post.data.subtitle}</p>
              <div className={classes.postFooter}>
                <section>
                  <FiCalendar />
                  <time>
                    {formatDate(new Date(post.first_publication_date))}
                  </time>
                </section>
                <section>
                  <FiUser />
                  <p>{post.data.author}</p>
                </section>
              </div>
            </article>
          ))}

          {posts.next_page && (
            <button type="button" onClick={() => handleMorePosts()}>
              Carregar mais posts
            </button>
          )}
        </main>
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.Predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
      pageSize: 1,
      page: 1,
    }
  );

  const posts = postMap(postsResponse?.results);

  return {
    props: {
      postsPagination: {
        next_page: postsResponse?.next_page,
        results: [...posts],
      },
    },
  };
};
