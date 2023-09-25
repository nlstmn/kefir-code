import getAuthorsRequest from "src/api/authors/getAuthorsRequest";
import getCommentsRequest from "src/api/comments/getCommentsRequest";
import * as Types from "../interfaces/IComments";

function calculateTotals(data: Types.CommentOne[]) {
    const initialValue = {
        totalComments: 0,
        totalLikes: 0,
    };

    const totals = data.reduce((accumulator: Types.CommentTotals, comment: Types.CommentOne) => {
        accumulator.totalComments += 1;
        accumulator.totalLikes += comment?.likes;
        return accumulator;
    }, initialValue);

    return totals;
}

export async function getData(pageNo: number, setFetching: any, setErrorState: any, setComments: any, setPagination: any, setInfoState: any) {
    setFetching(true);

    let commentsData: Types.CommentsData = {
        pagination: {
            total_pages: 0
        },
        data: null
    }
    let authors: Types.AuthorsTotals[] = [];

    try {
        commentsData = await getCommentsRequest(pageNo);
        authors = await getAuthorsRequest();
        // Clear errors
        setErrorState({
            error: false,
            msg: "",
        });
        setPagination((prev: Types.PaginationInfo) => ({
            ...prev,
            page: pageNo + 1,
            totalPages: commentsData?.pagination?.total_pages || 0,
        }));
    } catch (error) {
        return setErrorState({
            error: true,
            msg: "Something went wrong, please try again!",
        });
    } finally {
        setFetching(false);
    }

    let commentsWithAuthors = commentsData.data.map((c: Types.CommentSingle) => {
        let commentAuthor = authors.find((a: Types.Author) => a.id === c.author);
        return { ...c, replies: [], ...commentAuthor, id: c.id };
    });

    let parentLevelComments: any[] = [];
    parentLevelComments = commentsWithAuthors
        .filter((c: Types.CommentOne) => c.parent == null)
        .map((comment: any) => {
            comment.replies = buildRepliesList(comment);
            return comment;
        });
    function buildRepliesList(comment: Types.CommentOne) {
        return commentsWithAuthors
            .filter((c: Types.CommentOne) => comment.id === c.parent)
            .map((c: any) => {
                c.replies = buildRepliesList(c);
                return c;
            });
    }
    setInfoState((prev: any) => {
        let currentTotals = calculateTotals(commentsData.data);

        if (pageNo === 1) return currentTotals;
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