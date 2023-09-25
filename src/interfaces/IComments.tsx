export interface CommentsData {
    pagination?: {
        total_pages?: number;
        // Other pagination properties
    };
    data?: any;
}

export interface AuthorsTotals {
    avatar?: string;
    id?: number;
    name?: string;
}

export interface CommentSingle {
    data?: any;
    author?: number;
    created?: string;
    id?: number;
    likes?: number;
    parent?: any;
    text?: string;
}

export interface CommentOne {
    author?: number;
    created?: string;
    id?: number;
    likes: number;
    parent?: any;
    text?: string;
}

export interface CommentTotals {
    totalComments: number;
    totalLikes: number;
}

export interface PaginationInfo {
    page?: number;
    totalPages?: number;
}

export interface Author {
    id?: number;
}