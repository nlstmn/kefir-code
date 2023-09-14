import React, { useEffect, useState } from "react";

import "./App.css";
import getAuthorsRequest from "./api/authors/getAuthorsRequest";
import getCommentsRequest from "./api/comments/getCommentsRequest";

function App() {
    const [comments, setComments] = useState<any[]>([]);
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
        getData(pagination.page);

        return () => { };
    }, []);

    function calculateTotals(data: any) {
        const initialValue = {
            totalComments: 0,
            totalLikes: 0,
        };

        const totals = data.reduce((accumulator: any, comment: any) => {
            accumulator.totalComments += 1;
            accumulator.totalLikes += comment.likes;
            return accumulator;
        }, initialValue);

        return totals;
    }
    async function getData(pageNo: number) {
        setFetching(true);

        let commentsData: any = [],
            authors: any = [];
        try {
            commentsData = await getCommentsRequest(pageNo);
            authors = await getAuthorsRequest();
            // clear any errors
            setErrorState({
                error: false,
                msg: "",
            });
            setPagination((prev) => ({
                ...prev,
                page: pageNo + 1,
                totalPages: commentsData.pagination.total_pages,
            }));
        } catch (error) {
            return setErrorState({
                error: true,
                msg: "Something went wrong, please try again!",
            });
        } finally {
            setFetching(false);
        }

        let commentsWithAuthors = commentsData.data.map((c: any) => {
            let commentAuthor = authors.find((a: any) => a.id === c.author);

            return { ...c, replies: [], ...commentAuthor, id: c.id };
        });
        let parentLevelComments: any[] = [];
        parentLevelComments = commentsWithAuthors
            .filter((c: any) => c.parent == null)
            .map((comment: any) => {
                comment.replies = buildRepliesList(comment);
                return comment;
            });
        function buildRepliesList(comment: any) {
            return commentsWithAuthors
                .filter((c: any) => comment.id === c.parent)
                .map((c: any) => {
                    c.replies = buildRepliesList(c);
                    return c;
                });
        }
        setInfoState((prev: any) => {
            let currentTotals = calculateTotals(commentsData.data);
            if (!prev.totalLikes || !prev.totalComments) return currentTotals;
            return {
                totalComments: prev.totalComments + currentTotals.totalComments,
                totalLikes: prev.totalLikes + currentTotals.totalLikes,
            };
        });

        if (pageNo === 1) {
            return setComments([...parentLevelComments]);
        }

        setComments((prev: any): any => [...prev, ...parentLevelComments]);
    }
    const onLikeToggle = (commentId: any, shouldLike = false) => {
        setComments((prev: any[]) => {
            mutateComment({ comments: prev, id: commentId, shouldLike });
            console.log(prev);
            return [...prev];
        });

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
        id: any;
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

    return (
        <div className="md:w-[50%] w-full md:max-w-[60%]  mx-auto sm:p-0 text-slate-300 my-6 ">
            <div className="flex justify-between items-center border-b border-b-slate-300 pb-4 mb-12">
                <span className="font-bold">
                    {infoState.totalComments}
                    {` comments`}
                </span>{" "}
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
                        <div className="pl-16">
                            {" "}
                            <CommentsList
                                onLikeToggle={onLikeToggle}
                                comments={comment.replies}
                            />
                        </div>
                    </div>
                );
            })}
            <div className="flex flex-col  items-center justify-center my-4">
                {" "}
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
                                    getData(pagination.page);
                                }
                                : () => { }
                        }
                        disabled={fetching}
                        className="px-4 py-1 mt-12 bg-slate-500 rounded text-slate-50  w-[30%] "
                    >
                        {fetching ? "Loading..." : "Upload more"}{" "}
                    </button>
                ) : null}
            </div>
        </div>
    );
}

const CommentsList = ({ comments = [], onLikeToggle = (id: any) => { } }) => {
    return (
        <>
            {comments.map((comment: any) => {
                return (
                    <div key={comment.id} className="">
                        <Comment {...comment} onLikeToggle={onLikeToggle} />
                        {comment?.replies?.length ? (
                            <CommentsList
                                comments={comment.replies}
                                onLikeToggle={onLikeToggle}
                            />
                        ) : null}
                    </div>
                );
            })}
        </>
    );
};

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
            <div className="basis-[10%] self-start mt-2">
                <img
                    src={avatar}
                    className="rounded-full sm:w-14 sm:h-14 mx-auto w-10 h-10"
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

function RelativeTime({ datetime }: { datetime: string }) {
    const [relativeTime, setRelativeTime] = useState("");

    useEffect(() => {
        // Convert the input datetime string to a Date object
        const date = new Date(datetime);
        const dateTime = new Date(datetime).getTime();
        // Get the current date and time
        const now = new Date().getTime();

        // Calculate the time difference in milliseconds
        const timeDifference = now - dateTime;

        // Convert milliseconds to seconds
        const secondsDifference = Math.floor(timeDifference / 1000);

        // Calculate the relative time
        let formattedTime = "";
        if (secondsDifference < 60) {
            formattedTime = `${secondsDifference} seconds ago`;
        } else if (secondsDifference < 3600) {
            const minutes = Math.floor(secondsDifference / 60);
            formattedTime = `${minutes} ${minutes === 1 ? "minute" : "minutes"
                } ago`;
        } else if (secondsDifference < 86400) {
            const hours = Math.floor(secondsDifference / 3600);
            formattedTime = `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
        } else {
            const day = date.getDate().toString().padStart(2, "0");
            const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Months are zero-based
            const year = date.getFullYear();
            const hours = date.getHours().toString().padStart(2, "0");
            const minutes = date.getMinutes().toString().padStart(2, "0");
            const seconds = date.getSeconds().toString().padStart(2, "0");

            formattedTime = `${day}.${month}.${year}, ${hours}:${minutes}:${seconds}`;
        }

        // Set the relative time in the state
        setRelativeTime(formattedTime);
    }, [datetime]);

    return <span>{relativeTime}</span>;
}

export default App;
