/***
 * Filename: user.interface.ts
 * Author  : Duncan Tilley
 * Class   : User
 * 
 *     The class that represents the user details returned from the API.
 ***/

export interface User {
    UserID: string;
    Email: string;
    Name: string;
    Surname: string;
    Password: string;
}
