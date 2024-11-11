import { StringDecoder } from "string_decoder"

interface IncomingFriendRequest {
    senderId: string
    senderEmail: string | null | undefined
}