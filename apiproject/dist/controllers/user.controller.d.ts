import { Users } from "../models/user.service";
export declare class UserController {
    postUsers(body: Users): Promise<{
        newUser: {
            id: string;
            name: string;
            email: string;
            password: string;
        };
    }>;
    putUser(id: string, body: Users): Promise<{
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
    login(body: Users): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
            password: string;
        };
    }>;
}
