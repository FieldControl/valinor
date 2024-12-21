export declare class Users {
    id?: string;
    name?: string;
    email?: string;
    password?: string;
    constructor(id?: string, name?: string, email?: string, password?: string);
    postUser(user: Users): Promise<{
        newUser: {
            id: string;
            name: string;
            email: string;
            password: string;
        };
    }>;
    putUser(user: Users): Promise<{
        updateUser: {
            id: string;
            name: string;
            email: string;
            password: string;
        };
    }>;
    deleteUser(id: string): Promise<{
        deleteUser: {
            id: string;
            name: string;
            email: string;
            password: string;
        };
        error?: undefined;
    } | {
        error: any;
        deleteUser?: undefined;
    }>;
    login(email: string, password: string): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
            password: string;
        };
    }>;
}
