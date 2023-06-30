import { Authenticator } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import { sessionStorage } from "./session.server";


export interface User {
    id: string
    email: string
    // TODO add bartender token generated for this user
}

// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session
export let authenticator = new Authenticator<User>(sessionStorage, {
    throwOnError: true,
});

async function login(email: string, password: string) {
    // TODO check password
    // TODO get id
    return { id: email, email }
}


// Tell the Authenticator to use the form strategy
authenticator.use(
  new FormStrategy(async ({ form }) => {
    let email = form.get("email");
    let password = form.get("password");
    console.log({email, password})
    if (email === null || password == null || typeof email !== "string" || typeof password !== 'string') {
        // TODO use zod for validation
        throw new Error('Email and password must be filled.')
    }
    let user = await login(email, password);
    console.log(user)
    // the type of this user must match the type you pass to the Authenticator
    // the strategy will automatically inherit the type if you instantiate
    // directly inside the `use` method
    return user;
  }),
  // each strategy has a name and can be changed to use another one
  // same strategy multiple times, especially useful for the OAuth2 strategy.
  "user-pass"
);