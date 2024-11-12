import { NextAuthOptions } from "next-auth";
import { UpstashRedisAdapter } from "@next-auth/upstash-redis-adapter";
import { db } from "./db";
import GoogleProvider from "next-auth/providers/google";
import { fetchRedis } from "@/helpers/redis";

function getGoogleCredentials() {
    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET

    if(!clientId || clientId.length === 0) {
        throw new Error('Missing GOOGLE_CLIENT_ID');
    }     
    if(!clientSecret || clientSecret.length === 0) {
        throw new Error('Missing GOOGLE_CLIENT_SECRET');
    } 
    return {clientId, clientSecret};
}

export const authOptions: NextAuthOptions = {
    adapter: UpstashRedisAdapter(db),
    session: {
        strategy: 'jwt'
    },
    pages: {
        signIn: '/login'
    },
    providers: [
        GoogleProvider({
            clientId: getGoogleCredentials().clientId,
            clientSecret: getGoogleCredentials().clientSecret,
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            // Attempt to retrieve the user from the database by token id or sub
            const dbUserResult = await fetchRedis("get", `user:${token.id || token.sub}`) as string | null;
    
            // If no database user is found, initialize the token with user.id if available
            if (!dbUserResult) {
                if (user && user.id) {
                    token.id = user.id;
                }
                return token;
            }

            const dbUser = JSON.parse(dbUserResult) as User;
    
            // Return the database user's properties for the session token
            return {
                id: dbUser.id,
                name: dbUser.name,
                email: dbUser.email,
                picture: dbUser.image,
                groups: dbUser.groups
            };
        },
    
        async session({ session, token }) {
            // Safely set session properties based on the token
            if (token) {
                session.user.id = token.id;
                session.user.name = token.name;
                session.user.email = token.email;
                session.user.image = token.picture;
            }
            return session;
        },
    
        redirect() {
            return '/dashboard';
        },
    }
    
}