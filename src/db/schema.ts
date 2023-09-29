import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
 
export const users = pgTable('user', {
  	id: serial('id').primaryKey(),
	email: text('email').unique().notNull(),
	username: text('username').unique().notNull(),
	name: text('name').notNull(),
	password: text('password').notNull(),
	profilePicUri: text('profile_pic_uri').notNull(),
	lastActiveAt: timestamp('last_active').notNull(),
	status: text('status').notNull()
});