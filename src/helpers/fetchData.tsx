import getAuthorsRequest from "src/api/authors/getAuthorsRequest";
import getCommentsRequest from "src/api/comments/getCommentsRequest";
import * as Types from "../interfaces/IComments";

// Function to calculate totals
function calculateTotals(data: Types.CommentOne[]) {
    return data.reduce(
        (accumulator: Types.CommentTotals, comment: Types.CommentOne) => {
            accumulator.totalComments += 1;
            accumulator.totalLikes += comment?.likes || 0;
            return accumulator;
        },
        { totalComments: 0, totalLikes: 0 }
    );
}

// Function to fetch comments and authors data: just API calls
async function fetchData(pageNo: number) {
    try {
        const commentsData: Types.CommentsData = await getCommentsRequest(pageNo);
        const authors: Types.AuthorsTotals[] = await getAuthorsRequest();
        return { commentsData, authors };
    } catch (error) {
        throw new Error("Something went wrong, please try again!");
    }
}

// Function to combine comments with authors and build the comment tree
function combineCommentsWithAuthors(commentsData: Types.CommentsData, authors: Types.AuthorsTotals[]) {
    return commentsData.data.map((c: Types.CommentSingle) => {
        const commentAuthor = authors.find((a: Types.Author) => a.id === c.author);
        return { ...c, replies: [], ...commentAuthor, id: c.id };
    });
}

// Function to build the comment tree
function buildCommentTree(commentsWithAuthors: Types.CommentSingle[]) {
    function buildRepliesList(comment: Types.CommentOne) {
        return commentsWithAuthors
            .filter((c: any) => comment.id === c.parent)
            .map((c: any) => {
                c.replies = buildRepliesList(c);
                return c;
            });
    }

    const parentLevelComments = commentsWithAuthors
        .filter((c: any) => c.parent == null)
        .map((comment: any) => {
            comment.replies = buildRepliesList(comment);
            return comment;
        });

    return parentLevelComments;
}

// Function to update the component state
function getData(
    pageNo: number,
    setFetching: any,
    setErrorState: any,
    setComments: any,
    setPagination: any,
    setInfoState: any
) {
    setFetching(true);

    fetchData(pageNo)
        .then(({ commentsData, authors }) => {
            // Clear errors
            setErrorState({ error: false, msg: "" });

            // Update pagination
            setPagination((prev: Types.PaginationInfo) => ({
                ...prev,
                page: pageNo + 1,
                totalPages: commentsData?.pagination?.total_pages || 0,
            }));

            // Combine comments with authors and build the comment tree
            const commentsWithAuthors = combineCommentsWithAuthors(commentsData, authors);

            // Build the comment tree
            const parentLevelComments = buildCommentTree(commentsWithAuthors);

            // Calculate and update totals
            setInfoState((prev: any) => {
                const currentTotals = calculateTotals(commentsData.data);

                if (pageNo === 1) return currentTotals;
                return {
                    totalComments: prev.totalComments + currentTotals.totalComments,
                    totalLikes: prev.totalLikes + currentTotals.totalLikes,
                };
            });

            // Update comments state
            if (pageNo === 1) {
                setComments([...parentLevelComments]);
            } else {
                setComments((prev: any): any => [...prev, ...parentLevelComments]);
            }
        })
        .catch((error) => {
            // Handle errors here
            setErrorState({ error: true, msg: error.message });
        })
        .finally(() => {
            setFetching(false);
        });
}

export { getData };
