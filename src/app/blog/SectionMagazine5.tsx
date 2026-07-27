import React, { FC } from "react";
import Card12 from "./Card12";
import Card13 from "./Card13";
import type { BlogPost } from "@/types/blog-post";

export interface SectionMagazine5Props {
  posts?: BlogPost[];
}

const SectionMagazine5: FC<SectionMagazine5Props> = ({ posts }) => {
  const hasRealPosts = Boolean(posts && posts.length);
  const featuredPost = hasRealPosts ? posts![0] : undefined;
  const secondaryPosts = hasRealPosts ? posts!.slice(1, 4) : [1, 1, 1];

  return (
    <div className="nc-SectionMagazine5">
      <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
        <Card12 post={featuredPost} />
        <div className="grid gap-6 md:gap-8">
          {hasRealPosts
            ? (secondaryPosts as BlogPost[]).map((post) => <Card13 key={post.id} post={post} />)
            : (secondaryPosts as number[]).map((item, index) => <Card13 key={index} />)}
        </div>
      </div>
    </div>
  );
};

export default SectionMagazine5;
