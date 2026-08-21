import React, { FC } from "react";
import Card12 from "./Card12";
import Card13 from "./Card13";
import type { BlogPost } from "@/types/blog-post";

export interface SectionMagazine5Props {
  posts?: BlogPost[];
  showDate?: boolean;
  showReadMore?: boolean;
  readMoreText?: string;
}

const SectionMagazine5: FC<SectionMagazine5Props> = ({
  posts,
  showDate = true,
  showReadMore = true,
  readMoreText = "Read Article",
}) => {
  const hasRealPosts = Boolean(posts && posts.length);
  const postList = hasRealPosts ? posts! : [];

  if (!hasRealPosts || postList.length === 0) {
    return (
      <div className="nc-SectionMagazine5">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          <div className="lg:col-span-7 flex flex-col h-full">
            <Card12 showDate={showDate} showReadMore={showReadMore} readMoreText={readMoreText} />
          </div>
          <div className="lg:col-span-5 flex flex-col justify-between h-full">
            <Card13 showDate={showDate} />
            <Card13 showDate={showDate} />
            <Card13 showDate={showDate} />
          </div>
        </div>
      </div>
    );
  }

  // 1 Post Layout
  if (postList.length === 1) {
    return (
      <div className="nc-SectionMagazine5 max-w-3xl mx-auto">
        <Card12
          post={postList[0]}
          showDate={showDate}
          showReadMore={showReadMore}
          readMoreText={readMoreText}
        />
      </div>
    );
  }

  // 2 Posts Layout
  if (postList.length === 2) {
    return (
      <div className="nc-SectionMagazine5">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-stretch">
          <Card12 post={postList[0]} showDate={showDate} showReadMore={showReadMore} readMoreText={readMoreText} />
          <Card12 post={postList[1]} showDate={showDate} showReadMore={showReadMore} readMoreText={readMoreText} />
        </div>
      </div>
    );
  }

  // 3+ Posts Layout (Magazine 5)
  const featuredPost = postList[0];
  const secondaryPosts = postList.slice(1, 4);

  return (
    <div className="nc-SectionMagazine5">
      <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
        {/* Left Featured Editorial Article */}
        <div className="lg:col-span-7 flex flex-col h-full">
          <Card12
            post={featuredPost}
            showDate={showDate}
            showReadMore={showReadMore}
            readMoreText={readMoreText}
          />
        </div>

        {/* Right Side Editorial List Stack (Equal height & distributed alignment) */}
        <div className="lg:col-span-5 flex flex-col justify-between h-full space-y-3 lg:space-y-0">
          {secondaryPosts.map((post) => (
            <Card13 key={post.id} post={post} showDate={showDate} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SectionMagazine5;
