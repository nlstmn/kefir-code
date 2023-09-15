import React from "react";
import RelativeTime from "./RelativeTime";

const Comment = ({
    name: authorName,
    avatar,
    created,
    id,
    likes,
    text,
    liked = false,
    onLikeToggle = () => { },
}: any) => {
    return (
        <article
            key={id}
            className="flex items-center p-4 gap-4 text-left my-4"
        >
            <div className="self-start mt-2">
                <img
                    src={avatar}
                    className="rounded-full sm:w-14 sm:h-14 w-10 h-10"
                ></img>
            </div>

            <div className="flex flex-col gap-2 flex-grow basis-[90%]">
                <div className="flex items-center justify-between flex-grow self-start w-full">
                    <div className="flex flex-col ">
                        <span className="text-lg font-bold block">
                            {authorName}
                        </span>
                        <span className="text-sm text-slate-400 block text-left">
                            {<RelativeTime datetime={created} />}
                        </span>
                    </div>
                    <span className="flex items-center gap-2 hover:text-red-500 hover:fill-red-500">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={`lucide lucide-heart w-4 h-4 hover:fill-red-500 cursor-pointer ${liked ? "fill-red-600" : ""
                                }`}
                            onClick={() => {
                                console.log("here");
                                onLikeToggle(id, !liked);
                            }}
                        >
                            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                        </svg>
                        <span className=" w-4 text-right font-bold  ">
                            {likes}
                        </span>
                    </span>
                </div>
                <p className="my-2 text-left">{text}</p>
            </div>
        </article>
    );
};

export default Comment;
