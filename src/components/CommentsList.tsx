import Comment from "./Comment";
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

export default CommentsList;
