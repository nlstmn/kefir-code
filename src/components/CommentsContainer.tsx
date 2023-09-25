import { useEffect, useState } from "react";
import CommentsList from "./CommentsList";
import Spinner from "./Spinner";
import Comment from "./Comment";
import { getData } from "../helpers/fetchData"

function CommentsContainer() {
    const [comments, setComments] = useState<string[]>([]);
    const [pagination, setPagination] = useState({
        page: 1,
        totalPages: Math.max(),
    });
    const [errorState, setErrorState] = useState({ error: false, msg: "" });
    const [fetching, setFetching] = useState(false);
    const [infoState, setInfoState] = useState({
        totalLikes: 0,
        totalComments: 0,
    });

    useEffect(() => {
        let ignore = false;
        if (!ignore) getData(pagination.page, setFetching, setErrorState, setComments, setPagination, setInfoState);

        return () => {
            ignore = true;
        };
    }, []);

    const onLikeToggle = (commentId: number, shouldLike = false) => {
        let commentsCopy = [...comments];
        mutateComment({ comments: commentsCopy, id: commentId, shouldLike });

        setComments([...commentsCopy]);

        shouldLike
            ? setInfoState((p: any) => ({ ...p, totalLikes: p.totalLikes + 1 }))
            : setInfoState((p: any) => ({ ...p, totalLikes: p.totalLikes - 1 }));
    };

    function mutateComment({
        comments = [],
        id = 0,
        shouldLike = false,
    }: {
        comments: any[];
        id: number;
        shouldLike: Boolean;
    }): any {
        for (const comment of comments) {
            if (comment.id === id) {
                comment.likes = shouldLike
                    ? comment.likes + 1
                    : comment.likes - 1;
                comment.liked = shouldLike ? true : false;
            }

            let likedComment = mutateComment({
                comments: comment.replies,
                id,
                shouldLike,
            });

            if (!likedComment) {
                continue;
            }
        }
    }

    if (!comments.length) return <Spinner />;

    return (
        <div className="md:w-[50%] w-full md:max-w-[60%]  mx-auto sm:p-0 text-slate-300 m-6 p-4 h-full ">
            <div className="flex justify-between items-center border-b border-b-slate-300 pb-4 mb-12">
                <span className="font-bold">
                    {infoState.totalComments}
                    {` comments`}
                </span>
                <span className="flex gap-2 items-center font-bold">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-heart w-4 h-4 fill-red-500"
                    >
                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                    </svg>
                    {infoState.totalLikes}
                </span>
            </div>
            {comments.map((comment: any) => {
                return (
                    <div key={comment.id} className="">
                        <Comment {...comment} onLikeToggle={onLikeToggle} />
                        <div className="sm:pl-16 pl-10">
                            <CommentsList
                                onLikeToggle={onLikeToggle}
                                comments={comment.replies}
                            />
                        </div>
                    </div>
                );
            })}
            <div className="flex flex-col  items-center justify-center my-4">
                {errorState.error ? (
                    <span className="text-red-600 block m-4 ">
                        {errorState.msg}
                    </span>
                ) : null}
                {!(pagination.page > pagination.totalPages) ? (
                    <button
                        onClick={
                            !fetching
                                ? () => {
                                    getData(pagination.page, setFetching, setErrorState, setComments, setPagination, setInfoState);
                                }
                                : () => { }
                        }
                        disabled={fetching}
                        className="px-4 py-1 mt-1 mb-20 bg-slate-500 rounded text-slate-50  w-[30%] "
                    >
                        {fetching ? "Loading..." : "Upload more"}
                    </button>
                ) : null}
            </div>
        </div>
    );
}

export default CommentsContainer;
