/**
* This file was @generated using pocketbase-typegen
*/

export enum Collections {
	Feedback = "feedback",
}

// Alias types for improved usability
export type IsoDateString = string
export type RecordIdString = string
export type HTMLString = string

// System fields
export type BaseSystemFields<T = never> = {
	id: RecordIdString
	created: IsoDateString
	updated: IsoDateString
	collectionId: string
	collectionName: Collections
	expand?: T
}

export type AuthSystemFields<T = never> = {
	email: string
	emailVisibility: boolean
	username: string
	verified: boolean
} & BaseSystemFields<T>

// Record types for each collection

export type FeedbackRecord = {
	feedback: string
	inputText?: string
	route: string
}

// Response types include system fields and match responses from the PocketBase API
export type FeedbackResponse<Texpand = unknown> = Required<FeedbackRecord> & BaseSystemFields<Texpand>

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	feedback: FeedbackRecord
}

export type CollectionResponses = {
	feedback: FeedbackResponse
}